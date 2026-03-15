/**
 * Amber Agent API
 *
 * Endpoints used by the macOS Python agent (apps/agent/).
 * All requests are authenticated via X-Agent-Secret header.
 *
 * Routes:
 *   POST  /agent/task           — queue a new task for the agent
 *   GET   /agent/tasks          — list tasks for a user
 *   PATCH /agent/tasks/:id      — update task status / steps (from agent)
 *   POST  /agent/notify         — send a message to the user (iMessage or web push)
 *   POST  /agent/brief/send     — trigger the morning operator brief
 *   GET   /agent/tasks/:id/approve — approve a pending task via magic link
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../db/client.js';
import { eq, desc, and } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';
import { sendLoopMessage } from './webhooks.js';
import crypto from 'crypto';

const AGENT_SECRET = process.env.AMBER_AGENT_SECRET;
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://amber.health';

// ── Agent secret middleware ──────────────────────────────────────────────────

function authenticateAgent(req: FastifyRequest, reply: FastifyReply, done: () => void) {
  const secret = req.headers['x-agent-secret'];
  if (!AGENT_SECRET || secret !== AGENT_SECRET) {
    reply.code(401).send({ error: 'unauthorized' });
    return;
  }
  done();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getUserPhone(userId: number): Promise<string | null> {
  const [profile] = await db
    .select({ phone: schema.userProfiles.phone })
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId))
    .limit(1);
  return profile?.phone ?? null;
}

async function generateApprovalToken(taskId: number, userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await db.insert(schema.magicLinkTokens).values({
    token,
    userId,
    purpose: 'approve_task',
    metadata: { taskId },
    expiresAt,
  });

  return token;
}

// ── Route registration ───────────────────────────────────────────────────────

export async function registerAgentRoutes(app: FastifyInstance) {
  /**
   * POST /agent/task
   * Queue a new task for the macOS agent.
   * Can be called by the authenticated user (web/iOS) or by the agent itself.
   */
  app.post('/agent/task', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply: FastifyReply) => {
    const { prompt, channel = 'imessage' } = req.body as {
      prompt: string;
      channel?: string;
    };

    if (!prompt?.trim()) return reply.code(400).send({ error: 'prompt is required' });

    const [task] = await db
      .insert(schema.agentTasks)
      .values({
        userId: req.userId!,
        prompt,
        status: 'queued',
        channel,
      })
      .returning();

    reply.code(201);
    return { taskId: task.id, status: task.status };
  });

  /**
   * GET /agent/tasks
   * List recent tasks for the authenticated user.
   */
  app.get('/agent/tasks', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const tasks = await db
      .select()
      .from(schema.agentTasks)
      .where(eq(schema.agentTasks.userId, req.userId!))
      .orderBy(desc(schema.agentTasks.createdAt))
      .limit(50);

    return { tasks };
  });

  /**
   * PATCH /agent/tasks/:id
   * Called by the Python agent to update task status, plan, steps, result.
   * Protected by X-Agent-Secret.
   */
  app.patch<{ Params: { id: string } }>(
    '/agent/tasks/:id',
    { preHandler: authenticateAgent },
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const taskId = parseInt(req.params.id, 10);
      if (isNaN(taskId)) return reply.code(400).send({ error: 'invalid task id' });

      const updates = req.body as Record<string, any>;

      // Whitelist updatable fields
      const allowed = ['status', 'plan', 'steps', 'result', 'errorMessage', 'approvalRequired', 'approvalPrompt', 'approvedAt', 'completedAt'];
      const safeUpdates: Record<string, any> = { updatedAt: new Date() };
      for (const key of allowed) {
        if (key in updates) safeUpdates[key] = updates[key];
      }

      // Auto-set completedAt when status transitions to terminal
      if (updates.status === 'completed' || updates.status === 'failed') {
        safeUpdates.completedAt = new Date();
      }

      const [task] = await db
        .update(schema.agentTasks)
        .set(safeUpdates)
        .where(eq(schema.agentTasks.id, taskId))
        .returning();

      if (!task) return reply.code(404).send({ error: 'task not found' });

      // If agent flagged approval_required, text the user a link
      if (updates.approvalRequired && updates.approvalPrompt) {
        const phone = await getUserPhone(task.userId);
        if (phone) {
          const token = await generateApprovalToken(task.id, task.userId);
          const approveUrl = `${APP_BASE_URL}/approve?token=${token}`;
          const message = `Amber needs your approval:\n\n${updates.approvalPrompt}\n\nApprove: ${approveUrl}`;
          await sendLoopMessage(phone, message).catch(() => {});
        }
      }

      return { ok: true, task };
    }
  );

  /**
   * POST /agent/notify
   * Send a message to a user. Called by the Python agent.
   * Delivers via iMessage if phone is on file, otherwise logs.
   */
  app.post('/agent/notify', { preHandler: authenticateAgent }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { userId, text, channel = 'imessage' } = req.body as {
      userId: number;
      text: string;
      channel?: string;
    };

    if (!userId || !text) return reply.code(400).send({ error: 'userId and text required' });

    if (channel === 'imessage') {
      const phone = await getUserPhone(userId);
      if (phone) {
        await sendLoopMessage(phone, text).catch((err) => {
          app.log.error({ err }, 'Failed to notify via iMessage');
        });
      }
    }

    // Log to DB as an agent memory for context
    await db.insert(schema.memories).values({
      userId,
      source: 'imessage',
      rawContent: `[Amber agent]: ${text}`,
      summary: text,
      isActionable: false,
      confidence: 100,
      privacyTier: 'private',
    });

    return { ok: true };
  });

  /**
   * POST /agent/brief/send
   * Trigger the morning operator brief for a user.
   * The Python scheduler calls this — agent assembles the brief and texts it.
   */
  app.post('/agent/brief/send', { preHandler: authenticateAgent }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { userId, briefText, briefDate } = req.body as {
      userId: number;
      briefText: string;
      briefDate: string; // YYYY-MM-DD
    };

    if (!userId || !briefText) return reply.code(400).send({ error: 'userId and briefText required' });

    // Store brief as an agent task for the record
    const [task] = await db
      .insert(schema.agentTasks)
      .values({
        userId,
        prompt: `Morning brief for ${briefDate}`,
        status: 'completed',
        result: briefText,
        channel: 'imessage',
        briefDate,
        completedAt: new Date(),
      })
      .returning();

    // Send via iMessage
    const phone = await getUserPhone(userId);
    if (phone) {
      await sendLoopMessage(phone, briefText).catch((err) => {
        app.log.error({ err }, 'Failed to send morning brief via iMessage');
      });
    }

    return { ok: true, taskId: task.id };
  });

  /**
   * GET /agent/tasks/:id/approve
   * Magic link endpoint — user clicks from iMessage to approve a pending task.
   * Validates the token, marks the task approved, notifies the agent.
   */
  app.get<{ Params: { id: string }; Querystring: { token: string } }>(
    '/agent/tasks/:id/approve',
    async (req: FastifyRequest<{ Params: { id: string }; Querystring: { token: string } }>, reply: FastifyReply) => {
      const { token } = req.query;
      const taskId = parseInt(req.params.id, 10);

      if (!token) return reply.code(400).send({ error: 'token required' });

      // Validate token
      const [linkToken] = await db
        .select()
        .from(schema.magicLinkTokens)
        .where(
          and(
            eq(schema.magicLinkTokens.token, token),
            eq(schema.magicLinkTokens.purpose, 'approve_task')
          )
        )
        .limit(1);

      if (!linkToken) return reply.code(401).send({ error: 'Invalid or expired token' });
      if (linkToken.usedAt) return reply.redirect(`${APP_BASE_URL}/approved?already=true`);
      if (new Date() > linkToken.expiresAt) return reply.code(401).send({ error: 'Token expired' });

      // Mark token used
      await db
        .update(schema.magicLinkTokens)
        .set({ usedAt: new Date() })
        .where(eq(schema.magicLinkTokens.id, linkToken.id));

      // Approve the task
      await db
        .update(schema.agentTasks)
        .set({ status: 'running', approvedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.agentTasks.id, taskId));

      // Redirect to a confirmation page
      return reply.redirect(`${APP_BASE_URL}/approved?task=${taskId}`);
    }
  );
}

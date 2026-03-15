/**
 * Amber Integrations API
 *
 * Four apps feed into Amber's six health dimensions:
 *   FiduciaryOS  → Financial health (portfolio, tax, wealth)
 *   ClearOut     → Social + Emotional (communication load, relationship patterns)
 *   Marrow       → Social + Professional (org network, recruiting)
 *   Story        → Social + Emotional (circles, prompts, human connection)
 *
 * Each integration can:
 *   1. Connect (OAuth or API key)
 *   2. Push signals (POST /integrations/:source/signal)
 *   3. Update health scores
 *   4. Disconnect
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db, schema } from '../db/client.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Webhook secrets — each integration sets their own
const INTEGRATION_SECRETS: Record<string, string | undefined> = {
  fiduciaryos: process.env.FIDUCIARYOS_WEBHOOK_SECRET,
  clearout: process.env.CLEAROUT_WEBHOOK_SECRET,
  marrow: process.env.MARROW_WEBHOOK_SECRET,
  story: process.env.STORY_WEBHOOK_SECRET,
  dnob: process.env.DNOB_WEBHOOK_SECRET,
};

// Which health dimensions each integration drives
const INTEGRATION_DIMENSIONS: Record<string, string[]> = {
  fiduciaryos: ['financial'],
  clearout:    ['social', 'emotional'],
  marrow:      ['social', 'financial'],
  story:       ['social', 'emotional'],
  dnob:        ['emotional', 'social'],   // peer support → emotional + social belonging
};

// ── Score computation ────────────────────────────────────────────────────────

async function computeHealthScore(
  dimension: string,
  source: string,
  payload: Record<string, any>
): Promise<{ score: number; reasoning: string }> {
  if (!ANTHROPIC_API_KEY) return { score: 50, reasoning: 'AI not configured' };

  const prompts: Record<string, string> = {
    financial: `Analyze this financial health data and score from 0-100. Consider portfolio health, cash flow, debt, tax efficiency, and financial goals. Data: ${JSON.stringify(payload)}. Respond with JSON: {"score": number, "reasoning": "1-2 sentence explanation"}`,
    social: `Analyze this social health data and score from 0-100. Consider connection quality, communication patterns, relationship maintenance, network breadth. Data: ${JSON.stringify(payload)}. Respond with JSON: {"score": number, "reasoning": "1-2 sentence explanation"}`,
    emotional: `Analyze this emotional health data and score from 0-100. Consider stress indicators, communication tone, workload balance, positive interactions. Data: ${JSON.stringify(payload)}. Respond with JSON: {"score": number, "reasoning": "1-2 sentence explanation"}`,
  };

  const prompt = prompts[dimension] || `Score ${dimension} health 0-100 from: ${JSON.stringify(payload)}. JSON: {"score": number, "reasoning": "explanation"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return { score: 50, reasoning: 'Score computation failed' };
  const data = await res.json() as any;
  try {
    const text = data.content[0].text;
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 50)),
      reasoning: parsed.reasoning || '',
    };
  } catch {
    return { score: 50, reasoning: '' };
  }
}

// ── Route registration ───────────────────────────────────────────────────────

export async function registerIntegrationRoutes(app: FastifyInstance) {
  // ── List connected integrations ────────────────────────────────────────────
  app.get('/integrations', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const rows = await db
      .select({
        source: schema.integrations.source,
        connectedAt: schema.integrations.connectedAt,
        lastSyncedAt: schema.integrations.lastSyncedAt,
        externalUserId: schema.integrations.externalUserId,
        revokedAt: schema.integrations.revokedAt,
      })
      .from(schema.integrations)
      .where(eq(schema.integrations.userId, req.userId!));

    return rows;
  });

  // ── Health scores ──────────────────────────────────────────────────────────
  app.get('/integrations/scores', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    // Return latest score per dimension
    const rows = await db
      .select()
      .from(schema.healthScores)
      .where(eq(schema.healthScores.userId, req.userId!))
      .orderBy(schema.healthScores.computedAt);

    // Dedupe: keep latest per dimension
    const latest: Record<string, typeof rows[0]> = {};
    for (const row of rows) {
      latest[row.dimension] = row;
    }

    return Object.values(latest);
  });

  // ── Connect an integration ─────────────────────────────────────────────────
  app.post<{ Params: { source: string } }>(
    '/integrations/:source/connect',
    { preHandler: authenticate },
    async (req: AuthenticatedRequest, reply: FastifyReply) => {
      const { source } = req.params as { source: string };
      if (!INTEGRATION_DIMENSIONS[source]) {
        return reply.code(400).send({ error: `Unknown integration: ${source}` });
      }

      const { externalUserId, accessToken, metadata } = req.body as {
        externalUserId?: string;
        accessToken?: string;
        metadata?: Record<string, any>;
      };

      // Upsert integration record
      const [existing] = await db
        .select()
        .from(schema.integrations)
        .where(and(
          eq(schema.integrations.userId, req.userId!),
          eq(schema.integrations.source, source as any),
        ));

      if (existing) {
        await db
          .update(schema.integrations)
          .set({
            externalUserId: externalUserId ?? existing.externalUserId,
            accessToken: accessToken ?? existing.accessToken,
            metadata: metadata ?? existing.metadata,
            revokedAt: null,
            connectedAt: new Date(),
          })
          .where(eq(schema.integrations.id, existing.id));
      } else {
        await db.insert(schema.integrations).values({
          userId: req.userId!,
          source: source as any,
          externalUserId,
          accessToken,
          metadata,
        });
      }

      return { connected: true, source };
    },
  );

  // ── Disconnect an integration ──────────────────────────────────────────────
  app.delete<{ Params: { source: string } }>(
    '/integrations/:source',
    { preHandler: authenticate },
    async (req: AuthenticatedRequest, reply: FastifyReply) => {
      const { source } = req.params as { source: string };

      await db
        .update(schema.integrations)
        .set({ revokedAt: new Date() })
        .where(and(
          eq(schema.integrations.userId, req.userId!),
          eq(schema.integrations.source, source as any),
        ));

      return { disconnected: true };
    },
  );

  /**
   * POST /integrations/:source/signal
   * Called by FiduciaryOS, ClearOut, Marrow, Story when something meaningful happens.
   * Requires X-Amber-User-Id header (the Amber userId of the linked account).
   * Optionally verified by X-Amber-Webhook-Secret.
   */
  app.post<{ Params: { source: string } }>(
    '/integrations/:source/signal',
    async (req: FastifyRequest<{ Params: { source: string } }>, reply: FastifyReply) => {
      const { source } = req.params as { source: string };

      if (!INTEGRATION_DIMENSIONS[source]) {
        return reply.code(400).send({ error: `Unknown integration: ${source}` });
      }

      // Verify webhook secret if configured
      const secret = INTEGRATION_SECRETS[source];
      if (secret) {
        const provided = req.headers['x-amber-webhook-secret'] as string | undefined;
        if (provided !== secret) {
          return reply.code(401).send({ error: 'Invalid webhook secret' });
        }
      }

      const amberId = req.headers['x-amber-user-id'] as string | undefined;
      if (!amberId) {
        return reply.code(400).send({ error: 'X-Amber-User-Id header required' });
      }

      const userId = Number(amberId);
      const payload = req.body as Record<string, any>;

      // Update lastSyncedAt
      await db
        .update(schema.integrations)
        .set({ lastSyncedAt: new Date() })
        .where(and(
          eq(schema.integrations.userId, userId),
          eq(schema.integrations.source, source as any),
        ))
        .catch(() => {}); // Non-fatal if integration not connected

      // Compute + store health scores for relevant dimensions
      const dimensions = INTEGRATION_DIMENSIONS[source];
      const scoreResults = await Promise.allSettled(
        dimensions.map(async (dimension) => {
          const { score, reasoning } = await computeHealthScore(dimension, source, payload);

          await db.insert(schema.healthScores).values({
            userId,
            dimension: dimension as any,
            score,
            source: source as any,
            reasoning,
            rawData: payload,
          });

          return { dimension, score };
        })
      );

      const scores = scoreResults
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<{ dimension: string; score: number }>).value);

      app.log.info({ source, userId, scores }, 'Integration signal processed');

      return { received: true, scores };
    },
  );
}

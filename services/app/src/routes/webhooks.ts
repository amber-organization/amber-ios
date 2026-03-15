/**
 * Amber Unified Conversation Engine
 *
 * One conversation per user, accessible across all three surfaces:
 *   • iMessage (Loop Message webhook)
 *   • Web (POST /chat — used by the web app)
 *   • iOS (POST /chat — used by the iOS app)
 *
 * All surfaces read/write the same conversation history.
 * All surfaces advance the same onboarding state machine.
 * Claude sees the same context and memory regardless of channel.
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { db, schema } from '../db/client.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';
import {
  processOnboardingMessage,
  getOrCreateOnboardingProgress,
  STEP_PROMPTS,
  type OnboardingStep,
} from '../util/onboarding-engine.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LOOP_API_KEY = process.env.LOOP_API_KEY;
const LOOP_SENDER_ID = process.env.LOOP_SENDER_ID;

const HISTORY_WINDOW = 20;

// ── Amber system prompt ──────────────────────────────────────────────────────

function buildAmberSystemPrompt(userContext: string): string {
  return `You are Amber, a personal health network assistant. You are warm, intelligent, spiritually grounded, and emotionally perceptive.

You help users track six dimensions of health: Spiritual, Emotional, Physical, Intellectual, Social, and Financial.

You remember things about users and the people in their lives. You surface insights, suggest connections, and help users understand how their relationships affect their wellbeing.

CORE BEHAVIORS:
- Keep responses concise and conversational (iMessage-style by default)
- Remember what the user tells you — confirm what you've stored clearly
- When they search their network ("who do I know that..."), return top matches with context
- Surface patterns across health dimensions when relevant
- Never take outbound actions (send messages to others, etc.) without explicit approval

MEMORY OPERATIONS:
- "Remember that [X]" → extract person, trait/fact, confirm stored
- "Who do I know that..." → search context + memories, return matches

USER CONTEXT:
${userContext || 'No profile set up yet.'}`;
}

// ── Loop Message delivery ────────────────────────────────────────────────────

export async function sendLoopMessage(phone: string, text: string) {
  if (!LOOP_API_KEY || !LOOP_SENDER_ID) return;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch('https://a.loopmessage.com/api/v1/message/send/', {
      method: 'POST',
      headers: { Authorization: LOOP_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact: phone, text, sender: LOOP_SENDER_ID }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Loop ${res.status}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Claude call ──────────────────────────────────────────────────────────────

async function callAmber(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext: string
): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: buildAmberSystemPrompt(userContext),
        messages,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[callAmber] Anthropic API error', res.status, errBody);
      throw new Error('Upstream AI error');
    }

    const data = await res.json() as any;
    return (data.content as any[]).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Load user context ────────────────────────────────────────────────────────

async function loadUserContext(userId: number): Promise<string> {
  const [profile] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId))
    .limit(1);

  if (!profile) return '';

  const parts: string[] = [];
  if (profile.displayName) parts.push(`Name: ${profile.displayName.slice(0, 100)}`);
  if (profile.currentCity) parts.push(`City: ${profile.currentCity.slice(0, 100)}`);
  if (profile.almaMater) parts.push(`School: ${profile.almaMater.slice(0, 100)}`);

  const memories = await db
    .select()
    .from(schema.memories)
    .where(eq(schema.memories.userId, userId))
    .orderBy(desc(schema.memories.createdAt))
    .limit(20);

  if (memories.length > 0) {
    parts.push('\nRecent memories:');
    memories.forEach((m) => parts.push(`- ${(m.summary ?? m.rawContent).slice(0, 500)}`));
  }

  return parts.join('\n');
}

// ── Load conversation history ────────────────────────────────────────────────

async function loadHistory(userId: number) {
  const rows = await db
    .select()
    .from(schema.memories)
    .where(eq(schema.memories.userId, userId))
    .orderBy(desc(schema.memories.createdAt))
    .limit(HISTORY_WINDOW);

  return rows
    .filter((r) => r.source === 'imessage' || r.source === 'web' || r.source === 'ios')
    .reverse()
    .flatMap((r): Array<{ role: 'user' | 'assistant'; content: string }> => {
      const parts: Array<{ role: 'user' | 'assistant'; content: string }> = [
        { role: 'user', content: r.rawContent },
      ];
      if (r.summary) parts.push({ role: 'assistant', content: r.summary });
      return parts;
    });
}

// ── Core: process one normal message turn ────────────────────────────────────

async function processMessage(
  userId: number,
  userText: string,
  channel: 'imessage' | 'web' | 'ios'
): Promise<string> {
  const [history, context] = await Promise.all([
    loadHistory(userId),
    loadUserContext(userId),
  ]);

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...history,
    { role: 'user', content: userText },
  ];

  const amberReply = await callAmber(messages, context);

  await db.insert(schema.memories).values({
    userId,
    source: channel,
    rawContent: userText,
    summary: amberReply,
    isActionable: /remind|follow.?up|action|todo/i.test(userText),
    confidence: 90,
    privacyTier: 'selective_cloud',
  });

  return amberReply;
}

// ── Create a provisional user from phone number ──────────────────────────────
// Used when an unknown phone texts Amber for the first time.
// When they later sign up via web/iOS, the phone field links the accounts.

async function createProvisionalUser(phone: string): Promise<number> {
  // privyUserId is required (notNull) — use a provisional placeholder.
  // auth0UserId marks it as an iMessage-originated account.
  // MERGE REQUIREMENT: when the user later signs up via web/iOS with a matching phone,
  // POST /auth/verify must detect this provisional record (by loop:<phone> privyUserId)
  // and update it with the real Privy user ID instead of creating a duplicate account.
  const [user] = await db
    .insert(schema.users)
    .values({
      privyUserId: `loop:${phone}`,
      auth0UserId: `imessage:${phone}`,
    })
    .returning();

  await db.insert(schema.userProfiles).values({ userId: user.id, phone });

  await getOrCreateOnboardingProgress(user.id);

  return user.id;
}

// ── Route registration ───────────────────────────────────────────────────────

export async function registerWebhookRoutes(app: FastifyInstance) {
  /**
   * POST /webhooks/loop-message
   * Loop Message sends inbound iMessages here.
   *
   * Full flow:
   *   1. Unknown phone → create provisional user → start onboarding
   *   2. Known user in onboarding → advance onboarding state machine
   *   3. Known user, onboarding complete → normal Amber conversation
   */
  app.post('/webhooks/loop-message', async (req: FastifyRequest, reply: FastifyReply) => {
    const sig = req.headers['loop-signature'] as string | undefined;
    const secret = process.env.LOOP_WEBHOOK_SECRET;
    if (!secret) {
      app.log.error('LOOP_WEBHOOK_SECRET not set — refusing webhook');
      return reply.code(500).send({ error: 'Webhook not configured' });
    }
    if (!sig) {
      return reply.code(401).send({ error: 'Missing loop-signature header' });
    }
    const rawPayload = (req as any).rawBody as Buffer | undefined;
    if (!rawPayload) {
      app.log.error('rawBody not available — raw body parser not registered');
      return reply.code(500).send({ error: 'Server misconfiguration' });
    }
    const expected = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    const sigBuf = Buffer.from(sig.trim(), 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length === 0 || sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return reply.code(401).send({ error: 'Invalid signature' });
    }

    const { event, contact, text: rawText, message_id } = req.body as {
      event: string;
      contact: string;
      text: string;
      message_id: string;
    };
    const text = typeof rawText === 'string' ? rawText.slice(0, 4000) : '';

    // Acknowledge immediately — Loop expects a fast 200
    reply.code(200).send({ ok: true });

    if (event !== 'message_inbound' || !text?.trim()) return;

    app.log.info({ contact, message_id }, 'iMessage inbound');

    // Resolve user by phone
    let [profileByPhone] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.phone, contact))
      .limit(1);

    let userId = profileByPhone?.userId;

    // Unknown phone — create provisional user and start onboarding
    if (!userId) {
      app.log.info({ contact }, 'New phone — creating provisional user');
      userId = await createProvisionalUser(contact);
      try {
        await sendLoopMessage(contact, STEP_PROMPTS.welcome);
      } catch (err: any) {
        app.log.error({ err }, 'Failed to send welcome iMessage');
      }
      return;
    }

    // Check onboarding state
    const progress = await getOrCreateOnboardingProgress(userId);
    const currentStep = progress.currentStep as OnboardingStep;

    try {
      let reply_text: string;

      if (currentStep !== 'complete') {
        // Still onboarding — run through the state machine
        reply_text = await processOnboardingMessage(userId, currentStep, text);
      } else {
        // Normal conversation
        reply_text = await processMessage(userId, text, 'imessage');
      }

      await sendLoopMessage(contact, reply_text);
      app.log.info({ contact, currentStep }, 'iMessage reply sent');
    } catch (err: any) {
      app.log.error({ err }, 'Failed to process iMessage');
      await sendLoopMessage(contact, "I hit a snag — try again in a moment.").catch(() => {});
    }
  });

  /**
   * POST /chat
   * Authenticated endpoint used by web and iOS.
   * Same Amber, same conversation history, same onboarding state.
   */
  app.post('/chat', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply: FastifyReply) => {
    const { message, channel: rawChannel } = req.body as {
      message: string;
      channel?: string;
    };
    const channel = (['web', 'ios'] as const).includes(rawChannel as any) ? (rawChannel as 'web' | 'ios') : 'web';

    if (!message?.trim()) return reply.code(400).send({ error: 'message is required' });
    if (message.length > 4000) return reply.code(400).send({ error: 'message too long' });

    const progress = await getOrCreateOnboardingProgress(req.userId!);
    const currentStep = progress.currentStep as OnboardingStep;

    try {
      let amberReply: string;

      if (currentStep !== 'complete') {
        amberReply = await processOnboardingMessage(req.userId!, currentStep, message);
      } else {
        amberReply = await processMessage(req.userId!, message, channel);
      }

      return { reply: amberReply };
    } catch (err: any) {
      app.log.error({ err }, 'Chat error');
      return reply.code(500).send({ error: 'Amber is unavailable right now' });
    }
  });

  /**
   * GET /chat/history
   * Returns recent conversation history for web/iOS.
   */
  app.get('/chat/history', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const rows = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.userId, req.userId!))
      .orderBy(desc(schema.memories.createdAt))
      .limit(50);

    return rows
      .filter((r) => r.source === 'imessage' || r.source === 'web' || r.source === 'ios')
      .reverse()
      .flatMap((r) => {
        const turns: Array<{ role: string; content: string; ts: Date }> = [
          { role: 'user', content: r.rawContent, ts: r.createdAt! },
        ];
        if (r.summary) turns.push({ role: 'amber', content: r.summary, ts: r.createdAt! });
        return turns;
      });
  });
}

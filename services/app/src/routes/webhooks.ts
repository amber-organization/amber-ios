/**
 * Amber Unified Conversation Engine
 *
 * One conversation per user, accessible across all three surfaces:
 *   • iMessage (Loop Message webhook)
 *   • Web (POST /chat — used by the web app)
 *   • iOS (POST /chat — used by the iOS app)
 *
 * All surfaces read/write the same conversation history.
 * Claude sees the same context and memory regardless of channel.
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { db, schema } from '../db/client.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LOOP_API_KEY = process.env.LOOP_API_KEY;
const LOOP_SENDER_ID = process.env.LOOP_SENDER_ID;

// How many recent messages to include in Claude context
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
${userContext || 'No profile set up yet — ask the user for their name and city to get started.'}`;
}

// ── Loop Message delivery ────────────────────────────────────────────────────

async function sendLoopMessage(phone: string, text: string) {
  if (!LOOP_API_KEY || !LOOP_SENDER_ID) return;
  const res = await fetch('https://a.loopmessage.com/api/v1/message/send/', {
    method: 'POST',
    headers: { Authorization: LOOP_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact: phone, text, sender: LOOP_SENDER_ID }),
  });
  if (!res.ok) throw new Error(`Loop ${res.status}`);
}

// ── Claude call ──────────────────────────────────────────────────────────────

async function callAmber(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext: string
): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

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
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic ${res.status}: ${err}`);
  }

  const data = await res.json() as any;
  return data.content[0].text as string;
}

// ── Load user context from DB ────────────────────────────────────────────────

async function loadUserContext(userId: number): Promise<string> {
  const [profile] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId))
    .limit(1);

  if (!profile) return '';

  const parts: string[] = [];
  if (profile.displayName) parts.push(`Name: ${profile.displayName}`);
  if (profile.currentCity) parts.push(`City: ${profile.currentCity}`);
  if (profile.almaMater) parts.push(`School: ${profile.almaMater}`);

  // Load recent memories
  const memories = await db
    .select()
    .from(schema.memories)
    .where(eq(schema.memories.userId, userId))
    .orderBy(desc(schema.memories.createdAt))
    .limit(20);

  if (memories.length > 0) {
    parts.push('\nRecent memories:');
    memories.forEach((m) => parts.push(`- ${m.summary ?? m.rawContent}`));
  }

  return parts.join('\n');
}

// ── Load conversation history ────────────────────────────────────────────────

async function loadHistory(userId: number) {
  // Pull recent messages from memories where source tracks conversation turns
  // We use a simple jsonb field approach — messages stored in a conversations record
  // For now, query the last N memories that were conversation turns
  const rows = await db
    .select()
    .from(schema.memories)
    .where(eq(schema.memories.userId, userId))
    .orderBy(desc(schema.memories.createdAt))
    .limit(HISTORY_WINDOW);

  // Reverse to chronological order and build message array
  return rows
    .filter((r) => r.source === 'imessage' || r.source === 'web' || r.source === 'ios')
    .reverse()
    .flatMap((r): Array<{ role: 'user' | 'assistant'; content: string }> => {
      const parts: Array<{ role: 'user' | 'assistant'; content: string }> = [
        { role: 'user', content: r.rawContent },
      ];
      if (r.summary) {
        parts.push({ role: 'assistant', content: r.summary });
      }
      return parts;
    });
}

// ── Core: process one message turn ──────────────────────────────────────────

async function processMessage(
  userId: number,
  userText: string,
  channel: 'imessage' | 'web' | 'ios'
): Promise<string> {
  const [history, context] = await Promise.all([
    loadHistory(userId),
    loadUserContext(userId),
  ]);

  // Build messages array: history + current message
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...history,
    { role: 'user', content: userText },
  ];

  const amberReply = await callAmber(messages, context);

  // Store user message + amber reply as a memory turn
  await db.insert(schema.memories).values({
    userId,
    source: channel,
    rawContent: userText,
    summary: amberReply, // store Amber's reply in summary field (conversation log)
    isActionable: /remind|follow.?up|action|todo/i.test(userText),
    confidence: 90,
    privacyTier: 'selective',
  });

  return amberReply;
}

// ── Route registration ───────────────────────────────────────────────────────

export async function registerWebhookRoutes(app: FastifyInstance) {
  /**
   * POST /webhooks/loop-message
   * Loop Message sends inbound iMessages here.
   * Looks up user by phone, calls Claude, replies via Loop Message.
   */
  app.post('/webhooks/loop-message', async (req: FastifyRequest, reply: FastifyReply) => {
    // Signature verification
    const sig = req.headers['loop-signature'] as string | undefined;
    const secret = process.env.LOOP_WEBHOOK_SECRET;
    if (secret && sig) {
      const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
      if (sig !== expected) return reply.code(401).send({ error: 'Invalid signature' });
    }

    const { event, contact, text, message_id } = req.body as {
      event: string;
      contact: string;
      text: string;
      message_id: string;
    };

    // Acknowledge immediately — Loop expects a fast 200
    reply.code(200).send({ ok: true });

    if (event !== 'message_inbound' || !text?.trim()) return;

    app.log.info({ contact, message_id }, 'iMessage inbound');

    // Resolve userId from phone number
    const [sub] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.stripeCustomerId, contact)) // fallback
      .limit(1);

    // Try userProfiles.phone field if we have it, otherwise use subscription lookup
    const [profileByPhone] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq((schema.userProfiles as any).phone ?? schema.userProfiles.userId, contact))
      .limit(1)
      .catch(() => [undefined]);

    const userId = profileByPhone?.userId ?? sub?.userId;

    if (!userId) {
      app.log.warn({ contact }, 'Unknown phone — no user found, skipping');
      return;
    }

    try {
      const amberReply = await processMessage(userId, text, 'imessage');
      await sendLoopMessage(contact, amberReply);
      app.log.info({ contact }, 'iMessage reply sent');
    } catch (err: any) {
      app.log.error({ err }, 'Failed to process iMessage');
      await sendLoopMessage(contact, "I hit a snag — try again in a moment.").catch(() => {});
    }
  });

  /**
   * POST /chat
   * Authenticated endpoint used by the web app and iOS app.
   * Same Amber, same conversation history as iMessage.
   */
  app.post('/chat', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply: FastifyReply) => {
    const { message, channel = 'web' } = req.body as {
      message: string;
      channel?: 'web' | 'ios';
    };

    if (!message?.trim()) return reply.code(400).send({ error: 'message is required' });

    try {
      const amberReply = await processMessage(req.userId!, message, channel);
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
        if (r.summary) {
          turns.push({ role: 'amber', content: r.summary, ts: r.createdAt! });
        }
        return turns;
      });
  });
}

import { FastifyInstance } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';
import { db, schema } from '../db/client.js';
import { eq, desc } from 'drizzle-orm';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const HISTORY_WINDOW = 20;

/**
 * AI routes: streaming LLM responses (SSE)
 * Used by iOS for real-time dimension digest chat.
 */
export async function registerAiRoutes(app: FastifyInstance) {
  /**
   * GET /ai/stream?dimension=emotional&prompt=...
   * Streams an Amber response for the given health dimension.
   */
  app.get('/ai/stream', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    if (!ANTHROPIC_API_KEY) {
      return reply.code(503).send({ error: 'AI not configured' });
    }

    const { dimension, prompt } = req.query as {
      dimension?: string;
      prompt?: string;
    };

    // Sanitize user input before injecting into prompts
    const safeDimension = (dimension || 'general').replace(/[^\w\s-]/g, '').slice(0, 50);
    const safePrompt = (prompt || '').slice(0, 1000);

    const userId = req.userId!;

    // Load recent memories for context
    const memories = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.userId, userId))
      .orderBy(desc(schema.memories.createdAt))
      .limit(HISTORY_WINDOW);

    const memoryContext = memories.length > 0
      ? memories.map((m) => `- ${m.summary ?? m.rawContent}`).join('\n')
      : 'No memories yet.';

    const systemPrompt = `You are Amber, a personal health network assistant analyzing the user's ${safeDimension} health dimension.
You have access to their recent memories and relationship patterns.
Be warm, concise, and insightful. Focus on the ${safeDimension} dimension specifically.
Recent memories:
${memoryContext}`;

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders();

    function send(data: object) {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    try {
      send({ type: 'start' });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      let res: Response;
      try {
        res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            stream: true,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: safePrompt || `Give me a brief insight about my ${safeDimension} health based on my recent memories.`,
              },
            ],
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok || !res.body) {
        send({ type: 'error', message: `Anthropic ${res.status}` });
        reply.raw.end();
        return reply;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              send({ type: 'token', token: event.delta.text });
            }
          } catch {
            // skip malformed events
          }
        }
      }

      send({ type: 'done' });
    } catch (err: any) {
      send({ type: 'error', message: err.message });
    }

    reply.raw.end();
    return reply;
  });
}

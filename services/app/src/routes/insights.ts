import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const InsightCreateSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  topic: z.enum(['health', 'connection', 'memory']),
  content: z.string().min(1),
  sources: z.array(z.string()).default([]),
});

export async function registerInsightRoutes(app: FastifyInstance) {
  /**
   * GET /insights
   * List insights for authenticated user (filtered by priority/topic)
   */
  app.get('/insights', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const { priority, topic } = req.query as { priority?: string; topic?: string };
    const conditions = [eq(schema.insights.userId, req.userId!)];
    
    if (priority) conditions.push(eq(schema.insights.priority, priority as any));
    if (topic) conditions.push(eq(schema.insights.topic, topic as any));
    
    return await db
      .select()
      .from(schema.insights)
      .where(and(...conditions))
      .orderBy(schema.insights.createdAt);
  });

  /**
   * POST /insights
   * Create insight (for authenticated user)
   */
  app.post('/insights', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const body = InsightCreateSchema.parse(req.body);
    const [insight] = await db
      .insert(schema.insights)
      .values({
        userId: req.userId!,
        priority: body.priority,
        topic: body.topic,
        content: body.content,
        sources: body.sources,
      })
      .returning();
    reply.code(201);
    return insight;
  });

  /**
   * GET /insights/:id
   * Get insight by ID (must belong to user)
   */
  app.get<{ Params: { id: string } }>(
    '/insights/:id',
    { preHandler: authenticate },
    async (req: AuthenticatedRequest, reply) => {
      const { id: idStr } = req.params as { id: string }; const id = Number(idStr);
      const [insight] = await db
        .select()
        .from(schema.insights)
        .where(and(eq(schema.insights.id, id), eq(schema.insights.userId, req.userId!)));
      if (!insight) return reply.code(404).send({ error: 'not_found' });
      return insight;
    },
  );

  /**
   * POST /insights/generate
   * Generate AI insights from graph context (for authenticated user)
   */
  app.post('/insights/generate', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    if (!ANTHROPIC_API_KEY) {
      return reply.code(503).send({ error: 'AI not configured' });
    }

    const userId = req.userId!;
    const { topic = 'health' } = req.body as { topic?: string };

    // Load recent memories for context
    const memories = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.userId, userId))
      .orderBy(desc(schema.memories.createdAt))
      .limit(20);

    const memoryContext = memories.length > 0
      ? memories.map((m) => `- ${m.summary ?? m.rawContent}`).join('\n')
      : 'No memories yet.';

    const prompt = `You are Amber, analyzing a user's ${topic} health based on their recent memories.
Generate one actionable insight with a specific recommendation.

Recent memories:
${memoryContext}

Respond with JSON only:
{"priority": "high"|"medium"|"low", "topic": "${topic}", "content": "specific insight and recommendation", "sources": ["source1", "source2"]}`;

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
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      return reply.code(502).send({ error: 'AI generation failed' });
    }

    const data = await res.json() as any;
    const text = (data.content as any[]).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();

    // Find and parse first valid JSON object in the response
    function extractJson(t: string): Record<string, any> | null {
      const matches = t.match(/\{[\s\S]*?\}/g);
      if (!matches) return null;
      for (const m of matches) {
        try { return JSON.parse(m); } catch { /* try next */ }
      }
      return null;
    }
    const parsed = extractJson(text);
    if (!parsed) return reply.code(502).send({ error: 'Failed to parse AI response' });

    // Validate AI-generated enum values before DB insert
    const VALID_PRIORITIES = ['high', 'medium', 'low'];
    const VALID_TOPICS = ['health', 'connection', 'memory'];
    const priority = VALID_PRIORITIES.includes(parsed.priority) ? parsed.priority : 'medium';
    const validatedTopic = VALID_TOPICS.includes(parsed.topic) ? parsed.topic : 'health';

    const [insight] = await db
      .insert(schema.insights)
      .values({
        userId,
        priority: priority as any,
        topic: validatedTopic as any,
        content: parsed.content || '',
        sources: parsed.sources || [],
      })
      .returning();

    reply.code(201);
    return insight;
  });
}


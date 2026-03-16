import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { eq, desc, and } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const MemoryCreateSchema = z.object({
  rawContent: z.string().min(1).max(10000),
  source: z.enum(['manual_note', 'imessage', 'email', 'call', 'meeting', 'photo', 'health_signal', 'location_signal', 'social_media', 'fireflies', 'loom']).default('manual_note'),
  personIds: z.array(z.number()).optional().default([]),
  privacyTier: z.enum(['local_only', 'selective_cloud', 'full_social']).optional().default('selective_cloud'),
});

const MemoryUpdateSchema = z.object({
  status: z.string().max(50).optional(),
  tags: z.array(z.string().max(100)).max(50).optional(),
});

export async function registerMemoryRoutes(app: FastifyInstance) {
  /**
   * GET /memories
   * List memories for authenticated user, optionally filtered by personId
   */
  app.get('/memories', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const { personId, limit: limitParam } = req.query as { personId?: string; limit?: string };
    const rawLimit = Number(limitParam ?? 20);
    const limit = Math.min(Math.max(isNaN(rawLimit) ? 20 : rawLimit, 1), 100);

    const rows = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.userId, req.userId!))
      .orderBy(desc(schema.memories.createdAt))
      .limit(limit);

    if (personId) {
      return rows.filter((m) => (m.personIds as number[]).includes(Number(personId)));
    }

    return rows;
  });

  /**
   * POST /memories
   * Create a new memory — AI extraction happens async
   */
  app.post('/memories', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const body = MemoryCreateSchema.parse(req.body);

    const [memory] = await db
      .insert(schema.memories)
      .values({
        userId: req.userId!,
        source: body.source,
        rawContent: body.rawContent,
        personIds: body.personIds,
        privacyTier: body.privacyTier,
        isActionable: false,
        confidence: 80,
      })
      .returning();

    // Extraction is handled asynchronously by the background worker, which polls for
    // memories with a null summary every minute. If WORKER_URL is set (co-deployed
    // worker), we also notify it immediately so extraction starts without waiting for
    // the next poll cycle. Fire-and-forget — a failure here doesn't affect the response.
    const workerUrl = process.env.WORKER_URL;
    if (workerUrl) {
      fetch(`${workerUrl}/extract`, { method: 'POST' }).catch(() => {});
    }

    return reply.code(201).send(memory);
  });

  /**
   * GET /memories/:id
   */
  app.get('/memories/:id', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { id } = req.params as { id: string };
    if (isNaN(Number(id))) return reply.code(400).send({ error: 'invalid id' });

    const [memory] = await db
      .select()
      .from(schema.memories)
      .where(and(eq(schema.memories.id, Number(id)), eq(schema.memories.userId, req.userId!)));

    if (!memory) {
      return reply.code(404).send({ error: 'Not found' });
    }

    return memory;
  });

  /**
   * DELETE /memories/:id
   */
  app.delete('/memories/:id', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { id } = req.params as { id: string };
    if (isNaN(Number(id))) return reply.code(400).send({ error: 'invalid id' });

    // Check ownership BEFORE deleting (C-4 fix: no TOCTOU)
    const [existing] = await db
      .select({ id: schema.memories.id })
      .from(schema.memories)
      .where(and(eq(schema.memories.id, Number(id)), eq(schema.memories.userId, req.userId!)));

    if (!existing) {
      return reply.code(404).send({ error: 'Not found' });
    }

    await db
      .delete(schema.memories)
      .where(and(eq(schema.memories.id, Number(id)), eq(schema.memories.userId, req.userId!)));

    return { deleted: true };
  });
}

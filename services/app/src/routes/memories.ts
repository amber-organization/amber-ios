import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const MemoryCreateSchema = z.object({
  rawContent: z.string().min(1),
  source: z.enum(['manual_note', 'imessage', 'email', 'call', 'meeting', 'photo', 'health_signal', 'location_signal', 'social_media', 'fireflies', 'loom']).default('manual_note'),
  personIds: z.array(z.number()).optional().default([]),
  privacyTier: z.enum(['local_only', 'selective_cloud', 'full_social']).optional().default('selective_cloud'),
});

const MemoryUpdateSchema = z.object({
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function registerMemoryRoutes(app: FastifyInstance) {
  /**
   * GET /memories
   * List memories for authenticated user, optionally filtered by personId
   */
  app.get('/memories', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const { personId, limit = 20 } = req.query as { personId?: string; limit?: number };

    const rows = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.userId, req.userId!))
      .orderBy(desc(schema.memories.createdAt))
      .limit(Number(limit));

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

    // TODO: enqueue Claude extraction job via worker
    return reply.code(201).send(memory);
  });

  /**
   * GET /memories/:id
   */
  app.get('/memories/:id', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { id } = req.params as { id: string };

    const [memory] = await db
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.id, Number(id)));

    if (!memory || memory.userId !== req.userId) {
      return reply.code(404).send({ error: 'Not found' });
    }

    return memory;
  });

  /**
   * DELETE /memories/:id
   */
  app.delete('/memories/:id', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { id } = req.params as { id: string };

    const [deleted] = await db
      .delete(schema.memories)
      .where(eq(schema.memories.id, Number(id)))
      .returning();

    if (!deleted || deleted.userId !== req.userId) {
      return reply.code(404).send({ error: 'Not found' });
    }

    return { deleted: true };
  });
}

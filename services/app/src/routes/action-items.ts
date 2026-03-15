import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const ActionItemCreateSchema = z.object({
  description: z.string().min(1),
  personIds: z.array(z.number()).optional().default([]),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).default('normal'),
  requiresApproval: z.boolean().default(false),
  dueAt: z.string().datetime().optional(),
});

const ActionItemUpdateSchema = z.object({
  status: z.enum(['open', 'pending', 'completed', 'cancelled']).optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  description: z.string().optional(),
  dueAt: z.string().datetime().nullable().optional(),
});

export async function registerActionItemRoutes(app: FastifyInstance) {
  /**
   * GET /action-items
   * List open action items for authenticated user
   */
  app.get('/action-items', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const { status = 'open' } = req.query as { status?: string };

    return await db
      .select()
      .from(schema.actionItems)
      .where(
        and(
          eq(schema.actionItems.userId, req.userId!),
          eq(schema.actionItems.status, status as any),
        )
      )
      .orderBy(desc(schema.actionItems.createdAt));
  });

  /**
   * POST /action-items
   */
  app.post('/action-items', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const body = ActionItemCreateSchema.parse(req.body);

    const [item] = await db
      .insert(schema.actionItems)
      .values({
        userId: req.userId!,
        description: body.description,
        personIds: body.personIds,
        priority: body.priority,
        requiresApproval: body.requiresApproval,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      })
      .returning();

    return reply.code(201).send(item);
  });

  /**
   * PATCH /action-items/:id
   */
  app.patch('/action-items/:id', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { id } = req.params as { id: string };
    const body = ActionItemUpdateSchema.parse(req.body);

    const [item] = await db
      .update(schema.actionItems)
      .set({
        ...body,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.actionItems.id, Number(id)),
          eq(schema.actionItems.userId, req.userId!)
        )
      )
      .returning();

    if (!item) return reply.code(404).send({ error: 'Not found' });
    return item;
  });
}

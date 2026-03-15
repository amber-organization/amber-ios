import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const ApprovalResolveSchema = z.object({
  status: z.enum(['approved', 'rejected', 'edited']),
  editedContent: z.string().optional(),
});

export async function registerApprovalRoutes(app: FastifyInstance) {
  /**
   * GET /approvals
   * List pending approvals
   */
  app.get('/approvals', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    return await db
      .select()
      .from(schema.approvalTasks)
      .where(
        and(
          eq(schema.approvalTasks.userId, req.userId!),
          eq(schema.approvalTasks.status, 'pending'),
        )
      );
  });

  /**
   * PATCH /approvals/:id
   * Approve, reject, or edit an approval task
   */
  app.patch('/approvals/:id', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { id } = req.params as { id: string };
    const body = ApprovalResolveSchema.parse(req.body);

    const [task] = await db
      .update(schema.approvalTasks)
      .set({
        status: body.status,
        editedContent: body.editedContent,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.approvalTasks.id, Number(id)),
          eq(schema.approvalTasks.userId, req.userId!)
        )
      )
      .returning();

    if (!task) return reply.code(404).send({ error: 'Not found' });
    return task;
  });
}

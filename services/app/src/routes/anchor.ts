import { FastifyInstance } from 'fastify';
import { db, schema } from '../db/client.js';
import { eq } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

/**
 * Anchor routes: blockchain anchoring for graph state
 */
export async function registerAnchorRoutes(app: FastifyInstance) {
  /**
   * POST /anchor/create
   * Create on-chain anchor (for authenticated user)
   */
  app.post('/anchor/create', { preHandler: authenticate }, async (_req: AuthenticatedRequest, reply) => {
    return reply.code(501).send({ error: 'not_implemented', message: 'Blockchain anchoring not yet implemented' });
  });

  /**
   * GET /anchor/list
   * List anchors for authenticated user
   */
  app.get('/anchor/list', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    return await db
      .select()
      .from(schema.anchors)
      .where(eq(schema.anchors.userId, req.userId!))
      .orderBy(schema.anchors.createdAt);
  });
}




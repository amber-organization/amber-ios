import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { eq } from 'drizzle-orm';
import { verifyPrivyToken } from '../auth/privy.js';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const TokenSchema = z.object({
  accessToken: z.string(),
});

/**
 * Auth routes: handle Privy authentication and user management
 */
export async function registerAuthRoutes(app: FastifyInstance) {
  /**
   * POST /auth/verify
   * Verify Privy token and return user info
   */
  app.post<{ Body: { accessToken: string } }>('/auth/verify', async (req, reply) => {
    const { accessToken } = TokenSchema.parse(req.body);
    
    try {
      const privyUser = await verifyPrivyToken(accessToken);
      
      // Get or create user
      let [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.privyUserId, privyUser.id))
        .limit(1);

      if (!user) {
        // Check for provisional account with matching phone (created via iMessage onboarding)
        const phone = (privyUser.linkedAccounts as any[])?.find((a: any) => a.type === 'phone')?.number;
        if (phone) {
          const [provisional] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.privyUserId, `loop:${phone}`))
            .limit(1);
          if (provisional) {
            // Merge: update provisional user with real Privy ID
            [user] = await db
              .update(schema.users)
              .set({ privyUserId: privyUser.id })
              .where(eq(schema.users.id, provisional.id))
              .returning();
          }
        }
      }

      if (!user) {
        [user] = await db
          .insert(schema.users)
          .values({ privyUserId: privyUser.id })
          .returning();
      }

      return {
        userId: user.id,
        privyUserId: privyUser.id,
        linkedAccounts: privyUser.linkedAccounts,
      };
    } catch (error: any) {
      reply.code(401).send({ error: 'invalid_token', message: error?.message });
    }
  });

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  app.get('/auth/me', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, req.userId!))
      .limit(1);

    return {
      id: user.id,
      privyUserId: user.privyUserId,
      didPrimary: user.didPrimary,
      createdAt: user.createdAt,
    };
  });
}



import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';

const WaitlistSchema = z.object({
  email: z.string().email(),
  venture: z.string().max(100).default('amber'),
});

export async function registerWaitlistRoutes(app: FastifyInstance) {
  /**
   * POST /waitlist
   * Public — no auth. Collects email for a venture waitlist.
   */
  app.post('/waitlist', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = WaitlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Valid email required' });
    }

    const { email, venture } = parsed.data;

    try {
      await db
        .insert(schema.waitlistEntries)
        .values({ email, venture })
        .onConflictDoNothing();
    } catch (err) {
      app.log.error({ err, venture }, 'Waitlist insert failed');
      return reply.code(500).send({ error: 'Failed to join waitlist' });
    }

    app.log.info({ venture }, 'Waitlist signup');
    return { success: true };
  });
}

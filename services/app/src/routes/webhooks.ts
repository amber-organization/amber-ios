/**
 * Loop Message webhook — receives inbound iMessages
 * Amber agents (amber-caleb, amber-sagar) also handle this independently,
 * but this endpoint allows the platform API to ingest messages directly.
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { db, schema } from '../db/client.js';
import { eq } from 'drizzle-orm';

export async function registerWebhookRoutes(app: FastifyInstance) {
  /**
   * POST /webhooks/loop-message
   * Loop Message sends inbound iMessages here
   */
  app.post('/webhooks/loop-message', async (req: FastifyRequest, reply: FastifyReply) => {
    const sig = req.headers['loop-signature'] as string | undefined;
    const secret = process.env.LOOP_WEBHOOK_SECRET;

    // Verify signature if configured
    if (secret && sig) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (sig !== expected) {
        return reply.code(401).send({ error: 'Invalid signature' });
      }
    }

    const { event, contact, text, message_id } = req.body as {
      event: string;
      contact: string;
      text: string;
      message_id: string;
    };

    if (event !== 'message_inbound' || !text) {
      return reply.code(200).send({ ok: true });
    }

    app.log.info({ contact, message_id }, 'Loop Message inbound');

    // Auto-ingest if the message looks like a memory capture
    const isCapture = /^(remember|tag|note|attach|add|update|amber)/i.test(text.trim());
    if (isCapture) {
      await db.insert(schema.memories).values({
        userId: 1, // TODO: resolve userId from contact phone number
        source: 'imessage',
        rawContent: text,
        isActionable: false,
        confidence: 80,
        privacyTier: 'selective',
      });
    }

    return reply.code(200).send({ ok: true });
  });
}

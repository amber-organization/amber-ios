import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { db, schema } from '../db/client.js';
import { eq } from 'drizzle-orm';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

// Price IDs from Stripe dashboard — set these in env
const PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
};

export async function registerBillingRoutes(app: FastifyInstance) {
  /**
   * GET /billing/status
   * Current subscription status for authenticated user
   */
  app.get('/billing/status', { preHandler: authenticate }, async (req: AuthenticatedRequest) => {
    const [sub] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, req.userId!));

    return sub ?? { plan: 'free', status: 'trialing' };
  });

  /**
   * POST /billing/checkout
   * Create a Stripe checkout session
   */
  app.post('/billing/checkout', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { priceKey, successUrl, cancelUrl } = req.body as {
      priceKey: keyof typeof PRICES;
      successUrl: string;
      cancelUrl: string;
    };

    const priceId = PRICES[priceKey];
    if (!priceId) return reply.code(400).send({ error: `Unknown price: ${priceKey}` });

    // Get or create Stripe customer
    let customerId: string | undefined;
    const [existing] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, req.userId!));

    if (existing?.stripeCustomerId) {
      customerId = existing.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        metadata: { amberId: String(req.userId) },
      });
      customerId = customer.id;

      // Upsert subscription row with customer ID
      await db
        .insert(schema.subscriptions)
        .values({ userId: req.userId!, stripeCustomerId: customerId })
        .onConflictDoUpdate({
          target: schema.subscriptions.userId,
          set: { stripeCustomerId: customerId, updatedAt: new Date() },
        });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 14,
      },
    });

    return { url: session.url };
  });

  /**
   * POST /billing/portal
   * Create a Stripe billing portal session
   */
  app.post('/billing/portal', { preHandler: authenticate }, async (req: AuthenticatedRequest, reply) => {
    const { returnUrl } = req.body as { returnUrl: string };

    const [sub] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, req.userId!));

    if (!sub?.stripeCustomerId) {
      return reply.code(400).send({ error: 'No Stripe customer found — subscribe first' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  });

  /**
   * POST /billing/webhook
   * Stripe webhook — updates subscription status in DB
   * Set STRIPE_WEBHOOK_SECRET from `stripe listen` or Stripe dashboard
   */
  app.post('/billing/webhook', {
    config: { rawBody: true }, // Fastify needs raw body for signature verification
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const sig = req.headers['stripe-signature'] as string;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      app.log.error('STRIPE_WEBHOOK_SECRET not set — refusing webhook');
      return reply.code(500).send({ error: 'Webhook not configured' });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent((req as any).rawBody as Buffer, sig, secret);
    } catch (err: any) {
      app.log.error({ err }, 'Stripe webhook signature verification failed');
      return reply.code(400).send({ error: `Webhook error: ${err.message}` });
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await db
          .update(schema.subscriptions)
          .set({
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            status: sub.status as any,
            plan: 'pro', // derive from price ID in production
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            updatedAt: new Date(),
          })
          .where(eq(schema.subscriptions.stripeCustomerId, customerId));
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(schema.subscriptions)
          .set({ status: 'canceled', plan: 'free', updatedAt: new Date() })
          .where(eq(schema.subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      default:
        app.log.info({ type: event.type }, 'Unhandled Stripe webhook event');
    }

    return { received: true };
  });
}

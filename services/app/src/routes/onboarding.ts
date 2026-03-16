import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/client.js';
import { eq, and } from 'drizzle-orm';
import { authenticateAuth0, AuthenticatedRequest } from '../auth/middleware.js';
import { sha256Hex } from '../util/crypto.js';
import { deriveHoroscope } from '../util/horoscope.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

const WEB_PRICES: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
};

const ALLOWED_REDIRECT_DOMAINS = [
  'amber.health',
  'www.amber.health',
  'localhost:3000',
  'localhost:3001',
];

function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_DOMAINS.some(
      (d) => parsed.host === d || parsed.host.endsWith(`.${d}`) || /^amber-.*\.vercel\.app$/.test(parsed.host)
    );
  } catch {
    return false;
  }
}

async function sendWelcomeText(phone: string, name?: string) {
  const apiKey = process.env.LOOP_API_KEY;
  const senderId = process.env.LOOP_SENDER_ID;
  if (!apiKey || !senderId) return;

  const firstName = name?.split(' ')[0] || 'there';
  const message = `Hey ${firstName}! I'm Amber — your personal health network. I track six dimensions of your wellbeing: spiritual, emotional, physical, intellectual, social, and financial.\n\nTo get started, what's your full name, and what city do you live in?`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch('https://a.loopmessage.com/api/v1/message/send/', {
      method: 'POST',
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact: phone, text: message, sender: senderId }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Loop Message ${res.status}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

const STEP_ORDER = ['welcome', 'basics', 'birthday', 'location', 'education', 'permissions', 'privacy_tier', 'complete'] as const;

const VALID_STEPS = ['basics', 'birthday', 'location', 'education', 'permissions', 'privacy_tier'] as const;

const stepSchemas = {
  basics: z.object({
    displayName: z.string().min(1).max(100),
    username: z.string().min(3).max(50),
  }),
  birthday: z.object({
    birthday: z.string().max(30), // ISO date
    birthdayTime: z.string().max(50).optional(),
    birthLocation: z.string().max(100).optional(),
  }),
  location: z.object({
    hometown: z.string().max(100).optional(),
    currentCity: z.string().min(1).max(100),
  }),
  education: z.object({
    almaMater: z.string().max(100).optional(),
  }),
  permissions: z.object({
    contacts: z.boolean(),
    location: z.boolean(),
    healthKit: z.boolean(),
    calendar: z.boolean(),
  }),
  privacy_tier: z.object({
    tier: z.enum(['local_only', 'selective_cloud', 'full_social']),
  }),
} as const;

function getNextStep(current: string): typeof STEP_ORDER[number] {
  const idx = STEP_ORDER.indexOf(current as any);
  return idx >= 0 && idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : 'complete';
}

export async function registerOnboardingRoutes(app: FastifyInstance) {
  /**
   * POST /onboarding/start
   * Creates onboarding progress record (or returns existing)
   */
  app.post('/onboarding/start', { preHandler: authenticateAuth0 }, async (req: AuthenticatedRequest, reply) => {
    // Check for existing progress
    const [existing] = await db
      .select()
      .from(schema.onboardingProgress)
      .where(eq(schema.onboardingProgress.userId, req.userId!))
      .limit(1);

    if (existing) {
      return { progressId: existing.id, currentStep: existing.currentStep, stepsCompleted: existing.stepsCompleted };
    }

    const [progress] = await db
      .insert(schema.onboardingProgress)
      .values({ userId: req.userId!, currentStep: 'welcome', stepsCompleted: {} })
      .returning();

    reply.code(201);
    return { progressId: progress.id, currentStep: progress.currentStep, stepsCompleted: progress.stepsCompleted };
  });

  /**
   * PUT /onboarding/step/:stepName
   * Update a specific onboarding step with validated data
   */
  app.put<{ Params: { stepName: string } }>(
    '/onboarding/step/:stepName',
    { preHandler: authenticateAuth0 },
    async (req: AuthenticatedRequest, reply) => {
      const { stepName } = req.params as { stepName: string };

      if (!VALID_STEPS.includes(stepName as any)) {
        return reply.code(400).send({ error: 'invalid_step' });
      }

      const stepSchema = stepSchemas[stepName as keyof typeof stepSchemas];
      const body = stepSchema.parse(req.body);

      // Get or create onboarding progress
      let [progress] = await db
        .select()
        .from(schema.onboardingProgress)
        .where(eq(schema.onboardingProgress.userId, req.userId!))
        .limit(1);

      if (!progress) {
        [progress] = await db
          .insert(schema.onboardingProgress)
          .values({ userId: req.userId!, currentStep: 'welcome', stepsCompleted: {} })
          .returning();
      }

      const nextStep = getNextStep(stepName);
      const stepsCompleted = { ...(progress.stepsCompleted as Record<string, string>), [stepName]: new Date().toISOString() };

      // Update progress
      [progress] = await db
        .update(schema.onboardingProgress)
        .set({ currentStep: nextStep, stepsCompleted, updatedAt: new Date() })
        .where(eq(schema.onboardingProgress.id, progress.id))
        .returning();

      // Build profile update values based on step
      let profileUpdate: Record<string, any> = {};
      switch (stepName) {
        case 'basics': {
          const b = body as z.infer<typeof stepSchemas.basics>;
          profileUpdate = { displayName: b.displayName, username: b.username };
          break;
        }
        case 'birthday': {
          const b = body as z.infer<typeof stepSchemas.birthday>;
          profileUpdate = { birthday: new Date(b.birthday), birthdayTime: b.birthdayTime, birthdayLocation: b.birthLocation };
          break;
        }
        case 'location': {
          const l = body as z.infer<typeof stepSchemas.location>;
          profileUpdate = { hometown: l.hometown, currentCity: l.currentCity };
          break;
        }
        case 'education':
          profileUpdate = { almaMater: (body as z.infer<typeof stepSchemas.education>).almaMater };
          break;
        case 'permissions':
          // Permissions are stored as metadata but don't map to profile columns directly
          // Store as-is for the app layer to consume
          break;
        case 'privacy_tier': {
          // privacyTier lives on the users table, not userProfiles
          const tier = (body as z.infer<typeof stepSchemas.privacy_tier>).tier;
          await db.update(schema.users).set({ privacyTier: tier }).where(eq(schema.users.id, req.userId!));
          break;
        }
      }

      // Upsert user profile
      if (Object.keys(profileUpdate).length > 0) {
        const [existingProfile] = await db
          .select()
          .from(schema.userProfiles)
          .where(eq(schema.userProfiles.userId, req.userId!))
          .limit(1);

        if (existingProfile) {
          await db
            .update(schema.userProfiles)
            .set({ ...profileUpdate, updatedAt: new Date() })
            .where(eq(schema.userProfiles.userId, req.userId!));
        } else {
          // For initial insert, birthday is required by the schema — use a placeholder if not this step
          const insertValues = {
            userId: req.userId!,
            birthday: profileUpdate.birthday ?? new Date(0),
            ...profileUpdate,
          };
          await db.insert(schema.userProfiles).values(insertValues);
        }
      }

      // Auto-derive horoscope for birthday step
      if (stepName === 'birthday') {
        const b = body as z.infer<typeof stepSchemas.birthday>;
        const horoscope = deriveHoroscope(b.birthday);

        const [existingHoroscope] = await db
          .select()
          .from(schema.personalityProfiles)
          .where(and(
            eq(schema.personalityProfiles.userId, req.userId!),
            eq(schema.personalityProfiles.profileType, 'horoscope'),
          ))
          .limit(1);

        if (existingHoroscope) {
          await db
            .update(schema.personalityProfiles)
            .set({ result: horoscope, derivedFrom: 'birthday', confidence: 100, updatedAt: new Date() })
            .where(eq(schema.personalityProfiles.id, existingHoroscope.id));
        } else {
          await db
            .insert(schema.personalityProfiles)
            .values({
              userId: req.userId!,
              profileType: 'horoscope',
              result: horoscope,
              derivedFrom: 'birthday',
              confidence: 100,
            });
        }
      }

      // Fetch current profile to return
      const [profile] = await db
        .select()
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.userId, req.userId!))
        .limit(1);

      return { currentStep: progress.currentStep, stepsCompleted: progress.stepsCompleted, profile: profile ?? null };
    },
  );

  /**
   * POST /onboarding/complete
   * Validates required steps and finalizes onboarding
   */
  app.post('/onboarding/complete', { preHandler: authenticateAuth0 }, async (req: AuthenticatedRequest, reply) => {
    const [progress] = await db
      .select()
      .from(schema.onboardingProgress)
      .where(eq(schema.onboardingProgress.userId, req.userId!))
      .limit(1);

    if (!progress) {
      return reply.code(400).send({ error: 'not_started', message: 'Onboarding has not been started' });
    }

    const completed = progress.stepsCompleted as Record<string, string>;
    const requiredSteps = ['basics', 'birthday'];
    const missing = requiredSteps.filter((s) => !completed[s]);

    if (missing.length > 0) {
      return reply.code(400).send({ error: 'incomplete', message: `Required steps not completed: ${missing.join(', ')}` });
    }

    const [profile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, req.userId!))
      .limit(1);

    if (!profile) {
      return reply.code(400).send({ error: 'no_profile', message: 'User profile not found' });
    }

    // Generate content hash for blockchain anchoring
    const contentHash = sha256Hex(JSON.stringify(profile));

    const [updatedProfile] = await db
      .update(schema.userProfiles)
      .set({ onboardingComplete: true, contentHash, updatedAt: new Date() })
      .where(eq(schema.userProfiles.userId, req.userId!))
      .returning();

    // Mark progress as complete
    await db
      .update(schema.onboardingProgress)
      .set({ currentStep: 'complete', updatedAt: new Date() })
      .where(eq(schema.onboardingProgress.id, progress.id));

    return updatedProfile;
  });

  // ─── Public Web Signup ─────────────────────────────────────────────────────

  /**
   * POST /onboarding/web/checkout
   * Public — no auth. Creates Stripe checkout with phone in metadata.
   * The /onboarding/web/webhook fires when payment completes → sends welcome iMessage.
   */
  const WebCheckoutSchema = z.object({
    phone: z.string().min(7).max(20).regex(/^\+?[\d\s\-().]+$/, 'Invalid phone number'),
    priceKey: z.string(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
    email: z.string().email().optional(),
    name: z.string().max(255).optional(),
  });

  app.post('/onboarding/web/checkout', async (req: FastifyRequest, reply) => {
    const parsed = WebCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors });
    }
    const { phone, priceKey, successUrl, cancelUrl, email, name } = parsed.data;

    const priceId = WEB_PRICES[priceKey];
    if (!priceId) return reply.code(400).send({ error: 'unknown_plan' });

    if (!isAllowedRedirectUrl(successUrl)) {
      return reply.code(400).send({ error: 'Invalid successUrl' });
    }
    if (!isAllowedRedirectUrl(cancelUrl)) {
      return reply.code(400).send({ error: 'Invalid cancelUrl' });
    }

    const customer = await stripe.customers.create({
      phone,
      email,
      name,
      metadata: { phone, onboarding: 'web' },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: { trial_period_days: 14 },
    });

    return { url: session.url };
  });

  /**
   * POST /onboarding/web/webhook
   * Stripe webhook for web signups. Add this URL to Stripe dashboard.
   * Fires on checkout.session.completed → sends welcome iMessage.
   */
  app.post('/onboarding/web/webhook', { config: { rawBody: true } }, async (req: FastifyRequest, reply) => {
    const sig = req.headers['stripe-signature'] as string;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      app.log.error('STRIPE_WEBHOOK_SECRET not set — refusing webhook');
      return reply.code(500).send({ error: 'Webhook not configured' });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent((req as any).rawBody as Buffer, sig, secret);
    } catch {
      return reply.code(400).send({ error: 'Invalid webhook signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
      const phone = customer.metadata?.phone ?? customer.phone ?? session.customer_details?.phone;
      const name = customer.name ?? session.customer_details?.name ?? undefined;

      if (phone) {
        app.log.info({ phone }, 'Web checkout complete — sending welcome iMessage');
        await sendWelcomeText(phone, name ?? undefined).catch((err: Error) =>
          app.log.error({ err }, 'Failed to send welcome text')
        );
      }
    }

    return { received: true };
  });

  /**
   * GET /onboarding/status
   * Returns current onboarding progress and partial profile
   */
  app.get('/onboarding/status', { preHandler: authenticateAuth0 }, async (req: AuthenticatedRequest) => {
    const [progress] = await db
      .select()
      .from(schema.onboardingProgress)
      .where(eq(schema.onboardingProgress.userId, req.userId!))
      .limit(1);

    const [profile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, req.userId!))
      .limit(1);

    return {
      progress: progress ?? null,
      profile: profile ?? null,
    };
  });
}

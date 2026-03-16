// Environment variables loaded via tsx --env-file flag
// Now import everything else
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerContactRoutes } from './routes/contacts.js';
import { registerPipelineRoutes } from './routes/pipelines.js';
import { registerAiRoutes } from './routes/ai.js';
import { registerIdentityRoutes } from './routes/identity.js';
import { registerAnchorRoutes } from './routes/anchor.js';
import { registerInsightRoutes } from './routes/insights.js';
import { registerOnboardingRoutes } from './routes/onboarding.js';
import { registerPrivacyRoutes } from './routes/privacy.js';
import { registerSignalRoutes } from './routes/signals.js';
import { registerCircleRoutes } from './routes/circles.js';
import { registerProfileRoutes } from './routes/profile.js';
import { registerMemoryRoutes } from './routes/memories.js';
import { registerActionItemRoutes } from './routes/action-items.js';
import { registerApprovalRoutes } from './routes/approvals.js';
import { registerBillingRoutes } from './routes/billing.js';
import { registerWebhookRoutes } from './routes/webhooks.js';
import { registerIntegrationRoutes } from './routes/integrations.js';
import { registerAgentRoutes } from './routes/agent.js';
import { registerWaitlistRoutes } from './routes/waitlist.js';
import { handleError } from './util/errors.js';
import './pipeline/nodes/registry.js';

const app = Fastify({
  logger: true,
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
});

// Raw body capture — required for Stripe webhook signature verification.
// Fastify's JSON parser is replaced with one that also stores the raw Buffer on req.rawBody.
app.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (_req, body, done) {
  try {
    const parsed = JSON.parse((body as Buffer).toString());
    (_req as any).rawBody = body;
    done(null, parsed);
  } catch (err: any) {
    done(err, undefined);
  }
});

// CORS
const extraOrigins = process.env.CORS_EXTRA_ORIGINS
  ? process.env.CORS_EXTRA_ORIGINS.split(',').map((o) => o.trim())
  : [];

await app.register(cors, {
  origin: [
    'https://amber.health',
    'https://www.amber.health',
    'http://localhost:3000',
    'http://localhost:3001',
    ...extraOrigins,
  ],
  credentials: true,
});

// Global error handler
app.setErrorHandler((error, request, reply) => {
  const { code, message, statusCode, context } = handleError(error);
  app.log.error({ error, code, context, reqId: request.id }, message);
  // Never spread internal context into HTTP responses — it may contain DB rows, stack traces, or keys
  reply.code(statusCode).send({ error: code, message });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Legacy / infrastructure
await app.register(registerHealthRoutes);
await app.register(registerAuthRoutes);
await app.register(registerContactRoutes);
await app.register(registerPipelineRoutes);
await app.register(registerAiRoutes);
await app.register(registerIdentityRoutes);
await app.register(registerAnchorRoutes);
await app.register(registerInsightRoutes);
await app.register(registerProfileRoutes);

// Sprint 1 MVP
await app.register(registerOnboardingRoutes); // ONBOARD-01/02 (includes public web checkout)
await app.register(registerPrivacyRoutes);    // PRIVACY-01
await app.register(registerSignalRoutes);     // SIGNAL-01/02/03/04/05
await app.register(registerCircleRoutes);     // SOCIAL-01

// Memory Engine + Relationship Intelligence
await app.register(registerMemoryRoutes);
await app.register(registerActionItemRoutes);
await app.register(registerApprovalRoutes);

// Billing
await app.register(registerBillingRoutes);

// Webhooks (Loop Message)
await app.register(registerWebhookRoutes);

// Integrations (FiduciaryOS, ClearOut, Marrow, Story, D-NOB)
await app.register(registerIntegrationRoutes);

// macOS Agent
await app.register(registerAgentRoutes);

// Venture waitlists
await app.register(registerWaitlistRoutes);

// ─── Server ───────────────────────────────────────────────────────────────────

app.listen({ port: config.server.port, host: config.server.host }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 Amber API listening on ${config.server.host}:${config.server.port}`);
  app.log.info(`✅ Privy configured: ${config.privy.appId.substring(0, 8)}...`);
  app.log.info(`📊 Sentry DSN: ${config.sentry.dsn ? 'configured' : 'not set (optional)'}`);
});

// Export for Cloud Functions (if needed)
export const http = app;

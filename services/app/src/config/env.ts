/**
 * Environment configuration with validation
 * Ensures required env vars are set at startup
 *
 * Note: dotenv is loaded in index.ts before this module
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

export const config = {
  // Privy (auth)
  privy: {
    appId: requireEnv('PRIVY_APP_ID'),
    appSecret: requireEnv('PRIVY_APP_SECRET'),
  },

  // Auth0
  auth0: {
    domain: optionalEnv('AUTH0_DOMAIN')!,
    clientId: optionalEnv('AUTH0_CLIENT_ID')!,
    audience: optionalEnv('AUTH0_AUDIENCE', 'https://api.amber.app')!,
  },

  // Database
  database: {
    url: optionalEnv('DATABASE_URL'),
  },

  // Storage (GCP Cloud Storage)
  storage: {
    bucket: optionalEnv('STORAGE_BUCKET'),
  },

  // INFRA-04: Sentry error tracking
  sentry: {
    dsn: optionalEnv('SENTRY_DSN'),
  },

  // INFRA-04: PostHog analytics
  posthog: {
    apiKey: optionalEnv('POSTHOG_API_KEY'),
    host: optionalEnv('POSTHOG_HOST', 'https://app.posthog.com'),
  },

  // SIGNAL-02: APNs push notifications
  apns: {
    keyId: optionalEnv('APNS_KEY_ID'),
    teamId: optionalEnv('APNS_TEAM_ID'),
    bundleId: optionalEnv('APNS_BUNDLE_ID', 'com.amber.app'),
    privateKey: optionalEnv('APNS_PRIVATE_KEY'), // PEM string from GCP Secret Manager
    sandbox: optionalEnv('APNS_SANDBOX', 'true') === 'true',
  },

  // Server
  server: {
    port: Number(optionalEnv('PORT', '8080')),
    host: optionalEnv('HOST', '0.0.0.0'),
  },

  // Stripe (billing)
  stripe: {
    secretKey: optionalEnv('STRIPE_SECRET_KEY'),
    webhookSecret: optionalEnv('STRIPE_WEBHOOK_SECRET'),
    prices: {
      proMonthly: optionalEnv('STRIPE_PRICE_PRO_MONTHLY'),
      proAnnual: optionalEnv('STRIPE_PRICE_PRO_ANNUAL'),
      teamMonthly: optionalEnv('STRIPE_PRICE_TEAM_MONTHLY'),
    },
  },

  // AI
  anthropic: {
    apiKey: optionalEnv('ANTHROPIC_API_KEY'),
  },

  // Loop Message (iMessage delivery)
  loopMessage: {
    apiKey: optionalEnv('LOOP_API_KEY'),
    webhookSecret: optionalEnv('LOOP_WEBHOOK_SECRET'),
  },

  // Environment
  env: optionalEnv('NODE_ENV', 'development'),
  isDevelopment: optionalEnv('NODE_ENV', 'development') === 'development',
  isProduction: optionalEnv('NODE_ENV', 'development') === 'production',
};

// In production, critical env vars must be set
if (config.isProduction) {
  requireEnv('PRIVY_APP_ID');
  requireEnv('PRIVY_APP_SECRET');
  requireEnv('DATABASE_URL');
  requireEnv('STRIPE_SECRET_KEY');
  requireEnv('STRIPE_WEBHOOK_SECRET');
  requireEnv('AMBER_AGENT_SECRET');
  requireEnv('LOOP_WEBHOOK_SECRET');
}

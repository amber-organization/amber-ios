import { pgTable, serial, text, timestamp, jsonb, varchar, integer, pgEnum, boolean, unique } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const relationshipTypeEnum = pgEnum('relationship_type', [
  'parent', 'sibling', 'partner', 'child', 'other',
]);
export const insightPriorityEnum = pgEnum('insight_priority', ['high', 'medium', 'low']);
export const insightTopicEnum = pgEnum('insight_topic', ['health', 'connection', 'memory']);
export const runStatusEnum = pgEnum('run_status', ['queued', 'running', 'succeeded', 'failed']);

// PRIVACY-01
export const privacyTierEnum = pgEnum('privacy_tier', [
  'local_only',      // All data stays on device. Zero cloud sync.
  'selective_cloud', // User chooses which fields sync to cloud.
  'full_social',     // All permitted data syncs. Full signal matching.
]);

// SIGNAL-01/02/03/04/05
export const signalTypeEnum = pgEnum('signal_type', [
  'birthday_3day',
  'birthday_1day',
  'birthday_today',
  'shared_calendar_event',
  'questionnaire_match',
]);

export const signalStatusEnum = pgEnum('signal_status', [
  'pending',
  'sent',
  'viewed',
  'acted',
  'dismissed',
]);

// ─── Core User Tables ─────────────────────────────────────────────────────────

// Users (linked to Privy)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  privyUserId: varchar('privy_user_id', { length: 255 }).notNull().unique(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).unique(),
  didPrimary: varchar('did_primary', { length: 255 }),
  privacyTier: privacyTierEnum('privacy_tier').default('local_only').notNull(),
  apnsDeviceToken: varchar('apns_device_token', { length: 512 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ONBOARD-01: Immutable identity objects (name, birthday, alma mater, hometown, city)
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  username: varchar('username', { length: 50 }).unique(),
  displayName: varchar('display_name', { length: 255 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  birthday: timestamp('birthday', { withTimezone: true }),         // date + time for horoscope
  birthdayTime: varchar('birthday_time', { length: 10 }),          // HH:MM — exact birth time for rising sign
  birthdayLocation: varchar('birthday_location', { length: 255 }), // city of birth for rising sign
  horoscopeSign: varchar('horoscope_sign', { length: 50 }),        // auto-derived
  almaMater: varchar('alma_mater', { length: 255 }),
  hometown: varchar('hometown', { length: 255 }),
  currentCity: varchar('current_city', { length: 255 }),
  phone: varchar('phone', { length: 30 }).unique(),   // E.164 e.g. +14155551234 — used for iMessage lookup
  privacyTier: privacyTierEnum('privacy_tier').default('local_only').notNull(),
  contentHash: varchar('content_hash', { length: 64 }),  // SHA-256 of profile for blockchain anchoring
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// PRIVACY-01: Field-level permission table — controls which fields sync to cloud
export const userPermissions = pgTable('user_permissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fieldType: varchar('field_type', { length: 100 }).notNull(), // e.g. 'contacts', 'birthday', 'health', 'calendar', 'location'
  syncEnabled: boolean('sync_enabled').default(false).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// PRIVACY-01: Audit log for permission changes
export const permissionAuditLog = pgTable('permission_audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fieldType: varchar('field_type', { length: 100 }).notNull(),
  oldValue: boolean('old_value'),
  newValue: boolean('new_value').notNull(),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Contact Graph ────────────────────────────────────────────────────────────

// DATA-01: iMessage contact graph — synced for selective/full_social users
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  externalId: varchar('external_id', { length: 255 }), // CNContact identifier
  name: text('name').notNull(),
  phoneNumbers: jsonb('phone_numbers').$type<string[]>().default([]),
  emails: jsonb('emails').$type<string[]>().default([]),
  birthday: timestamp('birthday', { withTimezone: true }),
  messageFrequency: integer('message_frequency').default(0), // messages/30d
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true }),
  relationshipScore: integer('relationship_score').default(0), // 0-100
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Signals ──────────────────────────────────────────────────────────────────

// SIGNAL-01/04/05: Suggestion signals — one row per potential nudge
export const signals = pgTable('signals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  contactId: integer('contact_id').references(() => contacts.id),
  signalType: signalTypeEnum('signal_type').notNull(),
  triggerDate: timestamp('trigger_date', { withTimezone: true }).notNull(),
  status: signalStatusEnum('status').default('pending').notNull(),
  payload: jsonb('payload'),  // event_id, match_type, etc.
  dedupeKey: varchar('dedupe_key', { length: 255 }).unique(), // prevents re-firing
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  actedAt: timestamp('acted_at', { withTimezone: true }),
});

// ─── Circles (SOCIAL-01) ──────────────────────────────────────────────────────

export const circleVisibilityEnum = pgEnum('circle_visibility', ['private', 'members', 'public']);

export const circles = pgTable('circles', {
  id: serial('id').primaryKey(),
  createdByUserId: integer('created_by_user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  visibility: circleVisibilityEnum('visibility').default('private').notNull(),
  inviteToken: varchar('invite_token', { length: 64 }).unique(), // for iMessage share link
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const circleMembers = pgTable('circle_members', {
  id: serial('id').primaryKey(),
  circleId: integer('circle_id').references(() => circles.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  circleUserUnique: unique().on(t.circleId, t.userId),
}));

// ─── Legacy tables (kept for backwards compat) ────────────────────────────────

export const persons = pgTable('persons', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  dob: timestamp('dob', { withTimezone: true }),
  email: varchar('email', { length: 255 }),
  cNFT: varchar('c_nft', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  personId: integer('person_id').references(() => persons.id).notNull(),
  chain: varchar('chain', { length: 50 }).default('solana').notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  verified: timestamp('verified', { withTimezone: true }),
  labels: jsonb('labels'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const relationships = pgTable('relationships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  fromId: integer('from_id').references(() => persons.id).notNull(),
  toId: integer('to_id').references(() => persons.id).notNull(),
  type: relationshipTypeEnum('type').notNull(),
  strength: integer('strength').default(50),
  evidenceHash: varchar('evidence_hash', { length: 255 }),
  s3Uri: varchar('s3_uri', { length: 512 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pipelineDefs = pgTable('pipeline_defs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  def: jsonb('def').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pipelineRuns = pgTable('pipeline_runs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  defId: integer('def_id').references(() => pipelineDefs.id),
  status: runStatusEnum('status').notNull(),
  log: jsonb('log').$type<string[]>().default([]),
  result: jsonb('result'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});

export const insights = pgTable('insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  priority: insightPriorityEnum('priority').notNull(),
  topic: insightTopicEnum('topic').notNull(),
  content: text('content').notNull(),
  sources: jsonb('sources').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vcRecords = pgTable('vc_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  issuer: varchar('issuer', { length: 255 }).notNull(),
  schemaId: varchar('schema_id', { length: 255 }),
  s3Uri: varchar('s3_uri', { length: 512 }),
  contentHash: varchar('content_hash', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

export const anchors = pgTable('anchors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  kind: varchar('kind', { length: 100 }),
  contentHash: varchar('content_hash', { length: 255 }).notNull(),
  chainTx: varchar('chain_tx', { length: 255 }),
  uri: varchar('uri', { length: 512 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Additional enums for GCP/Onboarding features
export const notificationStatusEnum = pgEnum('notification_status', ['queued', 'sent', 'delivered', 'opened', 'failed']);
export const circleTypeEnum = pgEnum('circle_type', ['auto', 'manual']);
export const personalityTypeEnum = pgEnum('personality_type', ['horoscope', 'myers_briggs', 'enneagram', 'big_five']);
export const devicePlatformEnum = pgEnum('device_platform', ['ios', 'android']);
export const onboardingStepEnum = pgEnum('onboarding_step', ['welcome', 'basics', 'birthday', 'location', 'education', 'permissions', 'privacy_tier', 'complete']);

// Onboarding progress (tracks wizard state)
export const onboardingProgress = pgTable('onboarding_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).unique(),
  currentStep: onboardingStepEnum('current_step').default('welcome'),
  stepsCompleted: jsonb('steps_completed').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Personality profiles (derived personality data)
export const personalityProfiles = pgTable('personality_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  profileType: personalityTypeEnum('profile_type').notNull(),
  result: jsonb('result').notNull(),
  derivedFrom: varchar('derived_from', { length: 50 }),
  confidence: integer('confidence'),
  contentHash: varchar('content_hash', { length: 66 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Notifications (push notification log)
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  signalId: integer('signal_id').references(() => signals.id),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  deepLink: varchar('deep_link', { length: 500 }),
  status: notificationStatusEnum('status').default('queued'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Device tokens (for push notifications)
export const deviceTokens = pgTable('device_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  platform: devicePlatformEnum('platform').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Memory Engine Tables ─────────────────────────────────────────────────────

export const memorySourceEnum = pgEnum('memory_source', [
  'manual_note', 'imessage', 'web', 'ios',
  'email', 'call', 'meeting',
  'photo', 'health_signal', 'location_signal', 'social_media', 'fireflies', 'loom',
]);

export const actionItemStatusEnum = pgEnum('action_item_status', [
  'open', 'pending', 'completed', 'cancelled',
]);

export const approvalStatusEnum = pgEnum('approval_status', [
  'pending', 'approved', 'rejected', 'edited',
]);

export const actionItemPriorityEnum = pgEnum('action_item_priority', [
  'urgent', 'high', 'normal', 'low',
]);

// Memories — relationship intelligence captured from any source
export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  personIds: jsonb('person_ids').$type<number[]>().default([]),
  source: memorySourceEnum('source').notNull(),
  rawContent: text('raw_content').notNull(),
  summary: text('summary'),
  traits: jsonb('traits').$type<string[]>().default([]),
  emotionalLabel: varchar('emotional_label', { length: 100 }),
  trustSignals: jsonb('trust_signals').$type<string[]>().default([]),
  lifeEvents: jsonb('life_events').$type<string[]>().default([]),
  isActionable: boolean('is_actionable').default(false),
  confidence: integer('confidence').default(80),
  privacyTier: privacyTierEnum('privacy_tier').default('selective_cloud'),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Action items — follow-ups extracted from memories
export const actionItems = pgTable('action_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  personIds: jsonb('person_ids').$type<number[]>().default([]),
  memoryId: integer('memory_id').references(() => memories.id),
  description: text('description').notNull(),
  priority: actionItemPriorityEnum('priority').default('normal'),
  status: actionItemStatusEnum('status').default('open'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  requiresApproval: boolean('requires_approval').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Approval tasks — actions that need explicit user sign-off before executing
export const approvalTasks = pgTable('approval_tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  actionItemId: integer('action_item_id').references(() => actionItems.id),
  type: varchar('type', { length: 100 }).notNull(), // e.g. 'send_message', 'calendar_invite'
  proposedContent: text('proposed_content').notNull(),
  editedContent: text('edited_content'),
  status: approvalStatusEnum('status').default('pending'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Integrations ─────────────────────────────────────────────────────────────
// Connected apps from Amber's ecosystem. Each sends health dimension signals.

export const integrationSourceEnum = pgEnum('integration_source', [
  'fiduciaryos', // Financial health — portfolio, tax, wealth
  'clearout',    // Social + Emotional — communication patterns, inbox load
  'marrow',      // Social + Professional — org network, recruiting involvement
  'story',       // Social + Emotional — circles, daily prompts, human connection
  'dnob',        // Emotional + Social — peer support, community belonging
  'medbridge',   // Physical health — unified medical records, FHIR import, health timeline
  'apple_health',
  'google_calendar',
  'instagram',
  'linkedin',
]);

export const healthDimensionEnum = pgEnum('health_dimension', [
  'spiritual', 'emotional', 'physical', 'intellectual', 'social', 'financial',
]);

// One row per connected integration per user
export const integrations = pgTable('integrations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  source: integrationSourceEnum('source').notNull(),
  accessToken: text('access_token'),          // encrypted OAuth token
  refreshToken: text('refresh_token'),
  externalUserId: varchar('external_user_id', { length: 255 }),
  metadata: jsonb('metadata'),                // source-specific config
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  connectedAt: timestamp('connected_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

// Health dimension scores — updated by integrations + manual input
export const healthScores = pgTable('health_scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  dimension: healthDimensionEnum('dimension').notNull(),
  score: integer('score').notNull(),          // 0–100
  source: integrationSourceEnum('source'),    // which integration drove this update
  delta: integer('delta'),                    // change from last score
  reasoning: text('reasoning'),              // Claude-generated explanation
  rawData: jsonb('raw_data'),               // source payload that drove the score
  computedAt: timestamp('computed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Billing (Stripe) ─────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing', 'active', 'past_due', 'canceled', 'incomplete',
]);

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free', 'pro', 'team',
]);

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  plan: subscriptionPlanEnum('plan').default('free'),
  status: subscriptionStatusEnum('status').default('trialing'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Agent (macOS operator) ───────────────────────────────────────────────────
// Amber's desktop agent: takes over macOS to execute multi-step tasks,
// sends morning briefs, and logs every action for debuggability.

export const agentTaskStatusEnum = pgEnum('agent_task_status', [
  'queued', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled',
]);

export const agentTasks = pgTable('agent_tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  prompt: text('prompt').notNull(),                    // natural language instruction
  status: agentTaskStatusEnum('status').default('queued').notNull(),
  plan: jsonb('plan').$type<string[]>(),               // Claude's step-by-step plan
  steps: jsonb('steps').$type<Array<{                  // execution log
    step: number;
    action: string;
    tool: string;
    result: string;
    screenshotUrl?: string;
    completedAt: string;
  }>>().default([]),
  result: text('result'),                              // final output / summary
  errorMessage: text('error_message'),
  approvalRequired: boolean('approval_required').default(false),
  approvalPrompt: text('approval_prompt'),             // what Amber is asking permission to do
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  channel: varchar('channel', { length: 20 }).default('web'), // 'web' | 'ios' | 'imessage'
  briefDate: varchar('brief_date', { length: 20 }),   // set for morning brief tasks (YYYY-MM-DD)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// ── Magic link tokens — for iMessage-only users ──────────────────────────────
// Short-lived tokens that authenticate actions without a web session.
// Purpose values: 'auth' | 'connect_integration' | 'approve_task' | 'checkout'

export const magicLinkPurposeEnum = pgEnum('magic_link_purpose', [
  'auth',               // create/log into account from iMessage
  'connect_integration', // connect a third-party integration
  'approve_task',       // approve a pending agent task
  'checkout',           // complete Stripe subscription checkout
]);

export const magicLinkTokens = pgTable('magic_link_tokens', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 128 }).notNull().unique(),
  userId: integer('user_id').references(() => users.id),  // null until account created
  phone: varchar('phone', { length: 30 }),                // E.164 — for pre-account flow
  purpose: magicLinkPurposeEnum('purpose').notNull(),
  metadata: jsonb('metadata'),                            // e.g. { source, taskId }
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Waitlist ─────────────────────────────────────────────────────────────────
// Collects emails from venture landing pages before public launch.

export const waitlistEntries = pgTable('waitlist_entries', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  venture: varchar('venture', { length: 100 }).notNull().default('amber'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  emailVentureUnique: unique().on(t.email, t.venture),
}));

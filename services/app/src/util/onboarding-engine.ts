/**
 * Onboarding Engine — channel-agnostic
 *
 * Shared logic used by:
 *   - PUT /onboarding/step/:stepName  (web / iOS)
 *   - iMessage conversation handler   (Loop Message webhook)
 *
 * The same state machine advances regardless of surface.
 */
import { db, schema } from '../db/client.js';
import { eq } from 'drizzle-orm';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export const STEP_ORDER = [
  'welcome',
  'basics',
  'birthday',
  'location',
  'education',
  'permissions',
  'privacy_tier',
  'complete',
] as const;
export type OnboardingStep = typeof STEP_ORDER[number];

export const STEP_PROMPTS: Record<OnboardingStep, string> = {
  welcome:
    "Hey! I'm Amber — your personal health network. I track six dimensions of your wellbeing: Spiritual, Emotional, Physical, Intellectual, Social, and Financial.\n\nFirst — what's your name?",
  basics:
    "What's your name? (And if you'd like, pick a username — otherwise I'll create one from your name)",
  birthday: "What's your birthday? (e.g. March 15, 2001)",
  location:
    "What city are you in right now? And where did you grow up? (Just reply with your current city, or both — up to you)",
  education:
    "Where did/do you go to school? (University, college, or skip this one)",
  permissions:
    "Amber works best with access to your calendar and contacts — you can grant those in the app later. For now, just reply "got it" and we'll keep going.",
  privacy_tier:
    "Last one — how private do you want your health data?\n\n1. Private only (just you)\n2. Close friends can see your highlights\n3. Full social (share across your Amber network)\n\nReply 1, 2, or 3",
  complete:
    "You're all set! I'm Amber, and I've got you. 🌿\n\nTell me anything — what's on your mind today?",
};

export function getNextStep(current: OnboardingStep): OnboardingStep {
  const idx = STEP_ORDER.indexOf(current);
  return idx >= 0 && idx < STEP_ORDER.length - 1
    ? STEP_ORDER[idx + 1]
    : 'complete';
}

// ── Extract structured data from freeform text ───────────────────────────────

async function parseWithClaude(step: string, userText: string): Promise<Record<string, any> | null> {
  if (!ANTHROPIC_API_KEY) return null;

  const systemPrompts: Record<string, string> = {
    basics: `Extract the user's name and desired username from their message.
Return JSON: {"displayName": "Full Name", "username": "suggested_username"}
If no username is given, derive one from the name (lowercase, no spaces, e.g. "johndoe").
Message: "${userText}"`,

    birthday: `Extract a birthday from this message. Return ISO date string.
Return JSON: {"birthday": "YYYY-MM-DD"}
If no valid date found, return {"birthday": null}
Message: "${userText}"`,

    location: `Extract current city and optionally hometown from this message.
Return JSON: {"currentCity": "City, State", "hometown": "City, State or null"}
Message: "${userText}"`,

    education: `Extract school/university name from this message.
Return JSON: {"almaMater": "University Name or null"}
If user skips, return {"almaMater": null}
Message: "${userText}"`,

    permissions: `User acknowledged the permissions step. Return: {"acknowledged": true}`,

    privacy_tier: `Extract privacy preference from this message.
User chose one of: 1=private, 2=selective, 3=full social
Return JSON: {"tier": "local_only" | "selective_cloud" | "full_social"}
Message: "${userText}"`,
  };

  const prompt = systemPrompts[step];
  if (!prompt) return null;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json() as any;
  try {
    const text = data.content[0].text;
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
  } catch {
    return null;
  }
}

// ── Apply parsed data to the user profile ────────────────────────────────────

async function applyStepData(userId: number, step: string, data: Record<string, any>): Promise<void> {
  let profileUpdate: Record<string, any> = {};

  switch (step) {
    case 'basics':
      if (data.displayName) profileUpdate.displayName = data.displayName;
      if (data.username) profileUpdate.username = data.username;
      break;
    case 'birthday':
      if (data.birthday) profileUpdate.birthday = new Date(data.birthday);
      break;
    case 'location':
      if (data.currentCity) profileUpdate.currentCity = data.currentCity;
      if (data.hometown) profileUpdate.hometown = data.hometown;
      break;
    case 'education':
      if (data.almaMater) profileUpdate.almaMater = data.almaMater;
      break;
    case 'privacy_tier':
      if (data.tier) profileUpdate.privacyTier = data.tier;
      break;
  }

  if (Object.keys(profileUpdate).length === 0) return;

  const [existing] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(schema.userProfiles)
      .set({ ...profileUpdate, updatedAt: new Date() })
      .where(eq(schema.userProfiles.userId, userId));
  } else {
    await db.insert(schema.userProfiles).values({ userId, ...profileUpdate });
  }
}

// ── Core: advance one step ────────────────────────────────────────────────────

export async function advanceOnboardingStep(
  userId: number,
  step: OnboardingStep,
  data: Record<string, any>
): Promise<{ nextStep: OnboardingStep }> {
  const nextStep = getNextStep(step);
  const stepsCompleted: Record<string, string> = {};
  stepsCompleted[step] = new Date().toISOString();

  // Get current progress to merge stepsCompleted
  const [existing] = await db
    .select()
    .from(schema.onboardingProgress)
    .where(eq(schema.onboardingProgress.userId, userId))
    .limit(1);

  const mergedSteps = {
    ...((existing?.stepsCompleted as Record<string, string>) ?? {}),
    ...stepsCompleted,
  };

  if (existing) {
    await db
      .update(schema.onboardingProgress)
      .set({ currentStep: nextStep, stepsCompleted: mergedSteps, updatedAt: new Date() })
      .where(eq(schema.onboardingProgress.userId, userId));
  } else {
    await db.insert(schema.onboardingProgress).values({
      userId,
      currentStep: nextStep,
      stepsCompleted: mergedSteps,
    });
  }

  await applyStepData(userId, step, data);

  return { nextStep };
}

// ── iMessage: process one onboarding message turn ────────────────────────────

export async function processOnboardingMessage(
  userId: number,
  currentStep: OnboardingStep,
  userText: string
): Promise<string> {
  // 'welcome' is the initial step — we just greet and move to basics
  if (currentStep === 'welcome') {
    const { nextStep } = await advanceOnboardingStep(userId, 'welcome', {});
    return STEP_PROMPTS[nextStep];
  }

  if (currentStep === 'complete') {
    return STEP_PROMPTS.complete;
  }

  // Parse the user's response for the current step
  const parsed = await parseWithClaude(currentStep, userText);

  if (!parsed) {
    // Couldn't parse — re-ask
    return `I didn't quite catch that. ${STEP_PROMPTS[currentStep]}`;
  }

  const { nextStep } = await advanceOnboardingStep(userId, currentStep, parsed);

  return STEP_PROMPTS[nextStep];
}

// ── Get or create onboarding progress for a user ─────────────────────────────

export async function getOrCreateOnboardingProgress(userId: number) {
  const [existing] = await db
    .select()
    .from(schema.onboardingProgress)
    .where(eq(schema.onboardingProgress.userId, userId))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(schema.onboardingProgress)
    .values({ userId, currentStep: 'welcome', stepsCompleted: {} })
    .returning();

  return created;
}

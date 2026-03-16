/**
 * Amber integration for Wellbeing
 *
 * Wellbeing pushes signals into Amber's Emotional and Physical health dimensions:
 *   - Mental health snapshots (mood, stress, relationship fulfillment)
 *   - Cognitive behavioral signals (typing rhythm, sleep fragmentation, social withdrawal)
 *   - Composite wellbeing scores with trend tracking
 *
 * These signals enable early detection of cognitive decline patterns and
 * ongoing mental health monitoring — 20+ years before clinical diagnosis.
 */

const AMBER_API_URL = process.env.NEXT_PUBLIC_AMBER_API_URL || 'https://api.amber.health';
const WELLBEING_WEBHOOK_SECRET = process.env.WELLBEING_AMBER_WEBHOOK_SECRET || '';

// ── Signal types ─────────────────────────────────────────────────────────────

export interface MentalHealthSnapshotSignal {
  type: 'mental_health_snapshot';
  moodScore: number;                   // 0–100
  stressLevel: number;                 // 0–100
  socialFulfillment: number;           // 0–100
  positiveRelationships: string[];     // anonymized relationship categories
  negativeRelationships: string[];     // anonymized relationship categories
}

export interface CognitiveSignal {
  type: 'cognitive_signal';
  typingRhythmChange: number;          // % deviation from baseline
  sleepFragmentation: number;          // fragmentation index 0–100
  socialWithdrawal: number;            // 0–100 (higher = more withdrawn)
  languageComplexityDelta: number;     // % change in language complexity over 90 days
}

export interface WellbeingScoreSignal {
  type: 'wellbeing_score';
  overallScore: number;                // 0–100
  mentalScore: number;                 // 0–100
  cognitiveScore: number;              // 0–100
  trend: 'improving' | 'stable' | 'declining';
}

export type WellbeingSignal =
  | MentalHealthSnapshotSignal
  | CognitiveSignal
  | WellbeingScoreSignal;

// ── Push to Amber ─────────────────────────────────────────────────────────────

export async function pushAmberSignal(
  amberUserId: string,
  signal: WellbeingSignal
): Promise<void> {
  try {
    const res = await fetch(`${AMBER_API_URL}/integrations/wellbeing/signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amber-User-Id': amberUserId,
        'X-Webhook-Secret': WELLBEING_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        source: 'wellbeing',
        timestamp: new Date().toISOString(),
        ...signal,
      }),
    });

    if (!res.ok) {
      console.error('[Amber] Signal push failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[Amber] Signal push error:', err);
  }
}

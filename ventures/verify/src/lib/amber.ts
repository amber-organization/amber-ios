/**
 * Amber integration for Verify
 *
 * Verify pushes signals into Amber's Emotional and Social health dimensions
 * (digital wellness as a measurable health outcome):
 *   - App ratings published (Healthy Tech Index scores)
 *   - Audit completions (Sentinel AI safety certifications)
 *
 * The premise: which technology you use is a health input. Verify makes
 * that relationship legible — first with data, then with cultural pressure.
 */

const AMBER_API_URL = process.env.NEXT_PUBLIC_AMBER_API_URL || 'https://api.amber.health';
const VERIFY_WEBHOOK_SECRET = process.env.VERIFY_AMBER_WEBHOOK_SECRET || '';

// ── Signal types ─────────────────────────────────────────────────────────────

export interface AppRatingPublishedSignal {
  type: 'app_rating_published';
  appName: string;
  score: number;                       // 0–100
  category: 'social' | 'health' | 'learning' | 'productivity' | 'entertainment' | 'finance';
  sampleSize: number;                  // number of Amber users contributing data
}

export interface AuditCompletedSignal {
  type: 'audit_completed';
  systemName: string;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'failed';
  findings: number;                    // number of findings raised
}

export type VerifySignal =
  | AppRatingPublishedSignal
  | AuditCompletedSignal;

// ── Push to Amber ─────────────────────────────────────────────────────────────

export async function pushAmberSignal(
  amberUserId: string,
  signal: VerifySignal
): Promise<void> {
  try {
    const res = await fetch(`${AMBER_API_URL}/integrations/verify/signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amber-User-Id': amberUserId,
        'X-Webhook-Secret': VERIFY_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        source: 'verify',
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

/**
 * Amber integration for Tally
 *
 * Tally (Monetize your friends, ethically) pushes signals into Amber's
 * Social and Financial health dimensions:
 *   - Referrals made within a trusted social circle
 *   - Conversions that reward both parties
 *   - Network trust and relationship quality metrics
 */

const AMBER_API_URL = process.env.NEXT_PUBLIC_AMBER_API_URL || 'https://api.amber.health';
const TALLY_WEBHOOK_SECRET = process.env.TALLY_AMBER_WEBHOOK_SECRET || '';

// ── Signal types ─────────────────────────────────────────────────────────────

export interface ReferralMadeSignal {
  type: 'referral_made';
  productCategory: string;       // e.g. 'skincare' | 'restaurants' | 'software'
  conversionValue?: number;      // estimated value of the referral opportunity
  fromFriend: boolean;           // was this rec made to a friend vs public
}

export interface ReferralConvertedSignal {
  type: 'referral_converted';
  rewardEarned: number;          // dollars earned from this referral
  relationshipStrength: 'close' | 'acquaintance' | 'extended'; // closeness of friend
}

export interface NetworkTrustScoreSignal {
  type: 'network_trust_score';
  score: number;                 // 0–100 trust score within Tally network
  activeReferrals: number;       // number of live referrals outstanding
  conversionRate: number;        // percent of referrals that converted (0–1)
}

export type TallySignal =
  | ReferralMadeSignal
  | ReferralConvertedSignal
  | NetworkTrustScoreSignal;

// ── Push to Amber ─────────────────────────────────────────────────────────────

export async function pushAmberSignal(
  amberUserId: string,
  signal: TallySignal
): Promise<void> {
  try {
    const res = await fetch(`${AMBER_API_URL}/integrations/tally/signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amber-User-Id': amberUserId,
        'X-Webhook-Secret': TALLY_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        source: 'tally',
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

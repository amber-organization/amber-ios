/**
 * Amber integration for D-NOB
 *
 * D-NOB (Dedicated Network of Belonging) pushes signals into Amber's
 * Emotional and Social health dimensions:
 *   - Peer connections formed during treatment
 *   - Community engagement and belonging
 *   - Support exchange between members
 *   - Check-in streaks and emotional availability
 */

const AMBER_API_URL = process.env.NEXT_PUBLIC_AMBER_API_URL || 'https://api.amber.health';
const DNOB_WEBHOOK_SECRET = process.env.DNOB_AMBER_WEBHOOK_SECRET || '';

// ── Signal types ─────────────────────────────────────────────────────────────

export interface PeerConnectionSignal {
  type: 'peer_connection';
  connectionFormed: boolean;
  sharedDiagnosis: boolean;       // peer shares same diagnosis
  treatmentPhase: string;         // 'pre_treatment' | 'active' | 'recovery' | 'survivorship'
  firstMessage: boolean;          // first message exchanged
  responseTimeMinutes?: number;
}

export interface CommunityEngagementSignal {
  type: 'community_engagement';
  postsThisWeek: number;
  repliesThisWeek: number;
  supportGiven: number;           // messages where member offered support
  supportReceived: number;        // messages where member received support
  checkInStreak: number;          // consecutive daily check-ins
}

export interface BelongingCheckInSignal {
  type: 'belonging_checkin';
  feltUnderstood: boolean;        // "did someone get what you're going through today?"
  feltLessAlone: boolean;
  moodRating?: number;            // 1–5
  connectedWithPeer: boolean;
}

export interface TreatmentSupportSignal {
  type: 'treatment_support';
  sharedUpdateWithCommunity: boolean;
  receivedEncouragement: boolean;
  helpedSomeoneToday: boolean;
  hospitalCheckIn?: string;       // hospital name (anonymized)
}

export type DnobSignal =
  | PeerConnectionSignal
  | CommunityEngagementSignal
  | BelongingCheckInSignal
  | TreatmentSupportSignal;

// ── Push to Amber ─────────────────────────────────────────────────────────────

export async function pushAmberSignal(
  amberUserId: string,
  signal: DnobSignal
): Promise<void> {
  try {
    const res = await fetch(`${AMBER_API_URL}/integrations/dnob/signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amber-User-Id': amberUserId,
        'X-Webhook-Secret': DNOB_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        source: 'dnob',
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

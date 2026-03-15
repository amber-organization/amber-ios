/**
 * Amber integration for The Archive
 *
 * The Archive pushes signals into Amber's Social health dimension
 * (used as a proxy for legacy, memory, and cultural continuity):
 *   - Archive deposits (content preserved with redundancy metadata)
 *   - Preservation milestones (integrity verified over time)
 *
 * The Archive treats human memory — personal and cultural — as a
 * health metric. What survives is what can be learned from.
 */

const AMBER_API_URL = process.env.NEXT_PUBLIC_AMBER_API_URL || 'https://api.amber.health';
const ARCHIVE_WEBHOOK_SECRET = process.env.ARCHIVE_AMBER_WEBHOOK_SECRET || '';

// ── Signal types ─────────────────────────────────────────────────────────────

export interface ArchiveDepositSignal {
  type: 'archive_deposit';
  contentType: 'text' | 'audio' | 'video' | 'image' | 'dataset' | 'software' | 'mixed';
  sizeBytes: number;
  redundancyLevel: 1 | 2 | 3;         // number of independent physical copies
}

export interface PreservationMilestoneSignal {
  type: 'preservation_milestone';
  yearsPreserved: number;              // how many years this item has been preserved
  integrityVerified: boolean;          // cryptographic hash still matches
}

export type ArchiveSignal =
  | ArchiveDepositSignal
  | PreservationMilestoneSignal;

// ── Push to Amber ─────────────────────────────────────────────────────────────

export async function pushAmberSignal(
  amberUserId: string,
  signal: ArchiveSignal
): Promise<void> {
  try {
    const res = await fetch(`${AMBER_API_URL}/integrations/the-archive/signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amber-User-Id': amberUserId,
        'X-Webhook-Secret': ARCHIVE_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        source: 'the-archive',
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

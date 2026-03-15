/**
 * Amber integration for Babel
 *
 * Babel (real-time universal translation) pushes signals into Amber's
 * Social and Emotional health dimensions:
 *   - Translation sessions with real people
 *   - Language barriers removed, new connections formed
 *   - Relationship context improving translation quality over time
 */

const AMBER_API_URL = process.env.NEXT_PUBLIC_AMBER_API_URL || 'https://api.amber.health';
const BABEL_WEBHOOK_SECRET = process.env.BABEL_AMBER_WEBHOOK_SECRET || '';

// ── Signal types ─────────────────────────────────────────────────────────────

export interface TranslationSessionSignal {
  type: 'translation_session';
  languagePair: string;          // e.g. 'es→en' | 'zh→fr'
  duration: number;              // session duration in seconds
  messageCount: number;          // number of messages translated in session
  familiarPerson: boolean;       // was this with someone in the user's relationship graph
}

export interface LanguageBarrierRemovedSignal {
  type: 'language_barrier_removed';
  newConnection: boolean;        // true if this was the first conversation with this person
  languagePair: string;          // languages bridged
}

export type BabelSignal =
  | TranslationSessionSignal
  | LanguageBarrierRemovedSignal;

// ── Push to Amber ─────────────────────────────────────────────────────────────

export async function pushAmberSignal(
  amberUserId: string,
  signal: BabelSignal
): Promise<void> {
  try {
    const res = await fetch(`${AMBER_API_URL}/integrations/babel/signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amber-User-Id': amberUserId,
        'X-Webhook-Secret': BABEL_WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        source: 'babel',
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

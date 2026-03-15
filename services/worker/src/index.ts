/**
 * Amber Background Worker
 *
 * Runs scheduled jobs:
 * - Memory extraction (Claude processes raw memories queued by the API)
 * - Relationship drift detection
 * - Proactive suggestions
 * - Signal generation (birthdays, check-ins)
 */

import { createServer } from 'http';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const sql = postgres(process.env.DATABASE_URL || '');
const db = drizzle(sql);

const PORT = process.env.PORT || 8081;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const WORKER_INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 60_000); // 1 min default

// ─── Health Server ─────────────────────────────────────────────────────────

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'running', service: 'amber-worker', uptime: process.uptime() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`[worker] Health server running on :${PORT}`);
});

// ─── Job: Extract memories ─────────────────────────────────────────────────

async function extractPendingMemories() {
  if (!ANTHROPIC_API_KEY) return;

  try {
    // Find memories without a summary (pending extraction)
    const pending = await sql<{ id: number; raw_content: string; user_id: number }[]>`
      SELECT id, raw_content, user_id FROM memories
      WHERE summary IS NULL
      ORDER BY created_at ASC
      LIMIT 10
    `;

    for (const memory of pending) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        let res: Response;
        try {
          res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 512,
              messages: [{
                role: 'user',
                content: `Extract a concise 1-2 sentence summary of this memory. Focus on the person, key fact, and emotional context.\n\nMemory: ${memory.raw_content}\n\nReturn only the summary text.`,
              }],
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!res.ok) continue;
        const data = await res.json() as any;
        const summary = (data.content as any[])
          ?.filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n')
          .trim();

        if (summary) {
          await sql`UPDATE memories SET summary = ${summary}, updated_at = NOW() WHERE id = ${memory.id}`;
          console.log(`[worker] Extracted memory #${memory.id}`);
        }
      } catch (err: any) {
        console.error(`[worker] Failed to extract memory #${memory.id}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error('[worker] extractPendingMemories error:', err.message);
  }
}

// ─── Job: Drift detection ──────────────────────────────────────────────────

async function detectRelationshipDrift() {
  try {
    // Find persons with no recent memory (30+ days)
    const drifting = await sql<{ id: number; name: string; user_id: number; last_memory: Date | null }[]>`
      SELECT p.id, p.name, p.user_id,
             MAX(m.created_at) as last_memory
      FROM persons p
      LEFT JOIN memories m ON ${sql`m.person_ids @> to_jsonb(p.id)`} AND m.user_id = p.user_id
      WHERE p.user_id IS NOT NULL
      GROUP BY p.id, p.name, p.user_id
      HAVING MAX(m.created_at) < NOW() - INTERVAL '30 days'
          OR MAX(m.created_at) IS NULL
      LIMIT 5
    `;

    for (const person of drifting) {
      const dedupeKey = `drift:${person.user_id}:${person.id}:${new Date().toISOString().substring(0, 7)}`; // once per month per person
      await sql`
        INSERT INTO signals (user_id, signal_type, trigger_date, status, payload, dedupe_key, created_at)
        VALUES (
          ${person.user_id},
          'questionnaire_match',
          NOW(),
          'pending',
          ${JSON.stringify({ personId: person.id, personName: person.name, signalKind: 'relationship_drift', reason: 'relationship_drift', lastMemory: person.last_memory })},
          ${dedupeKey},
          NOW()
        )
        ON CONFLICT (dedupe_key) DO NOTHING
      `;
      console.log(`[worker] Drift signal queued for ${person.name} (user ${person.user_id})`);
    }
  } catch (err: any) {
    console.error('[worker] detectRelationshipDrift error:', err.message);
  }
}

// ─── Main loop ─────────────────────────────────────────────────────────────

async function runJobs() {
  console.log(`[worker] Running jobs at ${new Date().toISOString()}`);
  await extractPendingMemories();
  await detectRelationshipDrift();
}

// Run immediately then on interval
runJobs();
setInterval(runJobs, WORKER_INTERVAL_MS);

console.log(`[worker] Amber background worker started. Interval: ${WORKER_INTERVAL_MS}ms`);

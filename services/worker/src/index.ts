/**
 * Amber Background Worker
 *
 * Runs scheduled jobs:
 * - Memory extraction (Claude processes raw memories queued by the API)
 * - Relationship drift detection
 * - Birthday signals
 * - Health score computation trigger
 * - Proactive check-in prompts for overdue action items
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const sql = postgres(process.env.DATABASE_URL || '');
const db = drizzle(sql);

const PORT = process.env.PORT || 8081;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const LOOP_API_KEY = process.env.LOOP_API_KEY || '';
const LOOP_SENDER_ID = process.env.LOOP_SENDER_ID || '';
const WORKER_INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 60_000); // 1 min default

// ─── Health Server ─────────────────────────────────────────────────────────

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'running', service: 'amber-worker', uptime: process.uptime() }));
    return;
  }

  // POST /extract — internal trigger to immediately run memory extraction
  if (req.url === '/extract' && req.method === 'POST') {
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    // Fire and forget — run extraction outside this request handler
    extractPendingMemories().catch((err: Error) => {
      console.error('[worker] /extract triggered extraction error:', err.message);
    });
    return;
  }

  res.writeHead(404);
  res.end();
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
                content: `Extract a concise 1-2 sentence summary of this memory. Focus on the person, key fact, and emotional context.\n\nMemory: ${memory.raw_content.slice(0, 8000)}\n\nReturn only the summary text.`,
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

// ─── Job: Birthday signals ─────────────────────────────────────────────────

async function queueBirthdaySignals() {
  try {
    // Find persons whose birthday (dob) falls within the next 7 days.
    // Compare month+day only, ignoring year.
    const upcoming = await sql<{ id: number; name: string; user_id: number; dob: string }[]>`
      SELECT id, name, user_id, dob::text
      FROM persons
      WHERE user_id IS NOT NULL
        AND dob IS NOT NULL
        AND (
          TO_CHAR(dob, 'MM-DD') >= TO_CHAR(NOW(), 'MM-DD')
          AND TO_CHAR(dob, 'MM-DD') <= TO_CHAR(NOW() + INTERVAL '7 days', 'MM-DD')
        )
      LIMIT 20
    `;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    for (const person of upcoming) {
      // Compute days until birthday
      const dobDate = new Date(person.dob);
      const nextBirthday = new Date(year, dobDate.getUTCMonth(), dobDate.getUTCDate());
      if (nextBirthday < now) nextBirthday.setFullYear(year + 1);
      const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Dedupe: once per year per person per month
      const dedupeKey = `birthday:${person.user_id}:${person.id}:${year}-${month}`;

      await sql`
        INSERT INTO signals (user_id, signal_type, trigger_date, status, payload, dedupe_key, created_at)
        VALUES (
          ${person.user_id},
          'questionnaire_match',
          NOW(),
          'pending',
          ${JSON.stringify({ personId: person.id, personName: person.name, signalKind: 'birthday_upcoming', daysUntil })},
          ${dedupeKey},
          NOW()
        )
        ON CONFLICT (dedupe_key) DO NOTHING
      `;
      console.log(`[worker] Birthday signal queued for ${person.name} (user ${person.user_id}, ${daysUntil} days)`);
    }
  } catch (err: any) {
    console.error('[worker] queueBirthdaySignals error:', err.message);
  }
}

// ─── Job: Health score computation trigger ────────────────────────────────

async function computeHealthScores() {
  try {
    // Find pending signals created in the last 5 minutes
    const pendingSignals = await sql<{ id: number; user_id: number; payload: any }[]>`
      SELECT id, user_id, payload
      FROM signals
      WHERE status = 'pending'
        AND created_at > NOW() - INTERVAL '5 minutes'
      LIMIT 20
    `;

    if (pendingSignals.length === 0) return;

    // Group signal IDs by user
    const byUser = new Map<number, number[]>();
    for (const sig of pendingSignals) {
      const ids = byUser.get(sig.user_id) ?? [];
      ids.push(sig.id);
      byUser.set(sig.user_id, ids);
    }

    for (const [userId, signalIds] of byUser) {
      try {
        // Derive dimension from signal payload — default to 'social' for relationship signals
        const dimension = 'social';
        const score = Math.min(100, signalIds.length * 10); // simple placeholder scoring

        await sql`
          INSERT INTO health_scores (user_id, dimension, score, updated_at)
          VALUES (${userId}, ${dimension}, ${score}, NOW())
          ON CONFLICT (user_id, dimension) DO UPDATE
            SET score = EXCLUDED.score, updated_at = NOW()
        `;

        // Mark signals as processed
        await sql`
          UPDATE signals
          SET status = 'processed'
          WHERE id = ANY(${signalIds}::int[])
        `;

        console.log(`[worker] Health score updated for user ${userId} (${dimension}: ${score})`);
      } catch (err: any) {
        console.error(`[worker] Health score update failed for user ${userId}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error('[worker] computeHealthScores error:', err.message);
  }
}

// ─── Job: Proactive check-in prompts ──────────────────────────────────────

async function sendCheckinPrompts() {
  // Skip entirely if Loop API is not configured
  if (!LOOP_API_KEY || !LOOP_SENDER_ID) return;

  try {
    // Find overdue action items that require approval and are still open
    const overdue = await sql<{ id: number; user_id: number; content: string; due_at: Date }[]>`
      SELECT ai.id, ai.user_id, ai.content, ai.due_at
      FROM action_items ai
      WHERE ai.status = 'open'
        AND ai.requires_approval = true
        AND ai.due_at < NOW()
      LIMIT 10
    `;

    for (const item of overdue) {
      try {
        // Look up the user's phone number
        const [profile] = await sql<{ phone: string | null }[]>`
          SELECT phone FROM user_profiles WHERE user_id = ${item.user_id} LIMIT 1
        `;

        if (!profile?.phone) continue;

        const prompt = `Hey! Just a heads-up — you have an overdue item that needs your approval: "${item.content.slice(0, 200)}". Want to take care of it now?`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
          const res = await fetch('https://a.loopmessage.com/api/v1/message/send/', {
            method: 'POST',
            headers: {
              Authorization: LOOP_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contact: profile.phone,
              text: prompt,
              sender: LOOP_SENDER_ID,
            }),
            signal: controller.signal,
          });
          if (!res.ok) {
            console.error(`[worker] Loop send failed for action_item #${item.id}: HTTP ${res.status}`);
          } else {
            console.log(`[worker] Check-in prompt sent for action_item #${item.id} (user ${item.user_id})`);
          }
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err: any) {
        console.error(`[worker] Failed to send check-in for action_item #${item.id}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error('[worker] sendCheckinPrompts error:', err.message);
  }
}

// ─── Main loop ─────────────────────────────────────────────────────────────

async function runJobs() {
  console.log(`[worker] Running jobs at ${new Date().toISOString()}`);
  await extractPendingMemories();
  await detectRelationshipDrift();
  await queueBirthdaySignals();
  await computeHealthScores();
  await sendCheckinPrompts();
}

// Run immediately then on interval
runJobs();
setInterval(runJobs, WORKER_INTERVAL_MS);

console.log(`[worker] Amber background worker started. Interval: ${WORKER_INTERVAL_MS}ms`);

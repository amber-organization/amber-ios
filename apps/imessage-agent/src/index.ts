/**
 * Amber iMessage Agent — multi-user entry point.
 *
 * Routes inbound Loop Message webhooks to the correct user based on phone number,
 * loads their personalized context, calls Claude, and replies via Loop.
 *
 * Users are seeded into the amber database. Phone-to-user routing is configured
 * via environment variables (CALEB_PHONE, SAGAR_PHONE, etc.).
 */

import { createServer } from 'http'
import crypto from 'crypto'
import { PORT, USERS_BY_PHONE } from './config.js'
import { loadContext } from './context.js'
import { buildSystemPrompt } from './prompts.js'
import { callClaude } from './claude.js'
import { sendMessage } from './loop.js'
import { logExchange } from './logger.js'
import { getHistory, addUserMessage, addAssistantMessage } from './conversation.js'

// ─── State ────────────────────────────────────────────────────────────────────

const seenMessageIds = new Map<string, number>();
const DEDUP_TTL_MS = 60 * 60 * 1000; // 1 hour

function isDuplicate(messageId: string): boolean {
  const now = Date.now();
  // Evict expired entries
  for (const [id, ts] of seenMessageIds) {
    if (now - ts > DEDUP_TTL_MS) seenMessageIds.delete(id);
  }
  if (seenMessageIds.has(messageId)) return true;
  seenMessageIds.set(messageId, now);
  return false;
}

function redactPhone(phone: string): string {
  if (!phone || phone.length < 5) return '***';
  // Keep country code prefix (+1, +44, etc.) and last 4 digits
  const match = phone.match(/^(\+\d{1,3}).*(\d{4})$/);
  if (match) return `${match[1]}***${match[2]}`;
  return `***${phone.slice(-4)}`;
}

let requestCount = 0
const startTime = Date.now()

// ─── Webhook Handler ──────────────────────────────────────────────────────────

interface LoopWebhookPayload {
  event: string
  contact: string   // E.164 phone number of the sender
  text: string
  message_id?: string
  sender?: string
}

async function handleInbound(payload: LoopWebhookPayload): Promise<void> {
  const { contact, text, message_id } = payload

  // Deduplicate
  if (message_id) {
    if (isDuplicate(message_id)) {
      console.log(`[webhook] duplicate message_id ${message_id}, skipping`)
      return
    }
  }

  // Route to user
  const user = USERS_BY_PHONE.get(contact)
  if (!user) {
    console.warn(`[webhook] unknown phone ${redactPhone(contact)} — no user configured`)
    return
  }

  console.log(`[${user.name}] → "${text.substring(0, 80)}"`)

  // Load context (cached)
  const context = await loadContext(user)

  // Build conversation messages
  const history = getHistory(user.dbUserId)
  addUserMessage(user.dbUserId, text)
  const messages = getHistory(user.dbUserId)

  // Call Claude
  const systemPrompt = buildSystemPrompt(user, context)
  const reply = await callClaude(systemPrompt, messages)

  // Store reply in history
  addAssistantMessage(user.dbUserId, reply)

  // Send via Loop
  await sendMessage(contact, user.loopSender, reply)
  console.log(`[${user.name}] ← "${reply.substring(0, 80)}"`)

  // Log to GitHub (non-blocking)
  void logExchange(user, text, reply)
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = ''
    req.on('data', chunk => { body += chunk.toString() })
    req.on('end', () => {
      // HMAC signature verification
      const secret = process.env.LOOP_WEBHOOK_SECRET;
      if (secret) {
        const sig = req.headers['loop-signature'] as string | undefined;
        if (!sig) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Missing signature' }))
          return
        }
        let parsedBody: unknown
        try {
          parsedBody = JSON.parse(body)
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
          return
        }
        const expected = crypto.createHmac('sha256', secret)
          .update(JSON.stringify(parsedBody))
          .digest('hex');
        const sigBuf = Buffer.from(sig)
        const expBuf = Buffer.from(expected)
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid signature' }))
          return
        }
      }

      // Respond immediately so Loop doesn't retry
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ received: true }))

      try {
        const payload = JSON.parse(body) as LoopWebhookPayload
        if (payload.event === 'message_inbound' && payload.text) {
          requestCount++
          handleInbound(payload).catch(err => {
            console.error(`[webhook] error:`, err.message)
            // Best-effort error reply to the user
            const user = USERS_BY_PHONE.get(payload.contact)
            if (user) {
              sendMessage(payload.contact, user.loopSender, 'Something went wrong on my end — try again in a moment.')
                .catch(() => {})
            }
          })
        }
      } catch (err) {
        console.error('[webhook] parse error:', (err as Error).message)
      }
    })
    return
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
    }))
    return
  }

  res.writeHead(200)
  res.end('Amber is running.')
})

server.listen(PORT, () => {
  const users = Array.from(USERS_BY_PHONE.values()).map(u => `${u.name} (${redactPhone(u.phone)})`).join(', ')
  console.log(`🌟 Amber iMessage Agent`)
  console.log(`   Listening on :${PORT}`)
  console.log(`   Users: ${users}`)
  console.log(`   Webhook: POST /webhook`)
  console.log(`   Health:  GET  /health`)
})

/**
 * Claude API client — single-turn and multi-turn messaging.
 */

import { ANTHROPIC_API_KEY, CLAUDE_MODEL } from './config.js'
import type { Message } from './conversation.js'

interface ClaudeBlock {
  type: string
  text?: string
}

interface ClaudeResponse {
  content: ClaudeBlock[]
  stop_reason: string
}

export async function callClaude(
  systemPrompt: string,
  messages: Message[],
): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Claude API error ${res.status}: ${err}`)
    }

    const data = await res.json() as ClaudeResponse
    return data.content
      .filter(b => b.type === 'text')
      .map(b => b.text ?? '')
      .join('\n')
      .trim()
  } finally {
    clearTimeout(timeoutId)
  }
}

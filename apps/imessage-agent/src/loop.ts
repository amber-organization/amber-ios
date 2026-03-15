/**
 * Loop Message API client — send iMessages via Loop.
 */

import { LOOP_API_KEY } from './config.js'

const MAX_LENGTH = 2000

export async function sendMessage(to: string, sender: string, text: string): Promise<void> {
  const body = text.length > MAX_LENGTH
    ? text.substring(0, MAX_LENGTH - 30) + '\n\n[Message truncated]'
    : text

  const res = await fetch('https://a.loopmessage.com/api/v1/message/send/', {
    method: 'POST',
    headers: {
      'Authorization': LOOP_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contact: to, text: body, sender }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Loop Message error ${res.status}: ${err}`)
  }
}

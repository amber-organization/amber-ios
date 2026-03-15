/**
 * Log a conversation turn back to the user's GitHub messages file.
 * This keeps a durable record of every exchange — same pattern as the standalone agents.
 */

import { readFile, writeFile } from './github.js'
import type { UserConfig } from './config.js'

export async function logExchange(
  user: UserConfig,
  userMessage: string,
  amberReply: string,
): Promise<void> {
  try {
    const result = await readFile(user.messagesRepo, user.messagesFile)
    const existing = result.success ? result.content : `# ${user.name} ↔ Amber Messages\n\n`
    const sha = result.success ? result.sha : undefined

    const now = new Date().toISOString()
    const entry = `\n---\n\n**From:** ${user.name}\n**Timestamp:** ${now}\n\n${userMessage}\n\n**From:** Amber\n**Timestamp:** ${now}\n\n${amberReply}\n`

    await writeFile(
      user.messagesRepo,
      user.messagesFile,
      existing + entry,
      `Amber exchange with ${user.name} at ${now.substring(0, 10)}`,
      sha,
    )
  } catch (err) {
    // Non-fatal — logging failure should never crash the response loop
    console.error('[logger] Failed to log exchange:', (err as Error).message)
  }
}

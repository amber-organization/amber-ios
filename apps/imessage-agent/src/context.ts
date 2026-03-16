/**
 * Per-user context loader — reads markdown files from a user's GitHub context repo.
 * Results are cached for 10 minutes so we don't hammer the GitHub API.
 */

import { readFile } from './github.js'
import type { UserConfig } from './config.js'

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const cache = new Map<number, { text: string; expiry: number }>()

const CALEB_FILES = [
  'WHO_IS_CALEB.md',
  'CALEB_WORKING_STYLE_AND_PREFERENCES.md',
  'CALEB_TECHNICAL_JOURNEY.md',
  'CURRENT_CONTEXT_JAN_2026.md',
  'TASKS.md',
  'CONVERSATION_PATTERNS.md',
]

const SAGAR_FILES = [
  'who-is-sagar.md',
  'current-context.md',
  'values-and-philosophy.md',
  'relationships-overview.md',
  'active-projects.md',
]

const CONTEXT_FILES: Record<number, string[]> = {
  1: CALEB_FILES,
  2: SAGAR_FILES,
}

export async function loadContext(user: UserConfig): Promise<string> {
  const cached = cache.get(user.dbUserId)
  if (cached && Date.now() < cached.expiry) return cached.text

  const files = CONTEXT_FILES[user.dbUserId] ?? []
  let text = ''

  for (const file of files) {
    const result = await readFile(user.contextRepo, file)
    if (result.success) {
      text += `\n\n# ${file}\n\n${result.content}`
    }
  }

  cache.set(user.dbUserId, { text, expiry: Date.now() + CACHE_TTL })
  return text
}

export function invalidateContext(userId: number) {
  cache.delete(userId)
}

/**
 * Environment-based user configuration.
 *
 * Two users are hard-configured: Caleb (User #1) and Sagar (User #2).
 * Phone numbers are loaded from ENV so they never live in source code.
 */

export interface UserConfig {
  /** amber database user ID */
  dbUserId: number
  /** Display name */
  name: string
  /** E.164 phone number — used to route inbound webhooks */
  phone: string
  /** Loop Message sender address (the @imsg.co address this user is reached on) */
  loopSender: string
  /** GitHub repo where context files live */
  contextRepo: string
  /** GitHub repo where the conversation log (MESSAGES file) is written */
  messagesRepo: string
  /** Filename of the conversation log inside messagesRepo */
  messagesFile: string
  /** Spiritual/philosophical worldview (used in system prompt) */
  worldview: string
}

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export const USERS_BY_PHONE = new Map<string, UserConfig>()

function registerUser(config: UserConfig) {
  USERS_BY_PHONE.set(config.phone, config)
}

registerUser({
  dbUserId: 1,
  name: 'Caleb',
  phone: required('CALEB_PHONE'),
  loopSender: required('CALEB_LOOP_SENDER'),
  contextRepo: process.env.CALEB_CONTEXT_REPO ?? 'calebnewtonusc/claude-context',
  messagesRepo: process.env.CALEB_MESSAGES_REPO ?? 'calebnewtonusc/claude-context',
  messagesFile: process.env.CALEB_MESSAGES_FILE ?? 'LOOP_MESSAGES.md',
  worldview: 'traditional Christian faith',
})

registerUser({
  dbUserId: 2,
  name: 'Sagar',
  phone: required('SAGAR_PHONE'),
  loopSender: required('SAGAR_LOOP_SENDER'),
  contextRepo: process.env.SAGAR_CONTEXT_REPO ?? 'calebnewtonusc/sagar-context',
  messagesRepo: process.env.SAGAR_MESSAGES_REPO ?? 'calebnewtonusc/sagar-amber-messages',
  messagesFile: process.env.SAGAR_MESSAGES_FILE ?? 'AMBER_MESSAGES.md',
  worldview: 'Hindu philosophy and spirituality',
})

export const ANTHROPIC_API_KEY = required('ANTHROPIC_API_KEY')
export const GITHUB_TOKEN = required('GITHUB_TOKEN')
export const LOOP_API_KEY = required('LOOP_API_KEY')
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'
export const PORT = parseInt(process.env.PORT ?? '3000', 10)

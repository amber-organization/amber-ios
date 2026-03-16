/**
 * In-memory conversation history per user.
 * Keeps the last 20 turns (40 messages) to maintain coherent multi-turn context.
 */

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

const MAX_MESSAGES = 40

const store = new Map<number, Message[]>()

export function getHistory(userId: number): Message[] {
  return store.get(userId) ?? []
}

export function addUserMessage(userId: number, text: string) {
  push(userId, { role: 'user', content: text.slice(0, 4000) })
}

export function addAssistantMessage(userId: number, text: string) {
  push(userId, { role: 'assistant', content: text.slice(0, 4000) })
}

function push(userId: number, message: Message) {
  const history = store.get(userId) ?? []
  history.push(message)
  if (history.length > MAX_MESSAGES) history.splice(0, history.length - MAX_MESSAGES)
  store.set(userId, history)
}

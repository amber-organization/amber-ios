/**
 * Thin GitHub REST API client — read and write files in any repo.
 */

import { GITHUB_TOKEN } from './config.js'

function headers() {
  return {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  }
}

export interface FileResult {
  success: true
  content: string
  sha: string
}

export interface FileError {
  success: false
  error: string
}

export async function readFile(repo: string, path: string): Promise<FileResult | FileError> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers: headers(), signal: controller.signal })
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` }
    const data = await res.json() as { content: string; sha: string }
    return {
      success: true,
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      sha: data.sha,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function writeFile(
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<{ success: true; sha: string } | { success: false; error: string }> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
  }
  if (sha) body.sha = sha

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `HTTP ${res.status}: ${err}` }
    }

    const data = await res.json() as { content: { sha: string } }
    return { success: true, sha: data.content.sha }
  } finally {
    clearTimeout(timeoutId)
  }
}

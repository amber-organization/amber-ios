import { URL } from 'url';
import { registerNode } from '../engine.js';

const PRIVATE_IP_REGEX = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|::1|fc00:|fe80:)/;

function isSafeUrl(urlString: string): boolean {
  try {
    const u = new URL(urlString);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    if (PRIVATE_IP_REGEX.test(u.hostname)) return false;
    if (u.hostname === 'localhost') return false;
    return true;
  } catch {
    return false;
  }
}

registerNode('http.fetch', async (_input, cfg) => {
  const url = String((cfg as any).url);
  const method = String((cfg as any).method || 'GET');
  const headers = (cfg as any).headers || {};
  const body = (cfg as any).body;

  if (!isSafeUrl(url)) {
    return { error: 'URL is not allowed (SSRF protection)', status: 0, headers: {}, body: '' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
    const text = await res.text();
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: text };
  } finally {
    clearTimeout(timeoutId);
  }
});

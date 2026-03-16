/**
 * Next.js proxy routes for /chat and /chat/history.
 *
 * Why: the backend requires Authorization: Bearer <token>, but Auth0
 * session tokens live server-side. Client components can't access them
 * directly, so these routes act as authenticated proxies.
 */

import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.amber.health';

async function getToken(): Promise<string | null> {
  try {
    const { accessToken } = await getAccessToken();
    return accessToken ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const raw = await req.json();
  const message = typeof raw?.message === 'string' ? raw.message.slice(0, 4000) : '';
  const channel = typeof raw?.channel === 'string' ? raw.channel.slice(0, 20) : undefined;
  if (!message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  const body = { message, ...(channel ? { channel } : {}) };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_URL}/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } finally {
    clearTimeout(timeoutId);
  }
}

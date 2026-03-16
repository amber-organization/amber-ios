import { NextRequest, NextResponse } from 'next/server';

const AMBER_API_URL = process.env.AMBER_API_URL || 'https://api.amber.health';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const res = await fetch(`${AMBER_API_URL}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        name: name?.trim() || undefined,
        venture: 'tally',
        joinedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[Tally] Waitlist POST failed:', res.status, text);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 502 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[Tally] Waitlist route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

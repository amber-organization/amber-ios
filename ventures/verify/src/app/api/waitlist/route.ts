import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email } = body as { email?: string };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || email.length > 254 || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Forward to Amber backend
  const apiUrl = process.env.AMBER_API_URL || 'https://api.amber.health';
  try {
    await fetch(`${apiUrl}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, venture: 'verify' }),
    });
  } catch {
    // Non-fatal — log server side but return success to user
    console.error('[waitlist] Failed to forward to Amber API');
  }

  return NextResponse.json({ success: true });
}

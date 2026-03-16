import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.amber.health';

const MOCK_PEOPLE = [
  { id: 'mom', name: 'Mom', type: 'family', lastContact: '2 days ago', strength: 92 },
  { id: 'sagar', name: 'Sagar', type: 'co-founder', lastContact: 'today', strength: 88 },
  { id: 'isaac', name: 'Isaac', type: 'collaborator', lastContact: '3 days ago', strength: 75 },
  { id: 'marcus', name: 'Marcus', type: 'friend', lastContact: '2 weeks ago', strength: 61 },
  { id: 'dr-patel', name: 'Dr. Patel', type: 'doctor', lastContact: '1 month ago', strength: 45 },
];

async function getToken(): Promise<string | null> {
  try {
    const { accessToken } = await getAccessToken();
    return accessToken ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${API_URL}/persons`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(MOCK_PEOPLE);
  }
}

export async function POST(req: Request) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${API_URL}/persons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}

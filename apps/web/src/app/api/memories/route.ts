import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.amber.health';

const MOCK_MEMORIES = [
  {
    id: 'm1',
    date: '2026-03-15',
    content: 'Had a really good workout this morning — ran 3 miles and felt energized all day.',
    summary: 'Morning run, high energy day',
    people: [],
    source: 'manual',
  },
  {
    id: 'm2',
    date: '2026-03-14',
    content: 'Long call with Mom about the family reunion plans. She seemed stressed about coordinating everyone.',
    summary: 'Family reunion planning call with Mom',
    people: ['Mom'],
    source: 'manual',
  },
  {
    id: 'm3',
    date: '2026-03-13',
    content: 'Sagar and I finally aligned on the product roadmap. Feeling good about Q2 trajectory.',
    summary: 'Product roadmap alignment with Sagar',
    people: ['Sagar'],
    source: 'manual',
  },
  {
    id: 'm4',
    date: '2026-03-11',
    content: 'Slept terribly — maybe 4 hours. Kept waking up thinking about the pitch deck.',
    summary: 'Poor sleep, work anxiety',
    people: [],
    source: 'manual',
  },
  {
    id: 'm5',
    date: '2026-03-09',
    content: 'Checkup with Dr. Patel. Blood pressure slightly elevated, recommended cutting back on caffeine.',
    summary: 'Doctor checkup — blood pressure flag',
    people: ['Dr. Patel'],
    source: 'manual',
  },
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
    const res = await fetch(`${API_URL}/memories`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(MOCK_MEMORIES);
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
    const res = await fetch(`${API_URL}/memories`, {
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
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 });
  }
}

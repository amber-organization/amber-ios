import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.amber.health';

const MOCK_SCORES = {
  physical: 72,
  emotional: 68,
  social: 81,
  financial: 55,
  sleep: 63,
  overall: 73,
};

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
    const res = await fetch(`${API_URL}/health-scores`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    // Return mock data if API fails
    return NextResponse.json(MOCK_SCORES);
  }
}

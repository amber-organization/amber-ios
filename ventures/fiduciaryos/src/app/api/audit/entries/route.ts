import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.FIDUCIARY_PYTHON_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawLimit = new URL(req.url).searchParams.get("limit") ?? "20";
  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 100);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${PYTHON_API}/audit/entries?limit=${limit}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ entries: [], offline: true }, { status: 200 });
  }
}

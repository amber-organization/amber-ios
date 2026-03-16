import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.FIDUCIARY_PYTHON_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${PYTHON_API}/risk/status`, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ risk_level: 0, alerts: [], offline: true }, { status: 200 });
  }
}

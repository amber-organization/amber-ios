import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PROFILE } from "@/lib/types";
import { requireAuth } from "@/lib/auth";

const PROFILE_ID = "fiduciaryos";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // Dynamic import to avoid build errors when Supabase is not configured
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ profile: null, configured: false });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("profile")
    .eq("id", PROFILE_ID)
    .single();

  if (error || !data?.profile) {
    return NextResponse.json({ profile: DEFAULT_PROFILE, configured: true });
  }

  return NextResponse.json({ profile: data.profile, configured: true });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let profile: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 50_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    profile = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof profile !== "object" || profile === null || Array.isArray(profile)) {
    return NextResponse.json({ error: "profile must be an object" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    // Supabase not configured — profile is persisted in browser localStorage only
    return NextResponse.json({ success: true, configured: false });
  }

  const { error } = await supabase
    .from("user_profiles")
    .upsert({ id: PROFILE_ID, profile, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true, configured: true });
}

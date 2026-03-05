// ═══════════════════════════════════════════════════════════════
// /api/admin/chat/config — Chat configuration (auto-replies, FAQs, etc.)
// GET  — Read chat config
// POST — Update chat config
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("chat_config")
      .select("*")
      .eq("id", "default")
      .single();

    if (error && error.code === "42P01") {
      return NextResponse.json({ config: null, _info: "Table not created yet" });
    }
    if (error) throw error;

    return NextResponse.json({ config: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("chat_config")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

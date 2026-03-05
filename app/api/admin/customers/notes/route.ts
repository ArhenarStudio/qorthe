// ═══════════════════════════════════════════════════════════════
// /api/admin/customers/notes — Customer internal notes CRUD
//
// GET  — List notes for a customer (by email)
// POST — Add a note
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const { data, error } = await getSupabaseAdmin()
      .from("customer_notes")
      .select("*")
      .eq("customer_email", email.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      // Table may not exist yet — return empty gracefully
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({ notes: [], _info: "Table customer_notes not created yet" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, text } = await req.json();
    if (!email || !text) {
      return NextResponse.json({ error: "email and text required" }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("customer_notes")
      .insert({
        customer_email: email.toLowerCase(),
        text: text.trim(),
        author: "Admin",
      })
      .select()
      .single();

    if (error) {
      console.error("[Customer Notes POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

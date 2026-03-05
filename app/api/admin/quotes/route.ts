// /api/admin/quotes — Quotation management (Supabase)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: quotes, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error && error.code === "42P01") {
      return NextResponse.json({ quotes: [], stats: { total: 0 }, _info: "Table not created yet. Run quotes SQL." });
    }
    if (error) throw error;

    const stats = {
      total: (quotes || []).length,
      pending: (quotes || []).filter((q: any) => q.status === "pending").length,
      approved: (quotes || []).filter((q: any) => q.status === "approved").length,
      totalValue: (quotes || []).reduce((s: number, q: any) => s + (q.total || 0), 0),
    };

    return NextResponse.json({ quotes: quotes || [], stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();
    const { data, error } = await supabase.from("quotes").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, quote: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const supabase = getSupabase();
    const { error } = await supabase.from("quotes").update(updates).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

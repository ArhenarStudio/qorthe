// ═══════════════════════════════════════════════════════════
// API: /api/admin/alerts
// GET  → list unresolved alerts (for workspace)
// PATCH → resolve an alert by id
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

// GET /api/admin/alerts?type=stock_low&limit=10
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const includeResolved = searchParams.get("resolved") === "true";

    let query = supabase
      .from("admin_alerts")
      .select("*")
      .order("severity", { ascending: true }) // critical first
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!includeResolved) {
      query = query.eq("resolved", false);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alerts: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/alerts — resolve an alert
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { id, resolved } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("admin_alerts")
      .update({
        resolved: resolved ?? true,
        resolved_at: resolved !== false ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

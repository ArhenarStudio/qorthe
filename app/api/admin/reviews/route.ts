// ═══════════════════════════════════════════════════════════════
// /api/admin/reviews — Admin Review Moderation via Supabase
//
// GET    — List all reviews (all statuses) with filters
// PATCH  — Approve/reject review, add admin reply
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

// GET: List all reviews for admin moderation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // pending, approved, rejected, or null for all
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = getSupabaseAdmin()
      .from("reviews")
      .select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get counts per status for badges
    const [pending, approved, rejected] = await Promise.all([
      getSupabaseAdmin().from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      getSupabaseAdmin().from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
      getSupabaseAdmin().from("reviews").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    ]);

    return NextResponse.json({
      reviews: data || [],
      total: count || 0,
      counts: {
        pending: pending.count ?? 0,
        approved: approved.count ?? 0,
        rejected: rejected.count ?? 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Moderate a review (approve, reject, reply)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { review_id, action, admin_reply } = body;

    if (!review_id) {
      return NextResponse.json({ error: "review_id required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};

    if (action === "approve") {
      updates.status = "approved";
    } else if (action === "reject") {
      updates.status = "rejected";
    }

    if (admin_reply !== undefined) {
      updates.admin_reply = admin_reply || null;
      updates.admin_reply_at = admin_reply ? new Date().toISOString() : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid action provided" }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("reviews")
      .update(updates)
      .eq("id", review_id)
      .select()
      .single();

    if (error) {
      console.error("[Admin Reviews PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

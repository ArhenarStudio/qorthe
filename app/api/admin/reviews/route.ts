// ═══════════════════════════════════════════════════════════════
// /api/admin/reviews — Admin Review Moderation via Supabase
// Fase 12.Reviews: Pro SaaS level — search, bulk, export, stats
//
// GET    — List reviews with filters, search, pagination
// PATCH  — Approve/reject review, add admin reply
// POST   — Bulk actions (approve/reject multiple)
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
    const status = searchParams.get("status"); // pending, approved, rejected, or null
    const search = searchParams.get("search"); // search by user_name or product_title
    const rating = searchParams.get("rating"); // filter by rating (1-5)
    const hasPhotos = searchParams.get("has_photos"); // "true" to filter only with photos
    const sortBy = searchParams.get("sort") || "created_at"; // created_at, rating, helpful_count
    const sortDir = searchParams.get("dir") || "desc"; // asc or desc
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const exportCsv = searchParams.get("export") === "csv";

    // For CSV export, fetch all (up to 5000)
    const fetchLimit = exportCsv ? 5000 : limit;
    const fetchOffset = exportCsv ? 0 : offset;

    let query = getSupabaseAdmin()
      .from("reviews")
      .select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (rating) {
      query = query.eq("rating", parseInt(rating));
    }

    if (hasPhotos === "true") {
      // Filter reviews that have at least one photo
      query = query.not("photos", "eq", "{}");
    }

    if (search) {
      // Search in user_name, product_title, title, body
      query = query.or(
        `user_name.ilike.%${search}%,product_title.ilike.%${search}%,title.ilike.%${search}%,body.ilike.%${search}%`
      );
    }

    // Validate sort column
    const validSorts = ["created_at", "rating", "helpful_count", "updated_at"];
    const safeSort = validSorts.includes(sortBy) ? sortBy : "created_at";

    const { data, error, count } = await query
      .order(safeSort, { ascending: sortDir === "asc" })
      .range(fetchOffset, fetchOffset + fetchLimit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // CSV export
    if (exportCsv) {
      const csvRows = [
        ["ID", "Fecha", "Cliente", "Producto", "Rating", "Título", "Reseña", "Estado", "Fotos", "Respuesta Admin", "Votos Útil"].join(","),
        ...(data || []).map((r) =>
          [
            r.id,
            new Date(r.created_at).toISOString().split("T")[0],
            `"${(r.user_name || "").replace(/"/g, '""')}"`,
            `"${(r.product_title || "").replace(/"/g, '""')}"`,
            r.rating,
            `"${(r.title || "").replace(/"/g, '""')}"`,
            `"${(r.body || "").replace(/"/g, '""')}"`,
            r.status,
            (r.photos || []).length,
            `"${(r.admin_reply || "").replace(/"/g, '""')}"`,
            r.helpful_count || 0,
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvRows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="reviews-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Get counts per status for badges
    const [pending, approved, rejected] = await Promise.all([
      getSupabaseAdmin().from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      getSupabaseAdmin().from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
      getSupabaseAdmin().from("reviews").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    ]);

    // Rating distribution (across ALL reviews, not filtered)
    const { data: allForStats } = await getSupabaseAdmin()
      .from("reviews")
      .select("rating");

    const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: (allForStats || []).filter((r) => r.rating === star).length,
    }));

    const totalAll = allForStats?.length || 0;
    const avgRating = totalAll > 0
      ? Number(((allForStats || []).reduce((s, r) => s + r.rating, 0) / totalAll).toFixed(1))
      : 0;

    // Photos count
    const { data: withPhotos } = await getSupabaseAdmin()
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .not("photos", "eq", "{}");

    return NextResponse.json({
      reviews: data || [],
      total: count || 0,
      page: Math.floor(fetchOffset / limit) + 1,
      totalPages: Math.ceil((count || 0) / limit),
      counts: {
        pending: pending.count ?? 0,
        approved: approved.count ?? 0,
        rejected: rejected.count ?? 0,
      },
      stats: {
        avgRating,
        totalReviews: totalAll,
        ratingDistribution: ratingDist,
        withPhotos: withPhotos?.length ?? 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Moderate a single review (approve, reject, reply)
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

// POST: Bulk actions on multiple reviews
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, review_ids } = body;

    if (!action || !Array.isArray(review_ids) || review_ids.length === 0) {
      return NextResponse.json({ error: "action and review_ids[] required" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { data, error } = await getSupabaseAdmin()
      .from("reviews")
      .update({ status: newStatus })
      .in("id", review_ids)
      .select("id");

    if (error) {
      console.error("[Admin Reviews POST bulk]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action,
      updated: data?.length || 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

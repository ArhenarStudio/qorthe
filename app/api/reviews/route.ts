// ═══════════════════════════════════════════════════════════════
// /api/reviews — Product Reviews CRUD via Supabase
//
// GET    — List reviews for a product (public: approved only, owner: all)
// POST   — Create a review (authenticated)
// PUT    — Update own pending review
// DELETE — Delete own review
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

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET: Reviews for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    const userId = searchParams.get("user_id");

    let query = getSupabaseAdmin().from("reviews").select("*");

    if (productId) {
      query = query.eq("product_id", productId).eq("status", "approved");
    } else if (userId) {
      // User's own reviews (all statuses)
      query = query.eq("user_id", userId);
    } else {
      // All approved (for admin or public listing)
      query = query.eq("status", "approved");
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get stats if product_id provided
    let stats = null;
    if (productId) {
      const { data: statsData } = await getSupabaseAdmin()
        .from("product_review_stats")
        .select("*")
        .eq("product_id", productId)
        .single();
      stats = statsData;
    }

    return NextResponse.json({ reviews: data || [], stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create review
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { product_id, order_id, rating, title, body: reviewBody, photos, product_title, product_thumbnail } = body;

    if (!product_id || !rating) {
      return NextResponse.json({ error: "product_id and rating required" }, { status: 400 });
    }

    // Get user display name
    const displayName = user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] || "Cliente";

    const { data, error } = await getSupabaseAdmin()
      .from("reviews")
      .upsert(
        {
          user_id: user.id,
          product_id,
          order_id: order_id || null,
          rating: Math.min(5, Math.max(1, rating)),
          title: title || null,
          body: reviewBody || null,
          photos: photos || [],
          status: "pending",
          user_name: displayName,
          user_avatar: user.user_metadata?.avatar_url || null,
          product_title: product_title || null,
          product_thumbnail: product_thumbnail || null,
        },
        { onConflict: "user_id,product_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[Reviews POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove own review
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");
    if (!reviewId) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await getSupabaseAdmin()
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

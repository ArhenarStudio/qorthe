// ═══════════════════════════════════════════════════════════════
// /api/account/wishlist — Wishlist CRUD via Supabase
//
// GET    — List user's wishlist
// POST   — Add product to wishlist
// DELETE — Remove product from wishlist
//
// Uses Supabase service role for server-side operations.
// Auth via Supabase JWT token in Authorization header.
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

// Helper: verify user from Supabase token
async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET: List wishlist
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data, error } = await getSupabaseAdmin()
      .from("wishlists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Wishlist GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add to wishlist
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { product_id, variant_id, product_title, product_thumbnail, product_price } = body;

    if (!product_id) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("wishlists")
      .upsert(
        {
          user_id: user.id,
          product_id,
          variant_id: variant_id || null,
          product_title: product_title || "",
          product_thumbnail: product_thumbnail || null,
          product_price: product_price || 0,
        },
        { onConflict: "user_id,product_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[Wishlist POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("[Wishlist DELETE]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

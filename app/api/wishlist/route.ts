// ═══════════════════════════════════════════════════════════════
// Wishlist API — User Wishlists via Supabase
//
// GET    /api/wishlist — Get user's wishlist items
// POST   /api/wishlist — Add item to wishlist
// DELETE /api/wishlist?product_id=xxx — Remove item
//
// Uses Supabase user_metadata.wishlist (JSON array) as storage.
// No extra tables needed — simple and effective for MVP.
// Can migrate to dedicated table later for analytics/SaaS.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface WishlistItem {
  product_id: string;
  variant_id?: string;
  added_at: string;
}

// Helper: get user from token
async function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: SUPABASE_ANON_KEY },
  });
  if (!resp.ok) return null;
  return await resp.json();
}

// Helper: update user metadata (needs service role key)
async function updateUserMetadata(userId: string, metadata: Record<string, any>) {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      apikey: SUPABASE_SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_metadata: metadata }),
  });
  return resp.ok;
}

// GET: List wishlist
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const wishlist: WishlistItem[] = user.user_metadata?.wishlist || [];
    return NextResponse.json({ wishlist, count: wishlist.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add to wishlist
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { product_id, variant_id } = await req.json();
    if (!product_id) return NextResponse.json({ error: "product_id required" }, { status: 400 });

    const wishlist: WishlistItem[] = user.user_metadata?.wishlist || [];

    // Don't add duplicates
    if (wishlist.some((w) => w.product_id === product_id)) {
      return NextResponse.json({ wishlist, message: "Already in wishlist" });
    }

    const updated = [...wishlist, { product_id, variant_id, added_at: new Date().toISOString() }];

    const ok = await updateUserMetadata(user.id, { ...user.user_metadata, wishlist: updated });
    if (!ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

    return NextResponse.json({ wishlist: updated, count: updated.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    if (!productId) return NextResponse.json({ error: "product_id required" }, { status: 400 });

    const wishlist: WishlistItem[] = user.user_metadata?.wishlist || [];
    const updated = wishlist.filter((w) => w.product_id !== productId);

    const ok = await updateUserMetadata(user.id, { ...user.user_metadata, wishlist: updated });
    if (!ok) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

    return NextResponse.json({ wishlist: updated, count: updated.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

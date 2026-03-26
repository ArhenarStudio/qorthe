// ═══════════════════════════════════════════════════════════
// Qorthe — Loyalty API
// GET: profile + transactions | POST: award/redeem points
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── GET: Fetch loyalty profile + transactions ──────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    // Get or create profile
    const { data: profile, error: profileError } = await supabase
      .from("loyalty_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // No profile exists, create one
      const { data: newProfile, error: createError } = await supabase
        .from("loyalty_profiles")
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) {
        console.error("[Loyalty] Error creating profile:", createError);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }

      return NextResponse.json({
        profile: newProfile,
        transactions: [],
      });
    }

    if (profileError) {
      console.error("[Loyalty] Error fetching profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    // Get transactions (most recent first, limit 50)
    const { data: transactions, error: txError } = await supabase
      .from("loyalty_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (txError) {
      console.error("[Loyalty] Error fetching transactions:", txError);
    }

    return NextResponse.json({
      profile,
      transactions: transactions || [],
    });
  } catch (error: any) {
    console.error("[Loyalty] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Award or redeem points ───────────────────────
export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "award") {
      // Award points from order
      const { order_id, order_display_id, order_total } = body;

      if (!order_id || !order_total) {
        return NextResponse.json(
          { error: "order_id and order_total required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.rpc("award_order_points", {
        p_user_id: user.id,
        p_order_id: order_id,
        p_order_display_id: order_display_id || order_id,
        p_order_total: order_total,
      });

      if (error) {
        console.error("[Loyalty] Award error:", error);
        return NextResponse.json({ error: "Failed to award points" }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    if (action === "redeem") {
      // Redeem points
      const { points, description } = body;

      if (!points || points <= 0) {
        return NextResponse.json(
          { error: "Valid points amount required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.rpc("redeem_loyalty_points", {
        p_user_id: user.id,
        p_points: points,
        p_description: description || "Canje de puntos",
      });

      if (error) {
        console.error("[Loyalty] Redeem error:", error);
        return NextResponse.json({ error: "Failed to redeem points" }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action. Use 'award' or 'redeem'" }, { status: 400 });
  } catch (error: any) {
    console.error("[Loyalty] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

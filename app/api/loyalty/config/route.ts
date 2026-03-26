// ═══════════════════════════════════════════════════════════
// Qorthe — Loyalty Config API
// GET: public (read config) | PUT: admin-only (update config)
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin emails allowed to modify config
const ADMIN_EMAILS = [
  "arhenarstudio@gmail.com",
  "arhenarstudio@gmail.com",
  "admin@qorthe.com",
];

// ── GET: Read loyalty config (public) ──────────────────
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("loyalty_config")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("[LoyaltyConfig] GET error:", error);
      return NextResponse.json(
        { error: "Failed to fetch loyalty config" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[LoyaltyConfig] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PUT: Update loyalty config (admin only) ────────────
export async function PUT(request: NextRequest) {
  try {
    // Verify admin auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate tiers if provided
    if (body.tiers) {
      if (!Array.isArray(body.tiers) || body.tiers.length < 2) {
        return NextResponse.json(
          { error: "tiers must be an array with at least 2 levels" },
          { status: 400 }
        );
      }
      // Validate each tier has required fields
      for (const tier of body.tiers) {
        if (!tier.id || !tier.name || tier.min_spend === undefined) {
          return NextResponse.json(
            { error: "Each tier must have id, name, and min_spend" },
            { status: 400 }
          );
        }
      }
      // Ensure tiers are sorted by min_spend ascending
      body.tiers.sort(
        (a: any, b: any) => (a.min_spend || 0) - (b.min_spend || 0)
      );
    }

    // Build update object with only allowed fields
    const allowedFields = [
      "tiers",
      "points_per_mxn",
      "point_value_mxn",
      "points_expiry_days",
      "points_expiry_warning_days",
      "min_redeem_points",
      "max_redeem_percent",
      "max_combined_discount_percent",
      "redeem_step",
      "action_points",
      "evaluation_period",
      "evaluation_lookback_months",
      "max_tier_drop",
      "grace_periods",
      "free_shipping_threshold",
      "free_shipping_all_tiers",
      "program_active",
      "referrals_active",
      "birthday_active",
      "social_share_active",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add audit trail
    updates.updated_by = user.email;

    const { data, error } = await supabase
      .from("loyalty_config")
      .update(updates)
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      console.error("[LoyaltyConfig] PUT error:", error);
      return NextResponse.json(
        { error: "Failed to update config" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config: data,
    });
  } catch (error: any) {
    console.error("[LoyaltyConfig] PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

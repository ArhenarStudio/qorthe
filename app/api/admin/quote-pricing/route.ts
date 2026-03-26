// /api/admin/quote-pricing — Quotation pricing configuration
// GET: public (read pricing config for cotizador)
// PUT: admin-only (update pricing config)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "arhenarstudio@gmail.com",
  "arhenarstudio@gmail.com",
  "admin@qorthe.com",
];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Default pricing config (used as fallback and initial seed)
export const DEFAULT_PRICING = {
  wood_prices_m2: {
    Cedro: 3500,
    Nogal: 5500,
    Encino: 3000,
    Parota: 6000,
    "Combinación": 5000,
  } as Record<string, number>,
  textile_base_prices: {
    "Tote bag": 180,
    "Mandil de cocina": 350,
    Servilletas: 120,
    "Funda de cojín": 280,
  } as Record<string, number>,
  engraving_prices: {
    "Básico": 70,
    Intermedio: 150,
    Detallado: 250,
    Premium: 400,
  } as Record<string, number>,
  engraving_zone_extra: 50,
  engraving_qr_extra: 30,
  textile_technique_prices: {
    "Sublimación": 80,
    "Vinilo HTV": 60,
    Transfer: 50,
  } as Record<string, number>,
  textile_full_panel_extra: 40,
  wood_min_price: 350,
  wood_thickness_standard: 3,
  volume_discounts: [
    { min_qty: 5, percent: 5 },
    { min_qty: 10, percent: 10 },
    { min_qty: 20, percent: 15 },
    { min_qty: 50, percent: 20 },
  ],
  tier_discount_enabled: true,
};

export type QuotePricingConfig = typeof DEFAULT_PRICING;

// ── GET: Read pricing config (public) ──────────────────

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("quote_pricing_config")
      .select("config")
      .eq("id", 1)
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_PRICING);
    }

    return NextResponse.json({ ...DEFAULT_PRICING, ...data.config });
  } catch {
    return NextResponse.json(DEFAULT_PRICING);
  }
}

// ── PUT: Update pricing config (admin only) ────────────

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user || !ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (typeof body !== "object" || !body) {
      return NextResponse.json(
        { error: "Body must be a pricing config object" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("quote_pricing_config")
      .upsert(
        {
          id: 1,
          config: body,
          updated_by: user.email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[quote-pricing] PUT error:", error);
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "Table quote_pricing_config does not exist. Run the SQL migration first." },
          { status: 500 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, config: data.config });
  } catch (err: unknown) {
    console.error("[quote-pricing] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

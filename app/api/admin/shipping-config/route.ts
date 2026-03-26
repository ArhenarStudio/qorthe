// /api/admin/shipping-config
// Lee y guarda la configuración de envíos en Supabase (tabla: admin_panel_config, campo: shipping_config)
// Consumido por: ShippingConfigPanel, useShippingConfig, POSPage, SetupWizard

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// ── Tipos canónicos ──────────────────────────────────────────
export interface ShippingCondition {
  id: string;
  type: "weight" | "subtotal" | "postal_code" | "product_category" | "quantity";
  operator: "gte" | "lte" | "eq" | "between" | "in";
  value: number | string;
  value2?: number; // para between
  label: string;
}

export interface ShippingRate {
  id: string;
  carrier: "envia_dhl" | "envia_estafeta" | "envia_fedex" | "manual" | "free" | "pickup";
  label: string;
  price: number; // MXN centavos
  estimated_days: string;
  conditions: ShippingCondition[];
  active: boolean;
  sort_order: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  coverage: string;       // descripción libre: "Hermosillo CP 83000-83999"
  postal_codes: string[]; // array de CPs o rangos "83000-83999"
  rates: ShippingRate[];
  active: boolean;
}

export interface ShippingConfig {
  provider: "envia" | "manual";
  origin_name: string;
  origin_phone: string;
  origin_street: string;
  origin_city: string;
  origin_state: string;
  origin_postal_code: string;
  origin_country: string;
  free_shipping_threshold: number; // MXN
  free_shipping_carrier: string;
  envia_api_key: string;
  envia_mode: "test" | "production";
  zones: ShippingZone[];
  // Opciones rápidas que expone el POS
  pos_options: POSShippingOption[];
}

export interface POSShippingOption {
  id: string;
  label: string;
  icon: string;           // emoji
  price: number;          // MXN
  active: boolean;
  sort_order: number;
}

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  provider: "envia",
  origin_name: "Qorthe",
  origin_phone: "662-361-0742",
  origin_street: "",
  origin_city: "Hermosillo",
  origin_state: "Sonora",
  origin_postal_code: "83000",
  origin_country: "MX",
  free_shipping_threshold: 2500,
  free_shipping_carrier: "estafeta",
  envia_api_key: "",
  envia_mode: "test",
  zones: [
    {
      id: "zone_local",
      name: "Hermosillo Local",
      coverage: "CP 83000–83999 y alrededores",
      postal_codes: ["83000-83999"],
      active: true,
      rates: [
        {
          id: "rate_local_1",
          carrier: "manual",
          label: "Entrega local (mismo día)",
          price: 8000,
          estimated_days: "Mismo día (2–4h)",
          conditions: [],
          active: true,
          sort_order: 1,
        },
        {
          id: "rate_local_2",
          carrier: "free",
          label: "Envío gratis",
          price: 0,
          estimated_days: "Mismo día",
          conditions: [
            { id: "c1", type: "subtotal", operator: "gte", value: 2500, label: "Subtotal ≥ $2,500" },
          ],
          active: true,
          sort_order: 2,
        },
      ],
    },
    {
      id: "zone_national",
      name: "México Nacional",
      coverage: "Todo México excepto Hermosillo local",
      postal_codes: [],
      active: true,
      rates: [
        {
          id: "rate_nat_dhl",
          carrier: "envia_dhl",
          label: "DHL Express",
          price: 35000,
          estimated_days: "2–3 días hábiles",
          conditions: [],
          active: true,
          sort_order: 1,
        },
        {
          id: "rate_nat_estafeta",
          carrier: "envia_estafeta",
          label: "Estafeta",
          price: 27000,
          estimated_days: "3–5 días hábiles",
          conditions: [],
          active: true,
          sort_order: 2,
        },
        {
          id: "rate_nat_fedex",
          carrier: "envia_fedex",
          label: "FedEx",
          price: 31000,
          estimated_days: "2–4 días hábiles",
          conditions: [],
          active: true,
          sort_order: 3,
        },
        {
          id: "rate_nat_free",
          carrier: "free",
          label: "Envío gratis",
          price: 0,
          estimated_days: "3–5 días hábiles",
          conditions: [
            { id: "c2", type: "subtotal", operator: "gte", value: 2500, label: "Subtotal ≥ $2,500" },
          ],
          active: true,
          sort_order: 4,
        },
      ],
    },
  ],
  pos_options: [
    { id: "pos_pickup",   label: "Recoger en tienda", icon: "🏪", price: 0,   active: true, sort_order: 1 },
    { id: "pos_local",    label: "Entrega local",      icon: "🚚", price: 8000, active: true, sort_order: 2 },
    { id: "pos_national", label: "Envío nacional",     icon: "✈️", price: 18000, active: true, sort_order: 3 },
    { id: "pos_express",  label: "Express 24h",        icon: "⚡", price: 25000, active: true, sort_order: 4 },
  ],
};

// ── GET ───────────────────────────────────────────────────────
export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("admin_panel_config")
      .select("shipping_config")
      .eq("id", "default")
      .single();

    if (error || !data?.shipping_config) {
      return NextResponse.json({ config: DEFAULT_SHIPPING_CONFIG });
    }
    return NextResponse.json({ config: data.shipping_config as ShippingConfig });
  } catch {
    return NextResponse.json({ config: DEFAULT_SHIPPING_CONFIG });
  }
}

// ── PUT ───────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config: ShippingConfig = body.config;

    if (!config) {
      return NextResponse.json({ error: "Missing config" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("admin_panel_config")
      .upsert(
        { id: "default", shipping_config: config, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      )
      .select("shipping_config")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, config: data.shipping_config });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

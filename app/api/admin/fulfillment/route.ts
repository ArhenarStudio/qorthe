// ═══════════════════════════════════════════════════════════════
// POST /api/admin/fulfillment — Proxy to Medusa generate-label
//
// Generates shipping label via Medusa backend → Envia API.
// Handles Medusa admin auth server-side (JWT token).
//
// Body: { order_id, carrier, service? }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const resp = await medusaAdminFetch("/admin/fulfillment/generate-label", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json(
        { error: `Medusa error: ${resp.status}`, details: err },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Admin Fulfillment Proxy]", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

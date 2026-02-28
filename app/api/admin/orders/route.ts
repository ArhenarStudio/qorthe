// ═══════════════════════════════════════════════════════════════
// GET /api/admin/orders — Proxy to Medusa admin orders endpoint
//
// Fetches pending + shipped orders from Medusa backend.
// Handles Medusa admin auth server-side (JWT token).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

export async function GET() {
  try {
    const resp = await medusaAdminFetch("/admin/orders/pending-shipment");

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
    console.error("[Admin Orders Proxy]", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

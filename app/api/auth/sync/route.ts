// ═══════════════════════════════════════════════════════════════
// POST /api/auth/sync — Proxy to Medusa auth-sync endpoint
//
// Forwards Supabase access token to Medusa backend for
// customer upsert. Returns synced Medusa customer data.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const resp = await fetch(`${MEDUSA_URL}/store/auth-sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
      return NextResponse.json(err, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Auth Sync Proxy]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

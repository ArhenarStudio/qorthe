// /api/admin/finances — Revenue, payments, financial stats
// Fase 12.9: datos reales completos desde Medusa + Supabase
import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _sb: SupabaseClient | null = null;
function sb() {
  if (!_sb) _sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return _sb;
}

function daysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString(); }
function fmt0(n: number) { return Math.round(n * 100) / 100; }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "365d": 365, all: 9999 };
    const days = daysMap[period] || 30;
    const since = daysAgo(days);


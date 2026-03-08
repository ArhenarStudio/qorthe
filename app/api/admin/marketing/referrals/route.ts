// /api/admin/marketing/referrals — Referral codes + redemptions CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const ok = (d: Record<string, unknown>) => NextResponse.json(d);
const err = (m: string, s = 500) => NextResponse.json({ error: m }, { status: s });

export async function GET() {
  try {
    const supabase = getSupabase();
    const [codesRes, redemptionsRes] = await Promise.all([
      supabase.from("referral_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("referral_redemptions").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    return ok({
      codes: codesRes.data || [], redemptions: redemptionsRes.data || [],
      totalCodes: (codesRes.data || []).length, totalRedemptions: (redemptionsRes.data || []).length,
    });
  } catch (e: any) { return err(e.message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code || `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data, error } = await getSupabase().from("referral_codes").insert({
      code, owner_email: body.owner_email || "", owner_name: body.owner_name || "",
      discount_type: body.discount_type || "percentage", discount_value: body.discount_value || 10,
      reward_type: body.reward_type || "percentage", reward_value: body.reward_value || 10,
      is_active: true, max_uses: body.max_uses || 0,
    }).select().single();
    if (error) throw error;
    return ok({ success: true, code: data });
  } catch (e: any) { return err(e.message); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return err("id required", 400);
    const updates: Record<string, any> = {};
    for (const k of ["is_active", "discount_value", "reward_value", "max_uses", "owner_email", "owner_name"]) { if (body[k] !== undefined) updates[k] = body[k]; }
    const { data, error } = await getSupabase().from("referral_codes").update(updates).eq("id", body.id).select().single();
    if (error) throw error;
    return ok({ success: true, code: data });
  } catch (e: any) { return err(e.message); }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return err("id required", 400);
    const { error } = await getSupabase().from("referral_codes").delete().eq("id", id);
    if (error) throw error;
    return ok({ success: true });
  } catch (e: any) { return err(e.message); }
}

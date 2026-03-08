// /api/account/b2b — B2B profile CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const ok = (d: Record<string, unknown>) => NextResponse.json(d);
const err = (m: string, s = 500) => NextResponse.json({ error: m }, { status: s });

export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get("user_id");
    if (!userId) return err("user_id required", 400);
    const { data, error } = await getSupabase().from("b2b_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return ok({ profile: data });
  } catch (e: any) { return err(e.message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.user_id) return err("user_id required", 400);
    const { data, error } = await getSupabase().from("b2b_profiles").upsert({
      user_id: body.user_id, company_name: body.company_name || "", rfc: body.rfc || "",
      business_type: body.business_type || "", contact_name: body.contact_name || "",
      contact_phone: body.contact_phone || "", billing_address: body.billing_address || "",
    }, { onConflict: "user_id" }).select().single();
    if (error) throw error;
    return ok({ success: true, profile: data });
  } catch (e: any) { return err(e.message); }
}

// /api/account/invoices — User invoices (CFDI)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const ok = (d: Record<string, unknown>) => NextResponse.json(d);
const err = (m: string, s = 500) => NextResponse.json({ error: m }, { status: s });

export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get("user_id");
    if (!userId) return err("user_id required", 400);
    const { data, error } = await getSupabase().from("invoices").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return ok({ invoices: data || [], total: (data || []).length });
  } catch (e: any) { return err(e.message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.user_id || !body.order_id) return err("user_id and order_id required", 400);
    const { data, error } = await getSupabase().from("invoices").insert({
      user_id: body.user_id, order_id: body.order_id,
      rfc: body.rfc || "", razon_social: body.razon_social || "",
      uso_cfdi: body.uso_cfdi || "G03", regimen_fiscal: body.regimen_fiscal || "",
      subtotal: body.subtotal || 0, tax: body.tax || 0, total: body.total || 0,
      status: "pending",
    }).select().single();
    if (error) throw error;
    return ok({ success: true, invoice: data });
  } catch (e: any) { return err(e.message); }
}

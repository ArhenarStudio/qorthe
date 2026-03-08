// /api/admin/marketing/flash-sales — Flash sales CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const ok = (d: Record<string, unknown>) => NextResponse.json(d);
const err = (m: string, s = 500) => NextResponse.json({ error: m }, { status: s });

export async function GET() {
  try {
    const { data, error } = await getSupabase().from("flash_sales").select("*").order("starts_at", { ascending: false });
    if (error) throw error;
    return ok({ flashSales: data || [], total: (data || []).length });
  } catch (e: any) { return err(e.message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await getSupabase().from("flash_sales").insert({
      name: body.name || "Nueva venta flash",
      discount_type: body.discount_type || "percentage", discount_value: body.discount_value || 15,
      starts_at: body.starts_at || new Date().toISOString(),
      ends_at: body.ends_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_active: false, products: body.products || [],
    }).select().single();
    if (error) throw error;
    return ok({ success: true, flashSale: data });
  } catch (e: any) { return err(e.message); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return err("id required", 400);
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of ["name", "discount_type", "discount_value", "starts_at", "ends_at", "is_active", "products", "max_uses"]) { if (body[k] !== undefined) updates[k] = body[k]; }
    const { data, error } = await getSupabase().from("flash_sales").update(updates).eq("id", body.id).select().single();
    if (error) throw error;
    return ok({ success: true, flashSale: data });
  } catch (e: any) { return err(e.message); }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return err("id required", 400);
    const { error } = await getSupabase().from("flash_sales").delete().eq("id", id);
    if (error) throw error;
    return ok({ success: true });
  } catch (e: any) { return err(e.message); }
}

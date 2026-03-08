// /api/account/designs — User saved designs CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const ok = (d: Record<string, unknown>) => NextResponse.json(d);
const err = (m: string, s = 500) => NextResponse.json({ error: m }, { status: s });

export async function GET(req: NextRequest) {
  try {
    const userId = new URL(req.url).searchParams.get("user_id");
    if (!userId) return err("user_id required", 400);
    const { data, error } = await getSupabase().from("user_designs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return ok({ designs: data || [], total: (data || []).length });
  } catch (e: any) { return err(e.message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.user_id) return err("user_id required", 400);
    const { data, error } = await getSupabase().from("user_designs").insert({
      user_id: body.user_id, name: body.name || "Nuevo diseño", design_type: body.design_type || "image",
      file_url: body.file_url || "", thumbnail_url: body.thumbnail_url || "",
      file_format: body.file_format || "PNG", width_mm: body.width_mm || 0, height_mm: body.height_mm || 0,
      engraving_type: body.engraving_type || "superficial", is_corporate: body.is_corporate || false,
      description: body.description || "",
    }).select().single();
    if (error) throw error;
    return ok({ success: true, design: data });
  } catch (e: any) { return err(e.message); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return err("id required", 400);
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of ["name", "design_type", "file_url", "thumbnail_url", "file_format", "width_mm", "height_mm", "engraving_type", "is_corporate", "description"]) {
      if (body[k] !== undefined) updates[k] = body[k];
    }
    const { data, error } = await getSupabase().from("user_designs").update(updates).eq("id", body.id).select().single();
    if (error) throw error;
    return ok({ success: true, design: data });
  } catch (e: any) { return err(e.message); }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return err("id required", 400);
    const { error } = await getSupabase().from("user_designs").delete().eq("id", id);
    if (error) throw error;
    return ok({ success: true });
  } catch (e: any) { return err(e.message); }
}

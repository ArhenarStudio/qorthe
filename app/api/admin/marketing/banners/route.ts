// /api/admin/marketing/banners — Promotional banners CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const ok = (d: Record<string, unknown>) => NextResponse.json(d);
const err = (m: string, s = 500) => NextResponse.json({ error: m }, { status: s });

export async function GET() {
  try {
    const { data, error } = await getSupabase().from("cms_banners").select("*").order("display_order", { ascending: true });
    if (error) throw error;
    return ok({ banners: data || [], total: (data || []).length });
  } catch (e: any) { return err(e.message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await getSupabase().from("cms_banners").insert({
      name: body.name || "Nuevo banner", location: body.location || "hero",
      image_url: body.image_url || "", link: body.link || "", alt_text: body.alt_text || "",
      is_active: false,
    }).select().single();
    if (error) throw error;
    return ok({ success: true, banner: data });
  } catch (e: any) { return err(e.message); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return err("id required", 400);
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of ["name", "location", "image_url", "link", "alt_text", "is_active", "start_date", "end_date", "display_order"]) { if (body[k] !== undefined) updates[k] = body[k]; }
    const { data, error } = await getSupabase().from("cms_banners").update(updates).eq("id", body.id).select().single();
    if (error) throw error;
    return ok({ success: true, banner: data });
  } catch (e: any) { return err(e.message); }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return err("id required", 400);
    const { error } = await getSupabase().from("cms_banners").delete().eq("id", id);
    if (error) throw error;
    return ok({ success: true });
  } catch (e: any) { return err(e.message); }
}

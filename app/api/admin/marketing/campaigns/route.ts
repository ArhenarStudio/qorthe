// /api/admin/marketing/campaigns — Email campaigns CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const ok = (d: Record<string, unknown>) => NextResponse.json(d);
const err = (m: string, s = 500) => NextResponse.json({ error: m }, { status: s });

export async function GET() {
  try {
    const { data, error } = await getSupabase().from("email_campaigns").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return ok({ campaigns: data || [], total: (data || []).length });
  } catch (e: any) { return err(e.message); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await getSupabase().from("email_campaigns").insert({
      name: body.name || "Nueva campaña", subject: body.subject || "", body_html: body.body_html || "",
      segment: body.segment || "all", status: "draft",
    }).select().single();
    if (error) throw error;
    return ok({ success: true, campaign: data });
  } catch (e: any) { return err(e.message); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return err("id required", 400);
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of ["name", "subject", "body_html", "segment", "status", "scheduled_at"]) { if (body[k] !== undefined) updates[k] = body[k]; }
    const { data, error } = await getSupabase().from("email_campaigns").update(updates).eq("id", body.id).select().single();
    if (error) throw error;
    return ok({ success: true, campaign: data });
  } catch (e: any) { return err(e.message); }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return err("id required", 400);
    const { error } = await getSupabase().from("email_campaigns").delete().eq("id", id);
    if (error) throw error;
    return ok({ success: true });
  } catch (e: any) { return err(e.message); }
}

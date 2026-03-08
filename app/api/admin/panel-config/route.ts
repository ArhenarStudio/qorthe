// /api/admin/panel-config — Admin panel configuration (theme, setup wizard state)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const { data, error } = await getSupabase().from("admin_panel_config").select("*").eq("id", "default").single();
    if (error) throw error;
    return NextResponse.json({ config: data });
  } catch (e: any) {
    return NextResponse.json({ config: { theme_id: "dsd-classic", setup_completed: false, setup_step: 0 } });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.theme_id !== undefined) updates.theme_id = body.theme_id;
    if (body.setup_completed !== undefined) updates.setup_completed = body.setup_completed;
    if (body.setup_step !== undefined) updates.setup_step = body.setup_step;
    const { data, error } = await getSupabase().from("admin_panel_config").update(updates).eq("id", "default").select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, config: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

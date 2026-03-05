// /api/admin/cms — Content management (banners, pages from Supabase)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    let banners: any[] = [];
    let pages: any[] = [];

    try {
      const { data } = await supabase.from("cms_blocks").select("*").order("position", { ascending: true });
      banners = (data || []).filter((b: any) => b.type === "banner");
      pages = (data || []).filter((b: any) => b.type === "page");
    } catch {
      // Table doesn't exist yet
    }

    return NextResponse.json({
      banners,
      pages,
      stats: { totalBanners: banners.length, totalPages: pages.length, activeBanners: banners.filter((b: any) => b.active).length },
      _info: banners.length === 0 && pages.length === 0 ? "Create cms_blocks table in Supabase to manage content" : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

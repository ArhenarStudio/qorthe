// /api/public/pages — Public page data (no auth)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const slug = new URL(req.url).searchParams.get("slug");

    if (slug) {
      const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("slug", normalizedSlug)
        .eq("status", "published")
        .single();
      if (error || !data) return NextResponse.json({ page: null });
      return NextResponse.json({ page: data });
    }

    return NextResponse.json({ error: "slug required" }, { status: 400 });
  } catch {
    return NextResponse.json({ page: null });
  }
}

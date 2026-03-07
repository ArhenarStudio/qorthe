// /api/public/blog — Public blog posts (no auth)
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
      // Single post by slug
      const { data, error } = await supabase
        .from("cms_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error || !data) return NextResponse.json({ post: null });
      return NextResponse.json({ post: data });
    }

    // All published posts
    const { data, error } = await supabase
      .from("cms_posts")
      .select("id, title, slug, excerpt, featured_image, category, author, tags, published_at, status")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    return NextResponse.json({ posts: data || [] });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

// /api/admin/cms — Full CMS: menus, sections, blog, popups, texts, media, SEO
// Tables: cms_menus, cms_sections, cms_blocks (legacy), cms_posts, cms_popups, cms_texts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function jsonOk(data: Record<string, unknown>) { return NextResponse.json(data); }
function jsonErr(msg: string, status = 500) { return NextResponse.json({ error: msg }, { status }); }

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const type = new URL(req.url).searchParams.get("type");

    // ── Menus ──
    if (type === "menus") {
      const { data, error } = await supabase.from("cms_menus").select("*").order("position", { ascending: true });
      if (error) throw error;
      const grouped: Record<string, any[]> = {};
      for (const item of data || []) {
        if (!grouped[item.menu_group]) grouped[item.menu_group] = [];
        grouped[item.menu_group].push(item);
      }
      return jsonOk({ menus: grouped, total: (data || []).length });
    }

    // ── Sections (homepage builder) ──
    if (type === "sections") {
      const { data, error } = await supabase.from("cms_sections").select("*").order("position", { ascending: true });
      if (error) throw error;
      return jsonOk({ sections: data || [], total: (data || []).length });
    }

    // ── Blog posts ──
    // ── Pages (with templates) ──
    if (type === "pages") {
      const { data, error } = await supabase.from("cms_pages").select("*").order("slug", { ascending: true });
      if (error) throw error;
      return jsonOk({ pages: data || [], total: (data || []).length });
    }

    if (type === "posts") {
      const { data, error } = await supabase.from("cms_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return jsonOk({ posts: data || [], total: (data || []).length });
    }

    // ── Pop-ups ──
    if (type === "popups") {
      const { data, error } = await supabase.from("cms_popups").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return jsonOk({ popups: data || [], total: (data || []).length });
    }

    // ── Texts (i18n) ──
    if (type === "texts") {
      const { data, error } = await supabase.from("cms_texts").select("*").order("section", { ascending: true });
      if (error) throw error;
      return jsonOk({ texts: data || [], total: (data || []).length });
    }

    // ── Media (Supabase Storage) ──
    if (type === "media") {
      const bucket = "media";
      try {
        const { data, error } = await supabase.storage.from(bucket).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
        if (error) throw error;
        const files = (data || []).filter(f => f.name !== ".emptyFolderPlaceholder").map(f => {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name);
          return { id: f.id, name: f.name, size: f.metadata?.size || 0, type: f.metadata?.mimetype || "unknown", url: urlData.publicUrl, created_at: f.created_at };
        });
        return jsonOk({ files, total: files.length });
      } catch {
        // Bucket may not exist — return empty
        return jsonOk({ files: [], total: 0, note: "media bucket not found" });
      }
    }

    // ── SEO ──
    if (type === "seo") {
      return jsonOk({
        seo: {
          sitemap: "https://www.qorthe.com/sitemap.xml",
          robots: "https://www.qorthe.com/robots.txt",
          ogImage: "/images/og-image.jpg",
          jsonLd: true,
          favicon: "/favicon.ico",
          domain: "qorthe.com",
          indexedPages: 20,
          metaDescription: "Tablas artesanales de madera hechas a mano en México. Personalización láser incluida.",
        },
      });
    }

    // ── Default: return all CMS stats ──
    let banners: any[] = [], pages: any[] = [], menuCount = 0, sectionCount = 0, postCount = 0, popupCount = 0, textCount = 0;

    try { const { data } = await supabase.from("cms_blocks").select("*").order("position", { ascending: true }); banners = (data || []).filter((b: any) => b.type === "banner"); pages = (data || []).filter((b: any) => b.type === "page"); } catch {}
    try { const { count } = await supabase.from("cms_menus").select("id", { count: "exact", head: true }); menuCount = count || 0; } catch {}
    try { const { count } = await supabase.from("cms_sections").select("id", { count: "exact", head: true }); sectionCount = count || 0; } catch {}
    try { const { count } = await supabase.from("cms_posts").select("id", { count: "exact", head: true }); postCount = count || 0; } catch {}
    try { const { count } = await supabase.from("cms_popups").select("id", { count: "exact", head: true }); popupCount = count || 0; } catch {}
    try { const { count } = await supabase.from("cms_texts").select("id", { count: "exact", head: true }); textCount = count || 0; } catch {}

    return jsonOk({
      banners, pages,
      stats: { totalBanners: banners.length, totalPages: pages.length, totalMenuItems: menuCount, totalSections: sectionCount, totalPosts: postCount, totalPopups: popupCount, totalTexts: textCount },
    });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Unknown");
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { type } = body;

    if (type === "post") {
      const { data, error } = await supabase.from("cms_posts").insert({
        title: body.title || "Sin título",
        slug: body.slug || body.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "nuevo-post",
        excerpt: body.excerpt || "",
        body: body.body || "",
        status: body.status || "draft",
        author: body.author || "Qorthe",
        tags: body.tags || [],
        featured_image: body.featured_image || "",
        category: body.category || "",
        seo_title: body.seo_title || "",
        seo_description: body.seo_description || "",
      }).select().single();
      if (error) throw error;
      return jsonOk({ success: true, post: data });
    }

    if (type === "popup") {
      const { data, error } = await supabase.from("cms_popups").insert({
        name: body.name || "Nuevo pop-up",
        type: body.popup_type || "modal",
        trigger_type: body.trigger_type || "delay",
        trigger_value: body.trigger_value || "3",
        content: body.content || {},
        is_active: body.is_active || false,
        show_on: body.show_on || ["/"],
        display_frequency: body.display_frequency || "once_per_session",
      }).select().single();
      if (error) throw error;
      return jsonOk({ success: true, popup: data });
    }

    if (type === "text") {
      const { data, error } = await supabase.from("cms_texts").upsert({
        section: body.section || "General",
        key: body.key,
        value_es: body.value_es || "",
        value_en: body.value_en || "",
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" }).select().single();
      if (error) throw error;
      return jsonOk({ success: true, text: data });
    }

    return jsonErr("type required (post, popup, text)", 400);
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Unknown");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { type, id, items } = body;

    if (type === "menus" && items) {
      const group = body.group as string;
      if (!group) return jsonErr("group required", 400);
      await supabase.from("cms_menus").delete().eq("menu_group", group);
      const toInsert = (items as any[]).map((item, idx) => ({
        menu_group: group, label: item.label, url: item.url || "/", position: idx,
        is_visible: item.is_visible !== false, open_new_tab: item.open_new_tab || false, icon: item.icon || null,
      }));
      const { error } = await supabase.from("cms_menus").insert(toInsert);
      if (error) throw error;
      return jsonOk({ success: true, count: toInsert.length });
    }

    if (type === "sections" && items) {
      await supabase.from("cms_sections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const toInsert = (items as any[]).map((item, idx) => ({
        section_type: item.section_type || item.type, title: item.title || "", content: item.content || {}, position: idx, is_visible: item.is_visible !== false,
      }));
      const { error } = await supabase.from("cms_sections").insert(toInsert);
      if (error) throw error;
      return jsonOk({ success: true, count: toInsert.length });
    }

    if (type === "page" && id) {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      for (const key of ["title", "slug", "template", "last_updated", "status", "sections", "seo_title", "seo_description", "is_editable", "page_type"]) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      const { data, error } = await supabase.from("cms_pages").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return jsonOk({ success: true, page: data });
    }

    if (type === "post" && id) {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      for (const key of ["title", "slug", "excerpt", "body", "status", "author", "tags", "featured_image", "category", "seo_title", "seo_description", "published_at"]) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      if (updates.status === "published" && !updates.published_at) updates.published_at = new Date().toISOString();
      const { data, error } = await supabase.from("cms_posts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return jsonOk({ success: true, post: data });
    }

    if (type === "popup" && id) {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      for (const key of ["name", "type", "trigger_type", "trigger_value", "content", "is_active", "show_on", "hide_on", "start_date", "end_date", "display_frequency"]) {
        if (body[key] !== undefined) updates[key] = body[key];
      }
      const { data, error } = await supabase.from("cms_popups").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return jsonOk({ success: true, popup: data });
    }

    if (type === "text" && id) {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (body.value_es !== undefined) updates.value_es = body.value_es;
      if (body.value_en !== undefined) updates.value_en = body.value_en;
      if (body.section !== undefined) updates.section = body.section;
      const { data, error } = await supabase.from("cms_texts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return jsonOk({ success: true, text: data });
    }

    return jsonErr("type + id required", 400);
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Unknown");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (!type || !id) return jsonErr("type and id required", 400);

    const table = type === "post" ? "cms_posts" : type === "popup" ? "cms_popups" : type === "text" ? "cms_texts" : null;
    if (!table) return jsonErr("invalid type", 400);

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    return jsonOk({ success: true, deleted: id });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Unknown");
  }
}

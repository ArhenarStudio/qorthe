// /api/admin/cms — Content management (menus, sections, banners, pages)
// Tables: cms_menus, cms_sections, cms_blocks (legacy)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const type = new URL(req.url).searchParams.get("type");

    // Menus
    if (type === "menus") {
      const { data, error } = await supabase
        .from("cms_menus")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      // Group by menu_group
      const grouped: Record<string, any[]> = {};
      for (const item of data || []) {
        if (!grouped[item.menu_group]) grouped[item.menu_group] = [];
        grouped[item.menu_group].push(item);
      }
      return NextResponse.json({ menus: grouped, total: (data || []).length });
    }

    // Sections (homepage builder)
    if (type === "sections") {
      const { data, error } = await supabase
        .from("cms_sections")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return NextResponse.json({ sections: data || [], total: (data || []).length });
    }

    // Default: return all CMS data
    let banners: any[] = [];
    let pages: any[] = [];
    let menus: Record<string, any[]> = {};
    let sections: any[] = [];

    try {
      const { data } = await supabase.from("cms_blocks").select("*").order("position", { ascending: true });
      banners = (data || []).filter((b: any) => b.type === "banner");
      pages = (data || []).filter((b: any) => b.type === "page");
    } catch { /* cms_blocks may not exist */ }

    try {
      const { data } = await supabase.from("cms_menus").select("*").order("position", { ascending: true });
      for (const item of data || []) {
        if (!menus[item.menu_group]) menus[item.menu_group] = [];
        menus[item.menu_group].push(item);
      }
    } catch { /* cms_menus may not exist */ }

    try {
      const { data } = await supabase.from("cms_sections").select("*").order("position", { ascending: true });
      sections = data || [];
    } catch { /* cms_sections may not exist */ }

    return NextResponse.json({
      banners, pages, menus, sections,
      stats: {
        totalBanners: banners.length,
        totalPages: pages.length,
        totalMenuItems: Object.values(menus).flat().length,
        totalSections: sections.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { type, items } = body;

    if (type === "menus" && items) {
      // Bulk update menus for a group
      const group = body.group as string;
      if (!group) return NextResponse.json({ error: "group required" }, { status: 400 });

      // Delete existing items in group, then insert new ones
      await supabase.from("cms_menus").delete().eq("menu_group", group);
      const toInsert = (items as any[]).map((item, idx) => ({
        menu_group: group,
        label: item.label,
        url: item.url || "/",
        position: idx,
        is_visible: item.is_visible !== false,
        open_new_tab: item.open_new_tab || false,
        icon: item.icon || null,
      }));
      const { error } = await supabase.from("cms_menus").insert(toInsert);
      if (error) throw error;
      return NextResponse.json({ success: true, count: toInsert.length });
    }

    if (type === "sections" && items) {
      // Bulk update homepage sections
      await supabase.from("cms_sections").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
      const toInsert = (items as any[]).map((item, idx) => ({
        section_type: item.section_type || item.type,
        title: item.title || "",
        content: item.content || {},
        position: idx,
        is_visible: item.is_visible !== false,
      }));
      const { error } = await supabase.from("cms_sections").insert(toInsert);
      if (error) throw error;
      return NextResponse.json({ success: true, count: toInsert.length });
    }

    return NextResponse.json({ error: "type required (menus or sections)" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

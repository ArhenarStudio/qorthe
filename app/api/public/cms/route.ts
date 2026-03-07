// /api/public/cms — Public CMS data (no auth required)
// Returns menus, sections, texts, active popups for frontend rendering
// Cache: ISR revalidate 300s (5 min)
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const revalidate = 300;

export async function GET() {
  try {
    const supabase = getSupabase();

    const [menusRes, sectionsRes, textsRes, popupsRes] = await Promise.allSettled([
      supabase.from("cms_menus").select("*").order("position", { ascending: true }),
      supabase.from("cms_sections").select("*").eq("is_visible", true).order("position", { ascending: true }),
      supabase.from("cms_texts").select("*"),
      supabase.from("cms_popups").select("*").eq("is_active", true),
    ]);

    // Group menus by menu_group
    const menusData = menusRes.status === "fulfilled" && !menusRes.value.error ? menusRes.value.data || [] : [];
    const menus: Record<string, Array<{ label: string; url: string; open_new_tab: boolean; icon: string | null }>> = {};
    for (const item of menusData) {
      if (!item.is_visible) continue;
      const group = item.menu_group || "header";
      if (!menus[group]) menus[group] = [];
      menus[group].push({ label: item.label, url: item.url || "/", open_new_tab: item.open_new_tab || false, icon: item.icon || null });
    }

    const sections = sectionsRes.status === "fulfilled" && !sectionsRes.value.error
      ? (sectionsRes.value.data || []).map((s: any) => ({ id: s.id, type: s.section_type, title: s.title || "", content: s.content || {}, position: s.position }))
      : [];

    const textsData = textsRes.status === "fulfilled" && !textsRes.value.error ? textsRes.value.data || [] : [];
    const texts: Record<string, { es: string; en: string }> = {};
    for (const t of textsData) { texts[t.key] = { es: t.value_es || "", en: t.value_en || "" }; }

    const popups = popupsRes.status === "fulfilled" && !popupsRes.value.error
      ? (popupsRes.value.data || []).map((p: any) => ({ id: p.id, name: p.name, type: p.type, trigger_type: p.trigger_type, trigger_value: p.trigger_value, content: p.content || {}, show_on: p.show_on || ["/"], display_frequency: p.display_frequency || "once_per_session" }))
      : [];

    return NextResponse.json({ menus, sections, texts, popups, _cached_at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ menus: {}, sections: [], texts: {}, popups: [], _error: true });
  }
}

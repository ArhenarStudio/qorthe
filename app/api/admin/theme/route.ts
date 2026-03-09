// /api/admin/theme — Storefront theme configuration
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Default DSD theme config (fallback when no saved config exists)
const DSD_DEFAULT_THEME = {
  id: "artesanal",
  name: "Artesanal",
  colors: {
    primary: "#5D4037", secondary: "#C5A065", accent: "#C5A065",
    background: "#FDFAF5", surface: "#FFFFFF", text: "#1C1C1C",
    textMuted: "#6B6B6B", success: "#22c55e", error: "#ef4444", warning: "#f59e0b",
  },
  fonts: {
    heading: "Playfair Display", body: "Inter",
    sizeBase: 15, sizeHeading: 32, sizeButton: 14,
  },
  layout: {
    headerType: "fixed", headerLayout: "center", megaMenu: false,
    footerColumns: 4, footerNewsletter: true, footerSocial: true,
    cardLayout: "vertical", cardShowRating: true, cardShowBadge: true,
    productGallery: "slider", productDescStyle: "tabs", checkoutType: "multi",
  },
  components: {
    buttonShape: "rounded", buttonSize: "md", hoverStyle: "darken",
    cardShadow: "sm", cardRadius: 12, badgeStyle: "soft", iconSet: "lucide",
  },
  homepageSections: [
    { id: "hero-1",          type: "hero",         label: "Hero / Banner principal",   enabled: true,  spacing: "lg", bgStyle: "primary", width: "full"      },
    { id: "featured-1",      type: "featured",     label: "Productos destacados",      enabled: true,  spacing: "md", bgStyle: "default", width: "contained" },
    { id: "categories-1",    type: "categories",   label: "Categorias",                enabled: true,  spacing: "md", bgStyle: "surface", width: "contained" },
    { id: "banner-1",        type: "banner",       label: "Banner grabado laser",      enabled: true,  spacing: "md", bgStyle: "accent",  width: "full"      },
    { id: "testimonials-1",  type: "testimonials", label: "Testimonios",               enabled: true,  spacing: "md", bgStyle: "default", width: "contained" },
    { id: "newsletter-1",    type: "newsletter",   label: "Newsletter",                enabled: false, spacing: "sm", bgStyle: "primary", width: "full"      },
  ],
};

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("admin_panel_config")
      .select("storefront_theme, updated_at")
      .eq("id", "default")
      .single();

    if (error || !data?.storefront_theme) {
      return NextResponse.json({ theme: DSD_DEFAULT_THEME, source: "default" });
    }
    return NextResponse.json({ theme: data.storefront_theme, source: "db", updated_at: data.updated_at });
  } catch {
    return NextResponse.json({ theme: DSD_DEFAULT_THEME, source: "default" });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle SEO sub-type (called from SeoTabLive in CmsPage)
    if (body.type === "seo") {
      const seoData = {
        metaTitle: body.meta_title ?? "",
        metaDescription: body.meta_description ?? "",
        ogTitle: body.og_title ?? "",
        ogDescription: body.og_description ?? "",
        ogImage: body.og_image ?? "",
        favicon: body.favicon_url ?? "",
        gaId: body.ga_id ?? "",
        metaPixelId: body.meta_pixel_id ?? "",
        gtmId: body.gtm_id ?? "",
      };
      const { error } = await getSupabase()
        .from("admin_panel_config")
        .update({ seo_config: seoData, updated_at: new Date().toISOString() })
        .eq("id", "default");
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Handle full theme config save
    const { theme } = body;
    if (!theme || !theme.id) {
      return NextResponse.json({ error: "Missing theme config" }, { status: 400 });
    }
    const { data, error } = await getSupabase()
      .from("admin_panel_config")
      .update({ storefront_theme: theme, updated_at: new Date().toISOString() })
      .eq("id", "default")
      .select("updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, updated_at: data?.updated_at });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

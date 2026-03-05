// /api/admin/theme — Theme configuration (current DSD design system)
import { NextResponse } from "next/server";

export async function GET() {
  // Return the actual DSD design tokens (from tailwind config + Figma)
  return NextResponse.json({
    theme: {
      name: "DavidSon's Design — Artesanal",
      colors: {
        primary: { wood900: "#2d2419", wood800: "#3d3224", wood700: "#5D4037" },
        accent: { gold: "#C5A065", goldLight: "#D4B78A" },
        sand: { 50: "#f5f0e8", 100: "#ede5d8", 200: "#e0d5c3" },
        status: { success: "#22c55e", warning: "#f59e0b", error: "#ef4444", info: "#3b82f6" },
      },
      typography: {
        headings: "Playfair Display",
        body: "Inter",
        mono: "JetBrains Mono",
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
      logo: { main: "/images/logo-davidsons.png", monogram: "/images/ds-monogram.png", favicon: "/favicon.ico" },
      social: {
        instagram: "https://instagram.com/davidsonsdesign",
        facebook: "https://facebook.com/davidsonsdesign",
        whatsapp: "+526623610742",
      },
    },
    _info: "Theme is currently defined in code (tailwind.config.ts + globals.css). SaaS theme editor coming in future phase.",
  });
}

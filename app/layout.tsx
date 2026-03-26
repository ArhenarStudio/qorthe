import type { Metadata } from "next";
import { Playfair_Display, Inter, Sora, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import ClientProviders from "./providers";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Fuentes del tema Komerzly OS (Template 01)
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE_URL = "https://qorthe.com";
const SITE_NAME = "Qorthe";
const SITE_DESC = "Tablas artesanales de madera mexicana con grabado láser personalizado. Piezas únicas en Parota, Cedro y Rosa Morada, hechas a mano en México.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Tablas Artesanales de Madera`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "tablas de madera", "tablas para cortar", "charcuterie board", "grabado láser",
    "madera artesanal", "parota", "cedro", "rosa morada", "hecho en méxico",
    "muebles artesanales", "regalo personalizado", "tabla personalizada",
    "cocina gourmet", "tabla de quesos", "qorthe",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Tablas Artesanales de Madera`,
    description: SITE_DESC,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Qorthe — Tablas artesanales de madera mexicana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Tablas Artesanales de Madera`,
    description: SITE_DESC,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add Google Search Console verification when ready
    // google: "your-verification-code",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <meta name="theme-color" content="#2d2419" />
        <OrganizationJsonLd />
      </head>
      <body className={`${playfair.variable} ${inter.variable} ${sora.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <ClientProviders>
          {children}
          <Toaster position="bottom-right" />
        </ClientProviders>
      </body>
    </html>
  );
}

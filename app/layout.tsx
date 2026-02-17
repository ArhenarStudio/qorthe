import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import ClientProviders from "./providers";
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

export const metadata: Metadata = {
  title: "DavidSon's Design — Tablas Artesanales de Madera",
  description: "Piezas únicas en Parota, Cedro y Rosa Morada. Diseñadas para celebrar la vida.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <ClientProviders>
          {children}
          <Toaster position="bottom-right" />
        </ClientProviders>
      </body>
    </html>
  );
}

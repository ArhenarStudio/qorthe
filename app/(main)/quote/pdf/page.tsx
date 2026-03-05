// /quote/pdf?id=QUOTE_ID — Printable quote page (browser print → PDF)
import { Metadata } from "next";
import { Suspense } from "react";
import { QuotePDFView } from "@/components/quote/QuotePDFView";

export const metadata: Metadata = {
  title: "Cotización — DavidSon's Design",
  robots: "noindex, nofollow",
};

export default function QuotePDFPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-wood-500">Cargando cotización...</div>}>
      <QuotePDFView />
    </Suspense>
  );
}

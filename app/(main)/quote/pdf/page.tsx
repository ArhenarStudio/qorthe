// /quote/pdf?id=QUOTE_ID — Printable quote page (browser print → PDF)
import { Metadata } from "next";
import { QuotePDFView } from "@/components/quote/QuotePDFView";

export const metadata: Metadata = {
  title: "Cotización — DavidSon's Design",
  robots: "noindex, nofollow",
};

export default function QuotePDFPage() {
  return <QuotePDFView />;
}

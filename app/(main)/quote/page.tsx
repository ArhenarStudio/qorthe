import { Metadata } from "next";
import { QuotePage } from "@/components/pages/QuotePage";

export const metadata: Metadata = {
  title: "Cotizador — Diseña tu Tabla",
  description: "Diseña tu tabla de madera personalizada. Elige madera, dimensiones, grabado láser y recibe una cotización al instante.",
};

export default function Page() {
  return <QuotePage />;
}

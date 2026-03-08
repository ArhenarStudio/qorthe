import { Metadata } from "next";
import { LoyaltyPage } from "@/components/pages/LoyaltyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export const metadata: Metadata = {
  title: "Programa de Lealtad",
  description: "Únete a nuestro programa de membresía. Acumula puntos, sube de nivel y obtén beneficios exclusivos en DavidSon's Design.",
};

export default function Page() {
  return <CmsPageRenderer fallback={<LoyaltyPage />} />;
}

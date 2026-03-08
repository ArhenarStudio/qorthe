import { Metadata } from "next";
import { FaqPage } from "@/components/pages/FaqPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Resolvemos tus dudas sobre envíos, personalización láser, materiales, tiempos de producción y más.",
};

export default function Page() {
  return <CmsPageRenderer fallback={<FaqPage />} />;
}

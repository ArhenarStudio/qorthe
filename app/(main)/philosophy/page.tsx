import { Metadata } from "next";
import { PhilosophyPage } from "@/components/pages/PhilosophyPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export const metadata: Metadata = {
  title: "Filosofía",
  description: "Nuestra filosofía: cada pieza de madera cuenta una historia. Artesanía mexicana con propósito, sustentabilidad y diseño consciente.",
};

export default function Page() {
  return <CmsPageRenderer fallback={<PhilosophyPage />} />;
}

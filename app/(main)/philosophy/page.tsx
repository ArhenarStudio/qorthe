import { Metadata } from "next";
import { PhilosophyPage } from "@/components/pages/PhilosophyPage";

export const metadata: Metadata = {
  title: "Filosofía",
  description: "Nuestra filosofía: cada pieza de madera cuenta una historia. Artesanía mexicana con propósito, sustentabilidad y diseño consciente.",
};

export default function Page() {
  return <PhilosophyPage />;
}

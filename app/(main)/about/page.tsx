import { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "Conoce la historia de DavidSon's Design. Artesanos mexicanos creando tablas de madera únicas con técnicas tradicionales y grabado láser moderno.",
};

export default function Page() {
  return <AboutPage />;
}

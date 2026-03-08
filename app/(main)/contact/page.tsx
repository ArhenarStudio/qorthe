import { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";
import { CmsPageRenderer } from "@/components/cms/CmsPageRenderer";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos para pedidos personalizados, cotizaciones o cualquier pregunta sobre nuestras tablas artesanales de madera.",
};

export default function Page() {
  return <CmsPageRenderer fallback={<ContactPage />} />;
}

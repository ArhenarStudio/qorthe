import { Metadata } from "next";
import { ShopPage } from "@/components/pages/ShopPage";

export const metadata: Metadata = {
  title: "Tienda — Tablas de Madera Artesanales",
  description: "Explora nuestra colección de tablas de madera hechas a mano en Parota, Cedro y Rosa Morada. Grabado láser personalizado disponible.",
  openGraph: {
    title: "Tienda | Qorthe",
    description: "Colección de tablas artesanales de madera mexicana con grabado láser personalizado.",
  },
};

export default function Page() {
  return <ShopPage />;
}

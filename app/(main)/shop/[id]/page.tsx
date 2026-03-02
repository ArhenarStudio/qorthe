import { Metadata } from "next";
import { ProductDetailPage } from "@/components/pages/ProductDetailPage";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "";
const MEDUSA_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

// Fetch product for metadata
async function getProduct(handle: string) {
  try {
    const resp = await fetch(
      `${MEDUSA_URL}/store/products?handle=${handle}&fields=title,description,thumbnail,variants.prices`,
      {
        headers: { "x-publishable-api-key": MEDUSA_KEY },
        next: { revalidate: 3600 },
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.products?.[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const price = product.variants?.[0]?.prices?.[0]?.amount;
  const priceStr = price ? `$${(price / 100).toLocaleString("es-MX")} MXN` : "";
  const desc = product.description
    ? product.description.slice(0, 155)
    : `${product.title} — Tabla artesanal de madera hecha a mano en México. ${priceStr}`;

  return {
    title: product.title,
    description: desc,
    openGraph: {
      title: `${product.title} | DavidSon's Design`,
      description: desc,
      images: product.thumbnail ? [{ url: product.thumbnail, width: 800, height: 800, alt: product.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: desc,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

export default function Page() {
  return <ProductDetailPage />;
}

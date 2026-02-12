import { commerce, type CommerceProduct } from "@/lib/commerce";
import type { CatalogProduct } from "@/modules/product";
import { ProductsCatalogClient } from "./ProductsCatalogClient";

export const dynamic = "force-dynamic";

function mapToCatalog(product: CommerceProduct): CatalogProduct {
  const amount = product.priceRange?.minVariantPrice?.amount ?? 0;
  const image = product.featuredImage?.url ?? product.variants?.[0]?.image?.url ?? "";
  return {
    id: product.handle,
    name: product.title,
    category: product.productType ?? "products",
    price: amount,
    images: image ? [image] : [],
    description: product.description ?? "",
  };
}

export default async function ProductsPage() {
  let products: CatalogProduct[] = [];

  try {
    const data = await commerce.getProducts(50);
    products = data.map(mapToCatalog);
  } catch {
    products = [];
  }

  return <ProductsCatalogClient products={products} />;
}

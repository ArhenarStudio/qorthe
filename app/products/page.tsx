import { storefrontQuery, PRODUCTS_QUERY } from "@/lib/shopify";
import type { CatalogProduct } from "@/modules/product";
import { ProductsCatalogClient } from "./ProductsCatalogClient";

interface ProductsResponse {
  products: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      description: string;
      productType?: string;
      featuredImage: { url: string; altText: string | null } | null;
      variants: {
        nodes: Array<{
          price: { amount: string; currencyCode: string };
          image: { url: string } | null;
        }>;
      };
      priceRange: {
        minVariantPrice: { amount: string; currencyCode: string };
      };
    }>;
  };
}

function mapShopifyToCatalog(node: ProductsResponse["products"]["nodes"][0]): CatalogProduct {
  const price =
    node.priceRange?.minVariantPrice ?? node.variants?.nodes?.[0]?.price;
  const amount = price ? parseFloat(price.amount) : 0;
  const image =
    node.featuredImage?.url ?? node.variants?.nodes?.[0]?.image?.url ?? "";
  return {
    id: node.handle,
    name: node.title,
    category: node.productType ?? "products",
    price: amount,
    images: image ? [image] : [],
    description: node.description ?? "",
  };
}

export default async function ProductsPage() {
  let products: CatalogProduct[] = [];

  try {
    const data = await storefrontQuery<ProductsResponse>(PRODUCTS_QUERY, {
      first: 50,
    });
    products = (data.products?.nodes ?? []).map(mapShopifyToCatalog);
  } catch {
    products = [];
  }

  return <ProductsCatalogClient products={products} />;
}

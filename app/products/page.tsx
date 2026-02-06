import Link from "next/link";
import { storefrontQuery } from "@/lib/shopify";
import { PRODUCTS_QUERY } from "@/lib/queries";
import type { ShopifyProduct } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

interface ProductsResponse {
  products: {
    nodes: ShopifyProduct[];
  };
}

export default async function ProductsPage() {
  const { products } = await storefrontQuery<ProductsResponse>(PRODUCTS_QUERY, {
    first: 24,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Todos los productos
          </h1>
          <p className="mt-2 text-lg text-foreground/70">
            Explora nuestra colección de diseño
          </p>
        </div>

        {products.nodes.length === 0 ? (
          <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-12 text-center">
            <p className="text-lg text-foreground/70">
              No hay productos disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.nodes.map((product) => (
              <Link key={product.id} href={`/products/${product.handle}`}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

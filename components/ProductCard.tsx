import type { ShopifyProduct } from "@/lib/types";
import Image from "next/image";

interface ProductCardProps {
  product: ShopifyProduct;
}

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.featuredImage ?? product.variants?.nodes?.[0]?.image;
  const price = product.priceRange?.minVariantPrice ?? product.variants?.nodes?.[0]?.price;

  return (
    <article className="group overflow-hidden rounded-lg border border-foreground/10 bg-background transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-foreground/5">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            width={image.width || 400}
            height={image.height || 400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground/30">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-foreground/90">
          {product.title}
        </h3>
        {price && (
          <p className="mt-2 text-lg font-medium text-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        )}
      </div>
    </article>
  );
}

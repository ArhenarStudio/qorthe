import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { storefrontQuery } from "@/lib/shopify";
import type { ShopifyProduct } from "@/lib/types";

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      featuredImage {
        url
        altText
        width
        height
      }
      variants(first: 10) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

interface ProductResponse {
  product: ShopifyProduct | null;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const { product } = await storefrontQuery<ProductResponse>(PRODUCT_QUERY, {
    handle,
  });

  if (!product) {
    notFound();
  }

  const image = product.featuredImage ?? product.variants?.nodes?.[0]?.image;
  const price = product.priceRange?.minVariantPrice ?? product.variants?.nodes?.[0]?.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-8 inline-block text-sm text-foreground/70 hover:text-foreground"
      >
        ← Volver a productos
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-foreground/5">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              width={image.width || 800}
              height={image.height || 800}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-foreground/30">
              Sin imagen
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {product.title}
          </h1>
          {price && (
            <p className="mt-4 text-2xl font-semibold text-foreground">
              {new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: price.currencyCode,
              }).format(parseFloat(price.amount))}
            </p>
          )}
          {product.description && (
            <p className="mt-6 whitespace-pre-wrap text-foreground/80">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

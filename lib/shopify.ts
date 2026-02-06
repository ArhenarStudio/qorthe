import { createStorefrontClient } from "@shopify/hydrogen-react";

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

if (!storeDomain || !storefrontToken) {
  throw new Error(
    "Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local"
  );
}

export const storefrontClient = createStorefrontClient({
  storeDomain: `https://${storeDomain}`,
  storefrontApiVersion: "2025-01",
  publicStorefrontToken: storefrontToken,
});

export async function storefrontQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(storefrontClient.getStorefrontApiUrl(), {
    method: "POST",
    headers: storefrontClient.getPublicTokenHeaders(),
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Storefront API error: ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(
      json.errors.map((e: { message: string }) => e.message).join(", ")
    );
  }

  return json.data as T;
}

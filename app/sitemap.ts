import { MetadataRoute } from "next";

const BASE_URL = "https://davidsonsdesign.com";

// Static pages with priorities
const staticPages = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/philosophy", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/quote", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/loyalty", priority: 0.5, changeFrequency: "monthly" as const },
  // Legal pages
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/shipping-policy", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/returns-policy", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/warranty-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cookies-policy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/sales-conditions", priority: 0.3, changeFrequency: "yearly" as const },
];

// Fetch product handles from Medusa
async function getProductSlugs(): Promise<string[]> {
  try {
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL;
    if (!medusaUrl) return [];

    const resp = await fetch(`${medusaUrl}/store/products?limit=200&fields=handle`, {
      headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" },
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.products || []).map((p: any) => p.handle).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Dynamic product pages
  const slugs = await getProductSlugs();
  const productEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/shop/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}

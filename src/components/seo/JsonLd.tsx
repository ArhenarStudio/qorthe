// ═══════════════════════════════════════════════════════════════
// JSON-LD Structured Data for SEO
// ═══════════════════════════════════════════════════════════════

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DavidSon's Design",
    url: "https://davidsonsdesign.com",
    logo: "https://davidsonsdesign.com/logo.png",
    description: "Tablas artesanales de madera mexicana con grabado láser personalizado.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hermosillo",
      addressRegion: "Sonora",
      addressCountry: "MX",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({
  name, description, image, price, currency = "MXN", sku, url,
  availability = "InStock",
}: {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  sku?: string;
  url: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || undefined,
    sku: sku || undefined,
    url,
    brand: { "@type": "Brand", name: "DavidSon's Design" },
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: { "@type": "Organization", name: "DavidSon's Design" },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

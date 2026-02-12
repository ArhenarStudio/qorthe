import { notFound } from "next/navigation";
import {
  ProductBreadcrumb,
  ProductGallery,
  ProductInfo,
  ProductTabs,
} from "@/modules/product";
import { commerce, getMetafield } from "@/lib/commerce";
import { ProductDetailLayout } from "./ProductDetailLayout";

export const dynamic = "force-dynamic";

const fallback = (v: string | undefined, fallbackVal: string) =>
  (v != null && v.trim() !== "" ? v.trim() : fallbackVal);

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const product = await commerce.getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const image = product.featuredImage ?? product.variants?.[0]?.image;
  const price =
    product.priceRange?.minVariantPrice ??
    product.variants?.[0]?.price;
  const compareAt = product.variants?.[0]?.compareAtPrice;

  const images = image
    ? [
        { url: image.url, alt: image.altText ?? product.title },
        ...(product.variants?.filter((v) => v.image?.url).slice(0, 4).map((v) => ({
          url: v.image!.url,
          alt: v.image!.altText ?? product.title,
        })) ?? []),
      ]
    : [{ url: "https://via.placeholder.com/800x800?text=Sin+imagen", alt: product.title }];
  if (images.length === 1) {
    images.push(
      { url: images[0]!.url, alt: images[0]!.alt },
      { url: images[0]!.url, alt: images[0]!.alt },
      { url: images[0]!.url, alt: images[0]!.alt },
      { url: images[0]!.url, alt: images[0]!.alt }
    );
  }

  const priceNum = price ? price.amount : 0;
  const originalPriceNum =
    compareAt && compareAt.amount > priceNum
      ? compareAt.amount
      : undefined;
  const discount =
    originalPriceNum != null && originalPriceNum > 0
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      : undefined;

  const m = (ns: string, key: string) => getMetafield(product, ns, key);
  const length = fallback(m("dimensions", "length"), "—");
  const width = fallback(m("dimensions", "width"), "—");
  const height = fallback(m("dimensions", "height"), "—");
  const weight = fallback(m("dimensions", "weight"), "—");
  const wood = fallback(m("materials", "primary_wood"), "—");
  const finishVal = fallback(m("materials", "finish"), "—");
  const fabricationTime = fallback(m("production", "fabrication_time"), "—");
  const artistName = fallback(m("artist", "name"), "Davidsons Design");
  const warrantyYears = m("care", "warranty_years");
  const warrantyNum = warrantyYears ? parseInt(warrantyYears, 10) : undefined;
  const careInstructions = m("care", "care_instructions");
  const careLines = careInstructions
    ? careInstructions.split(/\n/).map((s) => s.trim()).filter(Boolean)
    : [];

  const dimensions = { length, width, height };
  const specifications = {
    length: length === "—" ? "—" : `${length} cm`,
    width: width === "—" ? "—" : `${width} cm`,
    height: height === "—" ? "—" : `${height} cm`,
    weight,
    wood,
    finish: finishVal,
  };
  const descriptionTab = {
    title: product.title,
    paragraphs: product.description ? [product.description] : [],
  };
  const care = {
    cleaning: careLines.length > 0 ? careLines : [],
    avoid: [] as string[],
    maintenance: [] as string[],
  };
  const artist = {
    name: artistName,
    imageUrl: "https://via.placeholder.com/300x400?text=Artesano",
    bio: [],
    quote: "",
    warrantyText:
      warrantyNum != null && warrantyNum > 0
        ? `Este producto incluye <strong>${warrantyNum} ${warrantyNum === 1 ? "año" : "años"} de garantía</strong> contra defectos de fabricación.`
        : "",
  };

  return (
    <ProductDetailLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb
          category="Productos"
          categoryHref="/products"
          productName={product.title}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={images} productTitle={product.title} />
          <ProductInfo
            title={product.title}
            price={priceNum}
            originalPrice={originalPriceNum}
            discount={discount}
            description={product.description ?? ""}
            features={[]}
            dimensions={dimensions}
            fabricationTime={fabricationTime === "—" ? undefined : fabricationTime}
            warranty={warrantyNum}
            artistName={artistName === "Davidsons Design" ? undefined : artistName}
            variantId={product.variants?.[0]?.id}
          />
        </div>

        <ProductTabs
          description={descriptionTab}
          specifications={specifications}
          care={care}
          artist={artist}
        />
      </div>
    </ProductDetailLayout>
  );
}

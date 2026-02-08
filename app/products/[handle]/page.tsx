import { notFound } from "next/navigation";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs";
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

// Datos de ejemplo para el diseño V1 (cuando no hay producto en Shopify o para demo)
const productDataV1 = {
  title: "Tabla para Picar y Charcutería",
  category: "Tablas de Cortar",
  categoryHref: "/products",
  price: 850,
  originalPrice: 1000,
  discount: 15,
  description:
    "Tabla artesanal elaborada con maderas nobles mexicanas (Cedro, Rosa Morada y Parota). Perfecta para picar, servir o decorar. Acabado con aceite mineral grado alimenticio y cera de abeja.",
  images: [
    {
      url: "https://via.placeholder.com/800x800?text=Tabla+Principal",
      alt: "Vista principal",
    },
    {
      url: "https://via.placeholder.com/200x200?text=Vista+1",
      alt: "Vista 1",
    },
    {
      url: "https://via.placeholder.com/200x200?text=Vista+2",
      alt: "Vista 2",
    },
    {
      url: "https://via.placeholder.com/200x200?text=Vista+3",
      alt: "Vista 3",
    },
    {
      url: "https://via.placeholder.com/200x200?text=Vista+4",
      alt: "Vista 4",
    },
  ],
  features: [
    "100% Hecho a mano por artesanos mexicanos",
    "Maderas nobles con acabado alimenticio",
    "Cada pieza es única con vetas naturales",
    "1 año de garantía contra defectos",
  ],
  dimensions: {
    length: "27-28",
    width: "34-36",
    height: "1.5-2",
  },
  fabricationTime: "3 días",
  warranty: 1,
  artistName: "David Pérez Muro",
  descriptionTab: {
    title: "Tabla Artesanal para Picar y Charcutería",
    paragraphs: [
      'Eleva tu cocina y tus presentaciones con una tabla artesanal elaborada con una cuidadosa combinación de <strong>cedro, rosa morada y parota</strong>, maderas naturales seleccionadas por su resistencia, durabilidad y vetas únicas.',
      'Cada tabla es <strong>única</strong>, con patrones orgánicos que resaltan el contraste natural de cada madera. Su acabado está realizado con <strong>aceite mineral grado alimenticio y cera de abeja</strong>, lo que protege la madera, realza su color y la hace segura para el contacto con alimentos.',
      'Ideal para <strong>picar, servir quesos, carnes frías, frutas o pan</strong>, o como pieza decorativa para tu cocina o mesa.',
    ],
    note:
      '<strong>Nota:</strong> Por tratarse de un producto artesanal hecho con maderas naturales, cada pieza puede variar ligeramente en tonalidad, vetas y dimensiones.',
  },
  specifications: {
    length: "27 - 28 cm",
    width: "34 - 36 cm",
    height: "1.5 - 2 cm",
    weight: "3 kg",
    wood: "Cedro, Rosa Morada, Parota",
    finish: "Aceite Mineral + Cera de Abeja",
  },
  care: {
    cleaning: [
      "Lava a mano con agua tibia y jabón suave",
      "Seca inmediatamente con un paño limpio",
      "Deja secar completamente en posición vertical",
    ],
    avoid: [
      "No remojar ni meter al lavavajillas",
      "No exponer a calor directo (hornos, estufas)",
      "No dejar húmeda por tiempo prolongado",
    ],
    maintenance: [
      "Aplica aceite mineral cada 2-3 meses",
      "Lija suavemente si aparecen manchas",
      "Almacena en lugar seco y ventilado",
    ],
  },
  artist: {
    name: "David Pérez Muro",
    imageUrl:
      "https://via.placeholder.com/300x400?text=David+P%C3%A9rez+Muro",
    bio: [
      "Maestro artesano con más de 15 años de experiencia en carpintería y ebanistería. Especializado en la creación de piezas únicas que combinan técnicas tradicionales con diseño contemporáneo.",
      "Cada tabla es elaborada a mano en su taller en Hermosillo, Sonora, seleccionando cuidadosamente cada pieza de madera y aplicando acabados naturales de la más alta calidad.",
    ],
    quote:
      "Mi objetivo es crear piezas que duren generaciones, que cuenten historias y que aporten belleza y funcionalidad a cada hogar.",
    warrantyText:
      'Este producto incluye <strong>1 año de garantía</strong> contra defectos de fabricación. La garantía cubre grietas estructurales o desprendimientos del acabado bajo uso normal.',
  },
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  // Diseño V1 con datos de ejemplo para la tabla de picar
  const useV1Design =
    handle === "tabla-para-picar-y-charcuteria" ||
    handle === "tabla-picar-charcuteria";

  if (useV1Design) {
    const d = productDataV1;
    const mainImage = { url: d.images[0]!.url, alt: d.images[0]!.alt };
    const thumbImages = [
      { url: "https://via.placeholder.com/200x200?text=Vista+1", alt: "Vista 1" },
      { url: "https://via.placeholder.com/200x200?text=Vista+2", alt: "Vista 2" },
      { url: "https://via.placeholder.com/200x200?text=Vista+3", alt: "Vista 3" },
      { url: "https://via.placeholder.com/200x200?text=Vista+4", alt: "Vista 4" },
    ];
    const galleryImages = [mainImage, ...thumbImages];

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductBreadcrumb
          category={d.category}
          categoryHref={d.categoryHref}
          productName={d.title}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={galleryImages}
            productTitle={d.title}
          />
          <ProductInfo
            title={d.title}
            price={d.price}
            originalPrice={d.originalPrice}
            discount={d.discount}
            description={d.description}
            features={d.features}
            dimensions={d.dimensions}
            fabricationTime={d.fabricationTime}
            warranty={d.warranty}
            artistName={d.artistName}
          />
        </div>

        <ProductTabs
          description={d.descriptionTab}
          specifications={d.specifications}
          care={d.care}
          artist={d.artist}
        />
      </div>
    );
  }

  // Resto de productos: fetch desde Shopify y vista simple actual
  const { product } = await storefrontQuery<ProductResponse>(PRODUCT_QUERY, {
    handle,
  });

  if (!product) {
    notFound();
  }

  const image = product.featuredImage ?? product.variants?.nodes?.[0]?.image;
  const price =
    product.priceRange?.minVariantPrice ??
    product.variants?.nodes?.[0]?.price;

  // Si hay producto de Shopify, usar diseño V1 con datos mapeados cuando sea posible
  const images = image
    ? [
        { url: image.url, alt: image.altText ?? product.title },
        ...(product.variants?.nodes?.filter((v) => v.image?.url).slice(0, 4).map((v) => ({
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

  const priceNum = price ? parseFloat(price.amount) : 0;

  return (
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
          description={product.description ?? ""}
          features={[]}
          dimensions={{ length: "—", width: "—", height: "—" }}
        />
      </div>

      {product.description && (
        <ProductTabs
          description={{
            title: product.title,
            paragraphs: [product.description],
          }}
          specifications={{
            length: "—",
            width: "—",
            height: "—",
            weight: "—",
            wood: "—",
            finish: "—",
          }}
          care={{
            cleaning: [],
            avoid: [],
            maintenance: [],
          }}
          artist={{
            name: "Davidsons Design",
            imageUrl: "https://via.placeholder.com/300x400?text=Artesano",
            bio: [],
            quote: "",
            warrantyText: "",
          }}
        />
      )}
    </div>
  );
}

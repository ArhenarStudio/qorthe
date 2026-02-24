// ═══════════════════════════════════════════════════════════════
// MEDUSA ADAPTER — Implementa CommerceProvider usando Medusa v2
//
// Conecta el frontend DSD con el backend MedusaJS.
// Todas las llamadas pasan por la Store API (/store/*)
// con publishable API key en el header.
//
// Requiere en .env.local:
//   NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
//   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
// ═══════════════════════════════════════════════════════════════

import type {
  CommerceProvider,
  CommerceProduct,
  CommerceCart,
  CommerceCartLine,
  CommerceVariant,
  CommerceImage,
  CommerceMoney,
  CommerceMetafield,
  CommerceCustomerCreateResult,
} from "./types";

const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

const CART_ID_STORAGE_KEY = "medusa_cart_id";

// ─── Fetch helper ───

async function medusaFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${MEDUSA_URL}/store${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Medusa API error ${response.status}: ${response.statusText} — ${errorBody}`
    );
  }

  return response.json();
}

// ─── Medusa v2 response types (internal) ───

interface MedusaImage {
  id: string;
  url: string;
  metadata?: Record<string, unknown> | null;
}

interface MedusaPrice {
  id: string;
  amount: number;
  currency_code: string;
  min_quantity?: number | null;
  max_quantity?: number | null;
}

interface MedusaVariant {
  id: string;
  title: string;
  sku?: string | null;
  manage_inventory: boolean;
  allow_backorder: boolean;
  calculated_price?: {
    calculated_amount: number;
    currency_code: string;
    original_amount?: number;
  } | null;
  prices?: MedusaPrice[];
  inventory_quantity?: number;
}

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  type?: { value: string } | null;
  thumbnail: string | null;
  images?: MedusaImage[];
  variants?: MedusaVariant[];
  metadata?: Record<string, string> | null;
  status: string;
}

interface MedusaLineItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  variant_id: string;
  variant?: {
    id: string;
    title: string;
    product?: {
      title: string;
      thumbnail: string | null;
    };
  };
  thumbnail?: string | null;
}

interface MedusaCart {
  id: string;
  items?: MedusaLineItem[];
  total: number;
  subtotal: number;
  currency_code?: string;
  region?: {
    currency_code: string;
  };
  payment_collection?: {
    payment_sessions?: Array<{ provider_id: string }>;
  };
}

// ─── Mapping helpers ───

function mapImage(img: MedusaImage | null | undefined): CommerceImage | null {
  if (!img?.url) return null;
  return {
    url: img.url,
    altText: null,
  };
}

function mapMoney(amount: number, currencyCode: string): CommerceMoney {
  return {
    amount: amount / 100, // Medusa stores amounts in cents
    currencyCode: currencyCode.toUpperCase(),
  };
}

function mapVariant(v: MedusaVariant, currencyCode: string): CommerceVariant {
  const price = v.calculated_price
    ? mapMoney(v.calculated_price.calculated_amount, v.calculated_price.currency_code)
    : v.prices?.[0]
      ? mapMoney(v.prices[0].amount, v.prices[0].currency_code)
      : mapMoney(0, currencyCode);

  const compareAtPrice = v.calculated_price?.original_amount != null &&
    v.calculated_price.original_amount !== v.calculated_price.calculated_amount
      ? mapMoney(v.calculated_price.original_amount, v.calculated_price.currency_code)
      : null;

  return {
    id: v.id,
    title: v.title || "Default",
    availableForSale: v.allow_backorder || (v.inventory_quantity ?? 1) > 0,
    price,
    compareAtPrice,
    image: null,
  };
}

function mapProduct(p: MedusaProduct, defaultCurrency = "MXN"): CommerceProduct {
  const variants = (p.variants ?? []).map((v) => mapVariant(v, defaultCurrency));

  // Extract metafields from product metadata
  const metafields: CommerceMetafield[] = [];
  if (p.metadata) {
    for (const [key, value] of Object.entries(p.metadata)) {
      // Support "namespace.key" format in metadata keys
      const parts = key.split(".");
      if (parts.length === 2) {
        metafields.push({ namespace: parts[0], key: parts[1], value: String(value) });
      } else {
        metafields.push({ namespace: "custom", key, value: String(value) });
      }
    }
  }

  const minPrice = variants.length > 0
    ? variants.reduce(
        (min, v) => (v.price.amount < min.price.amount ? v : min),
        variants[0]
      ).price
    : mapMoney(0, defaultCurrency);

  const featuredImage: CommerceImage | null = p.thumbnail
    ? { url: p.thumbnail, altText: p.title }
    : p.images?.[0]
      ? mapImage(p.images[0])
      : null;

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description ?? "",
    productType: p.type?.value ?? "",
    featuredImage,
    variants,
    priceRange: { minVariantPrice: minPrice },
    metafields,
  };
}

function mapCartLine(item: MedusaLineItem, currencyCode: string): CommerceCartLine {
  return {
    id: item.id,
    quantity: item.quantity,
    merchandise: {
      id: item.variant_id,
      productTitle: item.variant?.product?.title ?? item.title,
      price: mapMoney(item.unit_price, currencyCode),
      image: item.thumbnail
        ? { url: item.thumbnail, altText: item.title }
        : item.variant?.product?.thumbnail
          ? { url: item.variant.product.thumbnail, altText: item.title }
          : null,
    },
  };
}

function mapCart(cart: MedusaCart): CommerceCart {
  const currencyCode = cart.currency_code ?? cart.region?.currency_code ?? "mxn";

  return {
    id: cart.id,
    checkoutUrl: null,
    lines: (cart.items ?? []).map((item) => mapCartLine(item, currencyCode)),
    subtotal: mapMoney(cart.subtotal ?? cart.total ?? 0, currencyCode),
  };
}

// ═══════════════════════════════════════════════════════════════
// MEDUSA PROVIDER — Implementación real
// ═══════════════════════════════════════════════════════════════

export const medusaProvider: CommerceProvider = {
  name: "medusa",

  // ─── Products ───

  async getProducts(first: number): Promise<CommerceProduct[]> {
    const data = await medusaFetch<{
      products: MedusaProduct[];
      count: number;
    }>(
      `/products?limit=${first}&fields=*variants,*variants.prices,*images`
    );
    return data.products.map((p) => mapProduct(p));
  },

  async getProductByHandle(handle: string): Promise<CommerceProduct | null> {
    const data = await medusaFetch<{
      products: MedusaProduct[];
    }>(
      `/products?handle=${encodeURIComponent(handle)}&fields=*variants,*variants.prices,*images`
    );
    if (!data.products.length) return null;
    return mapProduct(data.products[0]);
  },

  // ─── Cart ───

  async createCart(): Promise<string> {
    // Find the México region for MXN pricing
    const regionsData = await medusaFetch<{
      regions: Array<{ id: string; currency_code: string; name: string }>;
    }>("/regions");

    const mxRegion = regionsData.regions.find(
      (r) => r.currency_code === "mxn"
    );

    const data = await medusaFetch<{ cart: MedusaCart }>("/carts", {
      method: "POST",
      body: JSON.stringify({
        region_id: mxRegion?.id,
      }),
    });
    return data.cart.id;
  },

  async getCart(cartId: string): Promise<CommerceCart | null> {
    try {
      const data = await medusaFetch<{ cart: MedusaCart }>(
        `/carts/${cartId}?fields=*items,*items.variant,*items.variant.product`
      );
      return mapCart(data.cart);
    } catch {
      // Cart not found or expired
      return null;
    }
  },

  async addToCart(
    cartId: string,
    variantId: string,
    quantity: number
  ): Promise<CommerceCart> {
    const data = await medusaFetch<{ cart: MedusaCart }>(
      `/carts/${cartId}/line-items`,
      {
        method: "POST",
        body: JSON.stringify({
          variant_id: variantId,
          quantity,
        }),
      }
    );
    return mapCart(data.cart);
  },

  async updateCartLine(
    cartId: string,
    lineId: string,
    quantity: number
  ): Promise<CommerceCart> {
    const data = await medusaFetch<{ cart: MedusaCart }>(
      `/carts/${cartId}/line-items/${lineId}`,
      {
        method: "POST",
        body: JSON.stringify({ quantity }),
      }
    );
    return mapCart(data.cart);
  },

  async removeFromCart(
    cartId: string,
    lineId: string
  ): Promise<CommerceCart> {
    // DELETE returns a partial cart without currency_code/region.
    // So we delete first, then re-fetch the full cart.
    await medusaFetch<unknown>(
      `/carts/${cartId}/line-items/${lineId}`,
      { method: "DELETE" }
    );
    // Re-fetch full cart with items and region
    const data = await medusaFetch<{ cart: MedusaCart }>(
      `/carts/${cartId}?fields=*items,*items.variant,*items.variant.product,*region`
    );
    return mapCart(data.cart);
  },

  // ─── Customer ───

  async createCustomer(
    email: string,
    _password: string,
    firstName?: string | null,
    lastName?: string | null
  ): Promise<CommerceCustomerCreateResult> {
    try {
      const data = await medusaFetch<{
        customer: { id: string };
      }>("/customers", {
        method: "POST",
        body: JSON.stringify({
          email,
          first_name: firstName ?? "",
          last_name: lastName ?? "",
        }),
      });
      return {
        success: true,
        customerId: data.customer.id,
      };
    } catch (err) {
      return {
        success: false,
        errors: [err instanceof Error ? err.message : "Unknown error creating customer"],
      };
    }
  },

  // ─── Checkout ───

  async updateCartDetails(
    cartId: string,
    details: {
      email?: string;
      shipping_address?: {
        first_name: string;
        last_name: string;
        address_1: string;
        address_2?: string;
        city: string;
        province: string;
        postal_code: string;
        country_code: string;
        phone?: string;
      };
    }
  ): Promise<void> {
    await medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}`, {
      method: "POST",
      body: JSON.stringify(details),
    });
  },

  async addShippingMethod(
    cartId: string,
    optionId: string
  ): Promise<void> {
    await medusaFetch<{ cart: MedusaCart }>(
      `/carts/${cartId}/shipping-methods`,
      {
        method: "POST",
        body: JSON.stringify({ option_id: optionId }),
      }
    );
  },

  async getCartShippingMethods(
    cartId: string
  ): Promise<Array<{ id: string; shipping_option_id: string }>> {
    const data = await medusaFetch<{ cart: { shipping_methods?: Array<{ id: string; shipping_option_id: string }> } }>(
      `/carts/${cartId}?fields=*shipping_methods`
    );
    return data.cart?.shipping_methods || [];
  },

  async getShippingOptions(
    cartId: string
  ): Promise<Array<{ id: string; name: string; amount: number; currency_code: string }>> {
    const data = await medusaFetch<{
      shipping_options: Array<{
        id: string;
        name: string;
        amount: number;
        prices: Array<{ amount: number; currency_code: string }>;
      }>;
    }>(`/shipping-options?cart_id=${cartId}`);
    return data.shipping_options.map((so) => ({
      id: so.id,
      name: so.name,
      amount: so.amount ?? so.prices?.[0]?.amount ?? 0,
      currency_code: so.prices?.[0]?.currency_code ?? "mxn",
    }));
  },

  // ─── Storage helpers ───

  getStoredCartId(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(CART_ID_STORAGE_KEY);
  },

  setStoredCartId(cartId: string | null): void {
    if (typeof window === "undefined") return;
    if (cartId == null) {
      window.localStorage.removeItem(CART_ID_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
    }
  },
};

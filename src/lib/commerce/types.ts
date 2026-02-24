// ═══════════════════════════════════════════════════════════════
// COMMERCE PROVIDER — Capa de abstracción entre UI y backend
//
// Toda la lógica de commerce (productos, carrito, checkout,
// customers) pasa por estas interfaces. El provider activo
// (MedusaJS) implementa los métodos reales.
//
// Los módulos NUNCA importan del backend directamente.
// Siempre importan de @/lib/commerce.
// ═══════════════════════════════════════════════════════════════

// ─── Product Types ───

export interface CommerceImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface CommerceMoney {
  amount: number;
  currencyCode: string;
}

export interface CommerceVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: CommerceMoney;
  compareAtPrice: CommerceMoney | null;
  image: CommerceImage | null;
}

export interface CommerceMetafield {
  namespace: string;
  key: string;
  value: string;
}

export interface CommerceProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  featuredImage: CommerceImage | null;
  variants: CommerceVariant[];
  priceRange: {
    minVariantPrice: CommerceMoney;
  };
  metafields: CommerceMetafield[];
}

// ─── Cart Types ───

export interface CommerceCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    productTitle: string;
    price: CommerceMoney;
    image: CommerceImage | null;
  };
}

export interface CommerceCart {
  id: string;
  checkoutUrl: string | null;
  lines: CommerceCartLine[];
  subtotal: CommerceMoney;
}

// ─── Customer Types ───

export interface CommerceCustomerCreateResult {
  success: boolean;
  customerId?: string;
  errors?: string[];
}

// ─── Provider Interface ───

export interface CommerceProvider {
  name: "medusa";

  // Products
  getProducts(first: number): Promise<CommerceProduct[]>;
  getProductByHandle(handle: string): Promise<CommerceProduct | null>;

  // Cart
  createCart(): Promise<string>;
  getCart(cartId: string): Promise<CommerceCart | null>;
  addToCart(cartId: string, variantId: string, quantity: number): Promise<CommerceCart>;
  updateCartLine(cartId: string, lineId: string, quantity: number): Promise<CommerceCart>;
  removeFromCart(cartId: string, lineId: string): Promise<CommerceCart>;

  // Checkout
  updateCartDetails(
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
  ): Promise<void>;
  addShippingMethod(cartId: string, optionId: string): Promise<void>;
  getShippingOptions(
    cartId: string
  ): Promise<Array<{ id: string; name: string; amount: number; currency_code: string }>>;

  // Customer sync (auth stays in Supabase, this syncs to commerce backend)
  createCustomer(
    email: string,
    password: string,
    firstName?: string | null,
    lastName?: string | null
  ): Promise<CommerceCustomerCreateResult>;

  // Storage helpers
  getStoredCartId(): string | null;
  setStoredCartId(cartId: string | null): void;
}

// ─── Metafield helper ───

export function getMetafield(
  product: { metafields?: CommerceMetafield[] },
  namespace: string,
  key: string
): string | undefined {
  if (!namespace || !key) return undefined;
  const m = product.metafields?.find(
    (f) => f.namespace === namespace && f.key === key
  );
  return m?.value;
}

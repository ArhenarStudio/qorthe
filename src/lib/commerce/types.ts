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

/** Datos de personalización láser adjuntos a un line item */
export interface LaserCustomizationData {
  enabled: boolean;
  fileUrl: string | null;
  fileName: string | null;
  widthCm: number | null;
  heightCm: number | null;
  position: 'center' | 'bottom-right' | 'bottom-left' | 'custom';
  confirmed: boolean;
}

export interface CommerceCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    productTitle: string;
    price: CommerceMoney;
    image: CommerceImage | null;
  };
  metadata?: Record<string, unknown> | null;
}

/** Promoción aplicada al carrito (viene de Medusa Promotion Module) */
export interface CommercePromotion {
  id: string;
  code: string | null;
  type: string;             // "standard" | "buyget"
  is_automatic: boolean;
  application_method?: {
    type: string;           // "percentage" | "fixed"
    value: number;          // ej. 10 = 10%
    allocation: string;     // "each" | "across"
    target_type: string;    // "order" | "items" | "shipping_methods"
  } | null;
}

export interface CommerceCart {
  id: string;
  checkoutUrl: string | null;
  lines: CommerceCartLine[];
  promotions: CommercePromotion[];
  subtotal: CommerceMoney;
  shippingTotal: CommerceMoney;
  discountTotal: CommerceMoney;
  taxTotal: CommerceMoney;
  total: CommerceMoney;
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
  addToCart(cartId: string, variantId: string, quantity: number, metadata?: Record<string, unknown>): Promise<CommerceCart>;
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
  getCartShippingMethods(cartId: string): Promise<Array<{ id: string; shipping_option_id: string }>>;
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

  // Promotions (Medusa v2 Promotion Module)
  applyPromoCode(cartId: string, code: string): Promise<CommerceCart>;
  removePromoCode(cartId: string, code: string): Promise<CommerceCart>;

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

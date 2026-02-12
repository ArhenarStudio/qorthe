// ═══════════════════════════════════════════════════════════════
// SHOPIFY ADAPTER — Implementa CommerceProvider usando Shopify
// ═══════════════════════════════════════════════════════════════

import { storefrontQuery } from "@/lib/shopify/client";
import {
  createCart as shopifyCreateCart,
  getCart as shopifyGetCart,
  addToCart as shopifyAddToCart,
  updateCartLine as shopifyUpdateCartLine,
  removeFromCart as shopifyRemoveFromCart,
  getStoredCartId as shopifyGetStoredCartId,
  setStoredCartId as shopifySetStoredCartId,
  type ShopifyCart,
} from "@/lib/shopify/cart";
import {
  createShopifyCustomer,
} from "@/lib/shopify/customer";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries";
import type {
  CommerceProvider,
  CommerceProduct,
  CommerceCart,
  CommerceCartLine,
  CommerceCustomerCreateResult,
  CommerceMoney,
  CommerceMetafield,
} from "./types";

// ─── Query for single product by handle ───

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      productType
      featuredImage { url altText width height }
      variants(first: 10) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { url altText width height }
        }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "material" },
        { namespace: "custom", key: "dimensiones" },
        { namespace: "custom", key: "peso" },
        { namespace: "custom", key: "acabado" },
        { namespace: "custom", key: "artista" },
        { namespace: "custom", key: "tiempo_produccion" },
        { namespace: "custom", key: "origen_madera" },
        { namespace: "custom", key: "cuidados" },
        { namespace: "custom", key: "garantia" },
        { namespace: "custom", key: "certificaciones" }
      ]) {
        namespace
        key
        value
      }
    }
  }
`;

// ─── Mappers: Shopify → Commerce ───

function mapMoney(m: { amount: string; currencyCode: string } | null | undefined): CommerceMoney {
  return {
    amount: m ? parseFloat(m.amount) : 0,
    currencyCode: m?.currencyCode ?? "MXN",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(node: any): CommerceProduct {
  const variants = (node.variants?.nodes ?? []).map((v: any) => ({
    id: v.id,
    title: v.title ?? "",
    availableForSale: v.availableForSale ?? true,
    price: mapMoney(v.price),
    compareAtPrice: v.compareAtPrice ? mapMoney(v.compareAtPrice) : null,
    image: v.image ?? null,
  }));

  const metafields: CommerceMetafield[] = (node.metafields ?? [])
    .filter((m: any) => m != null)
    .map((m: any) => ({
      namespace: m.namespace,
      key: m.key,
      value: m.value,
    }));

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    productType: node.productType ?? "",
    featuredImage: node.featuredImage ?? null,
    variants,
    priceRange: {
      minVariantPrice: mapMoney(node.priceRange?.minVariantPrice),
    },
    metafields,
  };
}

function mapCart(cart: ShopifyCart | null): CommerceCart | null {
  if (!cart) return null;
  const lines: CommerceCartLine[] = (cart.lines?.nodes ?? []).map((line) => ({
    id: line.id,
    quantity: line.quantity,
    merchandise: {
      id: line.merchandise.id,
      productTitle: line.merchandise.product?.title ?? "Product",
      price: mapMoney(line.merchandise.price),
      image: line.merchandise.image ?? null,
    },
  }));

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl ?? null,
    lines,
    subtotal: mapMoney(cart.cost?.subtotalAmount),
  };
}

// ─── Shopify Provider ───

export const shopifyProvider: CommerceProvider = {
  name: "shopify",

  async getProducts(first: number): Promise<CommerceProduct[]> {
    interface Response {
      products: { nodes: any[] };
    }
    const data = await storefrontQuery<Response>(PRODUCTS_QUERY, { first });
    return (data.products?.nodes ?? []).map(mapProduct);
  },

  async getProductByHandle(handle: string): Promise<CommerceProduct | null> {
    interface Response {
      product: any | null;
    }
    const data = await storefrontQuery<Response>(PRODUCT_BY_HANDLE_QUERY, { handle });
    return data.product ? mapProduct(data.product) : null;
  },

  async createCart(): Promise<string> {
    return shopifyCreateCart();
  },

  async getCart(cartId: string): Promise<CommerceCart | null> {
    const cart = await shopifyGetCart(cartId);
    return mapCart(cart);
  },

  async addToCart(cartId: string, variantId: string, quantity: number): Promise<CommerceCart> {
    const cart = await shopifyAddToCart(cartId, variantId, quantity);
    const mapped = mapCart(cart);
    if (!mapped) throw new Error("Failed to add to cart");
    return mapped;
  },

  async updateCartLine(cartId: string, lineId: string, quantity: number): Promise<CommerceCart> {
    const cart = await shopifyUpdateCartLine(cartId, lineId, quantity);
    const mapped = mapCart(cart);
    if (!mapped) throw new Error("Failed to update cart line");
    return mapped;
  },

  async removeFromCart(cartId: string, lineId: string): Promise<CommerceCart> {
    const cart = await shopifyRemoveFromCart(cartId, lineId);
    const mapped = mapCart(cart);
    if (!mapped) throw new Error("Failed to remove from cart");
    return mapped;
  },

  async createCustomer(
    email: string,
    password: string,
    firstName?: string | null,
    lastName?: string | null
  ): Promise<CommerceCustomerCreateResult> {
    const result = await createShopifyCustomer(email, password, firstName, lastName);
    return {
      success: result.success,
      customerId: result.success ? (result as any).customerId : undefined,
      errors: result.success ? undefined : (result as any).errors,
    };
  },

  getStoredCartId: shopifyGetStoredCartId,
  setStoredCartId: shopifySetStoredCartId,
};

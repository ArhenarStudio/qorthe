import { storefrontQuery } from "./client";

const CART_CREATE = `
  mutation cartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

const CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              product {
                title
              }
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

const CART_LINES_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                product { title }
                price { amount currencyCode }
                image { url altText }
              }
            }
          }
        }
        cost {
          subtotalAmount { amount currencyCode }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                product { title }
                price { amount currencyCode }
                image { url altText }
              }
            }
          }
        }
        cost {
          subtotalAmount { amount currencyCode }
        }
      }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                product { title }
                price { amount currencyCode }
                image { url altText }
              }
            }
          }
        }
        cost {
          subtotalAmount { amount currencyCode }
        }
      }
    }
  }
`;

export interface CartLineNode {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    product: { title: string };
    price: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
  };
}

export interface CartCost {
  subtotalAmount: { amount: string; currencyCode: string };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string | null;
  lines: { nodes: CartLineNode[] };
  cost: CartCost;
}

interface CartCreateResponse {
  cartCreate: { cart: ShopifyCart };
}

interface CartResponse {
  cart: ShopifyCart | null;
}

interface CartLinesAddResponse {
  cartLinesAdd: { cart: ShopifyCart };
}

interface CartLinesUpdateResponse {
  cartLinesUpdate: { cart: ShopifyCart };
}

interface CartLinesRemoveResponse {
  cartLinesRemove: { cart: ShopifyCart };
}

const CART_ID_STORAGE_KEY = "shopify_cart_id";

export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_ID_STORAGE_KEY);
}

export function setStoredCartId(cartId: string | null): void {
  if (typeof window === "undefined") return;
  if (cartId == null) {
    window.localStorage.removeItem(CART_ID_STORAGE_KEY);
  } else {
    window.localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
  }
}

/** Crea un carrito vacío. Retorna el cartId (GID). */
export async function createCart(): Promise<string> {
  const data = await storefrontQuery<CartCreateResponse>(CART_CREATE);
  const cart = data.cartCreate?.cart;
  if (!cart?.id) {
    throw new Error("Cart creation failed");
  }
  return cart.id;
}

/** Obtiene el carrito completo. */
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await storefrontQuery<CartResponse>(CART_QUERY, { cartId });
  return data.cart ?? null;
}

/** Agrega una línea al carrito. merchandiseId = variant GID. */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<ShopifyCart> {
  const data = await storefrontQuery<CartLinesAddResponse>(CART_LINES_ADD, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });
  const cart = data.cartLinesAdd?.cart;
  if (!cart) {
    throw new Error("Failed to add to cart");
  }
  return cart;
}

/** Actualiza la cantidad de una línea. lineId = cart line GID. */
export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
  const data = await storefrontQuery<CartLinesUpdateResponse>(CART_LINES_UPDATE, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const cart = data.cartLinesUpdate?.cart;
  if (!cart) {
    throw new Error("Failed to update cart line");
  }
  return cart;
}

/** Elimina una línea del carrito. */
export async function removeFromCart(
  cartId: string,
  lineId: string
): Promise<ShopifyCart> {
  const data = await storefrontQuery<CartLinesRemoveResponse>(CART_LINES_REMOVE, {
    cartId,
    lineIds: [lineId],
  });
  const cart = data.cartLinesRemove?.cart;
  if (!cart) {
    throw new Error("Failed to remove from cart");
  }
  return cart;
}

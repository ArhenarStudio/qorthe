// ═══════════════════════════════════════════════════════════════
// MEDUSA ADAPTER — Implementa CommerceProvider usando Medusa v2
//
// TODO: Implementar cuando Medusa backend esté configurado.
// Este archivo es el placeholder con la estructura lista.
//
// Requiere:
//   - Medusa backend corriendo (PostgreSQL + Redis)
//   - NEXT_PUBLIC_MEDUSA_BACKEND_URL en .env.local
//   - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY en .env.local
// ═══════════════════════════════════════════════════════════════

import type {
  CommerceProvider,
  CommerceProduct,
  CommerceCart,
  CommerceCustomerCreateResult,
} from "./types";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

const CART_ID_STORAGE_KEY = "medusa_cart_id";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function medusaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${MEDUSA_URL}/store${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Medusa API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const medusaProvider: CommerceProvider = {
  name: "medusa",

  async getProducts(_first: number): Promise<CommerceProduct[]> {
    // TODO: GET /store/products?limit={first}
    // Map Medusa product → CommerceProduct
    throw new Error("Medusa provider not implemented yet — getProducts");
  },

  async getProductByHandle(_handle: string): Promise<CommerceProduct | null> {
    // TODO: GET /store/products?handle={handle}
    // Map Medusa product → CommerceProduct
    throw new Error("Medusa provider not implemented yet — getProductByHandle");
  },

  async createCart(): Promise<string> {
    // TODO: POST /store/carts
    // Return cart.id
    throw new Error("Medusa provider not implemented yet — createCart");
  },

  async getCart(_cartId: string): Promise<CommerceCart | null> {
    // TODO: GET /store/carts/{cartId}
    // Map Medusa cart → CommerceCart
    throw new Error("Medusa provider not implemented yet — getCart");
  },

  async addToCart(_cartId: string, _variantId: string, _quantity: number): Promise<CommerceCart> {
    // TODO: POST /store/carts/{cartId}/line-items
    throw new Error("Medusa provider not implemented yet — addToCart");
  },

  async updateCartLine(_cartId: string, _lineId: string, _quantity: number): Promise<CommerceCart> {
    // TODO: POST /store/carts/{cartId}/line-items/{lineId}
    throw new Error("Medusa provider not implemented yet — updateCartLine");
  },

  async removeFromCart(_cartId: string, _lineId: string): Promise<CommerceCart> {
    // TODO: DELETE /store/carts/{cartId}/line-items/{lineId}
    throw new Error("Medusa provider not implemented yet — removeFromCart");
  },

  async createCustomer(
    _email: string,
    _password: string,
    _firstName?: string | null,
    _lastName?: string | null
  ): Promise<CommerceCustomerCreateResult> {
    // TODO: POST /store/customers
    // Auth stays in Supabase, this just syncs customer data to Medusa
    throw new Error("Medusa provider not implemented yet — createCustomer");
  },

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

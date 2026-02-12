// ═══════════════════════════════════════════════════════════════
// COMMERCE — Punto de entrada único
//
// TODOS los módulos importan de aquí, nunca de shopify/ o medusa/
//
// import { commerce, getMetafield } from "@/lib/commerce";
// const products = await commerce.getProducts(50);
// ═══════════════════════════════════════════════════════════════

import type { CommerceProvider } from "./types";
import { shopifyProvider } from "./shopify-adapter";
// import { medusaProvider } from "./medusa-adapter";

// ─── Provider selection ───
// Cambiar a medusaProvider cuando el backend esté listo
const ACTIVE_PROVIDER: "shopify" | "medusa" = "shopify";

function getProvider(): CommerceProvider {
  switch (ACTIVE_PROVIDER) {
    case "shopify":
      return shopifyProvider;
    // case "medusa":
    //   return medusaProvider;
    default:
      return shopifyProvider;
  }
}

/** Active commerce provider instance */
export const commerce: CommerceProvider = getProvider();

// Re-export types and helpers
export { getMetafield } from "./types";
export type {
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

// ═══════════════════════════════════════════════════════════════
// COMMERCE — Punto de entrada único
//
// TODOS los módulos importan de aquí:
// import { commerce } from "@/lib/commerce";
// const products = await commerce.getProducts(50);
//
// Backend: MedusaJS
// ═══════════════════════════════════════════════════════════════

import type { CommerceProvider } from "./types";
import { medusaProvider } from "./medusa-adapter";

export const commerce: CommerceProvider = medusaProvider;

// Re-export types and helpers
export { getMetafield } from "./types";
export type {
  CommerceProvider,
  CommerceProduct,
  CommerceCart,
  CommerceCartLine,
  CommercePromotion,
  CommerceVariant,
  CommerceImage,
  CommerceMoney,
  CommerceMetafield,
  CommerceCustomerCreateResult,
} from "./types";

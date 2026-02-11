export { storefrontClient, storefrontQuery } from "./client";
export type {
  ShopifyImage,
  ShopifyMoney,
  ShopifyProductVariant,
  ShopifyMetafield,
  ShopifyProduct,
  ShopifyCollection,
  CartLine,
  Cart,
} from "./types";
export { PRODUCTS_QUERY } from "./queries";
export {
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  getStoredCartId,
  setStoredCartId,
} from "./cart";
export type { ShopifyCart, CartLineNode, CartCost } from "./cart";
export {
  createShopifyCustomer,
  getShopifyCustomerToken,
} from "./customer";
export type {
  CreateShopifyCustomerResult,
  GetShopifyCustomerTokenResult,
} from "./customer";

/** Obtiene el valor de un metafield por namespace y key. */
export function getMetafield(
  product: { metafields?: Array<{ namespace: string; key: string; value: string } | null> },
  namespace: string,
  key: string
): string | undefined {
  if (!namespace || !key) return undefined;
  const list = product.metafields ?? [];
  const m = list.find((f) => f && f.namespace === namespace && f.key === key);
  return m?.value;
}

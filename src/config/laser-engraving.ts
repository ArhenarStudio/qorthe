// ═══════════════════════════════════════════════════════════════
// LASER ENGRAVING CONFIG — IDs y precios del servicio de grabado
//
// El producto "Servicio de Grabado Láser" vive en Medusa como
// un producto normal con manage_inventory=false. Se auto-agrega
// al carrito cuando el usuario activa personalización y se
// auto-remueve cuando la desactiva.
//
// Metadata hide_from_catalog=true lo excluye del catálogo público.
// ═══════════════════════════════════════════════════════════════

/** Medusa Product ID for the laser engraving service */
export const LASER_SERVICE_PRODUCT_ID = "prod_01KJDYFQ2QQS4WBHJH5ERN3YE6";

/** Medusa Variant ID for the standard laser engraving */
export const LASER_SERVICE_VARIANT_ID = "variant_01KJDYFQ9P6KK4DBEGR51VG0XJ";

/** Price in MXN (display only — real price comes from Medusa) */
export const LASER_SERVICE_PRICE_MXN = 70;

/** SKU for identification in cart line items */
export const LASER_SERVICE_SKU = "DSD-LASER-STD-001";

/** Handle (used to filter from public catalog) */
export const LASER_SERVICE_HANDLE = "servicio-grabado-laser";

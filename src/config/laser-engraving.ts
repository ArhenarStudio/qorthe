// ═══════════════════════════════════════════════════════════════
// LASER ENGRAVING CONFIG — Modelo de negocio de grabado láser
//
// REGLAS DE NEGOCIO:
// 1. Primer diseño GRATIS con la compra de cualquier producto
// 2. Si el mismo diseño va en TODOS los productos → gratis
// 3. Cada diseño ADICIONAL (diferente) cuesta $70 MXN
// 4. Algunos productos pueden no ser elegibles (flag por producto)
//
// El producto "Servicio de Grabado Láser" ($70 MXN) en Medusa
// se usa SOLO para cobrar diseños adicionales (2do, 3ro, etc).
// manage_inventory=false, hide_from_catalog=true.
// ═══════════════════════════════════════════════════════════════

/** Medusa Product ID for the laser engraving service (extra designs) */
export const LASER_SERVICE_PRODUCT_ID = "prod_01KJDYFQ2QQS4WBHJH5ERN3YE6";

/** Medusa Variant ID for the standard laser engraving (extra designs) */
export const LASER_SERVICE_VARIANT_ID = "variant_01KJDYFQ9P6KK4DBEGR51VG0XJ";

/** Price per EXTRA design in MXN (display only — real price from Medusa) */
export const LASER_EXTRA_DESIGN_PRICE_MXN = 70;

/** SKU for identification in cart line items */
export const LASER_SERVICE_SKU = "DSD-LASER-STD-001";

/** Handle (used to filter from public catalog) */
export const LASER_SERVICE_HANDLE = "servicio-grabado-laser";

/** Number of free designs included per order */
export const LASER_FREE_DESIGNS_PER_ORDER = 1;

/** Max number of designs a customer can upload per order */
export const LASER_MAX_DESIGNS_PER_ORDER = 10;

/** Max file size in bytes (10MB) */
export const LASER_MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Accepted file types */
export const LASER_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];

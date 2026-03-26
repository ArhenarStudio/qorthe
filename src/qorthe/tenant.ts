/**
 * Komerzly — Tenant Model
 *
 * Define el modelo de tenant para la plataforma multi-tenant.
 * Qorthe es TENANT 0 — la plantilla base y proof-of-concept.
 *
 * REGLA: No agregar tenant_id a tablas existentes hasta post-lanzamiento DSD.
 * Este archivo define la FORMA del sistema para que el código futuro sea aditivo.
 */

// ─── Plan tiers ───────────────────────────────────────────────────────────────

export type TenantPlan = 'starter' | 'growth' | 'pro' | 'full';

export const TENANT_PLAN_LIMITS: Record<TenantPlan, {
  products: number;
  admins: number;
  monthlyOrders: number;
  modules: string[];
}> = {
  starter: {
    products: 50,
    admins: 1,
    monthlyOrders: 100,
    modules: ['catalog', 'checkout', 'orders'],
  },
  growth: {
    products: 500,
    admins: 3,
    monthlyOrders: 1000,
    modules: ['catalog', 'checkout', 'orders', 'marketing', 'loyalty', 'reviews'],
  },
  pro: {
    products: 5000,
    admins: 10,
    monthlyOrders: 10000,
    modules: [
      'catalog', 'checkout', 'orders', 'marketing', 'loyalty', 'reviews',
      'quotes', 'pos', 'b2b', 'shipping_advanced', 'automations',
    ],
  },
  full: {
    products: -1,       // ilimitado
    admins: -1,
    monthlyOrders: -1,
    modules: ['*'],     // todos los módulos
  },
};

// ─── Tenant config ────────────────────────────────────────────────────────────

export interface TenantConfig {
  /** Identificador único del tenant */
  id: string;
  /** Nombre visible de la tienda */
  storeName: string;
  /** Dominio principal (sin protocolo) */
  domain: string;
  /** Plan activo */
  plan: TenantPlan;
  /** Locale principal (BCP 47) */
  locale: string;
  /** Moneda ISO 4217 */
  currency: string;
  /** País de operación (ISO 3166-1 alpha-2) */
  country: string;
  /** IDs de módulos activos para este tenant */
  enabledModules: string[];
  /** Metadatos libres por tenant */
  meta?: Record<string, unknown>;
}

// ─── Tenant 0 — Qorthe ────────────────────────────────────────────
//
// Este es el tenant raíz de Komerzly.
// Tiene plan 'full' — acceso completo a todos los módulos.
// Sus datos viven en la misma DB que el sistema (no hay separación aún).
//
// Futuro: cuando Komerzly tenga múltiples tenants, este objeto
// se leerá desde la Platform Database en lugar de estar hardcodeado.

export const TENANT_0: TenantConfig = {
  id: 'qorthe',
  storeName: "Qorthe",
  domain: 'qorthe.com',
  plan: 'full',
  locale: 'es-MX',
  currency: 'MXN',
  country: 'MX',
  enabledModules: ['*'],
  meta: {
    rockSageVersion: '0.1.0',
    isTenant0: true,
    template: 'artisanal-wood',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verifica si un módulo está habilitado para un tenant dado.
 * Si enabledModules incluye '*', todos los módulos están habilitados.
 */
export function isTenantModuleEnabled(
  tenant: TenantConfig,
  moduleId: string
): boolean {
  if (tenant.enabledModules.includes('*')) return true;
  return tenant.enabledModules.includes(moduleId);
}

/**
 * Retorna el plan activo de un tenant.
 * Helper de conveniencia para condiciones en UI.
 */
export function tenantHasPlan(
  tenant: TenantConfig,
  plan: TenantPlan
): boolean {
  const order: TenantPlan[] = ['starter', 'growth', 'pro', 'full'];
  return order.indexOf(tenant.plan) >= order.indexOf(plan);
}

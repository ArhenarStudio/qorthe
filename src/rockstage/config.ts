/**
 * RockSage Commerce — Platform Config
 *
 * Configuración central de la plataforma. Lee el tenant activo
 * y expone helpers para feature-gating y resolución de módulos.
 *
 * ARQUITECTURA:
 *   - En DSD (Tenant 0): ACTIVE_TENANT = TENANT_0 (hardcoded, plan full)
 *   - En RockSage multi-tenant: ACTIVE_TENANT se resolverá desde
 *     Platform Database por domain/subdomain en el middleware.
 *
 * REGLA: Todo código que necesite saber "¿está activo este módulo?"
 * debe usar isModuleActive() de este archivo — nunca hardcodear condiciones.
 */

import { TENANT_0, isTenantModuleEnabled, type TenantConfig } from './tenant';
import { ROCKSAGE_MODULES, getModule, type RockSageModule } from './manifest';

// ─── Tenant activo ────────────────────────────────────────────────────────────
//
// Hoy: siempre TENANT_0 (DavidSon's Design).
// Futuro: se resolverá desde el request context (domain → tenant lookup).

export const ACTIVE_TENANT: TenantConfig = TENANT_0;

// ─── Versión de la plataforma ─────────────────────────────────────────────────

export const ROCKSAGE_VERSION = '0.1.0' as const;
export const ROCKSAGE_CODENAME = 'Tenant-0 Bootstrap' as const;

// ─── Feature gating ───────────────────────────────────────────────────────────

/**
 * Verifica si un módulo está activo para el tenant actual.
 *
 * @example
 *   if (isModuleActive('loyalty')) { ... }
 */
export function isModuleActive(moduleId: string): boolean {
  return isTenantModuleEnabled(ACTIVE_TENANT, moduleId);
}

/**
 * Retorna el módulo completo si está activo, null si no.
 * Útil para renderizado condicional con metadatos del módulo.
 */
export function getActiveModule(moduleId: string): RockSageModule | null {
  if (!isModuleActive(moduleId)) return null;
  try {
    return getModule(moduleId);
  } catch {
    return null;
  }
}

/**
 * Lista todos los módulos activos para el tenant actual.
 */
export function getActiveTenantModules(): RockSageModule[] {
  return ROCKSAGE_MODULES.filter(m => isModuleActive(m.id));
}

// ─── Context para inyección futura ───────────────────────────────────────────
//
// Este tipo define cómo se verá el contexto cuando se implemente multi-tenancy.
// Los servicios y API routes deben aceptar un TenantContext opcional para
// facilitar la migración sin reescritura.

export interface TenantContext {
  tenantId: string;
  organizationId?: string;
  storeId?: string;
}

/**
 * Retorna el TenantContext del tenant activo.
 * Hoy es un valor fijo. Futuro: viene del request (cookie/header/subdomain).
 */
export function getActiveTenantContext(): TenantContext {
  return {
    tenantId: ACTIVE_TENANT.id,
    organizationId: ACTIVE_TENANT.id,
    storeId: ACTIVE_TENANT.id,
  };
}

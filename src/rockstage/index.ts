/**
 * RockSage Commerce — Public API
 *
 * Punto de entrada único para el runtime de la plataforma.
 * Importar desde '@/src/rockstage' en lugar de sub-archivos.
 *
 * @example
 *   import { isModuleActive, ACTIVE_TENANT, TENANT_0 } from '@/src/rockstage';
 */

// Tenant model
export {
  TENANT_0,
  TENANT_PLAN_LIMITS,
  isTenantModuleEnabled,
  tenantHasPlan,
} from './tenant';
export type { TenantConfig, TenantPlan } from './tenant';

// Module manifest
export {
  ROCKSAGE_MODULES,
  getModule,
  getModulesByCategory,
  getModulesForPlan,
} from './manifest';
export type { RockSageModule, ModuleStatus, ModuleCategory } from './manifest';

// Platform config
export {
  ACTIVE_TENANT,
  ROCKSAGE_VERSION,
  ROCKSAGE_CODENAME,
  isModuleActive,
  getActiveModule,
  getActiveTenantModules,
  getActiveTenantContext,
} from './config';
export type { TenantContext } from './config';

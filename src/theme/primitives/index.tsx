// ═══════════════════════════════════════════════════════════════
// src/theme/primitives/index.tsx
// Re-exporta los componentes UI del tema activo.
// Todos los módulos admin importan desde aquí — no cambiar imports.
// ═══════════════════════════════════════════════════════════════

export {
  DefaultCard as Card,
  DefaultBadge as Badge,
  DefaultButton as Button,
  DefaultTable as Table,
  DefaultStatCard as StatCard,
  DefaultCard as TCard,
  DefaultBadge as TBadge,
  DefaultButton as TButton,
  DefaultTable as TTable,
  DefaultStatCard as TStatCard,
} from '@/src/admin/themes/default/components';

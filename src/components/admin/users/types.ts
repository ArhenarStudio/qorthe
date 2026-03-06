// ═══════════════════════════════════════════════════════════════
// Admin Users Module — Types (production-ready)
// Roles, permissions, audit, employee data
// ═══════════════════════════════════════════════════════════════

export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended';
export type AccessLevel = 'none' | 'read' | 'edit' | 'full';
export type RoleScope = 'all' | 'own' | 'team';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  role_id: string;
  role_name: string;
  role_color: string;
  status: UserStatus;
  department: string;
  position: string;
  // Employee data
  hire_date: string | null;
  birth_date: string | null;
  emergency_contact: string;
  emergency_phone: string;
  address: string;
  rfc: string;
  curp: string;
  nss: string;
  bank_name: string;
  bank_clabe: string;
  notes: string;
  // Tracking
  last_access: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  color: string;
  is_default: boolean;
  scope: RoleScope;
  permissions: Record<string, AccessLevel>;
  user_count: number;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  user_email: string;
  user_name: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
  created_at: string;
}

export interface UserFormData {
  email: string;
  full_name: string;
  phone: string;
  role_id: string;
  department: string;
  position: string;
  hire_date: string;
  birth_date: string;
  emergency_contact: string;
  emergency_phone: string;
  address: string;
  rfc: string;
  curp: string;
  nss: string;
  bank_name: string;
  bank_clabe: string;
  notes: string;
}

// ── Status config ──
export const USER_STATUS_CONFIG: Record<UserStatus, { label: string; cls: string; dot: string }> = {
  active:    { label: 'Activo',     cls: 'bg-green-50 text-green-600',  dot: 'bg-green-500' },
  inactive:  { label: 'Inactivo',   cls: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
  invited:   { label: 'Invitado',   cls: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-500' },
  suspended: { label: 'Suspendido', cls: 'bg-red-50 text-red-500',      dot: 'bg-red-500' },
};

export const ACCESS_LEVELS: { value: AccessLevel; label: string; cls: string }[] = [
  { value: 'none', label: 'Sin acceso', cls: 'text-gray-400' },
  { value: 'read', label: 'Lectura',    cls: 'text-blue-600' },
  { value: 'edit', label: 'Edición',    cls: 'text-amber-600' },
  { value: 'full', label: 'Completo',   cls: 'text-green-600' },
];

export const DEPARTMENTS = [
  'Administración', 'Ventas', 'Producción', 'Logística',
  'Finanzas', 'Marketing', 'Tecnología', 'Soporte',
];

export const ADMIN_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Pedidos' },
  { id: 'products', label: 'Productos' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'customers', label: 'Clientes' },
  { id: 'quotes', label: 'Cotizaciones' },
  { id: 'shipping', label: 'Envíos' },
  { id: 'finances', label: 'Finanzas' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'helpdesk', label: 'Soporte' },
  { id: 'pos', label: 'POS' },
  { id: 'reports', label: 'Reportes' },
  { id: 'cms', label: 'CMS' },
  { id: 'users', label: 'Usuarios' },
  { id: 'settings', label: 'Configuración' },
];

export const DEFAULT_USER_FORM: UserFormData = {
  email: '', full_name: '', phone: '', role_id: '',
  department: 'Administración', position: '',
  hire_date: '', birth_date: '',
  emergency_contact: '', emergency_phone: '',
  address: '', rfc: '', curp: '', nss: '',
  bank_name: '', bank_clabe: '', notes: '',
};

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

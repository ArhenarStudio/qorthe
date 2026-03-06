-- ═══════════════════════════════════════════════════════════════
-- DavidSon's Design — Admin Users, Roles & Audit Log
-- Execute in Supabase SQL Editor
-- Date: 2026-03-06
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#C5A065',
  is_default BOOLEAN DEFAULT false,
  scope TEXT DEFAULT 'all' CHECK (scope IN ('all','own','team')),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT,
  role_id UUID REFERENCES admin_roles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','invited','suspended')),
  department TEXT DEFAULT 'Administración',
  position TEXT DEFAULT '',
  hire_date DATE,
  birth_date DATE,
  emergency_contact TEXT DEFAULT '',
  emergency_phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  rfc TEXT DEFAULT '',
  curp TEXT DEFAULT '',
  nss TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  bank_clabe TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  last_access TIMESTAMPTZ,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role_id);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT DEFAULT '',
  action TEXT NOT NULL,
  module TEXT DEFAULT '',
  detail TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON admin_audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_module ON admin_audit_log(module);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_admin_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_users_updated ON admin_users;
CREATE TRIGGER trg_admin_users_updated
  BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_admin_timestamp();

DROP TRIGGER IF EXISTS trg_admin_roles_updated ON admin_roles;
CREATE TRIGGER trg_admin_roles_updated
  BEFORE UPDATE ON admin_roles FOR EACH ROW EXECUTE FUNCTION update_admin_timestamp();

-- Default roles
INSERT INTO admin_roles (name, description, color, is_default, scope, permissions) VALUES
  ('Super Admin', 'Acceso completo a todos los módulos', '#2d2419', false, 'all',
   '{"dashboard":"full","orders":"full","products":"full","inventory":"full","customers":"full","quotes":"full","shipping":"full","finances":"full","marketing":"full","reviews":"full","helpdesk":"full","pos":"full","reports":"full","cms":"full","users":"full","settings":"full"}'),
  ('Gerente', 'Acceso amplio excepto configuración de sistema', '#C5A065', false, 'all',
   '{"dashboard":"full","orders":"full","products":"full","inventory":"full","customers":"full","quotes":"full","shipping":"full","finances":"read","marketing":"full","reviews":"full","helpdesk":"full","pos":"full","reports":"full","cms":"edit","users":"read","settings":"read"}'),
  ('Vendedor', 'Ventas, cotizaciones y atención al cliente', '#3B82F6', true, 'own',
   '{"dashboard":"read","orders":"read","products":"read","inventory":"read","customers":"edit","quotes":"full","shipping":"read","finances":"none","marketing":"none","reviews":"read","helpdesk":"edit","pos":"full","reports":"none","cms":"none","users":"none","settings":"none"}'),
  ('Producción', 'Gestión de inventario y producción', '#22c55e', false, 'team',
   '{"dashboard":"read","orders":"read","products":"read","inventory":"full","customers":"none","quotes":"read","shipping":"edit","finances":"none","marketing":"none","reviews":"none","helpdesk":"none","pos":"none","reports":"read","cms":"none","users":"none","settings":"none"}')
ON CONFLICT (name) DO NOTHING;

-- Seed current admin users
INSERT INTO admin_users (email, full_name, role_id, status, department, position, created_by) VALUES
  ('designdavidsons@gmail.com', 'David Pérez', (SELECT id FROM admin_roles WHERE name='Super Admin'), 'active', 'Administración', 'Director General', 'system'),
  ('studiorockstage@gmail.com', 'Studio RockStage', (SELECT id FROM admin_roles WHERE name='Super Admin'), 'active', 'Tecnología', 'CTO', 'system'),
  ('admin@davidsonsdesign.com', 'Admin DSD', (SELECT id FROM admin_roles WHERE name='Super Admin'), 'active', 'Administración', 'Administrador', 'system')
ON CONFLICT (email) DO NOTHING;

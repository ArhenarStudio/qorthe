-- ═══════════════════════════════════════════════════════════════
-- Fase 16.1 — CMS Tables (menus, sections, email_templates, automation_rules)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/tpcwpkdicrhmkopokitw/sql/new?skip=true
-- ═══════════════════════════════════════════════════════════════

-- 1. CMS Menus — navigation items for header/footer
CREATE TABLE IF NOT EXISTS cms_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_group TEXT NOT NULL DEFAULT 'header', -- header, footerShop, footerInfo, footerLegal
  label TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '/',
  parent_id UUID REFERENCES cms_menus(id) ON DELETE SET NULL,
  position INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  open_new_tab BOOLEAN NOT NULL DEFAULT false,
  icon TEXT, -- optional lucide icon name
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CMS Sections — homepage builder sections
CREATE TABLE IF NOT EXISTS cms_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL, -- hero, collections, process, testimonials, newsletter, custom
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}', -- flexible content per type
  position INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Email Templates — overrides for backend email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE, -- e.g. 'order_confirmation', 'welcome'
  subject_override TEXT, -- null = use default from code
  body_overrides JSONB DEFAULT '{}', -- { heading: "...", cta_text: "..." }
  is_active BOOLEAN NOT NULL DEFAULT true,
  preview_data JSONB DEFAULT '{}', -- dummy data for preview rendering
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Automation Rules — configurable trigger/action pairs
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- order.placed, cart.abandoned, stock.low, tier.changed, etc.
  conditions JSONB DEFAULT '{}', -- { min_total: 500, tier: "parota" }
  actions JSONB DEFAULT '[]', -- [{ type: "email", template: "..." }, { type: "points", amount: 500 }]
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  execution_count INT DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default menus (DSD current navigation)
INSERT INTO cms_menus (menu_group, label, url, position) VALUES
  ('header', 'Inicio', '/', 0),
  ('header', 'Tienda', '/shop', 1),
  ('header', 'Cotizador', '/quote', 2),
  ('header', 'Filosofía', '/philosophy', 3),
  ('header', 'Contacto', '/contact', 4),
  ('footerShop', 'Tienda', '/shop', 0),
  ('footerShop', 'Cotizador', '/quote', 1),
  ('footerShop', 'Programa de Lealtad', '/loyalty', 2),
  ('footerInfo', 'Sobre Nosotros', '/about', 0),
  ('footerInfo', 'Filosofía', '/philosophy', 1),
  ('footerInfo', 'Contacto', '/contact', 2),
  ('footerInfo', 'FAQ', '/faq', 3),
  ('footerLegal', 'Términos y Condiciones', '/terms', 0),
  ('footerLegal', 'Política de Privacidad', '/privacy-policy', 1),
  ('footerLegal', 'Política de Cookies', '/cookies-policy', 2),
  ('footerLegal', 'Política de Envíos', '/shipping-policy', 3)
ON CONFLICT DO NOTHING;

-- Seed default homepage sections
INSERT INTO cms_sections (section_type, title, content, position, is_visible) VALUES
  ('hero', 'Hero Principal', '{"heading": "Artesanía en Madera", "subheading": "Tablas de cortar y piezas únicas hechas a mano", "cta_text": "Explorar Colección", "cta_url": "/shop", "bg_image": "/images/hero-bg.jpg"}', 0, true),
  ('collections', 'Nuestras Colecciones', '{"layout": "grid", "columns": 3}', 1, true),
  ('process', 'Proceso Artesanal', '{"steps": ["Selección de Madera", "Corte y Forma", "Lijado y Acabado", "Grabado Láser"]}', 2, true),
  ('testimonials', 'Testimonios', '{"display": "carousel", "count": 3}', 3, true),
  ('newsletter', 'Newsletter', '{"heading": "Únete a la Comunidad", "description": "Recibe ofertas exclusivas"}', 4, true)
ON CONFLICT DO NOTHING;

-- Seed default email templates (matching backend templates)
INSERT INTO email_templates (template_key, is_active) VALUES
  ('order_confirmation', true),
  ('admin_new_order', true),
  ('order_shipped', true),
  ('order_cancelled', true),
  ('admin_order_cancelled', true),
  ('order_refunded', true),
  ('payment_failed', true),
  ('welcome_email', true),
  ('password_reset', true),
  ('review_request', true),
  ('admin_contact', true)
ON CONFLICT (template_key) DO NOTHING;

-- Seed default automation rules
INSERT INTO automation_rules (name, description, trigger_type, conditions, actions, is_enabled) VALUES
  ('Bienvenida VIP', 'Email de felicitación + 500 puntos cuando sube a Parota o Ébano', 'tier.changed', '{"new_tier": ["parota", "ebano"]}', '[{"type": "email", "template": "vip_welcome"}, {"type": "points", "amount": 500}]', false),
  ('Carrito abandonado', 'Email con 10% descuento si carrito >$500 abandonado 24h', 'cart.abandoned', '{"min_total": 500, "hours": 24}', '[{"type": "coupon", "discount": 10}, {"type": "email", "template": "abandoned_cart"}]', false),
  ('Alerta stock bajo', 'Notificar admin cuando stock <3 unidades', 'stock.low', '{"threshold": 3}', '[{"type": "notification", "channel": "admin"}]', true),
  ('Review post-compra', 'Solicitar review 7 días después de entrega', 'order.delivered', '{"days_after": 7}', '[{"type": "email", "template": "review_request"}]', true),
  ('Reactivación cliente', 'Email a clientes sin compra en 90+ días', 'customer.inactive', '{"days": 90}', '[{"type": "email", "template": "reactivation"}]', false)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Fase 10B: Quote Pricing Config table
-- Stores configurable pricing for the cotizador
-- Admin can edit prices from /admin panel
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS quote_pricing_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO quote_pricing_config (id, config) VALUES (1, '{
  "wood_prices_m2": {
    "Cedro": 3500,
    "Nogal": 5500,
    "Encino": 3000,
    "Parota": 6000,
    "Combinación": 5000
  },
  "textile_base_prices": {
    "Tote bag": 180,
    "Mandil de cocina": 350,
    "Servilletas": 120,
    "Funda de cojín": 280
  },
  "engraving_prices": {
    "Básico": 70,
    "Intermedio": 150,
    "Detallado": 250,
    "Premium": 400
  },
  "engraving_zone_extra": 50,
  "engraving_qr_extra": 30,
  "textile_technique_prices": {
    "Sublimación": 80,
    "Vinilo HTV": 60,
    "Transfer": 50
  },
  "textile_full_panel_extra": 40,
  "wood_min_price": 350,
  "wood_thickness_standard": 3,
  "volume_discounts": [
    {"min_qty": 5, "percent": 5},
    {"min_qty": 10, "percent": 10},
    {"min_qty": 20, "percent": 15},
    {"min_qty": 50, "percent": 20}
  ],
  "tier_discount_enabled": true
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- RLS: public read, service_role write
ALTER TABLE quote_pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pricing config"
  ON quote_pricing_config FOR SELECT
  USING (true);

CREATE POLICY "Service role can update pricing config"
  ON quote_pricing_config FOR ALL
  USING (true)
  WITH CHECK (true);

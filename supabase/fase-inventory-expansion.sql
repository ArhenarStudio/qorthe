-- ═══════════════════════════════════════════════════════════════
-- DavidSon's Design — Inventory Module Expansion
-- New tables: transfers, cyclic counts, cost history
-- Execute in Supabase SQL Editor
-- Date: 2026-03-06
-- ═══════════════════════════════════════════════════════════════

-- ── Sequences ─────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS transfer_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS count_number_seq START 1;

-- ── Stock Transfers ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number TEXT NOT NULL UNIQUE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_transit','completed','cancelled')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'admin',
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Cyclic Counts ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_counts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  count_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  location TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_items INTEGER NOT NULL DEFAULT 0,
  counted_items INTEGER NOT NULL DEFAULT 0,
  discrepancies INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Cost History ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_cost_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  product_title TEXT NOT NULL DEFAULT '',
  previous_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  new_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  change_percent NUMERIC(8,2) NOT NULL DEFAULT 0,
  reason TEXT DEFAULT '',
  movement_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cost_history_variant ON inventory_cost_history(variant_id);
CREATE INDEX IF NOT EXISTS idx_cost_history_date ON inventory_cost_history(created_at DESC);

-- ── Stock Reservations (for quotes) ───────────────────────────

CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id TEXT NOT NULL,
  product_title TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL,
  quote_id TEXT,
  order_id TEXT,
  source TEXT NOT NULL DEFAULT 'quote' CHECK (source IN ('quote','order','manual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','fulfilled','expired','cancelled')),
  expires_at TIMESTAMPTZ,
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_variant ON inventory_reservations(variant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON inventory_reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_quote ON inventory_reservations(quote_id);

-- ── Indexes on existing tables ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_movements_variant ON inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_movements_type ON inventory_movements(type);
CREATE INDEX IF NOT EXISTS idx_movements_date ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON inventory_alerts(is_resolved);

-- ── Helper function: auto transfer number ─────────────────────

CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TEXT AS $$
DECLARE
  yr TEXT;
  seq INTEGER;
BEGIN
  yr := TO_CHAR(NOW(), 'YYYY');
  seq := nextval('transfer_number_seq');
  RETURN 'TRF-' || yr || '-' || LPAD(seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_count_number()
RETURNS TEXT AS $$
DECLARE
  yr TEXT;
  seq INTEGER;
BEGIN
  yr := TO_CHAR(NOW(), 'YYYY');
  seq := nextval('count_number_seq');
  RETURN 'CNT-' || yr || '-' || LPAD(seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ── Auto-update timestamps ────────────────────────────────────

CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transfers_updated ON inventory_transfers;
CREATE TRIGGER trg_transfers_updated
  BEFORE UPDATE ON inventory_transfers
  FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

DROP TRIGGER IF EXISTS trg_counts_updated ON inventory_counts;
CREATE TRIGGER trg_counts_updated
  BEFORE UPDATE ON inventory_counts
  FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

DROP TRIGGER IF EXISTS trg_reservations_updated ON inventory_reservations;
CREATE TRIGGER trg_reservations_updated
  BEFORE UPDATE ON inventory_reservations
  FOR EACH ROW EXECUTE FUNCTION update_inventory_timestamp();

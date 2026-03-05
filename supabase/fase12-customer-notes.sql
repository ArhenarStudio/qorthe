-- ═══════════════════════════════════════════════════════════════
-- DavidSon's Design — Supabase Table: Customer Notes
-- Fase 12.Customers: Admin internal notes per customer
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email text NOT NULL,
  text text NOT NULL,
  author text DEFAULT 'Admin',
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_email ON public.customer_notes(customer_email);

-- RLS: Only service role can manage (admin-only table)
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all notes"
  ON public.customer_notes FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER customer_notes_updated_at
  BEFORE UPDATE ON public.customer_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

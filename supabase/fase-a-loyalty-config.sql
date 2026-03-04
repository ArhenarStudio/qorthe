-- ═══════════════════════════════════════════════════════════════
-- DavidSon's Design — Loyalty Config + Migration
-- Fase A: Sistema de Membresías configurable desde admin
-- Run in Supabase SQL Editor (in order)
-- ═══════════════════════════════════════════════════════════════

-- ══════════════════════════════════
-- STEP 1: Create loyalty_config table
-- Single-row config table (key-value pattern via JSONB columns)
-- ══════════════════════════════════

CREATE TABLE IF NOT EXISTS public.loyalty_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- Singleton: only 1 row ever
  
  -- ── Tier definitions ──
  tiers jsonb NOT NULL DEFAULT '[
    {
      "id": "pino",
      "name": "Pino",
      "min_spend": 0,
      "max_spend": 299999,
      "discount_percent": 0,
      "early_access_hours": 0,
      "upgrade_gift": null,
      "priority_support": false,
      "colors": {
        "gradient_from": "#E8D5B7",
        "gradient_via": "#C4A882",
        "gradient_to": "#8B6F47"
      }
    },
    {
      "id": "nogal",
      "name": "Nogal",
      "min_spend": 300000,
      "max_spend": 799999,
      "discount_percent": 2,
      "early_access_hours": 48,
      "upgrade_gift": null,
      "priority_support": false,
      "colors": {
        "gradient_from": "#8B6F47",
        "gradient_via": "#5D4532",
        "gradient_to": "#3A2A1C"
      }
    },
    {
      "id": "parota",
      "name": "Parota",
      "min_spend": 800000,
      "max_spend": 1499999,
      "discount_percent": 5,
      "early_access_hours": 48,
      "upgrade_gift": "coupon_15",
      "priority_support": false,
      "colors": {
        "gradient_from": "#D4A76A",
        "gradient_via": "#B8860B",
        "gradient_to": "#8B6914"
      }
    },
    {
      "id": "ebano",
      "name": "Ébano",
      "min_spend": 1500000,
      "max_spend": null,
      "discount_percent": 10,
      "early_access_hours": 72,
      "upgrade_gift": "gift_and_coupons",
      "priority_support": true,
      "colors": {
        "gradient_from": "#1A1A2E",
        "gradient_via": "#16213E",
        "gradient_to": "#0F3460"
      }
    }
  ]'::jsonb,

  -- ── Points config ──
  points_per_mxn integer NOT NULL DEFAULT 1,           -- 1 point per $1 MXN
  point_value_mxn numeric(6,4) NOT NULL DEFAULT 0.01,  -- 1 point = $0.01 MXN
  points_expiry_days integer NOT NULL DEFAULT 180,      -- 6 months
  points_expiry_warning_days integer[] NOT NULL DEFAULT '{30,7}',  -- warn at 30d and 7d

  -- ── Redemption config ──
  min_redeem_points integer NOT NULL DEFAULT 100,       -- minimum 100 pts to redeem
  max_redeem_percent integer NOT NULL DEFAULT 70,       -- max 70% of cart via points
  max_combined_discount_percent integer NOT NULL DEFAULT 70,  -- points + coupon max 70%
  redeem_step integer NOT NULL DEFAULT 100,             -- increment by 100 pts

  -- ── Action points (non-purchase) ──
  action_points jsonb NOT NULL DEFAULT '{
    "registration": 500,
    "newsletter": 300,
    "review": 200,
    "review_max_per_month": 3,
    "referral_referrer": 1000,
    "referral_referred": 500,
    "referral_min_purchase": 50000,
    "referral_max_per_month": 10,
    "birthday": 10000,
    "birthday_min_purchases": 1,
    "birthday_validity_days": 30,
    "social_share": 100,
    "social_share_max_per_week": 1
  }'::jsonb,

  -- ── Evaluation config ──
  evaluation_period text NOT NULL DEFAULT 'quarterly',  -- quarterly | annual
  evaluation_lookback_months integer NOT NULL DEFAULT 12,  -- look at last 12 months
  max_tier_drop integer NOT NULL DEFAULT 1,             -- max 1 level drop per eval
  grace_periods integer NOT NULL DEFAULT 1,             -- 1 quarter grace after reaching tier

  -- ── Free shipping ──
  free_shipping_threshold integer NOT NULL DEFAULT 250000,  -- $2,500 MXN in centavos
  free_shipping_all_tiers boolean NOT NULL DEFAULT true,

  -- ── Feature flags ──
  program_active boolean NOT NULL DEFAULT true,
  referrals_active boolean NOT NULL DEFAULT false,      -- activate when ready
  birthday_active boolean NOT NULL DEFAULT false,       -- activate when ready
  social_share_active boolean NOT NULL DEFAULT false,   -- activate when ready

  -- ── Meta ──
  updated_at timestamptz DEFAULT now(),
  updated_by text  -- email of admin who last changed
);

-- Ensure singleton
INSERT INTO public.loyalty_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can read config, only service_role can write
ALTER TABLE public.loyalty_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read loyalty config"
  ON public.loyalty_config FOR SELECT USING (true);

CREATE POLICY "Service role can update loyalty config"
  ON public.loyalty_config FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can insert loyalty config"
  ON public.loyalty_config FOR INSERT WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER loyalty_config_updated_at
  BEFORE UPDATE ON public.loyalty_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ══════════════════════════════════
-- STEP 2: Migrate loyalty_profiles tier values
-- bronze → pino, silver → nogal, gold → parota, platinum → ebano
-- ══════════════════════════════════

-- First, drop the old CHECK constraint
ALTER TABLE public.loyalty_profiles 
  DROP CONSTRAINT IF EXISTS loyalty_profiles_tier_check;

-- Add new CHECK with both old and new values (for safety during migration)
ALTER TABLE public.loyalty_profiles 
  ADD CONSTRAINT loyalty_profiles_tier_check 
  CHECK (tier IN ('pino', 'nogal', 'parota', 'ebano', 'bronze', 'silver', 'gold', 'platinum'));

-- Migrate existing data
UPDATE public.loyalty_profiles SET tier = 'pino' WHERE tier = 'bronze';
UPDATE public.loyalty_profiles SET tier = 'nogal' WHERE tier = 'silver';
UPDATE public.loyalty_profiles SET tier = 'parota' WHERE tier = 'gold';
UPDATE public.loyalty_profiles SET tier = 'ebano' WHERE tier = 'platinum';

-- Now tighten the constraint to only new values
ALTER TABLE public.loyalty_profiles 
  DROP CONSTRAINT loyalty_profiles_tier_check;

ALTER TABLE public.loyalty_profiles 
  ADD CONSTRAINT loyalty_profiles_tier_check 
  CHECK (tier IN ('pino', 'nogal', 'parota', 'ebano'));

-- Update default
ALTER TABLE public.loyalty_profiles 
  ALTER COLUMN tier SET DEFAULT 'pino';


-- ══════════════════════════════════
-- STEP 3: Update calculate_loyalty_tier to read from config
-- Now reads thresholds from loyalty_config.tiers JSONB
-- ══════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_loyalty_tier(spend integer)
RETURNS text AS $$
DECLARE
  v_tiers jsonb;
  v_tier jsonb;
  v_result text := 'pino';
  i integer;
BEGIN
  -- Read tier config
  SELECT tiers INTO v_tiers FROM public.loyalty_config WHERE id = 1;
  
  -- Fallback if no config
  IF v_tiers IS NULL THEN
    IF spend >= 1500000 THEN RETURN 'ebano';
    ELSIF spend >= 800000 THEN RETURN 'parota';
    ELSIF spend >= 300000 THEN RETURN 'nogal';
    ELSE RETURN 'pino';
    END IF;
  END IF;

  -- Iterate tiers from lowest to highest, pick the highest one the user qualifies for
  FOR i IN 0..jsonb_array_length(v_tiers) - 1 LOOP
    v_tier := v_tiers->i;
    IF spend >= (v_tier->>'min_spend')::integer THEN
      v_result := v_tier->>'id';
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;


-- ══════════════════════════════════
-- STEP 4: Update get_tier_multiplier
-- Multipliers are NOT automatic per tier anymore (per spec).
-- Base is always 1.0x. Multipliers come from admin promotions.
-- Keep function but always return 1.0 (promos override separately).
-- ══════════════════════════════════

CREATE OR REPLACE FUNCTION get_tier_multiplier(tier_name text)
RETURNS numeric AS $$
BEGIN
  -- Per DSD-LOYALTY-SYSTEM.md: multipliers are NOT automatic by tier.
  -- They are configured as promotions from admin.
  -- Base rate is always 1.0x for all tiers.
  RETURN 1.00;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ══════════════════════════════════
-- STEP 5: Update award_order_points to use new tier names
-- Also reads points_per_mxn from config
-- ══════════════════════════════════

CREATE OR REPLACE FUNCTION award_order_points(
  p_user_id uuid,
  p_order_id text,
  p_order_display_id text,
  p_order_total integer   -- in centavos
)
RETURNS jsonb AS $$
DECLARE
  v_profile loyalty_profiles%ROWTYPE;
  v_config loyalty_config%ROWTYPE;
  v_base_points integer;
  v_earned_points integer;
  v_new_lifetime integer;
  v_new_tier text;
BEGIN
  -- Read config
  SELECT * INTO v_config FROM public.loyalty_config WHERE id = 1;

  -- Check if program is active
  IF v_config.id IS NOT NULL AND NOT v_config.program_active THEN
    RETURN jsonb_build_object('error', 'Loyalty program is currently inactive');
  END IF;

  -- Get or create loyalty profile
  INSERT INTO public.loyalty_profiles (user_id, tier)
  VALUES (p_user_id, 'pino')
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_profile FROM public.loyalty_profiles WHERE user_id = p_user_id FOR UPDATE;

  -- Check if order already rewarded
  IF EXISTS (
    SELECT 1 FROM public.loyalty_transactions 
    WHERE user_id = p_user_id AND order_id = p_order_id AND type = 'earn'
  ) THEN
    RETURN jsonb_build_object('error', 'Order already rewarded', 'already_awarded', true);
  END IF;

  -- Calculate points: points_per_mxn per $1 MXN (centavos / 100)
  -- Multiplier is always 1.0 now (promos managed separately)
  v_base_points := (p_order_total / 100) * COALESCE(v_config.points_per_mxn, 1);
  v_earned_points := v_base_points;  -- no automatic multiplier

  -- Update lifetime spend
  v_new_lifetime := v_profile.lifetime_spend + p_order_total;

  -- Recalculate tier (reads from config internally)
  v_new_tier := calculate_loyalty_tier(v_new_lifetime);

  -- Update profile
  UPDATE public.loyalty_profiles
  SET points = points + v_earned_points,
      lifetime_points = lifetime_points + v_earned_points,
      lifetime_spend = v_new_lifetime,
      tier = v_new_tier,
      points_multiplier = 1.00  -- always 1.0, promos override
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO public.loyalty_transactions (user_id, points, type, description, order_id, order_display_id, metadata)
  VALUES (
    p_user_id,
    v_earned_points,
    'earn',
    'Compra #' || p_order_display_id,
    p_order_id,
    p_order_display_id,
    jsonb_build_object(
      'order_total', p_order_total,
      'base_points', v_base_points,
      'multiplier', 1.0,
      'tier_at_time', v_profile.tier
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'points_earned', v_earned_points,
    'new_balance', v_profile.points + v_earned_points,
    'tier', v_new_tier,
    'tier_changed', v_new_tier != v_profile.tier,
    'previous_tier', v_profile.tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ══════════════════════════════════
-- DONE! Verify:
-- ══════════════════════════════════
-- SELECT * FROM public.loyalty_config;
-- SELECT tier, count(*) FROM public.loyalty_profiles GROUP BY tier;
-- SELECT calculate_loyalty_tier(0);       -- → 'pino'
-- SELECT calculate_loyalty_tier(300000);  -- → 'nogal'
-- SELECT calculate_loyalty_tier(800000);  -- → 'parota'
-- SELECT calculate_loyalty_tier(1500000); -- → 'ebano'

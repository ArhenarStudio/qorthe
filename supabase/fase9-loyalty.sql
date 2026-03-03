-- ═══════════════════════════════════════════════════════════════
-- DavidSon's Design — Supabase Tables: Loyalty Program
-- Fase 9: Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ══════════════════════════════════
-- TABLE: loyalty_profiles
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS public.loyalty_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points integer DEFAULT 0 CHECK (points >= 0),
  lifetime_points integer DEFAULT 0,
  lifetime_spend integer DEFAULT 0,        -- in centavos (MXN * 100)
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  points_multiplier numeric(3,2) DEFAULT 1.00,
  joined_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_profiles_user_id ON public.loyalty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_profiles_tier ON public.loyalty_profiles(tier);

ALTER TABLE public.loyalty_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty profile"
  ON public.loyalty_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all profiles"
  ON public.loyalty_profiles FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════
-- TABLE: loyalty_transactions
-- ══════════════════════════════════
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,                 -- positive = earned, negative = redeemed
  type text NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'expire', 'adjust')),
  description text NOT NULL,
  order_id text,                           -- Medusa order ID (if from purchase)
  order_display_id text,                   -- human-readable order #
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tx_user_id ON public.loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_order_id ON public.loyalty_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_type ON public.loyalty_transactions(type);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_created_at ON public.loyalty_transactions(created_at);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all transactions"
  ON public.loyalty_transactions FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════
-- TRIGGER: Auto-update updated_at on loyalty_profiles
-- ══════════════════════════════════
CREATE TRIGGER loyalty_profiles_updated_at
  BEFORE UPDATE ON public.loyalty_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════════════════════
-- FUNCTION: Calculate tier from lifetime_spend (in centavos)
-- Bronce: $0-$2,999 (0 - 299900)
-- Plata: $3,000-$9,999 (300000 - 999900)
-- Oro: $10,000-$24,999 (1000000 - 2499900)
-- Platino: $25,000+ (2500000+)
-- ══════════════════════════════════
CREATE OR REPLACE FUNCTION calculate_loyalty_tier(spend integer)
RETURNS text AS $$
BEGIN
  IF spend >= 2500000 THEN RETURN 'platinum';
  ELSIF spend >= 1000000 THEN RETURN 'gold';
  ELSIF spend >= 300000 THEN RETURN 'silver';
  ELSE RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ══════════════════════════════════
-- FUNCTION: Get points multiplier for tier
-- Bronce: 1.0x, Plata: 1.2x, Oro: 1.5x, Platino: 2.0x
-- ══════════════════════════════════
CREATE OR REPLACE FUNCTION get_tier_multiplier(tier_name text)
RETURNS numeric AS $$
BEGIN
  CASE tier_name
    WHEN 'platinum' THEN RETURN 2.00;
    WHEN 'gold' THEN RETURN 1.50;
    WHEN 'silver' THEN RETURN 1.20;
    ELSE RETURN 1.00;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ══════════════════════════════════
-- FUNCTION: Award points from order (called by API)
-- Adds points, updates lifetime_spend, recalculates tier
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
  v_base_points integer;
  v_earned_points integer;
  v_new_lifetime integer;
  v_new_tier text;
  v_new_multiplier numeric;
BEGIN
  -- Get or create loyalty profile
  INSERT INTO public.loyalty_profiles (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_profile FROM public.loyalty_profiles WHERE user_id = p_user_id FOR UPDATE;

  -- Check if order already rewarded
  IF EXISTS (
    SELECT 1 FROM public.loyalty_transactions 
    WHERE user_id = p_user_id AND order_id = p_order_id AND type = 'earn'
  ) THEN
    RETURN jsonb_build_object('error', 'Order already rewarded', 'already_awarded', true);
  END IF;

  -- Calculate points: 1 point per $1 MXN (centavos / 100), multiplied by tier
  v_base_points := p_order_total / 100;
  v_earned_points := FLOOR(v_base_points * v_profile.points_multiplier);

  -- Update lifetime spend
  v_new_lifetime := v_profile.lifetime_spend + p_order_total;

  -- Recalculate tier
  v_new_tier := calculate_loyalty_tier(v_new_lifetime);
  v_new_multiplier := get_tier_multiplier(v_new_tier);

  -- Update profile
  UPDATE public.loyalty_profiles
  SET points = points + v_earned_points,
      lifetime_points = lifetime_points + v_earned_points,
      lifetime_spend = v_new_lifetime,
      tier = v_new_tier,
      points_multiplier = v_new_multiplier
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
      'multiplier', v_profile.points_multiplier,
      'tier_at_time', v_profile.tier
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'points_earned', v_earned_points,
    'new_balance', v_profile.points + v_earned_points,
    'tier', v_new_tier,
    'tier_changed', v_new_tier != v_profile.tier,
    'previous_tier', v_profile.tier,
    'multiplier', v_new_multiplier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════
-- FUNCTION: Redeem points (called by API)
-- ══════════════════════════════════
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
  p_user_id uuid,
  p_points integer,
  p_description text DEFAULT 'Canje de puntos'
)
RETURNS jsonb AS $$
DECLARE
  v_current_points integer;
BEGIN
  SELECT points INTO v_current_points
  FROM public.loyalty_profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_current_points IS NULL THEN
    RETURN jsonb_build_object('error', 'No loyalty profile found');
  END IF;

  IF p_points <= 0 THEN
    RETURN jsonb_build_object('error', 'Points must be positive');
  END IF;

  IF p_points > v_current_points THEN
    RETURN jsonb_build_object('error', 'Insufficient points', 'available', v_current_points);
  END IF;

  -- Deduct points
  UPDATE public.loyalty_profiles
  SET points = points - p_points
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO public.loyalty_transactions (user_id, points, type, description)
  VALUES (p_user_id, -p_points, 'redeem', p_description);

  RETURN jsonb_build_object(
    'success', true,
    'points_redeemed', p_points,
    'discount_mxn', p_points * 0.01,
    'new_balance', v_current_points - p_points
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

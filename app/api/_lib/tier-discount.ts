import { createClient } from '@supabase/supabase-js';
import { logger } from '@/src/lib/logger';

// ═══════════════════════════════════════════════════════════════
// Server-side tier discount validation
// Reads user's loyalty tier from Supabase and calculates the
// correct discount amount. NEVER trust frontend-provided discounts.
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TierConfig {
  id: string;
  name: string;
  min_spend: number;
  discount_percent: number;
}

/**
 * Validate and calculate tier discount server-side.
 * Returns the verified discount amount in centavos (Medusa units).
 * 
 * @param userEmail - User's email to look up their loyalty profile
 * @param cartSubtotal - Cart subtotal in centavos from Medusa
 * @returns discount amount in centavos, or 0 if no discount
 */
export async function getVerifiedTierDiscount(
  userEmail: string | undefined,
  cartSubtotal: number
): Promise<{ discountAmount: number; tierName: string; discountPercent: number }> {
  const noDiscount = { discountAmount: 0, tierName: 'Pino', discountPercent: 0 };
  
  if (!userEmail || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return noDiscount;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Find user by email
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email === userEmail);
    if (!user) return noDiscount;

    // 2. Get loyalty profile
    const { data: profile } = await supabase
      .from('loyalty_profiles')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (!profile?.tier) return noDiscount;

    // 3. Get tier config for discount %
    const { data: config } = await supabase
      .from('loyalty_config')
      .select('tiers')
      .eq('id', 1)
      .single();

    if (!config?.tiers) return noDiscount;

    const tiers = config.tiers as TierConfig[];
    const userTier = tiers.find(t => t.id === profile.tier);
    if (!userTier || userTier.discount_percent <= 0) return noDiscount;

    // 4. Calculate discount (cartSubtotal is in centavos from Medusa)
    const discountAmount = Math.round(cartSubtotal * userTier.discount_percent / 100);

    logger.debug(`[TierDiscount] ${userEmail} → tier=${userTier.name} (${userTier.discount_percent}%) → discount=${discountAmount} centavos on subtotal=${cartSubtotal}`);

    return {
      discountAmount,
      tierName: userTier.name,
      discountPercent: userTier.discount_percent,
    };
  } catch (err) {
    console.error('[TierDiscount] Error:', err);
    return noDiscount;
  }
}

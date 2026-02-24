-- ═══════════════════════════════════════════════════════════════
-- DavidSon's Design — SANITY CHECKS
-- Run periodically or before deploy to catch data issues
-- ═══════════════════════════════════════════════════════════════

-- CHECK 1: Products without shipping profile (ROOT CAUSE of checkout failures)
-- Every published product MUST have a shipping profile assigned.
SELECT 
  p.id, p.title, p.status,
  '❌ NO SHIPPING PROFILE' as issue
FROM product p
LEFT JOIN product_shipping_profile psp ON p.id = psp.product_id
WHERE psp.shipping_profile_id IS NULL
  AND p.status = 'published';

-- CHECK 2: Carts with duplicate shipping methods (causes "profiles not satisfied")
SELECT 
  cart_id,
  COUNT(*) as method_count,
  '⚠️ DUPLICATE SHIPPING METHODS' as issue
FROM cart_shipping_method
GROUP BY cart_id
HAVING COUNT(*) > 1;

-- CHECK 3: Orphan shipping methods (option no longer exists)
SELECT
  csm.id, csm.cart_id, csm.shipping_option_id,
  '⚠️ ORPHAN SHIPPING METHOD' as issue
FROM cart_shipping_method csm
LEFT JOIN shipping_option so ON csm.shipping_option_id = so.id
WHERE so.id IS NULL;

-- CHECK 4: Shipping options without valid profile
SELECT
  so.id, so.name, so.shipping_profile_id,
  '⚠️ OPTION WITHOUT PROFILE' as issue
FROM shipping_option so
LEFT JOIN shipping_profile sp ON so.shipping_profile_id = sp.id
WHERE sp.id IS NULL;

-- AUTO-FIX: Assign default shipping profile to any product missing one
-- Uncomment to run:
-- INSERT INTO product_shipping_profile (id, product_id, shipping_profile_id)
-- SELECT 
--   gen_random_uuid()::text,
--   p.id,
--   'sp_01KJ40TYJFMSFD8WT95X90E5KW'
-- FROM product p
-- WHERE p.id NOT IN (SELECT product_id FROM product_shipping_profile)
-- ON CONFLICT DO NOTHING;

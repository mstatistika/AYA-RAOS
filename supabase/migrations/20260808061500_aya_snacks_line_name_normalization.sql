-- AYA RAOS — normalize public line name after Brand Ecosystem Hub decision.
-- Additive and idempotent. Does not change prices, product IDs, order records, or capability gates.

update public.aya_catalog_products
set line_name = 'AYA Snacks & Drinks',
    updated_at = now()
where line_name = 'AYA Snack & Drinks';

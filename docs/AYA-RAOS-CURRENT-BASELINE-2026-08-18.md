# AYA RAOS — Current Development Baseline — 18 Agustus 2026

**Status:** Canonical development baseline after Cart/B2C v16 checkpoint  
**Repository:** `mstatistika/AYA-RAOS`  
**Canonical branch:** `main`  
**Website state:** staging / `noindex`; Production Launch is not approved.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this baseline;
3. applicable canonical / FINAL LOCK supplement;
4. Project Constitution v1.1;
5. Execution Discipline v1.1;
6. verified business/product facts;
7. actual current source.

Historical mockups, packages, screenshots, automation branches, and obsolete handoffs are not implementation authority.

## 2. Canonical release lineage

Approved implementation checkpoints:
- `0e6f125` — Dedicated Line Pages;
- `44533ef` — Product + Catalog implementation;
- `764c722` — Product + Catalog governance;
- `c11e538` — Testimonials + Share;
- `a779b6e` — Pasokan Usaha;
- `a051254` — pre-Cart governance baseline;
- `ff431b7` — Cart/B2C v16 implementation checkpoint.

Cart governance is recorded in `AYA-RAOS-CART-B2C-CANONICAL-SUPPLEMENT-v1.md`.

## 3. LOCKED / protected scopes

Protected unless explicitly reopened:
- Homepage v3.8;
- AYA Farm / TUMBUH;
- AYA Spice Haven / DIOLAH;
- AYA Snacks & Drinks / DINIKMATI;
- Product Catalog;
- Product Detail;
- Testimonials public;
- Testimonial Share;
- real testimonial data/upload/Supabase/moderation/approval;
- Pasokan Usaha;
- Information.

Cart/B2C v16 is the released checkpoint. Only one narrow Cart visual follow-up remains OPEN: remove the badge-like background from the desktop `item` count so it reads as plain count text beside the pcs count. This does not reopen other Cart geometry/behavior.

Shared changes require zero-regression proof.

## 4. Design system / Semesta AYA

Only `css/site.css` is the active public design system.

Testimonials + Share remain the strongest Semesta AYA visual benchmark:
- premium;
- warm;
- editorial;
- trustworthy;
- restrained materiality;
- heritage maroon depth;
- warm ivory/parchment surfaces;
- atmosphere quieter than content.

1VP is achieved through geometry/hierarchy/whitespace, not unreadably small typography or controls.

## 5. Product and commerce truth

`js/data.js` is the public product-data source of truth. Renderers may not invent/override product identity, line, category, status, image, variant, price, or quantity rules.

Public status vocabulary:
- Tersedia;
- Pre-order;
- Habis.

WhatsApp source of truth remains:
`AYA_CONFIG.whatsappNumber = 628562646444`.

One-time purchase remains B2C regardless of quantity. Recurring supply is Pasokan Usaha.

## 6. Cart/B2C released checkpoint

Detailed authority:
`AYA-RAOS-CART-B2C-CANONICAL-SUPPLEMENT-v1.md`.

Released implementation checkpoint:
`ff431b7` — `feat: implement approved Cart B2C v16 experience`.

Released source changes are limited to:
- `cart.html`;
- Cart/B2C selectors in `css/site.css`;
- `js/cart-page.js`.

Preserved contracts:
- Cart identity = `productId + variantName + quantity`;
- shared Cart/local draft APIs in `js/site.js` remain unchanged;
- `js/config.js` remains staging with shipping/payment providers disabled;
- `js/data.js` remains canonical product data.

Desktop Cart composition is approximately 60/40. Mobile uses separate Cart and Data Pesanan screens with the approved v16 product/variant/price geometry.

## 7. Shipping / benefit foundation

Current released fallback when no authoritative route shipping exists:
- Rp25.000 shipping;
- 50–99 total units: subsidy up to Rp25.000;
- 100+ total units: subsidy up to Rp50.000;
- actual subsidy cannot exceed shipping.

Future authoritative route shipping remains OPEN and requires the approved route-distance/server architecture. Do not represent fallback as a live Grab/Gojek rate.

## 8. Payment foundation

Cart may transition to the approved Payment presentation foundation through `Lanjut ke Pembayaran`.

Backend order persistence, payment gateway/provider, webhook verification, real QRIS, real VA, paid state, order ID, stock reservation, and completed-order state are NOT active in this checkpoint.

The UI must remain truthful while providers are disabled. Browser state must never independently create a fake paid status.

## 9. Other canonical supplements

- `AYA-RAOS-PRODUCT-CATALOG-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-TESTIMONIALS-SHARE-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-CART-B2C-CANONICAL-SUPPLEMENT-v1.md`

## 10. Release / hygiene discipline

`main` is an approved checkpoint, never experimentation.

Release remains staged:
preflight → implementation verify → governance sync/verify → fast-forward `main` → verify `origin/main` → housekeeping separately.

Do not delete preview/automation branches as part of the main release step. Audit and cleanup happen separately after canonical `main` is verified.

Production remains `noindex` until explicit Production Launch approval.

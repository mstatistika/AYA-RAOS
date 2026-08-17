# AYA RAOS — CART / B2C CANONICAL SUPPLEMENT v1

**Approved checkpoint:** 18 Agustus 2026  
**Scope:** Cart / Phase-1 B2C + Payment foundation  
**Implementation checkpoint:** `ff431b7` — `feat: implement approved Cart B2C v16 experience`  
**Repository:** `mstatistika/AYA-RAOS`  
**Release state:** approved for canonical `main` as a checkpoint; staging remains `noindex`.

## 1. Authority and protected boundary

This supplement governs the released Cart/B2C checkpoint. Stable project, product-data, claim-safety, and cross-scope rules remain governed by the latest current baseline, Project Constitution, and Execution Discipline.

Protected and unchanged as Cart side effects:
- Homepage;
- AYA Farm / TUMBUH;
- AYA Spice Haven / DIOLAH;
- AYA Snacks & Drinks / DINIKMATI;
- Product Catalog;
- Product Detail;
- Testimonials public;
- Testimonial Share;
- testimonial/Supabase/moderation flow;
- Pasokan Usaha;
- Information.

`css/site.css` remains the single public design system. Product data remains sourced from `js/data.js`.

## 2. B2C classification

Cart is for one-time B2C transactions.

Supported contexts:
- `Belanja Biasa`;
- `Acara`.

A one-time event remains B2C regardless of quantity. Recurring supply remains Pasokan Usaha. Quantity alone never converts a Cart transaction into Pasokan.

## 3. Released visual composition

Desktop uses the approved premium light Cart workspace at approximately 60% Cart / 40% customer-order context.

Left Cart contains:
- product rows;
- product image and identity;
- variant;
- unit price;
- quantity;
- line subtotal;
- remove action;
- live summary;
- `Lanjut Belanja`;
- total payment emphasis.

Right workspace contains:
- Belanja Biasa / Acara context;
- Nama Lengkap;
- WhatsApp;
- Catatan Pesanan;
- Alamat Pengiriman;
- location status/actions;
- Acara fields when applicable;
- primary CTA `Lanjut ke Pembayaran`.

Mobile uses separate Cart and Data Pesanan views. The approved Cart item geometry keeps product identity readable, variant control on the right, unit price above the red subtotal, and remove `×` on the same row as subtotal. Product names must not be compressed by the variant control; the locked example is `Kacang` / `Tanah Jumbo` in two lines.

The 1VP rule remains: solve through geometry/hierarchy/whitespace, never by shrinking typography into unreadability.

## 4. Cart storage / data contract

Preserve the existing Cart identity contract:

`productId + variantName + quantity`

Cart uses current canonical product/variant/price/quantity rules from `js/data.js`. `js/site.js` remains the owner of shared Cart storage and normalization APIs.

## 5. Shipping and B2C benefit checkpoint

The released implementation currently operates in approved fallback mode when no authoritative route shipping amount is available:
- shipping fallback: Rp25.000;
- 50–99 total units: subsidy up to Rp25.000;
- 100+ total units: subsidy up to Rp50.000;
- subsidy cannot exceed actual shipping;
- summary remains derived from current Cart state.

The approved future route model remains road-route distance with one final Rp5.000 upward rounding. Mapbox route integration, hidden origin configuration, and authoritative server-side route calculation are not activated by this checkpoint.

Do not claim the fallback amount is a live Grab/Gojek tariff.

## 6. Payment foundation truth

The released Cart includes the approved Payment presentation foundation and `Lanjut ke Pembayaran` transition.

Current production/staging configuration still has payment provider disabled. Therefore this checkpoint must not show or invent:
- a real order ID;
- a persisted pending order;
- a paid state;
- a real QRIS code;
- a real VA number;
- provider-confirmed payment status;
- stock reservation;
- completed-order confirmation.

QRIS/VA actions remain unavailable until a trusted backend/provider integration exists. Browser state must never independently mark payment as paid.

Future dependencies still OPEN include:
- order persistence backend and commercial snapshot;
- payment provider/gateway;
- webhook/server verification;
- payment expiry policy;
- live map/route service;
- exact hidden fulfillment-origin configuration;
- inventory reservation;
- customer/order history.

## 7. Released source paths

The Cart implementation checkpoint changes only:
- `cart.html`;
- Cart/B2C selectors inside `css/site.css`;
- `js/cart-page.js`.

`js/config.js`, `js/data.js`, and `js/site.js` contracts remain unchanged by the implementation checkpoint.

## 8. Known OPEN minor correction after checkpoint

User approved the coded preview as approximately 95% and explicitly allowed this checkpoint to enter `main` before the remaining minor correction.

Still OPEN:
- desktop Cart count `3 item` currently appears with a pill/background treatment;
- target is plain count text aligned naturally with `5 pcs`, without badge-like visual emphasis.

This is a narrow Cart visual follow-up. It does not reopen other Cart geometry or any protected scope.

## 9. Release discipline

This checkpoint is released through staged governance:
1. implementation preview already verified;
2. this canonical supplement records the released boundary and known open item;
3. canonical `main` may fast-forward only after governance remote verification;
4. housekeeping of preview/automation branches remains a separate later operation.

Production Launch remains unapproved; staging continues `noindex`.

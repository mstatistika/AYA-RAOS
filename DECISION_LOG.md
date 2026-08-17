# AYA RAOS — Active Decision Log

Historical decisions remain available in Git history.

This file contains only decisions that remain active for the current development baseline.

| ID | Active decision |
|---|---|
| AD-001 | `main` is the canonical branch; public staging remains `noindex` until explicit Production Launch approval. |
| AD-002 | Homepage v3.8 is locked and may not be changed unless explicitly reopened. |
| AD-003 | `css/site.css` is the single public-site design system; no parallel CSS architecture, stacked patch layer or `!important`. |
| AD-004 | `js/data.js` is the public product-data source of truth; renderers may not invent or override product facts. |
| AD-005 | WhatsApp source of truth is `AYA_CONFIG.whatsappNumber = 628562646444`. |
| AD-006 | B2C means one-time purchase, including one-time events; quantity alone never converts a Cart transaction into Pasokan Usaha. |
| AD-007 | Pasokan Usaha means recurring supply inquiry and remains a separate route/state/commercial model. |
| AD-008 | Cart/B2C v16 is the released transactional/payment-foundation checkpoint; backend order persistence, payment provider/webhook, real QRIS/VA, paid state, stock reservation and order history remain inactive until explicitly implemented. |
| AD-009 | Testimonials public page and Testimonial Share experience are FINAL LOCKED at `c11e538`; real data/upload/Supabase/moderation/approval remain protected. |
| AD-010 | Homepage assets under `assets/visual/home-lock/` are canonical. |
| AD-011 | Old packages, screenshots, rollback archives, automation artifacts and superseded branches are historical only and are not source authority. |
| AD-012 | Dedicated Line Pages are FINAL LOCKED at `0e6f125`: Farm/TUMBUH, Spice/DIOLAH and Snacks & Drinks/DINIKMATI. |
| AD-013 | Future implementation work starts from canonical `main` on a fresh `preview/*` or `feature/*` branch. |
| AD-014 | Product Catalog and Product Detail are FINAL LOCKED at `44533ef` and governed by the Product/Catalog canonical supplement. |
| AD-015 | Catalog desktop uses three products per grouped frame; navigation advances by three. |
| AD-016 | Visible Catalog filter is limited to the three AYA-line checkboxes plus price range. |
| AD-017 | Catalog Quick Add is locked at the photography/product-information boundary. |
| AD-018 | Product Detail hierarchy is `AYA RAOS = Semesta → Line = Dunia → Product = Hero`. |
| AD-019 | Product Detail commerce routes to Cart only; no direct Product Detail WhatsApp CTA and no visible lead-time block. |
| AD-020 | Product Detail targets a focused one-VP desktop stage with normal-flow fallback on shorter/responsive viewports. |
| AD-021 | Catalog approved heading is `Product Kami` with the approved three-line exploration copy. |
| AD-022 | Public status remains canonical data but is not shown on locked Catalog cards/Product Detail. |
| AD-023 | Catalog line filters use one-line checkbox → line icon → line name rows with the approved `Tiga dunia, satu AYA RAOS.` note. |
| AD-024 | Catalog grouped navigation uses the dedicated reserved rail and hides when no additional group exists. |
| AD-025 | Product Detail visible commerce is price + quantity + explicit variants + one full-width `Tambah ke Keranjang` CTA. |
| AD-026 | Sambal Bawang is the Product Detail visual/content prototype without making all product copy identical. |
| AD-027 | Product + Catalog approved geometry/navigation are locked and may not be restyled by unrelated scopes. |
| AD-028 | Testimonials + Share establish the strongest approved visual benchmark for Semesta AYA RAOS: premium, warm, editorial, material and non-flat. |
| AD-029 | Testimonials desktop composition is 20/40/40; photo = final artwork, text = text + product image, video = lower-third name + city/area. |
| AD-030 | Share has no customer-facing Review page; flow is form → consent → confirmation modal → canonical submission → success. |
| AD-031 | Pasokan Usaha is FINAL LOCKED at `a779b6e` with three VPs and one unified Product → Contact → Review workspace. |
| AD-032 | Pasokan `quantityStep: 5` is intentional for **Perkiraan kebutuhan**. It is inquiry granularity, not MOQ, final quantity or acceptance guarantee. |
| AD-033 | `AYA_BUSINESS_SUPPLY` is separate from B2C product/price logic; units are data-driven inquiry vocabulary and may later be managed by Admin. |
| AD-034 | Frequency is required per Pasokan product and currently supports daily, weekly, every two weeks, monthly and custom frequency. |
| AD-035 | Pasokan Contact validation is inline at each invalid field/consent; no large visible global Contact error box. |
| AD-036 | Pasokan ends in structured WhatsApp discussion and creates no order, quotation, approved price, inquiry ID or capacity guarantee. Draft persistence is local browser storage only. |
| AD-037 | Informasi was intentionally skipped after Pasokan work and remains unchanged until explicitly reopened. |
| AD-038 | Cart/B2C implementation checkpoint is `ff431b7` and changes only `cart.html`, Cart/B2C CSS in `css/site.css`, and `js/cart-page.js`; shared `js/site.js`, `js/data.js`, and `js/config.js` contracts are unchanged. |
| AD-039 | Cart desktop is approximately 60/40; mobile uses separate Cart and Data Pesanan views. The approved v16 item geometry keeps variant/price/remove on the right without compressing product names. |
| AD-040 | Cart fallback shipping is Rp25.000 when no authoritative route amount exists. Quantity shipping subsidy is up to Rp25.000 at 50–99 total units and up to Rp50.000 at 100+ units, capped by actual shipping. |
| AD-041 | Payment truth is backend/provider-owned. Disabled staging controls must not fabricate order IDs, QRIS/VA details, paid status, stock reservation, or completion. |
| AD-042 | One minor Cart follow-up remains OPEN after the released checkpoint: remove the badge-like background from the desktop item-count text; this does not reopen other Cart geometry or protected scopes. |
| AD-043 | The 1VP rule is geometry-first: readability, comfortable controls and premium visual weight must not be sacrificed merely to eliminate page scroll. |

## Canonical supplements

- `AYA-RAOS-PRODUCT-CATALOG-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-TESTIMONIALS-SHARE-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-CART-B2C-CANONICAL-SUPPLEMENT-v1.md`

Latest development baseline:
- `docs/AYA-RAOS-CURRENT-BASELINE-2026-08-18.md`

See Git history for superseded baseline detail.

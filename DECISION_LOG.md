# AYA RAOS — Active Decision Log

Historical decisions remain available in Git history.

This file contains only decisions that remain active for the current development baseline.

| ID | Active decision |
|---|---|
| AD-001 | `main` is the canonical branch; public staging remains `noindex` until explicit Production Launch approval. |
| AD-002 | Homepage v3.8 is locked and may not be changed unless explicitly reopened. |
| AD-003 | `css/site.css` is the single public-site design system; no parallel CSS architecture, stacked patch layer or `!important`. |
| AD-004 | `js/data.js` is the current public product-data source of truth during migration; renderers may not invent or override product facts. |
| AD-005 | WhatsApp source of truth is `AYA_CONFIG.whatsappNumber = 628562646444`. |
| AD-006 | B2C means one-time purchase, including one-time office/event/bulk purchases; quantity alone never converts a transaction into Pasokan Usaha. |
| AD-007 | Pasokan Usaha means recurring supply and remains a separate route/state/commercial domain from B2C. |
| AD-008 | Cart/B2C v16 is the released transactional/payment-foundation checkpoint; backend order persistence, payment provider/webhook, real QRIS/VA, paid state, stock reservation and order history remain inactive until explicitly implemented. |
| AD-009 | Testimonials public page and Testimonial Share experience are FINAL LOCKED at `c11e538`; real data/upload/Supabase/moderation/approval remain protected. |
| AD-010 | Homepage assets under `assets/visual/home-lock/` are canonical. |
| AD-011 | Old packages, screenshots, rollback archives, automation artifacts and superseded branches are historical only and are not source authority. |
| AD-012 | Dedicated Line Pages are FINAL LOCKED at `0e6f125`: Farm/TUMBUH, Spice/DIOLAH and Snacks & Drinks/DINIKMATI. |
| AD-013 | New implementation work starts from canonical `main` on an explicit implementation/preview/feature branch; `main` is never experimentation. |
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
| AD-031 | Public Pasokan vNext supersedes the old `a779b6e` public-flow behavior after release while preserving the three-VP architecture. Detailed public authority is `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md`. |
| AD-032 | Public Pasokan vNext cadence vocabulary is only W1 / W2 / M1 / M2. Old `Setiap hari` / custom-frequency UI is obsolete for vNext. |
| AD-033 | vNext quantity is estimated recurring need with normal integer increments; it is not MOQ, final order quantity, production commitment or capacity guarantee. The old global `quantityStep: 5` rule is v1 history only. |
| AD-034 | Current vNext frontend still reads selectable supply products/units through `AYA_BUSINESS_SUPPLY` + `AYA_PRODUCTS`; explicit Product Master B2B eligibility is approved target architecture but not yet implemented. No product-name heuristic is allowed. |
| AD-035 | Public Pasokan vNext company context requires company/business name, business context, PIC, WhatsApp, start time, delivery location and consent; Email and notes are optional at public entry. |
| AD-036 | Public Pasokan vNext no longer ends in the former structured WhatsApp inquiry. It proceeds to Summary + trusted system status; if qualification service is unavailable, the website stops truthfully and does not fabricate a result. |
| AD-037 | Information remains unchanged and protected until explicitly reopened. |
| AD-038 | Cart/B2C implementation checkpoint is `ff431b7` and changes only `cart.html`, Cart/B2C CSS in `css/site.css`, and `js/cart-page.js`; shared `js/site.js`, `js/data.js`, and `js/config.js` contracts were unchanged by that checkpoint. |
| AD-039 | Cart desktop is approximately 60/40; mobile uses separate Cart and Data Pesanan views. The approved v16 item geometry keeps variant/price/remove on the right without compressing product names. |
| AD-040 | Cart fallback shipping is Rp25.000 when no authoritative route amount exists. Quantity shipping subsidy is up to Rp25.000 at 50–99 total units and up to Rp50.000 at 100+ units, capped by actual shipping. |
| AD-041 | Payment truth is backend/provider-owned. Disabled staging controls must not fabricate order IDs, QRIS/VA details, paid status, stock reservation, or completion. |
| AD-042 | One minor Cart follow-up remains OPEN after the released checkpoint: remove the badge-like background from the desktop item-count text; this does not reopen other Cart geometry or protected scopes. |
| AD-043 | The 1VP rule is geometry-first: readability, comfortable controls and premium visual weight must not be sacrificed merely to eliminate page scroll. |
| AD-044 | B2B commercial qualification is system-driven. Browser code must not calculate or assert eligibility. Approved thresholds live in the B2B Commercial Architecture and must be enforced by trusted backend/state when implemented. |
| AD-045 | Approved B2B entry thresholds: Beras W1 5kg / W2 10kg / M1 25kg / M2 50kg; other products W1 Rp100k / W2 Rp200k / M1 Rp500k / M2 Rp1m. These thresholds never classify one-time B2C purchases. |
| AD-046 | `businessSupply.qualificationEndpoint` is intentionally absent from current staging config. Therefore public vNext must show `Status belum bisa diperiksa` rather than fabricate eligible/adjust status. |
| AD-047 | Positive status may expose `Aktivasi Akun Pasokan` only from a trusted response with a safe same-origin activation URL. The frontend itself creates no B2B account or commitment. |
| AD-048 | Broader B2B Commercial Architecture v1 remains APPROVED / LOCKED target architecture but not implemented by the public frontend release: Product Master eligibility, pricing/margin, commitment, account, payment, delivery, credit, shipping, Admin, Finance and Audit remain separate implementation phases. |
| AD-049 | Admin target access is `Function Registry → Role → Admin User`; one Admin User may have multiple Roles and effective permissions are the union of Role functions. This explicit B2B architecture supersedes Constitution v1.1's older one-user-one-role target statement until Constitution v1.2 is produced. |
| AD-050 | Public Pasokan vNext implementation scope is exactly `business.html`, the Business source block in `css/site.css`, and `js/business-inquiry.js`; protected scopes remain unchanged. |

## Canonical supplements

- `AYA-RAOS-PRODUCT-CATALOG-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-TESTIMONIALS-SHARE-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md`
- `AYA-RAOS-CART-B2C-CANONICAL-SUPPLEMENT-v1.md`

The broader approved B2B commercial/account/admin target is governed by the project resource `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.md` until it is synchronized into repository governance as part of its implementation phase.

Latest development baseline:
- `docs/AYA-RAOS-CURRENT-BASELINE-2026-08-21.md`

See Git history for superseded baseline detail.

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
| AD-034 | Product Master B2B eligibility exists as platform/database foundation; public Pasokan remains governed by its released source boundary and must not invent Product Master eligibility until a trusted publish/read-model contract is explicitly activated. |
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
| AD-046 | A qualification backend/API foundation exists, but current qualification configuration is disabled (`qualification_enabled=false`, scope/value basis pending). Public vNext must therefore remain truthful whenever trusted qualification is unavailable or disabled. |
| AD-047 | Positive status may expose `Aktivasi Akun Pasokan` only from a trusted response with a safe same-origin activation URL. The frontend itself creates no B2B account or commitment. |
| AD-048 | Broader B2B Commercial Architecture is present in source/database as platform foundation. Current main is under Admin/backend hardening; this does not constitute full live commercial activation. |
| AD-049 | Admin target access is `Function Registry → Role → Admin User`; one Admin User may have multiple Roles and effective permissions are the union of Role functions. This explicit B2B architecture supersedes Constitution v1.1's older one-user-one-role target statement until Constitution v1.2 is produced. |
| AD-050 | Public Pasokan vNext implementation scope is exactly `business.html`, the Business source block in `css/site.css`, and `js/business-inquiry.js`; protected scopes remain unchanged. |
| AD-051 | Public Mobile UI final implementation checkpoint is `ae52958a4408d9da95464e2f7b07de1544015457`; the mobile runtime is scoped to `max-width:900px` and only Home, Dedicated Lines, Product Catalog, Testimonials and Share. |
| AD-052 | Final approved mobile visual references are Homepage V3.7, Dedicated Line Pages V4.9, Catalog V5.31, Testimonials V6.5 and Share V7.23. Mobile presentation is governed by `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md`. |
| AD-053 | Final Mobile implementation source boundary is exactly `css/site.css`, `js/site.js`, and `js/mobile-public-ui.js`. `css/site.css` remains the only public stylesheet/design system; the temporary standalone mobile stylesheet was removed before release. |
| AD-054 | Information, Cart/B2C, Pasokan/B2B and direct Product Detail source/page are not modified by the Mobile release and remain governed by their existing locks/current authority. |
| AD-055 | Mobile Catalog uses one active product decision stage with AYA-line filtering, previous/next + swipe, explicit variant selection, inspectable photo and existing Cart runtime. Product/price/variant/fact truth continues to come from canonical public data and may not be invented. |
| AD-056 | Mobile Testimonials/Share presentation preserves real testimonial/submission data, upload, Supabase, moderation and approval contracts. Preview-only fake submission or fabricated testimonial/video content is never production truth. |
| AD-057 | For visual/interaction work, an explicitly approved ChatGPT HTML/browser preview is the implementation authority. After LOCK, implementation is translation rather than a second design phase; visible drift is an implementation defect and must be corrected toward the LOCK. |
| AD-058 | Codespaces is reserved for safe actual-source mutation that genuinely requires it, especially scoped `css/site.css` work. If execution stalls or a mutation fails, recover with read-only state verification before any retry; do not infer completion from a spinner, narration or intended command. |
| AD-059 | Current governance reconciliation checkpoint is `afeb5f45403920e9883d53bc0b18cafaf7918f68`. The latest main state is the current Admin/backend hardening state and must be re-verified before mutation. |
| AD-060 | Platform foundation and commercial activation are separate states: Admin/B2B/payment/shipping/qualification foundations may exist in source/database while public commercial activation remains disabled. |
| AD-061 | Reconciliation baseline is `docs/AYA-RAOS-CURRENT-STATE-2026-08-23-v13.md`; it is the current repository-state record until a newer CURRENT STATE is explicitly established. |
| AD-062 | Observed Supabase state at reconciliation: 1 admin user, 10 product-master rows, 10 catalog products, 0 B2B relationships, 0 invoices, 0 payment attempts, 0 provider payment attempts, 4 testimonials. Schema existence must not be treated as transaction history. |
| AD-063 | Active B2B shipping configuration observed in Supabase is Rp5.187/km motor and Rp10.021/km mobil. These are backend configuration facts and do not reopen B2C shipping authority. |
| AD-064 | Payment architecture is implemented as foundation, but live payment activation remains disabled. DOKU remains primary and Midtrans fallback by approved architecture; `Paid != Settled` remains mandatory. |
| AD-065 | No public visual scope is reopened by this governance sync. Post-release parity/polish remains available only when the user explicitly reopens a region. |
| AD-066 | Mobile Product Catalog was explicitly reopened and re-LOCKED as **Mobile Product Book V24**. For this mobile region only, V24 supersedes the older Catalog V5.31 presentation; settled visual authority is V14, interaction authority is R5.13, and V24 wrapper reliability fixes are approved. |
| AD-067 | R5.13 remains the Product Book physics authority: one product per physical leaf, fixed LEFT binding/gutter, native forward finger-following, approved reverse occluded swap/transition illusion, and FARM/SPICE/SNACKS physical bookmarks as line filters. Bug fixes may wrap but must not reinterpret those mechanics. |
| AD-068 | Production Mobile Product Book reads canonical public product data and existing Cart runtime. It may not hardcode preview prices/variants/availability or fabricate missing facts; unavailable/no-valid-variant products remain truthfully unavailable. |
| AD-069 | Mobile Product Book V24 production implementation checkpoint is `485f7f6e3f3bbfb95776677d5e7a7404f6bd434c`. Its source diff against the prior `main` is exactly `css/site.css`, `js/mobile-public-ui.js`, `js/site.js`, and `products.html`; desktop `js/catalog.js`, Product Detail and Cart/B2C contracts remain unchanged. |
| AD-070 | Staging remains `noindex, nofollow, noarchive`; releasing Mobile Product Book V24 to `main` does not constitute Production Launch approval. |
| AD-071 | On mobile Dedicated Line pages (`max-width:900px`), the featured `Lihat Detail` CTA routes into the locked Mobile Product Book for the current line (`products.html?line=farm|spice|snack`). Desktop Dedicated Line CTAs keep their canonical direct `product.html` Product Detail destinations. This is a journey-parity fix only and does not reopen visual locks or Product Detail. |

## Canonical supplements

- `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-PRODUCT-CATALOG-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-TESTIMONIALS-SHARE-CANONICAL-SUPPLEMENT-v1.md`
- `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md`
- `AYA-RAOS-CART-B2C-CANONICAL-SUPPLEMENT-v1.md`

The broader B2B commercial/account/admin architecture remains governed by the active Project Resource `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.1.md`; repository governance now records its actual platform-foundation/hardening state rather than treating the entire platform as nonexistent.

Latest development baseline:
- `docs/AYA-RAOS-CURRENT-STATE-2026-08-23-v13.md`

See Git history for superseded baseline detail.

# AYA RAOS — Central Decision Log

**Document ID:** AYA-DL-001
**Version:** 0.7 — Blueprint v1.5 Governance Lock
**Updated:** 5 Agustus 2026
**Repository:** `mstatistika/AYA-RAOS`
**Canonical parent:** `AYA-RAOS-WEBSITE-MASTER-BLUEPRINT-v1.5.md`
**Decision coverage:** Recovered and approved decisions through **DL-578**
**Current source status:** Verified baseline `main @ e6f891786655c7c8c44d7769d263a45bf1b8ef12`
**Launch status:** Staging / `noindex`; Production Launch belum disetujui

---

## 1. Status Vocabulary

- `Draft`
- `Under Review`
- `Approved`
- `Superseded`
- `Implemented`
- `Validated`
- `Released`
- `Migration Pending`

A decision is never deleted. A changed decision becomes `Superseded` and points to its replacement.

---

## 2. Migration Coverage

| Range | Migration status | Notes |
|---|---|---|
| DL-001–DL-077 | Migration Pending | Tidak dapat dipulihkan dari artefak yang tersedia. Jangan dibuat-buat. |
| DL-078–DL-093 | Recovered | Staging, Supabase, information anchors, dan catalog actions |
| DL-094–DL-108 | Migration Pending | Belum ditemukan pada artefak yang tersedia |
| DL-109–DL-134 | Recovered | Testimonial wizard dan media flow |
| DL-135–DL-304 | Migration Pending | Belum ditemukan pada artefak yang tersedia |
| DL-305–DL-539 | Recovered / Approved | Homepage, commerce, design system, page blueprints, routing, navigation |
| DL-540–DL-547 | Current | Source inspection, full-site sweep, merge, cleanup, dan current route treatment |

Missing ranges remain reserved and must not be reused.

---

## 3. Recovered Legacy Decisions

### 3.1 Staging and Supabase Foundation

| ID | Decision | Current status |
|---|---|---|
| DL-078 | Vercel domain is used as staging. | Implemented |
| DL-079 | Staging uses `noindex`, `nofollow`, and `noarchive`. | Implemented |
| DL-080 | Canonical URL and public sitemap are postponed until the custom domain is locked. | Approved |
| DL-081 | Dead-CSS audit must consider usage from HTML and JavaScript. | Approved |
| DL-082 | Testimonials page is separated from the submission form. | Implemented |
| DL-083 | `share.html` is the dedicated testimonial submission page. | Implemented |
| DL-084 | Testimonial format uses conditional radio options. | Implemented |
| DL-085 | AYA uses the existing Supabase project. | Implemented |
| DL-086 | AYA database objects use the `aya_` prefix. | Approved |
| DL-087 | Public submission uses RPC, not direct table insertion. | Implemented |
| DL-088 | Public visitors only read approved testimonials through RPC. | Implemented |
| DL-089 | Staging and production submissions are separated with an `environment` field. | Implemented |
| DL-090 | `aya-testimonial-media` is a private bucket. | Implemented |
| DL-091 | Direct file upload was initially inactive; media MVP used HTTPS URLs. | Superseded by DL-121–DL-125 |
| DL-092 | Information anchors use scroll margin and active navigation. | Implemented |
| DL-093 | Catalog cards provide separate Detail and quick-add actions. | Implemented; final interaction governed by DL-395–DL-398 |

### 3.2 Testimonial Wizard V2

| ID | Decision | Current status |
|---|---|---|
| DL-109 | Share Testimonial uses progressive disclosure. | Implemented |
| DL-110 | Flow is divided into About You, Your Story, and Review & Submit. | Implemented |
| DL-111 | Share page uses `testimonial-wizard.js`. | Implemented |
| DL-112 | `testimonials.js` no longer controls the Share form. | Implemented |
| DL-113 | Success state replaces the form after successful submission. | Implemented |
| DL-114 | Supabase schema and RPC are unchanged. | Implemented |
| DL-116 | Desktop sidebar is reduced so the workspace receives more room. | Implemented |
| DL-117 | All steps use a consistent previous/exit navigation pattern. | Implemented |
| DL-118 | Step one uses an information strip. | Implemented |
| DL-119 | Privacy note appears only in the sidebar. | Superseded by DL-127 |
| DL-120 | Step two uses side-by-side media and story layout on desktop. | Implemented |
| DL-121 | Photo supports direct upload or HTTPS link with an 8 MB upload limit. | Implemented |
| DL-122 | Video supports direct upload or HTTPS link with a 40 MB upload limit. | Implemented |
| DL-123 | Media preview modal closes by button, backdrop, or Escape. | Implemented |
| DL-124 | New files upload only on final submission. | Implemented |
| DL-125 | Media upload uses private bucket `aya-testimonial-media`. | Implemented |
| DL-126 | Primary desktop target is one 1366 × 768 viewport without extreme typography reduction. | Implemented |
| DL-127 | Privacy note is moved from sidebar to action bar. | Implemented; supersedes DL-119 |
| DL-128 | Text format does not show media workspace. | Implemented |
| DL-129 | Upload button directly opens the file picker. | Implemented |
| DL-130 | Link field appears only after selecting Paste Link. | Implemented |
| DL-131 | Format, media, review, validation, and Supabase payload use one JavaScript state. | Implemented |
| DL-132 | Review hides the media card entirely for Text format. | Implemented |
| DL-133 | Success state replaces sidebar, form, and action bar. | Implemented |
| DL-134 | Desktop layout is tuned so each step fits in one 1366 × 768 viewport. | Implemented |

---

## 4. Homepage Decisions

| ID | Decision | Status / relationship |
|---|---|---|
| DL-305 | Homepage Phase 1 uses two desktop composition viewports. | Approved |
| DL-306 | Viewport 1 contains utility bar, header, hero, one CTA, supporting facts, and trust bar. | Approved; revised from two CTA |
| DL-307 | Viewport 2 contains three product lines, real testimonials, and footer. | Approved |
| DL-308 | Product grid and Featured Products are not used on homepage. | Approved |
| DL-309 | Line cards use a general product category as title and official line name as secondary label. | Approved |
| DL-310 | Line accents follow Spice, Farm, and Snack while component structure remains consistent. | Approved |
| DL-311 | Homepage testimonials use a horizontal carousel with three visible cards, not a vertical ticker. | Approved |
| DL-312 | Top-left identity uses AYA RAOS; account icon is not used in Phase 1. | Approved |
| DL-313 | Two viewports are a composition target, not forced `100vh` or `100svh` per section. | Approved |
| DL-314 | Laptop homepage maximum is two viewports at 1366 × 768. | Approved |
| DL-315 | Testimonial carousel advances one card, auto-advances about every seven seconds, and pauses on interaction. | Approved |
| DL-316 | Large footer is replaced by a minimal footer. | Approved |
| DL-317 | WhatsApp response hours are Monday–Friday, 09.00–21.00 WIB. | Approved |
| DL-318 | First visual implementation prioritizes laptop; tablet/mobile follow desktop approval. | Approved |
| DL-319 | Homepage uses one main CTA: `Pesan Sekarang`. | Approved |
| DL-320 | Customer type selection happens after entering the Unified Order Gateway. | Approved |
| DL-321 | Homepage header does not expose Personal and Business as two competing order entries. | Approved |
| DL-322 | Header and hero CTA go to the same destination. | Approved |
| DL-323 | The single CTA destination is `cart.html`, functioning as Unified Order Gateway. | Approved |
| DL-324 | Homepage remains maximum two viewports at 1366 × 768. | Approved; consolidates DL-314 |
| DL-325 | Homepage testimonials use a three-card horizontal carousel. | Approved; consolidates DL-311 |
| DL-326 | Homepage and operational pages use a minimal footer. | Approved |
| DL-327 | WhatsApp response hours appear as Monday–Friday, 09.00–21.00 WIB. | Approved |
| DL-328 | Laptop is the first final visual scope. | Approved |

---

## 5. Unified Order Gateway and Payment Foundation

| ID | Decision | Status |
|---|---|---|
| DL-329 | `cart.html` becomes the single Unified Order Gateway for personal, event, business, and company needs. | Approved |
| DL-330 | B2C cart and B2B transaction wizard do not operate as two separate systems. | Approved |
| DL-331 | Order types are `Pesanan Pribadi` and `Acara / Usaha`. | Approved |
| DL-332 | Changing order type changes customer/business fields only; product, variant, quantity, and pricing remain unchanged. | Approved |
| DL-333 | Cart supports multi-item, variant changes, quantity changes, removal, unit price, item subtotal, and product subtotal in real time. | Approved |
| DL-334 | Personal order collects name, WhatsApp, area, address/location detail, optional needed date, and optional notes. | Approved |
| DL-335 | Event/Business collects event/company name, PIC, WhatsApp, email, need type, date, location/address, active extras, and notes. | Approved |
| DL-336 | Website displays a final monetary shipping amount before payment; technical tariff source is decided in architecture phase. | Approved |
| DL-337 | Website displays `Total Pembayaran`, not an estimate or a total waiting for admin confirmation. | Approved |
| DL-338 | Total formula is product subtotal + shipping + active fees/extras − official discounts. | Approved |
| DL-339 | Primary action after a valid order goes to payment: `Lanjutkan Pembayaran` or `Bayar Sekarang`. | Approved |
| DL-340 | WhatsApp is assistance, notification, summary, and exception channel; not calculator or payment gate. | Approved |
| DL-341 | Payment UI appears only for methods that are genuinely active and connected. Fake controls are forbidden. | Approved |
| DL-342 | Payment success changes the order to `Dibayar` and triggers AYA operational processing. | Approved |
| DL-343 | Availability, capacity, minimum order, lead time, shipping validity, and trusted total are validated before accepting payment. | Approved |
| DL-344 | Core lifecycle is Draft → Menunggu Pembayaran → Dibayar → Diproses → Siap Dikirim/Diambil → Dikirim/Diambil → Selesai. | Approved |

Explicitly superseded:

- two B2C/B2B CTA on homepage;
- separate B2B transaction wizard;
- `Kirim Pesanan via WhatsApp` as final commerce CTA;
- admin calculating total after chat;
- `Total Akhir — Menunggu konfirmasi admin`;
- admin approval after a customer has paid;
- payment being permanently outside the website plan.

---

## 6. Blueprint and Governance Decisions

| ID | Decision | Status |
|---|---|---|
| DL-345 | Every public page requires an approved blueprint before implementation. | Approved |
| DL-346 | All page blueprints belong to one Website Master Blueprint. | Approved |
| DL-347 | Business, UX, visual, technical, data, integration, and release decisions use one central Decision Log. | Approved |
| DL-348 | A changed decision is not deleted; it becomes `Superseded` and links to its replacement. | Approved |
| DL-349 | Laptop implementation begins only after all laptop page blueprints and cross-page dependencies are approved. | Approved |
| DL-350 | Homepage and Unified Order Gateway blueprints become child blueprints under the Master Blueprint. | Approved |
| DL-351 | Every current and future AYA RAOS project chat references the latest Website Master Blueprint. | Approved |
| DL-352 | Chat, mockup, idea, and recommendation are Draft until explicitly approved. | Approved |
| DL-353 | Every approved decision receives an ID, scope, affected pages, and blueprint update. | Approved |
| DL-354 | When chat conflicts with blueprint, blueprint remains valid until explicitly superseded. | Approved |
| DL-355 | Chat history is a discussion record; repository blueprint documents are the canonical record. | Approved |
| DL-356 | Before audit, mockup, coding, or source change, check the current blueprint and Decision Log. | Approved |
| DL-357 | Implementation may not rely only on conversation memory, old screenshot, or assumption. | Approved |

---

## 7. Global Design System Decisions

| ID | Decision | Status |
|---|---|---|
| DL-358 | One general design system is active through `css/site.css`. | Approved |
| DL-359 | `share.html` styling is migrated into an isolated `site.css` section without changing testimonial function, payload, upload, moderation, or Supabase flow. | Approved; migration remains parity-gated |
| DL-360 | Core typography uses Cormorant Garamond for display and Montserrat for body/interface; Allura is a limited non-critical accent. | Approved |
| DL-361 | The red–gold–cream palette is retained and formalized into brand and semantic tokens. | Approved |
| DL-362 | The maximum wide laptop container is 1240 px. | Approved |
| DL-363 | Spacing uses the locked 4–96 px scale. | Approved |
| DL-364 | General card radius is limited to 20 px and hero/media radius to 24 px, except circular/pill controls. | Approved |
| DL-365 | Global utility bar is 30–32 px and laptop header is 70–72 px. | Approved |
| DL-366 | Global footer is minimal, deep burgundy, and targets 80–96 px height. | Approved |
| DL-367 | Standard controls use 48 px height and interactive touch targets are at least 44 × 44 px. | Approved |
| DL-368 | Product-line accents are brand red, muted olive, and warm gold. | Approved |
| DL-369 | Semantic feedback colors are reserved for functional states, not general brand decoration. | Approved |
| DL-370 | Standard motion is 150–350 ms; testimonial carousel transition is 450 ms. | Approved |
| DL-371 | Ordinary sections are not locked to viewport height. | Approved |
| DL-372 | Responsive architecture uses four documented breakpoints and avoids untracked page-specific patching. | Approved |
| DL-373 | Disabled and loading are separate interaction states. | Approved |
| DL-374 | Direct WhatsApp is not a parallel checkout action in commerce components. | Approved |
| DL-375 | `Total Pembayaran` receives the strongest hierarchy in the order summary. | Approved |
| DL-376 | WCAG 2.2 AA is the accessibility baseline for public website implementation. | Approved |
| DL-377 | Gold is split into decorative `#b98a3a` and accessible text `#8f6725`; normal soft text uses `#766861`. | Approved |
| DL-378 | Breakpoint values are written literally in CSS media queries because the static project has no build/preprocessor step. | Approved |
| DL-379 | Font loading uses only approved weights, `font-display: swap`, robust fallbacks, and non-blocking Allura. | Approved |

---

## 8. Catalog Decisions

| ID | Decision | Status |
|---|---|---|
| DL-380 | `products.html` is the only public AYA RAOS product catalog. | Approved |
| DL-381 | Catalog uses a compact intro, not a giant hero. | Approved |
| DL-382 | Desktop Catalog uses a sticky filter sidebar on the right. | Approved |
| DL-383 | Search and sort appear above the product grid. | Approved |
| DL-384 | Required filters are product line, category, price, and public status. | Approved |
| DL-385 | Search, filters, sort, page, and applicable page size are stored in URL state. | Approved |
| DL-386 | Default sort is `Rekomendasi AYA` using explicit `catalogOrder`. | Approved |
| DL-387 | Laptop Catalog uses a four-column product grid. | Approved |
| DL-388 | Default pagination displays eight products. | Approved |
| DL-389 | Catalog supports eight or twelve products per page when the public product count requires it. | Approved |
| DL-390 | Product cards follow the approved Catalog commerce-card structure. | Approved |
| DL-391 | Public status, orderability, visibility, and verified badges are separate product fields. | Approved |
| DL-392 | Products without approved public status, price, variant, or required product data are hidden from the public Catalog. | Approved |
| DL-393 | Popularity and quality badges are prohibited without evidence and approval. | Approved |
| DL-394 | Missing or failed product images use line-specific branded placeholders. | Approved |
| DL-395 | Single-variant quick add adds quantity one directly. | Approved |
| DL-396 | Multi-variant quick add opens an accessible variant selector. | Approved |
| DL-397 | Quantity is not edited from Catalog quick add; it is managed in Product Detail or Cart. | Approved |
| DL-398 | Direct WhatsApp is not a product-card commerce action. | Approved |
| DL-399 | Product-line, category, status, and result counts are calculated from current public data. | Approved |
| DL-400 | Product taxonomy and data contract cleanup are mandatory before Catalog implementation. | Approved |
| DL-401 | Large footer, newsletter, account, tracking, inactive routes, and fake payment logos from the visual mockup are not adopted. | Approved |
| DL-402 | The uploaded Catalog mockup is the primary visual reference after correction against the Master Blueprint and verified business rules. | Approved |

---

## 9. Product Detail Decisions

| ID | Decision | Status |
|---|---|---|
| DL-403 | `product.html?id=` remains the single public Product Detail route. | Approved |
| DL-404 | The complete product decision and purchase area receives strong visibility in the first laptop viewport. | Approved |
| DL-405 | Product Detail uses a two-column laptop composition: gallery left and purchase panel right. | Approved |
| DL-406 | Product media uses an `images` collection and branded fallback; thumbnails appear only for multiple images. | Approved |
| DL-407 | Single variants auto-select; multiple variants require explicit customer selection. | Approved |
| DL-408 | Multi-variant choices use accessible option cards instead of a generic select. | Approved |
| DL-409 | Selected unit price and product subtotal update in real time. | Approved |
| DL-410 | Quantity uses product-level minimum, maximum, and step rules; the global maximum of 20 is removed. | Approved |
| DL-411 | Product Detail uses the same public status, visibility, orderability, and verified-badge contract as Catalog. | Approved |
| DL-412 | Tersedia and Pre-order products may be added to cart; Habis products may not. | Approved |
| DL-413 | `Tambah ke Keranjang` is the primary Product Detail action. | Approved |
| DL-414 | WhatsApp is not a primary purchase or checkout action on Product Detail. | Approved |
| DL-415 | Lead time, primary service area, and shipping context appear compactly in the purchase panel. | Approved |
| DL-416 | Exact shipping cost remains part of the Unified Order Gateway. | Approved |
| DL-417 | Product Detail retains one compact `Informasi Produk` section. | Approved |
| DL-418 | Compact Product Information contains Description, Composition, Storage, and Suitable Use. | Approved |
| DL-419 | Product-information copy is concise and scannable rather than a long article. | Approved |
| DL-420 | Unverified composition or storage is labelled honestly as being verified; no information is invented. | Approved |
| DL-421 | Related Products is removed from Product Detail. | Approved |
| DL-422 | The large help-selection block is removed from Product Detail. | Approved |
| DL-423 | Product Detail remains conversion-first without removing essential pre-order product information. | Approved |
| DL-424 | Product Detail uses one shared product-data source with Catalog, Cart, and Unified Order Gateway. | Approved |
| DL-425 | Invalid ID, data, image, variant, quantity, and cart failures require visible recovery states. | Approved |
| DL-426 | Product media follows optimized-format, explicit-dimension, and low-layout-shift rules. | Approved |
| DL-427 | The uploaded Product Detail mockup is the primary visual reference after alignment with the Master Blueprint. | Approved |

---

## 10. Unified Order Gateway V2 and Two-Column Revision

| ID | Decision | Status |
|---|---|---|
| DL-428 | `cart.html` is both the shopping cart and the Unified Order Gateway; no separate transaction route is created. | Approved |
| DL-429 | The transaction uses one connected progressive order draft rather than independent cart, form, and payment systems. | Approved |
| DL-430 | The user journey uses four stages: Keranjang, Data & Pengiriman, Ringkasan, and Pembayaran. | Approved |
| DL-431 | The four stages are states inside one page, not separate webpages. | Approved |
| DL-432 | Laptop composition uses three connected columns: cart, active gateway step, and live order summary. | Superseded by DL-446 |
| DL-433 | Mobile uses progressive accordion/panels while preserving the same order draft and transaction route. | Approved |
| DL-434 | Cart items remain editable before payment-session creation, subject to revalidation. | Approved |
| DL-435 | Personal and Acara / Usaha selection changes contextual fields only, not cart contents or product pricing. | Approved |
| DL-436 | The live order summary remains connected to cart, form, shipping, extras, discounts, and payment state. | Superseded by DL-448–DL-450 |
| DL-437 | Shipping and Total Pembayaran must be final and validated before payment is enabled. | Approved |
| DL-438 | Step validation preserves valid customer input and cart contents. | Approved |
| DL-439 | Payment CTA is enabled only when cart, customer data, shipping, trusted total, and provider state are valid. | Approved |
| DL-440 | Creating a payment session locks the validated order snapshot or invalidates that session when relevant order data changes. | Approved |
| DL-441 | A stale or changed total may not be paid. | Approved |
| DL-442 | WhatsApp remains assistance, notification, and exception handling; it is not a parallel transaction route. | Approved |
| DL-443 | Separate B2C/B2B cart systems or a second business transaction wizard are prohibited. | Approved |
| DL-444 | The V2 Unified Order Gateway mockup is the primary visual reference after correction against the Master Blueprint. | Superseded in desktop composition by DL-446–DL-453 |
| DL-445 | Unified Order Gateway Blueprint V2 supersedes V1 where progressive steps, three-column composition, and single-route behavior differ. | Approved |
| DL-446 | Desktop Unified Order Gateway uses two connected columns: Cart on the left and the progressive Order Gateway on the right. | Approved; supersedes DL-432 |
| DL-447 | The right column combines order type, customer data, shipping, final summary, and payment entry progressively. | Approved |
| DL-448 | Item count and Product Subtotal remain visible before the final summary becomes available. | Approved |
| DL-449 | The full financial summary appears only after required customer and shipping data are valid. | Approved |
| DL-450 | Final Ringkasan is a stage inside the right Order Gateway panel, not a permanent third column or separate route. | Approved |
| DL-451 | Editing cart, customer, address, shipping, extras, or discounts invalidates or recalculates affected totals before payment. | Approved |
| DL-452 | Mobile preserves the same progressive summary rule: Product Subtotal first, final summary after valid shipping. | Approved |
| DL-453 | Earlier Unified Order Gateway mockups remain component references, while their permanent three-column desktop composition is superseded. | Approved |

---

## 11. Testimonials Decisions

| ID | Decision | Status |
|---|---|---|
| DL-454 | `testimonials.html` is the read-only public showcase for approved testimonials. | Approved |
| DL-455 | Testimonial submission remains exclusively in `share.html`. | Approved |
| DL-456 | Desktop Testimonials uses two columns: video plus text ticker on the left and featured photo on the right. | Approved |
| DL-457 | Desktop text testimonials move slowly from bottom to top in a vertical ticker. | Approved |
| DL-458 | The ticker pauses on hover and keyboard focus and disables automatic movement for reduced motion. | Approved |
| DL-459 | Mobile does not use continuous vertical auto-scroll; testimonials become a normal stack or manual slider. | Approved |
| DL-460 | Video appears only when real approved media exists. | Approved |
| DL-461 | When no approved video exists, the layout reflows without a large empty placeholder. | Approved |
| DL-462 | One approved featured photo testimonial becomes the primary visual social-proof element. | Approved |
| DL-463 | Featured photo/video records are excluded from the text ticker to prevent duplication. | Approved |
| DL-464 | Star ratings are prohibited without a real approved rating field and moderation rule. | Approved |
| DL-465 | Inline testimonial submission forms are prohibited on `testimonials.html`. | Approved |
| DL-466 | Voucher, reward, customer-count, and unsupported product/heritage claims from the mockup are not adopted. | Approved |
| DL-467 | Global utility bar, header, and footer follow the locked AYA design system. | Approved |
| DL-468 | Public testimonial rendering requires visible loading, empty, remote-failure, and media-failure states. | Approved |
| DL-469 | The uploaded Testimonials mockup is the primary visual reference after correction against the Master Blueprint. | Approved |

---

## 12. Share Testimonial Decisions

| ID | Decision | Status |
|---|---|---|
| DL-470 | `share.html` remains the only public testimonial-submission route. | Approved |
| DL-471 | The three-step flow remains Tentang Anda, Cerita Anda, and Tinjau & Kirim. | Approved |
| DL-472 | Share Testimonial uses a one-page split wizard: information left and active task right. | Approved |
| DL-473 | The left panel contains a supporting quote, vertical progress, moderation, privacy/security, and WhatsApp help. | Approved |
| DL-474 | The right panel contains the page title, supporting copy, active step, and action bar. | Approved |
| DL-475 | The redundant horizontal Step 1–3 tracker is removed. | Approved |
| DL-476 | The left quote uses the approved trust tagline rather than repeating the page title. | Approved |
| DL-477 | The wizard must remain scroll-safe at short heights, 1024 × 768, and 200% zoom. | Approved |
| DL-478 | RPC, payload, private bucket, upload limits, consent, moderation, and environment separation remain protected. | Approved |
| DL-479 | Valid user input is preserved across steps and recoverable errors. | Approved |
| DL-480 | Successful submission produces a dedicated pending-review success state. | Approved |
| DL-481 | No reward, voucher, publication guarantee, or approval-time promise appears. | Approved |
| DL-482 | Upload, configuration, RPC, network, validation, and media errors require visible recovery states. | Approved |
| DL-483 | Share Testimonial follows WCAG 2.2 AA, keyboard, zoom, and reduced-motion requirements. | Approved |
| DL-484 | `share.css` is removed only after functional and visual parity is validated in `site.css`. | Approved |

---

## 13. Information Decisions

| ID | Decision | Status |
|---|---|---|
| DL-485 | `information.html` remains the single public information hub. | Approved |
| DL-486 | Quick cards are Cara Pesan, Pengiriman, Pembayaran, Syarat & Ketentuan, and Privasi. | Approved |
| DL-487 | Detailed sections are Cara Pesan, Pengiriman, Pembayaran, Acara/Usaha, FAQ, Syarat, and Privasi. | Approved |
| DL-488 | Quick cards are same-page summaries and anchor links, not separate routes. | Approved |
| DL-489 | Cara Pesan follows website Total Pembayaran and payment, not WhatsApp finalization. | Approved |
| DL-490 | Pengiriman states only verified area and product-specific suitability. | Approved |
| DL-491 | Exact shipping amount appears before payment. | Approved |
| DL-492 | Payment explains active methods and states without naming inactive providers. | Approved |
| DL-493 | AYA starts fulfillment only after payment status `Dibayar`. | Approved |
| DL-494 | Event, business, and company orders use the same Unified Order Gateway. | Approved |
| DL-495 | FAQ is a prominent accessible accordion/disclosure section. | Approved |
| DL-496 | Syarat does not invent cancellation, refund, return, expiry, or legal policy. | Approved |
| DL-497 | Privasi distinguishes order, payment, and testimonial data. | Approved |
| DL-498 | `Pesan Sekarang` links to `cart.html`; WhatsApp remains support. | Approved |
| DL-499 | Deep links and active-section tracking are preserved. | Approved |
| DL-500 | The uploaded Information mockup is the primary visual reference after correction against the Master Blueprint. | Approved |

---

## 14. Error & System States Decisions

| ID | Decision | Status |
|---|---|---|
| DL-501 | All critical failures require visible, actionable UI; console-only failure is prohibited. | Approved |
| DL-502 | A shared feedback hierarchy covers global, section, form, inline, and toast states. | Approved |
| DL-503 | Toasts are limited to short non-critical confirmations. | Approved |
| DL-504 | Product and image failure use visible recovery and branded placeholders. | Approved |
| DL-505 | Invalid or changed cart items require explicit reconciliation. | Approved |
| DL-506 | Any material cart, address, or shipping change invalidates the previous Total Pembayaran. | Approved |
| DL-507 | Shipping states are Not Started, Incomplete, Calculating, Available, Unavailable, Failed, and Stale. | Approved |
| DL-508 | Shipping failure never defaults to zero or an invented estimate. | Approved |
| DL-509 | Payment success is shown only after trusted confirmation. | Approved |
| DL-510 | Payment retry must protect against duplicate payment. | Approved |
| DL-511 | Pending payment does not trigger fulfillment. | Approved |
| DL-512 | Testimonial and media failures preserve valid input and approved text where safe. | Approved |
| DL-513 | `404.html` works without JavaScript and provides Home and Catalog recovery actions. | Approved |
| DL-514 | 404 uses the approved global shell, minimal footer, and staging noindex. | Approved |
| DL-515 | Remote-action failures distinguish retryable and non-retryable states. | Approved |
| DL-516 | Form error summaries receive focus and field errors are associated accessibly. | Approved |
| DL-517 | Public diagnostics never expose secrets, private media paths, or unnecessary personal data. | Approved |
| DL-518 | Error/System States implementation follows WCAG 2.2 AA, zoom, and reduced-motion requirements. | Approved |

---

## 15. Full Website Laptop Decisions

| ID | Decision | Status |
|---|---|---|
| DL-519 | The Phase 1 public route set is limited to the routes defined in the Full Website Laptop route matrix. | Approved |
| DL-520 | `cart.html` is the only personal, event, business, and company transaction gateway. | Approved |
| DL-521 | `business.html` may not remain a parallel transaction system. | Approved |
| DL-522 | FAQ, Terms, and Privacy remain anchored sections in `information.html` for the current phase. | Approved |
| DL-523 | One global utility bar, header, and minimal footer apply across all main routes. | Approved |
| DL-524 | All product-facing routes use one product data source and one currency formatter. | Approved |
| DL-525 | All WhatsApp actions use `AYA_CONFIG.whatsappNumber`. | Approved |
| DL-526 | 1366 × 768 is the primary laptop composition and validation target. | Approved |
| DL-527 | No ordinary route is forced to viewport height. | Approved |
| DL-528 | Implementation follows one controlled full-site sweep after blueprint approval and source inspection. | Approved |
| DL-529 | Product and configuration normalization precede page implementation. | Approved |
| DL-530 | Protected Share Testimonial parity is required before removing `share.css`. | Approved |
| DL-531 | Shipping and payment visual states may be implemented before integration, but inactive methods may not appear active. | Approved |
| DL-532 | Full validation covers four viewports, keyboard, zoom, contrast, reduced motion, and error states. | Approved |
| DL-533 | No commit, push, or merge occurs before preview approval. | Approved |
| DL-534 | Major implementation is delivered as a validated backup and rollback package. | Approved |
| DL-535 | Production Ready requires explicit integration, security, validation, and launch approval. | Approved |

---

## 16. Global Order Routing Decisions

| ID | Decision | Status |
|---|---|---|
| DL-536 | Every global order entry point routes to the Unified Order Gateway at `cart.html`. | Approved |
| DL-537 | Business and event ordering use `cart.html?type=business`; `business.html` may only serve as a compatibility redirect and may not render a parallel transaction flow. | Approved |

---

## 17. Global Navigation Decisions

| ID | Decision | Status |
|---|---|---|
| DL-538 | The global navigation order is Beranda, Tentang AYA, Produk, Testimoni, and Informasi, followed by Keranjang and Pesan Sekarang actions. | Approved |
| DL-539 | AYA Spice Haven, AYA Farm, and AYA Snacks & Drinks are explained within Tentang AYA and remain available as Catalog taxonomy/filters rather than separate global-navigation items. | Approved |

---

## 18. Full-Site Sweep, Merge, and Repository Decisions

| ID | Decision | Status |
|---|---|---|
| DL-540 | The full-site sweep uses `main @ 008267c955c61a670b07427b372f0423f584c115` as its inspected baseline. | Implemented |
| DL-541 | Legacy preview branches are not continued as the canonical implementation baseline; the sweep uses a clean branch created from `main`: `preview/laptop-master-rebuild-v1`. | Implemented |
| DL-542 | The implementation is delivered as `AYA-RAOS-FULL-SITE-SWEEP-v1.0.0` with installer, backup, rollback, validator, reports, and SHA-256 verification. | Validated |
| DL-543 | `share.html`, `css/share.css`, `js/supabase-client.js`, and `js/testimonial-wizard.js` remain protected and are preserved by the sweep. | Validated |
| DL-544 | The installed full-site preview was accepted as sufficient for promotion to `main` on 5 Agustus 2026. | Approved |
| DL-545 | The full-site sweep was committed and merged into `main`; current merge commit is `e37c2c5890250ce4dc4bfef51b3ab91e1a3164be`. | Implemented |
| DL-546 | Installer ZIPs, extracted package folders, temporary backups, obsolete frontend packages, and parallel legacy CSS are not part of the production source and must be removed after validation. | Approved |
| DL-547 | For the current phase, `about.html` remains a compatibility redirect to the Tentang AYA section rather than becoming an independent public content route. | Implemented |

Important release distinction:

> Merge to `main` is complete, but it is not equivalent to Production Launch. `noindex` remains until explicit launch approval.

---

## 19. Current Implementation Snapshot

**Git repository**

```text
Repository: mstatistika/AYA-RAOS
Production branch: main
Merge commit: e37c2c5890250ce4dc4bfef51b3ab91e1a3164be
Commit message: merge: AYA RAOS full-site blueprint sweep
```

**Package validation**

- 133 automated checks passed;
- zero blocking package-validation failures;
- 28 route/viewport Chromium smoke combinations completed;
- installer rejection on `main` validated;
- tamper detection validated;
- backup and rollback simulation validated;
- protected-file hash verification validated.

**Deployment observation at document update**

Vercel was still displaying the historical deployment from:

```text
008267c — Merge testimonial media flow checkpoint
```

The required deployment target is:

```text
e37c2c5 — merge: AYA RAOS full-site blueprint sweep
```

This is an operational deployment-verification item, not a rollback of the merge decision.

---

## 20. Open Decision Register

Open decisions do not receive a DL number until explicitly approved.

| Open ID | Topic | Affected scope |
|---|---|---|
| OD-007 | Shipping tariff source and integration | Unified Order Gateway / Payment |
| OD-008 | Payment provider and genuinely active payment methods | Payment |
| OD-009 | Backend/serverless architecture | Order / Payment |
| OD-010 | Order database, persistence, and audit trail | Order / Admin |
| OD-011 | Refund and post-payment cancellation policy | Payment / Information |
| OD-012 | Payment expiry and retry policy | Payment |
| OD-013 | Production domain, canonical URL, sitemap, indexing, and launch SEO | Release |
| OD-016 | Confirm Vercel production deployment is built from current `main` commit `e37c2c5` | Deployment |
| OD-017 | Final live-site visual validation after deployment on all four target viewports | Validation |

---

## 21. Governance Rule Going Forward

Before any new AYA RAOS change:

1. read the latest Master Blueprint;
2. check this Decision Log;
3. inspect the actual `main` source and current deployment;
4. identify whether the request is Brainstorm, Decision, Implementation, Preview, or Release;
5. create a clean preview/feature branch;
6. update source of truth directly;
7. validate;
8. obtain approval;
9. only then commit, push, and merge.

No future change may treat an old deployment, old ZIP, old preview branch, or chat memory as the current source of truth.

---

## 22. Blueprint v1.5 Capability-Gate Decisions

| ID | Decision | Status |
|---|---|---|
| DL-548 | The Unified B2C Order Gateway supports two operational modes: `inquiry` and `payment`, controlled by configuration. | Approved |
| DL-549 | In inquiry mode, a valid B2C order must be persisted and assigned an Order ID before WhatsApp continuation. WhatsApp may not become the source of truth. | Approved |
| DL-550 | `business.html` may provide a dedicated business-supply information and inquiry experience, but may not create a second retail cart, retail pricing engine, or retail checkout. | Approved; refined by DL-572, DL-575–DL-578 |
| DL-551 | Bulk pricing and MOQ are phase-gated capabilities enabled per product or supply relationship only after pricing, margin, capacity, packaging, lead-time, shipping, and approval rules exist. | Approved |
| DL-552 | Ready stock and faster dispatch may be enabled per product only when supported by reliable inventory and operational cut-off rules. | Approved |
| DL-553 | WhatsApp response hours are configuration-driven and may change only through an approved operational decision. | Approved |
| DL-554 | Promotions, free-shipping thresholds, and damage/replacement guarantees are policy-gated capabilities and remain disabled until their rules and owners are approved. | Approved |
| DL-555 | Public claims and trust signals that require proof must be governed through an Evidence Registry. | Approved |
| DL-556 | Future capabilities are disabled by default until evidence, policy, operation, technical readiness, and approval exist. | Approved |
| DL-557 | A missing disabled future capability is not automatically a defect. An active or publicly promised capability that cannot be fulfilled is a defect. | Approved |

---

## 23. Sunda Culinary and Sambal Positioning Decisions

| ID | Decision | Status |
|---|---|---|
| DL-558 | AYA RAOS is positioned as a Sundanese culinary brand from Lippo Utara. | Approved |
| DL-559 | The owner-provided claim that AYA RAOS is the only Sundanese culinary concept of its kind in Lippo Utara remains evidence and approval-gated before public use. | Approved |
| DL-560 | Sambal AYA does not use a numerical or selectable spiciness-level system. Pedas is the absolute base character of the product. | Approved |
| DL-561 | Product communication describes flavor, aroma, texture, ingredient character, and suitable use instead of an invented numerical heat scale. | Approved |
| DL-562 | Sambal Bu Rudy is an internal category benchmark only and may not be used as public comparative copy without explicit approval. | Approved |

---

## 24. Hyperlocal Growth and Restaurant Vision Decisions

| ID | Decision | Status |
|---|---|---|
| DL-563 | AYA RAOS follows a hyperlocal growth sequence: rumah ke rumah, komplek ke komplek, Lippo Utara market strengthening, restaurant development, and long-term culinary-hub development. | Approved |
| DL-564 | Lippo Utara is the primary market for awareness, repeat order, referral, operational learning, and demand validation. | Approved |
| DL-565 | Sambal AYA remains the hero product and first customer entry point within the broader Sundanese culinary identity. | Approved |
| DL-566 | Opening an AYA RAOS restaurant in Lippo Utara is a future vision and may not be presented as a current facility. | Approved |
| DL-567 | The long-term target is to become a center of Sundanese culinary experience in Lippo Utara through food, packaged products, farm products, snacks, drinks, dining, and culinary education. | Approved |
| DL-568 | Hyperlocal growth is measured through structured orders, repeat orders, area demand, referrals, testimonials, event needs, and operational capacity rather than unsupported popularity claims. | Approved |
| DL-569 | Website copy must distinguish current operating facts from restaurant, market-leadership, and culinary-hub ambitions. | Approved |

---

## 25. Final B2C and B2B Segmentation Decisions

| ID | Decision | Status |
|---|---|---|
| DL-570 | AYA RAOS distinguishes B2C and B2B by transaction-relationship pattern, not buyer identity or order quantity. | Approved |
| DL-571 | Every one-time purchase is B2C, including personal, event, company, institutional, restaurant trial, store trial, distributor trial, and large-quantity one-time purchases. | Approved |
| DL-572 | B2B AYA RAOS applies only to recurring or continuing commercial supply relationships. | Approved |
| DL-573 | A one-time commercial trial remains B2C until a recurring supply relationship is sought and approved. | Approved |
| DL-574 | Order volume does not determine segment. A large one-time order remains B2C; a smaller recurring commercial supply may be B2B. | Approved |
| DL-575 | The Unified B2C Order Gateway covers Personal and Event contexts and all other one-time purchases. | Approved |
| DL-576 | The B2B recurring-supply inquiry must not offer a one-time frequency option. | Approved |
| DL-577 | A B2B submission creates a Business Inquiry ID and is not a confirmed order or quotation until product, volume, frequency, capacity, price, shipping, and terms are agreed. | Approved |
| DL-578 | B2B pricing is specific to an approved recurring supply relationship and is not automatically granted to a large one-time order. | Approved |

---

## 26. Supersession Matrix for Earlier Commerce Decisions

The following earlier decisions remain historically valid but are superseded or narrowed where they conflict with DL-548–DL-578.

| Earlier decision | Revised treatment |
|---|---|
| DL-329–DL-344 | `cart.html` remains the Unified **B2C** Order Gateway. Recurring B2B supply is removed from the retail transaction flow. |
| DL-331 | `Pesanan Pribadi` and `Acara / Usaha` are superseded by `Untuk Rumah`, `Untuk Acara`, and separate recurring `Pasokan Usaha`. |
| DL-335 | Event and business fields are separated. Event remains B2C; recurring supply uses Business Inquiry fields. |
| DL-340 / DL-374 / DL-414 / DL-442 | WhatsApp remains non-authoritative. Inquiry mode may continue to WhatsApp only after successful Order/Inquiry persistence and ID generation. |
| DL-428–DL-453 | The two-column Unified Order Gateway remains valid for B2C Personal/Event. It no longer covers recurring B2B supply. |
| DL-494 | Event orders remain in the Unified B2C Gateway. Recurring supply uses `business.html`. |
| DL-520 | `cart.html` is the only one-time purchase gateway, not the recurring B2B inquiry route. |
| DL-521 | `business.html` may not be a parallel retail transaction system, but it becomes the canonical recurring-supply information and inquiry route. |
| DL-537 | `cart.html?type=business` is superseded. New contexts are `cart.html?context=personal`, `cart.html?context=event`, and `business.html` for recurring supply. |

---

## 27. Current Governance Status

```text
Master Blueprint v1.5        : Locked
Decision Log through DL-608  : Locked
Sunda visual baseline v1.3   : Approved on main
Awareness/Response/Action v1.5: Active refinement preview
Order persistence            : Active in staging
B2B inquiry persistence      : Active in staging
Protected Share parity       : Active
Shipping                     : Inactive
Payment                      : Inactive
Indexing                     : Disabled
Production Launch            : Not approved
```

---

## 28. Active Open Decisions

| Open ID | Topic |
|---|---|
| OD-007 | Shipping tariff source and integration |
| OD-008 | Payment provider and active methods |
| OD-011 | Refund and post-payment cancellation policy |
| OD-012 | Payment expiry and retry policy |
| OD-013 | Production domain, canonical, sitemap, indexing, and SEO launch |
| OD-018 | Public evidence standard for the “only Sundanese culinary concept in Lippo Utara” claim |
| OD-019 | B2C Event field set, consent wording, and packaging-policy boundary |
| OD-020 | B2B recurring-supply status model, operational owner, and response SLA |
| OD-021 | Product-information verification program: net weight, composition, shelf life, storage, and flavor profile |
| OD-022 | Ready-stock and dispatch policy by product |
| OD-023 | Damage/replacement policy |
| OD-024 | Weekend WhatsApp operating model |
| OD-025 | Public bulk-pricing or MOQ policy for approved recurring supply relationships |
| OD-026 | 404 global-shell decision |
| OD-027 | Default-variant policy for multi-variant Product Detail |

---

## 29. Phase 2 Order Foundation Decisions

| ID | Decision | Status |
|---|---|---|
| DL-579 | Phase 2 is implemented directly on `main` through a guarded one-command installer at the owner's explicit direction. | Approved |
| DL-580 | B2C inquiry mode persists a server-validated order and returns an Order ID before WhatsApp continuation. | Approved |
| DL-581 | Order IDs use `AYA-STG-ORD-YYYYMMDD-NNNNNN` in staging and `AYA-ORD-YYYYMMDD-NNNNNN` in production. | Approved |
| DL-582 | Approved product and variant prices are mirrored in Supabase as the server-side validation source for order creation. | Approved |
| DL-583 | Shipping amount and total payment remain null until an approved shipping integration or admin confirmation exists. | Approved |
| DL-584 | Recurring B2B submissions persist as Business Inquiries and return a Business Inquiry ID; they remain non-order and non-quotation records. | Approved |
| DL-585 | Business Inquiry IDs use `AYA-STG-BIZ-YYYYMMDD-NNNNNN` in staging and `AYA-BIZ-YYYYMMDD-NNNNNN` in production. | Approved |
| DL-586 | Payment, inventory, quotation automation, public order tracking, and customer accounts remain outside Phase 2 Order Foundation. | Approved |
| DL-587 | Public clients cannot insert trusted totals directly; RPC functions validate products, variants, quantities, prices, recurring intent, rate limits, and idempotency. | Approved |

---

## 30. Brand Ecosystem Hub Decisions

| ID | Decision | Status |
|---|---|---|
| DL-588 | AYA RAOS is the master brand and public Brand Ecosystem Hub; direct website entry must explain `AYA RAOS = Ada Rasa` and the relationship to its three lines. | Approved |
| DL-589 | The public line names are standardized as `AYA Spice Haven`, `AYA Farm`, and `AYA Snacks & Drinks`. | Approved |
| DL-590 | Master-brand colors remain Heritage Maroon, Cream, and Gold; line accents are Spice Red, Farm Green, and Warm Amber respectively. | Approved |
| DL-591 | Each line may use a distinct marketing emphasis while retaining one AYA RAOS design system, typography, Sunda framing language, and navigation back to the master brand. | Approved |
| DL-592 | Product QR codes should enter the relevant line landing page with a source parameter rather than defaulting every scan to the master homepage. | Approved |
| DL-593 | Every line landing page must visibly identify itself as part of AYA RAOS and provide access back to the master hub and the other lines. | Approved |
| DL-594 | Sambal AYA remains the current hero product under AYA Spice Haven and may be featured on the AYA RAOS homepage without redefining AYA RAOS as a sambal-only brand. | Approved |

| DL-595 | Brand Ecosystem Hub v1.4 direction is visually approved as the active refinement direction; subsequent work refines hierarchy and cross-navigation rather than redesigning the approved Sunda system. | Approved |
| DL-596 | The AYA RAOS first viewport must visually represent all three lines, while Sambal AYA remains the current hero product and conversion entry under AYA Spice Haven. | Approved |
| DL-597 | Line palette names such as `Spice Red`, `Farm Green`, and `Warm Amber` are internal design-system terminology and are not exposed as customer-facing marketing copy. | Approved |
| DL-598 | QR-ready source parameters may be preserved from a line landing page into product navigation without activating an analytics provider; source attribution remains non-authoritative until analytics is approved. | Approved |
| DL-599 | Brand Ecosystem Hub refinement remains on a feature/preview branch until browser QA passes at 1366×768, 1440×900, 1024×768, and 390×844; approval does not authorize Production Launch. | Approved |

---

## 31. Awareness → Response → Action Decisions

| ID | Decision | Status |
|---|---|---|
| DL-600 | The AYA RAOS Homepage follows the governing journey `Awareness → Response → Action`; direct commercial conversion does not replace master-brand comprehension. | Approved |
| DL-601 | Homepage Awareness order is locked as: who AYA RAOS is → why `AYA RAOS / Ada Rasa` → why the ecosystem is divided into three lines → what the three line names are → understand each line in more detail. | Approved |
| DL-602 | DL-596 is superseded. The first viewport no longer needs to visually represent all three lines; it must establish AYA RAOS / Ada Rasa as the master brand first. Line colors and line selection appear later in the Awareness journey. | Approved — supersedes DL-596 |
| DL-603 | Dedicated line landing pages are Response-first entry points. A visitor arriving from an approved product QR may be shown concise QR-entry context while retaining a clear route back to AYA RAOS; this does not activate an analytics provider. | Approved |
| DL-604 | After line awareness, the Homepage Response gateway supports three relevant intents: explore/buy products, recurring business supply, or share an existing customer experience. | Approved |
| DL-605 | Sambal AYA remains the current hero product under AYA Spice Haven but is placed after ecosystem awareness as a conversion entry, not as the definition of AYA RAOS. | Approved |
| DL-606 | Testimonials serve two roles: verified trust evidence for prospective customers and an advocacy action for customers who have already enjoyed AYA. | Approved |
| DL-607 | The v1.5 holistic refinement does not activate payment, shipping automation, analytics, production indexing, or Production Launch. | Approved |
| DL-608 | The v1.5 technical quality gate includes source validation, local-reference integrity, JS syntax checks, protected integration hashes, accessible focus/reduced-motion behavior, and responsive QA targets; production performance metrics must be measured before launch rather than claimed by this preview. | Approved |

---

## 32. Brand Journey & Cultural Depth v1.5.1 Decisions

| ID | Decision | Status |
|---|---|---|
| DL-609 | v1.5.1 is a refinement of the approved v1.3–v1.5 visual and brand architecture, not a redesign. | Approved |
| DL-610 | The Homepage journey expands from `Awareness → Response → Action` into an experiential sequence where understanding and feeling are established before commercial response; culture must function as content, not decorative density. | Approved |
| DL-611 | Selective Sundanese language may appear as a hospitality or meaning cue when it improves context; it must remain sparse and must not reduce Indonesian-language clarity. | Approved |
| DL-612 | Cultural and human storytelling may use only verified brand facts, product context, and approved evidence. Invented founder history, ancestral recipes, sourcing origin, production scale, client names, or cultural claims are prohibited. | Approved |
| DL-613 | Homepage three-line reveal and detailed line explanation are paced as one ecosystem chapter to reduce presentation-deck repetition while preserving the required order: know the line names first, then understand their character. | Approved |
| DL-614 | Readability is a design-quality requirement. The v1.5.1 active system raises normal body copy to 16px and increases critical labels, buttons, product copy, forms, and footer text; tiny typography remains decorative only. | Approved |
| DL-615 | Product Detail exposes the existing `suitableUse` field as `Cara Menikmati`; this is product guidance, not an unverified cultural or health claim. | Approved |
| DL-616 | Key shareable staging pages receive OpenGraph title, description, and image metadata using the current Vercel staging domain; canonical/indexing/structured-data Production Launch remains governed by OD-013. | Approved |
| DL-617 | Protected testimonial, order, cart, business-inquiry, and Supabase logic remain unchanged in v1.5.1. The Share page may receive non-functional copy/metadata consistency fixes only. | Approved |
| DL-618 | Human/process/source photography is a future evidence-content track. The website must not simulate production scale, origin, founder history, or client proof through misleading imagery while real documentation is unavailable. | Approved |

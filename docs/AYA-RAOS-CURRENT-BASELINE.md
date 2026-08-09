# AYA RAOS — Current Development Baseline

**Status:** Canonical development baseline  
**Date:** 9 Agustus 2026  
**Repository:** `mstatistika/AYA-RAOS`  
**Production branch:** `main`  
**Website state:** staging / `noindex`  
**Sanitized from:** `6978c05ba33ad3100f65b6a67ee0287fa9a759b4`

## 1. Authority

This document describes the active repository boundary after the 9 August 2026 sanitation sweep.

When repository history, old screenshots, old packages, old docs, or previous implementation experiments conflict with this baseline, this baseline and the latest approved business/project instructions take precedence.

Old package/version labels are historical only. They are not implementation authority.

## 2. Protected baseline

- Homepage v3.8 is the locked homepage visual baseline.
- Homepage assets are canonical under `assets/visual/home-lock/`.
- Testimonial submission remains protected: `share.html`, `css/share.css`, `js/supabase-client.js`, and `js/testimonial-wizard.js` must not be redesigned or functionally changed without explicit scope.
- Supabase testimonial upload/moderation remains active and separate from future order persistence.
- `css/site.css` is the only public-site design system.

## 3. Active business facts

- Brand: **AYA RAOS = Ada Rasa**.
- Hero product: **Sambal AYA**.
- WhatsApp source of truth: `AYA_CONFIG.whatsappNumber = 628562646444`.
- Primary area: Lippo Utara, then Jabodetabek, then Indonesia when the product and shipping method are suitable.
- Lead time: **2–3 days after payment is received**.
- Jabodetabek delivery using Grab/Gojek uses the actual applicable rate.
- Do not publish unsupported claims such as same-day delivery, free shipping, always available stock, nationwide coverage for every product, halal/organic/certification claims, customer/review counts, capacity claims, awards, or client lists without evidence and approval.

## 4. Product source of truth

`js/data.js` is the source of truth for public product data, including price, variant, status, line, category, image/placeholder, and verified information flags.

Renderers must not override product images or product facts with mockup-specific mappings.

Public statuses are:

- Tersedia
- Pre-order
- Habis

Information that is not verified must be labelled honestly rather than inferred from a mockup or old source.

## 5. Phase 1 B2C

The active customer flow is:

`Product → Variant/Qty → Cart → Customer/Area information → Review → WhatsApp confirmation`

The cart is not an online checkout. It does not create a public Order ID and does not persist an order as the source of truth in Phase 1.

The WhatsApp message must contain product, variant, quantity, unit price, item subtotal, total product subtotal, and the relevant customer context. Shipping cost and final total remain subject to admin confirmation.

Payment UI/provider integration remains inactive.

## 6. Phase 1 B2B

The active inquiry contexts are:

1. Usaha & Acara
2. Bulk & Custom
3. Perusahaan

The inquiry collects company/organization, PIC, WhatsApp, email, context, product, estimated quantity, date, location, optional extras, notes, and consent.

The result is a review summary followed by WhatsApp continuation. It does not create a quotation, confirmed order, Business Inquiry ID, public wholesale price, MOQ/capacity promise, reseller/distributor/private-label/sample program, or quotation automation.

## 7. Future capabilities

Payment, order database, audit trail, admin, role matrix, inventory, quotation, customer accounts, and order history remain future phases unless explicitly reopened and approved.

`supabase/migrations/20260806153000_aya_phase2_order_foundation.sql` is retained only as migration/history safety. It is **dormant for the current Phase 1 runtime** and must not be treated as proof that order persistence is active.

## 8. Visual implementation boundary

- Homepage v3.8 remains locked.
- Catalog and Product Detail visual references may be locked separately, but implementation must start from the current clean source and `js/data.js`; do not reuse obsolete renderer overrides or deleted mockup-specific asset directories.
- Shared header/navigation uses the Homepage-aligned shell.
- No parallel CSS system, no stacked patch layer, and no `!important`.
- Desktop locked compositions may use explicit viewport discipline only where specifically approved. Responsive tablet/mobile pages use normal document flow.

## 9. Repository hygiene

Do not commit:

- generated ZIP packages;
- installer/rollback backups;
- screenshot/debug exports;
- versioned local workspace copies;
- `.vercel`;
- `node_modules`;
- `.env*`;
- temporary Supabase files.

A previous package or screenshot is not a source file.

## 10. Release gate

Before commit/merge of future feature work:

1. inspect current branch and source;
2. validate JavaScript syntax;
3. validate CSS and local asset references;
4. validate product/price/WhatsApp facts;
5. check protected testimonial hashes when the scope does not include them;
6. preview approved target viewports;
7. inspect `git status` and diff;
8. obtain preview approval before pushing production-facing changes.

Production remains `noindex` until explicit Production Launch approval.

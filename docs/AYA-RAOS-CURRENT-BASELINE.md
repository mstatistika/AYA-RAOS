# AYA RAOS — Current Development Baseline

**Status:** Canonical development baseline
**Date:** 14 Agustus 2026
**Repository:** `mstatistika/AYA-RAOS`
**Production branch:** `main`
**Website state:** staging / `noindex`
**Last verified implementation checkpoint:** `0e6f125` — `feat: lock AYA dedicated line pages`
**Repository sanitation:** completed after the FINAL LOCK checkpoint; obsolete packages, backups, orphan line assets, and obsolete preview/feature branches were removed.

## 1. Authority

This document describes the active repository boundary after the 14 August 2026 Dedicated Line Pages FINAL LOCK and repository sanitation.

When repository history, old screenshots, old packages, old docs, or previous implementation experiments conflict with this baseline, this baseline and the latest approved business/project instructions take precedence.

Old package/version labels are historical only. They are not implementation authority.

## 2. Protected baseline

- Homepage v3.8 is the locked homepage visual baseline.
- Homepage assets are canonical under `assets/visual/home-lock/`.
- The three Dedicated Line Pages are FINAL LOCKED: AYA Farm / `TUMBUH`, AYA Spice Haven / `DIOLAH`, and AYA Snacks & Drinks / `DINIKMATI`.
- The approved Dedicated Line Pages include VP1, VP2, VP3, contextual header treatment, supporting typography, CTA treatment, responsive behavior, dedicated photography, and the `@aya.raos 2026` signature.
- Farm is the shared geometry/typography reference; each line keeps its own approved visual world.
- Dedicated line-page assets under `assets/visual/line-pages/` that are referenced by the FINAL LOCK implementation are canonical.
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

- Homepage v3.8 remains LOCKED / PROTECTED.
- All three Dedicated Line Pages are FINAL LOCKED at implementation checkpoint `0e6f125`.
- AYA Farm uses the `TUMBUH` world: green, natural, agricultural, warm, earthy.
- AYA Spice Haven uses the `DIOLAH` world: maroon, rich culinary, rempah-led, warm.
- AYA Snacks & Drinks uses the `DINIKMATI` world: toasted brown, terracotta, amber, warm/social.
- Farm is the geometry and typography master for the three Dedicated Line Pages.
- VP1–VP3 geometry, contextual header, supporting typography, VP2 decision alignment, CTA treatment, dedicated photography, responsive behavior, and site signature are protected.
- Do not harmonize, restyle, refactor, or replace assets in these locked scopes unless the user explicitly reopens that scope.
- Catalog and Product Detail remain separate scopes and must start from the current clean source and `js/data.js`.
- Shared/global changes must prove zero visual regression to Homepage and all three Dedicated Line Pages.
- No parallel CSS system, stacked patch layer, or `!important`.
- Desktop locked compositions may use explicit viewport discipline only where specifically approved. Responsive tablet/mobile pages use normal document flow.
## 9. Repository hygiene

As of 14 August 2026 sanitation:
- `main` is the only retained canonical branch.
- Obsolete preview/feature branches from superseded implementations were removed.
- Future implementation work must create a fresh `preview/*` or `feature/*` branch from the current `main`.
- Old packages, backups, screenshots, orphan assets, and discarded branch states remain historical only and must not be restored as implementation authority.

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

## 11. Current approved checkpoint

Implementation checkpoint:

`0e6f125` — `feat: lock AYA dedicated line pages`

Approved protected visual scopes at this checkpoint:
- Homepage v3.8;
- AYA Farm — `TUMBUH`;
- AYA Spice Haven — `DIOLAH`;
- AYA Snacks & Drinks — `DINIKMATI`.

Repository sanitation was completed after this implementation checkpoint without changing website source. Future work starts from the sanitized canonical `main` and a newly created preview/feature branch.

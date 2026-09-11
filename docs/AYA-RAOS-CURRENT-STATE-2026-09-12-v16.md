# AYA RAOS — CURRENT STATE — 12 September 2026 v16

**Status:** PUBLIC PASOKAN vNEXT + PUBLIC MOBILE UI INCLUDING INFORMATION V18 RELEASED / LOCKED; PUBLIC CSS MODULAR ARCHITECTURE VERIFIED; SOURCE / ASSET HOUSEKEEPING VERIFIED; Admin/B2B platform foundation PRESENT; commercial activation NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Verified main before this governance sync:** `301237dbe33cab2fc3cf3f00ac1d47df8ed2601b`
**Verified deployment for that checkpoint:** `dpl_5gfsBviWVh1z33X6jhvyYALx4dNA` — `aya-raos-qbv82d94s-ms-tatistika.vercel.app` — READY
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-11-v15.md` as the active repository-state record. Historical Git state remains evidence only.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v16;
3. applicable canonical supplement for the active scope;
4. `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md` for released mobile presentation;
5. `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md` for released public Pasokan vNext;
6. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.1.md` for locked B2B commercial/account/admin target architecture, interpreted together with actual implementation status;
7. applicable Product/Catalog, Testimonials/Share, Cart/B2C and Dedicated Line supplements;
8. Project Constitution v1.1 except explicit newer supersessions;
9. Execution Discipline v1.2;
10. verified database/deployment facts and actual source/Git state;
11. Git history only as historical evidence.

## 2. Public website — RELEASED / LOCKED

Protected public scopes remain:
- Homepage desktop and released mobile presentation;
- AYA Farm / TUMBUH desktop and released mobile presentation;
- AYA Spice Haven / DIOLAH desktop and released mobile presentation;
- AYA Snacks & Drinks / DINIKMATI desktop and released mobile presentation;
- Product Catalog desktop and Mobile Product Book V24;
- direct Product Detail;
- Testimonials public;
- Testimonial Share;
- testimonial/Supabase/moderation contracts;
- Cart/B2C;
- Public Pasokan vNext;
- Information desktop;
- Information Mobile V18.

The September 12 housekeeping did not reopen any visual or interaction scope.

## 3. Current public CSS / runtime architecture

Canonical CSS ownership remains:
- `css/site.css` = shared core, tokens, global header, shared controls/utilities;
- `css/pages/home.css` = Homepage;
- `css/pages/lines.css` = Farm / Spice Haven / Snacks & Drinks;
- `css/pages/products.css` = Product Catalog / Mobile Product Book;
- `css/pages/product.css` = direct Product Detail;
- `css/pages/testimonials.css` = Testimonials;
- `css/pages/share.css` = Testimonial Share;
- `css/pages/cart.css` = Cart/B2C;
- `css/pages/business.css` = Public Pasokan Usaha;
- `css/pages/information.css` = Information.

Guardrails remain unchanged:
- one token system;
- no duplicate page ownership;
- no parallel desktop/mobile stylesheet architecture;
- no stacked patch layers, dead selectors or new `!important` architecture;
- public product truth remains sourced from `js/data.js` during the current migration stage.

## 4. Locked mobile references

Final approved mobile references remain:
- Homepage V3.7;
- Dedicated Line Pages V4.9;
- Mobile Product Book V24;
- Testimonials V6.5;
- Share V7.23;
- Information V18.

Mobile Product Book V24 keeps R5.13 interaction physics authority. Information V18 remains `Produk → Pesan → Kirim → Acara → Pasokan → Bantuan` with the approved right rail and customer-routing truth.

## 5. Source / asset housekeeping — VERIFIED

The user explicitly authorized deletion of obsolete source/code/assets that were no longer required. Cleanup was bounded to files proven superseded or unreferenced.

Completed housekeeping lineage from the prior canonical release:
- `aff3f9e537789b133dae3a93fc0eb29fc79d0e5d` — removed superseded `docs/AYA-RAOS-CURRENT-BASELINE-2026-08-22.md`;
- `21a753dc1a991ba0963551a4bb21a3683c9b94bb` — removed six obsolete/unreferenced Homepage visual assets while retaining their active locked replacements;
- `717cd030d5d4690147bac48c40475354b1cb59b3` — removed nine root-level legacy brand SVG aliases and synchronized the brand manifest; canonical brand assets remain in `assets/brand/aya-raos/`, `aya-farm/`, `aya-spice-haven/`, and `aya-snacks-drinks/`;
- `301237dbe33cab2fc3cf3f00ac1d47df8ed2601b` — removed four unreferenced top-level visual assets.

Housekeeping invariants:
- no canonical page HTML/CSS/JS runtime was deleted;
- no locked visual composition was changed;
- no customer copy or commercial rule was changed;
- no Admin, API, server, Supabase migration or active Pasokan runtime file was removed;
- compatibility route `about.html` remains retained;
- active shared assets such as `home-hero-scene.webp`, `catalog-hero-scene.webp`, `aya-mark.svg`, `maroon-texture.webp`, and `sunda-rail-horizontal.webp` remain retained.

## 6. Post-housekeeping staging smoke verification — PASSED

Verified against deployment `dpl_5gfsBviWVh1z33X6jhvyYALx4dNA`, built from exact Git SHA `301237dbe33cab2fc3cf3f00ac1d47df8ed2601b` on `main`.

Vercel reports the deployment READY. Its target label is `production`, but this is deployment-platform terminology only and does **not** constitute AYA RAOS Production Launch approval.

HTTP smoke checks returned `200 OK` for:
- `/` — Homepage;
- `/farm.html`;
- `/spice.html`;
- `/snacks.html`;
- `/products.html`;
- `/product.html?id=sambal-bawang&from=spice`;
- `/testimonials.html`;
- `/share.html`;
- `/cart.html`;
- `/business.html`;
- `/information.html`;
- `/admin/`.

Source linkage observed in served HTML remains canonical: shared `css/site.css` plus the relevant page stylesheet and the expected page/runtime JS for each tested route.

Indexability protection remains active:
- public pages continue to include `meta robots = noindex, nofollow, noarchive`;
- responses continue to return `x-robots-tag: noindex, nofollow, noarchive`;
- Admin continues to include `noindex,nofollow` and inherits the response-level noindex policy.

Commercial-truth smoke observations remain correct:
- Cart explicitly states online payment is not active on staging and real QRIS/VA/order state is unavailable until provider-backed integration is active;
- Public Pasokan still presents qualification as a trusted-status step and does not fabricate eligibility in static HTML;
- Information continues to state one-time purchase → Keranjang, recurring supply → Pasokan, temporary Rp25.000 shipping fallback when authoritative route calculation is unavailable, and online website payment disabled.

Vercel observability reported **no runtime errors in the previous 24 hours** at the time of this verification.

This smoke verification confirms deployment reachability/source linkage and current runtime-health signals. It is not a new visual parity approval and does not reopen any locked public design region.

## 7. Existing B2B / Admin platform state

Admin/API/server/Supabase foundations remain present. Broader B2B commercial architecture remains platform foundation rather than live commercial activation.

Rules remain:
- qualification is backend-owned and browser code may not assert eligibility;
- provider-backed payment activation remains disabled;
- `Paid != Settled` remains mandatory;
- DOKU remains approved primary payment architecture with Midtrans fallback;
- System-only authority remains non-assignable to humans;
- target Admin access remains `Function Registry → Role → Admin User`, with effective permissions as the union of Role functions.

Observed database/configuration facts from the earlier reconciliation remain historical verified facts until explicitly rechecked. Schema existence is never transaction history.

## 8. Public Pasokan and commercial truth

Public Pasokan vNext remains released and protected.

Cadence remains only `W1 / W2 / M1 / M2`. WhatsApp is required and Email optional at public entry. Qualification/account/quotation/order/invoice/payment/stock/capacity/delivery commitments remain trusted-backend-owned.

No housekeeping or smoke-test step activated account lifecycle, payment, quotation, invoice, stock reservation or delivery commitment.

## 9. Pull requests / branch work

Open implementation work is limited to the Partner Portal PR:
- PR #7 — `feature/b2b-partner-portal-v1` — route `/pasokan/partner`.

The Partner branch predates the current `main` and must not be merged blindly. When Partner work resumes, preserve its implementation/history, refresh or rebuild it on current canonical `main`, then validate migration/Auth/deployment/OTP flow before merge.

Historical branch deletion remains administrative housekeeping; it is separate from source/runtime release state.

## 10. Current work mode

Allowed:
- read-only audit;
- explicitly scoped Admin/backend hardening;
- future Partner Portal refresh/verification;
- public parity/polish only when the affected public region is explicitly reopened.

Not authorized:
- Production Launch;
- removing `noindex`;
- activating DOKU/Midtrans payments;
- activating qualification/account lifecycle merely because foundations exist;
- redesigning any protected public scope;
- inventing commercial truth in frontend-only state.

## 11. Next recommended implementation scope

With public source cleanup and post-housekeeping smoke verification complete, the next technical scope is **Admin audit / hardening** before Partner Portal integration.

Admin audit should begin read-only and verify:
- mobile login and touch/input behavior;
- Supabase session initialization and recovery;
- reset-password flow;
- Admin User active-state verification;
- multi-role access and Function Registry permission union;
- right-rail/mobile navigation behavior;
- absence of preview-auth bypasses;
- runtime errors and failure-state truthfulness.

Only after Admin is verified/hardened should Partner Portal PR #7 be refreshed against current `main` and considered for integration.

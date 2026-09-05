# AYA RAOS — MOBILE PUBLIC UI CANONICAL SUPPLEMENT v1

**Approved:** 22 Agustus 2026  
**Scope:** Public Website Mobile UI  
**Implementation branch:** `feature/mobile-public-ui-locked-20260822`  
**Implementation checkpoint:** `ae52958a4408d9da95464e2f7b07de1544015457` — `refactor: consolidate locked public mobile UI`  
**Status:** **FINAL MOBILE VISUAL / UX LOCK — staging / noindex**
**Product Catalog amendment approved:** 5 September 2026 — **Mobile Product Book V24 FINAL LOCK**
**Testimonial Share parity correction approved:** 5 September 2026 — **Foto/Video media modal viewport-fit correction**

## 1. Authority and boundary

This supplement governs the approved **mobile presentation** for the public scopes listed below. It supersedes older mobile preview/detail where they differ, but it does not replace stable desktop, business, data, commerce, testimonial, or backend rules from the existing scope supplements.

Read together with:
1. latest explicit user approval/correction;
2. latest current development baseline;
3. this supplement for mobile presentation;
4. applicable Product/Catalog, Testimonials/Share, Cart/B2C, Pasokan and Dedicated Line canonical rules;
5. Project Constitution and Execution Discipline;
6. verified actual source and Git state.

Desktop locks remain intact unless explicitly reopened.

## 2. Implemented mobile scope

The mobile implementation activates only at `max-width: 900px` for:
- Homepage (`body[data-page="home"]`);
- Dedicated Line Pages (`body[data-page="line"]`);
- Product Catalog (`body[data-page="products"]`);
- Public Testimonials (`body[data-page="testimonials"]`);
- Testimonial Share (`body[data-page="share"]`).

Explicitly outside this mobile release:
- Information — PARKED / unchanged;
- Cart/B2C — existing v16 remains protected;
- Pasokan Usaha / B2B — current released Pasokan vNext remains protected;
- direct Product Detail source/page — unchanged by this release;
- testimonial backend/Supabase/moderation contracts — protected.

## 3. Source architecture

Final implementation source boundary relative to the previous canonical `main`:
- `css/site.css`;
- `js/site.js`;
- `js/mobile-public-ui.js`.

`css/site.css` remains the **single public-site stylesheet/design system**. The temporary standalone `css/mobile-public-ui.css` used during implementation was consolidated into `css/site.css` before release and removed.

No parallel mobile stylesheet, stacked CSS patch layer, or `!important` architecture is permitted.

`js/mobile-public-ui.js` is the scoped mobile runtime. `js/site.js` loads it only for the approved mobile page set. The runtime exits above the mobile breakpoint.

## 4. Global mobile doctrine

Primary review target:
- `390 × 844`.

Responsive sanity targets:
- narrow mobile around `360px`;
- wider/taller mobile around `430px`.

Core rule:
> Simple secara bentuk. Tajam secara pesan. Dalam secara rasa.

Mobile presentation remains:
- premium rumahan;
- warm;
- editorial;
- heritage maroon;
- warm ivory/parchment;
- restrained materiality;
- clear rather than verbose.

The 1VP rule is geometry-first. Stable hierarchy, whitespace, legibility, and comfortable controls outrank eliminating every possible scroll pixel.

## 5. Approved visual references

Final approved mobile preview lineage:
- Homepage — **V3.7**;
- Dedicated Line Pages — **V4.9**;
- Catalog — **Product Book V24** (**visual V14 + R5.13 engine + V24 wrapper fixes**);
- Testimonials — **V6.5**;
- Testimonial Share — **V7.23**.

Standalone preview navigation controls used during review are preview-only and are not part of production website UI.

## 6. Homepage mobile — FINAL LOCK

Homepage mobile preserves the Semesta hierarchy while using mobile-native one-viewport stages.

Approved direction includes:
- monumental AYA RAOS brand stage;
- centered `WILUJENG SUMPING` / `AYA RAOS. / Ada Rasa.` composition;
- concise Semesta copy;
- three AYA line identities;
- compact Tentang AYA presentation;
- mobile Lini AYA stage with one active line at a time and a dedicated line-selection rail;
- final closing stage adapted to mobile geometry.

Desktop Homepage remains governed by its existing lock and is not redesigned by this supplement.

## 7. Dedicated Line Pages mobile — FINAL LOCK

AYA Farm / TUMBUH, AYA Spice Haven / DIOLAH, and AYA Snacks & Drinks / DINIKMATI keep their existing Dunia identity while using the approved V4.9 mobile rhythm.

Mobile copy is intentionally concise and contextual. The runtime may adapt visible headings/copy for the approved mobile composition without rewriting the underlying business taxonomy or product truth.

Desktop Dedicated Line locks remain unchanged.

## 8. Product Catalog mobile — FINAL LOCK

The previous mobile Catalog V5.31 decision-stage presentation is superseded **for mobile Product Catalog only** by the explicitly approved **Mobile Product Book V24**. Desktop Product Catalog and direct Product Detail remain protected and unchanged.

Current visual / interaction authority:
- settled visual = **V14**;
- page-turn engine = **R5.13**;
- approved reliability fixes = **V24 wrapper** for stale-pointer/deadlock recovery and Android Cart event delivery;
- bug fixes may wrap the engine but must not reinterpret R5.13 page physics, gesture geometry, transition timing, or reverse illusion.

Approved mobile behavior:
- one product = one full mobile viewport leaf below the global mobile header;
- the page itself is the book leaf, not a card nested inside a decorative book container;
- fixed binding/gutter remains on the LEFT; only the leaf turns;
- bottom physical bookmarks `FARM / SPICE / SNACKS` switch AYA product-line sets and reset to the first available product in that line;
- the line signature uses the canonical line mark and compact line title at the upper-left of the photography;
- strong product photography, dark luxury editorial body, restrained typography and warm stone/parchment canvas follow V14;
- idle state has no fake second sheet and no fake static page-curl corner;
- forward/reverse page turn follows R5.13, including native finger-following forward motion and the approved reverse occluded-swap / transition-illusion behavior;
- variant and Cart controls are protected from page gestures;
- commerce remains visually secondary to product identity and story.

Production truth rules:
- Product Book reads canonical public product data at runtime; it does not hardcode preview product prices, variants, availability or unsupported product claims;
- product lead/facts come from canonical public product fields when present; missing facts are omitted rather than invented;
- products with no valid/orderable variant remain truthfully unavailable and do not receive fabricated price/variant data;
- multi-variant products expose explicit variant selection;
- Cart mutation uses the existing canonical `AYA.addToCart(...)` runtime; no direct WhatsApp purchase path is introduced;
- failure to load the page-turn library must degrade truthfully to a readable static product state rather than invent capability.

The Mobile Product Book is a sufficiently complete one-viewport product decision experience. It does **not** delete, rewrite, or claim to supersede `product.html`; direct Product Detail remains outside this implementation scope.

## 9. Testimonials mobile — FINAL LOCK

Mobile Testimonials uses one stable editorial stage with media-format navigation:
- VIDEO;
- FOTO;
- TULISAN.

The tabs select testimonial format, not arbitrary next/next item navigation.

Motion rules remain calm:
- video advances after ending when real approved video exists;
- photos may crossfade automatically;
- text uses an editorial reel;
- user interaction pauses motion where applicable;
- `prefers-reduced-motion` is respected.

Only real approved testimonial data may be shown. No video, quote, customer, location, review count, or approval state may be fabricated.

Existing public testimonial data and moderation/Supabase behavior remain protected.

## 10. Testimonial Share mobile — FINAL LOCK

Share mobile follows approved V7.23 presentation while preserving the canonical submission contract.

The experience is one premium workspace, not a customer-facing multi-page review wizard.

Required truth remains governed by the Testimonials + Share canonical supplement and current backend contract, including:
- required identity/product/story fields where applicable;
- WhatsApp optional/private;
- horizontal `Tulisan / Foto / Video` format choice;
- consent is explicit and never automatic;
- media upload/link behavior must remain truthful;
- final canonical submission/moderation flow is preserved.

Post-release parity correction approved on 5 September 2026:
- the Foto/Video media modal must fit the standard mobile viewport without a mandatory small follow-up scroll merely to reach the normal action row;
- normal composition keeps header, media stage, optional link field, and `KEMBALI / SIMPAN` actions reachable in the opened modal;
- internal modal scrolling remains a truthful fallback for genuinely constrained short viewports or expanded states such as media metadata/progress;
- typography, media-stage visual treatment, upload/link behavior, consent, submission flow, and testimonial backend contracts are unchanged.

Preview-only fake submission behavior from standalone HTML references is **not** production behavior and is not authorized by this supplement.

## 11. Protection / zero-regression boundary

This release does not reopen:
- desktop Homepage;
- desktop Dedicated Line Pages;
- desktop Product/Catalog lock;
- Cart/B2C;
- Pasokan/B2B;
- Information;
- testimonial data/upload/Supabase/moderation/approval architecture.

Shared runtime/CSS changes are scoped by page and breakpoint so non-target pages and desktop presentation remain outside the mobile override.

## 12. Verification checkpoint

Mobile Product Book V24 implementation candidate was translated from the LOCK rather than redesigned. The clean implementation checkpoint is `485f7f6e3f3bbfb95776677d5e7a7404f6bd434c`.

Verified implementation boundary relative to the previous canonical `main`:
- `css/site.css` — replaced the superseded Product-mobile block in place; no parallel public stylesheet and no new `!important` architecture;
- `js/mobile-public-ui.js` — replaced only `initMobileCatalog()` with the V24/R5.13 Product Book runtime;
- `js/site.js` — Product-mobile runtime cache-bust only;
- `products.html` — Product page cache-bust only.

`js/catalog.js`, desktop Product Catalog, direct Product Detail, Cart/B2C semantics, Homepage, Dedicated Lines, Testimonials/Share, Pasokan and Information were not reopened by this implementation.

Validation before governance sync:
- scoped mutation assertions passed;
- `node --check js/mobile-public-ui.js` passed;
- `node --check js/site.js` passed;
- `git diff --check` and `git diff --cached --check` passed;
- implementation tree compared with prior `main` shows exactly four changed source paths listed above;
- Vercel implementation deployment for `a68a0d2c8c69d7392e802c891d1fb54318f9cf60` = READY / HTTP 200;
- staging remains `noindex, nofollow, noarchive`.

The 5 September 2026 Share parity correction is source-scoped to the existing Testimonial Share selector block in `css/site.css`; no new stylesheet, runtime file, backend change, or testimonial data-contract change is introduced.

## 13. Release discipline

Staging remains `noindex` until explicit Production Launch approval.

Release remains:
implementation validation/commit/push/remote verify → governance sync/commit/push/remote verify → fast-forward `main` → verify `origin/main` → housekeeping separately.

No force update of `main`.

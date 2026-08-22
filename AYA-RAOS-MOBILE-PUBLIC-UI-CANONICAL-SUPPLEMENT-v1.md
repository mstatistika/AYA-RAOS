# AYA RAOS — MOBILE PUBLIC UI CANONICAL SUPPLEMENT v1

**Approved:** 22 Agustus 2026  
**Scope:** Public Website Mobile UI  
**Implementation branch:** `feature/mobile-public-ui-locked-20260822`  
**Implementation checkpoint:** `ae52958a4408d9da95464e2f7b07de1544015457` — `refactor: consolidate locked public mobile UI`  
**Status:** **FINAL MOBILE VISUAL / UX LOCK — staging / noindex**

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
- Catalog — **V5.31**;
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

Catalog mobile uses a curated single-product decision stage rather than the desktop three-card/filter composition.

Approved mobile behavior:
- one active product display at a time;
- centered previous/next controls plus horizontal swipe;
- three AYA line filters;
- AYA line identity at the photography/detail boundary;
- product title inside the detail body;
- concise product lead;
- editorial `Karakter` and `Cocok` facts;
- commerce anchored at the bottom;
- explicit variant picker when needed;
- price adjacent to the cart action;
- product photo opens an inspectable lightbox.

Catalog reads canonical public product data/runtime. It must not invent price, availability, product facts, ratings, popularity, or unsupported claims.

Multi-variant products require an explicit variant choice path; cart mutation uses the existing canonical Cart runtime.

The mobile Catalog functions as a sufficiently complete product decision card. This does **not** delete, rewrite, or claim to supersede the direct `product.html` Product Detail page, which is outside this implementation scope.

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

Before governance sync, the final implementation branch was verified against `main` as:
- **6 commits ahead / 0 behind**;
- final source diff only `css/site.css`, `js/site.js`, `js/mobile-public-ui.js`;
- `git diff --check` clean before implementation commit;
- JS syntax checks clean;
- standalone mobile stylesheet removed;
- Vercel status for implementation checkpoint `ae52958…` = success.

## 13. Release discipline

Staging remains `noindex` until explicit Production Launch approval.

Release remains:
implementation validation/commit/push/remote verify → governance sync/commit/push/remote verify → fast-forward `main` → verify `origin/main` → housekeeping separately.

No force update of `main`.

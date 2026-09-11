# AYA RAOS — MOBILE PUBLIC UI CANONICAL SUPPLEMENT v1

**Approved:** 22 Agustus 2026  
**Scope:** Public Website Mobile UI  
**Status:** **FINAL MOBILE VISUAL / UX LOCK — staging / noindex**  
**Product Catalog amendment approved:** 5 September 2026 — **Mobile Product Book V24 FINAL LOCK**  
**Testimonial Share parity correction approved:** 5 September 2026 — **Foto/Video media modal viewport-fit correction**  
**Information amendment approved:** 11 September 2026 — **Information Mobile V18 FINAL LOCK**  
**CSS architecture amendment approved:** 11 September 2026 — **shared core + canonical page stylesheets**

## 1. Authority and boundary

This supplement governs the approved **mobile presentation** for the public scopes listed below. It supersedes older mobile preview/detail where they differ, but it does not replace stable desktop, business, data, commerce, testimonial, or backend rules from the existing scope supplements.

Read together with:
1. latest explicit user approval/correction;
2. latest CURRENT STATE;
3. this supplement for mobile presentation;
4. applicable Product/Catalog, Testimonials/Share, Cart/B2C, Pasokan and Dedicated Line canonical rules;
5. Project Constitution and Execution Discipline;
6. verified actual source and Git state.

Desktop locks remain intact unless explicitly reopened.

## 2. Implemented mobile scope

The released mobile implementation activates at `max-width: 900px` for:
- Homepage (`body[data-page="home"]`);
- Dedicated Line Pages (`body[data-page="line"]`);
- Product Catalog (`body[data-page="products"]`);
- Public Testimonials (`body[data-page="testimonials"]`);
- Testimonial Share (`body[data-page="share"]`);
- **Information (`body[data-page="information"]`) — V18**.

Still outside this mobile presentation authority unless separately governed:
- Cart/B2C — existing protected implementation;
- Pasokan Usaha / B2B — released Pasokan vNext remains protected;
- direct Product Detail source/page — unchanged by the Information release;
- testimonial backend/Supabase/moderation contracts — protected.

## 3. Source architecture

### Shared public core

`css/site.css` remains the **shared public design-system core**, containing design tokens, global header, shared controls/utilities and genuinely cross-page presentation.

The former requirement that every page-specific style must also live in `css/site.css` is superseded by the 11 September 2026 modular architecture approval.

A public page/domain may have **at most one canonical page stylesheet** under:
`css/pages/<page>.css`

Rules:
- one token system only;
- page-specific selectors belong to the page stylesheet once that page is migrated;
- no duplicate page selectors between `css/site.css` and the page stylesheet;
- no parallel `desktop.css` / `mobile.css` architecture;
- desktop and mobile rules for a migrated page remain together in the same canonical page stylesheet;
- no stacked CSS patch layers, dead selectors or new `!important` architecture;
- already locked pages are not bulk-migrated merely for housekeeping.

**Information is the first migrated page** and uses `css/pages/information.css`.

Existing released Homepage / Dedicated Lines / Product Catalog / Testimonials / Share mobile runtime remains centered on `js/mobile-public-ui.js` with shared `js/site.js` behavior until those scopes are explicitly reopened or separately migrated with zero-regression proof.

Information V18 uses its existing scoped `js/info-page.js` runtime for the right-rail state and keeps shared header/WhatsApp behavior in `js/site.js`.

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
- Catalog — **Mobile Product Book V24** (**visual V14 + R5.13 engine + V24 wrapper fixes**);
- Testimonials — **V6.5**;
- Testimonial Share — **V7.23**;
- **Information — V18**.

Standalone preview navigation controls used during review are preview-only unless explicitly translated into the approved production interaction. Information V18's right-side rail is part of the approved production interaction.

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

## 11. Information mobile — V18 FINAL LOCK

Information V18 is a mobile-only reopened-and-relocked region. Desktop Information was not visually reopened.

Approved navigation architecture:
`Produk → Pesan → Kirim → Acara → Pasokan → Bantuan`

Approved visual / interaction direction:
- one calm customer-service workspace below the shared mobile header;
- content surface on the left and six-item vertical rail on the right;
- inactive rail items are open/quiet rather than six identical rounded cards;
- active rail state uses the maroon bookmark treatment;
- all section CTAs have equal fixed width and the same maroon treatment;
- hero uses `INFORMASI AYA` with `Sebelum memesan.`;
- internal text dividers are removed from section copy;
- Acara uses only a clear heading/body hierarchy, avoiding multiple competing display-font sizes;
- Bantuan contains three customer-service questions and no separate legal-looking copy block beside the CTA.

Customer-routing truth:
- one-time purchase, including one-time event/office/hampers/large quantity, remains Keranjang AYA;
- recurring supply is Pasokan Usaha;
- quantity alone does not determine the route;
- no account is required for one-time shopping.

Shipping/payment truth:
- temporary checkout shipping remains Rp25.000 when authoritative route calculation is unavailable;
- this fallback is not a live Grab/Gojek tariff;
- online payment through the website remains unavailable until provider-backed activation is explicitly released.

Pasokan truth:
- Information summarizes recurring-supply routing but does not calculate qualification;
- cadence remains customer-facing weekly / two-weekly / monthly / two-monthly, corresponding to W1/W2/M1/M2 authority;
- price, availability and schedule are not confirmed until the need has been checked;
- Information does not activate B2B Account, quotation, order, invoice, payment, stock reservation or delivery commitment.

Bantuan truth:
- unresolved cancellation/refund, allergy, shelf-life, certification and special-needs policies are not invented;
- the customer is directed to AYA for the actual product/order context.

## 12. Protection / zero-regression boundary

This release does not reopen:
- desktop Homepage;
- desktop Dedicated Line Pages;
- desktop Product/Catalog lock;
- Cart/B2C;
- Pasokan/B2B;
- desktop Information;
- direct Product Detail;
- testimonial data/upload/Supabase/moderation/approval architecture.

Shared runtime/CSS changes must remain scoped by page and breakpoint so non-target pages and desktop presentation stay outside the active override.

## 13. Verification checkpoints

### Mobile Product Book V24

Mobile Product Book V24 implementation candidate was translated from the LOCK rather than redesigned. The clean implementation checkpoint is `485f7f6e3f3bbfb95776677d5e7a7404f6bd434c`.

Verified Product Book implementation boundary relative to its previous canonical `main`:
- `css/site.css` — replaced the superseded Product-mobile block in place;
- `js/mobile-public-ui.js` — replaced only `initMobileCatalog()` with the V24/R5.13 Product Book runtime;
- `js/site.js` — Product-mobile runtime cache-bust only;
- `products.html` — Product page cache-bust only.

The 5 September 2026 Share parity correction remains source-scoped to the existing Testimonial Share selector block and did not change testimonial backend contracts.

### Information V18

Information V18 implementation is translated from the approved V18 preview, not redesigned during implementation.

Canonical source boundary:
- `information.html`;
- `css/pages/information.css`;
- `js/info-page.js`;
- removal of superseded Information-only selectors from `css/site.css`.

Pre-release verification:
- exact pre-mutation `css/site.css` blob was asserted before scoped extraction;
- `git diff --check` passed;
- `node --check js/info-page.js` passed;
- only Information source plus the required shared-core selector extraction changed;
- Vercel preview reached READY and served Information HTML/CSS/JS with HTTP 200;
- staging remained `noindex, nofollow, noarchive`;
- geometry checks passed at `360×800`, `390×844`, and `430×932`;
- the tested mobile root remained one viewport;
- all six panels fit without internal overflow at those review targets;
- all six CTAs measured 160×36 at the same layout position.

## 14. Release discipline

Staging remains `noindex` until explicit Production Launch approval.

Release remains:
implementation validation/commit/push/remote verify → governance sync/commit/push/remote verify → fast-forward `main` → verify `origin/main` → housekeeping separately.

No force update of `main`.

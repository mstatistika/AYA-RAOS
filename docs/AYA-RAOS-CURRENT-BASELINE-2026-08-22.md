# AYA RAOS — Current Development Baseline — 22 Agustus 2026

**Status:** Public Mobile UI implementation completed and governance synchronized for canonical release.  
**Repository:** `mstatistika/AYA-RAOS`  
**Canonical branch:** `main`  
**Website state:** staging / `noindex`; Production Launch is not approved.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this baseline;
3. `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md` for the released mobile presentation;
4. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.md` for approved target B2B architecture;
5. `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md` for current public Pasokan vNext;
6. applicable Product/Catalog, Testimonials/Share, Cart/B2C and Dedicated Line canonical supplements;
7. Project Constitution v1.1 except explicit newer supersessions;
8. Execution Discipline v1.1;
9. verified facts and actual source/Git state;
10. historical/recovery files only as evidence.

Historical files do not regain authority because they contain `LOCKED` or `APPROVED`.

## 2. Canonical state entering Mobile release

Canonical `main` before Mobile release:
`6a1b981ba4bd6d4facfeb13d79cfe71ec07902bf`

That checkpoint already contains the released Public Pasokan vNext frontend and its governance package.

Mobile implementation branch:
`feature/mobile-public-ui-locked-20260822`

Final implementation checkpoint before governance:
`ae52958a4408d9da95464e2f7b07de1544015457` — `refactor: consolidate locked public mobile UI`.

Immediately before governance sync the branch was verified:
- **6 commits ahead / 0 behind** `main`;
- implementation diff only:
  - `css/site.css`;
  - `js/site.js`;
  - `js/mobile-public-ui.js`;
- Vercel status = success.

## 3. Public Mobile UI release

Approved mobile presentation applies at `max-width: 900px` only to:
- Homepage;
- AYA Farm / TUMBUH;
- AYA Spice Haven / DIOLAH;
- AYA Snacks & Drinks / DINIKMATI;
- Product Catalog;
- Public Testimonials;
- Testimonial Share.

Detailed authority:
`AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md`.

Approved final preview lineage:
- Homepage V3.7;
- Dedicated Lines V4.9;
- Catalog V5.31;
- Testimonials V6.5;
- Share V7.23.

Primary mobile review target remains `390 × 844`, with narrow/wider sanity targets around 360 and 430 px.

## 4. Mobile source architecture

`css/site.css` remains the single public-site stylesheet/design system.

The final mobile source boundary is:
- `css/site.css` — scoped mobile block consolidated into the single design system;
- `js/site.js` — scoped mobile runtime loader;
- `js/mobile-public-ui.js` — mobile-only presentation/runtime.

The temporary `css/mobile-public-ui.css` implementation file was removed before release. No parallel stylesheet is part of the final state.

Desktop and non-target pages remain outside the mobile runtime/breakpoint boundary.

## 5. Protected / unchanged by Mobile release

The Mobile release does not modify or reopen:
- Information — remains PARKED/protected;
- Cart/B2C v16;
- Pasokan/B2B vNext;
- direct Product Detail source/page;
- testimonial/Supabase/moderation/approval backend behavior;
- canonical product data in `js/data.js`;
- payment/order/backend truth boundaries.

Desktop locks remain governed by their existing canonical supplements.

## 6. Product / Catalog truth

Mobile Catalog reads canonical product data and existing Cart runtime.

The mobile decision stage may change presentation and interaction, but it may not invent or override:
- prices;
- variants;
- product facts;
- availability truth;
- ratings/reviews/popularity;
- unsupported product claims.

Direct Product Detail remains an existing protected page and is not removed by the unified mobile Catalog decision experience.

## 7. Testimonials / Share truth

Mobile presentation does not change testimonial truth or moderation authority.

Real data/upload/Supabase/moderation/approval remain protected. No testimonial content, customer identity/location, video, review count, or approval claim may be fabricated.

Share continues to use the canonical submission contract. Standalone preview-only fake submission behavior is not production behavior.

## 8. Pasokan / broader B2B state

Public Pasokan vNext remains released and protected from this Mobile scope.

Broader B2B Commercial Architecture v1 remains approved target architecture. Backend/account/payment/admin capabilities are not made live by the Mobile release.

`Paid ≠ Settled` remains mandatory commercial truth.

## 9. Open / parked items

- Information mobile remains parked until explicitly reopened.
- Cart minor desktop item-count pill follow-up remains separate and does not reopen Cart geometry.
- broader B2B Account/Admin/Payment implementation remains a later implementation phase.
- Production Launch/noindex removal still requires explicit approval.

## 10. Release discipline

The Mobile release follows:
implementation validation/commit/push/remote verify → governance sync/commit/push/remote verify → fast-forward `main` → verify `origin/main` → housekeeping separately.

No force update of `main`.

Housekeeping is not part of this governance commit.

# AYA RAOS — CURRENT STATE — 11 September 2026 v15

**Status:** PUBLIC PASOKAN vNEXT + PUBLIC MOBILE UI INCLUDING INFORMATION V18 RELEASED / LOCKED; PUBLIC CSS MODULAR HOUSEKEEPING VERIFIED / ZERO-REGRESSION; Admin/B2B platform foundation PRESENT; commercial activation NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Information release base:** `209d5d8a99704542d8d4dffb326976935ed1e932`
**Modular CSS housekeeping base:** `12020a0ec2b68c499987d30253cf215cd13e7b9b`
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-11-v14.md` as the active repository-state record. Historical Git state remains evidence only.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v15;
3. applicable canonical supplement for the active scope;
4. `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md` for released mobile presentation;
5. `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md` for released public Pasokan vNext;
6. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.1.md` for locked B2B commercial/account/admin target architecture, interpreted together with actual implementation status;
7. applicable Product/Catalog, Testimonials/Share, Cart/B2C and Dedicated Line supplements;
8. Project Constitution v1.1 except explicit newer supersessions;
9. Execution Discipline v1.2;
10. verified database facts and actual source/Git state;
11. Git history only as historical evidence.

## 2. Public website — RELEASED / LOCKED

Protected public scopes include:
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
- **Information Mobile V18**.

No protected visual scope is reopened by this release after the Information implementation is merged.

## 3. Information Mobile V18 — RELEASED / LOCKED

Information was explicitly reopened for mobile review and approved as **V18** on 11 September 2026.

Approved mobile architecture at `max-width:900px`:
`Produk → Pesan → Kirim → Acara → Pasokan → Bantuan`

Presentation rules:
- content workspace on the left and a vertical navigation rail on the right;
- inactive rail items remain visually quiet; the active state uses the maroon bookmark treatment;
- all primary section CTAs use the same 160px width and the same maroon treatment;
- hero title is `Sebelum memesan.` under the `INFORMASI AYA` kicker;
- internal text dividers are removed from the content composition;
- Acara uses a simple heading/body hierarchy rather than multiple competing display-font levels;
- Bantuan contains three customer-service questions; the former side disclaimer copy is integrated into the third question;
- the mobile stage is designed as one viewport below the global header, with internal scroll retained only as truthful fallback on genuinely constrained content.

Customer-facing truth remains:
- one-time purchase uses Keranjang AYA regardless of quantity;
- recurring supply uses Pasokan Usaha;
- no account is required for one-time shopping;
- public product status vocabulary is `Tersedia / Pre-order / Habis`;
- checkout uses temporary Rp25.000 shipping when authoritative route calculation is unavailable; this is not a live Grab/Gojek tariff;
- online payment through the website remains unavailable until provider-backed activation is explicitly released;
- Pasokan needs are checked before price, availability and schedule can be confirmed;
- unresolved policy topics are directed to AYA rather than fabricated as public policy.

Desktop Information was not visually reopened by V18 and retains its prior presentation.

## 4. Information V18 source boundary

Canonical implementation boundary:
- `information.html`;
- `css/pages/information.css`;
- `js/info-page.js`;
- removal of superseded Information-only selectors from `css/site.css`.

`js/site.js`, public data contracts, Product, Cart, Testimonials, Pasokan and other protected visual regions are not modified by this release.

## 5. Public CSS architecture — MODULAR PAGE STYLESHEETS APPROVED

The former rule that `css/site.css` must contain every public page style is superseded.

Current architecture:
- `css/site.css` = shared core, design tokens, global header, shared controls/utilities and genuinely cross-page presentation;
- `css/pages/home.css` = Homepage;
- `css/pages/lines.css` = Farm / Spice Haven / Snacks & Drinks dedicated line pages;
- `css/pages/products.css` = Product Catalog / Mobile Product Book;
- `css/pages/product.css` = direct Product Detail;
- `css/pages/testimonials.css` = public Testimonials;
- `css/pages/share.css` = Testimonial Share;
- `css/pages/cart.css` = Cart/B2C;
- `css/pages/business.css` = public Pasokan Usaha;
- `css/pages/information.css` = Information.

The locked-page migration was separately approved by the user as housekeeping after Information V18. It is a structural source refactor only and does not reopen any visual/UX lock.

Guardrails:
- one token system remains mandatory;
- no duplicate page selectors across shared core and page stylesheet;
- no parallel desktop/mobile stylesheet architecture;
- desktop and mobile rules for a page stay together in that page's canonical stylesheet when migrated;
- no stacked patch layers, dead selectors or new `!important` architecture;
- locked pages may be structurally migrated only by explicit separate approval with zero-regression proof; the 11 September housekeeping approval satisfies this condition for the modules listed above.

This change reduces mutation blast radius without creating a second design system.

## 6. Information V18 verification

Verified before release:
- implementation branch was created from canonical `main` base `209d5d8...` and remained behind by 0;
- scoped `css/site.css` extraction verified the exact pre-mutation blob before writing;
- extraction changed only legacy Information selectors and preserved neighboring protected Cart, Pasokan, Home and shared selectors;
- `git diff --check` passed;
- `node --check js/info-page.js` passed;
- Vercel preview deployment reached READY and served `information.html`, `css/pages/information.css`, and `js/info-page.js` with HTTP 200;
- staging continued to return `noindex, nofollow, noarchive`;
- geometry checks at `360×800`, `390×844`, and `430×932` kept the mobile root within one viewport;
- all six tested panels fit without internal overflow at those targets;
- all six CTAs measured 160×36 and occupied the same layout position.

### Full modular CSS housekeeping verification

Verified against canonical `main` base `12020a0ec2b68c499987d30253cf215cd13e7b9b` before release:
- page/domain-specific presentation was extracted without redesign, copy change, interaction change or commercial-truth change;
- all eleven public page/domain HTML entries load exactly one canonical page stylesheet;
- CSS brace balance, page-scope ownership, asset URL targets, JS syntax and `git diff --check` passed;
- the shared `.home-scroll-cue` primitive remains in `css/site.css` because Homepage and Pasokan both use it;
- deterministic browser parity passed **22/22** comparisons at `390×844` and `1440×900` across Homepage, all three Dedicated Lines, Product Catalog, Product Detail, Testimonials, Share, Cart, Pasokan and Information;
- Product Catalog image loading was made eager only in the parity runner copies to remove lazy-load screenshot timing variance; production `js/catalog.js` remains unchanged;
- staging / public indexability policy is unchanged and Production Launch is still not approved.

## 7. Existing B2B / Admin platform state

The v13 reconciliation remains valid except where explicitly superseded above:
- Admin/API/server/Supabase foundations are present;
- broader B2B commercial architecture remains platform foundation rather than live commercial activation;
- qualification remains backend-owned and must not be fabricated by the browser;
- provider-backed payment activation remains disabled;
- `Paid != Settled` remains mandatory;
- DOKU remains the approved primary payment architecture with Midtrans fallback;
- System-only authority remains non-assignable to humans.

Observed database/configuration facts from the v13 reconciliation remain historical verified facts until rechecked; they are not regenerated by this Information release.

## 8. Public Pasokan and commercial truth

Public Pasokan vNext remains released and protected.

Cadence remains only `W1 / W2 / M1 / M2`. WhatsApp is required and Email optional at public entry. Qualification/account/quotation/order/invoice/payment/stock/capacity/delivery commitments remain trusted-backend-owned.

The Information page summarizes customer routing only and does not activate or impersonate future B2B Account/Admin/Payment capability.

## 9. Current work mode after release

Allowed:
- read-only audit;
- parity/polish only when a public region is explicitly reopened;
- separately scoped Admin/backend hardening or future commercial implementation when explicitly approved.

Not authorized by this release:
- Production Launch;
- removing `noindex`;
- activating DOKU/Midtrans payments;
- activating qualification/account lifecycle merely because platform foundations exist;
- redesigning protected public scopes;
- redesigning protected regions or making further architecture changes without explicit scope approval.

## 10. Next public-web step

After the separately approved modular CSS housekeeping, the public surface remains protected/locked. Any further public visual work starts with a read-only parity audit and requires explicit reopening before visual mutation.

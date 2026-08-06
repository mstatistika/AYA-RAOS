# AYA RAOS — Package 1 Source Inspection & Implementation Map

**Document ID:** AYA-P1-INSPECTION-001
**Version:** 1.0
**Date:** 6 Agustus 2026
**Repository:** `mstatistika/AYA-RAOS`
**Verified repository baseline:** `main @ 84e92031007af2341e29d1eb6109681db999925c`
**Uploaded source inspected:** `AYA-RAOS-main(1).zip`
**Blueprint target:** AYA-WMB-001 v1.5
**Decision Log target:** Through DL-578
**Status:** Package 1 implemented and merged to main; retained as historical implementation map
**Source modification:** None
**Branch creation:** None
**Commit/push:** None

---

## 1. Inspection Verdict

The latest source is a valid Package 1 baseline. It does not require a rewrite.

The implementation should be performed as a controlled refactor of the existing source of truth:

- keep `css/site.css` as the single general design system;
- edit current HTML and JavaScript directly;
- preserve the protected testimonial submission flow;
- remove obsolete semantics rather than layering compatibility patches;
- keep payment, shipping, order persistence, and Business Inquiry persistence outside Package 1.

The source is technically compact, but several files are highly compressed. This makes uncontrolled patching risky. Package 1 must therefore use a file-level change map and explicit post-change validation.

---

## 2. Verified Repository Position

Latest `main`:

```text
84e92031007af2341e29d1eb6109681db999925c
chore: trigger Vercel production deployment
```

The commit reports no file diff. The latest uploaded source is therefore used as the file-content baseline for this inspection.

Recommended implementation branch after approval:

```text
preview/blueprint-v1-5-frontend-corrective-v1
```

Branch must be created from:

```text
84e92031007af2341e29d1eb6109681db999925c
```

---

## 3. Repository Inventory

### 3.1 Public routes

- `index.html`
- `products.html`
- `product.html`
- `cart.html`
- `business.html`
- `testimonials.html`
- `share.html`
- `information.html`
- `404.html`
- `about.html`

### 3.2 General design and runtime

- `css/site.css`
- `js/config.js`
- `js/data.js`
- `js/site.js`
- `js/home.js`
- `js/catalog.js`
- `js/product.js`
- `js/cart-page.js`
- `js/testimonials.js`
- `js/info-page.js`

### 3.3 Protected testimonial scope

- `share.html`
- `css/share.css`
- `js/supabase-client.js`
- `js/testimonial-wizard.js`
- `supabase/migrations/20260801152000_aya_testimonials.sql`
- `supabase/migrations/20260802033500_aya_testimonial_media.sql`

### 3.4 Maintained project files

- `README.md`
- `DECISION_LOG.md`
- `docs/AYA-RAOS-DECISION-LOG-v1.5.md`
- `vercel.json`
- `robots.txt`
- `site.webmanifest`

---

## 4. Protected Baseline

Package 1 must not alter these files:

| File | SHA-256 |
|---|---|
| `share.html` | `9524c77b0ebd55e3a3853b139ec5d0824679d2ab936abc02315df929d12eb3d2` |
| `css/share.css` | `ed3c039d1da2b68a4d686aba1d210229640d0e25b386cd89c1d96df698c63669` |
| `js/supabase-client.js` | `aa66a63842b80d612d50b79d892b4b014efc7ae125fb640083329e4e55a9be9e` |
| `js/testimonial-wizard.js` | `6816e038468e97840dc37a69610e3f8340a31d33dd034ee5bdaaa86838f93e59` |

Package validator must fail when any protected hash changes.

`share.html` visual parity remains Package 3.

---

## 5. Current Architecture Map

### 5.1 Shared shell

The primary public pages duplicate the same shell markup:

```text
skip link
utility bar
site header
desktop navigation
header actions
mobile navigation
global state
page main
site footer
toast region
```

This is acceptable for the current static architecture, but Package 1 must update every duplicate consistently.

Do not introduce a runtime partial-loader merely to deduplicate HTML. That would add failure risk and is outside the current architecture.

### 5.2 Shared runtime

`js/site.js` currently owns:

- local cart storage;
- local order draft;
- product and variant lookup;
- price formatting;
- cart count;
- add/update/remove cart;
- toast;
- global state;
- WhatsApp URL generation;
- image fallback;
- mobile navigation;
- active navigation;
- config/data runtime validation.

This remains the correct shared runtime for Package 1.

### 5.3 Current storage keys

```text
ayaRaos.cart.v2
ayaRaos.orderDraft.v2
```

Package 1 must preserve the cart key.

The order-draft structure changes materially, so it needs a safe migration strategy rather than silent overwrite.

---

## 6. Current-to-Target Page Map

## 6.1 Homepage — `index.html`

### Current

Hero:

```text
Sambal dan produk rumahan untuk meja makan Anda
Pesanan Pribadi
Acara / Usaha
Lihat Semua Produk
```

Current discovery section combines:

- three product lines;
- testimonials.

The `cerita-aya` anchor currently points to product-line architecture rather than an actual brand story.

### Target

```text
Utility bar
Global header
Hero:
  Kuliner Sunda dari Lippo Utara
  Sambal AYA
  Rasa Sunda, pedas yang tegas
  Starting price
  One primary CTA
  Low-emphasis Catalog link
  Verified facts
Trust strip
Three product lines
Actual AYA story:
  dapur rumahan
  rumah ke rumah
  komplek ke komplek
  Lippo Utara
Testimonials
Minimal footer
```

### Required implementation

- replace hero copy;
- replace three competing actions with one primary CTA;
- use `cart.html?context=personal`;
- retain Catalog as secondary text action;
- add a dedicated brand-story block inside `#cerita-aya`;
- keep the three lines visually subordinate to AYA RAOS and Sambal AYA;
- update trust-strip content;
- preserve two-composition discipline without forced viewport heights;
- preserve current carousel controls and reduced-motion support;
- prevent featured/testimonial duplication through data correction.

### Files

- `index.html`
- `css/site.css`
- `js/home.js`
- `js/data.js`
- `README.md`
- canonical docs in repository

---

## 6.2 Catalog — `products.html`

### Current

- four-column grid;
- right filter rail;
- URL filters;
- fixed `pageSize: 8`;
- quick-add modal includes quantity;
- multi-variant quick add preselects first variant;
- ordering uses `priority`.

### Target

- keep approved visual composition;
- add 8/12 page-size control;
- store page size in URL;
- use explicit `catalogOrder`;
- quick add selects variant only and adds one approved minimum unit;
- no quantity input in Catalog modal;
- multi-variant selection remains explicit;
- add selected-filter summary and improved mobile drawer behavior;
- maintain visible empty/loading/error states.

### DOM changes

Remove:

```html
<label class="qty-field" ... data-variant-qty>
```

Add:

```text
page-size control
active-filter summary
mobile apply-state feedback
```

### Files

- `products.html`
- `css/site.css`
- `js/catalog.js`
- `js/data.js`

---

## 6.3 Product Detail — `product.html`

### Current

- JS-generated two-column layout;
- all variants auto-select first option;
- quantity uses minimum only;
- global maximum is hidden inside shared normalizer;
- thumbnails render even for one image;
- product information has four blocks;
- CTA opens Cart using legacy route.

### Target

- preserve two-column layout;
- single variant may auto-select;
- multi-variant requires explicit selection;
- product-level min/max/step;
- thumbnail strip only with multiple images;
- `flavorProfile`, `spiceCharacter`, verified net weight/shelf life/storage fields when available;
- no numerical spice level;
- `Buka Keranjang` routes to personal B2C context;
- clear validation when no variant is selected.

### Files

- `product.html`
- `css/site.css`
- `js/product.js`
- `js/data.js`
- `js/site.js`

---

## 6.4 B2C Order Gateway — `cart.html`

### Current

URL:

```text
cart.html?type=personal
cart.html?type=business
```

State:

```js
orderType: "personal" | "business"
```

UI:

```text
Pesanan Pribadi
Acara / Usaha
```

Business fields mix:

- event;
- organization;
- company;
- PIC;
- business type.

Stage 4 is an inactive Payment stage.

### Target

URL:

```text
cart.html?context=personal
cart.html?context=event
```

State:

```js
context: "personal" | "event"
```

UI:

```text
Untuk Rumah
Untuk Acara
```

Inquiry-mode stages:

```text
1 Keranjang
2 Data & Pengiriman
3 Ringkasan
4 Konfirmasi
```

Package 1 does not persist orders yet. Therefore the final action must remain visibly inactive or preview-only without pretending that inquiry completion exists.

Package 2 will implement:

```text
persist order
→ Order ID
→ WhatsApp continuation
```

### Required Package 1 behavior

- remove all B2B language and B2B fields;
- create an Event fieldset;
- retain one-time company/institutional/event capability in Event;
- include visible guidance that one-time business trial remains Event/B2C;
- replace payment-stage copy with an honest Package 1 preview state;
- remove `type=business`;
- implement safe legacy draft migration;
- keep shipping/payment values invalidated on material changes;
- improve cart item controls to match the approved mockup;
- add event consent only after final wording is approved; until then keep it out rather than invent it.

### Draft migration

Legacy:

```js
{ orderType: "personal" | "business" }
```

Target:

```js
{ schemaVersion: 3, context: "personal" | "event" }
```

Migration rule:

```text
personal → personal
business → event
```

A visible one-time notice should explain that the old `Acara / Usaha` choice is now classified as `Untuk Acara`.

The old draft key may be read once, normalized, and written to a v3 key.

Recommended:

```text
ayaRaos.orderDraft.v3
```

Do not delete the old value until successful migration.

### Files

- `cart.html`
- `css/site.css`
- `js/cart-page.js`
- `js/site.js`
- `js/config.js`
- `information.html`

---

## 6.5 Recurring Supply — `business.html`

### Current

One-line redirect:

```text
business.html
→ cart.html?type=business
```

### Target

A full editorial and inquiry-preview page:

```text
Global shell
Hero:
  Pasokan berkala untuk usaha Anda
Who it is for
Recurring-supply examples
How evaluation works
Required information
Inquiry preview form
What happens next
Non-guarantee statement
Minimal footer
```

### Package 1 limitation

The form may be visually implemented and validated in the browser, but it may not claim successful submission, issue an Inquiry ID, or send an authoritative WhatsApp message.

Until Package 2 persistence exists, the final control must be a clearly disabled preview state or a support action that does not masquerade as submission.

### Required recurring fields

- company/business;
- business type;
- PIC;
- role;
- WhatsApp;
- email;
- intended use;
- product/specification;
- volume per delivery;
- recurring frequency;
- location;
- proposed start;
- operational/packaging needs;
- administrative needs;
- notes;
- consent placeholder only after approved wording.

No `one-time` option.

### New JavaScript

Recommended:

```text
js/business-inquiry.js
```

Package 1 responsibility:

- UI state;
- client-side recurring-intent validation;
- field preservation in memory or local draft;
- no remote submission.

Package 2 responsibility:

- RPC;
- persistence;
- Inquiry ID;
- idempotency;
- rate limiting;
- operational view.

### Files

- `business.html`
- `css/site.css`
- new `js/business-inquiry.js`
- `js/config.js`
- `js/data.js` only if a safe product option source is reused
- global shell pages for navigation links

---

## 6.6 Testimonials — `testimonials.html`

### Current

- featured photo testimonial;
- duplicated equivalent text record;
- vertical ticker duplicates text array for looping;
- CSS animation remains active on mobile unless reduced motion is enabled.

### Target

- featured record excluded from supporting stream;
- desktop ticker preserved;
- mobile normal stack or manual slider;
- approved context metadata only;
- visible media failure state.

### Files

- `js/data.js`
- `js/testimonials.js`
- `css/site.css`
- `testimonials.html` only if mobile controls are introduced

---

## 6.7 Information — `information.html`

### Current

- `Acara / Usaha` is one section;
- `info-page.js` is not loaded;
- script selectors target `.info-card[id]` and `.info-nav`, while actual content uses sections and `.information-nav`;
- active-section tracking is therefore dead.

### Target sections

```text
Cara Pesan
Untuk Acara
Pengiriman
Pembayaran
Pasokan Berkala untuk Usaha
FAQ
Syarat
Privasi
```

### Required implementation

- separate Event and recurring B2B;
- explain every one-time transaction is B2C;
- explain volume does not determine B2B;
- route Event to `cart.html?context=event`;
- route recurring supply to `business.html`;
- load `js/info-page.js`;
- refactor selectors to current DOM;
- preserve deep linking;
- update active `aria-current`.

### Files

- `information.html`
- `js/info-page.js`
- `css/site.css`

---

## 6.8 404 — `404.html`

### Current

- standalone centered card;
- no global shell.

### Blueprint target

- global shell;
- minimal footer;
- Home and Catalog recovery actions.

### Implementation decision

Package 1 should adopt the Blueprint target. The mockup remains a component reference for the center recovery panel.

### Files

- `404.html`
- `css/site.css`

---

## 6.9 About redirect — `about.html`

### Current

Redirect target:

```text
index.html#cerita-aya
```

This route remains correct.

Update copy to reference the actual AYA story, not “arsitektur tiga lini”.

### Files

- `about.html`

---

## 6.10 Share Testimonial — `share.html`

Package 1 action:

```text
No change
```

Known visual drift remains recorded for Package 3.

The Package 1 global navigation update does not justify touching protected Share files.

---

## 7. Global Shell Change Map

The primary public shell appears in:

- `index.html`
- `products.html`
- `product.html`
- `cart.html`
- `testimonials.html`
- `information.html`

Package 1 adds the same shell to:

- `business.html`
- `404.html`

Required global changes:

- add `Pasokan Usaha` discovery;
- route Cart and Pesan Sekarang to `cart.html?context=personal`;
- update footer language from `pribadi, keluarga, acara, dan usaha` to one-time B2C plus recurring-supply wording;
- keep official Instagram and response hours;
- preserve `noindex`;
- preserve utility-bar operational honesty;
- update cache-busting version consistently.

Do not update protected `share.html` shell in Package 1.

This creates a temporary known shell difference that is explicitly resolved in Package 3.

---

## 8. CSS Implementation Map

### Current condition

`css/site.css`:

- approximately 28.6 KB;
- no `!important`;
- breakpoints at 1120, 900, and 620 px;
- reduced-motion media query;
- existing selectors already cover all main v1.4 pages.

### Package 1 rule

Edit `css/site.css` directly.

Do not add:

- `frontend-v5.css`;
- correction CSS;
- override CSS;
- duplicate token sets;
- page-specific patch stylesheet.

### Required CSS domains

1. updated Homepage hero and story;
2. improved product-line hierarchy;
3. Catalog page-size and filter summary;
4. Product Detail explicit-selection/error state;
5. Cart Personal/Event segmented control;
6. mockup-aligned quantity controls;
7. recurring-supply page;
8. Information active navigation;
9. testimonial mobile stack/manual behavior;
10. global-shell 404;
11. world-class state and interaction refinements.

### Refactor constraint

Existing selectors may be revised or removed when the related DOM changes.

Do not leave dead selectors for:

- legacy business order fields;
- inactive payment stage presentation;
- old redirect page if no longer used by `business.html`;
- obsolete Information selectors.

A post-sweep dead-selector audit is required.

---

## 9. JavaScript Implementation Map

## 9.1 `js/config.js`

Package 1 additions should be structural but remain inactive where backend support is absent:

```js
checkout: {
  mode: "inquiry",
  orderPersistence: false
},
businessSupply: {
  enabled: false
}
```

Keep:

- shipping disabled;
- payment disabled;
- official WhatsApp;
- staging environment.

Do not add fake endpoint values.

## 9.2 `js/data.js`

Required:

- correct Bawang Goreng image mapping;
- `priority` → `catalogOrder`;
- product-level `maxQuantity` and `quantityStep`;
- `flavorProfile`;
- `spiceCharacter` for Sambal AYA;
- honest verified-information fields;
- remove testimonial duplication.

Do not invent:

- net weight;
- shelf life;
- composition;
- certification;
- ready-stock status;
- supply price;
- capacity.

## 9.3 `js/site.js`

Required:

- product-level min/max/step normalization;
- order-draft v2 → v3 migration helper;
- safe route helpers if needed;
- retain shared cart and image fallback;
- no order persistence in Package 1.

Potential API additions:

```js
normalizeProductQuantity(product, value)
readLegacyDraft()
migrateOrderDraft()
```

## 9.4 `js/home.js`

Required:

- use deduplicated testimonial source;
- retain three-card behavior;
- verify one-card advance;
- mobile behavior remains horizontal/manual as approved;
- no new unsupported dynamic claim.

## 9.5 `js/catalog.js`

Required:

- page-size URL state;
- remove quantity from modal;
- explicit variant choice;
- add minimum approved quantity only;
- use `catalogOrder`;
- filter summary and mobile state;
- preserve search debounce and empty recovery.

## 9.6 `js/product.js`

Required:

- multi-variant explicit selection;
- selected-subtotal unavailable until valid variant;
- min/max/step;
- single-image thumbnail suppression;
- updated Cart URL;
- visible form error state.

## 9.7 `js/cart-page.js`

This file receives the largest Package 1 refactor.

Required:

- `orderType` → `context`;
- personal/event only;
- remove business fields;
- event fields;
- v3 draft schema;
- legacy migration;
- inquiry-mode progress labels;
- no dead payment stage;
- preserve total invalidation;
- preserve cart reconciliation;
- improved item controls;
- no persistence/Order ID yet.

## 9.8 New `js/business-inquiry.js`

Package 1 only:

- UI state;
- recurring-frequency validation;
- no one-time option;
- draft preservation;
- clear inactive submission state;
- no RPC;
- no fake Inquiry ID;
- no quotation.

## 9.9 `js/testimonials.js`

Required:

- exclude featured record;
- mobile stack/manual behavior;
- media-error recovery.

## 9.10 `js/info-page.js`

Refactor:

```text
.info-card[id] → .information-content > section[id]
.info-nav → .information-nav
```

Load it from `information.html`.

---

## 10. Asset Plan

### Immediate correction

`assets/images/bawang-goreng.webp` may not remain assigned to Bawang Goreng because it contains Cireng promotional content.

Package 1 options:

1. replace with a verified Bawang Goreng image supplied by the owner; or
2. map the product to `assets/placeholders/bawang-goreng-sumenep.svg`.

Default safe implementation:

```text
Use branded placeholder until a verified image is supplied.
```

Do not modify the incorrect asset into a misleading crop.

### Other images

Keep valid source images and placeholders.

No external stock photos should be introduced during Package 1.

The future photography program belongs to Package 4.

---

## 11. Documentation Plan

Replace or update:

- `README.md`
- `DECISION_LOG.md`
- `docs/AYA-RAOS-DECISION-LOG-v1.5.md`

Recommended maintained structure:

```text
README.md
docs/AYA-RAOS-WEBSITE-MASTER-BLUEPRINT-v1.5.md
docs/AYA-RAOS-DECISION-LOG-v1.5.md
docs/AYA-RAOS-PACKAGE-1-IMPLEMENTATION.md
```

Historical logs may remain only when clearly marked archived or superseded.

Do not leave two current-looking Decision Logs with contradictory architecture.

---

## 12. Files Expected to Change

### Required

- `index.html`
- `products.html`
- `product.html`
- `cart.html`
- `business.html`
- `testimonials.html`
- `information.html`
- `404.html`
- `about.html`
- `css/site.css`
- `js/config.js`
- `js/data.js`
- `js/site.js`
- `js/home.js`
- `js/catalog.js`
- `js/product.js`
- `js/cart-page.js`
- `js/testimonials.js`
- `js/info-page.js`
- `README.md`
- `DECISION_LOG.md`
- `docs/AYA-RAOS-DECISION-LOG-v1.5.md`

### New

- `js/business-inquiry.js`
- maintained Blueprint/implementation documents under `docs/`

### Protected/no change

- `share.html`
- `css/share.css`
- `js/supabase-client.js`
- `js/testimonial-wizard.js`
- testimonial Supabase migrations

### Not expected to change

- payment provider;
- shipping provider;
- order database;
- auth;
- inventory;
- analytics;
- testimonial schema.

---

## 13. Implementation Sequence

The safest edit sequence is:

### Step 1 — Data and config contract

- config capability shape;
- product ordering and quantity fields;
- flavor/spice fields;
- testimonial deduplication;
- Bawang Goreng fallback.

### Step 2 — Shared runtime

- quantity normalization;
- draft migration;
- route/context support.

### Step 3 — Global shell and static routes

- navigation;
- footer;
- Homepage;
- Business;
- Information;
- 404;
- About redirect copy.

### Step 4 — Commerce pages

- Catalog;
- Product Detail;
- Cart Personal/Event.

### Step 5 — Testimonials

- Homepage source;
- Testimonials page;
- mobile behavior.

### Step 6 — CSS source-of-truth refactor

CSS should be edited alongside each DOM change, followed by a final consolidation pass.

### Step 7 — Documentation

Update canonical repository documents before preview delivery.

### Step 8 — Validation and package

No commit/push before complete preview approval.

---

## 14. Validation Matrix

### Static

- HTML semantics;
- duplicate IDs;
- missing labels;
- local links;
- local assets;
- JS syntax;
- `git diff --check`;
- protected hashes;
- no unexpected files;
- no `!important`;
- no parallel CSS.

### Business rules

- official WhatsApp;
- all approved prices;
- no one-time B2B;
- Event is B2C;
- no spice levels;
- no unsupported Sunda exclusivity claim;
- no current restaurant claim;
- no active payment/shipping;
- no fake Order or Inquiry ID.

### Functional

- Catalog search/filter/sort/page size;
- quick add;
- Product explicit variant;
- quantity min/max/step;
- cart variant/quantity/remove;
- Personal/Event context;
- draft migration;
- Information deep links;
- recurring-supply form validation;
- testimonial controls;
- image fallback;
- 404 recovery;
- mobile menu.

### Viewports

- 1366 × 768;
- 1440 × 900;
- 1024 × 768;
- 390 × 844.

### Accessibility

- keyboard-only;
- visible focus;
- 200% zoom;
- reduced motion;
- dialog focus;
- form error summary;
- mobile keyboard;
- color contrast;
- touch targets.

### Visual comparison

Each route requires:

- source screenshot;
- approved mockup reference;
- side-by-side comparison;
- intentional-deviation list;
- before/after screenshot.

---

## 15. Package 1 Delivery Contract

The implementation package must contain:

```text
payload/
scripts/install.py
scripts/rollback.py
scripts/validate.py
backup/
reports/
previews/
README.md
CHANGELOG.md
MANIFEST.json
SHA256SUMS.txt
```

Installer must:

- locate repository root;
- refuse `main` and `master`;
- require the approved preview branch;
- verify expected baseline or approved override;
- back up changed files;
- verify protected hashes;
- install payload;
- run validation;
- display preview command;
- provide rollback command.

Validator must check:

- segmentation;
- route semantics;
- prices;
- WhatsApp;
- config flags;
- protected hashes;
- images/placeholders;
- JS;
- noindex;
- file cleanup;
- no broken links;
- Git status/diff summary.

---

## 16. Risks and Controls

| Risk | Control |
|---|---|
| Old `type=business` links survive | Repository-wide search and validator failure |
| Old drafts misclassify users | Explicit v2→v3 migration |
| Business page pretends to submit | Keep capability disabled; no fake ID |
| Protected Share changes accidentally | Hash gate before and after install |
| Bawang image misleads customers | Force verified image or placeholder |
| CSS patch accumulation | Edit and consolidate `site.css` only |
| Global shell drifts across pages | Automated shell-link validation |
| One-time company order is sent to B2B | Copy, route, FAQ, and validation tests |
| Restaurant vision appears current | Claim validator and manual copy review |
| Unsupported product details appear | Verified-information audit |

---

## 17. Go/No-Go Recommendation

Package 1 is ready to enter implementation **after explicit approval of this map**.

The implementation scope is:

```text
Frontend correction
+ final B2C/B2B semantics
+ Sunda/Lippo Utara positioning
+ world-class UI/UX refinement
+ documentation correction
```

The implementation scope is not:

```text
Order database
B2B persistence
Payment
Shipping integration
Inventory
Analytics
Protected Share redesign
SEO launch
Production Launch
```

No source file, GitHub branch, commit, database, or protected file has been changed during this inspection.

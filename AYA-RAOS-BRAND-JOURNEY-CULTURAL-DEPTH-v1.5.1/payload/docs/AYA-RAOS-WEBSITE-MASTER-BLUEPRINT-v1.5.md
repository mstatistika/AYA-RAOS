# AYA RAOS — Website Master Blueprint

**Document ID:** AYA-WMB-001
**Version:** 1.5 — Hyperlocal Sunda, B2C/B2B Segmentation & Capability Gates
**Date:** 5 Agustus 2026
**Repository:** `mstatistika/AYA-RAOS`
**Production branch:** `main`
**Verified repository baseline:** `0893aeaacc874694a3a24b4eb292d4e887f4ac5c`
**Website status:** Staging / `noindex`
**Document status:** Canonical governance and implementation reference
**Decision Log coverage:** Through DL-599
**Implementation authority:** Sunda visual baseline v1.3 and Phase 2 order/B2B persistence are approved on staging. Awareness → Response → Action Brand Ecosystem refinement v1.5 is the active preview scope. Shipping, payment, analytics, SEO launch, and Production Launch remain gated.

---

## 1. Purpose

This document is the canonical reference for every AYA RAOS website discussion, audit, mockup, implementation, validation, preview, deployment, and release.

It consolidates:

- brand and business positioning;
- hyperlocal growth strategy;
- Sambal AYA product positioning;
- B2C and recurring B2B segmentation;
- route and information architecture;
- commerce and inquiry architecture;
- capability gates;
- design system and world-class UI/UX direction;
- product and testimonial data rules;
- trust, evidence, and policy governance;
- error, accessibility, validation, and release requirements.

All future AYA RAOS work must reference:

1. this Master Blueprint;
2. `AYA-RAOS-DECISION-LOG-v1.5-through-DL-578.md`;
3. the latest validated source baseline;
4. the approved mockup archive;
5. the active package scope.

---

## 2. Source-of-Truth Hierarchy

When sources conflict, use this order:

1. Latest Website Master Blueprint
2. Latest Central Decision Log
3. Approved child blueprint or package specification
4. Approved business, product, policy, evidence, and config data
5. Validated current source
6. Approved mockup
7. Validation/audit report
8. Chat discussion
9. Old deployment, screenshot, ZIP, patch, or memory

Rules:

- Actual source shows what is implemented but does not silently alter approved business policy.
- Mockups control visual direction only after correction against the Blueprint.
- Audits identify risk and opportunity but do not supersede governance.
- A changed decision is marked `Superseded`; it is not deleted.
- A historical deployment is not evidence of current production state.
- A future capability is not considered active merely because a screen or placeholder exists.

---

## 3. Brand Foundation

### 3.1 Master brand

> **AYA RAOS = Ada Rasa**

AYA RAOS is the parent brand.

### 3.2 Current public identity

> **Kuliner Sunda dari Lippo Utara.**

This statement describes the brand’s origin and culinary direction.

### 3.3 Hero product

> **Sambal AYA**

Sambal AYA is the first and strongest awareness and conversion entry point.

### 3.4 Sambal positioning

> **Rasa Sunda. Pedas yang tegas.**

Sambal AYA does not use a numerical or selectable spiciness-level system.

Pedas is the product’s absolute character, not a customer-selected level.

Public product communication focuses on:

- flavor profile;
- aroma;
- texture;
- ingredient character;
- suitable use;
- serving context.

Internal category benchmark:

> Sambal Bu Rudy — benchmark for a distinctive, food-pairing sambal whose identity does not depend on selectable heat levels.

The benchmark is internal only and may not become public comparative copy without explicit approval.

### 3.5 Brand character

- premium rumahan;
- hangat;
- sederhana;
- terpercaya;
- jelas;
- editorial;
- menggugah selera;
- local-first;
- conversion-oriented;
- tidak memakai klaim berlebihan.

### 3.6 Brand ecosystem architecture

AYA RAOS functions as the master-brand and public ecosystem hub. Direct visitors follow an awareness-first journey: understand who AYA RAOS is and why `Ada Rasa` matters, then understand why the ecosystem is divided into three lines, then learn the lines, and only after that enter response and action paths.

```text
AYA RAOS — Ada Rasa
├── AYA Spice Haven      · Spice Red
├── AYA Farm             · Farm Green
└── AYA Snacks & Drinks  · Warm Amber
```

Line landing pages may use distinct marketing emphasis, but they remain visually and navigationally connected to AYA RAOS. Product QR entry is expected to route to the relevant line landing page, while preserving access back to the master hub.

Sambal AYA remains the hero product under AYA Spice Haven. It is not the definition of the entire AYA RAOS master brand.

### 3.7 Product lines

#### AYA Spice Haven

- sambal;
- rempah;
- pendamping makanan;
- bumbu;
- lauk berbumbu.

#### AYA Farm

- hasil pertanian;
- hasil peternakan;
- produk primer.

#### AYA Snacks & Drinks

- camilan;
- frozen snack;
- makanan siap dinikmati;
- minuman.

Taxonomy follows primary function:

- Sambal, Rendang, Ayam Kuning → Spice;
- Dimsum, kacang, cireng, es buah → Snacks & Drinks;
- beras → Farm.

The three lines support one master brand. They are not three competing brands or three separate global-navigation systems.

---

## 4. Hyperlocal Growth Strategy

AYA RAOS grows through:

```text
Rumah ke rumah
→ Komplek ke komplek
→ Penguatan pasar Lippo Utara
→ Restoran AYA RAOS
→ Pusat kuliner Sunda di Lippo Utara
```

### 4.1 Current stage

AYA RAOS is currently a home-based culinary brand serving customers through direct local ordering and delivery.

### 4.2 Local-first market

Lippo Utara is the primary market for:

- product validation;
- repeat order;
- local awareness;
- community referral;
- delivery learning;
- event demand;
- operational discipline.

### 4.3 Restaurant vision

Opening an AYA RAOS restaurant in Lippo Utara is a long-term target.

It is not a current operating fact.

### 4.4 Culinary-hub vision

The long-term ambition is to become a center of Sundanese culinary experience in Lippo Utara through:

- food;
- packaged products;
- sambal;
- side dishes;
- snacks;
- drinks;
- selected farm products;
- dining experience;
- cultural and culinary education.

### 4.5 Local exclusivity claim

The owner records AYA RAOS as the only Sundanese culinary concept of its kind in Lippo Utara.

Public wording such as **“satu-satunya kuliner Sunda di Lippo Utara”** is evidence and approval-gated. Until verified, safer public wording is:

> Kuliner Sunda dari Lippo Utara.

---

## 5. Verified Business Rules

### 5.1 Official WhatsApp

```text
628562646444
```

Every WhatsApp action must read:

```js
AYA_CONFIG.whatsappNumber
```

No page or script may hard-code another number.

### 5.2 Service area

Primary:

- Lippo Utara;
- Jabodetabek.

Other Indonesian areas:

- only when product suitability and the approved shipping method support it.

Do not claim:

- every product ships nationally;
- free shipping;
- same-day delivery;
- stock is always available.

### 5.3 Lead time

> Umumnya 2–3 hari setelah pembayaran diterima.

Lead time may vary by:

- product;
- quantity;
- production capacity;
- date required;
- shipping method;
- approved ready-stock status.

### 5.4 Shipping

For Jabodetabek:

> Actual Grab/Gojek tariff or another approved final shipping tariff.

Shipping may not silently default to zero or an invented estimate.

### 5.5 WhatsApp response hours

Response hours are an operational configuration, not a permanent architectural constant.

The currently approved value remains:

> Senin–Jumat, 09.00–21.00 WIB

Any weekend or extended-hour change requires:

- PIC readiness;
- operational approval;
- realistic response expectation;
- config update.

### 5.6 Payment and fulfillment

```text
Valid order
→ Trusted Total Pembayaran
→ Payment
→ Paid / Dibayar
→ AYA starts processing
```

Fulfillment does not begin while payment is pending.

---

## 6. Customer Segmentation

### 6.1 Governing principle

> **Every one-time purchase is B2C. B2B exists only for recurring or continuing commercial supply.**

Segment is determined by relationship pattern and purpose, not quantity or the legal identity of the buyer.

### 6.2 B2C Personal

One-time purchase for:

- personal use;
- family;
- home consumption.

### 6.3 B2C Event

One-time purchase for:

- wedding;
- arisan;
- family gathering;
- community activity;
- office event;
- company event;
- institutional consumption;
- hampers or gifts when available;
- other one-time needs.

### 6.4 B2C one-time commercial trial

A one-time purchase by:

- restaurant;
- store;
- distributor;
- catering business;
- company;
- other business

remains B2C until a recurring commercial-supply relationship is sought and approved.

Examples:

```text
Restaurant buys sambal once to test
= B2C

Distributor buys rice once to test
= B2C
```

### 6.5 B2B recurring supply

B2B applies only when:

- the need is commercial;
- supply is recurring or continuing;
- volume and frequency need evaluation;
- product/specification consistency matters;
- pricing, capacity, delivery, and terms require agreement.

Examples:

```text
Sambal supplied weekly to a restaurant
= B2B

Rice supplied monthly to a distributor
= B2B
```

### 6.6 Quantity is not a segment

```text
100 bottles for one wedding
= B2C Event

10 bottles every week for a restaurant
= B2B recurring supply
```

---

## 7. Project Objective

AYA RAOS is developed as a Premium Brand Store and local-market growth platform supporting:

1. product storefront;
2. Sambal AYA awareness;
3. Sundanese culinary positioning;
4. B2C Personal conversion;
5. B2C Event conversion;
6. recurring B2B supply inquiries;
7. cart and Unified B2C Order Gateway;
8. order persistence and Order ID;
9. future shipping and payment;
10. testimonial submission and moderation;
11. customer information and trust;
12. local demand and repeat-order intelligence;
13. future restaurant-readiness learning;
14. future admin, inventory, account, quotation, and order-history foundations.

---

## 8. Current Implementation Status

Verified repository baseline:

```text
main @ 84e92031007af2341e29d1eb6109681db999925c
```

Status:

```text
Blueprint v1.5 governance      : Locked
Frontend v1.5 correction       : Pending
B2C inquiry persistence        : Implemented in Phase 2 foundation
B2B recurring-supply inquiry   : Implemented in Phase 2 foundation
Protected Share parity         : Pending
Shipping integration           : Inactive
Payment integration            : Inactive
Production Launch              : Not approved
Indexing                       : Disabled / noindex
```

The current source remains a valid baseline but does not yet comply fully with v1.5 segmentation and capability architecture.

---

## 9. Canonical Route Architecture

| Route | Role |
|---|---|
| `index.html` | Awareness-first AYA RAOS Brand Ecosystem Hub |
| `products.html` | Public retail Catalog |
| `product.html?id=...` | Product Detail |
| `cart.html?context=personal` | B2C Personal one-time order |
| `cart.html?context=event` | B2C Event and all other one-time order contexts |
| `business.html` | Recurring B2B supply information and inquiry |
| `testimonials.html` | Approved public testimonials |
| `share.html` | Protected testimonial submission |
| `information.html` | Ordering, event, shipping, payment, recurring supply, FAQ, terms, privacy |
| `about.html` | Compatibility redirect to Homepage brand-story section |
| `404.html` | Not-found recovery using the global shell |

### 9.1 Compatibility migration

Legacy:

```text
cart.html?type=business
```

must not continue as a B2B transaction route.

It may temporarily redirect or map safely to:

- B2C Event when the prior intent is one-time; or
- `business.html` when the user is seeking recurring supply.

No automatic migration may silently misclassify one-time orders as B2B.

### 9.2 Future routes

Not yet approved:

- payment return/success;
- payment failed/expired;
- public order status;
- customer account;
- order history;
- admin;
- inventory;
- quotation portal;
- recurring-supply account portal.

---

## 10. Locked Global Navigation

Recommended desktop order:

```text
Beranda
Tentang AYA
Produk
Testimoni
Informasi
Pasokan Usaha
Keranjang
Pesan Sekarang
```

Routing:

- Beranda → `index.html`
- Tentang AYA → `index.html#cerita-aya`
- Produk → `products.html`
- Testimoni → `testimonials.html`
- Informasi → `information.html`
- Pasokan Usaha → `business.html`
- Keranjang → `cart.html?context=personal`
- Pesan Sekarang → `cart.html?context=personal`

`Pasokan Usaha` may be visually secondary if the navigation becomes crowded, but the route must remain discoverable from:

- Information;
- footer;
- relevant Catalog/Product contexts;
- brand story;
- B2C Event flow.

---

## 11. Capability-Gate Architecture

Capabilities are disabled by default until evidence, policy, operation, technical readiness, and approval exist.

Recommended config direction:

```js
AYA_CONFIG = {
  environment: "staging",

  checkout: {
    mode: "inquiry",          // inquiry | payment
    orderPersistence: false
  },

  businessSupply: {
    enabled: false
  },

  shipping: {
    enabled: false
  },

  payment: {
    enabled: false
  },

  readyStock: {
    enabled: false
  },

  bulkPricing: {
    enabled: false
  },

  promotion: {
    enabled: false
  },

  damagePolicy: {
    enabled: false
  },

  responseHours: {}
};
```

Rules:

- A disabled future capability is not automatically a defect.
- An enabled capability that cannot be fulfilled is a defect.
- UI may show a clearly inactive explanatory state only when it does not create a dead end for public users.
- Payment controls may not appear active before integration is trusted.
- Bulk pricing may not appear before product-specific pricing and capacity approval.
- Ready stock may not appear without inventory-backed truth.
- Promotions and guarantees may not appear without policy.

---

## 12. Global Design System

The only general frontend design system is:

```text
css/site.css
```

Protected temporary exception:

```text
css/share.css
```

`share.css` may be removed only after measured functional and visual parity.

### 12.1 World-class visual ambition

AYA RAOS should feel like:

> A warm, editorial, trustworthy Sundanese culinary brand from Lippo Utara—small in origin, disciplined in presentation, and ready to grow.

It must not resemble:

- a generic marketplace;
- a restaurant website before the restaurant exists;
- an over-spaced luxury template;
- a card-heavy developer dashboard;
- an effects-driven food campaign.

### 12.2 Typography

- Cormorant Garamond: display/editorial headings;
- Montserrat: body, navigation, labels, forms, prices, buttons;
- Allura: limited non-critical decorative accent.

### 12.3 Palette

- burgundy and red: primary brand and culinary energy;
- ivory and cream: hospitality and editorial warmth;
- brown: supporting tone;
- gold: restrained accent;
- muted olive: AYA Farm accent only.

Accessibility aliases:

```css
--color-gold-decorative: #b98a3a;
--color-gold-text: #8f6725;
--color-text-soft: #766861;
```

### 12.4 Locked dimensions

- maximum wide container: 1240 px;
- utility bar: 30–32 px;
- laptop header: 70–72 px;
- minimal footer: 80–96 px;
- standard controls: 48 px;
- minimum touch target: 44 × 44 px;
- standard card radius: maximum 20 px;
- hero/media radius: maximum 24 px;
- standard motion: 150–350 ms;
- testimonial transition: approximately 450 ms.

### 12.5 Composition

Use:

- 12-column laptop grid;
- 8-column tablet grid;
- 4-column mobile grid;
- compact, standard, and editorial section densities;
- no forced viewport height on ordinary sections;
- no card treatment for every section.

### 12.6 Motion

Allowed:

- subtle button press;
- controlled hover;
- drawer/modal transition;
- testimonial transition;
- form-stage transition.

Not allowed:

- parallax;
- scroll hijacking;
- autoplay video;
- constant floating animation;
- excessive entrance effects.

---

## 13. Image Direction

Product photography must support appetite and trust:

- authentic texture;
- visible food detail;
- real serving context;
- natural warm light;
- packaging scale;
- no unrelated price text;
- no misleading garnish;
- no extreme crop hiding the product.

Recommended Sambal AYA shot set:

1. macro texture;
2. container front;
3. spoon/detail;
4. served with warm rice;
5. family-table context;
6. hand-held scale reference;
7. variant comparison.

Branded placeholder remains correct when:

- the approved image is unavailable;
- the current image is wrong;
- product presentation is not approved.

A correct placeholder is more trustworthy than a wrong real image.

---

## 14. Homepage Blueprint

### 14.1 Journey objective

The Homepage is **awareness-first**, not product-first and not line-selector-first.

The required sequence is:

```text
AYA RAOS
→ why AYA RAOS / Ada Rasa
→ why the ecosystem is split into three lines
→ what the three lines are
→ understand each line
→ choose a relevant response
→ take action
```

The commercial objective remains conversion, but conversion begins only after the master brand and ecosystem are understandable.

### 14.2 First viewport — master-brand awareness

The first viewport must establish:

- `AYA RAOS`;
- `Ada Rasa`;
- AYA RAOS as the master brand / home of AYA;
- Lippo Utara as the current local context.

The first viewport must **not** behave as a three-line selector and must not make Sambal AYA the definition of AYA RAOS. Master-brand colors remain Heritage Maroon, Cream, and Gold. Line accent colors are introduced later.

Primary first-viewport action: continue the brand journey (`Kenali AYA RAOS` / scroll).

### 14.3 Why RAOS

Explain `AYA RAOS = Ada Rasa` in concise brand language. The purpose is to give the master name meaning before product architecture is introduced. Do not invent an unsupported founder story or linguistic claim beyond the approved `Raos = rasa` framing.

### 14.4 Why three lines

Explain that the ecosystem is divided because product function, customer context, and communication needs differ. The three functional groups are:

1. products that accompany or build a meal;
2. agricultural / primary goods;
3. snacks, frozen items, ready-to-enjoy food, and drinks.

This section explains the business logic before exposing the line names.

### 14.5 Three-line reveal

Reveal the approved line names:

1. `AYA Spice Haven`;
2. `AYA Farm`;
3. `AYA Snacks & Drinks`.

Line accents:

- Spice Haven → Spice Red;
- Farm → Farm Green;
- Snacks & Drinks → Warm Amber.

These are internal design-system names; do not expose color names as public copy.

### 14.6 Line detail

After the names are understood, show each line with enough context to answer what belongs there and why a visitor might enter it. Each line card / editorial block may link to its dedicated line landing page.

### 14.7 Response gateway

After awareness is complete, the Homepage may explicitly ask the visitor to choose intent:

- explore / buy products;
- recurring business supply;
- share an existing customer experience.

This is the transition from **Awareness** to **Response**.

### 14.8 Hero product placement

Sambal AYA remains the current hero product under AYA Spice Haven, with approved starting price from Rp40.000. It appears **after** the ecosystem is understood as a strong conversion entry, not as the master-brand definition.

Required facts around the product response path may include:

- active price / variant;
- lead time 2–3 days after payment is received;
- product status;
- shipping context without unsupported promise.

### 14.9 Trust and advocacy

Trust uses verified specificity rather than generic luxury claims. Testimonials are both evidence for new visitors and an advocacy action for returning customers.

The Homepage should support two clear customer states near the close:

```text
Belum pernah mencoba AYA → Jelajahi Produk
Sudah pernah menikmati AYA → Bagikan Pengalaman
```

Recurring-supply users retain a separate Business path.

### 14.10 Composition and responsive behavior

Sections follow content height; do not force every section to `100vh` / `100svh`. Desktop composition should preserve editorial rhythm and clear transitions. Mobile prioritizes comprehension and reachable actions, with the Awareness → Response → Action sequence unchanged.

## 15. Catalog Blueprint

Route:

```text
products.html
```

Required:

- compact intro;
- search and sort above grid;
- sticky filter rail on laptop;
- mobile filter drawer;
- product line, category, price, public status filters;
- URL-based state;
- four-column laptop grid;
- default eight products;
- approved 8/12 page-size control;
- accessible pagination;
- branded placeholders;
- empty/loading/error states.

Product card:

- image;
- line/category;
- status;
- name;
- short description;
- starting price;
- Detail;
- Add to Cart.

Quick add:

- single variant → add quantity one;
- multiple variants → accessible variant selector;
- no quantity editor;
- no direct WhatsApp checkout action.

---

## 16. Product Detail Blueprint

Route:

```text
product.html?id=<product-id>
```

Laptop:

- gallery left;
- purchase panel right.

First decision area:

- line/category/status;
- product name;
- short value statement;
- variant options;
- selected price;
- quantity;
- subtotal;
- Add to Cart;
- lead time;
- shipping context.

Rules:

- single variant may auto-select;
- multi-variant requires explicit selection unless a new approved default rule exists;
- product-level min/max/step;
- thumbnails only for multiple images;
- Tersedia and Pre-order may be added;
- Habis may not be added.

Product Information:

- Description;
- Composition;
- Storage;
- Suitable Use;
- net weight when verified;
- shelf life when verified;
- storage after opening when verified;
- flavor profile;
- `Pedas` character without numerical level.

---

## 17. B2C Unified Order Gateway

Primary contexts:

```text
cart.html?context=personal
cart.html?context=event
```

### 17.1 Scope

The B2C gateway covers every one-time order:

- personal;
- family;
- event;
- company event;
- institutional one-time order;
- business trial;
- large one-time quantity.

### 17.2 Desktop composition

Two connected columns:

- left: cart items;
- right: progressive order gateway.

### 17.3 Context selector

```text
Untuk Rumah
Untuk Acara
```

Each option includes concise guidance.

Do not show `Usaha` inside the B2C context selector.

### 17.4 Inquiry-mode stages

When payment is inactive:

```text
1 Keranjang
2 Data & Pengiriman
3 Ringkasan
4 Konfirmasi
```

Do not show a dead Payment stage.

### 17.5 Personal fields

- name;
- WhatsApp;
- area;
- address/location;
- optional date;
- optional notes.

### 17.6 Event fields

- customer/contact name;
- WhatsApp;
- event type;
- event date;
- location;
- estimated recipients/participants;
- product and quantity;
- approved packaging needs;
- notes;
- consent where required.

### 17.7 Inquiry completion target

```text
Validated one-time order
→ Persist order
→ Generate Order ID
→ Show complete summary
→ Open WhatsApp with Order ID and summary
```

WhatsApp is continuation and support, not the source of truth.

### 17.8 Future payment mode

When enabled:

```text
Validated cart
→ customer and shipping
→ trusted total
→ persisted order
→ payment session
→ webhook
→ paid
→ fulfillment
```

---

## 18. Recurring B2B Supply Blueprint

Route:

```text
business.html
```

Positioning:

> **Pasokan berkala untuk usaha Anda.**

B2B is not retail checkout and does not use a second cart or pricing engine.

### 18.1 Suitable needs

- sambal supplied repeatedly to restaurants;
- rice supplied repeatedly to distributors;
- products used repeatedly as commercial inputs;
- recurring approved resale or supply relationships.

### 18.2 Not B2B

- one-time company order;
- one-time restaurant trial;
- one-time distributor trial;
- wedding/event;
- one-time bulk purchase.

These remain B2C.

### 18.3 Page structure

1. who recurring supply is for;
2. examples;
3. how evaluation works;
4. information required;
5. inquiry form;
6. what happens next;
7. clear non-guarantee of price/capacity before evaluation.

### 18.4 Required fields

- business/company;
- business type;
- PIC and role;
- WhatsApp;
- email;
- intended use;
- product/specification;
- estimated volume per delivery;
- recurring frequency;
- location;
- proposed start date;
- packaging/operational needs;
- administrative needs;
- notes;
- consent.

There is no `one-time` frequency option.

### 18.5 Completion target

```text
Validate recurring intent
→ Persist Business Inquiry
→ Generate Business Inquiry ID
→ Show summary
→ Continue communication with AYA
```

Submission is not a confirmed order, automatic quotation, or capacity guarantee.

---

## 19. Payment and Fulfillment Architecture

Payment states:

- Draft;
- Ready for Payment;
- Payment Pending;
- Paid;
- Payment Failed;
- Payment Expired.

Fulfillment states:

- Not Started;
- Processing;
- Ready;
- Shipped / Picked Up;
- Completed.

Payment activation requires:

- trusted order creation;
- server-side price validation;
- shipping validation;
- provider integration;
- webhook verification;
- idempotency;
- persistence;
- audit trail;
- duplicate-payment protection.

Inactive payment methods may not appear active.

---

## 20. Testimonials Blueprint

`testimonials.html` is the read-only public showcase.

Desktop:

- approved featured photo/video;
- supporting testimonial stream.

Mobile:

- normal stack or manual slider;
- no continuous vertical auto-scroll.

Rules:

- featured records excluded from ticker;
- no duplicate content;
- no star rating without valid rating data;
- no fake review counts;
- no inline submission form;
- no voucher or publication guarantee.

Approved contextual metadata may include:

- product;
- area;
- Personal/Event context;
- repeat-order context;
- quantity.

Publish only with consent and evidence.

---

## 21. Share Testimonial — Protected

Route:

```text
share.html
```

Protected:

- Supabase RPC;
- payload;
- private bucket;
- upload limits;
- consent;
- moderation;
- environment separation;
- valid-input preservation;
- success pending-review state.

Protected files:

```text
share.html
css/share.css
js/supabase-client.js
js/testimonial-wizard.js
```

World-class parity target:

- global shell;
- clean split wizard;
- concise progress;
- task-focused workspace;
- strong success state;
- short-height support;
- mobile-keyboard safety;
- 200% zoom;
- reduced motion.

No protected modification occurs inside the general frontend corrective package.

---

## 22. Information Blueprint

Route:

```text
information.html
```

Single information hub:

- Cara Pesan;
- Untuk Acara;
- Pengiriman;
- Pembayaran;
- Pasokan Berkala untuk Usaha;
- FAQ;
- Syarat;
- Privasi.

Rules:

- Personal and Event are one-time B2C contexts;
- recurring B2B is clearly separate;
- quantity does not define B2B;
- exact shipping appears before payment once integrated;
- inactive payment methods are not named as active;
- FAQ uses accessible disclosures;
- no cancellation/refund/expiry policy is invented;
- active-section tracking and deep links work.

---

## 23. Product Data Contract

Every public product requires:

- `id`;
- `name`;
- `line`;
- `category`;
- `description`;
- `status`;
- `visibility`;
- `orderable`;
- image or branded placeholder;
- variants;
- approved prices;
- `catalogOrder`;
- verified composition or honest unavailable state;
- verified storage or honest unavailable state;
- suitable use;
- lead time;
- shipping information;
- verified badges only.

Recommended v1.5 additions:

- `flavorProfile`;
- `spiceCharacter`;
- `netWeight`;
- `shelfLife`;
- `storageAfterOpening`;
- `minQuantity`;
- `maxQuantity`;
- `quantityStep`;
- `fulfillmentMode`;
- `dispatchWindow`;
- `restockMessage`;
- `supplyEligible`;
- `verifiedInformation`.

Public status:

- Tersedia;
- Pre-order;
- Habis.

`spiceCharacter` for Sambal AYA communicates `Pedas`, not a numerical level.

### 23.1 Approved prices

#### Sambal Bawang

- Original — Rp40.000
- Cumi/Pete — Rp50.000
- Jengkol — Rp55.000
- Teri Nasi — Rp60.000

#### Bawang Goreng

- Pouch — Rp60.000
- Toples — Rp70.000

#### Rendang

- 300 g — Rp105.000
- minimum three portions

#### Ayam Kuning

- Paket 4 pcs — Rp50.000
- Satuan — Rp15.000
- Kulit 500 g — Rp30.000
- Ceker 500 g — Rp30.000

#### Dimsum + Chili Oil

- 10 pcs — Rp40.000

#### Kacang Tanah

- Toples — Rp45.000
- Pouch — Rp50.000

#### Kacang Mede

- 250 g — Rp80.000

#### Es Buah

- 250 ml — Rp15.000

No other public price, size, variant, or status is approved without a Decision Log entry.

---

## 24. Trust, Evidence, and Policy Governance

### 24.1 Allowed current facts

- batch kecil;
- approved lead time;
- verified service area;
- approved shipping method;
- real testimonials;
- real public product status;
- verified product information;
- Kuliner Sunda dari Lippo Utara;
- current home-based growth story.

### 24.2 Evidence-gated claims

Examples:

- only Sundanese culinary concept in Lippo Utara;
- halal;
- certification;
- customer count;
- review count;
- capacity;
- client list;
- partner logo;
- awards.

Evidence Registry fields:

- claim;
- evidence source;
- product/scope;
- valid from;
- valid until;
- approved by;
- allowed pages.

### 24.3 Policy-gated capabilities

- bulk pricing;
- MOQ;
- promotion;
- free-shipping threshold;
- damage/replacement guarantee;
- cancellation;
- refund;
- ready stock;
- weekend response;
- custom packaging;
- sample program;
- reseller;
- private label.

Policy Registry fields:

- capability;
- version;
- effective date;
- eligibility;
- limits;
- customer-facing wording;
- operational owner;
- approval;
- review date.

---

## 25. Error and System States

Every relevant route must show visible, actionable UI for:

- config failure;
- product-data failure;
- image failure;
- invalid product ID;
- empty cart;
- storage failure;
- invalid/changed item;
- order persistence failure;
- duplicate-prevention state;
- shipping incomplete/calculating/available/unavailable/failed/stale;
- payment pending/failed/expired;
- business-inquiry validation/persistence failure;
- testimonial network/Supabase/media failure;
- 404.

Feedback hierarchy:

- global;
- section;
- form summary;
- field/inline;
- toast only for short non-critical confirmations.

---

## 26. Accessibility

Minimum baseline:

- WCAG 2.2 AA;
- semantic landmarks;
- skip link;
- keyboard navigation;
- visible focus;
- labels;
- focused error summary;
- field-error association;
- `aria-live`;
- accessible names;
- adequate contrast;
- 44 × 44 px touch target;
- 200% zoom;
- reduced motion;
- modal keyboard behavior;
- no information by color only;
- mobile keyboard safety.

Validation viewports:

- 1366 × 768;
- 1440 × 900;
- 1024 × 768;
- 390 × 844.

---

## 27. Environment, SEO, and Release

Staging remains:

```text
noindex, nofollow, noarchive
```

Production Launch requires:

- approved source deployed from current `main`;
- domain approval;
- canonical URLs;
- sitemap;
- metadata and OpenGraph review;
- structured data where eligible;
- indexing enablement;
- analytics approval;
- operational policy readiness;
- shipping/payment/security validation where active;
- live viewport and interaction validation;
- no unsupported claims;
- correct WhatsApp;
- correct product data;
- explicit launch approval.

Do not remove `noindex` merely because the frontend appears complete.

---

## 28. Implementation Packages

### Package 0 — Governance Lock

Includes:

- Blueprint v1.5;
- Decision Log through DL-578;
- revised audit and sweep plan;
- UI/UX design addendum;
- supersession matrix;
- capability-gate matrix.

### Package 1 — Frontend Corrective & Positioning

Recommended branch:

```text
preview/blueprint-v1-5-frontend-corrective-v1
```

Baseline:

```text
main @ 84e92031007af2341e29d1eb6109681db999925c
```

Scope:

- wrong asset correction;
- single Homepage CTA;
- Sunda/Lippo Utara positioning;
- Personal/Event segmentation;
- recurring-supply page;
- Information separation;
- Catalog/Product interaction corrections;
- testimonial corrections;
- active-section tracking;
- 404 decision;
- current documentation.

No order database, payment, shipping, or protected Share migration.

### Package 2 — Order and Business Inquiry Foundation

- B2C persistence;
- Order ID;
- inquiry completion;
- B2B recurring-supply persistence;
- Business Inquiry ID;
- RPC/security/idempotency;
- operational record visibility.

### Package 3 — Protected Share Parity

- global-shell and visual parity;
- protected contract preservation;
- full accessibility validation.

### Package 4 — Product and Launch Readiness

- verified information;
- photography;
- contextual testimonials;
- policy decisions;
- shipping;
- payment;
- metadata;
- schema;
- indexing;
- launch.

---

## 29. Acceptance Gate

### Governance-complete

- Blueprint v1.5 locked;
- Decision Log through DL-578;
- segmentation unambiguous;
- capability gates documented;
- UI/UX direction documented.

### Frontend-corrective complete

- no `Acara / Usaha` mixing;
- every one-time order is B2C;
- B2B is recurring supply only;
- no numerical spice levels;
- one Homepage primary CTA;
- Sunda/Lippo Utara positioning is clear;
- incorrect Bawang Goreng asset removed;
- no testimonial duplication;
- no mobile auto-ticker;
- all four viewports pass;
- protected Share unchanged.

### Staging-ready order flow

- no dead payment stage in inquiry mode;
- Order ID precedes WhatsApp;
- B2B has no one-time option;
- Business Inquiry ID precedes follow-up;
- retry does not create uncontrolled duplicates;
- safe visible errors.

### Production-ready

Requires all active integration, policy, security, SEO, and launch gates.

---

## 30. Reference Header for Future Work

```text
Reference:
- Master Blueprint: AYA-WMB-001 v1.5
- Decision Log: through DL-578
- Repository: mstatistika/AYA-RAOS
- Baseline SHA: 84e92031007af2341e29d1eb6109681db999925c
- Scope: [governance / frontend / order / B2B / protected share / launch]
- Package: [0 / 1 / 2 / 3 / 4]
- Protected files: [list]
- Capability flags: [list]
```

This document supersedes Master Blueprint v1.4 for current project governance.

---

## Addendum — Brand Journey & Cultural Depth v1.5.1

### Governing experience

The master Homepage remains awareness-first, but its editorial sequence is refined to:

`AYA RAOS / Ada Rasa → Makna RAOS → Cerita & budaya → Alasan tiga lini → Tiga lini + karakter → Response → Product/Proof → Action`.

The added `Cerita & budaya` layer exists to make Sunda identity understandable through meaning, food context, verified information, and ways of enjoying products. It must not become folklore decoration or unsupported heritage storytelling.

### Visual quality

- Normal body copy target: approximately 16px with comfortable line height.
- Small critical commerce/form/footer text must remain legible; 8–10px text is decorative metadata only.
- Section rhythm must vary between quiet editorial, visual, structural, proof, and conversion moments; the site must not feel like repeated cards/slides.
- Existing master palette and line accents remain unchanged.
- Real people/process/source photography is preferred when approved, but placeholder or existing product imagery must never imply unverified production scale or sourcing.

### Shareability

OpenGraph title, description, and image metadata may be present during staging to improve WhatsApp/chat preview behavior. Staging remains noindex. Canonical URLs, structured data, sitemap/indexing, and Production SEO Launch stay inactive until OD-013 is approved.

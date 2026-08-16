# AYA RAOS — Current Development Baseline

**Status:** Canonical development baseline
**Updated:** 16 Agustus 2026
**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Website state:** staging / `noindex`

## 1. Canonical release lineage

Approved implementation lineage for this baseline:

- `0e6f125` — Dedicated Line Pages FINAL LOCK;
- `44533ef` — Product + Catalog implementation lock;
- `764c722` — Product + Catalog governance/canonical checkpoint;
- `c11e538` — approved Testimonials + Share experience;
- `a779b6e` — approved Pasokan Usaha recurring-supply experience;
- governance sync commit containing this document follows `a779b6e`.

After release Stage D, `main` must fast-forward to the governance sync commit and be verified against `origin/main`.

A historical package, screenshot, backup branch, or superseded mockup is not implementation authority.

## 2. Authority

Read in this order:

1. latest explicit user approval;
2. this current baseline;
3. applicable canonical / FINAL LOCK supplement;
4. Project Constitution;
5. Execution Discipline;
6. verified business facts;
7. actual current source.

If an older artifact conflicts with a newer approved scope, the newer approval wins.

## 3. LOCKED / PROTECTED scopes

The following scopes are protected unless explicitly reopened:

- Homepage v3.8;
- AYA Farm / TUMBUH;
- AYA Spice Haven / DIOLAH;
- AYA Snacks & Drinks / DINIKMATI;
- Product Catalog;
- Product Detail;
- Cart / Phase-1 B2C;
- Testimonials public page;
- Testimonial Share experience;
- testimonial data/upload/Supabase/moderation/approval flow;
- Pasokan Usaha.

Shared/global changes must prove zero regression to these scopes.

## 4. Semesta AYA RAOS

Testimonials + Share are the strongest approved reference for the visual logic of **Semesta AYA RAOS**.

Canonical design doctrine:

- premium, warm, editorial, trustworthy;
- large surfaces must not feel flat;
- atmosphere/materiality is brand identity, not decorative garnish;
- maroon/red uses heritage depth, tonal variation, warm light and restrained texture;
- cream/white uses warm ivory, parchment-like materiality, subtle grain and edge depth;
- atmosphere stays quieter than content hierarchy;
- each Line is a Dunia derived from this Semesta and then receives its own visual vocabulary.

This doctrine does not reopen Homepage or any other locked scope.

## 5. Business facts / claim safety

- Brand: **AYA RAOS = Ada Rasa**.
- Hero product: **Sambal AYA**.
- WhatsApp source of truth: `AYA_CONFIG.whatsappNumber = 628562646444`.
- Area progression: Lippo Utara → Jabodetabek → Indonesia according to product and shipping method.
- Lead time: **2–3 days after payment is received**.
- Jabodetabek Grab/Gojek delivery uses the actual applicable rate.
- Do not publish unsupported claims regarding same-day delivery, free shipping, always-in-stock, universal nationwide availability, halal/organic/certification, awards, clients, customer/review counts, capacity, MOQ, or wholesale commitments.

## 6. Product source of truth

`js/data.js` is the public product-data source of truth.

Every public product must use verified:

- id;
- name;
- line;
- category;
- description;
- status;
- image or placeholder;
- variants;
- prices;
- verified information.

Public status vocabulary remains:

- Tersedia;
- Pre-order;
- Habis.

Renderers must not invent or override product facts from mockups.

## 7. Product + Catalog FINAL LOCK

Product + Catalog remain governed by:

`AYA-RAOS-PRODUCT-CATALOG-CANONICAL-SUPPLEMENT-v1.md`

Implementation checkpoint:

`44533ef` — `feat: lock approved Product and Catalog experience`

Product Detail commerce remains:

`Product → explicit variant → quantity → Add to Cart`

No direct Product Detail WhatsApp CTA and no visible lead-time block in the locked Product Detail composition.

## 8. Testimonials + Share FINAL LOCK

Implementation checkpoint:

`c11e538` — `feat: checkpoint approved Testimonials and Share experience`

Detailed authority:

`AYA-RAOS-TESTIMONIALS-SHARE-CANONICAL-SUPPLEMENT-v1.md`

Public Testimonials:

- desktop 20 / 40 / 40;
- atmospheric editorial left;
- video + moving text stories middle;
- photo pause + compact Share CTA right;
- photo testimonial is final admin artwork and receives no frontend quote overlay;
- text testimonial = text + selected product image;
- video = lower-third name + city/area;
- never invent testimonial data or counts.

Share:

- atmospheric maroon left + premium ivory workspace;
- stages `Tentang kamu → Ceritamu → Kirim`;
- Tulisan / Foto / Video horizontal;
- no customer-facing Review page;
- final flow is form → consent → confirmation modal → canonical submission → success;
- existing upload/Supabase/moderation/approval flow remains protected.

## 9. Phase-1 B2C

B2C means a one-time purchase.

Quantity alone never turns a one-time purchase into Pasokan Usaha.

Customer flow:

`Product → Cart → customer details/review → WhatsApp confirmation`

Cart remains a pre-confirmation flow, not online checkout.

Shipping cost and final total remain subject to admin confirmation.

Payment/order persistence remain inactive until explicitly approved.

## 10. Pasokan Usaha FINAL LOCK

Implementation checkpoint:

`a779b6e` — `feat: lock Pasokan Usaha recurring-supply experience`

Detailed authority:

`AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v1.md`

Pasokan Usaha means **recurring supply inquiry**.

It is not defined by order size. A large one-time purchase is still B2C.

Public page structure is locked to three VPs:

1. Intro;
2. Ritme Usaha;
3. one unified workspace.

The unified workspace contains three internal states:

1. Kebutuhan produk;
2. Informasi kontak;
3. Ringkasan kebutuhan.

The left editorial narrative stays stable while the right workspace changes state.

Pasokan Usaha ends in structured WhatsApp continuation. It does not create an order, quotation, capacity guarantee, wholesale-price approval, MOQ commitment, or checkout.

## 11. Pasokan product / supply metadata

`window.AYA_BUSINESS_SUPPLY` in `js/data.js` is the current public supply-form configuration.

It is intentionally separate from the B2C product/price contract.

Important rules:

- public product identity/variant remains sourced from canonical product data;
- only eligible/orderable products with configured supply metadata enter the public Pasokan form;
- supply unit metadata is data-driven, never inferred from the product name;
- supply units may describe recurring operational needs and therefore may differ from the retail packaging presentation;
- these units are inquiry vocabulary, not a public MOQ, capacity promise, price promise, or guarantee that every requested configuration will be accepted;
- future Admin may manage these options; the current implementation uses static controlled metadata.

Current approved supply vocabulary includes examples such as:

- Sambal → Botol;
- Bawang Goreng → Pouch / Toples / Kg;
- Rendang → g / Kg;
- Ayam → Ekor / Pcs / g / Kg according to variant;
- Dimsum → Paket / Pouch / Toples / Kg;
- Kacang Tanah → Toples / Pouch / Kg;
- Kacang Mede → g / Kg;
- Es Buah → ml / Liter.

Management/admin remains responsible for evaluating whether an inquiry is operationally appropriate.

## 12. Perkiraan quantity strategy

Pasokan Usaha uses:

`quantityStep: 5`

This is intentional.

The visible field is **Perkiraan kebutuhan**, not a confirmed order quantity.

Therefore:

- increments of 5 are an inquiry-quality strategy;
- they are not a published MOQ;
- they are not a guarantee of acceptance;
- they are not a final commercial commitment;
- administration/management will evaluate the submitted need during follow-up.

The same estimate principle applies regardless of whether the selected unit is count, packaging, weight, or volume.

## 13. Frequency

Frequency is required at product-line level in Pasokan Usaha.

Current options:

- Setiap hari;
- Setiap minggu;
- Setiap 2 minggu;
- Setiap bulan;
- Lainnya.

Custom frequency context is available when `Lainnya` is selected.

Frequency is part of the distinction between recurring supply and one-time B2C purchasing.

## 14. Pasokan contact / validation

Contact state collects the necessary review context:

- business / organization;
- PIC;
- WhatsApp;
- optional email;
- target start / timing;
- delivery location / area;
- optional notes;
- consent.

Validation is inline:

- invalid fields receive restrained red highlighting;
- concise error copy sits adjacent to the relevant field label;
- consent has its own local error;
- there is no large visible global Contact error box.

## 15. Pasokan draft / persistence

Current Pasokan draft storage is local browser storage only:

`ayaRaos.businessDraft.v2`

This is convenience persistence, not an inquiry database.

Business Inquiry database persistence, admin workflow, classification, quotation and order creation remain future capabilities.

## 16. Repository hygiene

Canonical source belongs in Git.

Do not commit:

- generated ZIP packages;
- installer / rollback backups;
- screenshots and debug exports;
- local workspace copies;
- `.vercel`;
- `node_modules`;
- `.env*`;
- transient Supabase files.

Preview/feature branches are temporary implementation branches.

After verified canonical release:

1. switch local `main`;
2. fast-forward/sync;
3. verify `main == origin/main`;
4. remove obsolete preview branches;
5. inspect historical backup/release branches before deletion;
6. remove transient local files;
7. prune refs;
8. finish with a clean worktree.

## 17. Release discipline

Release stages remain:

A. preflight;
B. implementation commit/push/verify;
C. governance commit/push/verify;
D. fast-forward canonical `main` and verify;
E. housekeeping separately.

Unexpected Git state must be diagnosed read-only before mutation.

## 18. Current scope boundary

Testimonials + Share and Pasokan Usaha are now approved and locked.

`Informasi` was intentionally skipped and remains unchanged.

No next visual/UX scope is implied by this document. A new scope must be explicitly opened by the user.

Production remains staging / `noindex` until explicit Production Launch approval.

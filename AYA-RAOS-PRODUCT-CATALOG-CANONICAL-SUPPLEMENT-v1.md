# AYA RAOS — PRODUCT + CATALOG CANONICAL SUPPLEMENT v1

**Revision:** 1.1
**Status:** VISUAL / UX LOCK — release candidate pending final consolidated preview
**Date:** 15 Agustus 2026
**Repository:** `mstatistika/AYA-RAOS`
**Canonical baseline:** `main` @ `398f654`
**Dedicated Line Pages implementation lock:** `0e6f125`

---

## 1. Authority

Latest explicit user approval is the highest authority for Product + Catalog.

This revision supersedes earlier Product/Catalog mockup/package details where they differ from the approved preview.

Homepage and the three Dedicated Line Pages remain LOCKED / PROTECTED.

---

## 2. Commerce Brand Architecture

AYA RAOS commerce follows:

- **AYA RAOS = Semesta**
- **AYA Line = Dunia**
- **Product = Hero**

Catalog presents the heroes across the three worlds.
Product Detail is where one hero receives the stage.
Cart is the B2C transaction gateway.

---

# 3. CATALOG — FINAL VISUAL / UX LOCK

## 3.1 Intro

Approved heading:

**Product Kami**

Approved supporting copy:

> Jelajahi tiga lini AYA RAOS untuk menemukan produk yang sesuai untuk rumah dan berbagai momen.

The intro is centered, editorial, warm, and premium.

## 3.2 Desktop product rhythm

- 3 product cards per visible group.
- Group navigation advances by 3.
- Navigation is shown only when more than one product group exists.
- A reserved navigation rail keeps the Catalog geometry stable when results reduce to 3 or fewer products.
- Catalog-only stable scrollbar gutter prevents horizontal layout shift when filtering changes document height.

Final navigation geometry:
- circular control: 30 × 30 px;
- chevron: 13 px;
- navigation sits in its own rail below the cards;
- no negative translate / overlap with cards.

## 3.3 Search / sort

Approved visible controls:

- Search placeholder: **Cari produk...**
- Sort default value: **Rekomendasi**

Do not show result counts, page-size selectors, or numeric pagination.

## 3.4 Right filter

Visible controls:

### Lini AYA
All checked by default:

- AYA Farm
- AYA Spice Haven
- AYA Snacks & Drinks

Each row uses:

`checkbox → line icon → line name`

and remains on one line on the approved desktop composition.

Unchecking one line excludes products from that line.

### Rentang Harga
Dual range based on valid variant prices.

### Reset Filter
Returns all lines to checked and restores the full price range.

## 3.5 Brand note

Approved copy:

**Tiga dunia, satu AYA RAOS.**
*Tumbuh di Farm. Diolah di Spice Haven. Dinikmati lewat Snacks & Drinks.*

## 3.6 Product card

Final visible card hierarchy:

1. large product photography;
2. floating Quick Add;
3. line + category;
4. product name;
5. short description;
6. price / starting price;
7. variant count when relevant;
8. `Lihat Detail Produk`.

Public status data remains in `js/data.js` for business/runtime truth but **is not displayed on the approved Catalog card**.

No ratings, fake popularity, discount, bestseller, review count, or unsupported badge.

## 3.7 Floating Quick Add — HARD LOCK

The Quick Add circle sits exactly at the right-side boundary between product photography and product information.

It is not centered inside the photo.

Behavior:
- single valid variant → add directly at minimum/default quantity;
- multiple variants → open compact explicit variant selector;
- never silently choose a multi-variant option.

---

# 4. PRODUCT DETAIL — FINAL VISUAL / UX LOCK

## 4.1 Role

Product Detail introduces the product before asking the customer to transact.

Hierarchy:

`Semesta → Dunia → Hero`

The first center of attention is the product identity, not price or cart controls.

## 4.2 Desktop stage

- large gallery at left;
- product identity/story at right;
- compact commerce below story;
- approved composition targets one desktop viewport at the reviewed desktop height;
- normal flow remains the fallback for smaller/responsive viewports.

No blanket `min-height:100svh`.

## 4.3 Identity area

Visible order:

1. line + category;
2. large product name;
3. hero description;
4. introduction chapters.

Public status data remains canonical internally but the `Tersedia / Pre-order` pill **is not shown** in the approved Product Detail composition.

## 4.4 Sambal Bawang prototype copy

The Sambal Bawang copy is the visual/content prototype used to lock the Product Detail layout.

### Hero description
> Sambal pendamping untuk melengkapi makan sehari-hari, hadir dalam empat varian dengan karakter pedas yang tegas.

### Tentang Produk
> Sambal Bawang AYA hadir dalam empat varian—Original, Cumi/Pete, Jengkol, dan Teri Nasi—untuk menyesuaikan selera Anda.

### Karakter Rasa
> Pedas yang tegas menjadi karakter utamanya. Setiap varian membawa karakter bahan yang berbeda.

### Cocok Dinikmati Dengan
> Cocok untuk nasi hangat, lauk rumahan, mi, dan hidangan sehari-hari.

Future products may use product-specific copy, but the visual format stays locked.
Unsupported product facts must not be invented to fill a chapter.

## 4.5 Introduction chapters

Preferred chapters:

- Tentang Produk
- Karakter Rasa
- Cocok Dinikmati Dengan

A chapter may be omitted when verified/approved information is not available.

## 4.6 Commerce block

Final visible commerce hierarchy:

- price / starting price;
- quantity;
- explicit variant tiles;
- one full-width primary CTA below both columns:
  **Tambah ke Keranjang**.

The visible labels `Pilih Varian` and `Subtotal` are removed from the approved desktop composition.

Subtotal remains derivable in Cart from the selected variant, quantity, and canonical unit price; it is not a visible Product Detail field.

Variant tiles:
- 2-column grid where space allows;
- aligned dimensions;
- product/variant name and unit price use consistent baselines;
- selected state uses a restrained accent treatment.

CTA:
- spans the commerce panel below the quantity and variant areas;
- remains visually secondary to the product identity;
- routes to Cart state only.

## 4.7 Add-to-cart behavior

Multi-variant:
1. select one explicit variant;
2. choose quantity;
3. Add to Cart.

A second variant is added as a separate cart line item.

Single-variant products may select their only valid variant automatically.

After add:
- remain on Product Detail;
- update cart state/count;
- use existing runtime feedback.

## 4.8 No direct Product Detail WhatsApp / lead-time

Product Detail has:
- no direct WhatsApp purchase CTA;
- no lead-time display.

B2C path:

`Product Detail → Variant / Qty → Add to Cart → Cart → Review → WhatsApp confirmation`

Lead time remains a valid business fact in its appropriate ordering/information context.

## 4.9 No required long below-fold section

The approved Product Detail does not require a related-product carousel, event block, or long informational section below the hero stage.

---

# 5. Photography

Photography remains the principal remaining quality ceiling.

Do not force weak source images through extreme crop, heavy overlays, blur, or stacked corrective CSS.

Dedicated product-detail photography may be created later without reopening the locked Product Detail geometry.

---

# 6. Data / Runtime Guardrails

`js/data.js` remains the product-data source of truth.

A renderer only publishes a product when required public data is valid, including valid variant/price data.

Incomplete launch-preparation products must not be surfaced merely by assigning a placeholder public state.

No unsupported claims may be added.

---

# 7. Source Boundary

Expected Product/Catalog source:

- `products.html`
- `product.html`
- `js/catalog.js`
- `js/product.js`
- one consolidated Product/Catalog section inside `css/site.css`
- this supplement
- `DECISION_LOG.md`

`js/data.js`, `js/config.js`, and `js/site.js` remain unchanged in this consolidation.

Protected:
- Homepage;
- `farm.html`;
- `spice.html`;
- `snacks.html`;
- Cart;
- B2B;
- testimonial/share flow.

Only `css/site.css` remains the active public design system.

No patch stylesheet.
No parallel Product/Catalog token system.
No stacked patch blocks.
No `!important`.

---

# 8. Release Gate

Before commit / merge:

1. consolidate Product/Catalog source;
2. validate JS / HTML / product-data contract;
3. verify WhatsApp source of truth;
4. prove protected HTML/JS/data files equal canonical `origin/main`;
5. normalize CSS and prove all non-Product/Catalog protected CSS is unchanged;
6. preview Catalog in:
   - 3-product state;
   - filtered ≤3-product state;
7. preview Sambal Product Detail;
8. confirm no visual regression;
9. receive explicit user approval;
10. only then commit / push / checkpoint.

No commit or push is authorized by this supplement alone.

# AYA RAOS — Holistic Heritage Design Sweep v1.5.2

## Status

**Preview implementation completed locally. No commit, push, or merge has been performed.**

Baseline verified against remote `main`:

```text
31036ee93bfe2fa255c7c40ca914c95d2da76c06
```

## Scope implemented

### Public visual/source sweep

- `index.html`
- `products.html`
- `product.html`
- `cart.html`
- `business.html`
- `testimonials.html`
- `information.html`
- `spice.html`
- `farm.html`
- `snacks.html`
- `404.html`
- `about.html`
- `css/site.css`

### Interaction/source adjustments

- `js/site.js`
- `js/catalog.js`
- `js/line-page.js`
- `js/product.js`
- `js/cart-page.js`
- `js/business-inquiry.js`
- `js/testimonials.js`

### Explicitly unchanged protected scope

- `share.html`
- `css/share.css`
- `js/supabase-client.js`
- `js/testimonial-wizard.js`
- `js/order-api.js`
- `js/config.js`
- `js/data.js`

## Functional behavior added/refined

### Catalog
- Five-column first-view desktop rhythm.
- Single-variant quick-add remains direct.
- Multi-variant quick-add opens variant dialog.
- Detail routing preserved.

### Line pages
- Product cards become Detail-only presentation surfaces.
- Price and line-level quick variant action removed.
- Closing returns to master three-line ecosystem section.

### Product Detail
- Two desktop compositions.
- Variant, quantity, subtotal, and cart behavior preserved.

### Cart
- One desktop composition.
- Event duplicate customer-name/WhatsApp fields removed.
- Notes moved to delivery state where appropriate.
- Four-state progress preserved.

### Business
- Three desktop compositions.
- New three-step recurring-supply wizard:
  1. Profil Usaha
  2. Kebutuhan Pasokan
  3. Tinjau & Kirim
- Existing Business Inquiry API contract is preserved.

### Testimonials
- Featured media reflows according to actual available media.
- No fabricated video.
- Video metadata is rendered as lower-third when video exists.
- Photo surface is ready for quality-controlled image artwork with integrated quote.
- Story rail uses internal product assets and moves horizontally to the right.

## Capability boundaries

This package does not activate:

- payment provider;
- automatic shipping quotation;
- inventory;
- customer account;
- public order tracking;
- quotation automation;
- analytics;
- Production SEO/indexing.

No new business claim, price, MOQ, capacity, certification, client list, or shipping promise is introduced.

## Validation target

- 1366×768
- 1440×900
- 1024×768
- 390×844

Validation requires:

- no horizontal overflow;
- no JS page errors;
- correct official WhatsApp source;
- approved product/price integrity;
- protected Share hashes;
- no broken local image/source references;
- no `!important` or parallel CSS system;
- staging noindex retained;
- visual composition targets met.

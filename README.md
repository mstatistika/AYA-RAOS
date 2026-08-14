# AYA RAOS Website

Canonical website repository for **AYA RAOS — Ada Rasa**.

## Current state

- Branch authority: `main`
- Environment: staging
- Search indexing: disabled until Production Launch
- Homepage: v3.8 locked baseline
- Dedicated Line Pages: FINAL LOCK at `0e6f125` — AYA Farm (`TUMBUH`), AYA Spice Haven (`DIOLAH`), AYA Snacks & Drinks (`DINIKMATI`)
- Design system: `css/site.css`
- Product data: `js/data.js`
- WhatsApp: `AYA_CONFIG.whatsappNumber`
- B2C Phase 1: cart + WhatsApp confirmation, no online checkout/order persistence
- B2B Phase 1: inquiry summary + WhatsApp, no quotation/order persistence
- Protected testimonial submission: `share.html` + Supabase flow

## Canonical guidance

Read [`docs/AYA-RAOS-CURRENT-BASELINE.md`](docs/AYA-RAOS-CURRENT-BASELINE.md) before changing source.

Old packages, old version labels, screenshots, and historical Git states are not implementation authority.

## Main routes

- `index.html` — Homepage
- `farm.html` — AYA Farm / TUMBUH
- `spice.html` — AYA Spice Haven / DIOLAH
- `snacks.html` — AYA Snacks & Drinks / DINIKMATI
- `products.html` — Catalog
- `product.html?id=<product-id>` — Product detail
- `cart.html` — B2C cart / WhatsApp confirmation
- `business.html` — B2B inquiry
- `testimonials.html` — Testimonials
- `share.html` — Protected testimonial submission
- `information.html` — Ordering, shipping, payment, FAQ, terms, privacy

## Development rules

- Keep one public design system: `css/site.css`.
- Do not add parallel frontend CSS versions or `!important` patches.
- Do not hardcode product facts/images in renderers when they belong in `js/data.js`.
- Keep unsupported commercial capabilities hidden.
- Validate before commit and preview before production-facing merge.

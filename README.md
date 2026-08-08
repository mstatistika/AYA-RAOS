# AYA RAOS Website

AYA RAOS adalah **brand ecosystem hub** untuk tiga lini: **AYA Spice Haven, AYA Farm, dan AYA Snacks & Drinks**. Website menggunakan static HTML/CSS/JS di Vercel dengan Supabase untuk fondasi order, Business Inquiry, dan testimonial submission.

## Current status

- Master brand: **AYA RAOS = Ada Rasa**
- Active visual direction: **Holistic Heritage Design Sweep v1.5.2 — preview**
- Experience model: **Awareness → Understanding → Feeling → Response → Action**
- Environment: **staging**
- Indexing: **disabled** (`noindex, nofollow, noarchive`)
- Production branch: `main`
- Verified remote `main` baseline before this preview: `31036ee93bfe2fa255c7c40ca914c95d2da76c06`
- WhatsApp source of truth: `AYA_CONFIG.whatsappNumber = 628562646444`
- Commit/push/merge status: **not performed — waiting for preview approval**

## Brand architecture

```text
AYA RAOS — Ada Rasa
├── AYA Spice Haven      · Spice Red
├── AYA Farm             · Farm Green
└── AYA Snacks & Drinks  · Warm Amber
```

`index.html` adalah master-brand gateway. Dedicated line pages tetap menjadi response-first entry point dan tujuan QR produk:

- `spice.html` — AYA Spice Haven
- `farm.html` — AYA Farm
- `snacks.html` — AYA Snacks & Drinks

Sambal AYA tetap menjadi hero product saat ini di bawah AYA Spice Haven.

## v1.5.2 holistic experience

### Homepage

```text
Hero master brand
→ Makna RAOS
→ RAOS dalam keseharian
→ Tiga fungsi + tiga lini
→ Response gateway + Sambal AYA
→ Closing discovery gateway
→ Minimal footer
```

Homepage tidak lagi memakai testimonial showcase. Testimoni menjadi destination tersendiri.

### Unified heritage visual language

- Heritage Maroon + Cream/Ivory + Warm Gold sebagai master palette.
- Green hanya aksen AYA Farm; Warm Amber hanya aksen AYA Snacks & Drinks.
- Ornamen Sunda dipakai sebagai `frame`, `divider`, atau `accent`; bukan dekorasi acak.
- Editorial serif untuk headline; functional sans untuk navigation, forms, metadata, dan buttons.
- Transition antar chapter dibuat halus dan konsisten.
- Product/media surfaces memakai rasio dan safe crop yang stabil sehingga foto final dapat diganti tanpa membongkar layout.
- Satu design system umum tetap berada di `css/site.css`; tidak ada parallel CSS system atau `!important` patch.

### Card grammar

- **Signature / Heritage** → identity / focal brand moment.
- **Gateway** → navigation; seluruh kartu clickable.
- **Information** → explanation; tidak diberi affordance seolah-olah navigation.

## Route treatment v1.5.2

| Route | Treatment |
|---|---|
| `index.html` | Master-brand awareness hub; locked heritage journey |
| `products.html` | Compact heritage Catalog; right filter; 5-card first-view rhythm on 1366 desktop |
| `product.html?id=...` | Exactly two desktop compositions: Product Decision + Product Understanding |
| `cart.html?context=personal` | One-viewport desktop B2C order gateway |
| `cart.html?context=event` | One-viewport event gateway; PIC + WhatsApp only once |
| `business.html` | Three desktop compositions: positioning, examples/evaluation, 3-step inquiry wizard |
| `testimonials.html` | Two desktop compositions: featured media + moving story strip |
| `share.html` | Protected testimonial submission flow; unchanged in this sweep |
| `information.html` | Information hub; every selected topic packed into one desktop viewport |
| `spice.html` | Two desktop compositions; identity + Detail-only product discovery |
| `farm.html` | Two desktop compositions; identity + Detail-only product discovery |
| `snacks.html` | Two desktop compositions; identity + Detail-only product discovery |
| `404.html` | Heritage-aligned recovery page |

## Commerce architecture

- Seluruh transaksi satu kali adalah B2C.
- B2C memiliki konteks **Untuk Rumah** dan **Untuk Acara**.
- B2B hanya untuk **pasokan komersial berulang**.
- B2C order persistence aktif di staging dan menghasilkan Order ID sebelum WhatsApp continuation.
- B2B recurring-supply persistence aktif di staging dan menghasilkan Business Inquiry ID.
- Payment, automatic shipping quotation, inventory, quotation automation, customer account, dan public order tracking masih inactive.

Lead time tetap merupakan informasi bisnis valid, tetapi v1.5.2 menampilkannya hanya ketika relevan terhadap keputusan customer; bukan sebagai trust badge yang diulang di seluruh halaman.

## Config capability state

Source of truth: `js/config.js`.

```text
order persistence      : active (staging)
business persistence   : active (staging)
shipping integration   : inactive
payment                : inactive
ready stock automation : inactive
SEO indexing           : disabled
Production Launch      : not approved
```

## Protected scope

This sweep does **not** modify the protected testimonial submission implementation:

- `share.html`
- `css/share.css`
- `js/supabase-client.js`
- `js/testimonial-wizard.js`

It also does not activate payment, shipping-rate integration, auth, inventory, analytics, or Production Launch.

## Preview

```bash
python3 -m http.server 4173
```

Validation targets:

- 1366 × 768
- 1440 × 900
- 1024 × 768
- 390 × 844

Desktop viewport composition is a design target, not a blanket `100vh/100svh` rule. Mobile stacks naturally according to content.

Do not commit, push, or merge this sweep before complete preview validation and explicit approval.

## Governance

- `docs/AYA-RAOS-WEBSITE-MASTER-BLUEPRINT-v1.5.md`
- `docs/AYA-RAOS-DECISION-LOG-v1.5.md`
- `docs/AYA-RAOS-DESIGN-CORRECTION-MAP-v1.5.2.md`
- `docs/AYA-RAOS-HOLISTIC-DESIGN-SWEEP-v1.5.2.md`
- `docs/AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.0.md`
- `docs/AYA-RAOS-BRAND-JOURNEY-CULTURAL-DEPTH-v1.5.1.md`
- `docs/AYA-RAOS-PHASE-2-ORDER-FOUNDATION.md`

# AYA RAOS Website

AYA RAOS adalah **brand ecosystem hub** untuk tiga lini: **AYA Spice Haven, AYA Farm, dan AYA Snacks & Drinks**. Website menggunakan static HTML/CSS/JS di Vercel dengan Supabase untuk fondasi order, Business Inquiry, dan testimonial submission.

## Current status

- Master brand: **AYA RAOS = Ada Rasa**
- Visual baseline: **Sunda Visual System v1.3 approved**
- Active implementation scope: **Awareness → Response → Action refinement v1.5 preview**
- Environment: **staging**
- Indexing: **disabled** (`noindex, nofollow, noarchive`)
- Production branch: `main`
- Verified main baseline before this preview: `0893aeaacc874694a3a24b4eb292d4e887f4ac5c`
- WhatsApp source of truth: `AYA_CONFIG.whatsappNumber = 628562646444`

## Brand architecture

```text
AYA RAOS — Ada Rasa
├── AYA Spice Haven      · Spice Red
├── AYA Farm             · Farm Green
└── AYA Snacks & Drinks  · Warm Amber
```

`index.html` berfungsi sebagai pintu masuk master brand dengan urutan **Awareness → Response → Action**. Visitor langsung mengenal AYA RAOS dan alasan tiga lini sebelum diarahkan ke conversion. Landing page lini berfungsi sebagai response-first marketing gateway yang dapat menjadi tujuan QR produk:

- `spice.html` — AYA Spice Haven
- `farm.html` — AYA Farm
- `snacks.html` — AYA Snacks & Drinks

Sambal AYA tetap menjadi hero product saat ini dan berada di bawah AYA Spice Haven.

## Homepage journey

```text
AYA RAOS / Ada Rasa
→ Kenapa RAOS
→ Kenapa dibagi tiga lini
→ Apa tiga lini AYA
→ Kenali detail tiap lini
→ Response gateway
→ Product / Business / Testimonial action
```

Direct visitor mendapat awareness lengkap. Visitor dari QR masuk ke landing page lini yang relevan, melihat konteks lini tersebut, dan tetap dapat kembali mengenal AYA RAOS sebagai master brand.

## Commerce architecture

- Seluruh transaksi satu kali adalah B2C.
- B2C memiliki konteks **Untuk Rumah** dan **Untuk Acara**.
- B2B hanya untuk **pasokan komersial berulang**.
- B2C order persistence aktif di staging dan menghasilkan Order ID sebelum WhatsApp continuation.
- B2B recurring-supply persistence aktif di staging dan menghasilkan Business Inquiry ID.
- Payment, automatic shipping quotation, inventory, quotation automation, customer account, dan public order tracking masih inactive.

## Routes

| Route | Fungsi |
|---|---|
| `index.html` | AYA RAOS Brand Ecosystem Hub |
| `spice.html` | AYA Spice Haven landing page / QR gateway |
| `farm.html` | AYA Farm landing page / QR gateway |
| `snacks.html` | AYA Snacks & Drinks landing page / QR gateway |
| `products.html` | Katalog seluruh lini |
| `product.html?id=...` | Detail produk |
| `cart.html?context=personal` | B2C Untuk Rumah |
| `cart.html?context=event` | B2C Untuk Acara / seluruh one-time purchase lainnya |
| `business.html` | Recurring-supply Business Inquiry |
| `testimonials.html` | Testimoni approved |
| `share.html` | Testimonial submission + moderation flow |
| `information.html` | Cara pesan, pengiriman, payment status, FAQ, syarat, privasi |
| `404.html` | Recovery page |

## Config capability state

Source of truth: `js/config.js`.

```text
order persistence     : active (staging)
business persistence  : active (staging)
shipping integration  : inactive
payment                : inactive
ready stock automation : inactive
SEO indexing           : disabled
Production Launch      : not approved
```

## Design system

- General design system: `css/site.css`
- Share-specific UI: `css/share.css`
- Master palette: Heritage Maroon + Cream + Gold
- Line accents: Spice Red / Farm Green / Warm Amber
- No parallel frontend CSS system or `!important` patches.

## Preview

```bash
python3 -m http.server 4173
```

Validation targets:

- 1366 × 768
- 1440 × 900
- 1024 × 768
- 390 × 844

Do not commit or merge a new sweep to `main` before preview and validation approval.

## Governance

- `docs/AYA-RAOS-WEBSITE-MASTER-BLUEPRINT-v1.5.md`
- `docs/AYA-RAOS-DECISION-LOG-v1.5.md`
- `docs/AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.0.md`
- `docs/AYA-RAOS-PHASE-2-ORDER-FOUNDATION.md`

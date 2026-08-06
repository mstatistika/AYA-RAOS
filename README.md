# AYA RAOS Website

Premium storefront dan fondasi order AYA RAOS — kuliner Sunda dari Lippo Utara.

## Status

- Blueprint: `AYA-WMB-001 v1.5`
- Implementasi: Package 1 — Frontend Corrective & Positioning Sweep
- Environment: staging
- Indexing: `noindex, nofollow, noarchive`
- Production branch: `main`
- Recommended preview branch: `preview/blueprint-v1-5-frontend-corrective-v1`
- Verified baseline: `e6f891786655c7c8c44d7769d263a45bf1b8ef12`

Package 1 memperbaiki UI/UX, positioning, segmentasi, routing, product interactions, dan dokumentasi. Package ini belum mengaktifkan order persistence, payment, shipping quote, inventory, atau recurring B2B persistence.

## Posisi bisnis

- Hero product: **Sambal AYA**
- Positioning: **Rasa Sunda. Pedas yang tegas.**
- Pedas tidak memakai level angka.
- Semua transaksi satu kali adalah **B2C**.
- B2C memiliki konteks **Untuk Rumah** dan **Untuk Acara**.
- B2B hanya untuk **pasokan komersial berulang**.
- Restoran dan pusat kuliner Sunda di Lippo Utara adalah visi masa depan, bukan fasilitas yang sudah tersedia.

## Route

| Route | Fungsi |
|---|---|
| `index.html` | Homepage dan cerita AYA |
| `products.html` | Katalog retail |
| `product.html?id=...` | Detail produk |
| `cart.html?context=personal` | B2C Untuk Rumah |
| `cart.html?context=event` | B2C Untuk Acara dan seluruh kebutuhan satu kali lainnya |
| `business.html` | Informasi dan draft Pasokan Berkala untuk Usaha |
| `testimonials.html` | Testimoni approved |
| `share.html` | Protected testimonial submission |
| `information.html` | Cara pesan, acara, pengiriman, pembayaran, pasokan usaha, FAQ, syarat, privasi |
| `404.html` | Recovery page |

## Konfigurasi

Source of truth berada di `js/config.js`.

```js
window.AYA_CONFIG = {
  whatsappNumber: "628562646444",
  environment: "staging",
  checkout: {
    mode: "inquiry",
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
  }
};
```

Capability yang belum aktif tidak boleh dipresentasikan sebagai layanan yang sudah berjalan.

## Protected testimonial scope

Package 1 tidak boleh mengubah:

- `share.html`
- `css/share.css`
- `js/supabase-client.js`
- `js/testimonial-wizard.js`
- testimonial Supabase migrations

Visual parity Share Testimonial dikerjakan pada package terpisah.

## Menjalankan preview

```bash
python3 -m http.server 4173
```

Buka `http://localhost:4173`.

Target viewport:

- 1366 × 768
- 1440 × 900
- 1024 × 768
- 390 × 844

## Governance

- `docs/AYA-RAOS-WEBSITE-MASTER-BLUEPRINT-v1.5.md`
- `DECISION_LOG.md`
- `docs/AYA-RAOS-PACKAGE-1-IMPLEMENTATION-MAP.md`

Tidak boleh commit atau merge ke `main` sebelum preview, validation report, dan approval selesai.
## Phase 2 order foundation

Implemented through `supabase/migrations/20260806153000_aya_phase2_order_foundation.sql`:

- server-validated B2C order persistence;
- Order ID before WhatsApp continuation;
- recurring B2B Business Inquiry persistence;
- Business Inquiry ID;
- idempotency and basic rate limits;
- private operational views for service-role access.

Still inactive: payment, automatic shipping quotation, inventory, quotation automation, customer accounts, public order tracking, SEO launch, and Production Launch.

# AYA RAOS — Awareness → Response → Action v1.5.0

Status: **PREVIEW ONLY — belum untuk commit/push/merge**
Baseline produksi: `main` / Sunda visual baseline v1.3 (`0893aeaacc874694a3a24b4eb292d4e887f4ac5c`)

## Tujuan package

Package ini mengubah AYA RAOS dari storefront/product-first menjadi **Brand Ecosystem Hub yang awareness-first**, tanpa membuang visual Sunda v1.3 yang sudah disetujui.

Journey Homepage dikunci:

`AYA RAOS → Kenapa RAOS/Ada Rasa → Kenapa 3 lini → Apa 3 lini itu → Detail 3 lini → Response → Action`

Line landing pages bekerja sebagai response-first entry untuk pengunjung dari QR atau navigasi internal:

- `spice.html` — AYA Spice Haven
- `farm.html` — AYA Farm
- `snacks.html` — AYA Snacks & Drinks

## Yang tidak diaktifkan

Package ini **tidak** mengaktifkan payment, shipping integration, analytics, SEO indexing, inventory, quotation automation, atau public wholesale pricing. `noindex` staging tetap aktif. Migration normalisasi nama `AYA Snacks & Drinks` hanya ditambahkan sebagai source file dan **tidak dijalankan** oleh installer.

## Install ke branch preview/feature

Ekstrak ZIP di root repo, lalu pastikan branch bukan `main/master`.

```bash
git branch --show-current
python3 AYA-RAOS-AWARENESS-RESPONSE-ACTION-v1.5.0/tools/install.py --repo .
```

Installer mendukung preimage:
- main v1.3
- ecosystem v1.4.0
- ecosystem v1.4.1

Installer akan menolak protected integration hash yang berubah, tracked change di luar payload, payload checksum mismatch, atau file source yang tidak cocok dengan baseline yang dikenali.

## Preview

```bash
python3 -m http.server 4173
```

Jika port 4173 sudah aktif, jangan jalankan server kedua. Buka port yang sudah ada dari tab **PORTS** Codespaces.

Viewport acceptance:
- 1366×768
- 1440×900
- 1024×768
- 390×844

Review minimal:
1. Homepage Awareness → Response → Action.
2. Spice Haven / Farm / Snacks & Drinks.
3. Catalog dan filter kanan desktop.
4. Product Detail dan owning-line context.
5. Cart dan WhatsApp message flow.
6. Business recurring-supply flow.
7. Testimonials dan Share form.
8. Mobile navigation, focus, image fallback, dan error state.

## Rollback

Installer mencetak lokasi backup. Gunakan:

```bash
python3 AYA-RAOS-AWARENESS-RESPONSE-ACTION-v1.5.0/tools/rollback.py \
  --repo . \
  --backup .aya-raos-backup-awareness-v150-YYYYMMDD-HHMMSS
```

## Governance utama

- `AYA RAOS = Ada Rasa` adalah master brand.
- First viewport memperkenalkan AYA RAOS; bukan selector tiga lini dan bukan product-first.
- AYA Spice Haven = Spice Red.
- AYA Farm = Farm Green.
- AYA Snacks & Drinks = Warm Amber.
- Sambal AYA tetap hero product saat ini, tetapi muncul setelah ecosystem awareness.
- Direct visitor mendapatkan awareness journey penuh.
- QR visitor masuk ke line landing page dan dapat kembali mengenal AYA RAOS.
- Testimonial berfungsi sebagai evidence sekaligus advocacy conversion.
- WhatsApp source of truth tetap `628562646444`.

Lihat `docs/VALIDATION-REPORT.md` dan `docs/PREVIEW-NOTES.md` sebelum acceptance.

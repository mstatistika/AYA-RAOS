# AYA RAOS — Brand Ecosystem Hub v1.4.0

Preview package untuk mengubah AYA RAOS dari storefront yang terlalu Sambal-centric menjadi **master-brand ecosystem hub** tanpa mengubah visual direction Sunda v1.3 yang sudah disetujui.

## Baseline

`main @ 0893aeaacc874694a3a24b4eb292d4e887f4ac5c`

Installer hanya menerima branch preview/feature yang HEAD-nya tepat pada baseline tersebut. Installer menolak `main` dan `master`.

## Locked brand architecture

```text
AYA RAOS — Ada Rasa
├── AYA Spice Haven      · Spice Red
├── AYA Farm             · Farm Green
└── AYA Snacks & Drinks  · Warm Amber
```

Sambal AYA tetap hero product saat ini di bawah AYA Spice Haven.

## What changes

- Homepage menjelaskan AYA RAOS sebagai rumah besar tiga lini pada first viewport.
- Supporting identity master brand kembali ke `ADA RASA`.
- Homepage memiliki gateway tiga lini.
- Landing page baru: `spice.html`, `farm.html`, `snacks.html`.
- Setiap landing page menunjukkan hubungan ke AYA RAOS dan lintas lini.
- Public name dinormalisasi menjadi `AYA Snacks & Drinks`.
- Catalog dan Product Detail menghubungkan label lini ke landing page lini.
- Line accent system: Spice Red / Farm Green / Warm Amber.
- Stale customer-facing Package 1/Package 2 copy diperbaiki.
- Testimonial ticker desktop mendapat movement.
- Variant keyboard focus diperjelas.
- Share layout memakai shared header token yang benar.
- Governance/README disinkronkan dengan Phase 2 dan ecosystem decision.

## Preserved

- WhatsApp `628562646444`.
- Seluruh approved product price/variant/status.
- B2C Order ID persistence.
- B2B Business Inquiry ID persistence.
- `js/supabase-client.js` dan `js/testimonial-wizard.js` byte-for-byte unchanged.
- Order API, cart logic, business inquiry logic, dan Phase 2 migration unchanged.
- Payment dan shipping integration tetap inactive.
- Staging tetap `noindex`.

## Install to preview branch

Dari root repository:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/brand-ecosystem-hub-v1
```

Extract ZIP di root repository, lalu:

```bash
python3 AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.4.0/tools/install.py --repo .
```

Run preview:

```bash
python3 -m http.server 4173
```

Target review:

- `/index.html`
- `/spice.html?src=qr-sambal`
- `/farm.html?src=qr-beras`
- `/snacks.html?src=qr-dimsum`
- `/products.html`
- `/product.html?id=sambal-bawang`

Viewport: 1366×768, 1440×900, 1024×768, 390×844.

**Do not commit or push before preview approval.**

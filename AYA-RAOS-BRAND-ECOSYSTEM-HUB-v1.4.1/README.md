# AYA RAOS — Brand Ecosystem Hub v1.4.1

Refinement package for the **approved v1.4 Brand Ecosystem Hub direction**.

This is **preview-only**. It does not authorize commit, push, merge, SEO launch, payment activation, shipping activation, or Production Launch.

## What changes

- Homepage first viewport now visually represents all three AYA lines instead of leaving the master-brand story visually dominated by one product image.
- Sambal AYA remains the current hero product and conversion entry under AYA Spice Haven.
- Internal palette labels (`Spice Red`, `Farm Green`, `Warm Amber`) are removed from public marketing copy while remaining design tokens in `css/site.css`.
- Line pages gain explicit sibling-line discovery and a clear master-hub return path.
- QR-ready `src` parameters are preserved from line landing pages into product-detail links for future measurement, without activating analytics.
- Product detail identifies its owning line and links back to the line gateway.
- Catalog copy explicitly explains that it contains products from all three AYA lines.
- Decision Log coverage advances through DL-599.

## Required precondition

The repo must already contain the exact **Brand Ecosystem Hub v1.4.0 preview** files. The installer verifies exact preimage hashes and refuses to overwrite unknown/manual edits.

The installer only runs on `feature/*` or `preview/*` branches and refuses `main`/`master`.

## Install

From the repo root:

```bash
python3 AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.4.1/tools/install.py --repo .
```

Do **not** run the Supabase migration again as part of this refinement. The Snacks & Drinks normalization migration belongs to v1.4.0 and remains separate from this visual/UX refinement.

## Preview

If port `4173` is already serving the repo, use the existing Codespaces **PORTS** entry.

If you need a clean restart:

```bash
pkill -f "http.server 4173" || true
python3 -m http.server 4173
```

Required browser QA:

- 1366 × 768
- 1440 × 900
- 1024 × 768
- 390 × 844

Review at minimum:

- `index.html`
- `spice.html`
- `farm.html`
- `snacks.html`
- `products.html`
- `product.html?id=sambal-bawang`

## Validation

```bash
python3 AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.4.1/tools/validate.py --repo .
git diff --check
```

## Rollback

The installer prints a backup path such as:

```text
.aya-raos-backup-ecosystem-v141-YYYYMMDD-HHMMSS
```

Rollback with:

```bash
python3 AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.4.1/tools/rollback.py \
  --repo . \
  --backup .aya-raos-backup-ecosystem-v141-YYYYMMDD-HHMMSS
```

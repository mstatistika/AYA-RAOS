# AYA RAOS — Brand Journey & Cultural Depth v1.5.1

Preview-only refinement package for AYA RAOS.

## Baseline

- Repository: `mstatistika/AYA-RAOS`
- Source baseline: `main @ 1acbad056680e32ef655412be6ee85990494a76b`
- Package version: `1.5.1`
- Production launch: **NO**
- Database migration/execution: **NO**

## Objective

Refine the approved v1.5 awareness-first ecosystem without redesigning it.
The governing experience is:

`Awareness → Understanding → Feeling → Response → Action`

Knowledge & culture come first; commerce follows only after the visitor understands AYA RAOS and its three lines.

## Main refinement

- Homepage remains master-brand-first: AYA RAOS / Ada Rasa.
- Adds a cultural/knowledge chapter built around **Rasa · Bahan · Meja**, without inventing founder, heritage, sourcing, capacity, client, or certification claims.
- Reduces the presentation-deck feeling by combining the line reveal and line detail into one paced ecosystem chapter.
- Improves site readability: normal body copy moves to a 16px baseline and critical controls/labels are enlarged.
- Keeps AYA Spice Haven / AYA Farm / AYA Snacks & Drinks distinct but within one AYA RAOS design family.
- Product Detail reframes `suitableUse` as **Cara Menikmati**.
- Adds OpenGraph title/description/image to key shareable pages while staging remains `noindex`.
- Normalizes public `AYA Snacks & Drinks` copy drift.
- Keeps existing testimonial, cart, order, B2B, Supabase, WhatsApp, approved prices, payment/shipping gates, and staging SEO behavior intact.

## Package contents

- `payload/` — only source files changed by v1.5.1.
- `tools/install.py` — branch-safe preview installer with preimage checks and automatic backup.
- `tools/rollback.py` — restores source files from installer backup.
- `tools/validate.py` — source, business-rule, integration, and staging validator.
- `docs/` — scope, changelog, validation report, rollback notes, and preview guidance.
- `preview/` — static composition map only; it is **not** a browser screenshot.
- `MANIFEST.json` — payload hashes, allowed baseline preimages, protected hashes.
- `SHA256SUMS.txt` — package-file checksums.

## Install for preview

Place the ZIP in the repository root. Do not install on `main`/`master`.

```bash
git switch main
git pull --ff-only origin main
git switch -c preview/brand-journey-v151

unzip AYA-RAOS-BRAND-JOURNEY-CULTURAL-DEPTH-v1.5.1.zip
python3 AYA-RAOS-BRAND-JOURNEY-CULTURAL-DEPTH-v1.5.1/tools/install.py --repo .
```

The installer:

1. rejects `main` / `master`;
2. accepts only `feature/*` or `preview/*`;
3. validates protected integration hashes;
4. rejects unrelated tracked changes;
5. checks payload SHA-256 and known v1.5.0 preimages;
6. creates `.aya-raos-backup-brand-v151-*`;
7. copies only v1.5.1 payload files;
8. runs the validator and `git diff --check`.

## Recommended preview workflow

Local Codespaces port previews have been unreliable in this project. The preferred acceptance workflow is:

```bash
git add -A
git commit -m "preview: AYA RAOS brand journey cultural depth v1.5.1"
git push -u origin preview/brand-journey-v151
```

Use the resulting **Vercel Preview Deployment** for browser QA. This is a preview commit, not production approval.

Required viewport checks:

- 1366 × 768
- 1440 × 900
- 1024 × 768
- 390 × 844

Review at minimum:

Homepage → Spice Haven → Farm → Snacks & Drinks → Catalog → Product Detail → Cart → Business → Testimonials → Share → Information.

## Rollback

Use the exact backup path printed by the installer:

```bash
python3 AYA-RAOS-BRAND-JOURNEY-CULTURAL-DEPTH-v1.5.1/tools/rollback.py \
  --repo . \
  --backup .aya-raos-backup-brand-v151-YYYYMMDD-HHMMSS
```

## Release gate

Do **not** merge to `main` until browser preview is approved. Staging remains `noindex`; payment, shipping integration, analytics, structured data, canonical production SEO, inventory, public wholesale pricing, and unsupported claims remain outside this package.

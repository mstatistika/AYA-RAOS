# AYA RAOS — UI/UX Sundanese Heritage Sweep v4.0.0

**Status:** Preview / replacement sweep, not committed.  
**Baseline:** `main @ 082919fe8079cb3cf672179eeada59df3bb6b9d8`  
**Purpose:** Replace rejected V3 preview with a stronger Sundanese heritage composition while keeping all Phase 2 commerce and persistence behavior intact.

## Visual lock

- Primary canvas: Heritage Cream `#EFE9D1`.
- Primary stage: Deep Maroon `#551315`.
- Supporting red: `#74181D`.
- Decorative gold: `#B58A45`, limited to hierarchy accents.
- Atmosphere: **Sundanese visual system + modern commerce usability**.
- Reference images are atmosphere references only. No reference logo, layout, motif, typography, or artwork is copied.
- Original AYA motif family consists of border, vertical border, cluster, emblem, and architectural silhouette.

## Composition rules

1. Heritage structure appears through framing, borders, asymmetrical clusters, emblem scale, and tonal architecture—not scattered ornaments.
2. Homepage, Story, Testimonials, and 404 carry the strongest cultural intensity.
3. Catalog and Product Detail remain commerce-first but inherit the framing language.
4. Cart and forms keep decoration restrained for completion clarity.
5. Rounded cards and generic marketplace shadows are reduced.
6. `css/site.css` remains the only general design system.
7. Protected Share Testimonial files remain unchanged.
8. No pricing, product, WhatsApp, persistence, payment, shipping, database, or integration logic changes are included.

## V3 replacement contract

The V4 installer accepts either:

- a clean Phase 2 main working tree; or
- the exact V3 preview fingerprint.

When exact V3 is detected it is reverted to `HEAD` before V4 is applied. Any unknown/manual edit causes a hard stop.

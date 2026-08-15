# AYA RAOS — Active Decision Log

Historical decisions remain available in Git history. This file contains only decisions that are active for the current development baseline.

| ID | Active decision |
|---|---|
| AD-001 | `main` is the canonical production branch; staging stays `noindex` until Production Launch approval. |
| AD-002 | Homepage v3.8 is the locked homepage visual baseline. |
| AD-003 | `css/site.css` is the single public-site design system; no parallel CSS systems, stacked patch layers, or `!important`. |
| AD-004 | `js/data.js` is the public product-data source of truth; renderers may not override it with mockup-specific mappings. |
| AD-005 | WhatsApp source of truth is `AYA_CONFIG.whatsappNumber = 628562646444`. |
| AD-006 | B2C Phase 1 ends in WhatsApp confirmation; no active online checkout or order persistence. |
| AD-007 | B2B Phase 1 supports Usaha & Acara, Bulk & Custom, and Perusahaan; it ends in WhatsApp inquiry and creates no quotation/order/inquiry ID. |
| AD-008 | Payment, order DB, admin, inventory, quotation, accounts, and order history remain future capabilities. |
| AD-009 | `share.html`, `css/share.css`, `js/supabase-client.js`, and `js/testimonial-wizard.js` are protected unless testimonial-submission scope is explicitly opened. |
| AD-010 | Homepage assets under `assets/visual/home-lock/` are canonical and must not be replaced by discarded mockup/package assets. |
| AD-011 | Catalog/Product Detail implementation must start from this clean baseline and approved visual references; deleted legacy renderer overrides are not reusable source. |
| AD-012 | Old package/version directories, screenshots, rollback archives, and obsolete governance docs are not repository authority. |
| AD-013 | The three Dedicated Line Pages are FINAL LOCKED at implementation checkpoint `0e6f125`: AYA Farm / `TUMBUH`, AYA Spice Haven / `DIOLAH`, and AYA Snacks & Drinks / `DINIKMATI`. Farm is the shared geometry/typography master; each line retains its distinct approved visual world. |
| AD-014 | Repository sanitation after `0e6f125` removed obsolete local packages/backups, orphan line assets, and obsolete preview/feature branches. `main` is the retained canonical branch; future implementation must start from a fresh `preview/*` or `feature/*` branch. |

See [`docs/AYA-RAOS-CURRENT-BASELINE.md`](docs/AYA-RAOS-CURRENT-BASELINE.md) for the full active boundary.


## 2026-08-14 — Dedicated Line Pages FINAL LOCK

User approved the final desktop visual state of all three Dedicated Line Pages.

Implementation checkpoint: `0e6f125` — `feat: lock AYA dedicated line pages`.

Approved lines:
- AYA Farm — TUMBUH
- AYA Spice Haven — DIOLAH
- AYA Snacks & Drinks — DINIKMATI

Farm is the shared geometry/typography reference. Each line keeps a distinct visual world: Farm green/natural, Spice maroon/rich culinary, Snacks toasted-brown/terracotta/amber. Contextual header, supporting typography, VP2 alignment, CTA treatment, dedicated photography, and `@aya.raos 2026` signature are part of the approved system.

Repository sanitation completed after the implementation checkpoint. Obsolete packages/backups, orphan `*-v2` line assets, and superseded preview/feature branches were removed. Website source remained unchanged during sanitation.

## 2026-08-14 — Product + Catalog VISUAL / UX LOCK

| ID | Decision |
|---|---|
| AD-015 | Catalog desktop uses 3 products per grouped frame; navigation advances by 3. |
| AD-016 | Visible Catalog filter is limited to 3 AYA-line checkboxes plus price range; result count, page-size control, numeric pagination, category filter, and status filter are removed from the approved composition. |
| AD-017 | Floating Quick Add is HARD LOCKED at the boundary between product photography and product information. |
| AD-018 | Product Detail follows `AYA RAOS = Semesta → Line = Dunia → Product = Hero` and uses identity-first hierarchy. |
| AD-019 | Product Detail commerce routes to Cart only: explicit variant selection → quantity → subtotal → Add to Cart. No direct Product Detail WhatsApp CTA and no lead-time display. |
| AD-020 | Product Detail targets a focused one-VP desktop stage under normal desktop-height conditions, with normal scrolling fallback on shorter screens and responsive devices. |

## 2026-08-15 — Product + Catalog FINAL PREVIEW LOCK

| ID | Decision |
|---|---|
| AD-021 | Catalog approved intro heading is `Product Kami`; the supporting sentence is `Jelajahi tiga lini AYA RAOS untuk menemukan produk yang sesuai untuk rumah dan berbagai momen.` |
| AD-022 | Public status remains canonical product data but is not displayed on approved Catalog cards or Product Detail. |
| AD-023 | Catalog line filters use one-line `checkbox → line icon → line name` rows. The approved brand note is `Tiga dunia, satu AYA RAOS.` with `Tumbuh di Farm. Diolah di Spice Haven. Dinikmati lewat Snacks & Drinks.` |
| AD-024 | Catalog grouped navigation uses a dedicated reserved rail, 30px circular controls, 13px chevrons, no negative overlap, and Catalog-only stable scrollbar gutter. Navigation remains hidden when no additional group exists. |
| AD-025 | Product Detail visible commerce is price + quantity + explicit variants + one full-width `Tambah ke Keranjang` CTA below both columns. Visible `Pilih Varian` and `Subtotal` labels are removed. |
| AD-026 | Sambal Bawang copy is the Product Detail visual/content prototype; future products may receive product-specific copy without reopening the locked geometry. |
| AD-027 | Product Detail final preview geometry/content hierarchy and Catalog final preview geometry/navigation are visually LOCKED; source consolidation and final regression preview are required before commit/push. |

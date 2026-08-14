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

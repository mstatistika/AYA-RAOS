# AYA RAOS — PASOKAN USAHA CANONICAL SUPPLEMENT v2

**Approved public implementation checkpoint:** 21 Agustus 2026  
**Scope:** Public Pasokan Usaha / B2B vNext frontend  
**Implementation branch:** `implementation/pasokan-vnext-20260820`  
**Implementation commits:** `d0300b0`, `2d85ba7`, `737f0ef`  
**Status:** PUBLIC vNEXT FRONTEND LOCK — qualification/account/commercial backend remains separate and inactive until trusted services are connected.

## 1. Authority

This supplement supersedes Pasokan Usaha Canonical Supplement v1 for the public Pasokan frontend after this release.

Read together with:
1. latest explicit user approval/correction;
2. latest CURRENT STATE / development baseline;
3. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.md` for the approved target commercial/account/admin architecture;
4. applicable Cart/B2C and other protected-scope supplements;
5. Project Constitution;
6. Execution Discipline;
7. verified actual source and Git state.

The v1 Pasokan supplement remains historical evidence for the former `a779b6e` implementation only.

## 2. Stable channel boundary

- One-time purchase = B2C, regardless of quantity.
- Recurring supply need = Pasokan Usaha / B2B.
- Quantity alone never defines B2B.
- No automatic B2C↔B2B route.
- Failed or unavailable Pasokan status does not auto-route to Cart.

## 3. Public architecture

The approved three-VP public architecture remains:
1. Intro;
2. Ritme Usaha;
3. Pasokan workspace.

VP1 preserves the approved recurring-supply positioning and explicitly states that the public stage is not yet an order, price offer, or availability guarantee.

VP2 remains informational and preserves eight concepts:
- Produk;
- Varian;
- Perkiraan jumlah;
- Frekuensi;
- Waktu mulai;
- Lokasi;
- Konteks usaha;
- Catatan kebutuhan.

VP2 is not a cadence-selection wizard.

VP3 preserves the premium dark editorial atmosphere and warm operational workspace. Desktop composes product need + company information before the summary/status stage; mobile presents the conceptual sequence as separate steps.

## 4. Public state model

Conceptual flow:
`Kebutuhan Pasokan → Informasi Perusahaan → Ringkasan & Status Pasokan`

The public copy intentionally avoids blunt `layak / tidak layak` labeling.

Status vocabulary:
- checking: `Sedang memeriksa kebutuhan.`
- positive: `Bisa dilanjutkan sebagai Pasokan Usaha.`
- adjustment: `Kebutuhan masih perlu disesuaikan.`
- unavailable/error: `Status belum bisa diperiksa.`

Primary adjustment action:
`Sesuaikan kebutuhan`

Positive activation action may be shown only when a trusted same-origin backend response supplies a valid activation URL:
`Aktivasi Akun Pasokan`

## 5. Product and cadence input

The current public frontend reads eligible selectable products from the existing `window.AYA_BUSINESS_SUPPLY` + `window.AYA_PRODUCTS` boundary.

This remains a transitional frontend data contract; it is not the long-term Product Master/Admin database.

Current public cadence vocabulary is only:
- `W1` — 1 minggu;
- `W2` — 2 minggu;
- `M1` — 1 bulan;
- `M2` — 2 bulan.

Old public frequency choices `Setiap hari` and `Lainnya` are obsolete for vNext.

Quantity input uses a normal integer increment and represents estimated recurring need. It is not a public MOQ, final order quantity, production commitment, or capacity guarantee.

No product-name heuristic may be introduced for B2B eligibility or commercial truth.

## 6. Company information

Required in the current public form:
- Nama Perusahaan / Usaha;
- Konteks usaha;
- PIC;
- WhatsApp;
- Waktu mulai;
- Lokasi pengiriman;
- consent.

Optional:
- Email;
- Catatan kebutuhan.

Email remains optional at the public entry stage. The approved target B2B account architecture still requires at least one verified company email before Commercial Summary confirmation; that account capability is not activated by this frontend release.

## 7. Qualification truth boundary

The browser does **not** calculate B2B eligibility or commercial minimums.

The public JS sends a structured payload only to a configured trusted `businessSupply.qualificationEndpoint`.

The approved commercial thresholds remain canonical in the B2B Commercial Architecture supplement:

### Beras
- W1: 5 kg
- W2: 10 kg
- M1: 25 kg
- M2: 50 kg

### Produk selain beras
- W1: Rp100.000
- W2: Rp200.000
- M1: Rp500.000
- M2: Rp1.000.000

Those thresholds are **not implemented as browser-side qualification logic**.

At this checkpoint, `js/config.js` does not provide `businessSupply.qualificationEndpoint`. Therefore the website must truthfully show that status checking is unavailable rather than fabricate an eligible/adjust result.

## 8. Account / order / commercial truth

This public release does not itself create:
- B2B account;
- OTP session;
- Commercial Summary confirmation;
- commitment;
- quotation;
- order;
- invoice;
- payment or Paid state;
- Supply Price;
- stock/capacity reservation;
- delivery schedule.

Account activation is available only after a trusted backend returns a safe same-origin activation URL.

No routine admin approval is introduced by the public frontend.

## 9. Draft persistence

The vNext JS schema uses draft version `v3`, but persistence is controlled by `AYA_CONFIG.businessSupply.persistence`.

At this checkpoint persistence is disabled. The browser therefore must not be represented as an inquiry/order database.

## 10. Final-flow change from v1

The v1 final WhatsApp inquiry is retired from the vNext target public flow.

The vNext public endpoint is status/qualification oriented:
`Input → Summary → trusted system status → activation or adjustment`

If the trusted qualification service is not connected, the page stops truthfully at unavailable status. It does not manufacture a status or fall back to a fake final inquiry.

## 11. Visual / source lock

Implementation source paths:
- `business.html`;
- Business selectors inside `css/site.css`;
- `js/business-inquiry.js`.

`css/site.css` remains the single public design system.

The approved Business CSS source block begins with:
`/* Pasokan Usaha — B2B vNext APPROVED 2026-08-20 */`

No parallel stylesheet, patch layer, or `!important` architecture is permitted.

Protected scopes remain unchanged unless explicitly reopened:
Homepage; Dedicated Line Pages; Product Catalog; Product Detail; Testimonials public; Testimonial Share; testimonial/Supabase/moderation; Cart/B2C v16; Information.

## 12. Commercial architecture still pending implementation

The broader B2B Commercial Architecture v1 remains approved target authority for:
- explicit Product Master B2B eligibility;
- COGS / Unit Price / Supply Price / margin guard;
- immutable commitment snapshots;
- 6 + 6 month lifecycle and NFC;
- payment, Grace, Pause, credit, delivery and shipping engines;
- B2B Account;
- AYA Admin Platform;
- Finance / Audit / System;
- Admin Database → Publish Layer → Public Read Model/API.

This public frontend release must not be interpreted as implementation of those backend capabilities.

## 13. Release discipline

This checkpoint remains staging / `noindex` until explicit Production Launch approval.

Governance sync and remote verification precede fast-forward of `main`. Housekeeping remains separate.

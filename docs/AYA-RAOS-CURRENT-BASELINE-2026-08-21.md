# AYA RAOS — Current Development Baseline — 21 Agustus 2026

**Status:** Public Pasokan vNext frontend implementation completed on implementation branch; governance sync prepared for canonical release.  
**Repository:** `mstatistika/AYA-RAOS`  
**Canonical branch:** `main`  
**Website state:** staging / `noindex`; Production Launch is not approved.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this baseline;
3. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.md` for approved target B2B architecture;
4. `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md` for the released public Pasokan vNext frontend;
5. applicable Cart/B2C and other canonical supplements;
6. Project Constitution v1.1 except newer explicit B2B supersessions;
7. Execution Discipline v1.1;
8. verified facts;
9. actual source + verified Git state;
10. historical/recovery files only as evidence.

Historical files do not regain authority because they contain `LOCKED` or `APPROVED`.

## 2. Release lineage

Canonical `main` before this release:
`7102a4e7b40c4f4692af3f6f67b0c9a12f9b7173`

Public Pasokan vNext implementation branch:
`implementation/pasokan-vnext-20260820`

Implementation commits:
- `d0300b0` — `feat: implement Pasokan vNext public workspace`
- `2d85ba7` — `feat: wire Pasokan vNext public states`
- `737f0ef` — `feat: apply approved Pasokan vNext visual system`

Immediately before governance sync the implementation branch was verified **3 commits ahead / 0 behind** `main`, with only:
- `business.html`;
- `css/site.css`;
- `js/business-inquiry.js`.

Vercel status for the implementation checkpoint was successful.

## 3. Protected scopes

Protected unless explicitly reopened:
- Homepage;
- AYA Farm / TUMBUH;
- AYA Spice Haven / DIOLAH;
- AYA Snacks & Drinks / DINIKMATI;
- Product Catalog;
- Product Detail;
- Testimonials public;
- Testimonial Share;
- testimonial/Supabase/moderation;
- Cart/B2C v16;
- Information.

Shared changes require zero-regression proof.

## 4. B2C / B2B boundary

- One-time purchase = B2C, including one-time office/event/bulk purchases regardless of quantity.
- Recurring supply need = Pasokan Usaha / B2B.
- Quantity alone never defines B2B.
- No automatic B2C↔B2B route.
- B2C account not required.
- B2B account is part of the approved target architecture, not activated by the public frontend checkpoint.

## 5. Public Pasokan vNext frontend

The public page preserves the approved three-VP architecture:
1. Intro;
2. Ritme Usaha;
3. Pasokan workspace.

VP2 remains informational with eight concepts: Produk, Varian, Perkiraan jumlah, Frekuensi, Waktu mulai, Lokasi, Konteks usaha, Catatan kebutuhan.

Current vNext cadence choices are only W1 / W2 / M1 / M2.

Public form requires WhatsApp and keeps Email optional.

Conceptual flow:
`Kebutuhan Pasokan → Informasi Perusahaan → Ringkasan & Status Pasokan`.

Customer-facing status avoids blunt `layak / tidak layak` wording and uses Pasokan-status language.

The v1 WhatsApp-final-inquiry flow is not the vNext target.

Detailed authority:
`AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md`.

## 6. Qualification truth

Qualification remains system-driven in the approved architecture.

The browser does not calculate commercial eligibility thresholds. It calls a configured trusted qualification endpoint.

Current `js/config.js` does not define `businessSupply.qualificationEndpoint`; therefore staging truthfully reports that status checking is unavailable. No eligible/adjust result, account activation, order, quotation, price, capacity, or payment truth may be fabricated in browser state.

Approved thresholds remain architecture rules for the future trusted qualification service:
- Beras: W1 5kg; W2 10kg; M1 25kg; M2 50kg.
- Other products: W1 Rp100k; W2 Rp200k; M1 Rp500k; M2 Rp1m.

## 7. Broader B2B architecture

The B2B Commercial Architecture v1 remains APPROVED / LOCKED target architecture but is not made live by this frontend release.

Pending trusted/backend implementation includes Product Master eligibility, pricing/margin guard, immutable commercial snapshots, B2B Account, OTP/email verification, payment provider layer, billing/invoices, Grace/Pause/Auto Resume, delivery scheduling, Kredit Pasokan, shipping engine, Admin Platform, Finance, Audit/System, and Admin Database → Publish Layer → Public Read Model/API.

`Paid ≠ Settled` remains mandatory commercial truth.

## 8. Public data and persistence

`js/data.js` and `AYA_BUSINESS_SUPPLY` remain transitional current public data/config sources during migration.

Pasokan JS schema is v3, but local persistence remains disabled by config at this checkpoint.

Frontend-only state is never an inquiry/order/account database.

## 9. Release discipline

Release sequence remains:
preflight → implementation validation/commit/push/remote verify → governance sync/commit/push/remote verify → fast-forward `main` → verify `origin/main` → housekeeping separately.

No force update of `main`.

No Production Launch/noindex removal without explicit approval.

## 10. Governance supersession note

Project Constitution v1.1 remains stable authority except where the approved B2B architecture explicitly supersedes it. In particular, target Admin access allows one Admin User to have multiple Roles with unioned Functions. Constitution v1.2 remains a later governance revision for the broader Account/Admin implementation and is not required to falsely claim those systems are live in this public frontend checkpoint.

# AYA RAOS — CURRENT STATE — 23 Agustus 2026 v13

**Status:** PUBLIC PASOKAN vNEXT + PUBLIC MOBILE UI RELEASED / LOCKED; B2B/Admin backend foundation IMPLEMENTED / HARDENING; commercial activation NOT ACTIVE; post-release parity / polish remains restricted to explicitly reopened public scopes.

**Repository:** `mstatistika/AYA-RAOS`  
**Canonical branch:** `main`  
**Verified actual remote HEAD at reconciliation:** `d8c7e5f63b5c126de7f33fd06c9402ea23ee010d`  
**Website:** staging / `noindex`; Production Launch is not approved.

> This document supersedes the 22 August development baseline as the current repository-state record. It reconciles governance with the actual source and database state. It does not authorize new public visual work or commercial activation.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v13;
3. applicable canonical supplement for the active scope;
4. `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md` for released mobile presentation;
5. `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md` for released public Pasokan vNext;
6. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.1.md` for locked B2B commercial/account/admin target architecture, interpreted together with the actual implementation status recorded below;
7. applicable Product/Catalog, Testimonials/Share, Cart/B2C and Dedicated Line supplements;
8. Project Constitution v1.1 except explicit newer supersessions;
9. Execution Discipline v1.2;
10. verified database facts and actual source/Git state;
11. Git history only as historical evidence.

Historical handoffs/checkpoints do not regain authority merely because they contain `LOCKED` or `APPROVED`.

## 2. Canonical Git state

Actual `main` has advanced beyond the 22 August governance checkpoint.

- Previous governance checkpoint: `8dd9cf4c81ccca7ff71498ac1e680eb0a7e6233a`
- Reconciled actual `main`: `d8c7e5f63b5c126de7f33fd06c9402ea23ee010d`
- Latest verified commits include runtime Supabase configuration, cache-busting and Admin initialization hardening.

The current repository contains Admin, API, server and Supabase migration foundations in addition to the released public storefront. This is an implementation fact, not permission to expose unfinished commercial capabilities publicly.

## 3. Public website — RELEASED / LOCKED

Protected public scopes remain:
- Homepage desktop;
- AYA Farm / TUMBUH desktop;
- AYA Spice Haven / DIOLAH desktop;
- AYA Snacks & Drinks / DINIKMATI desktop;
- Product Catalog desktop;
- Product Detail;
- Testimonials public;
- Testimonial Share;
- testimonial/Supabase/moderation contracts;
- Cart/B2C v16;
- Public Pasokan vNext;
- Information.

Public Mobile UI remains FINAL LOCK at `max-width: 900px` for Homepage, Dedicated Line Pages, Product Catalog, Testimonials and Share. Information mobile remains PARKED.

No public visual region is reopened by this governance reconciliation.

## 4. Public Pasokan vNext — RELEASED / PROTECTED

Source boundary:
- `business.html`;
- approved Business block in `css/site.css`;
- `js/business-inquiry.js`.

Architecture:
`Intro → Ritme Usaha → Pasokan workspace`

Conceptual state:
`Kebutuhan Pasokan → Informasi Perusahaan → Ringkasan & Status Pasokan`

Cadence is only `W1 / W2 / M1 / M2`.

WhatsApp is required; Email is optional.

Commercial qualification remains trusted-backend-owned. The browser must not fabricate Qualified/Not Qualified, account, quotation, order, invoice, price, paid state, stock reservation, capacity or delivery commitment.

## 5. B2B / Admin — ACTUAL IMPLEMENTATION STATUS

The earlier statement that broader B2B/Admin/backend capabilities were entirely “not yet implemented” is now obsolete for repository-state purposes.

Actual source now contains an implementation foundation for:
- Admin Platform UI and client/runtime;
- Admin authentication/preview plumbing;
- Product Master;
- B2B inquiry/commercial views;
- B2B API routes;
- payment webhook/provider foundation;
- server-side Supabase access;
- B2B commercial, delivery, payment, credit, qualification and shipping schema/migrations;
- Admin access/function/role/user model;
- audit/system foundations.

This foundation is **not equivalent to full production commercial activation**.

Operational B2B remains inactive until each capability has passed its own implementation validation, trusted-state validation, provider/configuration validation and explicit activation/release decision.

## 6. Actual Supabase operational state at reconciliation

Observed database counts:
- `admin_users`: 1
- `product_master`: 10
- `catalog_products`: 10
- `b2b_relationships`: 0
- `invoices`: 0
- `payment_attempts`: 0
- `payment_provider_attempts`: 0
- `testimonials`: 4

Therefore there is no evidence of an active B2B customer lifecycle or live transaction history merely from the existence of the schema.

## 7. Qualification state

B2B qualification configuration exists, including approved threshold rows, but the current singleton setting has:
- `qualification_enabled = false`
- `evaluation_scope = pending`
- `value_basis = pending`
- active rule version `2026-08-19-v1`

Therefore qualification must not be represented publicly as active merely because the backend tables and threshold data exist.

Approved thresholds remain:
- Beras: W1 5kg / W2 10kg / M1 25kg / M2 50kg;
- Other products: W1 Rp100k / W2 Rp200k / M1 Rp500k / M2 Rp1m.

## 8. Shipping configuration

Current active B2B shipping configuration observed in Supabase:
- Motor: Rp5.187/km
- Mobil: Rp10.021/km

These are database configuration facts. They do not authorize public B2C shipping changes and do not by themselves activate B2B quotation/order shipping.

## 9. Payment state

Payment architecture/foundation exists in source and database, including provider-attempt, settlement and webhook structures.

Current staging/public payment activation remains disabled. `Paid != Settled` remains mandatory commercial truth.

DOKU remains the approved primary provider architecture with Midtrans fallback, but provider integration/configuration must be separately validated before live activation.

No public UI may fabricate payment success, invoice, settlement or order completion.

## 10. Admin access architecture

The approved target remains:
`Function Registry → Role → Admin User`

One Admin User may have multiple Roles; effective permissions are the union of granted Functions. This supersedes Constitution v1.1’s older one-user-one-role target statement for the B2B/Admin architecture.

System-only authority remains non-assignable to humans.

## 11. Preview → LOCK → implementation parity

The v12 operating rule remains unchanged:
- design/review first in ChatGPT/browser preview;
- explicit LOCK;
- implementation translates the LOCK;
- visible drift is an implementation defect;
- no redesign during implementation.

This governance reconciliation does not constitute a visual LOCK or reopen any public region.

## 12. Current work mode

Allowed:
- read-only audit;
- backend/Admin hardening and validation where explicitly scoped;
- governance reconciliation;
- parity/polish only when a public region is explicitly reopened.

Not allowed without separate explicit approval:
- Production Launch;
- removing `noindex`;
- activating DOKU/Midtrans payments;
- activating B2B qualification/account lifecycle;
- claiming live commercial capacity/order/invoice/payment/settlement truth;
- redesigning locked public scopes.

## 13. Next governance state

The project now has three explicit layers:

**PUBLIC:** released / protected.  
**PLATFORM FOUNDATION:** implemented / hardening.  
**COMMERCIAL ACTIVATION:** disabled / not released.

Future implementation work must be scoped against this three-layer state rather than treating the entire B2B/Admin platform as nonexistent.

## 14. Definition of done for future B2B/Admin activation

A capability is not live merely because code, migrations or UI exist. Activation requires:
- actual source implementation;
- trusted backend truth;
- state/error handling;
- security/RLS validation where applicable;
- provider/configuration validation where applicable;
- protected-scope regression proof;
- explicit release/activation approval;
- canonical `main` verification;
- governance synchronization when state changes.

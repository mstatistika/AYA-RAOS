# AYA RAOS — CURRENT STATE — 17 September 2026 v17

**Status:** PUBLIC PASOKAN vNEXT + PUBLIC MOBILE UI INCLUDING INFORMATION V18 RELEASED / LOCKED; Admin Mobile Companion + mobile auth/access hardening INCLUDED IN CANONICAL STATE; broader B2B commercial/payment activation NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Implementation release commit before governance sync:** `f792a76ad6c018675fdb4d781a3c1d56b42591bf` — `feat(admin): release approved mobile companion and auth hardening`
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-12-v16.md` as the active repository-state record. Historical Git state remains evidence only.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v17;
3. applicable canonical supplement for the active scope;
4. `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md` for released public mobile presentation;
5. `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md` for released public Pasokan vNext;
6. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.1.md` for locked B2B commercial/account/admin target architecture, interpreted together with actual implementation status;
7. applicable Product/Catalog, Testimonials/Share, Cart/B2C and Dedicated Line supplements;
8. Project Constitution v1.1 except explicit newer supersessions;
9. Execution Discipline v1.2;
10. verified database/deployment facts and actual source/Git state;
11. Git history only as historical evidence.

## 2. Public website — RELEASED / LOCKED

Protected public scopes remain unchanged:
- Homepage desktop and released mobile presentation;
- AYA Farm / TUMBUH;
- AYA Spice Haven / DIOLAH;
- AYA Snacks & Drinks / DINIKMATI;
- Product Catalog / Mobile Product Book V24;
- direct Product Detail;
- Testimonials public + Testimonial Share;
- Cart/B2C;
- Public Pasokan vNext;
- Information desktop + Information Mobile V18.

The Admin release does **not** reopen or redesign any public customer-facing region. Public CSS ownership and locked mobile references from v16 remain authoritative.

## 3. Admin Mobile Companion — RELEASED CANONICAL DIRECTION

The Admin mobile experience is now implemented as a mobile operational companion, not a desktop UI shrunk to phone width.

Implemented mobile modules:
- Ringkasan;
- Website / CMS;
- Produk;
- Pesanan / B2C;
- Pasokan / B2B;
- Testimoni;
- Keuangan;
- Akses;
- Riwayat;
- Sistem.

Interaction/visual rules retained from approved previews:
- warm premium AYA visual family;
- compact operational hierarchy;
- horizontally scrollable bottom navigation;
- no burger dependency for primary mobile navigation;
- top-right `×` for sheets;
- AYA-native choices/actions instead of browser-native select/dialog patterns where a choice UI is required;
- human-facing terminology instead of backend jargon;
- no fabricated system/commercial truth.

## 4. Admin auth / access hardening

The release includes the previously validated mobile auth hardening lineage and aligns access queries with the actual Role schema.

Canonical behavior:
- Admin app does not boot anonymously or through preview-auth bypass;
- authenticated session and Admin User active-state are required;
- mobile login delegates to the canonical auth flow;
- logout is a real Supabase sign-out/session exit;
- refresh behavior is explicit/deterministic;
- access architecture remains `Function Registry → Role → Admin User`;
- one Admin User may have multiple Roles and effective permissions are the union of Role functions;
- system-only functions are not assignable to human Roles;
- current logged-in Admin cannot deactivate itself from the active session;
- Role assignment changes preserve the invariant that an Admin User retains at least one Role.

Android smoke evidence from the user remains positive for login, logout, Product Master visibility and mobile navigation.

## 5. Domain ownership / editability

Admin editable scope remains **public-facing text + public-facing images**, but ownership stays in the domain that owns the content.

- Homepage / Lini AYA / Information / Global-brand editorial content → Website/CMS;
- Product/Catalog/Product Detail product text and product imagery → Product;
- Testimonials public/share media and testimonial copy → Testimonials;
- B2C customer/order operational state → B2C/backend;
- Pasokan/commercial/system truth → B2B/backend;
- Finance, Access, Audit and System stay in their own modules.

Layout, geometry, responsive rules, interaction logic, route destinations, ordering logic, validation, calculations, commercial rules and system truth remain code/backend-owned.

## 6. Important implementation boundaries

### Website / CMS
Text draft/publish uses the existing trusted CMS RPCs. Media registry is visible, but public image-slot binding is not falsely represented as complete when the Publish Layer relationship is not yet available.

### Product
Product Master remains the Admin identity authority. Public product data can be administered where backend actions already exist, but the locked storefront still uses `js/data.js` during migration; Admin edits must not be described as automatically changing the released public storefront until the Publish Layer migration is complete.

Product images remain Product-owned. Media replacement must not impersonate a public image change until the product-to-public asset binding exists.

### Testimonials
Moderation/approval remains backed by the existing testimonial system. Photo/Video Hasil Refine may be uploaded to internal Admin media. Foto has no lower-third; Video uses lower-third name + city/area. Text testimonials have no Media tab.

A signed/internal URL is never presented as a permanent public publish asset. Public photo/video publication waits for the trusted Publish Layer/permanent public media contract.

### Pesanan / B2C
Current canonical backend order statuses remain `received / reviewing / confirmed / cancelled / archived` and payment statuses remain backend-owned.

The approved future lifecycle `Masuk → Disiapkan → Dikirim → Selesai`, including unpaid 1×24h auto-cancel/archive behavior, is **not activated by frontend presentation** until backend schema/rules support it. Mobile therefore does not fabricate `Disiapkan`, `Dikirim` or `Selesai` state.

### Pasokan / B2B
Mobile Pasokan is monitoring-first. Human language is used for lifecycle/commitment/credit concepts. Relationship, qualification, cadence, delivery, invoice/payment and Kredit Pasokan truth remain backend-owned; there is no manual frontend override of trusted commercial state.

### Keuangan
Finance mobile remains monitoring-oriented: Tagihan, Pembayaran and Dana Masuk. `Paid != Settled` remains mandatory. Provider-backed payment activation remains disabled unless trusted provider integration is explicitly activated.

### Akses / Riwayat / Sistem
Mobile Akses focuses on Admin User + Role; heavy Function Registry configuration remains desktop-first. Riwayat is read-only operational audit presentation. Sistem is a compact health/status view, not a developer missing-feature tracker and not a source of fabricated live health.

## 7. Release validation

Clean implementation commit `f792a76ad6c018675fdb4d781a3c1d56b42591bf` is a single fast-forward child of prior canonical `main` `f02a9e50e3566e713f15272f4443dc39da7a226f`.

Its source delta is bounded to Admin only:
- `admin/access.js`;
- `admin/admin-mobile.css`;
- `admin/app-loader.js`;
- `admin/auth-mobile-bridge.js`;
- `admin/auth.js`;
- `admin/domain-refresh.js`;
- `admin/index.html`;
- new `admin/mobile-ui.js`.

No public customer-facing HTML/CSS/JS file is changed by this release.

The final mobile source passed JavaScript syntax validation before clean release construction. Temporary transport/workflow files used during bounded remote materialization are not part of the clean release tree.

Final implementation preview on Vercel reached READY state and served `/admin/` and the mobile runtime with `200 OK` under staging `noindex` protection before clean release construction.

## 8. Commercial truth remains unchanged

No part of this Admin release activates or fabricates:
- Production Launch;
- online DOKU/Midtrans payment;
- quotation/order/invoice truth not backed by trusted records;
- stock reservation;
- provider settlement;
- customer account history;
- B2B eligibility/qualification in browser state;
- delivery guarantee/capacity promise.

Public Pasokan remains locked. Cadence remains `W1 / W2 / M1 / M2`. Qualification and commercial state remain trusted-backend-owned.

## 9. Branch / PR state

The historical auth-hardening branch and Admin implementation branch are implementation evidence only after this release is fast-forwarded to `main`.

Partner Portal work remains a separate future phase and must be refreshed/validated against current canonical `main` before any integration. Do not merge older Partner work blindly.

## 10. Current work mode after this release

Allowed:
- Admin post-release parity/polish when explicitly reopened;
- read-only audit and runtime verification;
- completing missing Publish Layer/media bindings as a separate backend/data phase;
- future B2C lifecycle backend implementation;
- future Partner Portal/B2B account/backend/payment phase;
- public parity/polish only when the specific locked public region is explicitly reopened.

Not authorized:
- Production Launch;
- removing `noindex`;
- activating online payment merely because UI/foundation exists;
- activating broader B2B lifecycle merely because schema foundations exist;
- redesigning released public scopes;
- converting frontend state into commercial truth.

## 11. Next technical focus

After the Admin mobile release, the next work should be selected explicitly rather than automatically reopening scope. Natural candidates are:
- mobile Admin smoke/parity verification on real Android after canonical deployment;
- media Publish Layer / asset-slot binding completion;
- B2C lifecycle backend implementation;
- Partner Portal refresh against current `main`;
- broader B2B Account/Admin/Payment implementation phase.

# AYA RAOS — CURRENT STATE — 17 September 2026 v19

**Status:** Public site remains RELEASED / LOCKED on staging; Admin Mobile Companion remains canonical; Admin Auth runtime now serves Supabase JS locally from the AYA deployment to remove CDN dependency from the normal login/reset path; broader B2B commercial/payment activation remains NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Admin auth runtime hotfix commit before governance sync:** `f1d605fb49fdb6f50797946732368e5e33f34ce9` — `fix(admin): serve Supabase auth runtime locally`
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-17-v18.md` as the active repository-state record.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v19;
3. applicable canonical supplement;
4. Mobile Public UI supplement for released public mobile presentation;
5. B2B Commercial Architecture v1.1 for target B2B architecture;
6. Pasokan Usaha v2 for released public Pasokan;
7. Project Constitution v1.1 except explicit newer supersessions;
8. Execution Discipline v1.2;
9. verified runtime/database facts;
10. actual source + verified Git state.

## 2. Public site

All previously released/locked public scopes remain protected. This hotfix does not reopen or alter any customer-facing visual, interaction, commercial, or content scope.

Staging remains `noindex`. Production Launch remains unapproved.

## 3. Admin Mobile Companion

The approved Admin Mobile Companion remains canonical for:
- Ringkasan;
- Website/CMS;
- Produk;
- Pesanan/B2C;
- Pasokan/B2B;
- Testimoni;
- Keuangan;
- Akses;
- Riwayat;
- Sistem.

Mobile remains an operational companion, not a reduced desktop workspace. Human-facing terminology, approved mobile visual language, horizontal bottom navigation, and backend-truth boundaries remain unchanged.

## 4. Admin Auth hotfix — local Supabase runtime

Real-device Android smoke testing after the Admin Mobile release showed the login page could remain at `auth v26g · loading…`, leaving Login and Reset Password non-operational.

Verified diagnosis:
- the Admin HTML and same-origin `auth.js` were served correctly;
- the bootstrap was waiting for the external Supabase browser runtime;
- CDN dependency therefore remained a single point of failure on the affected mobile path.

Canonical correction:
- `@supabase/supabase-js` browser runtime version `2.111.0` is now vendored at `admin/vendor/supabase.min.js`;
- `admin/index.html` loads this local same-origin runtime before `admin/auth.js`;
- `admin/auth.js` still retains bounded loader fallback behavior but normal Admin auth no longer depends on jsDelivr/unpkg availability;
- Auth build identifier advances to `v26h` after the handler bootstrap completes.

## 5. Validation

Before clean release construction:
- vendored Supabase JS passed `node --check`;
- `admin/auth.js` passed `node --check`;
- `git diff --check` passed;
- hotfix preview deployment reached READY;
- preview `/admin/` returned `200 OK`;
- preview `/admin/vendor/supabase.min.js?v=2.111.0` returned `200 OK` from the AYA deployment;
- the runtime delta is bounded to `admin/auth.js`, `admin/index.html`, and new `admin/vendor/supabase.min.js`.

The temporary GitHub workflow used only to materialize the vendor runtime is not part of the clean release tree.

Real-device functional verification of Login and Reset Password remains the next smoke step after canonical deployment.

## 6. Commercial and system truth

No part of this hotfix activates or fabricates:
- Production Launch;
- online payment;
- provider settlement;
- B2B qualification/eligibility;
- quotation/order/invoice truth;
- stock reservation;
- delivery guarantees;
- broader B2B Account/Admin/Payment lifecycle.

Existing backend/system ownership rules remain unchanged.

## 7. Next action

After this hotfix reaches canonical `main`, perform real Android smoke verification:
1. confirm Auth badge progresses to `auth v26h · ready`;
2. test Login;
3. test Reset Password request;
4. only after those pass, continue the remaining Admin Mobile smoke checklist.

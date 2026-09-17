# AYA RAOS — CURRENT STATE — 17 September 2026 v20

**Status:** Public site remains RELEASED / LOCKED on staging; Admin Mobile Companion remains canonical; Admin Auth bootstrap no longer parser-blocks on the Supabase browser runtime; broader B2B commercial/payment activation remains NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Admin Auth bootstrap hotfix commit before governance sync:** `da2c8ada210a8c644358d8c56dd9e1b0b05235d0` — `fix(admin): remove parser-blocking auth runtime load`
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-17-v19.md` as the active repository-state record.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v20;
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

The approved Admin Mobile Companion remains canonical for Ringkasan, Website/CMS, Produk, Pesanan/B2C, Pasokan/B2B, Testimoni, Keuangan, Akses, Riwayat, and Sistem.

No Admin Mobile visual or interaction redesign is introduced by this hotfix.

## 4. Admin Auth bootstrap correction

Real-device Android smoke testing showed the login page could remain indefinitely at the static HTML badge `auth v26g · loading…` even after the Supabase browser runtime had been vendored locally.

Verified diagnosis:
- canonical HTML still loaded `admin/vendor/supabase.min.js` as a parser-blocking script before `admin/auth.js`;
- if that runtime load or parse stalled on the affected browser path, `auth.js` never started;
- therefore the timeout and fallback logic inside `auth.js` could never execute;
- this explains why the badge remained on the static HTML value instead of progressing to `ready` or `gagal memuat`.

Canonical correction:
- `admin/index.html` no longer loads the Supabase runtime directly before Auth;
- `admin/auth.js` always starts first after `config.js` and owns loading the local Supabase runtime through its bounded loader;
- the local runtime remains the first source, with existing bounded fallbacks retained;
- Auth script query version advances to `20260917-v26h2` for cache separation;
- the static badge now starts at `auth v26h · starting…`;
- a 25-second bootstrap watchdog changes the badge to `auth v26h · gagal memulai` if Auth handlers never bind, preventing an indefinite ambiguous loading state.

## 5. Validation

Before canonical release:
- hotfix branch is one commit ahead and zero behind the previous `main` before governance sync;
- implementation delta is limited to `admin/index.html`;
- Vercel preview deployment reached READY;
- preview `/admin/` returned `200 OK`;
- served preview HTML contains no parser-blocking Supabase script before `auth.js`;
- served preview HTML contains the `starting…` badge and bounded bootstrap watchdog;
- staging `noindex` remains intact.

Real-device Android Login and Reset Password remain the next smoke verification after canonical deployment.

## 6. Commercial and system truth

No part of this hotfix activates or fabricates Production Launch, online payment, provider settlement, B2B qualification/eligibility, quotation/order/invoice truth, stock reservation, delivery guarantees, or broader B2B Account/Admin/Payment lifecycle.

## 7. Next action

After canonical deployment on `main`:
1. reopen the Admin page on Android;
2. confirm the badge begins at `auth v26h · starting…` and progresses to `auth v26h · ready` or a bounded failure state;
3. test Login;
4. test Reset Password request;
5. continue the remaining Admin Mobile smoke checklist only after Auth passes.

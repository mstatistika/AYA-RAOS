# AYA RAOS — CURRENT STATE — 17 September 2026 v22

**Status:** Public site remains RELEASED / LOCKED on staging; Admin Mobile Companion remains canonical; Android Admin login is now verified working; Admin application bootstrap is corrected so `/admin` and `/admin/` both load the same Admin app runtime; broader B2B commercial/payment activation remains NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-17-v21.md` as the active repository-state record after the route-stable Admin application-loader hotfix reaches `main`.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v22;
3. applicable canonical supplement;
4. Mobile Public UI supplement for released public mobile presentation;
5. B2B Commercial Architecture v1.1 for target B2B architecture;
6. Pasokan Usaha v2 for released public Pasokan;
7. Project Constitution v1.1 except explicit newer supersessions;
8. Execution Discipline v1.2;
9. verified runtime/database facts;
10. actual source + verified Git state.

## 2. Public site

All previously released/locked public scopes remain protected. This hotfix does not alter customer-facing visual, interaction, content, or commercial behavior.

Staging remains `noindex`. Production Launch remains unapproved.

## 3. Admin Mobile Companion

The approved Admin Mobile Companion remains canonical for Ringkasan, Website/CMS, Produk, Pesanan/B2C, Pasokan/B2B, Testimoni, Keuangan, Akses, Riwayat, and Sistem.

No Admin Mobile visual redesign is introduced by this hotfix.

## 4. Real-device smoke result

Android smoke testing after CURRENT STATE v21 confirmed:
- Admin Auth progresses successfully;
- Admin login succeeds on the real device;
- the authenticated Ringkasan screen opens.

The next visible defect after successful login was not an Auth failure. The authenticated app shell showed Ringkasan content, but:
- the approved bottom navigation was absent;
- Refresh reported `Navigasi halaman aktif tidak ditemukan.`;
- the top `…` control did not expose the expected session/logout behavior;
- navigation into the other Admin modules was not available.

## 5. Verified post-login root cause

`admin/index.html` had already been corrected to load Admin scripts through absolute `/admin/...` paths, but `admin/app-loader.js` still fetched the canonical Admin application source through:

`./app.js?authBootstrap=20260825`

Because Vercel serves `/admin` directly as `200 OK` instead of redirecting to `/admin/`, that document-relative fetch can resolve to `/app.js` rather than `/admin/app.js`.

`app.js` is the source that builds the canonical Admin navigation, page routing, refresh targets, and authenticated session/logout handler. If it is not loaded, Auth can still succeed and Ringkasan Mobile can partially render, but the surrounding Admin navigation/session behavior is incomplete.

## 6. Canonical correction

`admin/app-loader.js` now fetches the Admin source through the route-stable absolute URL:

`/admin/app.js?authBootstrap=20260917-v27a`

`admin/index.html` cache-busts the application loader through:

`/admin/app-loader.js?v=20260917-v27a`

No other Admin UI design or public-site source is changed by this correction.

## 7. Validation

Before canonical release:
- release branch is a pure fast-forward from current `main`;
- implementation delta is exactly two Admin files before governance sync: `admin/app-loader.js` and `admin/index.html`;
- each implementation file changes by one line only;
- preview deployment for implementation commit `8f4bd0253c168990c581cf008ca6f6954b21317f` reached `READY`;
- preview `/admin` returned `200 OK` with staging `noindex` headers active;
- preview HTML serves `/admin/app-loader.js?v=20260917-v27a`;
- preview `/admin/app-loader.js?v=20260917-v27a` returned `200 OK` and contains the absolute `/admin/app.js?authBootstrap=20260917-v27a` source URL;
- preview `/admin/app.js?authBootstrap=20260917-v27a` returned `200 OK`.

## 8. Commercial and system truth

This hotfix does not activate or fabricate Production Launch, online payment, settlement, B2B qualification, quotation/order/invoice truth, stock reservation, delivery guarantees, or broader B2B Account/Admin/Payment lifecycle.

## 9. Next action

After canonical deployment, continue the Android Admin smoke test from the authenticated session:
1. confirm bottom navigation is visible;
2. open several Admin modules from the bottom rail;
3. test Refresh without a navigation error;
4. test the top session action and Logout;
5. continue module-by-module interaction/data smoke testing only after navigation/session behavior passes.

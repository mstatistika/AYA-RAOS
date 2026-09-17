# AYA RAOS — CURRENT STATE — 17 September 2026 v21

**Status:** Public site remains RELEASED / LOCKED on staging; Admin Mobile Companion remains canonical; Admin Auth route loading is corrected so `/admin` and `/admin/` resolve the same Admin runtime assets; broader B2B commercial/payment activation remains NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-17-v20.md` as the active repository-state record after the absolute-path Admin Auth hotfix reaches `main`.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v21;
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

## 4. Verified Auth routing root cause

Android smoke testing showed the Admin login page could reach `auth v26h · gagal memulai` even though the Auth source itself was available.

Verified route behavior before this correction:
- Vercel serves `/admin` directly with `200 OK` rather than forcing a redirect to `/admin/`;
- the Admin HTML/runtime still contained document-relative script paths such as `./auth.js` and the Auth loader contained `./vendor/supabase.min.js`;
- from a document URL ending in `/admin` without a trailing slash, those document-relative paths resolve outside the intended `/admin/` directory;
- direct verification showed root `/auth.js` returned `404`, while `/admin/auth.js` returned `200`.

This explains why Android login could work when the Admin page was entered through `/admin/` but fail through `/admin`.

## 5. Canonical correction

Admin runtime paths are now route-stable:
- `/js/config.js`
- `/admin/auth.js`
- `/admin/auth-mobile-bridge.js`
- `/admin/app-loader.js`
- `/admin/product-master.js`
- `/admin/b2b.js`
- `/admin/finance.js`
- `/admin/access.js`
- `/admin/domain-refresh.js`
- `/admin/mobile-ui.js`

The Auth loader also resolves the local Supabase browser runtime through:
- `/admin/vendor/supabase.min.js?v=2.111.0`

Auth build identifier advances to `v26i` so real-device verification can distinguish this route-stable build from v26h.

## 6. Validation

Before canonical release:
- branch is a pure fast-forward from current `main`;
- code delta is limited to `admin/index.html` and `admin/auth.js` before governance sync;
- preview deployment reached `READY`;
- preview `/admin` returned `200 OK`;
- preview `/admin/` returned `200 OK`;
- both preview entry points served the same absolute Admin runtime paths;
- preview `/admin/auth.js?v=20260917-v26i` returned `200 OK`;
- preview `/admin/vendor/supabase.min.js?v=2.111.0` returned `200 OK`;
- staging `noindex` headers remain active.

Real-device functional Login and Reset Password verification remains the immediate smoke step after canonical deployment.

## 7. Commercial and system truth

This hotfix does not activate or fabricate Production Launch, online payment, settlement, B2B qualification, quotation/order/invoice truth, stock reservation, delivery guarantees, or broader B2B Account/Admin/Payment lifecycle.

## 8. Next action

After canonical deployment:
1. open Admin from the same Android browser path previously failing;
2. confirm badge progresses from `auth v26i · starting…` to `auth v26i · ready`;
3. test Login;
4. test Reset Password request;
5. continue the remaining Admin Mobile smoke checklist only after Auth passes.

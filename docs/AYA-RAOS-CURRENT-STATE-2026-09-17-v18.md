# AYA RAOS — CURRENT STATE — 17 September 2026 v18

**Status:** PUBLIC PASOKAN vNEXT + PUBLIC MOBILE UI INCLUDING INFORMATION V18 RELEASED / LOCKED; Admin Mobile Companion RELEASED; Admin mobile auth loader hotfix VERIFIED; broader B2B commercial/payment activation NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`
**Canonical branch:** `main`
**Admin Mobile release commit:** `f792a76ad6c018675fdb4d781a3c1d56b42591bf`
**Admin Auth loader hotfix commit before governance sync:** `2fa02fd4faad16247ec99d2ac9a0c4f894337c96`
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-17-v17.md` as the active repository-state record. Historical Git state remains evidence only.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v18;
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

Protected public scopes remain unchanged. This Admin hotfix does not modify public customer-facing HTML/CSS/JS and does not reopen any public visual region.

Staging remains protected by `noindex`. Production Launch remains not approved.

## 3. Admin Mobile Companion — RELEASED

Released mobile modules remain:
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

Visual/interaction authority remains the approved mobile preview set recorded by v17. This hotfix does not redesign the Admin UI.

## 4. Admin auth loader incident — VERIFIED ROOT CAUSE / HOTFIX

Real-device Android smoke testing after the Admin Mobile release showed the login page rendering while both **Masuk** and **Forgot Password / Reset Password** were non-responsive.

Observed evidence:
- login UI rendered normally;
- the build badge remained at the static `auth v26f` state instead of the runtime `auth v26f · ready` state;
- therefore canonical auth handlers had not completed binding.

Verified source cause:
- `admin/index.html` loaded the Supabase UMD bundle from jsDelivr as a blocking external script **before** `admin/auth.js`;
- if that third-party CDN request stalled or was blocked on the device/network, the page body was already visible but `auth.js` never executed, leaving login/reset controls without runtime handlers;
- the fallback loader inside `auth.js` could not help because execution had not yet reached `auth.js`.

Hotfix:
- removed the blocking Supabase CDN script from `admin/index.html`;
- `auth.js` now owns Supabase client loading;
- loader tries jsDelivr and then unpkg with a bounded timeout instead of waiting indefinitely on one provider;
- loader failure now produces an explicit failed state rather than a visually normal but inert login form;
- build badge moved to `auth v26g` states (`loading`, `ready`, or failed) for real-device diagnosis;
- cache token updated so mobile browsers do not retain the old auth script.

Validation:
- `node --check admin/auth.js` passed;
- `git diff --check` passed;
- Vercel preview for the final hotfix tree reached READY;
- served `/admin/` returned `200 OK`;
- served HTML no longer contains a blocking Supabase CDN script ahead of `auth.js`;
- `noindex` protection remains active.

## 5. Admin auth / access invariants remain unchanged

The hotfix does not change authorization semantics:
- authenticated Supabase session is required;
- Admin User must exist and be active;
- Admin User must hold at least one Role;
- effective permissions are the union of Role functions;
- system-only functions remain non-assignable to humans;
- no preview-auth bypass is introduced;
- logout remains a real session exit;
- reset-password still uses the canonical Supabase recovery flow.

## 6. Commercial truth remains unchanged

No part of this hotfix activates or fabricates:
- Production Launch;
- DOKU/Midtrans payment;
- B2B eligibility/qualification in browser state;
- quotation/order/invoice/provider truth not backed by trusted records;
- stock reservation;
- delivery guarantees/capacity;
- broader Partner Account lifecycle.

Public Pasokan remains locked. `Paid != Settled` remains mandatory.

## 7. Current implementation boundary

The Admin Mobile release and auth hotfix are canonical implementation work only. Heavy desktop configuration remains desktop-first. Public storefront product truth remains transitional through `js/data.js` until the Publish Layer migration is explicitly completed.

Media/public asset bindings must not be represented as complete where backend/public-read relationships are still missing.

## 8. Current work mode

Allowed:
- real-device Admin smoke/parity verification;
- scoped Admin bug fixes discovered by that verification;
- read-only runtime/source audit;
- future Publish Layer/media binding work as a separate phase;
- future B2C lifecycle backend work;
- future Partner Portal/B2B Account/backend/payment phase after current `main` reconciliation.

Not authorized:
- Production Launch;
- removing `noindex`;
- public redesign;
- activating online payment merely because UI exists;
- converting frontend state into commercial truth.

## 9. Immediate next verification

After this hotfix is fast-forwarded to `main`, repeat Android smoke testing on the canonical staging alias:
1. confirm badge reaches `auth v26g · ready`;
2. confirm email/password fields accept input;
3. confirm invalid/empty login returns visible validation/error feedback;
4. confirm valid login enters Admin;
5. confirm Forgot Password requires an email and then gives visible submission feedback;
6. continue module-by-module mobile smoke testing only after auth is proven working.

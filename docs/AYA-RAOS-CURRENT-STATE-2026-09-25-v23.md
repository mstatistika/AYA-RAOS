# AYA RAOS — CURRENT STATE — 25 September 2026 v23

**Status:** Public site remains RELEASED / LOCKED on staging; Admin Mobile Companion remains canonical; Android Admin login and post-login navigation/refresh flow are user-verified working; the mobile session action now uses an explicit logout icon instead of the ambiguous ellipsis; branded Admin password-reset email design is LOCKED but custom SMTP/domain activation remains NOT ACTIVE; broader B2B commercial/payment activation remains NOT ACTIVE; staging remains `noindex`.

**Repository:** `mstatistika/AYA-RAOS`  
**Canonical branch:** `main`  
**Production Launch:** NOT APPROVED

> This document supersedes `docs/AYA-RAOS-CURRENT-STATE-2026-09-17-v22.md` as the active repository-state record after the approved Admin Mobile logout affordance correction is released.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. this CURRENT STATE v23;
3. applicable canonical supplement;
4. Mobile Public UI supplement for released public mobile presentation;
5. B2B Commercial Architecture v1.1 for target B2B architecture;
6. Pasokan Usaha v2 for released public Pasokan;
7. Project Constitution v1.1 except explicit newer supersessions;
8. Execution Discipline v1.2;
9. verified runtime/database/provider facts;
10. actual source + verified Git state.

## 2. Public site

All previously released/locked public scopes remain protected. This Admin-only correction does not alter customer-facing visual, interaction, content, or commercial behavior.

Staging remains `noindex`. Production Launch remains unapproved.

## 3. Admin Mobile real-device status

Following the v22 route-stable Admin bootstrap correction, the user confirmed on Android that the authenticated Admin experience is working, including the previously missing post-login experience. The remaining correction was semantic/visual: the top-right session action appeared as `…`, which reads as a generic menu rather than an explicit exit action.

The approved correction is intentionally narrow:
- Refresh remains the existing `↻` action;
- the session action remains in the same top-right button position and size;
- the `…` glyph is replaced by an explicit door + outward-arrow logout icon;
- the underlying button text remains `Keluar` for its accessible name;
- the existing authenticated logout behavior remains unchanged: Supabase `signOut()` followed by reload;
- no menu sheet, burger navigation, new route, or new session architecture is introduced;
- bottom navigation, Admin modules, desktop Admin, and all public UI remain unchanged.

## 4. Implementation

Implementation branch:
`fix/admin-mobile-explicit-logout-20260925`

Implementation changes relative to v22 `main`:
- `admin/admin-mobile.css`: replace the mobile `…` pseudo-element with an inline code-owned SVG logout glyph;
- `admin/index.html`: cache-bust `admin-mobile.css` to `v=20260925-v2` so Android/browser clients receive the corrected icon.

The runtime logout handler remains owned by the existing Admin application bootstrap and is not changed by this visual correction.

## 5. Validation before release

Verified before canonical promotion:
- branch base is canonical `main` SHA `267d0ecb02b5ce10acfb5b9b702e55b3c51585b8`;
- branch is ahead by exactly two implementation commits and behind by zero before governance sync;
- implementation diff contains exactly two files;
- each implementation file has exactly one line added and one line removed;
- Vercel preview for implementation HEAD `f69f1e9d0aa1e1b84b1e25e72cd637424f9e79fa` reached `READY`;
- preview `/admin` returns `200 OK` and serves `/admin/admin-mobile.css?v=20260925-v2`;
- preview CSS returns `200 OK` and contains the explicit logout SVG rule;
- `noindex` remains active on the preview.

Real-device confirmation of the final glyph remains the last visual smoke check after canonical deployment; this does not reopen the approved interaction/design direction.

## 6. Admin password-reset email — LOCKED design, inactive transport

The user approved the branded AYA reset-password email preview. Its visual/copy authority is now LOCKED:
- subject: `Reset Password Admin AYA`;
- AYA RAOS logo;
- cream / maroon / gold presentation;
- Indonesian copy;
- CTA: `Reset Password`;
- no Supabase branding in the email body;
- Supabase Auth remains owner of the recovery token/link and password-reset lifecycle.

Resend preparation exists for `ayaraos.com`, but the domain is not yet owned/verified for this project and remains `not_started`. Therefore:
- DNS verification is not complete;
- Resend sender activation is not complete;
- Supabase Custom SMTP is not activated with `@ayaraos.com`;
- the current working password-reset transport must not be represented as already migrated to Resend.

The safe future sequence remains: acquire/control domain → configure DNS → verify Resend domain → configure Supabase Custom SMTP → translate the LOCKED design into the Supabase Auth recovery template using the authoritative recovery URL → Android/end-to-end reset smoke test.

## 7. Commercial and system truth

This release does not activate or fabricate Production Launch, online payment, settlement, B2B qualification, quotation/order/invoice truth, stock reservation, delivery guarantees, or broader B2B Account/Admin/Payment lifecycle.

## 8. Next action

After canonical deployment:
1. confirm the explicit logout glyph is visible on Android;
2. tap it and confirm the authenticated session exits to the Admin login state;
3. keep the branded password-reset email transport pending until `ayaraos.com` is actually controlled and DNS verification can be completed.

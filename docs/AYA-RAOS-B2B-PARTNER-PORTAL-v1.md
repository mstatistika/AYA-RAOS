# AYA RAOS — B2B Partner Portal v1

**Route:** `/pasokan/partner`  
**Status:** Phase 1–3 foundation (shell + auth + activation + read-only dashboard)  
**Date:** 2026-08-23  
**Visual:** Operational Semesta AYA (cream / maroon / gold / serif) — dedicated `partner.css`, does not touch public `site.css`.

---

## What this delivers

| Phase | Capability | Status |
|-------|------------|--------|
| 1 | Shell at `/pasokan/partner`, email OTP auth, WA channel entry | Implemented |
| 2 | Activation: company + PIC + responsibilities → `aya_b2b_*` identity tables | Implemented (RPC) |
| 3 | Read-only dashboard: relationship, commercial summary, deliveries, Kredit Pasokan | Implemented |

**Not in scope (by design):**
- Creating commercial relationships / summaries from the partner side
- Qualification, invoices, payments, schedule generation
- Any browser-side commercial truth fabrication
- Public Pasokan inquiry changes (`business.html` remains locked)

---

## File map (copy into repo root)

```
pasokan/partner/
  index.html
  css/partner.css
  js/partner-auth.js
  js/partner-app.js

supabase/migrations/
  20260823220000_aya_b2b_partner_portal_foundation.sql
```

Optional: load site `js/config.js` instead of the inline fallback in `index.html` when integrated:

```html
<script src="/js/config.js?v=…"></script>
```

---

## Auth model

- **Primary:** Supabase email OTP (`signInWithOtp` → `verifyOtp`)
- **Secondary:** Phone/WA OTP (works only if Supabase Phone provider is configured; otherwise UI guides to email)
- Session storage key: `aya-partner-auth` (isolated from admin)
- Profile bootstrap via `aya_b2b_partner_bootstrap_v1`
- Activation via `aya_b2b_partner_activate_v1` (creates `draft` company + primary member)

Admin users and B2B partner users share the same Supabase project but **different identity tables**. Partner never gets admin RLS grants.

---

## Backend RPCs (migration)

| Function | Role | Purpose |
|----------|------|---------|
| `aya_b2b_partner_bootstrap_v1` | authenticated | Ensure profile row |
| `aya_b2b_partner_activate_v1` | authenticated | Company + membership |
| `aya_b2b_partner_snapshot_v1` | authenticated | Scoped read-only commercial snapshot |
| `aya_b2b_is_company_member_v1` | authenticated | RLS helper |

RLS grants **SELECT only** on commercial tables to members of the relevant company. No INSERT/UPDATE on relationships, summaries, deliveries, or credit ledger from partner role.

---

## Integration steps

1. Copy `pasokan/partner/` into the repo root (same level as `business.html`).
2. Apply migration `20260823220000_aya_b2b_partner_portal_foundation.sql` on staging Supabase.
3. Confirm Supabase Auth → Email OTP is enabled (default).
4. (Optional) Enable Phone provider if WA OTP is required in staging.
5. Deploy; open `https://<host>/pasokan/partner/`.
6. Smoke test:
   - Request OTP → verify → land on activation if no membership
   - Submit activation → land on dashboard
   - Dashboard empty states when `relationships = 0` (current staging truth)

---

## Governance alignment

- Single dedicated CSS for partner portal; public `site.css` untouched.
- Canonical commercial tables remain system-owned.
- Dashboard copy explicitly states empty state when no relationship exists (matches CURRENT-STATE: 0 relationships / 0 invoices).
- Qualification remains disabled publicly; partner portal does not surface qualification UI.

---

## Next increments (not this release)

- Link activation to existing Pasokan inquiry payload (optional match by email/phone)
- Confirmed-summary item line detail in dashboard
- Delivery timeline / event feed
- Notification preferences (email / WA channel)
- Magic-link deep link hardening for mobile

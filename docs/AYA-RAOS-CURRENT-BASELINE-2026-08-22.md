# AYA RAOS — Current Development Baseline — 22 Agustus 2026

**Status:** Public Pasokan vNext + Public Mobile UI released; post-release parity / polish.  
**Repository:** `mstatistika/AYA-RAOS`  
**Canonical branch:** `main`  
**Verified parent checkpoint before this governance sync:** `1d8acbaad0bb8b8af84e2c721464b155c1e3d31c`  
**Website state:** staging / `noindex`; Production Launch is not approved.

> Re-verify branch, HEAD, `origin/main`, and status before any mutation. The checkpoint above records verified history; it is not permission to assume Git has not moved.

## 1. Authority

Use this order:
1. latest explicit user approval/correction;
2. `AYA-RAOS-CURRENT-STATE-2026-08-22-v12.md` in active Project Resources;
3. applicable canonical supplement for the active scope;
4. `AYA-RAOS-MOBILE-PUBLIC-UI-CANONICAL-SUPPLEMENT-v1.md` for released mobile presentation;
5. `AYA-RAOS-B2B-COMMERCIAL-ARCHITECTURE-CANONICAL-SUPPLEMENT-v1.1.md` for approved target B2B commercial/account/admin architecture;
6. `AYA-RAOS-PASOKAN-USAHA-CANONICAL-SUPPLEMENT-v2.md` for current public Pasokan vNext;
7. applicable Product/Catalog, Testimonials/Share, Cart/B2C and Dedicated Line canonical supplements;
8. Project Constitution v1.1 except explicit newer supersessions;
9. Execution Discipline v1.2;
10. verified facts and actual source/Git state;
11. historical/recovery files only as evidence.

Historical files do not regain authority because they contain `LOCKED` or `APPROVED`.

## 2. Canonical release state

Public Pasokan vNext is released and protected.

Current released source boundary:
- `business.html`;
- approved Business block inside `css/site.css`;
- `js/business-inquiry.js`.

Public cadence vocabulary is only W1 / W2 / M1 / M2. Browser-side code does not calculate commercial eligibility. Trusted qualification/backend services remain separate and inactive until connected.

Broader B2B Commercial Architecture v1.1 remains APPROVED / LOCKED target architecture and is not made live by the public frontend release.

## 3. Public Mobile UI release

Approved mobile presentation applies at `max-width: 900px` only to:
- Homepage;
- Dedicated Line Pages;
- Product Catalog;
- Public Testimonials;
- Testimonial Share.

Final preview lineage:
- Homepage V3.7;
- Dedicated Lines V4.9;
- Catalog V5.31;
- Testimonials V6.5;
- Share V7.23.

Final mobile source boundary:
- `css/site.css`;
- `js/site.js`;
- `js/mobile-public-ui.js`.

`css/site.css` remains the single public-site stylesheet/design system. The temporary standalone mobile stylesheet was removed before release.

## 4. Protected / unchanged scopes

Protected unless explicitly reopened:
- desktop Homepage;
- desktop Dedicated Line Pages;
- desktop Product Catalog;
- Product Detail;
- Testimonials public;
- Testimonial Share;
- testimonial/Supabase/moderation contracts;
- Cart/B2C v16;
- Public Pasokan vNext;
- Information.

Information mobile remains PARKED.

Shared changes require zero-regression proof.

## 5. Preview → LOCK → implementation parity

Design/review happens in ChatGPT first.

For layout/interaction, use an HTML/browser preview. Once explicitly approved/LOCKED:
- the approved preview becomes visual + interaction authority;
- implementation is translation, not a second design phase;
- no new design interpretation is allowed during implementation;
- visible implementation drift is an implementation defect;
- fix implementation toward the LOCK rather than asking for the same design to be reviewed again.

This rule exists to prevent preview approval followed by a second visual-design cycle during source implementation.

## 6. Codespaces economy

Codespaces is not the default preview/review environment.

Use it only when safe actual-source mutation requires it, especially:
- scoped `css/site.css` mutation;
- another source mutation unavailable safely through current GitHub tooling;
- local runtime/build checks unavailable otherwise.

Routine preview iteration, remote-resolvable Git inspection and documentation housekeeping should not consume Codespaces quota.

Prefer one bounded Codespaces session for the smallest necessary mutation batch.

## 7. Stuck / long-loading recovery

If ChatGPT/tool execution stalls, times out, shows stopped thinking, or ends ambiguously, never infer completion.

Verify read-only first:
- branch;
- HEAD;
- `origin/main`;
- working tree/status when available;
- staged diff;
- changed paths;
- remote branch/commit comparison.

If a mutation command exits non-zero, determine zero-write vs partial-write state before another mutation attempt.

Avoid opaque mega-runs. Use bounded phases:
`audit/preflight → preview/LOCK → mutation → validation → commit/push → remote verify → governance if needed → main → housekeeping`.

## 8. Commercial truth

Do not fabricate or publicly promise:
- MOQ/capacity;
- special price;
- quotation/order/agreement/invoice IDs;
- payment/provider/Paid state;
- stock reservation;
- delivery guarantee;
- account/history state.

Frontend-only state never impersonates backend truth.

`Paid != Settled` remains mandatory commercial truth.

## 9. Open / parked items

Only when explicitly reopened:
- post-release parity/polish where actual implementation visibly drifts from a LOCK;
- Information mobile;
- Cart minor desktop item-count pill follow-up;
- broader B2B Account/Admin/Payment/backend implementation;
- Production Launch.

## 10. Release discipline

Release remains:
read-only preflight → implementation validation/commit/push/remote verify → governance sync only when needed → governance commit/push/remote verify → fast-forward `main` → verify `origin/main` → housekeeping separately.

No force update of `main`.

No Production Launch/noindex removal without explicit approval.

Historical evidence remains in Git/conversation history; active Project Resources should retain current authority rather than obsolete handoffs/recovery notes.

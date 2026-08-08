# Validation Report — AYA RAOS v1.5.0

## Automated source validation

Result:

```text
AYA RAOS Awareness → Response → Action v1.5.0 validator
PASS checks: YES
Errors: 0
Warnings: 0
```

Validated areas:
- required source files and local references;
- duplicate HTML IDs;
- staging `noindex` and Vercel noindex header;
- Homepage Awareness → Response → Action section order;
- master-brand-only first viewport;
- three line names and line landing-page hooks;
- QR context and `src` propagation;
- one `css/site.css` design system, no `!important`, no blanket `100svh`;
- catalog desktop filter placement;
- testimonial ticker animation;
- product variant keyboard focus-visible;
- WhatsApp/config gates;
- approved price signatures;
- protected Share form contract;
- Node syntax checks for JavaScript;
- governance/Decision Log synchronization.

## Protected integration hashes

The installer and validator reject changes to:
- `js/supabase-client.js`
- `js/testimonial-wizard.js`
- `js/order-api.js`
- `js/cart-page.js`
- `js/business-inquiry.js`
- `supabase/migrations/20260806153000_aya_phase2_order_foundation.sql`

## Installer / rollback simulations

Simulated on clean Git repositories created from:
1. current main v1.3 snapshot;
2. ecosystem v1.4.0 snapshot;
3. ecosystem v1.4.1 snapshot.

All simulations produced validator PASS and successful rollback. After rollback, tracked Git diff returned clean.

## Remaining acceptance gate

Browser visual QA is intentionally **not claimed as complete**. The execution environment blocks local Chromium access to localhost/file URLs. Static previews were rendered with a non-JavaScript print engine only as composition evidence.

Final acceptance must be performed in Codespaces browser at:
- 1366×768
- 1440×900
- 1024×768
- 390×844

No commit/push/merge should occur before that visual acceptance.

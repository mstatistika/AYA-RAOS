# Supabase boundary

The public runtime currently uses Supabase for the protected testimonial flow.

## Historical Phase-2 foundation

`migrations/20260806153000_aya_phase2_order_foundation.sql` is retained for migration/history safety. Its former order and recurring-business inquiry model is not the authority for current Pasokan vNext. Do not edit or delete the applied migration to retrofit newer rules.

## B2B core foundation

`migrations/20260822163000_aya_b2b_core_foundation.sql` is the additive backend foundation for the approved B2B Commercial Architecture v1.1. It introduces the trusted Product Master/B2B commercial boundary, canonical W1/W2/M1/M2 threshold storage, COGS/Supply Price/margin readiness checks, and a service-role-only qualification RPC.

Safety gates are intentional:

- public/anon/authenticated roles receive no direct access to the private B2B commercial tables or RPCs;
- COGS, margin, and Final Unit Price remain server-side only;
- seeded B2B measurements contain no invented private cost or price values and start `commercial_enabled = false`;
- qualification starts `qualification_enabled = false`;
- qualification aggregation policy starts `evaluation_scope = 'pending'` until that commercial interpretation is explicitly resolved;
- the existing public Pasokan frontend must not be wired to `/api/business/qualification` until the migration is applied, server environment variables are configured, commercial measurements are complete, and qualification is explicitly enabled.

The long-term public data path remains:

`AYA Admin Database → Publish Layer → Public Read Model/API → Website`

Do not expose service-role credentials, COGS, margin, customer-specific commercial state, payment state, flags, or audit data to browser JavaScript.

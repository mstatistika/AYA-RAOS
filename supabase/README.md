# Supabase boundary

The current public runtime uses Supabase for the protected testimonial flow.

The migration file `migrations/20260806153000_aya_phase2_order_foundation.sql` is retained for migration/history safety only. **Phase 1 does not activate order or B2B inquiry persistence.** Do not wire that schema back into public Cart or B2B flows unless the future order-database scope is explicitly reopened and approved.

Do not edit or delete applied migrations merely to change frontend capability state.

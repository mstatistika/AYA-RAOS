# AYA RAOS — Phase 2 Order Foundation

**Baseline main:** `84e92031007af2341e29d1eb6109681db999925c`
**Decision coverage:** through DL-587
**Environment:** staging / noindex

## Implemented

- B2C orders persisted through `create_aya_order_v1`;
- server-side catalog and price validation;
- idempotent Order ID generation;
- recurring B2B inquiries through `create_aya_business_inquiry_v1`;
- idempotent Business Inquiry ID generation;
- WhatsApp continuation only after successful persistence;
- operational service-role views;
- cleanup of obsolete release workflow and incorrect unused Bawang image.

## Not implemented

- shipping-rate integration;
- payment;
- inventory;
- automatic quotation;
- public order status;
- customer account;
- full admin and role matrix;
- Production Launch.

# AYA RAOS — Brand Ecosystem Hub v1.0

**Status:** Approved business direction / implementation preview
**Parent governance:** AYA-WMB-001 v1.5
**Baseline:** `main @ 0893aeaacc874694a3a24b4eb292d4e887f4ac5c`

## Purpose

AYA RAOS is the master-brand entry point. It must immediately explain that AYA RAOS = Ada Rasa and that it is the umbrella for three product lines.

## Locked architecture

```text
AYA RAOS — Ada Rasa
├── AYA Spice Haven
├── AYA Farm
└── AYA Snacks & Drinks
```

Sambal AYA remains the current hero product under AYA Spice Haven. Featuring Sambal AYA on the master homepage must not collapse the perception of AYA RAOS into a sambal-only brand.

## Line identity

- AYA RAOS: Heritage Maroon + Cream + Gold.
- AYA Spice Haven: Spice Red.
- AYA Farm: Farm Green.
- AYA Snacks & Drinks: Warm Amber / Burnt Orange.

All lines retain the same typography, Sunda framing language, interaction patterns, and master-brand connection.

## Entry architecture

Direct website entry:

```text
/ → AYA RAOS → choose line → product / order journey
```

Product QR entry:

```text
QR Sambal → spice.html?src=qr-sambal
QR Beras → farm.html?src=qr-beras
QR Snack/Drink → snacks.html?src=qr-<product>
```

QR destinations are line marketing gateways, not standalone brands. Every line page must expose a clear route back to AYA RAOS and the other lines.

## Marketing boundary

Each line may use a different marketing emphasis:

- Spice Haven: taste, aroma, pairing, sambal, spices, bumbu, lauk berbumbu.
- Farm: origin, primary products, agricultural/pastoral context, product readiness.
- Snacks & Drinks: occasion, sharing, convenience, frozen/ready-to-enjoy, drinks.

No line may introduce unsupported claims, unapproved pricing, capacity, certification, or availability.

## Implementation scope

1. Reframe homepage as Brand Ecosystem Hub.
2. Standardize master supporting identity to `ADA RASA`.
3. Add prominent three-line gateway on homepage.
4. Add dedicated `spice.html`, `farm.html`, and `snacks.html` landing pages.
5. Link catalog/product line labels back to line landing pages.
6. Keep all order, Supabase, testimonial, payment, shipping, and indexing capability gates intact.
7. Normalize the Snacks & Drinks public line name to `AYA Snacks & Drinks`.

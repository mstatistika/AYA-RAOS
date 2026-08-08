# AYA RAOS — Brand Ecosystem Hub

**Status:** Approved architecture / v1.5 Awareness → Response → Action refinement preview
**Parent governance:** AYA-WMB-001 v1.5
**Remote production baseline before this preview:** `main @ 0893aeaacc874694a3a24b4eb292d4e887f4ac5c`

## Purpose

AYA RAOS is the master-brand entry point and public Brand Ecosystem Hub. Direct visitors must first understand **who AYA RAOS is**, **why AYA RAOS = Ada Rasa**, and **why the ecosystem is divided into three lines** before the website asks them to choose a commercial response.

## Locked architecture

```text
AYA RAOS — Ada Rasa
├── AYA Spice Haven
├── AYA Farm
└── AYA Snacks & Drinks
```

Sambal AYA remains the current hero product under AYA Spice Haven. It is a conversion entry after ecosystem awareness, not the definition of the master brand.

## Homepage journey

```text
AWARENESS
AYA RAOS
→ why RAOS / Ada Rasa
→ why three lines
→ what the three lines are
→ understand each line

RESPONSE
→ explore products
→ recurring business supply
→ share an existing customer experience

ACTION
→ product/order path
→ Business Inquiry path
→ testimonial submission path
```

The first viewport uses the master palette and master-brand identity. It does **not** function as a three-line selector. This rule supersedes the earlier v1.4.1 first-viewport treatment.

## Line identity

- AYA RAOS: Heritage Maroon + Cream + Gold.
- AYA Spice Haven: Spice Red.
- AYA Farm: Farm Green.
- AYA Snacks & Drinks: Warm Amber / Burnt Orange.

Color names above are internal design-system terminology, not customer-facing copy. All lines retain the same typography, Sunda framing language, interaction patterns, and master-brand connection.

## Entry architecture

Direct website entry:

```text
/ → AYA RAOS awareness → line understanding → response → action
```

Product QR entry:

```text
QR Sambal → spice.html?src=qr-sambal
QR Beras → farm.html?src=qr-beras
QR Snack/Drink → snacks.html?src=qr-<product>
```

QR visitors may receive concise context explaining which line they entered and how that line belongs to AYA RAOS. QR source parameters may be preserved through line/product navigation without activating an analytics provider.

## Marketing boundary

Each line may use a different marketing emphasis:

- Spice Haven: taste, aroma, pairing, sambal, spices, bumbu, lauk berbumbu.
- Farm: origin, primary products, agricultural/pastoral context, product readiness.
- Snacks & Drinks: occasion, sharing, convenience, frozen/ready-to-enjoy, drinks.

No line may introduce unsupported claims, unapproved pricing, capacity, certification, or availability.

## Implementation boundary — v1.5

1. Make the Homepage Awareness-first.
2. Keep `AYA RAOS = Ada Rasa` as the master identity.
3. Explain why three lines exist before asking the visitor to choose one.
4. Keep `spice.html`, `farm.html`, and `snacks.html` as line marketing gateways.
5. Add entry-aware QR context on line pages without analytics activation.
6. Keep Sambal AYA as the current hero product after ecosystem awareness.
7. Treat testimonial submission as an advocacy conversion path.
8. Keep order persistence, Business Inquiry persistence, and protected testimonial logic intact.
9. Keep shipping, payment, analytics, indexing, and Production Launch inactive.
10. Browser QA on 1366×768, 1440×900, 1024×768, and 390×844 remains mandatory before commit/push approval.

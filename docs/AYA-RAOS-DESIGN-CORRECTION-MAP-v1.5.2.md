# AYA RAOS — Design Correction Map v1.5.2

**Scope:** Holistic Heritage Design Sweep  
**Baseline:** remote `main` @ `31036ee93bfe2fa255c7c40ca914c95d2da76c06`  
**Status:** Preview implementation; not committed or pushed  
**Governance:** DL-619 through DL-638

## 1. Global correction goals

1. One visual language across all approved public pages.
2. Remove repetitive trust/operational copy from awareness surfaces.
3. Reduce hard maroon/cream section cuts through consistent heritage transitions.
4. Make hierarchy obvious: identity → explanation → gateway → transaction.
5. Ensure product/media frames tolerate future proper photography without layout breakage.
6. Use full-card navigation for all gateway cards.
7. Keep all commerce/status claims tied to approved source data.
8. Preserve protected Share, Order API, Supabase, product pricing, and capability gates.

## 2. Global UI corrections

| Area | Correction |
|---|---|
| Utility bar | Removed from v1.5.2 public shell except protected Share, which is unchanged. |
| Header | Cleaner navigation hierarchy; integrated heritage corner treatment; mobile ornament reduction. |
| Eyebrows | One meaningful eyebrow per chapter; tiny repeated presentation labels removed. |
| Transition | Limited heritage seam/divider treatment; no unrelated transition language per section. |
| Cards | Signature / Gateway / Information grammar. |
| Typography | Body/functional copy kept readable; decorative microcopy only may remain small. |
| Images | Fixed aspect/crop/safe-area behavior; no broken media. |
| Footer | Minimal utility ending instead of repeated sitemap/CTA content. |
| Lead time | Contextual only, not repeated globally. |
| Accessibility | 44px target minimum where applicable, focus states, reduced motion, no color-only meaning. |

## 3. Homepage map

### Hero
- Left: `WILUJENG SUMPING`, `AYA RAOS. Ada Rasa.`, ecosystem explanation.
- Right: AYA mark, `SATU NAMA · TIGA DUNIA`, `RAOS`, prominent `RASA`, CTAs.
- No utility bar.
- Header ornament and Hero rails read as one system.

### Meaning & culture
- Viewport 1: meaning.
- Viewport 2: everyday culture.
- Same narrative chapter.

### Three functions / three lines
- Function is primary.
- Line name secondary.
- Entire card clickable.

### Response + Sambal
- One desktop composition.
- Response cards are full-surface gateways.
- Primary product CTA → Sambal Detail.
- Secondary product CTA → all-product Catalog.

### Closing
- No testimonial showcase.
- Discovery gateway to Product, Information, Pasokan Usaha, Testimoni.
- Minimal footer.

## 4. Catalog map

- Compact heritage Hero.
- `Pilihan rasa untuk meja Anda.` uses available horizontal space.
- Desktop first view includes search/sort/display, right filter, and five product cards.
- No truncated controls.
- Quick-add lives at image/body seam.
- Detail remains explicit.
- Photo slots use stable media ratio.

## 5. Testimonial map

### Viewport 1 — featured evidence
- Real video if available; otherwise photo expands.
- Video lower-third: name + location only.
- Photo display supports future quality-controlled artwork with quote already composed into the image.
- No profile thumbnail, fake rating, or public approval-language.

### Viewport 2 — moving stories
- Right-moving horizontal story rail.
- Story card image derives from internal product asset selected by product ID.
- CTA to Share route.

## 6. Information map

Persistent left navigation, with each destination packed into one desktop viewport:

- Cara Pesan
- Untuk Acara
- Pengiriman
- Pembayaran
- Pasokan Usaha
- FAQ
- Syarat
- Privasi

## 7. Pasokan Usaha map

- VP1 positioning / definition.
- VP2 examples / evaluation flow.
- VP3 three-step recurring-supply wizard.
- Inquiry only; no public quotation, MOQ, wholesale price, or checkout.

## 8. Cart map

- One desktop viewport.
- Left cart summary; right progressive gateway.
- Data → Pengiriman → Ringkasan → Konfirmasi.
- Event context: PIC + WhatsApp once only.
- Primary first-step CTA: `Lanjut Pengiriman`.

## 9. Line landing pages

Each line uses:

1. identity composition;
2. product-discovery composition.

Product cards show Detail only; no price. Closing returns to Homepage three-line section.

## 10. Product Detail

1. **Product Decision:** gallery, variant prices, quantity, subtotal, Add to Cart.
2. **Product Understanding:** verified product information, one-time event context, ecosystem return.

## 11. Responsive rule

Desktop composition targets are design targets, not blanket viewport CSS. Mobile/tablet stack naturally and retain clear conversion order.

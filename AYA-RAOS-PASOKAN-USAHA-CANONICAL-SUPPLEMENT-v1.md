# AYA RAOS — PASOKAN USAHA CANONICAL SUPPLEMENT v1

**Approved:** 16 Agustus 2026
**Implementation checkpoint:** `a779b6e`
**Scope status:** FINAL VISUAL / UX / BEHAVIOR LOCK

## 1. Authority

This supplement governs Pasokan Usaha.

It must be read together with the latest current baseline, Project Constitution and Execution Discipline.

Do not change Pasokan Usaha while fixing another scope unless explicitly reopened.

## 2. Business definition

Pasokan Usaha is a **recurring-supply inquiry**.

It is not determined by order quantity.

Rules:

- one-time purchase = B2C;
- recurring supply need = Pasokan Usaha;
- a large one-time order remains B2C;
- inquiry is not an order;
- inquiry is not a quotation;
- inquiry is not a capacity guarantee;
- inquiry does not publish wholesale pricing or MOQ commitments.

Public copy avoids unnecessary B2B/B2C jargon and speaks in terms of the customer's actual recurring need.

## 3. Approved page structure

Desktop public structure is three VPs:

1. Intro;
2. Ritme Usaha;
3. unified workspace.

VP1 and VP2 use the approved Homepage-style Scroll cue.

No page-number counter is used.

Mobile uses normal vertical document flow.

## 4. VP1 — Intro

Approved headline:

`Bangun hubungan pasokan, bukan sekadar pesanan besar.`

The page explains that recurring need matters more than order size.

The trust note explicitly states that the inquiry is not yet:

- an order;
- a price offer;
- a guarantee of availability.

The trust note uses the approved premium maroon editorial box.

## 5. VP2 — Ritme Usaha

Approved editorial idea:

`Setiap usaha punya ritme.`<br>
`Kebutuhan pasokan pun berbeda.`

The eight recurring-need concepts are:

- Produk;
- Varian;
- Perkiraan jumlah;
- Frekuensi;
- Waktu mulai;
- Lokasi;
- Konteks usaha;
- Catatan kebutuhan.

## 6. VP3 — Unified workspace

VP3 keeps one stable left editorial narrative and one stable warm-ivory workspace.

Internal states:

1. Kebutuhan produk;
2. Informasi kontak;
3. Ringkasan kebutuhan.

The left narrative uses:

- Susun kebutuhanmu;
- Lengkapi konteks usahamu;
- Periksa & mulai percakapan.

Active state may receive restrained emphasis.

The workspace changes in place rather than navigating to another VP.

## 7. Product requirement state

The user can add multiple unique products.

Columns:

- Produk;
- Varian;
- Perkiraan kebutuhan;
- Satuan;
- Frekuensi.

Rules:

- no duplicate product row;
- no product-name heuristic for units;
- zero variants → canonical `Original`;
- one variant → shown locked;
- multiple variants → dropdown;
- product list itself may scroll when needed;
- page/workspace footer remains stable.

There is no `Kembali ke Ritme Usaha` CTA in this state.

## 8. Supply metadata

Pasokan supply metadata lives in:

`window.AYA_BUSINESS_SUPPLY`

inside `js/data.js`.

This metadata is separate from B2C product/price logic.

Current approved supply vocabulary includes:

- Sambal → Botol;
- Bawang Goreng → Pouch / Toples / Kg;
- Rendang → g / Kg;
- Ayam Paket 4 pcs → Ekor;
- Ayam Satuan 1 pcs → Pcs;
- Ayam Kulit/Ceker → g / Kg;
- Dimsum → Paket / Pouch / Toples / Kg;
- Kacang Tanah → Toples / Pouch / Kg;
- Kacang Mede → g / Kg;
- Es Buah → ml / Liter.

These are inquiry choices.

They do not mean:

- public MOQ;
- guaranteed production configuration;
- guaranteed availability;
- guaranteed capacity;
- wholesale commitment.

Future Admin may manage this configuration without redesigning the public Pasokan experience.

## 9. Perkiraan quantity

Global Pasokan quantity step:

`5`

This is intentionally an inquiry strategy.

The field is **Perkiraan kebutuhan**, not a final confirmed quantity.

Meaning:

- the website captures an initial estimate;
- increments of 5 encourage a meaningful recurring-supply inquiry;
- the value is not MOQ;
- the value is not an order commitment;
- management/admin evaluates the actual need after submission.

This rule applies across packaging, count, weight and volume units.

## 10. Frequency

Frequency belongs to each selected product.

Approved choices:

- Setiap hari;
- Setiap minggu;
- Setiap 2 minggu;
- Setiap bulan;
- Lainnya.

`Lainnya` supports custom context.

## 11. Contact state

Required review context:

- Nama usaha / organisasi;
- Nama PIC;
- Nomor WhatsApp;
- Waktu mulai / target kebutuhan;
- Lokasi pengiriman / area;
- consent.

Optional:

- Email;
- Catatan kebutuhan.

Internal back action:

`← Kembali ke kebutuhan produk`

## 12. Contact validation

Approved validation pattern is inline.

For each invalid field:

- restrained red border;
- subtle red-tinted field surface;
- concise error at the right side of the field label;
- error clears when corrected.

Examples:

- `Wajib diisi`;
- `Format email tidak valid`;
- `Nomor belum valid`.

Consent has its own local validation:

`Persetujuan perlu dicentang`

There is no large visible global Contact error box.

## 13. Review state

Review displays:

- selected products;
- variant;
- estimated quantity;
- unit;
- frequency;
- contact/business context.

The user must explicitly confirm the final review consent before continuing.

Internal back action:

`← Kembali ke informasi kontak`

Summary behavior:

- 1–3 product cards remain fully visible without list scrolling where geometry allows;
- 4+ product summary list may scroll;
- opening Review resets summary list to top;
- footer must never be clipped.

## 14. Draft persistence

Draft key:

`ayaRaos.businessDraft.v2`

Draft persistence is local browser storage only.

If local storage fails, the open form remains usable and a truthful visible state is shown.

This is not an inquiry/order database.

## 15. Final WhatsApp flow

Final CTA:

`Mulai percakapan via WhatsApp`

Destination uses:

`AYA_CONFIG.whatsappNumber = 628562646444`

The WhatsApp message carries structured Pasokan context.

Submission does not create:

- order ID;
- quotation;
- final price;
- approved supply agreement;
- capacity guarantee.

AYA/admin reviews the inquiry after contact begins.

## 16. Visual lock

Pasokan inherits Semesta AYA RAOS design logic:

- premium;
- warm;
- editorial;
- trustworthy;
- non-flat major surfaces;
- atmospheric maroon;
- warm material ivory;
- restrained depth.

Dedicated assets are canonical under:

`assets/visual/business-lock/`

Do not replace those assets or restyle this scope while another area is being fixed.

## 17. Lock boundary

Protected after approval:

- `business.html` structure/visual/UX;
- Business block in `css/site.css`;
- `js/business-inquiry.js` behavior;
- `AYA_BUSINESS_SUPPLY` public configuration contract;
- `assets/visual/business-lock/`.

Future admin tooling may manage Pasokan metadata, classification and follow-up without reopening the approved public experience unless public behavior itself changes.

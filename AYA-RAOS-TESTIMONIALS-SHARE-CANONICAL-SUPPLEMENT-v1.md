# AYA RAOS — TESTIMONIALS + SHARE CANONICAL SUPPLEMENT v1

**Approved:** 15 Agustus 2026
**Implementation checkpoint:** `c11e538`
**Scope status:** FINAL VISUAL / UX LOCK

## 1. Authority

This supplement governs the approved Testimonials public page and Testimonial Share experience.

Do not modify this scope while fixing another scope unless explicitly reopened.

## 2. Semesta AYA RAOS — Design Doctrine

Testimonials + Share are the strongest approved reference for the visual logic of **Semesta AYA RAOS**.

The rule is not to copy their layout. The rule is to inherit their design logic:

- premium, warm, editorial, trustworthy;
- large surfaces must never feel like flat painted rectangles;
- atmosphere/materiality is part of brand identity;
- maroon/red surfaces use restrained heritage depth, warm light, tonal variation and subtle material texture;
- cream/white surfaces use warm ivory light, parchment-like materiality, subtle grain and edge depth;
- negative space remains calm but inhabited by light/material;
- effects stay subordinate to content;
- each Line/Dunia derives from this Semesta and then adds its own visual vocabulary.

This observation does not reopen Homepage.

## 3. Public Testimonials — FINAL LOCK

Desktop composition: **20 / 40 / 40**.

### Left 20 — editorial brand layer

- atmospheric maroon surface;
- kicker `CERITA PELANGGAN AYA`;
- headline `Cerita rasa dari meja mereka.`;
- supporting copy explains video, photo and short stories;
- moderation note remains visible;
- no unnecessary ornament competing with the copy.

### Middle 40 — motion / human connection

- video occupies the dominant upper area;
- empty video state is branded/atmospheric, not blank;
- approved videos auto-advance after ending;
- `Lihat semua video` only when multiple videos exist;
- lower area is a slow vertical story reel;
- text testimonial = customer text + selected product image;
- reel pauses on hover/focus and becomes static for reduced motion.

### Right 40 — pause + participation

- photo testimonial occupies the dominant upper area;
- photo testimonial is final admin-composed artwork;
- frontend MUST NOT overlay quote/name again;
- photo carousel uses calm crossfade rhythm;
- fallback is branded atmosphere, never invented testimonial content;
- bottom CTA is the approved compact cream composition;
- CTA heading: `Sekarang giliran ceritamu.`;
- CTA button: `BAGIKAN CERITAMU`.

### Data rules

- preserve real testimonial records, identities, locations, approval states and moderation flow;
- never invent testimonial content, counts, clients or approval claims;
- photo = final artwork;
- text = text + selected product image;
- video = lower-third name + city/area.

## 4. Share Experience — FINAL LOCK

Share is one premium workspace, not a multi-page review journey.

### Surface language

- left: atmospheric maroon;
- main workspace: premium warm ivory/cream;
- restrained material grain, ambient light and edge depth;
- no large flat surface.

### Left editorial/navigation

Stages:

`Tentang kamu → Ceritamu → Kirim`

Only the current context receives active emphasis.

### About customer

- visible name + city/area required;
- WhatsApp optional/private;
- helper under WhatsApp: `Tidak ditampilkan kepada publik.`;
- product selection required and sourced from canonical product data.

### Story format

`Tulisan / Foto / Video` are three horizontal tabs.

The workspace below keeps a stable visual baseline.

#### Tulisan

- selected product companion is visible;
- product image/name come from canonical product data;
- before selection use truthful branded placeholder/instruction.

#### Foto

- large inspectable preview;
- link field remains available;
- filename/size + Ganti/Hapus belong to media preview;
- written context helper remains available.

#### Video

- large inspectable preview;
- link + audio-status align with preview;
- uploaded files may be checked for audio;
- external video links must not claim automatic audio detection;
- filename metadata belongs to preview, not audio status.

### Story + consent

- textarea remains large and stable;
- consent is directly below story;
- missing-consent validation appears directly below consent;
- no distant/global consent error.

## 5. Final submit flow

There is **NO customer-facing Review page**.

Approved flow:

`Fill form → consent → Kirim untuk Ditinjau → confirmation modal → Ya, kirim → success`

The modal:

- creates a deliberate pause;
- summarizes only key facts;
- `Kembali cek` returns to unchanged form;
- `Ya, kirim` uses canonical upload/Supabase submission;
- it does not recreate a full Review page.

## 6. Data / backend protection

Preserve:

- Supabase upload;
- RPC/submission contract;
- moderation;
- approval workflow;
- real testimonial data.

Do not weaken backend-required text rules without explicit backend change.

Visible failure states remain required.

## 7. Lock boundary

Protected:

- `testimonials.html`;
- public testimonial rendering behavior;
- `share.html`;
- final Share customer journey;
- testimonial/share CSS and JS required for this experience;
- real data/integration/moderation/approval flow.

Future shared changes must prove zero regression.

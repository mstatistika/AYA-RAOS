# AYA RAOS — Decision Log

## 2026-08-01 — QA Sweep 1

- Header dan footer menggunakan `index.html` sebagai source of truth.
- Halaman detail produk memiliki fallback heading sebelum JavaScript aktif.
- Ringkasan checkout menggunakan struktur form semantik.
- Pilihan produk pada form testimoni bersumber dari `js/data.js`.
- Form testimoni menggunakan honeypot sederhana.
- Select pengiriman menggunakan value terstruktur.
- Anchor Cerita AYA dipisahkan dari halaman Testimoni.
- Halaman 404 menggunakan shell navigasi website yang konsisten.

## 2026-08-01 — Staging Hardening

- DL-078: Domain Vercel digunakan sebagai lingkungan staging.
- DL-079: Staging memakai `noindex`, `nofollow`, dan `noarchive`.
- DL-080: Canonical URL dan sitemap publik ditunda sampai custom domain dikunci.
- DL-081: Audit dead CSS harus mempertimbangkan penggunaan dari HTML dan JavaScript.
- Metadata Open Graph dasar dipasang tanpa `og:url` dan canonical final.
- `robots.txt` dan `X-Robots-Tag` memblokir indexing selama staging.

## 2026-08-01 — UX and Supabase Foundation

- DL-082: Halaman testimoni dipisahkan dari form pengiriman.
- DL-083: `share.html` menjadi halaman khusus submit testimoni.
- DL-084: Format testimoni memakai conditional radio options.
- DL-085: AYA memakai project Supabase yang sudah tersedia.
- DL-086: Objek database AYA memakai prefix `aya_`.
- DL-087: Public submission dilakukan melalui RPC, bukan direct table insert.
- DL-088: Visitor hanya dapat membaca testimoni berstatus approved melalui RPC.
- DL-089: Submission staging dan production dipisahkan dengan field `environment`.
- DL-090: Bucket `aya-testimonial-media` dibuat private.
- DL-091: Upload file langsung belum diaktifkan; media MVP memakai URL HTTPS.
- DL-092: Information anchor memakai scroll margin dan active navigation.
- DL-093: Kartu katalog menyediakan aksi Detail dan quick-add secara terpisah.

## 2026-08-02 — Testimonial Wizard V2

- DL-109: Share Testimonial menggunakan progressive disclosure.
- DL-110: Alur dibagi menjadi Tentang Anda, Cerita Anda, dan Tinjau & Kirim.
- DL-111: Halaman Share memakai JavaScript khusus `testimonial-wizard.js`.
- DL-112: `testimonials.js` tidak lagi mengendalikan form Share.
- DL-113: Success state menggantikan form setelah submission berhasil.
- DL-114: Supabase schema dan RPC tidak diubah.

## 2026-08-02 — Testimonial Media Wizard

- DL-116: Sidebar desktop diperkecil agar panel kerja mendapat ruang lebih besar.
- DL-117: Ketiga langkah memakai satu pola navigasi: `Kembali` untuk langkah sebelumnya dan `Kembali ke Testimoni` untuk keluar dari wizard.
- DL-118: Langkah pertama memakai information strip agar panel tidak terasa kosong.
- DL-119: Catatan privasi hanya tampil di sidebar dan menggunakan copy singkat.
- DL-120: Langkah kedua memakai layout media dan cerita berdampingan pada desktop.
- DL-121: Foto mendukung upload langsung atau link HTTPS dengan batas 8 MB untuk upload.
- DL-122: Video mendukung upload langsung atau link HTTPS dengan batas 40 MB untuk upload.
- DL-123: Preview media memakai modal yang dapat ditutup melalui tombol, backdrop, atau Escape.
- DL-124: File baru diunggah ketika submit final dilakukan.
- DL-125: Upload media menggunakan bucket private `aya-testimonial-media`.
- DL-126: Target desktop utama adalah satu viewport pada 1366 × 768 tanpa mengecilkan tipografi secara ekstrem.


## 2026-08-02 — Testimonial Media Flow V2

- DL-127: Catatan privasi dipindahkan dari sidebar ke action bar. Keputusan ini menggantikan DL-119.
- DL-128: Format Tulisan tidak menampilkan workspace media.
- DL-129: Tombol upload langsung membuka file picker tanpa dropzone tambahan.
- DL-130: Field link hanya tampil setelah pengguna memilih `Tempel link`.
- DL-131: Format, media, review, validasi, dan payload Supabase memakai satu state JavaScript.
- DL-132: Review menyembunyikan kartu media sepenuhnya untuk format Tulisan.
- DL-133: Success state menggantikan seluruh sidebar, form, dan action bar.
- DL-134: Layout desktop dituning ulang agar setiap langkah muat dalam satu viewport 1366 × 768.

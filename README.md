# AYA RAOS Website — Package 02

Paket ini memperbaiki starter sebelumnya agar sesuai dengan guideline yang sudah disepakati:

- Homepage tetap ringkas dan premium.
- Produk lengkap dipindahkan ke halaman katalog terpisah.
- Setiap produk dapat dibuka ke halaman detail.
- Pelanggan dapat memilih beberapa produk ke keranjang sebelum finalisasi.
- Finalisasi pesanan dilakukan melalui WhatsApp.
- Testimoni dibagi menjadi video, big picture, dan text-only auto-scroll.
- Form testimoni memakai status `pending` dan tidak langsung dipublikasikan.
- Footer terang/off-white agar tidak terasa berat.
- Seluruh project memakai HTML, CSS, dan JavaScript statis tanpa build process.

## Struktur file

```text
index.html            Homepage
products.html         Katalog seluruh produk
product.html          Detail produk berbasis query ?id=
cart.html             Keranjang dan finalisasi WhatsApp
testimonials.html     Tiga format testimoni + form submit
about.html            Cerita dan arsitektur brand
information.html      Cara pesan, pengiriman, FAQ, syarat, privasi
404.html              Halaman error
css/site.css          Seluruh design system dan responsive layout
js/config.js          Nomor WhatsApp dan endpoint testimoni
js/data.js            Data produk dan testimoni approved
js/site.js            Navigasi, cart storage, WhatsApp helper
js/catalog.js         Search, filter, dan quick add
js/product.js         Render halaman detail produk
js/cart-page.js       Pengelolaan keranjang
js/home.js            Auto-scroll testimoni tulisan
js/testimonials.js    Pengiriman form testimoni
assets/images/        Foto produk dan aset testimonial
```

## 1. Konfigurasi WhatsApp

Buka `js/config.js` dan isi nomor WhatsApp:

```js
window.AYA_CONFIG = {
  whatsappNumber: "6281234567890",
  instagramUrl: "https://instagram.com/aya.spice.haven",
  businessName: "AYA RAOS",
  leadTime: "2–3 hari setelah pembayaran dikonfirmasi",
  testimonialEndpoint: ""
};
```

Nomor memakai format internasional tanpa `+`, spasi, atau strip.

## 2. Mengubah produk

Edit `js/data.js`. Produk memiliki field:

- `id`
- `name`
- `line`
- `lineKey`: `spice`, `farm`, atau `snack`
- `category`
- `image`
- `badge`
- `available`
- `description`
- `details`
- `shipping`
- `storage`
- `shelfLife`
- `variants`

Jika foto belum tersedia, isi `image: ""`. Website akan menampilkan placeholder tanpa membuat klaim visual palsu.

## 3. Sistem testimoni

Saat `testimonialEndpoint` masih kosong, form menyimpan metadata kiriman sebagai `pending` di `localStorage` browser untuk kebutuhan preview. File media tidak disimpan lokal.

Agar testimoni benar-benar masuk ke sistem admin, isi `testimonialEndpoint` dengan endpoint yang menerima `multipart/form-data`. Endpoint kemudian harus:

1. Menyimpan kiriman sebagai `pending`.
2. Menyediakan approval/reject di MStatistika Admin.
3. Mengembalikan hanya testimoni `approved` ke website publik.

## 4. Menjalankan lokal

```bash
python3 -m http.server 8080
```

Buka `http://localhost:8080`.

## 5. Upload ke GitHub dan Vercel

Upload **seluruh isi folder ini**, bukan folder pembungkusnya, ke root repository branch `main`.

Pengaturan Vercel:

- Framework Preset: `Other`
- Build Command: kosong
- Output Directory: `.`

## Catatan penting

- Nomor WhatsApp sengaja belum diisi.
- Foto yang belum tersedia menggunakan placeholder.
- Informasi masa simpan dan penyimpanan yang belum terverifikasi tidak dibuat-buat; website menampilkan bahwa detail dikonfirmasi saat pemesanan.
- Nama domain dan canonical URL belum dimasukkan karena domain final belum diputuskan.

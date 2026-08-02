window.AYA_CONFIG = Object.freeze({
  // Nomor WhatsApp dalam format internasional,
  // tanpa tanda +, spasi, atau strip.
  whatsappNumber: "628562646444",

  instagramUrl: "https://www.instagram.com/aya.spice.haven/",
  instagramHandle: "@aya.spice.haven",
  businessName: "AYA RAOS",
  leadTime: "2–3 hari setelah pembayaran dikonfirmasi",

  /*
    Tarif extra charge disimpan sebagai konfigurasi bisnis.
    Nilai "pending" berarti tarif resmi belum dimasukkan ke source preview.
    Saat tarif tersedia, cukup ganti dengan angka tanpa mengubah UI wizard.
  */
  businessExtraCharges: Object.freeze([
    Object.freeze({ id: "hampers", name: "Kemasan hampers", price: "pending" }),
    Object.freeze({ id: "custom-label", name: "Custom label", price: "pending" }),
    Object.freeze({ id: "greeting-card", name: "Kartu ucapan", price: "pending" })
  ]),

  /*
    Browser hanya memakai publishable key.
    Jangan pernah menaruh service-role key,
    database password, atau secret lain di sini.
  */
  supabase: Object.freeze({
    url: "https://zysxhtlbfgqaymgwbjaq.supabase.co",
    publishableKey: "sb_publishable_WyTnT4aUSaYybXpo1a0gNQ_PPbTcRQb",
    environment: "staging",
    timeoutMs: 20000
  }),

  /*
    Dipertahankan untuk kompatibilitas lama.
    Submission utama sekarang menggunakan
    Supabase RPC.
  */
  testimonialEndpoint: ""
});

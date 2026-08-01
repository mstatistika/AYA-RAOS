window.AYA_CONFIG = Object.freeze({
  // Nomor WhatsApp dalam format internasional,
  // tanpa tanda +, spasi, atau strip.
  whatsappNumber: "",

  instagramUrl: "https://www.instagram.com/aya.spice.haven/",
  instagramHandle: "@aya.spice.haven",
  businessName: "AYA RAOS",
  leadTime: "2–3 hari setelah pembayaran dikonfirmasi",

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

window.AYA_CONFIG = Object.freeze({
  whatsappNumber: "628562646444",
  instagramUrl: "https://www.instagram.com/aya.spice.haven/",
  instagramHandle: "@aya.spice.haven",
  businessName: "AYA RAOS",
  leadTime: "2–3 hari setelah pembayaran diterima",
  serviceArea: "Lippo Utara, Jabodetabek, lalu Indonesia sesuai produk dan metode kirim",
  environment: "staging",
  checkout: Object.freeze({ mode: "whatsapp-confirmation", orderPersistence: false }),
  businessSupply: Object.freeze({ enabled: true, persistence: false }),
  shipping: Object.freeze({ enabled: false, provider: "", source: "" }),
  payment: Object.freeze({ enabled: false, provider: "" }),
  readyStock: Object.freeze({ enabled: false }),
  bulkPricing: Object.freeze({ enabled: false }),
  promotion: Object.freeze({ enabled: false }),
  damagePolicy: Object.freeze({ enabled: false }),
  supabase: Object.freeze({
    url: "https://zysxhtlbfgqaymgwbjaq.supabase.co",
    publishableKey: "sb_publishable_WyTnT4aUSaYybXpo1a0gNQ_PPbTcRQb",
    environment: "staging",
    timeoutMs: 20000
  }),
  testimonialEndpoint: ""
});

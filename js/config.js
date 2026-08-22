window.AYA_CONFIG = Object.freeze({
  whatsappNumber: "628562646444",
  instagramUrl: "https://www.instagram.com/aya.spice.haven/",
  instagramHandle: "@aya.spice.haven",
  businessName: "AYA RAOS",
  leadTime: "2–3 hari setelah pembayaran diterima",
  serviceArea: "Lippo Utara, Jabodetabek, lalu Indonesia sesuai produk dan metode kirim",
  environment: "staging",
  // Integration Preview only: the AYA mark opens the real Admin Platform without a login form.
  previewAdminBypass: true,
  previewAdminUserId: "c8b72460-9c4e-4f93-8916-cb8c4f131831",
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

window.AYA_CONFIG = Object.freeze({
  whatsappNumber: "628562646444",
  instagramUrl: "https://www.instagram.com/aya.spice.haven/",
  instagramHandle: "@aya.spice.haven",
  businessName: "AYA RAOS",
  leadTime: "2–3 hari setelah pembayaran diterima",
  serviceArea: "Lippo Utara, Jabodetabek, lalu Indonesia sesuai produk dan metode kirim",
  environment: "staging",
  previewAdminBypass: false,
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
    publishableKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inp5c3hodGxiZmdxYXltZ3diamFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MTI3MjksImV4cCI6MjEwMDA4ODcyOX0.k0tYhGuJkWH67ByfdQDwz6rzSUAE2prpg09DpF8Mw0Q",
    environment: "staging",
    timeoutMs: 20000
  }),

  testimonialEndpoint: ""
});

/* Mobile Homepage parity correction — V3.7 LOCK. */
document.addEventListener("DOMContentLoaded", () => {
  if (!window.matchMedia("(max-width: 900px)").matches) return;
  if (document.body?.dataset.page !== "home") return;
  const hero = document.querySelector(".live-home-hero");
  const seal = hero?.querySelector(".live-home-right");
  const copy = hero?.querySelector(".live-home-left");
  if (!hero || !seal || !copy) return;
  hero.style.display = "flex";
  hero.style.flexDirection = "column";
  hero.style.height = "auto";
  hero.insertBefore(seal, copy);
  seal.style.order = "1";
  copy.style.order = "2";
  seal.style.height = "calc(100svh - var(--header-h))";
  copy.style.height = "calc(100svh - var(--header-h))";
});

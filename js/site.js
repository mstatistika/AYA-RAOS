(() => {
  const CART_KEY = "aya-raos-cart-v2";
  const config = window.AYA_CONFIG || {};
  const products = window.AYA_PRODUCTS || [];
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  });

  const currency = value => formatter.format(Number(value) || 0).replace(/\s/g, "");
  const getProduct = id => products.find(product => product.id === id);

  function safeParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function resolveStorage() {
    for (const storageName of ["localStorage", "sessionStorage"]) {
      try {
        const storage = window[storageName];
        const testKey = "__aya_storage_test__";
        storage.setItem(testKey, "1");
        storage.removeItem(testKey);
        return storage;
      } catch (error) {
        console.warn(`AYA: ${storageName} tidak tersedia.`, error);
      }
    }
    return null;
  }

  const storage = resolveStorage();
  let memoryCart = [];

  function getCart() {
    if (!storage) return Array.isArray(memoryCart) ? memoryCart : [];
    const parsed = safeParse(storage.getItem(CART_KEY), []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function saveCart(cart) {
    const safeCart = Array.isArray(cart) ? cart : [];
    memoryCart = safeCart;

    try {
      storage?.setItem(CART_KEY, JSON.stringify(safeCart));
    } catch (error) {
      console.error("AYA: keranjang gagal disimpan.", error);
      showToast("Keranjang tersimpan sementara di halaman ini.");
    }

    updateCartCount(true);
    window.dispatchEvent(new CustomEvent("aya:cart-updated", { detail: { cart: safeCart } }));
    return true;
  }

  const cartCount = cart => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartTotal = cart => cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  function addCartItem(productId, variantIndex = 0, quantity = 1) {
    const product = getProduct(productId);
    if (!product || !product.available || !product.variants?.length) {
      showToast("Produk ini belum tersedia untuk dipesan.");
      return false;
    }

    const safeVariantIndex = Math.max(
      0,
      Math.min(Number(variantIndex) || 0, product.variants.length - 1)
    );
    const variant = product.variants[safeVariantIndex];
    const qty = Math.max(1, Math.min(20, Number(quantity) || 1));
    const cart = getCart();
    const existing = cart.find(
      item => item.productId === productId && item.variant === variant.name
    );

    if (existing) {
      existing.quantity = Math.min(20, Number(existing.quantity) + qty);
    } else {
      cart.push({
        productId,
        variant: variant.name,
        price: Number(variant.price),
        quantity: qty
      });
    }

    saveCart(cart);
    showToast(`${product.name} ditambahkan.`, {
      actionLabel: "Lihat keranjang",
      actionHref: "cart.html"
    });
    return true;
  }

  function updateCartCount(animate = false) {
    const count = cartCount(getCart());
    document.querySelectorAll("[data-cart-count]").forEach(node => {
      node.textContent = count;
      if (!animate) return;
      const cartLink = node.closest(".cart-link");
      cartLink?.classList.remove("is-updated");
      window.requestAnimationFrame(() => cartLink?.classList.add("is-updated"));
      window.setTimeout(() => cartLink?.classList.remove("is-updated"), 700);
    });
  }

  function showToast(message, options = {}) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.replaceChildren();
    const text = document.createElement("span");
    text.textContent = message;
    toast.appendChild(text);

    if (options.actionLabel && options.actionHref) {
      const action = document.createElement("a");
      action.href = options.actionHref;
      action.textContent = options.actionLabel;
      toast.appendChild(action);
    }

    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function buildWhatsAppMessage(cart, extra = {}) {
    const lines = cart.map((item, index) => {
      const product = getProduct(item.productId);
      const name = product?.name || item.productId;
      return [
        `${index + 1}. ${name} — ${item.variant}`,
        `   ${item.quantity} × ${currency(item.price)} = ${currency(item.price * item.quantity)}`
      ].join("\n");
    });

    const details = [];
    if (extra.customerName) details.push(`Nama: ${extra.customerName}`);
    if (extra.zone) details.push(`Wilayah pengiriman: ${extra.zone}`);
    if (extra.notes) details.push(`Detail: ${extra.notes}`);

    return [
      `Halo ${config.businessName || "AYA RAOS"}, saya ingin mengirim pesanan standar untuk dikonfirmasi:`,
      "",
      ...lines,
      "",
      `Estimasi subtotal produk: ${currency(cartTotal(cart))}`,
      ...(details.length ? ["", ...details] : []),
      "",
      "Mohon konfirmasi ketersediaan, jadwal, pilihan tambahan bila ada, ongkir aktual, dan total final sebelum pembayaran. Terima kasih."
    ].join("\n");
  }

  function openWhatsApp(message = "") {
    if (!config.whatsappNumber) {
      window.alert("Nomor WhatsApp AYA belum dikonfigurasi.");
      return false;
    }

    const url = `https://wa.me/${config.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  }

  function openBusinessWhatsApp() {
    const message = [
      `Halo ${config.businessName || "AYA RAOS"},`,
      "",
      "Saya membutuhkan bantuan mengenai pesanan usaha yang sudah atau akan saya isi melalui website.",
      "",
      "Nama / usaha:",
      "Nomor pesanan bila sudah ada:",
      "Hal yang ingin ditanyakan:",
      "",
      "Terima kasih."
    ].join("\n");
    return openWhatsApp(message);
  }

  function installCompactPresentation() {
    if (!document.body?.classList.contains("v2-page")) return;

    document.documentElement.classList.add("v2-experience");
    document.body.classList.remove("menu-open", "drawer-open");

    if (!document.querySelector("link[data-v2-compact-style]")) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "css/frontend-v2-compact.css?v=20260802-compact-1";
      stylesheet.dataset.v2CompactStyle = "";
      document.head.appendChild(stylesheet);
    }

    const testimonialGrid = document.querySelector(".v2-testimonial-grid");
    const staticStack = testimonialGrid?.querySelector(".v2-testimonial-stack");

    if (testimonialGrid && staticStack && !testimonialGrid.querySelector("[data-text-carousel]")) {
      const panel = document.createElement("section");
      panel.className = "testimonial-ticker-panel v2-restored-ticker";
      panel.setAttribute("aria-labelledby", "restoredTickerTitle");

      const top = document.createElement("div");
      top.className = "ticker-panel-top";
      const prompt = document.createElement("span");
      prompt.textContent = "Punya pengalaman bersama AYA?";
      const share = document.createElement("a");
      share.className = "text-link";
      share.href = "share.html";
      share.textContent = "Bagikan pengalaman →";
      top.append(prompt, share);

      const head = document.createElement("div");
      head.className = "ticker-panel-head";
      const title = document.createElement("h3");
      title.id = "restoredTickerTitle";
      title.textContent = "Cerita pelanggan lainnya";
      head.appendChild(title);

      const viewport = document.createElement("div");
      viewport.className = "testimonial-ticker-viewport";
      viewport.tabIndex = 0;
      viewport.dataset.textCarousel = "";
      viewport.setAttribute("aria-label", "Testimoni pelanggan bergerak vertikal");
      const track = document.createElement("div");
      track.className = "testimonial-ticker-track";
      track.dataset.testimonialTrack = "";
      viewport.appendChild(track);

      const bottom = document.createElement("div");
      bottom.className = "ticker-panel-bottom";
      const all = document.createElement("a");
      all.className = "text-link";
      all.href = "testimonials.html";
      all.textContent = "Lihat semua testimoni →";
      bottom.appendChild(all);

      panel.append(top, head, viewport, bottom);
      staticStack.replaceWith(panel);
    }
  }

  function currentPageKey() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    if (path === "index.html" || path === "") return "home";
    if (path === "products.html" || path === "product.html") return "products";
    if (path === "business.html") return "business";
    if (path === "testimonials.html" || path === "share.html") return "testimonials";
    return "";
  }

  function createNavLink(item, activeKey) {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    if (item.key && item.key === activeKey) link.setAttribute("aria-current", "page");
    return link;
  }

  function normalizeNavigation() {
    const activeKey = currentPageKey();
    const desktopItems = [
      { key: "home", label: "Beranda", href: "index.html" },
      { key: "story", label: "Cerita AYA", href: "index.html#cerita-aya" },
      { key: "products", label: "Produk", href: "products.html" },
      { key: "business", label: "Pesanan Usaha", href: "business.html" },
      { key: "testimonials", label: "Testimoni", href: "testimonials.html" }
    ];
    const mobileItems = [
      ...desktopItems,
      { key: "how", label: "Cara Pesan", href: "information.html#cara-pesan" },
      { key: "cart", label: "Keranjang", href: "cart.html" }
    ];

    document.querySelectorAll(".primary-nav").forEach(nav => {
      nav.replaceChildren(...desktopItems.map(item => createNavLink(item, activeKey)));
    });
    document.querySelectorAll("[data-mobile-panel]").forEach(panel => {
      panel.replaceChildren(...mobileItems.map(item => createNavLink(item, activeKey)));
    });
  }

  function bindNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) return;

    const closeMenu = () => {
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };

    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });

    panel.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
  }

  function bindExternalActions() {
    document.addEventListener("click", event => {
      const direct = event.target.closest("[data-direct-whatsapp]");
      if (direct) {
        event.preventDefault();
        openWhatsApp();
        return;
      }

      const business = event.target.closest("[data-b2b-whatsapp]");
      if (business) {
        event.preventDefault();
        openBusinessWhatsApp();
      }
    });
  }

  function injectFooterEnhancements() {
    document.querySelectorAll(".footer-brand").forEach(footerBrand => {
      if (footerBrand.querySelector(".footer-socials")) return;
      const socials = document.createElement("div");
      socials.className = "footer-socials";

      if (config.instagramUrl) {
        const instagram = document.createElement("a");
        instagram.className = "footer-social-link";
        instagram.href = config.instagramUrl;
        instagram.target = "_blank";
        instagram.rel = "noopener noreferrer";
        instagram.setAttribute("aria-label", "Buka Instagram AYA");

        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "◎";
        const label = document.createElement("span");
        label.textContent = config.instagramHandle || "Instagram";
        instagram.append(icon, label);
        socials.appendChild(instagram);
      }

      footerBrand.appendChild(socials);
    });

    document.querySelectorAll(".footer-column").forEach(column => {
      const heading = column.querySelector("h3");
      if (!heading || !/bantuan/i.test(heading.textContent)) return;
      const existing = [...column.querySelectorAll("a")].find(
        link => /business\.html/.test(link.getAttribute("href") || "")
      );
      if (existing) return;
      const businessLink = document.createElement("a");
      businessLink.href = "business.html";
      businessLink.textContent = "Pesanan Usaha & Acara";
      column.appendChild(businessLink);
    });
  }

  function setCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(node => {
      node.textContent = new Date().getFullYear();
    });
  }

  function imageOrPlaceholder(product, className = "") {
    if (product.image) {
      return `<img class="${className}" src="${product.image}" alt="${product.name}" loading="lazy" />`;
    }
    return `<div class="product-placeholder ${className}" aria-label="Foto ${product.name} sedang disiapkan">${product.name}</div>`;
  }

  window.AYA = {
    CART_KEY,
    config,
    products,
    currency,
    getProduct,
    getCart,
    saveCart,
    cartCount,
    cartTotal,
    addCartItem,
    updateCartCount,
    buildWhatsAppMessage,
    openWhatsApp,
    openBusinessWhatsApp,
    showToast,
    imageOrPlaceholder
  };

  document.addEventListener("DOMContentLoaded", () => {
    installCompactPresentation();
    normalizeNavigation();
    bindNavigation();
    bindExternalActions();
    injectFooterEnhancements();
    setCurrentYear();
    updateCartCount();
  });

  window.addEventListener("pageshow", () => {
    if (!document.body?.classList.contains("v2-page")) return;
    document.body.classList.remove("menu-open", "drawer-open");
    document.documentElement.classList.add("v2-experience");
  });
})();

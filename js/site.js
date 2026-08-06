(() => {
  "use strict";

  const CART_KEY = "ayaRaos.cart.v2";
  const DRAFT_KEY = "ayaRaos.orderDraft.v3";
  const LEGACY_DRAFT_KEY = "ayaRaos.orderDraft.v2";
  const MIGRATION_NOTICE_KEY = "ayaRaos.orderDraftMigrationNotice";

  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));

  const formatPrice = (amount) => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(Number(amount) || 0);

  const products = () => Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : [];
  const getProduct = (id) => products().find((product) => product.id === id);
  const getVariant = (product, name) => product?.variants?.find((variant) => variant.name === name);

  const readJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  const writeJSON = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch {
      showGlobalState("Penyimpanan browser tidak tersedia. Data lokal tidak dapat disimpan.", "error");
      return false;
    }
  };

  const getCart = () => {
    const value = readJSON(CART_KEY, []);
    return Array.isArray(value) ? value : [];
  };

  const saveCart = (cart) => {
    const ok = writeJSON(CART_KEY, cart);
    updateCartCount();
    window.dispatchEvent(new CustomEvent("aya:cart-change", { detail: cart }));
    return ok;
  };

  const quantityRules = (product) => ({
    min: Math.max(1, Number(product?.minQuantity) || 1),
    max: Number.isFinite(Number(product?.maxQuantity)) && Number(product.maxQuantity) > 0 ? Number(product.maxQuantity) : 999,
    step: Math.max(1, Number(product?.quantityStep) || 1)
  });

  const normalizeProductQuantity = (product, value) => {
    const { min, max, step } = quantityRules(product);
    const parsed = Number.parseInt(value, 10);
    const raw = Number.isFinite(parsed) ? parsed : min;
    const bounded = Math.max(min, Math.min(max, raw));
    return Math.max(min, Math.min(max, min + Math.round((bounded - min) / step) * step));
  };

  const addToCart = (productId, variantName, quantity = 1) => {
    const product = getProduct(productId);
    const variant = getVariant(product, variantName);
    if (!product || !variant || !product.orderable) {
      toast("Produk atau varian belum dapat dipesan.", "error");
      return false;
    }
    const qty = normalizeProductQuantity(product, quantity);
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId && item.variantName === variantName);
    if (existing) existing.quantity = normalizeProductQuantity(product, existing.quantity + qty);
    else cart.push({ productId, variantName, quantity: qty });
    if (saveCart(cart)) {
      toast(`${product.name} ditambahkan ke keranjang.`, "success");
      return true;
    }
    return false;
  };

  const updateCartItem = (productId, variantName, quantity) => {
    const cart = getCart();
    const item = cart.find((entry) => entry.productId === productId && entry.variantName === variantName);
    const product = getProduct(productId);
    if (!item || !product) return false;
    item.quantity = normalizeProductQuantity(product, quantity);
    return saveCart(cart);
  };

  const changeCartVariant = (productId, oldVariantName, newVariantName) => {
    const product = getProduct(productId);
    if (!product || !getVariant(product, newVariantName)) return false;
    const cart = getCart();
    const oldIndex = cart.findIndex((entry) => entry.productId === productId && entry.variantName === oldVariantName);
    if (oldIndex < 0) return false;
    const existingIndex = cart.findIndex((entry) => entry.productId === productId && entry.variantName === newVariantName);
    if (existingIndex >= 0 && existingIndex !== oldIndex) {
      cart[existingIndex].quantity = normalizeProductQuantity(product, cart[existingIndex].quantity + cart[oldIndex].quantity);
      cart.splice(oldIndex, 1);
    } else {
      cart[oldIndex].variantName = newVariantName;
    }
    return saveCart(cart);
  };

  const removeCartItem = (productId, variantName) => saveCart(getCart().filter(
    (item) => !(item.productId === productId && item.variantName === variantName)
  ));

  const cartDetails = () => getCart().map((item) => {
    const product = getProduct(item.productId);
    const variant = getVariant(product, item.variantName);
    if (!product || !variant || !product.visible) return null;
    const quantity = normalizeProductQuantity(product, item.quantity);
    return { ...item, quantity, product, variant, subtotal: variant.price * quantity };
  }).filter(Boolean);

  const cartSubtotal = () => cartDetails().reduce((sum, item) => sum + item.subtotal, 0);

  const updateCartCount = () => {
    const count = getCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = String(count); });
  };

  function toast(message, type = "info") {
    const region = document.querySelector("[data-toast-region]");
    if (!region) return;
    const node = document.createElement("div");
    node.className = `toast toast-${type}`;
    node.textContent = message;
    region.append(node);
    setTimeout(() => node.remove(), 4200);
  }

  function showGlobalState(message, type = "warning") {
    const node = document.querySelector("[data-global-state]");
    if (!node) return;
    node.hidden = false;
    node.className = `global-state global-state-${type}`;
    node.textContent = message;
  }

  const buildWhatsAppUrl = (message) => {
    const number = window.AYA_CONFIG?.whatsappNumber;
    if (!/^62\d{8,15}$/.test(String(number || ""))) {
      showGlobalState("Nomor WhatsApp AYA belum tersedia. Silakan coba kembali nanti.", "error");
      return "";
    }
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const openWhatsApp = (message) => {
    const url = buildWhatsAppUrl(message);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const migrateDraft = () => {
    const current = readJSON(DRAFT_KEY, null);
    if (current && typeof current === "object") return current;
    const legacy = readJSON(LEGACY_DRAFT_KEY, null);
    if (!legacy || typeof legacy !== "object") return {};
    const context = legacy.orderType === "business" ? "event" : "personal";
    const migrated = {
      schemaVersion: 3,
      context,
      customer: legacy.customer || {},
      shipping: legacy.shipping || {},
      notes: legacy.notes || ""
    };
    if (writeJSON(DRAFT_KEY, migrated) && legacy.orderType === "business") {
      try { sessionStorage.setItem(MIGRATION_NOTICE_KEY, "1"); } catch { /* no-op */ }
    }
    return migrated;
  };

  const readDraft = () => migrateDraft();
  const saveDraft = (value) => writeJSON(DRAFT_KEY, { ...value, schemaVersion: 3 });
  const consumeDraftMigrationNotice = () => {
    try {
      const exists = sessionStorage.getItem(MIGRATION_NOTICE_KEY) === "1";
      if (exists) sessionStorage.removeItem(MIGRATION_NOTICE_KEY);
      return exists;
    } catch { return false; }
  };

  const renderImageFallback = (img) => {
    const product = getProduct(img.dataset.imageFallback);
    const fallback = product?.placeholder || "assets/placeholders/sambal-bawang.svg";
    if (img.getAttribute("src") === fallback) return;
    img.src = fallback;
    img.classList.add("is-placeholder");
  };

  const handleImageError = (event) => {
    const img = event.target;
    if (img instanceof HTMLImageElement && img.matches("[data-image-fallback]")) renderImageFallback(img);
  };

  document.addEventListener("error", handleImageError, true);

  const initImages = () => document.querySelectorAll("img[data-image-fallback]").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) renderImageFallback(img);
  });

  const initMenu = () => {
    const button = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) return;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("open", !open);
    });
    panel.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        button.setAttribute("aria-expanded", "false");
        panel.classList.remove("open");
      }
    });
  };

  const initActiveNav = () => {
    const page = document.body.dataset.page;
    const map = {
      home: "home", products: "products", product: "products",
      testimonials: "testimonials", information: "information", business: "business"
    };
    const key = map[page];
    if (key) document.querySelector(`[data-nav="${key}"]`)?.setAttribute("aria-current", "page");
  };

  const validateRuntime = () => {
    if (!window.AYA_CONFIG) showGlobalState("Konfigurasi AYA gagal dimuat. Beberapa fungsi dinonaktifkan.", "error");
    if (!Array.isArray(window.AYA_PRODUCTS)) showGlobalState("Data produk gagal dimuat. Silakan muat ulang halaman.", "error");
  };

  const initInformationHelp = () => document.querySelectorAll("[data-whatsapp-help]").forEach((button) => {
    button.addEventListener("click", () => openWhatsApp("Halo AYA RAOS, saya membutuhkan bantuan mengenai informasi pemesanan."));
  });

  window.AYA = Object.freeze({
    escapeHTML, formatPrice, products, getProduct, getVariant,
    getCart, saveCart, addToCart, updateCartItem, changeCartVariant,
    removeCartItem, cartDetails, cartSubtotal, updateCartCount,
    quantityRules, normalizeProductQuantity, toast, showGlobalState,
    buildWhatsAppUrl, openWhatsApp, readDraft, saveDraft,
    consumeDraftMigrationNotice
  });

  document.addEventListener("DOMContentLoaded", () => {
    validateRuntime(); updateCartCount(); initImages(); initMenu(); initActiveNav(); initInformationHelp();
  });
})();

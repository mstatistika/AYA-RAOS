(() => {
  "use strict";

  const CART_KEY = "ayaRaos.cart.v2";
  const DRAFT_KEY = "ayaRaos.orderDraft.phase1";

  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));
  const formatPrice = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount) || 0);
  const products = () => Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : [];
  const getProduct = (id) => products().find((product) => product.id === id);
  const getVariant = (product, name) => product?.variants?.find((variant) => variant.name === name);

  const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const writeJSON = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { showGlobalState("Penyimpanan browser tidak tersedia. Data lokal tidak dapat disimpan.", "error"); return false; } };
  const getCart = () => { const value = readJSON(CART_KEY, []); return Array.isArray(value) ? value : []; };
  const saveCart = (cart) => { const ok = writeJSON(CART_KEY, cart); updateCartCount(); window.dispatchEvent(new CustomEvent("aya:cart-change", { detail: cart })); return ok; };
  const quantityRules = (product) => ({ min: Math.max(1, Number(product?.minQuantity) || 1), max: Number.isFinite(Number(product?.maxQuantity)) && Number(product.maxQuantity) > 0 ? Number(product.maxQuantity) : 999, step: Math.max(1, Number(product?.quantityStep) || 1) });
  const normalizeProductQuantity = (product, value) => { const { min, max, step } = quantityRules(product); const parsed = Number.parseInt(value, 10); const raw = Number.isFinite(parsed) ? parsed : min; const bounded = Math.max(min, Math.min(max, raw)); return Math.max(min, Math.min(max, min + Math.round((bounded - min) / step) * step)); };

  const addToCart = (productId, variantName, quantity = 1) => {
    const product = getProduct(productId); const variant = getVariant(product, variantName);
    if (!product || !variant || !product.orderable) { toast("Produk atau varian belum dapat dipesan.", "error"); return false; }
    const qty = normalizeProductQuantity(product, quantity); const cart = getCart();
    const existing = cart.find((item) => item.productId === productId && item.variantName === variantName);
    if (existing) existing.quantity = normalizeProductQuantity(product, existing.quantity + qty); else cart.push({ productId, variantName, quantity: qty });
    if (saveCart(cart)) { toast(`${product.name} ditambahkan ke keranjang.`, "success"); return true; }
    return false;
  };
  const updateCartItem = (productId, variantName, quantity) => { const cart = getCart(); const item = cart.find((entry) => entry.productId === productId && entry.variantName === variantName); const product = getProduct(productId); if (!item || !product) return false; item.quantity = normalizeProductQuantity(product, quantity); return saveCart(cart); };
  const changeCartVariant = (productId, oldVariantName, newVariantName) => { const product = getProduct(productId); if (!product || !getVariant(product, newVariantName)) return false; const cart = getCart(); const oldIndex = cart.findIndex((entry) => entry.productId === productId && entry.variantName === oldVariantName); if (oldIndex < 0) return false; const existingIndex = cart.findIndex((entry) => entry.productId === productId && entry.variantName === newVariantName); if (existingIndex >= 0 && existingIndex !== oldIndex) { cart[existingIndex].quantity = normalizeProductQuantity(product, cart[existingIndex].quantity + cart[oldIndex].quantity); cart.splice(oldIndex, 1); } else cart[oldIndex].variantName = newVariantName; return saveCart(cart); };
  const removeCartItem = (productId, variantName) => saveCart(getCart().filter((item) => !(item.productId === productId && item.variantName === variantName)));
  const cartDetails = () => getCart().map((item) => { const product = getProduct(item.productId); const variant = getVariant(product, item.variantName); if (!product || !variant || !product.visible) return null; const quantity = normalizeProductQuantity(product, item.quantity); return { ...item, quantity, product, variant, subtotal: variant.price * quantity }; }).filter(Boolean);
  const cartSubtotal = () => cartDetails().reduce((sum, item) => sum + item.subtotal, 0);
  const updateCartCount = () => { const count = getCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0); document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = String(count); }); };

  function toast(message, type = "info") { const region = document.querySelector("[data-toast-region]"); if (!region) return; const node = document.createElement("div"); node.className = `toast toast-${type}`; node.textContent = message; region.append(node); setTimeout(() => node.remove(), 4200); }
  function showGlobalState(message, type = "warning") { const node = document.querySelector("[data-global-state]"); if (!node) return; node.hidden = false; node.className = `global-state global-state-${type}`; node.textContent = message; }
  const buildWhatsAppUrl = (message) => { const number = window.AYA_CONFIG?.whatsappNumber; if (!/^62\d{8,15}$/.test(String(number || ""))) { showGlobalState("Nomor WhatsApp AYA belum tersedia. Silakan coba kembali nanti.", "error"); return ""; } return `https://wa.me/${number}?text=${encodeURIComponent(message)}`; };
  const openWhatsApp = (message) => { const url = buildWhatsAppUrl(message); if (url) window.open(url, "_blank", "noopener,noreferrer"); };
  const readDraft = () => { const current = readJSON(DRAFT_KEY, {}); return current && typeof current === "object" ? current : {}; };
  const saveDraft = (value) => writeJSON(DRAFT_KEY, { ...value, schemaVersion: 1 });

  const renderImageFallback = (img) => { const product = getProduct(img.dataset.imageFallback); const fallback = product?.placeholder || "assets/placeholders/sambal-bawang.svg"; if (img.getAttribute("src") === fallback) return; img.src = fallback; img.classList.add("is-placeholder"); };
  document.addEventListener("error", (event) => { const img = event.target; if (img instanceof HTMLImageElement && img.matches("[data-image-fallback]")) renderImageFallback(img); }, true);
  const initImages = () => document.querySelectorAll("img[data-image-fallback]").forEach((img) => { if (img.complete && img.naturalWidth === 0) renderImageFallback(img); });

  const homeHref = (hash = "beranda") => document.body.dataset.page === "home" ? `#${hash}` : `index.html#${hash}`;
  const headerMarkup = () => {
    const lineKey = document.body.dataset.page === "line" ? document.body.dataset.lineKey : "";
    const lineLinks = {
      farm: [["spice.html", "AYA Spice Haven"], ["snacks.html", "AYA Snacks & Drinks"]],
      spice: [["farm.html", "AYA Farm"], ["snacks.html", "AYA Snacks & Drinks"]],
      snack: [["farm.html", "AYA Farm"], ["spice.html", "AYA Spice Haven"]]
    };
    if (lineLinks[lineKey]) {
      const cross = lineLinks[lineKey].map(([href,label]) => `<a href="${href}" data-line-cross>${label}</a>`).join("");
      return `<header class="site-header site-header-context" data-site-header>
        <div class="site-header-inner">
          <a class="wordmark" href="index.html#beranda" aria-label="AYA RAOS — Kembali ke Beranda"><span class="wordmark-lockup-wrap"><img class="wordmark-lockup" src="assets/visual/home-lock/header-logo-tight.png" width="190" height="70" alt="" aria-hidden="true"></span></a>
          <nav class="primary-nav" aria-label="Navigasi lini AYA">${cross}<a href="products.html" data-nav="products">Produk</a><a href="testimonials.html" data-nav="testimonials">Testimoni</a><a href="information.html" data-nav="information">Informasi</a><a href="business.html" data-nav="business">Pasokan Usaha</a></nav>
          <div class="header-actions"><a class="cart-icon-link" href="cart.html?context=personal" aria-label="Buka keranjang"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M9 11h14l1 16H8l1-16Z"></path><path d="M12 12V9a4 4 0 0 1 8 0v3"></path></svg><span class="sr-only">Keranjang</span><span class="cart-count" data-cart-count>0</span></a><button class="menu-toggle" type="button" aria-label="Buka menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button></div>
        </div>
        <nav class="mobile-panel" aria-label="Navigasi seluler" data-mobile-panel>${cross}<a href="products.html">Produk</a><a href="testimonials.html">Testimoni</a><a href="information.html">Informasi</a><a href="business.html">Pasokan Usaha</a><a href="cart.html?context=personal">Keranjang <span data-cart-count>0</span></a></nav>
      </header>`;
    }
    return `<header class="site-header site-header-dark" data-site-header>
      <div class="site-header-inner">
        <a class="wordmark" href="${homeHref("beranda")}" aria-label="AYA RAOS — Beranda"><span class="wordmark-lockup-wrap"><img class="wordmark-lockup" src="assets/visual/home-lock/header-logo-tight.png" width="190" height="70" alt="" aria-hidden="true"></span></a>
        <nav class="primary-nav" aria-label="Navigasi utama">
          <a href="${homeHref("beranda")}" data-nav="home">Beranda</a><a href="${homeHref("tentang-aya")}" data-nav="about">Tentang AYA</a><a href="${homeHref("lini-aya")}" data-nav="lines">Lini AYA</a><a href="products.html" data-nav="products">Produk</a><a href="testimonials.html" data-nav="testimonials">Testimoni</a><a href="information.html" data-nav="information">Informasi</a><a href="business.html" data-nav="business">Pasokan Usaha</a>
        </nav>
        <div class="header-actions"><a class="cart-icon-link" href="cart.html?context=personal" aria-label="Buka keranjang"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M9 11h14l1 16H8l1-16Z"></path><path d="M12 12V9a4 4 0 0 1 8 0v3"></path></svg><span class="sr-only">Keranjang</span><span class="cart-count" data-cart-count>0</span></a><button class="menu-toggle" type="button" aria-label="Buka menu" aria-expanded="false" data-menu-toggle><span></span><span></span><span></span></button></div>
      </div>
      <nav class="mobile-panel" aria-label="Navigasi seluler" data-mobile-panel><a href="${homeHref("beranda")}" data-mobile-nav="home">Beranda</a><a href="${homeHref("tentang-aya")}" data-mobile-nav="about">Tentang AYA</a><a href="${homeHref("lini-aya")}" data-mobile-nav="lines">Lini AYA</a><a href="products.html" data-mobile-nav="products">Produk</a><a href="testimonials.html" data-mobile-nav="testimonials">Testimoni</a><a href="information.html" data-mobile-nav="information">Informasi</a><a href="business.html" data-mobile-nav="business">Pasokan Usaha</a><a href="cart.html?context=personal">Keranjang <span data-cart-count>0</span></a></nav>
    </header>`;
  };

  const renderGlobalShell = () => {
    const host = document.querySelector("[data-global-header]"); if (host) host.innerHTML = headerMarkup();
    const sig = document.querySelector("[data-site-signature]"); if (sig) sig.innerHTML = '<span>© 2026 AYA RAOS</span>';
  };

  const setActiveNav = (key) => {
    document.querySelectorAll("[data-nav],[data-mobile-nav]").forEach((node) => node.removeAttribute("aria-current"));
    if (!key) return;
    document.querySelector(`[data-nav="${key}"]`)?.setAttribute("aria-current", "page");
    document.querySelector(`[data-mobile-nav="${key}"]`)?.setAttribute("aria-current", "page");
  };
  const initActiveNav = () => {
    const page = document.body.dataset.page;
    const map = { line: "lines", products: "products", product: "products", testimonials: "testimonials", share: "testimonials", information: "information", business: "business", cart: "", "not-found": "" };
    if (page !== "home") { setActiveNav(map[page] || ""); return; }
    const sections = [
      ["beranda", "home"], ["tentang-aya", "about"], ["lini-aya", "lines"], ["mulai-dari-aya", "home"]
    ].map(([id,key]) => [document.getElementById(id), key]).filter(([node]) => node);
    if (!sections.length) { setActiveNav("home"); return; }
    const update = () => {
      const y = window.scrollY + Math.max(90, window.innerHeight * .28);
      let active = "home";
      sections.forEach(([node,key]) => { if (node.offsetTop <= y) active = key; });
      setActiveNav(active);
    };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("hashchange", update);
  };

  const initMenu = () => { const button = document.querySelector("[data-menu-toggle]"); const panel = document.querySelector("[data-mobile-panel]"); if (!button || !panel) return; button.addEventListener("click", () => { const open = button.getAttribute("aria-expanded") === "true"; button.setAttribute("aria-expanded", String(!open)); panel.classList.toggle("open", !open); }); panel.addEventListener("click", (event) => { if (event.target.closest("a")) { button.setAttribute("aria-expanded", "false"); panel.classList.remove("open"); } }); };
  const validateRuntime = () => { if (!window.AYA_CONFIG) showGlobalState("Konfigurasi AYA gagal dimuat. Beberapa fungsi dinonaktifkan.", "error"); if (!Array.isArray(window.AYA_PRODUCTS)) showGlobalState("Data produk gagal dimuat. Silakan muat ulang halaman.", "error"); };
  const initInformationHelp = () => document.querySelectorAll("[data-whatsapp-help]").forEach((button) => button.addEventListener("click", () => openWhatsApp("Halo AYA RAOS, saya membutuhkan bantuan mengenai informasi pemesanan.")));

  window.AYA = Object.freeze({ escapeHTML, formatPrice, products, getProduct, getVariant, getCart, saveCart, addToCart, updateCartItem, changeCartVariant, removeCartItem, cartDetails, cartSubtotal, updateCartCount, quantityRules, normalizeProductQuantity, toast, showGlobalState, buildWhatsAppUrl, openWhatsApp, readDraft, saveDraft });

  document.addEventListener("DOMContentLoaded", () => { renderGlobalShell(); validateRuntime(); updateCartCount(); initImages(); initMenu(); initActiveNav(); initInformationHelp(); });
})();

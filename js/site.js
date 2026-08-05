(() => {
  "use strict";
  const CART_KEY = "ayaRaos.cart.v2";
  const DRAFT_KEY = "ayaRaos.orderDraft.v2";
  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const formatPrice = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount) || 0);
  const products = () => Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : [];
  const getProduct = (id) => products().find((product) => product.id === id);
  const getVariant = (product, name) => product?.variants?.find((variant) => variant.name === name);
  const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const writeJSON = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { showGlobalState("Penyimpanan browser tidak tersedia. Keranjang tidak dapat disimpan.", "error"); return false; } };
  const getCart = () => { const value = readJSON(CART_KEY, []); return Array.isArray(value) ? value : []; };
  const saveCart = (cart) => { const ok = writeJSON(CART_KEY, cart); updateCartCount(); window.dispatchEvent(new CustomEvent("aya:cart-change", { detail: cart })); return ok; };
  const normalizeQuantity = (value, min = 1) => Math.max(min, Math.min(999, Number.parseInt(value, 10) || min));
  const addToCart = (productId, variantName, quantity = 1) => {
    const product = getProduct(productId);
    const variant = getVariant(product, variantName);
    if (!product || !variant || !product.orderable) { toast("Produk atau varian belum dapat dipesan.", "error"); return false; }
    const min = product.minQuantity || 1;
    const qty = normalizeQuantity(quantity, min);
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId && item.variantName === variantName);
    if (existing) existing.quantity = normalizeQuantity(existing.quantity + qty, min);
    else cart.push({ productId, variantName, quantity: qty });
    if (saveCart(cart)) { toast(`${product.name} ditambahkan ke keranjang.`, "success"); return true; }
    return false;
  };
  const updateCartItem = (productId, variantName, quantity) => {
    const cart = getCart();
    const item = cart.find((entry) => entry.productId === productId && entry.variantName === variantName);
    const product = getProduct(productId);
    if (!item || !product) return;
    item.quantity = normalizeQuantity(quantity, product.minQuantity || 1);
    saveCart(cart);
  };
  const removeCartItem = (productId, variantName) => saveCart(getCart().filter((item) => !(item.productId === productId && item.variantName === variantName)));
  const cartDetails = () => getCart().map((item) => { const product = getProduct(item.productId); const variant = getVariant(product, item.variantName); if (!product || !variant) return null; return { ...item, product, variant, subtotal: variant.price * item.quantity }; }).filter(Boolean);
  const cartSubtotal = () => cartDetails().reduce((sum, item) => sum + item.subtotal, 0);
  const updateCartCount = () => { const count = getCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0); document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = String(count); }); };
  function toast(message, type = "info") { const region = document.querySelector("[data-toast-region]"); if (!region) return; const node = document.createElement("div"); node.className = `toast toast-${type}`; node.textContent = message; region.append(node); setTimeout(() => node.remove(), 4200); }
  function showGlobalState(message, type = "warning") { const node = document.querySelector("[data-global-state]"); if (!node) return; node.hidden = false; node.className = `global-state global-state-${type}`; node.textContent = message; }
  const buildWhatsAppUrl = (message) => { const number = window.AYA_CONFIG?.whatsappNumber; if (!/^62\d{8,15}$/.test(String(number || ""))) { showGlobalState("Nomor WhatsApp AYA belum tersedia. Silakan coba kembali nanti.", "error"); return ""; } return `https://wa.me/${number}?text=${encodeURIComponent(message)}`; };
  const openWhatsApp = (message) => { const url = buildWhatsAppUrl(message); if (url) window.open(url, "_blank", "noopener,noreferrer"); };
  const renderImageFallback = (img) => { const product = getProduct(img.dataset.imageFallback); const fallback = product?.placeholder || "assets/placeholders/sambal-bawang.svg"; if (img.src.endsWith(fallback)) return; img.src = fallback; img.classList.add("is-placeholder"); };
  const handleImageError = (event) => { const img = event.target; if (img instanceof HTMLImageElement && img.matches("[data-image-fallback]")) renderImageFallback(img); };
  document.addEventListener("error", handleImageError, true);
  const initImages = () => document.querySelectorAll("img[data-image-fallback]").forEach((img) => { if (img.complete && img.naturalWidth === 0) renderImageFallback(img); });
  const initMenu = () => { const button = document.querySelector("[data-menu-toggle]"); const panel = document.querySelector("[data-mobile-panel]"); if (!button || !panel) return; button.addEventListener("click", () => { const open = button.getAttribute("aria-expanded") === "true"; button.setAttribute("aria-expanded", String(!open)); panel.classList.toggle("open", !open); }); panel.addEventListener("click", (event) => { if (event.target.closest("a")) { button.setAttribute("aria-expanded", "false"); panel.classList.remove("open"); } }); };
  const initActiveNav = () => { const page = document.body.dataset.page; const map = { home: "home", products: "products", product: "products", testimonials: "testimonials", information: "information" }; const key = map[page]; if (key) document.querySelector(`[data-nav="${key}"]`)?.setAttribute("aria-current", "page"); };
  const validateRuntime = () => { if (!window.AYA_CONFIG) showGlobalState("Konfigurasi AYA gagal dimuat. Beberapa fungsi dinonaktifkan.", "error"); if (!Array.isArray(window.AYA_PRODUCTS)) showGlobalState("Data produk gagal dimuat. Silakan muat ulang halaman.", "error"); };
  const initInformationHelp = () => document.querySelectorAll("[data-whatsapp-help]").forEach((button) => button.addEventListener("click", () => openWhatsApp("Halo AYA RAOS, saya membutuhkan bantuan mengenai informasi pemesanan.")));
  window.AYA = Object.freeze({ escapeHTML, formatPrice, products, getProduct, getVariant, getCart, saveCart, addToCart, updateCartItem, removeCartItem, cartDetails, cartSubtotal, updateCartCount, toast, showGlobalState, buildWhatsAppUrl, openWhatsApp, readDraft: () => readJSON(DRAFT_KEY, {}), saveDraft: (value) => writeJSON(DRAFT_KEY, value) });
  document.addEventListener("DOMContentLoaded", () => { validateRuntime(); updateCartCount(); initImages(); initMenu(); initActiveNav(); initInformationHelp(); });
})();

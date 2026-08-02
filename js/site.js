(() => {
  "use strict";

  const CART_KEY = "aya-raos-cart-phase1-v1";
  const config = window.AYA_CONFIG || {};
  const products = Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : [];

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  });

  const currency = value => formatter.format(Number(value) || 0).replace(/\s/g, "");
  const statusLabels = Object.freeze({
    available: "Tersedia",
    preorder: "Pre-order",
    soldout: "Habis"
  });

  const minimumPrice = product => {
    if (!Array.isArray(product?.variants) || !product.variants.length) return null;
    return Math.min(...product.variants.map(item => Number(item.price) || 0));
  };

  const getProduct = id => products.find(product => product.id === id);

  const make = (tag, className = "", text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const safeParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  function resolveStorage() {
    for (const key of ["localStorage", "sessionStorage"]) {
      try {
        const storage = window[key];
        const testKey = "__aya_storage_test__";
        storage.setItem(testKey, "1");
        storage.removeItem(testKey);
        return storage;
      } catch (error) {
        console.warn(`AYA: ${key} tidak tersedia.`, error);
      }
    }
    return null;
  }

  const storage = resolveStorage();
  let memoryCart = [];

  function getCart() {
    if (!storage) return memoryCart;
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
      showToast("Keranjang hanya tersimpan sementara di halaman ini.", "warning");
    }
    updateCartCount(true);
    window.dispatchEvent(new CustomEvent("aya:cart-updated", { detail: { cart: safeCart } }));
    return true;
  }

  const cartCount = cart => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartTotal = cart => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  function addCartItem(productId, variantIndex = 0, quantity = 1) {
    const product = getProduct(productId);
    if (!product || product.status === "soldout" || !product.variants?.length) {
      showToast("Produk ini belum tersedia untuk dipesan.", "warning");
      return false;
    }
    const index = Math.max(0, Math.min(Number(variantIndex) || 0, product.variants.length - 1));
    const variant = product.variants[index];
    const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
    const cart = getCart();
    const existing = cart.find(item => item.productId === productId && item.variant === variant.name);
    if (existing) existing.quantity = Math.min(99, Number(existing.quantity) + qty);
    else cart.push({ productId, variant: variant.name, price: Number(variant.price), quantity: qty });
    saveCart(cart);
    showToast(`${product.name} ditambahkan ke keranjang.`, "success", {
      actionLabel: "Lihat keranjang",
      actionHref: "cart.html"
    });
    return true;
  }

  function updateCartItem(productId, variant, quantity) {
    const cart = getCart();
    const item = cart.find(entry => entry.productId === productId && entry.variant === variant);
    if (!item) return false;
    item.quantity = Math.max(1, Math.min(99, Number(quantity) || 1));
    return saveCart(cart);
  }

  function removeCartItem(productId, variant) {
    const next = getCart().filter(item => !(item.productId === productId && item.variant === variant));
    saveCart(next);
    showToast("Produk dihapus dari keranjang.", "success");
  }

  function updateCartCount(animate = false) {
    const count = cartCount(getCart());
    document.querySelectorAll("[data-cart-count]").forEach(node => {
      node.textContent = count;
      if (animate) {
        node.classList.remove("is-updated");
        requestAnimationFrame(() => node.classList.add("is-updated"));
        setTimeout(() => node.classList.remove("is-updated"), 500);
      }
    });
  }

  function showToast(message, type = "", options = {}) {
    let toast = document.querySelector("[data-toast]");
    if (!toast) {
      toast = make("div", "toast");
      toast.dataset.toast = "";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.replaceChildren();
    toast.hidden = false;
    toast.className = `toast show${type ? ` is-${type}` : ""}`;
    toast.appendChild(make("span", "", message));
    if (options.actionLabel && options.actionHref) {
      const link = make("a", "", options.actionLabel);
      link.href = options.actionHref;
      toast.appendChild(link);
    }
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => { toast.hidden = true; }, 180);
    }, 3200);
  }

  function validateWhatsApp() {
    return /^\d{10,15}$/.test(String(config.whatsappNumber || ""));
  }

  function openWhatsApp(message = "") {
    if (!validateWhatsApp()) {
      showToast("WhatsApp AYA belum terhubung. Silakan coba kembali setelah konfigurasi diperbarui.", "error");
      return false;
    }
    const query = message ? `?text=${encodeURIComponent(message)}` : "";
    window.open(`https://wa.me/${config.whatsappNumber}${query}`, "_blank", "noopener,noreferrer");
    return true;
  }

  function buildProductMessage(product, variant, quantity = 1) {
    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = Number(variant?.price) || 0;
    return [
      `Halo ${config.businessName || "AYA RAOS"}, saya ingin memesan:`,
      "",
      `Produk: ${product.name}`,
      `Varian: ${variant.name}`,
      `Jumlah: ${qty}`,
      `Harga satuan: ${currency(unitPrice)}`,
      `Subtotal: ${currency(unitPrice * qty)}`,
      "",
      "Mohon konfirmasi ketersediaan, ongkir, dan total final. Terima kasih."
    ].join("\n");
  }

  function buildCartMessage(cart, customer = {}) {
    const lines = cart.map((item, index) => {
      const product = getProduct(item.productId);
      return [
        `${index + 1}. ${product?.name || item.productId}`,
        `   Varian: ${item.variant}`,
        `   ${item.quantity} × ${currency(item.price)} = ${currency(item.price * item.quantity)}`
      ].join("\n");
    });
    return [
      `Halo ${config.businessName || "AYA RAOS"}, saya ingin mengonfirmasi pesanan:`,
      "",
      ...lines,
      "",
      `Total subtotal produk: ${currency(cartTotal(cart))}`,
      "",
      `Nama: ${customer.customerName || "-"}`,
      `WhatsApp: ${customer.customerPhone || "-"}`,
      `Area: ${customer.deliveryArea || "-"}`,
      `Tanggal kebutuhan: ${customer.requestedDate || "Tidak ditentukan"}`,
      `Catatan: ${customer.orderNotes || "-"}`,
      "",
      "Mohon konfirmasi ketersediaan, ongkir, total final, dan langkah pembayaran. Terima kasih."
    ].join("\n");
  }

  function statusLabel(status) {
    return statusLabels[status] || status;
  }

  function createMedia(product, className = "") {
    const wrapper = make("div", `product-media ${className}`.trim());
    wrapper.dataset.line = product.lineKey || "spice";
    const image = document.createElement("img");
    image.src = product.image || product.placeholder;
    image.alt = product.name;
    image.loading = "lazy";
    image.width = 900;
    image.height = 675;
    image.addEventListener("error", () => {
      if (image.src.endsWith(product.placeholder)) {
        wrapper.replaceChildren(createPlaceholder(product));
        return;
      }
      image.src = product.placeholder;
    }, { once: true });
    wrapper.appendChild(image);
    return wrapper;
  }

  function createPlaceholder(product) {
    const placeholder = make("div", "product-placeholder");
    placeholder.dataset.line = product.lineKey || "spice";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", `Foto ${product.name} sedang disiapkan`);
    placeholder.append(
      make("span", "", product.line),
      make("strong", "", product.name),
      make("small", "", "Foto sedang disiapkan")
    );
    return placeholder;
  }

  function createProductCard(product, options = {}) {
    const card = make("article", "product-card");
    card.dataset.productId = product.id;
    const detailUrl = `product.html?id=${encodeURIComponent(product.id)}`;

    const imageLink = make("a", "product-card-media-link");
    imageLink.href = detailUrl;
    imageLink.setAttribute("aria-label", `Lihat detail ${product.name}`);
    imageLink.appendChild(createMedia(product));

    const status = make("span", `status-badge status-${product.status}`, statusLabel(product.status));
    imageLink.appendChild(status);

    const body = make("div", "product-card-body");
    const meta = make("div", "product-card-meta");
    meta.append(make("span", "", product.line), make("span", "", product.category));
    body.appendChild(meta);

    const title = make("h3", "", product.name);
    const titleLink = document.createElement("a");
    titleLink.href = detailUrl;
    titleLink.appendChild(title);
    body.appendChild(titleLink);
    body.appendChild(make("p", "product-card-description", product.description));

    const price = minimumPrice(product);
    const priceBox = make("div", "product-card-price");
    priceBox.append(
      make("span", "", price ? "Mulai dari" : "Harga"),
      make("strong", "", price ? currency(price) : "Belum tersedia")
    );
    body.appendChild(priceBox);

    const actions = make("div", "product-card-actions");
    if (product.status !== "soldout" && product.variants?.length) {
      const order = make("button", "button button-primary button-small", "Pesan Sekarang");
      order.type = "button";
      order.dataset.quickProduct = product.id;
      order.dataset.quickMode = "order";
      const add = make("button", "button button-secondary button-small", "Tambah");
      add.type = "button";
      add.dataset.quickProduct = product.id;
      add.dataset.quickMode = "cart";
      actions.append(order, add);
    } else {
      const detail = make("a", "button button-secondary button-small button-full", "Lihat Detail");
      detail.href = detailUrl;
      actions.appendChild(detail);
    }
    const detailLink = make("a", "product-detail-text", "Detail produk →");
    detailLink.href = detailUrl;
    actions.appendChild(detailLink);
    body.appendChild(actions);

    card.append(imageLink, body);
    return card;
  }

  function bindNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) return;
    const close = () => {
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
    panel.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") close();
    });
  }

  function bindDirectActions() {
    document.addEventListener("click", event => {
      const direct = event.target.closest("[data-direct-whatsapp]");
      if (!direct) return;
      event.preventDefault();
      openWhatsApp([
        `Halo ${config.businessName || "AYA RAOS"},`,
        "",
        "Saya ingin menanyakan produk dan cara pemesanan.",
        "",
        "Mohon bantu informasinya. Terima kasih."
      ].join("\n"));
    });
  }


  function bindImageFallbacks() {
    document.querySelectorAll("img[data-image-fallback]").forEach(image => {
      const applyFallback = () => {
        const product = getProduct(image.dataset.imageFallback);
        if (!product?.placeholder) {
          image.hidden = true;
          return;
        }
        const fallbackUrl = new URL(product.placeholder, document.baseURI).href;
        if (image.src === fallbackUrl) {
          image.hidden = true;
          return;
        }
        image.src = product.placeholder;
      };

      image.addEventListener("error", applyFallback, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        applyFallback();
      }
    });
  }

  function setCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(node => {
      node.textContent = new Date().getFullYear();
    });
  }

  function announceConfigurationState() {
    if (!validateWhatsApp()) {
      const banner = make("div", "system-banner is-error");
      banner.setAttribute("role", "alert");
      banner.textContent = "Pemesanan WhatsApp sementara belum tersedia. Silakan coba kembali setelah konfigurasi diperbarui.";
      document.body.insertBefore(banner, document.body.firstChild);
    }
    if (!products.length) {
      const banner = make("div", "system-banner is-error");
      banner.setAttribute("role", "alert");
      banner.textContent = "Data produk belum dapat dimuat. Muat ulang halaman atau hubungi AYA.";
      document.body.insertBefore(banner, document.body.firstChild);
    }
  }

  window.AYA = Object.freeze({
    CART_KEY,
    config,
    products,
    currency,
    statusLabel,
    minimumPrice,
    getProduct,
    getCart,
    saveCart,
    cartCount,
    cartTotal,
    addCartItem,
    updateCartItem,
    removeCartItem,
    updateCartCount,
    showToast,
    openWhatsApp,
    buildProductMessage,
    buildCartMessage,
    createMedia,
    createProductCard,
    make
  });

  document.addEventListener("DOMContentLoaded", () => {
    bindNavigation();
    bindDirectActions();
    bindImageFallbacks();
    setCurrentYear();
    updateCartCount();
    announceConfigurationState();
  });
})();

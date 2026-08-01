(() => {
  const CART_KEY = "aya-raos-cart-v2";
  const config = window.AYA_CONFIG || {};
  const products = window.AYA_PRODUCTS || [];

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  });

  const currency = value =>
    formatter
      .format(Number(value) || 0)
      .replace(/\s/g, "");

  const getProduct = id =>
    products.find(product => product.id === id);

  const safeParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  function resolveStorage() {
    for (const storageName of ["localStorage", "sessionStorage"]) {
      try {
        const storage = window[storageName];
        const testKey = "__aya_storage_test__";

        storage.setItem(testKey, "1");
        storage.removeItem(testKey);

        return storage;
      } catch (error) {
        console.warn(
          `AYA: ${storageName} tidak tersedia.`,
          error
        );
      }
    }

    return null;
  }

  const storage = resolveStorage();
  let memoryCart = [];

  function getCart() {
    if (!storage) return memoryCart;

    return safeParse(
      storage.getItem(CART_KEY),
      []
    );
  }

  function saveCart(cart) {
    memoryCart = cart;

    try {
      storage?.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "AYA: keranjang gagal disimpan.",
        error
      );

      showToast(
        "Keranjang tersimpan sementara di halaman ini."
      );
    }

    updateCartCount(true);

    window.dispatchEvent(
      new CustomEvent("aya:cart-updated", {
        detail: { cart }
      })
    );

    return true;
  }

  const cartCount = cart =>
    cart.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

  const cartTotal = cart =>
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.quantity || 0),
      0
    );

  function addCartItem(
    productId,
    variantIndex = 0,
    quantity = 1
  ) {
    const product = getProduct(productId);

    if (
      !product ||
      !product.available ||
      !product.variants?.length
    ) {
      showToast(
        "Produk ini belum tersedia untuk dipesan."
      );

      return false;
    }

    const safeVariantIndex = Math.max(
      0,
      Math.min(
        Number(variantIndex) || 0,
        product.variants.length - 1
      )
    );

    const variant =
      product.variants[safeVariantIndex];

    const qty = Math.max(
      1,
      Math.min(20, Number(quantity) || 1)
    );

    const cart = getCart();

    const existing = cart.find(
      item =>
        item.productId === productId &&
        item.variant === variant.name
    );

    if (existing) {
      existing.quantity = Math.min(
        20,
        Number(existing.quantity) + qty
      );
    } else {
      cart.push({
        productId,
        variant: variant.name,
        price: Number(variant.price),
        quantity: qty
      });
    }

    saveCart(cart);

    showToast(
      `${product.name} ditambahkan.`,
      {
        actionLabel: "Lihat keranjang",
        actionHref: "cart.html"
      }
    );

    return true;
  }

  function updateCartCount(animate = false) {
    const count = cartCount(getCart());

    document
      .querySelectorAll("[data-cart-count]")
      .forEach(node => {
        node.textContent = count;

        if (!animate) return;

        const cartLink =
          node.closest(".cart-link");

        cartLink?.classList.remove(
          "is-updated"
        );

        window.requestAnimationFrame(() => {
          cartLink?.classList.add(
            "is-updated"
          );
        });

        window.setTimeout(() => {
          cartLink?.classList.remove(
            "is-updated"
          );
        }, 700);
      });
  }

  function showToast(
    message,
    options = {}
  ) {
    let toast =
      document.querySelector(".toast");

    if (!toast) {
      toast =
        document.createElement("div");

      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute(
        "aria-live",
        "polite"
      );

      document.body.appendChild(toast);
    }

    toast.replaceChildren();

    const text =
      document.createElement("span");

    text.textContent = message;
    toast.appendChild(text);

    if (
      options.actionLabel &&
      options.actionHref
    ) {
      const action =
        document.createElement("a");

      action.href = options.actionHref;
      action.textContent =
        options.actionLabel;

      toast.appendChild(action);
    }

    toast.classList.add("show");

    window.clearTimeout(showToast.timer);

    showToast.timer =
      window.setTimeout(() => {
        toast.classList.remove("show");
      }, 2800);
  }

  function buildWhatsAppMessage(
    cart,
    extra = {}
  ) {
    const lines = cart.map(
      (item, index) => {
        const product =
          getProduct(item.productId);

        const name =
          product?.name ||
          item.productId;

        return [
          `${index + 1}. ${name} — ${item.variant}`,
          `   ${item.quantity} × ${currency(item.price)} = ${currency(item.price * item.quantity)}`
        ].join("\n");
      }
    );

    const details = [];

    if (extra.customerName) {
      details.push(
        `Nama: ${extra.customerName}`
      );
    }

    if (extra.zone) {
      details.push(
        `Wilayah pengiriman: ${extra.zone}`
      );
    }

    if (extra.notes) {
      details.push(
        `Catatan: ${extra.notes}`
      );
    }

    return [
      `Halo ${config.businessName || "AYA RAOS"}, saya ingin memesan:`,
      "",
      ...lines,
      "",
      `Estimasi subtotal produk: ${currency(cartTotal(cart))}`,
      ...(details.length
        ? ["", ...details]
        : []),
      "",
      "Mohon konfirmasi ketersediaan, ongkir, dan total pembayarannya. Terima kasih."
    ].join("\n");
  }

  function openWhatsApp(message = "") {
    if (!config.whatsappNumber) {
      window.alert(
        "Nomor WhatsApp belum diisi. Buka js/config.js lalu isi whatsappNumber."
      );

      return false;
    }

    const url =
      `https://wa.me/${config.whatsappNumber}` +
      (
        message
          ? `?text=${encodeURIComponent(message)}`
          : ""
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    return true;
  }

  function openBusinessWhatsApp() {
    const message = [
      `Halo ${config.businessName || "AYA RAOS"},`,
      "",
      "Saya ingin menanyakan pesanan untuk kebutuhan usaha, kantor, atau acara.",
      "",
      "Nama / usaha:",
      "Jenis kebutuhan:",
      "Perkiraan jumlah:",
      "Tanggal dibutuhkan:",
      "Wilayah pengiriman:",
      "",
      "Mohon informasi pilihan produk dan ketentuannya. Terima kasih."
    ].join("\n");

    return openWhatsApp(message);
  }

  function bindNavigation() {
    const toggle =
      document.querySelector(
        "[data-menu-toggle]"
      );

    const panel =
      document.querySelector(
        "[data-mobile-panel]"
      );

    if (!toggle || !panel) return;

    const closeMenu = () => {
      panel.classList.remove("open");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      document.body.classList.remove(
        "menu-open"
      );
    };

    toggle.addEventListener(
      "click",
      () => {
        const open =
          panel.classList.toggle("open");

        toggle.setAttribute(
          "aria-expanded",
          String(open)
        );

        document.body.classList.toggle(
          "menu-open",
          open
        );
      }
    );

    panel
      .querySelectorAll("a")
      .forEach(link =>
        link.addEventListener(
          "click",
          closeMenu
        )
      );

    document.addEventListener(
      "keydown",
      event => {
        if (event.key === "Escape") {
          closeMenu();
        }
      }
    );
  }

  function bindExternalActions() {
    document.addEventListener(
      "click",
      event => {
        const direct =
          event.target.closest(
            "[data-direct-whatsapp]"
          );

        if (direct) {
          event.preventDefault();
          openWhatsApp();
          return;
        }

        const business =
          event.target.closest(
            "[data-b2b-whatsapp]"
          );

        if (business) {
          event.preventDefault();
          openBusinessWhatsApp();
        }
      }
    );
  }

  function injectFooterEnhancements() {
    document
      .querySelectorAll(".footer-brand")
      .forEach(footerBrand => {
        if (
          footerBrand.querySelector(
            ".footer-socials"
          )
        ) {
          return;
        }

        const socials =
          document.createElement("div");

        socials.className =
          "footer-socials";

        if (config.instagramUrl) {
          const instagram =
            document.createElement("a");

          instagram.className =
            "footer-social-link";

          instagram.href =
            config.instagramUrl;

          instagram.target = "_blank";
          instagram.rel =
            "noopener noreferrer";

          instagram.setAttribute(
            "aria-label",
            "Buka Instagram AYA"
          );

          instagram.innerHTML = `
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
              ></rect>
              <circle
                cx="12"
                cy="12"
                r="4"
              ></circle>
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                class="instagram-dot"
              ></circle>
            </svg>
            <span>
              ${config.instagramHandle || "Instagram"}
            </span>
          `;

          socials.appendChild(
            instagram
          );
        }

        footerBrand.appendChild(
          socials
        );
      });

    document
      .querySelectorAll(".footer-column")
      .forEach(column => {
        const heading =
          column.querySelector("h3");

        if (
          !heading ||
          !/bantuan/i.test(
            heading.textContent
          ) ||
          column.querySelector(
            "[data-business-footer-link]"
          )
        ) {
          return;
        }

        const businessLink =
          document.createElement("a");

        businessLink.href =
          "information.html#pesanan-usaha";

        businessLink.dataset
          .businessFooterLink = "";

        businessLink.textContent =
          "Pesanan Usaha & Acara";

        column.appendChild(
          businessLink
        );
      });
  }

  function setCurrentYear() {
    document
      .querySelectorAll(
        "[data-current-year]"
      )
      .forEach(node => {
        node.textContent =
          new Date().getFullYear();
      });
  }

  function imageOrPlaceholder(
    product,
    className = ""
  ) {
    if (product.image) {
      return `
        <img
          class="${className}"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        />
      `;
    }

    return `
      <div
        class="product-placeholder ${className}"
        aria-label="Foto ${product.name} sedang disiapkan"
      >
        ${product.name}
      </div>
    `;
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

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      bindNavigation();
      bindExternalActions();
      injectFooterEnhancements();
      setCurrentYear();
      updateCartCount();
    }
  );
})();

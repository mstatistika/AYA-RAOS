(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-product-root]");
    if (!root || !window.AYA || !Array.isArray(window.AYA_PRODUCTS)) return;

    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const entrySource = String(params.get("src") || "").trim().slice(0, 120);
    const product = window.AYA.getProduct(id);

    const validVariants = (entry) =>
      Array.isArray(entry?.variants)
        ? entry.variants.filter((variant) =>
            variant &&
            typeof variant.name === "string" &&
            variant.name.trim() &&
            Number.isFinite(Number(variant.price)) &&
            Number(variant.price) > 0
          )
        : [];

    const isPublicEligible = (entry) => {
      if (!entry || entry.visible !== true) return false;
      const requiredText = [
        entry.id, entry.name, entry.line, entry.lineKey,
        entry.category, entry.description, entry.publicStatus
      ];
      if (requiredText.some((value) => typeof value !== "string" || !value.trim())) return false;
      if (!(entry.image || entry.placeholder)) return false;
      return validVariants(entry).length > 0;
    };

    if (!isPublicEligible(product)) {
      root.innerHTML =
        '<div class="empty-state product-empty">' +
        '<strong>Produk tidak ditemukan.</strong>' +
        '<p>Produk mungkin belum dipublikasikan atau informasi publiknya belum lengkap.</p>' +
        '<a class="button button-primary" href="products.html">Kembali ke Katalog</a>' +
        '</div>';
      return;
    }

    const variants = validVariants(product);
    const singleVariant = variants.length === 1;
    const linePages = Object.freeze({
      spice: "spice.html",
      farm: "farm.html",
      snack: "snacks.html"
    });
    const linePage = linePages[product.lineKey] || "index.html#lini-aya";
    const linePageUrl = (() => {
      if (!entrySource || linePage.includes("#")) return linePage;
      const url = new URL(linePage, location.href);
      url.searchParams.set("src", entrySource);
      return `${url.pathname.split("/").pop()}${url.search}`;
    })();

    document.body.dataset.productLine = product.lineKey;
    document.title = `${product.name} — ${product.line} · AYA RAOS`;

    const breadcrumbProduct = document.querySelector("[data-breadcrumb-product]");
    if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;

    const breadcrumbLine = document.querySelector("[data-breadcrumb-line]");
    if (breadcrumbLine) {
      breadcrumbLine.textContent = product.line;
      breadcrumbLine.setAttribute("href", linePageUrl);
    }

    const detailImages = [...(product.images || [])].filter(Boolean);
    detailImages.sort((a, b) => {
      const ah = /(^|\/)hero-/i.test(a) ? 0 : 1;
      const bh = /(^|\/)hero-/i.test(b) ? 0 : 1;
      return ah - bh;
    });
    const baseImages = [...detailImages, product.image].filter(Boolean);
    const images = [...new Set(baseImages.length ? baseImages : [product.placeholder].filter(Boolean))];
    const initial = images[0] || product.placeholder;

    const rules = window.AYA.quantityRules(product);
    const sold = !product.orderable;
    const startPrice = Math.min(...variants.map((variant) => Number(variant.price)));

    const isMeaningful = (value) => {
      if (typeof value !== "string" || !value.trim()) return false;
      return !/(sedang disiapkan|belum tersedia|belum terverifikasi)/i.test(value);
    };

    const productDetailCopy = Object.freeze({
      "sambal-bawang": {
        hero: "Sambal pendamping untuk melengkapi makan sehari-hari, hadir dalam empat varian dengan karakter pedas yang tegas.",
        about: "Sambal Bawang AYA hadir dalam empat varian—Original, Cumi/Pete, Jengkol, dan Teri Nasi—untuk menyesuaikan selera Anda.",
        flavor: "Pedas yang tegas menjadi karakter utamanya. Setiap varian membawa karakter bahan yang berbeda.",
        use: "Cocok untuk nasi hangat, lauk rumahan, mi, dan hidangan sehari-hari."
      }
    });

    const detailCopy = productDetailCopy[product.id] || null;
    const aboutText = detailCopy?.about || `Produk ini berada dalam lini ${product.line}, kategori ${product.category}.`;
    const heroText = detailCopy?.hero || product.description;

    const introItems = [
      {
        key: "about",
        title: "Tentang Produk",
        value: aboutText,
        icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 54V27"></path><path d="M32 36c-10 0-16-7-16-17 10 0 16 7 16 17Z"></path><path d="M32 32c10 0 16-7 16-17-10 0-16 7-16 17Z"></path><path d="M22 54h20"></path></svg>`
      },
      {
        key: "flavor",
        title: "Karakter Rasa",
        value: detailCopy?.flavor || (isMeaningful(product.flavorProfile) ? product.flavorProfile : ""),
        icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M44 12c-3 9-11 10-17 15-7 6-8 15-2 21 6 7 17 5 22-3 5-8 1-18-3-25"></path><path d="M23 42c4 0 7 2 10 5"></path></svg>`
      },
      {
        key: "use",
        title: "Cocok Dinikmati Dengan",
        value: detailCopy?.use || (isMeaningful(product.suitableUse) ? product.suitableUse : ""),
        icon: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 34h36c0 13-7 20-18 20S14 47 14 34Z"></path><path d="M20 29h24"></path><path d="M24 16c-4 5 2 7-1 12M34 12c-4 5 2 7-1 12M44 16c-4 5 2 7-1 12"></path></svg>`
      }
    ].filter((item) => isMeaningful(item.value));

    const variantMarkup = variants.map((variant) =>
      `<label class="product-variant-tile">
        <input type="radio" name="variant" value="${window.AYA.escapeHTML(variant.name)}" ${singleVariant ? "checked" : ""}/>
        <span>
          <strong>${window.AYA.escapeHTML(variant.name)}</strong>
          <small>${window.AYA.formatPrice(variant.price)}</small>
          <i aria-hidden="true">✓</i>
        </span>
      </label>`
    ).join("");

    root.innerHTML = `<div class="product-hero-grid">
      <div class="product-gallery">
        <div class="product-main-image">
          <img
            src="${window.AYA.escapeHTML(initial)}"
            alt="${window.AYA.escapeHTML(product.name)}"
            width="1100"
            height="1100"
            data-main-image
            data-image-fallback="${window.AYA.escapeHTML(product.id)}"
          />
        </div>

        ${images.length > 1 ? `<div class="product-gallery-strip">
          <button class="gallery-step gallery-step-prev" type="button" data-gallery-prev aria-label="Foto sebelumnya">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"></path></svg>
          </button>
          <div class="product-thumbnails" aria-label="Pilihan foto ${window.AYA.escapeHTML(product.name)}">
            ${images.map((src, index) => `<button
              type="button"
              data-thumb="${window.AYA.escapeHTML(src)}"
              ${index === 0 ? 'aria-current="true"' : ""}
              aria-label="Tampilkan foto ${index + 1}">
              <img
                src="${window.AYA.escapeHTML(src)}"
                alt=""
                width="170"
                height="140"
                data-image-fallback="${window.AYA.escapeHTML(product.id)}"
              />
            </button>`).join("")}
          </div>
          <button class="gallery-step gallery-step-next" type="button" data-gallery-next aria-label="Foto berikutnya">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"></path></svg>
          </button>
        </div>` : ""}
      </div>

      <article class="product-hero-copy">
        <div class="product-identity-meta">
          <div class="product-line-category">
            <a
              class="product-line-label line-${window.AYA.escapeHTML(product.lineKey)}"
              href="${window.AYA.escapeHTML(linePageUrl)}">${window.AYA.escapeHTML(product.line)}</a>
            <span aria-hidden="true">·</span>
            <span>${window.AYA.escapeHTML(product.category)}</span>
          </div>
        </div>

        <h1>${window.AYA.escapeHTML(product.name)}</h1>
        <div class="product-identity-rule" aria-hidden="true"><span></span></div>
        <p class="product-hero-statement">${window.AYA.escapeHTML(heroText)}</p>

        <div class="product-intro-trio intro-count-${introItems.length}">
          ${introItems.map((item) => `<section data-intro="${item.key}">
            <span class="product-intro-icon">${item.icon}</span>
            <h2>${window.AYA.escapeHTML(item.title)}</h2>
            <p>${window.AYA.escapeHTML(item.value)}</p>
          </section>`).join("")}
        </div>

        <form class="product-commerce-card" data-purchase-form novalidate>
          <div class="commerce-summary-column">
            <div class="commerce-price">
              <span>${variants.length > 1 ? "Mulai dari" : "Harga"}</span>
              <strong>${window.AYA.formatPrice(startPrice)}</strong>
            </div>

            <label class="qty-field">
              <span>Jumlah</span>
              <span class="qty-stepper">
                <button type="button" data-qty-minus aria-label="Kurangi jumlah">−</button>
                <input
                  type="number"
                  name="quantity"
                  min="${rules.min}"
                  max="${rules.max}"
                  step="${rules.step}"
                  value="${rules.min}"
                  ${sold ? "disabled" : ""}
                />
                <button type="button" data-qty-plus aria-label="Tambah jumlah">+</button>
              </span>
            </label>

          </div>

          <div class="commerce-choice-column">
            <fieldset class="variant-fieldset" ${sold ? "disabled" : ""}>
              <legend class="sr-only">${singleVariant ? "Varian" : "Pilih Varian"}</legend>
              ${variantMarkup}
            </fieldset>

            <div
              class="form-error-summary compact-error"
              data-product-error
              tabindex="-1"
              hidden></div>

            <button class="button product-add-button" type="submit" ${sold ? "disabled" : ""}>
              ${sold ? "Belum Tersedia" : "Tambah ke Keranjang"}
            </button>
          </div>

          ${rules.min > 1 ? `<p class="minimum-note">Minimum pemesanan produk ini: ${rules.min}.</p>` : ""}
        </form>
      </article>
    </div>`;

    const thumbs = [...root.querySelectorAll("[data-thumb]")];

    const setImage = (button) => {
      const image = root.querySelector("[data-main-image]");
      if (!image || !button) return;
      image.src = button.dataset.thumb;
      thumbs.forEach((node) => node.removeAttribute("aria-current"));
      button.setAttribute("aria-current", "true");
    };

    thumbs.forEach((button) => button.addEventListener("click", () => setImage(button)));

    const stepGallery = (direction) => {
      if (!thumbs.length) return;
      let index = thumbs.findIndex((node) => node.getAttribute("aria-current") === "true");
      if (index < 0) index = 0;
      index = (index + direction + thumbs.length) % thumbs.length;
      setImage(thumbs[index]);
    };

    root.querySelector("[data-gallery-prev]")?.addEventListener("click", () => stepGallery(-1));
    root.querySelector("[data-gallery-next]")?.addEventListener("click", () => stepGallery(1));

    const form = root.querySelector("[data-purchase-form]");
    const error = root.querySelector("[data-product-error]");
    const quantity = form.querySelector('[name="quantity"]');

    const update = () => {
      const qty = window.AYA.normalizeProductQuantity(product, quantity.value);
      quantity.value = String(qty);
      error.hidden = true;
    };

    root.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
      quantity.value = String(Number(quantity.value || rules.min) - rules.step);
      update();
    });

    root.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
      quantity.value = String(Number(quantity.value || rules.min) + rules.step);
      update();
    });

    form.addEventListener("input", update);
    form.addEventListener("change", update);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (sold) return;

      const data = new FormData(form);
      const variant = data.get("variant");

      if (!variant) {
        error.hidden = false;
        error.textContent = "Pilih satu varian sebelum menambahkan produk.";
        error.focus();
        return;
      }

      window.AYA.addToCart(product.id, variant, data.get("quantity"));
    });

    update();
  });
})();
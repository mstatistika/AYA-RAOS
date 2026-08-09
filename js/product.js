(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-product-root]");
    const info = document.querySelector("[data-product-information]");
    if (!root || !window.AYA) return;

    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const entrySource = String(params.get("src") || "").trim().slice(0, 120);
    const product = window.AYA.getProduct(id);
    if (!product || !product.visible) {
      root.innerHTML = '<div class="empty-state"><strong>Produk tidak ditemukan.</strong><p>Produk mungkin belum dipublikasikan atau tautannya tidak valid.</p><a class="button button-primary" href="products.html">Kembali ke Katalog</a></div>';
      return;
    }

    const linePages = Object.freeze({ spice: "spice.html", farm: "farm.html", snack: "snacks.html" });
    const linePage = linePages[product.lineKey] || "index.html#lini-aya";
    const linePageUrl = (() => {
      if (!entrySource || linePage.includes("#")) return linePage;
      const url = new URL(linePage, location.href); url.searchParams.set("src", entrySource);
      return `${url.pathname.split("/").pop()}${url.search}`;
    })();

    document.title = `${product.name} — ${product.line} · AYA RAOS`;
    document.querySelector("[data-breadcrumb-product]").textContent = product.name;
    const breadcrumbLine = document.querySelector("[data-breadcrumb-line]");
    if (breadcrumbLine) { breadcrumbLine.textContent = product.line; breadcrumbLine.setAttribute("href", linePageUrl); }

    const mockupSambal = product.id === "sambal-bawang";
    const approvedHero = Object.freeze({
      "bawang-goreng-sumenep": "assets/visual/catalog/catalog-bawang.webp",
      "rendang-daging-sapi": "assets/visual/catalog/catalog-rendang.webp",
      "ayam-goreng-kuning": "assets/visual/catalog/catalog-ayam.webp",
      "dimsum-chili-oil": "assets/visual/catalog/catalog-dimsum.webp"
    });
    const baseImages = (product.images?.length ? product.images : [product.image || product.placeholder]).filter(Boolean);
    const images = mockupSambal ? [
      "assets/visual/product/product-sambal-hero.webp",
      "assets/visual/product/product-thumb-2.webp",
      "assets/visual/product/product-thumb-3.webp",
      "assets/visual/product/product-thumb-4.webp"
    ] : [approvedHero[product.id] || baseImages[0] || product.placeholder, ...baseImages.slice(1)];
    const initial = images[0] || product.placeholder;
    const rules = window.AYA.quantityRules(product);
    const sold = !product.orderable;
    const singleVariant = product.variants.length === 1;

    const variantMarkup = product.variants.length ? product.variants.map((variant) => `<label class="variant-option"><input type="radio" name="variant" value="${window.AYA.escapeHTML(variant.name)}" ${singleVariant ? "checked" : ""}/><span><i aria-hidden="true"></i><strong>${window.AYA.escapeHTML(variant.name)}</strong><small>${window.AYA.formatPrice(variant.price)}</small></span></label>`).join("") : '<div class="system-state state-warning">Harga dan varian belum disetujui.</div>';

    const highlights = [];
    if (product.spiceCharacter) highlights.push(["chili", product.spiceCharacter, "Karakter rasa"]);
    if (product.badges?.includes("Hero Product")) highlights.push(["star", "Hero Product", "Produk utama AYA"]);
    highlights.push(["jar", `${product.variants.length} Varian Pilihan`, "Pilih sesuai kebutuhan"]);
    const icon = (type) => type === "star" ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.4 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3Z"/></svg>` : type === "jar" ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8M9 6h6l1.5 2.5V20H7.5V8.5L9 6Zm1.5 6h3"/></svg>` : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 3.5c-1.8 3.7-5.8 4.1-7.4 7.7-1.2 2.8.1 6.4 3 8.1 2.9 1.8 6.2.2 7.3-2.6 1.3-3.4-.4-7.1-2.9-9.4M8 15c1.2.2 2.2.8 3 1.8"/></svg>`;

    root.innerHTML = `<div class="product-detail-grid ${images.length === 1 ? "product-detail-single" : ""}">
      <div class="product-gallery ${images.length === 1 ? "product-gallery-single" : ""}">
        <div class="product-main-image ${mockupSambal ? "product-main-image-mockup" : "product-main-image-generic"}"><img src="${window.AYA.escapeHTML(initial)}" alt="${window.AYA.escapeHTML(product.name)}" width="900" height="900" data-main-image data-image-fallback="${window.AYA.escapeHTML(product.id)}"/></div>
        ${images.length > 1 ? `<div class="product-thumbnails">${images.map((src, index) => `<button type="button" data-thumb="${window.AYA.escapeHTML(src)}" ${index === 0 ? 'aria-current="true"' : ""}><img src="${window.AYA.escapeHTML(index === 0 && mockupSambal ? "assets/visual/product/product-thumb-1.webp" : src)}" alt="Tampilan ${index + 1} ${window.AYA.escapeHTML(product.name)}" width="120" height="90" data-image-fallback="${window.AYA.escapeHTML(product.id)}"/></button>`).join("")}</div>` : ""}
      </div>
      <div class="purchase-panel">
        <div class="product-heading-meta"><a class="product-line-label line-${product.lineKey}" href="${window.AYA.escapeHTML(linePageUrl)}">${window.AYA.escapeHTML(product.line)}</a><span>${window.AYA.escapeHTML(product.category)}</span></div>
        <h1>${window.AYA.escapeHTML(product.name)}</h1>
        <p class="product-promise">${window.AYA.escapeHTML(product.description)}</p>
        <div class="product-gold-rule"><span></span></div>
        <div class="product-highlights">${highlights.slice(0,3).map(([type,title,desc]) => `<div>${icon(type)}<p><strong>${window.AYA.escapeHTML(title)}</strong><small>${window.AYA.escapeHTML(desc)}</small></p></div>`).join("")}</div>
        <form id="pesan" data-purchase-form novalidate>
          <fieldset class="variant-fieldset" ${sold ? "disabled" : ""}><legend>${singleVariant ? "Varian" : "Pilih varian"}</legend>${variantMarkup}</fieldset>
          <div class="form-error-summary compact-error" data-product-error tabindex="-1" hidden></div>
          <div class="selected-subtotal"><span>Subtotal</span><strong data-selected-subtotal>${singleVariant ? window.AYA.formatPrice(product.variants[0].price * rules.min) : "Pilih varian"}</strong></div>
          <div class="purchase-action-row">
            <label class="qty-field"><span>Jumlah</span><span class="qty-stepper"><button type="button" data-qty-minus aria-label="Kurangi jumlah">−</button><input type="number" name="quantity" min="${rules.min}" max="${rules.max}" step="${rules.step}" value="${rules.min}" ${sold ? "disabled" : ""}/><button type="button" data-qty-plus aria-label="Tambah jumlah">+</button></span></label>
            <button class="button product-add-button" type="submit" ${sold ? "disabled" : ""}><span class="bag-icon" aria-hidden="true">♧</span>${sold ? "Belum Tersedia" : "Tambah ke Keranjang"}</button>
          </div>
          ${rules.min > 1 ? `<p class="minimum-note">Minimum pemesanan produk ini: ${rules.min}.</p>` : ""}
          <a class="product-order-help" href="information.html#cara-pesan">Lihat Cara Pesan <span aria-hidden="true">›</span></a>
        </form>
        <div class="purchase-facts"><div><strong>Persiapan</strong><span>${window.AYA.escapeHTML(product.leadTime)}</span></div><div><strong>Pengiriman</strong><span>${window.AYA.escapeHTML(product.shipping)}</span></div></div>
      </div>
    </div>`;

    info.hidden = false;
    const infoIcons = {
      "Profil Rasa": `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M43 13c-8 10-20 9-25 20-5 11 4 23 15 22 12-2 18-14 13-24-2-5-5-8-3-18Z"/><path d="M16 18c8 2 13 7 15 13"/></svg>`,
      "Komposisi": `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 28h31c0 16-6 24-16 24S16 44 16 28Z"/><path d="M22 23h20M37 8l8 16M40 7l7-3"/></svg>`,
      "Penyimpanan": `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M23 13h18M25 18h14l4 7v28H21V25l4-7Z"/><path d="M27 34h10M27 39h10"/></svg>`,
      "Cara Menikmati": `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 33h36c0 13-7 20-18 20S14 46 14 33Z"/><path d="M23 16c-4 5 2 7-1 12M33 12c-4 5 2 7-1 12M43 16c-4 5 2 7-1 12"/></svg>`
    };
    const infoItems = [["Profil Rasa", product.flavorProfile],["Komposisi", product.composition],["Penyimpanan", product.storage],["Cara Menikmati", product.suitableUse]];
    document.querySelector("[data-product-info-grid]").innerHTML = infoItems.map(([title, value]) => `<article><span class="product-info-icon">${infoIcons[title]}</span><h3>${window.AYA.escapeHTML(title)}</h3><p>${window.AYA.escapeHTML(value || "Informasi belum tersedia.")}</p></article>`).join("");

    root.querySelectorAll("[data-thumb]").forEach((button) => button.addEventListener("click", () => {
      root.querySelector("[data-main-image]").src = button.dataset.thumb;
      root.querySelectorAll("[data-thumb]").forEach((node) => node.removeAttribute("aria-current")); button.setAttribute("aria-current", "true");
    }));

    const form = root.querySelector("[data-purchase-form]");
    const subtotal = root.querySelector("[data-selected-subtotal]");
    const error = root.querySelector("[data-product-error]");
    const quantity = form.querySelector('[name="quantity"]');
    const update = () => {
      const data = new FormData(form); const variant = window.AYA.getVariant(product, data.get("variant")); const qty = window.AYA.normalizeProductQuantity(product, data.get("quantity"));
      quantity.value = String(qty); subtotal.textContent = variant ? window.AYA.formatPrice(variant.price * qty) : "Pilih varian"; error.hidden = true;
    };
    root.querySelector("[data-qty-minus]")?.addEventListener("click", () => { quantity.value = String(Number(quantity.value || rules.min) - rules.step); update(); });
    root.querySelector("[data-qty-plus]")?.addEventListener("click", () => { quantity.value = String(Number(quantity.value || rules.min) + rules.step); update(); });
    form.addEventListener("input", update);
    form.addEventListener("submit", (event) => {
      event.preventDefault(); const data = new FormData(form); const variant = data.get("variant");
      if (!variant) { error.hidden = false; error.textContent = "Pilih satu varian sebelum menambahkan produk."; error.focus(); return; }
      if (window.AYA.addToCart(product.id, variant, data.get("quantity"))) root.querySelector(".product-order-help")?.focus();
    });
    update();
  });
})();

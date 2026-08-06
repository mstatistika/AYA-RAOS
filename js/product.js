(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-product-root]");
    const info = document.querySelector("[data-product-information]");
    if (!root || !window.AYA) return;

    const id = new URLSearchParams(location.search).get("id");
    const product = window.AYA.getProduct(id);
    if (!product || !product.visible) {
      root.innerHTML = '<div class="empty-state"><strong>Produk tidak ditemukan.</strong><p>Produk mungkin belum dipublikasikan atau tautannya tidak valid.</p><a class="button button-primary" href="products.html">Kembali ke Katalog</a></div>';
      return;
    }

    document.title = `${product.name} — AYA RAOS`;
    document.querySelector("[data-breadcrumb-product]").textContent = product.name;

    const images = (product.images?.length ? product.images : [product.image || product.placeholder]).filter(Boolean);
    const initial = images[0] || product.placeholder;
    const rules = window.AYA.quantityRules(product);
    const sold = !product.orderable;
    const singleVariant = product.variants.length === 1;

    const variantMarkup = product.variants.length ? product.variants.map((variant) => `<label class="variant-option"><input type="radio" name="variant" value="${window.AYA.escapeHTML(variant.name)}" ${singleVariant ? "checked" : ""}/><span><strong>${window.AYA.escapeHTML(variant.name)}</strong><small>${window.AYA.formatPrice(variant.price)}</small></span></label>`).join("") : '<div class="system-state state-warning">Harga dan varian belum disetujui.</div>';

    root.innerHTML = `<div class="product-detail-grid">
      <div class="product-gallery">
        <div class="product-main-image"><img src="${window.AYA.escapeHTML(initial)}" alt="${window.AYA.escapeHTML(product.name)}" width="900" height="900" data-main-image data-image-fallback="${window.AYA.escapeHTML(product.id)}"/><span class="status-badge status-${product.status}">${window.AYA.escapeHTML(product.publicStatus)}</span></div>
        ${images.length > 1 ? `<div class="product-thumbnails">${images.map((src, index) => `<button type="button" data-thumb="${window.AYA.escapeHTML(src)}" ${index === 0 ? 'aria-current="true"' : ""}><img src="${window.AYA.escapeHTML(src)}" alt="Tampilan ${index + 1} ${window.AYA.escapeHTML(product.name)}" width="120" height="120" data-image-fallback="${window.AYA.escapeHTML(product.id)}"/></button>`).join("")}</div>` : ""}
      </div>
      <div class="purchase-panel">
        <div class="product-heading-meta"><span class="line-label line-${product.lineKey}">${window.AYA.escapeHTML(product.line)}</span><small>${window.AYA.escapeHTML(product.category)}</small></div>
        <h1>${window.AYA.escapeHTML(product.name)}</h1>
        <p class="product-promise">${window.AYA.escapeHTML(product.description)}</p>
        ${product.spiceCharacter ? `<div class="spice-character"><span>Karakter sambal</span><strong>${window.AYA.escapeHTML(product.spiceCharacter)}</strong><small>Bukan pilihan level.</small></div>` : ""}
        ${product.badges?.length ? `<div class="badge-row">${product.badges.map((badge) => `<span>${window.AYA.escapeHTML(badge)}</span>`).join("")}</div>` : ""}
        <form data-purchase-form novalidate>
          <fieldset class="variant-fieldset" ${sold ? "disabled" : ""}><legend>${singleVariant ? "Varian" : "Pilih varian"}</legend>${variantMarkup}</fieldset>
          <div class="form-error-summary compact-error" data-product-error tabindex="-1" hidden></div>
          <div class="purchase-row">
            <label class="qty-field"><span>Jumlah</span><input type="number" name="quantity" min="${rules.min}" max="${rules.max}" step="${rules.step}" value="${rules.min}" ${sold ? "disabled" : ""}/></label>
            <div class="selected-subtotal"><span>Subtotal</span><strong data-selected-subtotal>${singleVariant ? window.AYA.formatPrice(product.variants[0].price * rules.min) : "Pilih varian"}</strong></div>
          </div>
          ${rules.min > 1 ? `<p class="minimum-note">Minimum pemesanan produk ini: ${rules.min}.</p>` : ""}
          <button class="button button-primary button-wide" type="submit" ${sold ? "disabled" : ""}>${sold ? "Belum Tersedia" : "Tambah ke Keranjang"}</button>
          <a class="button button-secondary button-wide" href="cart.html?context=personal">Buka Keranjang</a>
        </form>
        <div class="purchase-facts"><div><strong>Lead time</strong><span>${window.AYA.escapeHTML(product.leadTime)}</span></div><div><strong>Pengiriman</strong><span>${window.AYA.escapeHTML(product.shipping)}</span></div></div>
      </div>
    </div>`;

    info.hidden = false;
    const infoItems = [
      ["Profil Rasa", product.flavorProfile],
      ["Komposisi", product.composition],
      ["Penyimpanan", product.storage],
      ["Cocok Dinikmati", product.suitableUse]
    ];
    document.querySelector("[data-product-info-grid]").innerHTML = infoItems.map(([title, value]) => `<article><span>${window.AYA.escapeHTML(title)}</span><p>${window.AYA.escapeHTML(value || "Informasi belum tersedia.")}</p></article>`).join("");

    root.querySelectorAll("[data-thumb]").forEach((button) => button.addEventListener("click", () => {
      root.querySelector("[data-main-image]").src = button.dataset.thumb;
      root.querySelectorAll("[data-thumb]").forEach((node) => node.removeAttribute("aria-current"));
      button.setAttribute("aria-current", "true");
    }));

    const form = root.querySelector("[data-purchase-form]");
    const subtotal = root.querySelector("[data-selected-subtotal]");
    const error = root.querySelector("[data-product-error]");
    const quantity = form.querySelector('[name="quantity"]');

    const update = () => {
      const data = new FormData(form);
      const variant = window.AYA.getVariant(product, data.get("variant"));
      const qty = window.AYA.normalizeProductQuantity(product, data.get("quantity"));
      quantity.value = String(qty);
      subtotal.textContent = variant ? window.AYA.formatPrice(variant.price * qty) : "Pilih varian";
      error.hidden = true;
    };

    form.addEventListener("input", update);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const variant = data.get("variant");
      if (!variant) {
        error.hidden = false; error.textContent = "Pilih satu varian sebelum menambahkan produk."; error.focus(); return;
      }
      if (window.AYA.addToCart(product.id, variant, data.get("quantity"))) {
        form.querySelector('a[href^="cart.html"]')?.focus();
      }
    });
  });
})();

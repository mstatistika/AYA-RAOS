(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;

    const root = document.querySelector("[data-product-detail]");
    if (!root) return;

    const productId = new URLSearchParams(location.search).get("id") || "sambal-bawang";
    const product = window.AYA.getProduct(productId);

    if (!product) {
      root.replaceChildren();
      const error = window.AYA.make("div", "empty-state product-detail-error");
      error.append(
        window.AYA.make("span", "", "Produk tidak ditemukan"),
        window.AYA.make("h1", "", "Detail produk belum tersedia."),
        window.AYA.make("p", "", "Kembali ke katalog untuk memilih produk lain.")
      );
      const link = window.AYA.make("a", "button button-primary", "Kembali ke Katalog");
      link.href = "products.html";
      error.appendChild(link);
      root.appendChild(error);
      return;
    }

    document.title = `${product.name} — AYA RAOS`;
    document.querySelector("[data-breadcrumb-product]").textContent = product.name;

    root.replaceChildren();

    const layout = window.AYA.make("div", "product-detail-layout");
    const gallery = window.AYA.make("section", "product-gallery");
    const mainMedia = window.AYA.createMedia(product, "product-gallery-main");
    mainMedia.querySelector("img")?.setAttribute("loading", "eager");
    const thumbs = window.AYA.make("div", "product-gallery-thumbs");
    const thumb = window.AYA.make("button", "active");
    thumb.type = "button";
    thumb.setAttribute("aria-label", `Foto ${product.name}`);
    const thumbImage = document.createElement("img");
    thumbImage.src = product.image || product.placeholder;
    thumbImage.alt = "";
    thumbImage.addEventListener("error", () => {
      if (thumbImage.src.endsWith(product.placeholder)) return;
      thumbImage.src = product.placeholder;
    }, { once: true });
    thumb.appendChild(thumbImage);
    thumbs.appendChild(thumb);
    gallery.append(mainMedia, thumbs);

    const summary = window.AYA.make("section", "product-purchase-panel");
    const meta = window.AYA.make("div", "product-detail-meta");
    meta.append(
      window.AYA.make("span", "", product.line),
      window.AYA.make("span", "", product.category),
      window.AYA.make("span", `status-badge status-${product.status}`, window.AYA.statusLabel(product.status))
    );
    const title = window.AYA.make("h1", "", product.name);
    const description = window.AYA.make("p", "product-detail-description", product.description);
    const priceBox = window.AYA.make("div", "product-detail-price");
    const starting = window.AYA.minimumPrice(product);
    priceBox.append(
      window.AYA.make("span", "", starting ? "Harga mulai" : "Harga"),
      window.AYA.make("strong", "", starting ? window.AYA.currency(starting) : "Belum tersedia")
    );

    summary.append(meta, title, description, priceBox);

    if (product.status === "soldout" || !product.variants?.length) {
      const unavailable = window.AYA.make("div", "product-unavailable");
      unavailable.append(
        window.AYA.make("strong", "", "Produk belum dapat dipesan."),
        window.AYA.make("p", "", "Harga, varian, atau status akan diperbarui setelah disetujui.")
      );
      const ask = window.AYA.make("button", "button button-secondary button-full", "Tanyakan ke AYA");
      ask.type = "button";
      ask.addEventListener("click", () => {
        window.AYA.openWhatsApp([
          `Halo ${window.AYA.config.businessName || "AYA RAOS"},`,
          "",
          `Saya ingin menanyakan status produk ${product.name}.`,
          "",
          "Mohon informasinya. Terima kasih."
        ].join("\n"));
      });
      unavailable.appendChild(ask);
      summary.appendChild(unavailable);
    } else {
      const form = window.AYA.make("div", "product-purchase-form");

      const variantField = window.AYA.make("label", "form-field");
      variantField.appendChild(window.AYA.make("span", "", "Pilih varian"));
      const variantSelect = document.createElement("select");
      variantSelect.name = "variant";
      product.variants.forEach((variant, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${variant.name} — ${window.AYA.currency(variant.price)}`;
        variantSelect.appendChild(option);
      });
      variantField.appendChild(variantSelect);

      const quantityField = window.AYA.make("div", "quantity-field");
      quantityField.appendChild(window.AYA.make("span", "", "Jumlah"));
      const stepper = window.AYA.make("div", "quantity-stepper");
      const minus = window.AYA.make("button", "", "−");
      minus.type = "button";
      minus.setAttribute("aria-label", "Kurangi jumlah");
      const qty = document.createElement("input");
      qty.type = "number";
      qty.min = "1";
      qty.max = "99";
      qty.value = "1";
      qty.inputMode = "numeric";
      qty.setAttribute("aria-label", "Jumlah produk");
      const plus = window.AYA.make("button", "", "+");
      plus.type = "button";
      plus.setAttribute("aria-label", "Tambah jumlah");
      stepper.append(minus, qty, plus);
      quantityField.appendChild(stepper);

      const subtotal = window.AYA.make("div", "purchase-subtotal");
      subtotal.append(
        window.AYA.make("span", "", "Subtotal"),
        window.AYA.make("strong", "", window.AYA.currency(product.variants[0].price))
      );
      const subtotalValue = subtotal.querySelector("strong");

      const refresh = () => {
        const variant = product.variants[Number(variantSelect.value) || 0];
        const quantity = Math.max(1, Number(qty.value) || 1);
        qty.value = quantity;
        subtotalValue.textContent = window.AYA.currency(variant.price * quantity);
        priceBox.querySelector("strong").textContent = window.AYA.currency(variant.price);
      };

      minus.addEventListener("click", () => {
        qty.value = Math.max(1, Number(qty.value) - 1);
        refresh();
      });
      plus.addEventListener("click", () => {
        qty.value = Math.min(99, Number(qty.value) + 1);
        refresh();
      });
      qty.addEventListener("input", refresh);
      variantSelect.addEventListener("change", refresh);

      const actions = window.AYA.make("div", "product-purchase-actions");
      const add = window.AYA.make("button", "button button-secondary", "Tambah ke Keranjang");
      add.type = "button";
      add.addEventListener("click", () => {
        window.AYA.addCartItem(product.id, variantSelect.value, qty.value);
      });
      const order = window.AYA.make("button", "button button-primary", "Pesan via WhatsApp");
      order.type = "button";
      order.addEventListener("click", () => {
        const variant = product.variants[Number(variantSelect.value) || 0];
        window.AYA.openWhatsApp(window.AYA.buildProductMessage(product, variant, qty.value));
      });
      actions.append(add, order);

      form.append(variantField, quantityField, subtotal, actions);
      summary.appendChild(form);
    }

    const orderFacts = window.AYA.make("div", "product-order-facts");
    const factLead = window.AYA.make("div");
    factLead.append(window.AYA.make("span", "", "Lead time"), window.AYA.make("strong", "", product.leadTime));
    const factShip = window.AYA.make("div");
    factShip.append(window.AYA.make("span", "", "Pengiriman"), window.AYA.make("strong", "", product.shipping));
    orderFacts.append(factLead, factShip);
    summary.appendChild(orderFacts);

    layout.append(gallery, summary);
    root.appendChild(layout);

    const infoSection = document.querySelector("[data-product-information]");
    if (infoSection) {
      infoSection.hidden = false;
      document.querySelector("[data-info-heading]").textContent = `Tentang ${product.name}`;
      document.querySelector("[data-info-description]").textContent = product.details || "Informasi sedang disiapkan.";
      document.querySelector("[data-info-composition]").textContent = product.composition || "Informasi sedang disiapkan dan akan dikonfirmasi saat pemesanan.";
      document.querySelector("[data-info-storage]").textContent = product.storage || "Informasi sedang disiapkan dan akan dikonfirmasi saat pemesanan.";
      document.querySelector("[data-info-suitable]").textContent = product.suitableUse || "Informasi sedang disiapkan dan akan dikonfirmasi saat pemesanan.";
      document.querySelector("[data-info-order]").textContent = `${product.leadTime} ${product.shipping}`;
    }

    const relatedRoot = document.querySelector("[data-related-products]");
    const relatedSection = document.querySelector("[data-related-section]");
    if (relatedRoot && relatedSection) {
      const related = window.AYA.products
        .filter(item => item.id !== product.id && (item.lineKey === product.lineKey || item.category === product.category))
        .sort((a, b) => Number(a.priority || 99) - Number(b.priority || 99))
        .slice(0, 3);

      if (related.length) {
        relatedRoot.replaceChildren();
        related.forEach(item => relatedRoot.appendChild(window.AYA.createProductCard(item)));
        relatedSection.hidden = false;
      }
    }
  });
})();

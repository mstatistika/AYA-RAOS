(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA || !Array.isArray(window.AYA_PRODUCTS)) return;

    const root = document.querySelector("[data-line-product-grid]");
    if (!root) return;

    const lineKey = document.body.dataset.lineKey;
    const lines = Object.freeze({
      spice: Object.freeze({ label: "AYA Spice Haven", href: "spice.html" }),
      farm: Object.freeze({ label: "AYA Farm", href: "farm.html" }),
      snack: Object.freeze({ label: "AYA Snacks & Drinks", href: "snacks.html" })
    });
    const currentLine = lines[lineKey];
    if (!currentLine) {
      root.innerHTML = '<div class="empty-state"><strong>Lini tidak ditemukan.</strong><p>Kembali ke AYA RAOS untuk memilih lini yang tersedia.</p><a class="button button-primary" href="index.html#lini-aya">Buka AYA RAOS</a></div>';
      return;
    }

    const params = new URLSearchParams(location.search);
    const source = String(params.get("src") || "").trim().slice(0, 120);
    if (source) {
      try { sessionStorage.setItem("ayaRaos.entrySource", source); } catch { /* optional */ }
    }

    const productUrl = (productId) => {
      const url = new URL("product.html", location.href);
      url.searchParams.set("id", productId);
      url.searchParams.set("from", lineKey);
      if (source) url.searchParams.set("src", source);
      return `${url.pathname.split("/").pop()}${url.search}`;
    };

    const products = window.AYA_PRODUCTS
      .filter((product) => product.visible && product.lineKey === lineKey)
      .sort((a, b) => (a.catalogOrder || 999) - (b.catalogOrder || 999));

    const minPrice = (product) => {
      const values = (product.variants || []).map((variant) => Number(variant.price)).filter(Number.isFinite);
      return values.length ? Math.min(...values) : null;
    };

    if (!products.length) {
      root.innerHTML = '<div class="empty-state"><strong>Produk lini ini sedang disiapkan.</strong><p>Status akan diperbarui ketika data produk siap ditampilkan.</p></div>';
    } else {
      root.innerHTML = products.map((product) => {
        const price = minPrice(product);
        const detailUrl = productUrl(product.id);
        const priceText = price === null ? "Harga belum tersedia" : `${product.variants.length > 1 ? "Mulai " : ""}${window.AYA.formatPrice(price)}`;
        return `<article class="product-card">
          <a class="product-card-image" href="${window.AYA.escapeHTML(detailUrl)}">
            <img src="${window.AYA.escapeHTML(product.image || product.placeholder)}" alt="${window.AYA.escapeHTML(product.name)}" loading="lazy" width="700" height="700" data-image-fallback="${window.AYA.escapeHTML(product.id)}" />
            <span class="status-badge status-${product.status}">${window.AYA.escapeHTML(product.publicStatus)}</span>
          </a>
          <div class="product-card-body">
            <div class="product-card-kicker"><a class="line-label line-${product.lineKey}" href="${currentLine.href}">${window.AYA.escapeHTML(product.line)}</a><small>${window.AYA.escapeHTML(product.category)}</small></div>
            <h3><a href="${window.AYA.escapeHTML(detailUrl)}">${window.AYA.escapeHTML(product.name)}</a></h3>
            <p>${window.AYA.escapeHTML(product.description)}</p>
            <div class="product-card-price"><span>${price === null ? "Harga" : "Harga aktif"}</span><strong>${window.AYA.escapeHTML(priceText)}</strong></div>
            <div class="product-card-actions"><a class="button button-secondary" href="${window.AYA.escapeHTML(detailUrl)}">Detail</a><a class="button button-primary" href="${window.AYA.escapeHTML(product.orderable ? `${detailUrl}#pesan` : detailUrl)}">${product.orderable ? "Pilih Varian" : "Lihat Status"}</a></div>
          </div>
        </article>`;
      }).join("");
    }

    const count = document.querySelector("[data-line-product-count]");
    if (count) count.textContent = String(products.length);

    document.querySelector(`[data-line-link="${CSS.escape(lineKey)}"]`)?.setAttribute("aria-current", "page");

    const siblings = document.querySelector("[data-line-sibling-nav]");
    if (siblings) {
      siblings.innerHTML = Object.entries(lines)
        .filter(([key]) => key !== lineKey)
        .map(([, line]) => `<a href="${line.href}">${window.AYA.escapeHTML(line.label)} →</a>`)
        .join("");
    }

    const catalogLink = document.querySelector("[data-line-catalog-link]");
    if (catalogLink && source) {
      const url = new URL(catalogLink.getAttribute("href"), location.href);
      url.searchParams.set("src", source);
      catalogLink.setAttribute("href", `${url.pathname.split("/").pop()}${url.search}`);
    }
  });
})();

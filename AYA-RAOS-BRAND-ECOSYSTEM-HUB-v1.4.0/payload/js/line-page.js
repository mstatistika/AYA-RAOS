(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA || !Array.isArray(window.AYA_PRODUCTS)) return;

    const root = document.querySelector("[data-line-product-grid]");
    if (!root) return;
    const lineKey = document.body.dataset.lineKey;
    const products = window.AYA_PRODUCTS
      .filter((product) => product.visible && product.lineKey === lineKey)
      .sort((a, b) => (a.catalogOrder || 999) - (b.catalogOrder || 999));

    const minPrice = (product) => {
      const values = (product.variants || []).map((variant) => Number(variant.price)).filter(Number.isFinite);
      return values.length ? Math.min(...values) : null;
    };

    if (!products.length) {
      root.innerHTML = '<div class="empty-state"><strong>Produk lini ini sedang disiapkan.</strong><p>Status akan diperbarui ketika data produk siap ditampilkan.</p></div>';
      return;
    }

    root.innerHTML = products.map((product) => {
      const price = minPrice(product);
      const priceText = price === null ? "Harga belum tersedia" : `${product.variants.length > 1 ? "Mulai " : ""}${window.AYA.formatPrice(price)}`;
      return `<article class="product-card">
        <a class="product-card-image" href="product.html?id=${encodeURIComponent(product.id)}">
          <img src="${window.AYA.escapeHTML(product.image || product.placeholder)}" alt="${window.AYA.escapeHTML(product.name)}" loading="lazy" width="700" height="700" data-image-fallback="${window.AYA.escapeHTML(product.id)}" />
          <span class="status-badge status-${product.status}">${window.AYA.escapeHTML(product.publicStatus)}</span>
        </a>
        <div class="product-card-body">
          <div class="product-card-kicker"><span class="line-label line-${product.lineKey}">${window.AYA.escapeHTML(product.line)}</span><small>${window.AYA.escapeHTML(product.category)}</small></div>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${window.AYA.escapeHTML(product.name)}</a></h3>
          <p>${window.AYA.escapeHTML(product.description)}</p>
          <div class="product-card-price"><span>${price === null ? "Harga" : "Harga aktif"}</span><strong>${window.AYA.escapeHTML(priceText)}</strong></div>
          <div class="product-card-actions"><a class="button button-secondary" href="product.html?id=${encodeURIComponent(product.id)}">Detail</a><a class="button button-primary" href="${product.orderable ? `product.html?id=${encodeURIComponent(product.id)}#pesan` : `product.html?id=${encodeURIComponent(product.id)}`}">${product.orderable ? "Pilih Varian" : "Lihat Status"}</a></div>
        </div>
      </article>`;
    }).join("");

    const count = document.querySelector("[data-line-product-count]");
    if (count) count.textContent = String(products.length);

    const active = document.querySelector(`[data-line-link="${CSS.escape(lineKey)}"]`);
    active?.setAttribute("aria-current", "page");

    const source = new URLSearchParams(location.search).get("src");
    if (source) {
      try { sessionStorage.setItem("ayaRaos.entrySource", source.slice(0, 120)); } catch { /* optional */ }
    }
  });
})();

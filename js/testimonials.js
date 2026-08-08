(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;
    const data = window.AYA_TESTIMONIALS || {};
    const videoRegion = document.querySelector("[data-video-content]");
    const mediaGrid = document.querySelector("[data-testimonial-media-grid]");
    const featured = document.querySelector("[data-featured-testimonial]");
    const track = document.querySelector("[data-ticker-track]");
    const videos = data.videos || [];
    const featuredItem = (data.featured || [])[0];
    const texts = data.texts || [];

    const productFor = (item) => {
      if (item?.productId) return window.AYA.getProduct(item.productId);
      const meta = String(item?.meta || "").toLocaleLowerCase("id");
      return window.AYA.products().find((product) => meta.includes(product.name.toLocaleLowerCase("id")) ||
        (product.id === "sambal-bawang" && meta.includes("sambal")) ||
        (product.id === "bawang-goreng-sumenep" && meta.includes("bawang goreng"))) || null;
    };
    const locationOnly = (item) => String(item?.location || "").trim();

    if (videoRegion) {
      const item = videos[0];
      if (item?.url) {
        videoRegion.innerHTML = `<div class="video-frame"><video controls preload="metadata" ${item.poster ? `poster="${window.AYA.escapeHTML(item.poster)}"` : ""}><source src="${window.AYA.escapeHTML(item.url)}"></video><div class="media-lower-third"><strong>${window.AYA.escapeHTML(item.name || "Pelanggan AYA")}</strong>${locationOnly(item) ? `<span>${window.AYA.escapeHTML(locationOnly(item))}</span>` : ""}</div></div>`;
      } else {
        videoRegion.innerHTML = "";
        mediaGrid?.classList.add("is-photo-only");
      }
    }

    if (featured) {
      if (featuredItem?.image) {
        featured.innerHTML = `<button type="button" class="photo-frame" data-open-featured aria-label="Lihat foto testimoni"><img src="${window.AYA.escapeHTML(featuredItem.displayImage || featuredItem.image)}" alt="Foto testimoni pelanggan AYA"><div class="media-lower-third photo-lower-third"><strong>${window.AYA.escapeHTML(featuredItem.name || "Pelanggan AYA")}</strong>${locationOnly(featuredItem) ? `<span>${window.AYA.escapeHTML(locationOnly(featuredItem))}</span>` : ""}</div></button>`;
      } else featured.innerHTML = '<div class="empty-state"><strong>Foto cerita pelanggan belum tersedia.</strong></div>';
    }

    if (track) {
      const records = texts.length > 1 ? [...texts, ...texts] : texts;
      track.innerHTML = records.length ? records.map((item) => {
        const product = productFor(item);
        const image = product?.image || product?.placeholder || "assets/visual/aya-mark.svg";
        return `<article class="story-card"><div class="story-copy"><span>“</span><blockquote>${window.AYA.escapeHTML(item.quote)}</blockquote><strong>${window.AYA.escapeHTML(item.name)}</strong><small>${window.AYA.escapeHTML(item.meta || product?.name || "")}</small></div><img src="${window.AYA.escapeHTML(image)}" alt="${window.AYA.escapeHTML(product?.name || "Produk AYA")}" data-image-fallback="${window.AYA.escapeHTML(product?.id || "")}"></article>`;
      }).join("") : '<div class="empty-state compact-state"><strong>Cerita pelanggan belum tersedia.</strong></div>';
      if (texts.length > 1) track.classList.add("is-moving");
    }

    const dialog = document.querySelector("[data-media-dialog]");
    const content = document.querySelector("[data-dialog-content]");
    document.querySelector("[data-open-featured]")?.addEventListener("click", () => {
      if (!featuredItem?.image || !dialog || !content) return;
      const image = featuredItem.displayImage || featuredItem.image;
      content.innerHTML = `<img src="${window.AYA.escapeHTML(image)}" alt="Foto testimoni pelanggan AYA">`;
      dialog.showModal();
    });
    document.querySelector("[data-dialog-close]")?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  });
})();

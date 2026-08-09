(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;
    const data = window.AYA_TESTIMONIALS || {};
    const videoRegion = document.querySelector("[data-video-content]");
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

    if (videoRegion) {
      const item = videos[0];
      if (item?.url) {
        const place = item.city || item.location || item.meta || "";
        videoRegion.innerHTML = `<div class="video-frame"><video controls preload="metadata" ${item.poster ? `poster="${window.AYA.escapeHTML(item.poster)}"` : ""}><source src="${window.AYA.escapeHTML(item.url)}"></video><div class="media-lower-third"><strong>${window.AYA.escapeHTML(item.name || "Pelanggan AYA")}</strong>${place ? `<span>${window.AYA.escapeHTML(place)}</span>` : ""}</div></div>`;
      } else {
        videoRegion.innerHTML = `<div class="testimonial-media-empty" aria-label="Video pelanggan belum tersedia"><span class="play-mark">▶</span><strong>Video segera hadir</strong><small>Video hanya tampil setelah melalui review AYA.</small></div>`;
      }
    }

    if (featured) {
      if (featuredItem?.image) {
        featured.innerHTML = `<button type="button" class="photo-frame" data-open-featured aria-label="Lihat foto testimoni"><img src="${window.AYA.escapeHTML(featuredItem.displayImage || featuredItem.image)}" alt="Foto testimoni pelanggan AYA"><blockquote>“${window.AYA.escapeHTML(featuredItem.quote || "") }”</blockquote><div class="media-lower-third photo-lower-third"><strong>${window.AYA.escapeHTML(featuredItem.name || "Pelanggan AYA")}</strong><span>${window.AYA.escapeHTML(featuredItem.meta || "")}</span></div></button>`;
      } else featured.innerHTML = '<div class="testimonial-media-empty"><strong>Foto cerita pelanggan belum tersedia.</strong></div>';
    }

    if (track) {
      const source = [...texts, ...(featuredItem ? [featuredItem] : [])];
      const records = source.length ? source : [{ quote: "Cerita berikutnya akan tampil setelah disetujui.", name: "AYA RAOS", meta: "" }];
      const card = (item) => {
        const product = productFor(item);
        const image = product?.image || product?.placeholder || "assets/visual/aya-mark.svg";
        return `<article class="story-card"><img src="${window.AYA.escapeHTML(image)}" alt="${window.AYA.escapeHTML(product?.name || "Produk AYA")}" ${product?.id ? `data-image-fallback="${window.AYA.escapeHTML(product.id)}"` : ""}><div class="story-copy"><blockquote>“${window.AYA.escapeHTML(item.quote || "") }”</blockquote><strong>${window.AYA.escapeHTML(item.name || "Pelanggan AYA")}</strong><small>${window.AYA.escapeHTML(item.meta || product?.name || "")}</small></div></article>`;
      };
      const originals = records.map(card);
      track.innerHTML = [...originals, ...originals].join("");
      if (records.length > 1) track.classList.add("is-moving");
    }

    const dialog = document.querySelector("[data-media-dialog]");
    const content = document.querySelector("[data-dialog-content]");
    document.querySelector("[data-open-featured]")?.addEventListener("click", () => {
      if (!featuredItem?.image || !dialog || !content) return;
      content.innerHTML = `<img src="${window.AYA.escapeHTML(featuredItem.displayImage || featuredItem.image)}" alt="Foto testimoni pelanggan AYA">`;
      dialog.showModal();
    });
    document.querySelector("[data-dialog-close]")?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  });
})();

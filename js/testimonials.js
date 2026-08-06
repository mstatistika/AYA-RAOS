(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;
    const data = window.AYA_TESTIMONIALS || {};
    const track = document.querySelector("[data-ticker-track]");
    const featured = document.querySelector("[data-featured-testimonial]");
    const featuredItem = (data.featured || [])[0];
    const featuredKey = featuredItem ? `${featuredItem.quote}|${featuredItem.name}`.toLocaleLowerCase("id") : "";
    const texts = (data.texts || []).filter((item) => `${item.quote}|${item.name}`.toLocaleLowerCase("id") !== featuredKey);

    const renderTexts = () => {
      if (!track) return;
      const mobile = matchMedia("(max-width: 620px)").matches;
      const records = mobile ? texts : [...texts, ...texts];
      track.innerHTML = records.length ? records.map((item) => `<article><span>“</span><blockquote>${window.AYA.escapeHTML(item.quote)}</blockquote><footer><strong>${window.AYA.escapeHTML(item.name)}</strong><small>${window.AYA.escapeHTML(item.meta || "")}</small></footer></article>`).join("") : '<div class="empty-state compact-state"><strong>Belum ada testimoni tulisan.</strong></div>';
      track.dataset.mode = mobile ? "stack" : "ticker";
    };
    renderTexts();
    let lastMobile = matchMedia("(max-width: 620px)").matches;
    addEventListener("resize", () => {
      const mobile = matchMedia("(max-width: 620px)").matches;
      if (mobile !== lastMobile) { lastMobile = mobile; renderTexts(); }
    });

    if (featured) featured.innerHTML = featuredItem ? `<img src="${window.AYA.escapeHTML(featuredItem.image)}" alt="Foto testimoni pelanggan AYA"/><div><span class="eyebrow">TESTIMONI PILIHAN</span><blockquote>“${window.AYA.escapeHTML(featuredItem.quote)}”</blockquote><strong>${window.AYA.escapeHTML(featuredItem.name)}</strong><small>${window.AYA.escapeHTML(featuredItem.meta || "")}</small><button type="button" class="button button-secondary" data-open-featured>Lihat Foto</button></div>` : '<div class="empty-state"><strong>Foto testimoni belum tersedia.</strong></div>';

    const dialog = document.querySelector("[data-media-dialog]");
    const content = document.querySelector("[data-dialog-content]");
    document.querySelector("[data-open-featured]")?.addEventListener("click", () => {
      if (!featuredItem || !dialog || !content) return;
      content.innerHTML = `<img src="${window.AYA.escapeHTML(featuredItem.image)}" alt="Foto testimoni pelanggan AYA"/>`;
      dialog.showModal();
    });
    document.querySelector("[data-dialog-close]")?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  });
})();

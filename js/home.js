(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector("[data-home-track]");
    const viewport = document.querySelector("[data-home-carousel]");
    if (!track || !viewport || !window.AYA) return;

    const all = [...(window.AYA_TESTIMONIALS?.texts || []), ...(window.AYA_TESTIMONIALS?.featured || [])];
    const seen = new Set();
    const records = all.filter((item) => {
      const key = `${item.quote}|${item.name}`.toLocaleLowerCase("id");
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    if (!records.length) {
      track.innerHTML = '<div class="empty-state"><strong>Testimoni belum tersedia.</strong><p>Silakan kunjungi kembali setelah data approved tersedia.</p></div>';
      return;
    }

    track.innerHTML = records.map((item) => `<article class="testimonial-card" data-media="${item.image ? window.AYA.escapeHTML(item.image) : ""}"><span>“</span><blockquote>${window.AYA.escapeHTML(item.quote)}</blockquote><footer><strong>${window.AYA.escapeHTML(item.name)}</strong><small>${window.AYA.escapeHTML(item.meta || "")}</small></footer>${item.image ? '<button type="button" class="card-media-button">Lihat foto</button>' : ""}</article>`).join("");

    let index = 0, paused = false, timer;
    const indicator = document.querySelector("[data-home-indicator]");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visible = () => innerWidth >= 900 ? 3 : innerWidth >= 620 ? 2 : 1;
    const maxIndex = () => Math.max(0, records.length - visible());
    const update = () => {
      index = Math.min(index, maxIndex());
      const card = track.querySelector(".testimonial-card");
      const gap = 18;
      const width = card ? card.getBoundingClientRect().width : 0;
      track.style.transform = `translateX(-${index * (width + gap)}px)`;
      if (indicator) indicator.textContent = `${String(index + 1).padStart(2, "0")} / ${String(maxIndex() + 1).padStart(2, "0")}`;
    };
    const next = () => { index = index >= maxIndex() ? 0 : index + 1; update(); };
    const prev = () => { index = index <= 0 ? maxIndex() : index - 1; update(); };
    const restart = () => { clearInterval(timer); if (!reduced && records.length > visible()) timer = setInterval(() => { if (!paused) next(); }, 7600); };

    document.querySelector("[data-home-next]")?.addEventListener("click", () => { next(); paused = true; restart(); });
    document.querySelector("[data-home-prev]")?.addEventListener("click", () => { prev(); paused = true; restart(); });
    viewport.addEventListener("mouseenter", () => paused = true);
    viewport.addEventListener("mouseleave", () => paused = false);
    viewport.addEventListener("focusin", () => paused = true);
    viewport.addEventListener("focusout", () => paused = false);
    addEventListener("resize", update);
    update(); restart();

    const dialog = document.querySelector("[data-media-dialog]");
    const content = document.querySelector("[data-dialog-content]");
    track.addEventListener("click", (event) => {
      const button = event.target.closest(".card-media-button");
      if (!button || !dialog || !content) return;
      const src = button.closest("[data-media]")?.dataset.media;
      if (!src) return;
      content.innerHTML = `<img src="${window.AYA.escapeHTML(src)}" alt="Foto testimoni pelanggan AYA" />`;
      paused = true; dialog.showModal();
    });
    document.querySelector("[data-dialog-close]")?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("close", () => paused = false);
    dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  });
})();

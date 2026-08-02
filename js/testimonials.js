(() => {
  "use strict";

  const fallback = window.AYA_TESTIMONIALS?.texts || [];
  let tickerTimer = null;
  let paused = false;

  const make = (tag, className = "", text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const normalizeRemote = item => ({
    quote: item.public_text || "",
    name: item.display_name || "Pelanggan AYA",
    meta: [item.product_name, item.city].filter(Boolean).join(" · ")
  });

  function createCard(item) {
    const article = make("article", "testimonial-written-card");
    article.appendChild(make("p", "", `“${item.quote || ""}”`));
    const footer = document.createElement("footer");
    footer.append(
      make("strong", "", item.name || "Pelanggan AYA"),
      make("span", "", item.meta || "Produk AYA")
    );
    article.appendChild(footer);
    return article;
  }

  function startTicker(viewport, track, items) {
    clearInterval(tickerTimer);
    tickerTimer = null;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 720px)").matches;

    track.replaceChildren();
    const animated = !reduceMotion && !mobile && items.length > 1;
    const renderItems = animated ? [...items, ...items] : items;
    renderItems.forEach(item => track.appendChild(createCard(item)));

    if (!items.length) {
      const empty = make("div", "testimonial-empty-state");
      empty.append(
        make("strong", "", "Testimoni sedang disiapkan."),
        make("p", "", "Pengalaman pelanggan akan tampil setelah melalui persetujuan.")
      );
      track.appendChild(empty);
      return;
    }

    viewport.scrollTop = 0;
    if (!animated) return;

    tickerTimer = setInterval(() => {
      if (paused) return;
      viewport.scrollTop += 1;
      const resetAt = track.scrollHeight / 2;
      if (viewport.scrollTop >= resetAt) viewport.scrollTop = 0;
    }, 46);
  }

  function render(items) {
    const track = document.querySelector("[data-testimonial-wall]");
    const viewport = track?.closest(".testimonial-wall-viewport");
    if (!track || !viewport) return;
    startTicker(viewport, track, items.slice(0, 10));

    ["mouseenter", "focusin", "pointerdown", "touchstart"].forEach(type => {
      viewport.addEventListener(type, () => { paused = true; }, { passive: true });
    });
    ["mouseleave", "focusout", "pointerup", "touchend"].forEach(type => {
      viewport.addEventListener(type, () => { paused = false; }, { passive: true });
    });
  }

  async function loadApproved() {
    render(fallback);

    if (!window.AYA_SUPABASE?.isConfigured) return;

    try {
      const data = await window.AYA_SUPABASE.rpc("get_approved_aya_testimonials", {
        p_environment: window.AYA_SUPABASE.environment
      });

      if (Array.isArray(data) && data.length) {
        render(data.map(normalizeRemote));
      }
    } catch (error) {
      console.warn("AYA approved testimonials:", error);
      const panel = document.querySelector(".testimonial-written-panel");
      if (panel && !panel.querySelector(".testimonial-network-note")) {
        const note = make("p", "testimonial-network-note", "Testimoni terbaru belum dapat dimuat. Testimoni arsip tetap ditampilkan.");
        note.setAttribute("role", "status");
        panel.appendChild(note);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", loadApproved);
  window.addEventListener("pagehide", () => clearInterval(tickerTimer), { once: true });
})();

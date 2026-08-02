(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;

    const featuredRoot = document.querySelector("[data-featured-products]");
    if (featuredRoot) {
      featuredRoot.replaceChildren();
      const featured = window.AYA.products
        .filter(product => product.featured)
        .sort((a, b) => Number(a.priority || 99) - Number(b.priority || 99))
        .slice(0, 4);

      if (!featured.length) {
        const empty = window.AYA.make("div", "empty-state");
        empty.append(
          window.AYA.make("h3", "", "Produk unggulan belum tersedia."),
          window.AYA.make("p", "", "Silakan buka katalog atau hubungi AYA.")
        );
        featuredRoot.appendChild(empty);
      } else {
        featured.forEach(product => featuredRoot.appendChild(window.AYA.createProductCard(product)));
      }
    }

    const testimonials = window.AYA_TESTIMONIALS?.texts || [];
    const viewport = document.querySelector("[data-text-carousel]");
    const track = document.querySelector("[data-testimonial-track]");
    if (!viewport || !track || !testimonials.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 720px)");
    let timer = null;
    let paused = false;

    const makeCard = item => {
      const card = window.AYA.make("article", "text-testimonial");
      card.append(
        window.AYA.make("p", "", `“${item.quote}”`)
      );
      const footer = document.createElement("footer");
      footer.append(
        window.AYA.make("strong", "", item.name),
        window.AYA.make("span", "", item.meta)
      );
      card.appendChild(footer);
      return card;
    };

    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    const render = () => {
      stop();
      track.replaceChildren();
      const animated = !reducedMotion.matches && !mobile.matches;
      const items = animated ? [...testimonials, ...testimonials] : testimonials;
      items.forEach(item => track.appendChild(makeCard(item)));
      viewport.scrollTop = 0;

      if (!animated) return;
      timer = setInterval(() => {
        if (paused) return;
        viewport.scrollTop += 1;
        const resetAt = track.scrollHeight / 2;
        if (viewport.scrollTop >= resetAt) viewport.scrollTop = 0;
      }, 42);
    };

    ["mouseenter", "focusin", "pointerdown", "touchstart"].forEach(type => {
      viewport.addEventListener(type, () => { paused = true; }, { passive: true });
    });
    ["mouseleave", "focusout", "pointerup", "touchend"].forEach(type => {
      viewport.addEventListener(type, () => { paused = false; }, { passive: true });
    });

    reducedMotion.addEventListener?.("change", render);
    mobile.addEventListener?.("change", render);
    window.addEventListener("pagehide", stop, { once: true });
    render();
  });
})();

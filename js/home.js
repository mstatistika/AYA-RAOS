(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const testimonials =
      (window.AYA_TESTIMONIALS || {}).texts || [];

    const viewport =
      document.querySelector("[data-text-carousel]");

    const track =
      document.querySelector("[data-testimonial-track]");

    if (!viewport || !track || !testimonials.length) return;

    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)");

    const mobileView =
      window.matchMedia("(max-width: 680px)");

    let timer = null;
    let paused = false;

    const card = item => `
      <article class="text-testimonial">
        <p>“${item.quote}”</p>
        <footer>
          <strong>${item.name}</strong>
          <span>${item.meta}</span>
        </footer>
      </article>
    `;

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const render = () => {
      stop();

      const animated =
        !reduceMotion.matches &&
        !mobileView.matches;

      const items = animated
        ? [...testimonials, ...testimonials]
        : testimonials;

      track.innerHTML = items.map(card).join("");
      viewport.scrollTop = 0;

      if (!animated) return;

      timer = window.setInterval(() => {
        if (paused) return;

        viewport.scrollTop += 1;

        const resetPoint = track.scrollHeight / 2;

        if (viewport.scrollTop >= resetPoint) {
          viewport.scrollTop = 0;
        }
      }, 42);
    };

    ["mouseenter", "focusin", "touchstart", "pointerdown"].forEach(type => {
      viewport.addEventListener(type, () => { paused = true; }, { passive: true })
    });
    ["mouseleave", "focusout", "touchend", "pointerup"].forEach(type => {
      viewport.addEventListener(type, () => { paused = false; }, { passive: true })
    });

    reduceMotion.addEventListener?.("change", render);
    mobileView.addEventListener?.("change", render);

    window.addEventListener("pagehide", stop, { once: true });

    render();
  });
})();

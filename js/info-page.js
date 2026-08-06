(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const sections = [...document.querySelectorAll(".information-content > section[id]")];
    const links = [...document.querySelectorAll(".information-nav a[href^='#']")];
    if (!sections.length || !links.length) return;

    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
      });
    };

    links.forEach((link) => link.addEventListener("click", () => setActive(link.hash.slice(1))));
    const initial = location.hash.slice(1);
    setActive(sections.some((section) => section.id === initial) ? initial : sections[0].id);

    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-116px 0px -58% 0px", threshold: [0, 0.1, 0.35] });
    sections.forEach((section) => observer.observe(section));
  });
})();

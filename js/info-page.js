(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const sections = [...document.querySelectorAll(".information-content > section[id]")];
    const links = [...document.querySelectorAll(".information-nav a[href^='#']")];
    if (sections.length && links.length) {
      const activate = (id, updateHash=true) => {
        const target = sections.find(s => s.id === id) || sections[0];
        sections.forEach(s => { s.hidden = s !== target; s.classList.toggle("active", s === target); });
        links.forEach(link => {
          const active = link.getAttribute("href") === `#${target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
        });
        if (updateHash && location.hash !== `#${target.id}`) history.replaceState(null, "", `#${target.id}`);
        target.focus?.({preventScroll:true});
      };
      links.forEach(link => link.addEventListener("click", e => { e.preventDefault(); activate(link.hash.slice(1)); }));
      activate(location.hash.slice(1) || sections[0].id, false);
      addEventListener("hashchange", () => activate(location.hash.slice(1), false));
    }

    const mobileRoot = document.querySelector("[data-info-mobile]");
    if (!mobileRoot) return;

    const mobilePanels = [...mobileRoot.querySelectorAll("[data-info-mobile-panel]")];
    const mobileButtons = [...mobileRoot.querySelectorAll("[data-info-mobile-key]")];
    const mobileCtas = [...mobileRoot.querySelectorAll("[data-info-mobile-cta]")];
    if (!mobilePanels.length || !mobileButtons.length || !mobileCtas.length) return;

    const activateMobile = (key) => {
      const target = mobilePanels.find(panel => panel.dataset.infoMobilePanel === key) || mobilePanels[0];
      const activeKey = target.dataset.infoMobilePanel;

      mobilePanels.forEach(panel => {
        const active = panel === target;
        panel.hidden = !active;
        if (active) panel.scrollTop = 0;
      });
      mobileButtons.forEach(button => {
        const active = button.dataset.infoMobileKey === activeKey;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      mobileCtas.forEach(cta => {
        cta.hidden = cta.dataset.infoMobileCta !== activeKey;
      });
    };

    mobileButtons.forEach(button => button.addEventListener("click", () => activateMobile(button.dataset.infoMobileKey)));
    activateMobile("produk");
  });
})();

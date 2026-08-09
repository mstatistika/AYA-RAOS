(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const sections = [...document.querySelectorAll(".information-content > section[id]")];
    const links = [...document.querySelectorAll(".information-nav a[href^='#']")];
    if (!sections.length || !links.length) return;
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
  });
})();

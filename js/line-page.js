(() => {
  "use strict";

  const isMobileLine = window.matchMedia("(max-width: 900px)").matches && document.body?.dataset.page === "line";
  let previewStyle = null;

  if (isMobileLine) {
    previewStyle = document.createElement("link");
    previewStyle.rel = "stylesheet";
    previewStyle.href = "css/mobile-lines-vp123-preview.css?v=20260902-v1";
    previewStyle.dataset.ayaMobileLinesVp123 = "true";
    document.head.append(previewStyle);
  }

  const walkPreviewRules = (callback) => {
    if (!previewStyle?.sheet) return;
    const walk = (rules) => {
      for (const rule of Array.from(rules || [])) {
        callback(rule);
        if (rule.cssRules) walk(rule.cssRules);
      }
    };
    try { walk(previewStyle.sheet.cssRules); } catch { /* same-origin preview CSS only */ }
  };

  const hideVp1PseudoMedallion = () => {
    if (!isMobileLine) return;
    walkPreviewRules((rule) => {
      if (
        rule.selectorText?.includes(".farm-master-hero-copy::before") &&
        rule.selectorText?.includes(".spice-master-hero-copy::before") &&
        rule.selectorText?.includes(".snacks-master-hero-copy::before")
      ) rule.style.display = "none";
    });
  };

  const neutralizeVp2BasePseudo = () => {
    if (!isMobileLine) return;
    walkPreviewRules((rule) => {
      const selector = rule.selectorText || "";
      if (selector.includes("-master-domains::before") || selector.includes("-master-domains::after")) {
        rule.style.display = "none";
        rule.style.visibility = "hidden";
        rule.style.opacity = "0";
        rule.style.content = "none";
        rule.style.backgroundImage = "none";
      }
    });
  };

  const renderCanonicalVp1Mark = () => {
    if (!isMobileLine) return;
    const config = {
      farm: [".farm-master-hero-copy", "assets/brand/aya-farm/mark.png", "AYA Farm"],
      spice: [".spice-master-hero-copy", "assets/brand/aya-spice-haven/mark.png", "AYA Spice Haven"],
      snack: [".snacks-master-hero-copy", "assets/brand/aya-snacks-drinks/mark.png", "AYA Snacks & Drinks"]
    }[document.body.dataset.lineKey];
    if (!config) return;

    const [heroSelector, asset, alt] = config;
    const hero = document.querySelector(heroSelector);
    if (!hero || hero.querySelector(".aya-vp1-line-medallion")) return;

    const compact = window.matchMedia("(max-width: 370px)").matches;
    const medallion = document.createElement("span");
    medallion.className = "aya-vp1-line-medallion";
    medallion.setAttribute("aria-hidden", "true");
    Object.assign(medallion.style, {
      order: "1", width: compact ? "116px" : "130px", height: compact ? "116px" : "130px",
      flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 13px", padding: "0", boxSizing: "border-box",
      border: "1px solid rgba(181,133,60,.74)", borderRadius: "50%",
      background: "rgba(255,249,237,.95)",
      boxShadow: "0 10px 27px rgba(66,33,18,.10), inset 0 0 0 5px rgba(255,252,245,.72)", lineHeight: "0"
    });

    const mark = document.createElement("img");
    mark.src = asset;
    mark.alt = alt;
    mark.draggable = false;
    Object.assign(mark.style, {
      display: "block", width: compact ? "92px" : "102px", height: compact ? "92px" : "102px",
      maxWidth: "none", maxHeight: "none", margin: "0", padding: "0",
      objectFit: "contain", objectPosition: "50% 50%",
      transform: document.body.dataset.lineKey === "spice" ? "translate(-3px, -6px)" : "none"
    });
    medallion.append(mark);
    hero.prepend(medallion);
  };

  const staticSvg = (kind) => {
    const drawings = {
      "farm-agri": '<path d="M22 55V15M22 25c-8-3-10-8-9-13 7 1 11 6 9 13Zm0 10c8-3 11-8 10-13-7 1-11 6-10 13ZM42 55V10M42 23c-8-3-10-8-9-13 7 1 11 6 9 13Zm0 11c8-3 11-8 10-13-7 1-11 6-10 13Z"/>',
      "farm-livestock": '<path d="M19 42c0-10 7-18 17-18 6 0 11 3 14 8l7-2-3 7-6 2v8c0 7-5 11-12 11H24c-7 0-12-4-12-11v-3l7-2Z"/><path d="M25 58v4m14-4v4M21 27l-6-7m3 0-7 2"/>',
      "farm-primary": '<path d="M32 55V20m0 10c-9-3-13-8-12-15 8 1 13 6 12 15Zm0 10c9-3 13-8 12-15-8 1-13 6-12 15Z"/><path d="M21 46c-6-1-10-5-10-11 7 0 12 4 12 10m20 1c6-1 10-5 10-11-7 0-12 4-12 10"/>',
      "farm-seed": '<path d="M13 37h38c-1 12-8 19-19 19S14 49 13 37Z"/><path d="M20 37c1-7 5-11 12-11s11 4 12 11M22 22c2-5 5-8 10-8s8 3 10 8"/><path d="M17 59h30"/>',
      "farm-home": '<path d="M10 31 32 12l22 19v24H10V31Z"/><path d="M24 55V37h16v18"/>',
      "farm-center": '<path d="M12 33h40l-4 23H16l-4-23Z"/><path d="M20 33c2-8 6-13 12-13s10 5 12 13"/><path d="M32 20V8m0 8c-6-2-9-5-8-10 5 1 8 4 8 10Zm0 0c6-2 9-5 8-10-5 1-8 4-8 10Z"/>',

      "spice-base": '<path d="M16 43c9-1 18-5 26-13 2 9-2 17-10 21-6 3-12 2-16-1"/><path d="M18 39c-5-4-7-10-4-16 7 1 12 6 12 12M38 24c3-7 9-11 16-10-1 7-6 12-13 13"/>',
      "spice-sambal": '<path d="M13 42c9-1 18-5 26-13 2 9-2 17-10 21-6 3-12 2-16-1"/><path d="M36 31c6-2 11-6 15-12 3 7 0 13-6 17-4 2-8 2-11 0M14 38c-4-4-5-9-2-14 6 1 10 5 10 10"/>',
      "spice-whole": '<path d="M13 32h38c0 13-7 21-19 21S13 45 13 32Z"/><path d="M21 32c1-7 5-12 11-12s10 5 11 12M42 21 54 9M45 18l7 6"/>',
      "spice-processed": '<path d="M20 17h24l3 38H17l3-38Z"/><path d="M23 17V9h18v8M24 30h16M27 40h10"/>',
      "gift": '<path d="M13 28h38v27H13V28Z"/><path d="M32 28v27M13 36h38M32 28c-7 0-11-4-11-8 0-4 3-7 7-7 4 0 7 5 4 15Zm0 0c7 0 11-4 11-8 0-4-3-7-7-7-4 0-7 5-4 15Z"/>',
      "spice-center": '<path d="M14 31h36c0 14-7 23-18 23S14 45 14 31Z"/><path d="M22 31c2-8 5-12 10-12s8 4 10 12M38 20l13-11M42 17l7 6"/><path d="M18 55h28"/>',

      "snack-drink": '<path d="M20 18h26l-4 37H24l-4-37Z"/><path d="M38 18 45 6M25 31h15M25 40h14"/>',
      "snack-sweet": '<circle cx="30" cy="31" r="17"/><path d="M23 23h1m12 0h1m-10 9h1m9 7h1m-16 2h1M44 43l8 8M49 38l5 5"/>',
      "snack-savory": '<circle cx="25" cy="30" r="13"/><circle cx="40" cy="34" r="13"/><path d="M20 26h1m9 4h1m8-5h1m6 12h1M28 40h1"/>',
      "snack-practical": '<path d="M17 27h30v28H17V27Z"/><path d="M32 27v28M17 36h30M32 27c-6 0-10-4-10-8 0-3 3-6 6-6 4 0 6 5 4 14Zm0 0c6 0 10-4 10-8 0-3-3-6-6-6-4 0-6 5-4 14Z"/>',
      "snack-box": '<path d="M12 25 32 15l20 10-20 10-20-10Z"/><path d="M12 25v22l20 10 20-10V25M32 35v22"/>',
      "snack-center": '<path d="M12 37h25c-1 11-5 17-12 17s-12-6-13-17Z"/><path d="M36 16h16l-2 27H39l-3-27Z"/><path d="M45 16 51 6M19 33c2-5 5-8 8-8 4 0 7 3 9 8"/>'
    };
    return `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${drawings[kind] || drawings.gift}</svg>`;
  };

  const prepareLockedVp2 = () => {
    if (!isMobileLine) return;
    neutralizeVp2BasePseudo();

    const key = document.body.dataset.lineKey;
    const cfg = {
      farm: {
        section: ".farm-master-vp2", layout: ".farm-master-understand-layout", intro: ".farm-master-intro", domains: ".farm-master-domains", when: ".farm-master-when",
        line: "AYA FARM", title: "Sumber alami pilihan, untuk hidup yang seimbang.", introCopy: "Kami menghadirkan hasil bumi dan peternakan terpercaya untuk kebutuhan sehari-hari.",
        order: [0,1,2,4,3], labels: ["HASIL PERTANIAN","HASIL PETERNAKAN","PRODUK PRIMER","BIBIT & PERLENGKAPAN","KEBUTUHAN SEHARI-HARI"],
        icons: ["farm-agri","farm-livestock","farm-primary","farm-seed","farm-home"], center: "farm-center",
        art: "assets/visual/line-pages/farm-vp1-master.webp", artPos: "center 73%"
      },
      spice: {
        section: ".spice-master-vp2", layout: ".spice-master-understand-layout", intro: ".spice-master-intro", domains: ".spice-master-domains", when: ".spice-master-when",
        line: "AYA SPICE HAVEN", title: "Rasa autentik, warisan rempah Nusantara.", introCopy: "Rempah terbaik diolah dengan teliti untuk rasa yang kaya dan berkarakter.",
        order: [1,0,2,3,4], labels: ["BUMBU DASAR","SAMBAL NUSANTARA","REMPAH UTUH","OLAHAN REMPAH","PAKET & HAMPERS"],
        icons: ["spice-base","spice-sambal","spice-whole","spice-processed","gift"], center: "spice-center",
        art: "assets/visual/line-pages/spice-vp3-master.webp", artPos: "center 62%"
      },
      snack: {
        section: ".snacks-master-vp2", layout: ".snacks-master-understand-layout", intro: ".snacks-master-intro", domains: ".snacks-master-domains", when: ".snacks-master-when",
        line: "AYA SNACKS & DRINKS", title: "Teman santai, setiap waktu berharga.", introCopy: "Camilan dan minuman pilihan untuk menemani momen terbaik Anda.",
        order: [3,0,1,2,4], labels: ["MINUMAN SEGAR","CAMILAN MANIS","CAMILAN GURIH","SNACK PRAKTIS","PAKET HADIAH"],
        icons: ["snack-drink","snack-sweet","snack-savory","snack-practical","snack-box"], center: "snack-center",
        art: "assets/visual/line-pages/snacks-vp3-master.webp", artPos: "center 62%"
      }
    }[key];
    if (!cfg) return;

    const section = document.querySelector(cfg.section);
    const layout = document.querySelector(cfg.layout);
    const intro = document.querySelector(cfg.intro);
    const domains = document.querySelector(cfg.domains);
    const when = document.querySelector(cfg.when);
    if (!section || !layout || !intro || !domains || !when || section.dataset.vp2Locked === "true") return;
    section.dataset.vp2Locked = "true";

    intro.style.display = "none";
    Object.assign(layout.style, {
      position: "relative", zIndex: "3", height: "100%", display: "grid",
      gridTemplateRows: "auto minmax(0,1fr) auto", gap: "0", padding: "16px 16px 68px", boxSizing: "border-box"
    });

    const top = document.createElement("div");
    top.className = "aya-vp2-lock-heading";
    top.style.gridRow = "1";
    top.style.textAlign = "center";
    top.innerHTML = `<div style="color:var(--line-mobile-accent);font:700 10px/1.2 var(--sans);letter-spacing:.13em;text-transform:uppercase">⌁ &nbsp;${cfg.line}&nbsp; ⌁</div><h2 style="max-width:350px;margin:8px auto 0;color:var(--line-mobile-accent);font:600 clamp(25px,7.2vw,30px)/1.02 var(--serif);letter-spacing:-.025em;text-wrap:balance">${cfg.title}</h2><p style="max-width:335px;margin:7px auto 0;color:#403832;font:500 10.5px/1.35 var(--sans);text-wrap:balance">${cfg.introCopy}</p>`;
    layout.prepend(top);

    const current = Array.from(domains.querySelectorAll(":scope > article"));
    const extra = current[0].cloneNode(true);
    domains.append(extra);
    const five = Array.from(domains.querySelectorAll(":scope > article"));
    cfg.order.map((i) => five[i]).forEach((article) => domains.append(article));

    const cards = Array.from(domains.querySelectorAll(":scope > article"));
    const compact = window.matchMedia("(max-width:370px)").matches;
    const positions = [
      {left:"50%",top:"0",transform:"translateX(-50%)"},
      {left:"3%",top:"31%",transform:"none"},
      {right:"3%",top:"31%",transform:"none"},
      {left:"11%",bottom:"0",transform:"none"},
      {right:"11%",bottom:"0",transform:"none"}
    ];

    Object.assign(domains.style, {
      gridRow: "2", position: "relative", display: "block", width: "min(100%,356px)",
      height: compact ? "min(45dvh,330px)" : "min(49dvh,376px)", minHeight: compact ? "292px" : "330px",
      alignSelf: "center", justifySelf: "center", margin: "2px auto 2px", padding: "0"
    });

    const ring = document.createElement("span");
    ring.className = "aya-vp2-orbit-ring";
    Object.assign(ring.style, {
      position:"absolute",zIndex:"0",left:"50%",top:"54%",width:"72%",height:"66%",transform:"translate(-50%,-50%)",
      border:"1px solid var(--line-mobile-soft)",borderRadius:"50%",boxSizing:"border-box",opacity:".72"
    });
    domains.prepend(ring);

    cards.forEach((article, index) => {
      const oldTitle = article.querySelector("h3");
      if (oldTitle) oldTitle.remove();
      const oldCopy = article.querySelector("p");
      if (oldCopy) oldCopy.style.display = "none";

      const icon = article.querySelector(".farm-master-domain-icon,.spice-master-domain-icon,.snacks-master-domain-icon");
      if (icon) {
        icon.innerHTML = staticSvg(cfg.icons[index]);
        Object.assign(icon.style,{width:compact?"38px":"42px",height:compact?"38px":"42px",margin:"0 auto 7px",display:"grid",placeItems:"center"});
        const svg = icon.querySelector("svg");
        if (svg) Object.assign(svg.style,{width:"100%",height:"100%",display:"block"});
      }

      const label = document.createElement("div");
      label.textContent = cfg.labels[index];
      Object.assign(label.style, {
        maxWidth:"98px",font:"700 10.5px/1.16 var(--sans)",letterSpacing:".01em",textTransform:"uppercase",
        textAlign:"center",whiteSpace:"normal",textWrap:"balance"
      });
      article.append(label);

      Object.assign(article.style, {
        position:"absolute",zIndex:"2",width:compact?"100px":"112px",height:compact?"108px":"118px",display:"flex",
        flexDirection:"column",alignItems:"center",justifyContent:"center",boxSizing:"border-box",padding:"9px 6px",
        border:"1px solid rgba(179,132,65,.28)",borderRadius:compact?"18px":"21px",background:"rgba(255,250,241,.96)",
        boxShadow:"0 8px 20px rgba(65,31,17,.055)",color:"var(--line-mobile-accent)",textAlign:"center",...positions[index]
      });
    });

    const center = document.createElement("div");
    center.className = "aya-vp2-center";
    center.innerHTML = staticSvg(cfg.center);
    Object.assign(center.style, {
      position:"absolute",zIndex:"6",left:"50%",top:"54%",width:compact?"80px":"90px",height:compact?"80px":"90px",
      display:"grid",placeItems:"center",transform:"translate(-50%,-50%)",border:"1px solid rgba(179,132,65,.68)",borderRadius:"50%",
      background:"var(--line-mobile-accent-deep)",color:"#fff1d8",
      boxShadow:"0 8px 20px rgba(54,25,16,.12),0 0 0 7px rgba(255,250,241,.90)"
    });
    const centerSvg = center.querySelector("svg");
    if (centerSvg) Object.assign(centerSvg.style,{width:compact?"44px":"50px",height:compact?"44px":"50px",display:"block"});
    domains.append(center);

    const title = when.querySelector("strong");
    if (title) {
      title.textContent = "DALAM KESEHARIAN";
      Object.assign(title.style,{fontSize:"11.5px",letterSpacing:".12em",color:"var(--line-mobile-accent)"});
    }
    Object.assign(when.style,{gridRow:"3",position:"relative",zIndex:"4",width:"min(100%,350px)",margin:"0 auto",padding:"2px 0 0",textAlign:"center"});

    const art = document.createElement("div");
    Object.assign(art.style,{position:"absolute",zIndex:"1",left:"0",right:"0",bottom:"0",height:"86px",backgroundImage:`url("${cfg.art}")`,backgroundSize:"cover",backgroundPosition:cfg.artPos,pointerEvents:"none"});
    const fade = document.createElement("span");
    Object.assign(fade.style,{position:"absolute",inset:"0",background:"linear-gradient(180deg,#f7ead7 0%,rgba(247,234,215,.82) 18%,rgba(247,234,215,.18) 62%,rgba(247,234,215,0) 100%)"});
    art.append(fade);
    section.append(art);
  };

  if (previewStyle) {
    previewStyle.addEventListener("load", () => {
      hideVp1PseudoMedallion();
      neutralizeVp2BasePseudo();
      renderCanonicalVp1Mark();
      prepareLockedVp2();
    }, { once: true });
  }

  const polishLockedMobileLine = () => {
    if (!isMobileLine) return;
    hideVp1PseudoMedallion();
    neutralizeVp2BasePseudo();
    renderCanonicalVp1Mark();
    prepareLockedVp2();

    const main = document.querySelector("#main");
    if (main) main.style.scrollPaddingTop = "0px";

    document.querySelectorAll(".farm-master-vp,.spice-master-vp,.snacks-master-vp").forEach((section) => {
      section.style.scrollMarginTop = "0px";
    });

    document.querySelectorAll(".farm-master-btn>span,.spice-master-btn>span,.snacks-master-btn>span").forEach((arrow) => arrow.remove());

    const productTitleMap = {
      farm: [".farm-master-featured-copy h2", "Beras"],
      spice: [".spice-master-featured-copy h2", "Sambal Bawang"]
    };
    const productTitleConfig = productTitleMap[document.body.dataset.lineKey];
    if (productTitleConfig) {
      const [selector, label] = productTitleConfig;
      const title = document.querySelector(selector);
      if (title) title.textContent = label;
    }

    document.querySelectorAll(".farm-master-vp3-media,.spice-master-vp3-media,.snacks-master-vp3-media").forEach((media) => {
      if (media.querySelector(".aya-vp3-image-feather")) return;
      const feather = document.createElement("span");
      feather.className = "aya-vp3-image-feather";
      feather.setAttribute("aria-hidden", "true");
      Object.assign(feather.style, {
        position:"absolute",zIndex:"2",left:"0",right:"0",bottom:"0",height:"76px",pointerEvents:"none",
        background:"linear-gradient(180deg, rgba(255,250,241,0) 0%, rgba(255,250,241,.12) 26%, rgba(255,250,241,.48) 58%, rgba(255,250,241,.84) 82%, #fffaf1 100%)"
      });
      media.append(feather);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    polishLockedMobileLine();
    if (!window.AYA) return;
    const lineKey = document.body.dataset.lineKey;
    const valid = new Set(["spice", "farm", "snack"]);
    if (!valid.has(lineKey)) return;

    const params = new URLSearchParams(location.search);
    const source = String(params.get("src") || "").trim().slice(0, 120);
    if (source) {
      try { sessionStorage.setItem("ayaRaos.entrySource", source); } catch { /* optional */ }
    }

    const appendSource = (anchor) => {
      if (!source || !anchor?.href) return;
      const url = new URL(anchor.getAttribute("href"), location.href);
      url.searchParams.set("src", source);
      anchor.setAttribute("href", `${url.pathname.split("/").pop()}${url.search}${url.hash}`);
    };
    document.querySelectorAll("[data-featured-detail],[data-line-catalog]").forEach(appendSource);

    if (/^qr-[a-z0-9-]+$/i.test(source)) {
      const hero = document.querySelector(".line-story-hero .line-story-copy, .farm-master-hero-copy, .spice-master-hero-copy, .snacks-master-hero-copy");
      if (hero && !hero.querySelector(".line-entry-note")) {
        const note = document.createElement("p");
        note.className = "line-entry-note";
        note.textContent = "Anda masuk dari QR produk AYA. Kenali dulu fungsi lini ini sebelum melihat detail produk.";
        hero.append(note);
      }
    }
  });

  window.addEventListener("load", polishLockedMobileLine, { once: true });
})();
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
      "farm-agri": '<path d="M31.5 55V16"/><path d="M31.5 27c-6.4-1.7-10.2-6.1-9.4-11.2 6.1.8 9.9 5.2 9.4 11.2Zm0 9.8c6.5-1.8 10.4-6.2 9.6-11.4-6.2.8-10 5.2-9.6 11.4Z"/><path d="M24.4 50.5c-3.8-4.9-5.2-9.7-4.1-14.6m22.6 14.6c3.8-4.9 5.2-9.7 4.1-14.6"/><circle cx="20.1" cy="34.2" r="1.25" fill="currentColor" stroke="none"/><circle cx="43" cy="34.2" r="1.25" fill="currentColor" stroke="none"/>',
      "farm-livestock": '<path d="M22.5 33.3c0-8.2 4.2-14.6 9.5-14.6s9.5 6.4 9.5 14.6-4.2 15-9.5 15-9.5-6.8-9.5-15Z"/><path d="M17 50.7c4.8-3.8 9.8-5.7 15-5.7s10.2 1.9 15 5.7M20 55h24"/><path d="M27 21.1c1.2-3.7 3-6.4 5-8.1 2 1.7 3.8 4.4 5 8.1"/><circle cx="32" cy="35" r="1.2" fill="currentColor" stroke="none"/>',
      "farm-primary": '<path d="M21 23h22l3.5 31H17.5L21 23Z"/><path d="M24.2 23v-6.2h15.6V23M23 30h18"/><path d="M32 47.2V34.5m0 5.1c-4.8-1.6-7.3-4.6-6.7-8.4 4.6.5 7.2 3.7 6.7 8.4Zm0 0c4.8-1.6 7.3-4.6 6.7-8.4-4.6.5-7.2 3.7-6.7 8.4Z"/><circle cx="32" cy="50.6" r="1.25" fill="currentColor" stroke="none"/>',
      "farm-seed": '<path d="M18.5 41.5h27l-3.1 13.3H21.6l-3.1-13.3Z"/><path d="M32 41.5V19.4m0 8.6c-5.7-1.6-8.7-5.1-8-9.6 5.3.6 8.4 4.2 8 9.6Zm0 0c5.7-1.6 8.7-5.1 8-9.6-5.3.6-8.4 4.2-8 9.6Z"/><path d="M45.2 33.8 51 28m-7.2 8.6 4.2 4.2"/><circle cx="32" cy="33.7" r="1.2" fill="currentColor" stroke="none"/>',
      "farm-home": '<path d="M12.5 31.5 32 14.8l19.5 16.7v22H12.5v-22Z"/><path d="M25.2 53.5V38h13.6v15.5M20.2 33.5h23.6"/><path d="M45.2 22.8c2-2.8 4.1-4.4 6.3-4.8"/><circle cx="32" cy="29.6" r="1.25" fill="currentColor" stroke="none"/>',
      "farm-center": '<path d="M12 33h40l-4 23H16l-4-23Z"/><path d="M20 33c2-8 6-13 12-13s10 5 12 13"/><path d="M32 20V8m0 8c-6-2-9-5-8-10 5 1 8 4 8 10Zm0 0c6-2 9-5 8-10-5 1-8 4-8 10Z"/>',

      "spice-base": '<path d="M15 36.5h34c-1.1 11.4-7.3 18-17 18s-15.9-6.6-17-18Z"/><path d="M21.5 36.5c1.6-7 5.2-11 10.5-11s8.9 4 10.5 11M40.5 25.1 52 13.6M44.2 21.4l5.9 5.9"/><path d="M24 31.3c2.6-2.7 5.3-4.1 8-4.1s5.4 1.4 8 4.1"/><circle cx="32" cy="43.2" r="1.25" fill="currentColor" stroke="none"/>',
      "spice-sambal": '<path d="M12.5 43.8c9 .5 18.3-4 27.1-15.4 2.4 9.7-1.4 18.9-10.2 23.8-6.8 3.8-13.1 2.2-16.9-2.9"/><path d="M39.5 28.3c2.4-6 7-9.6 12.8-10.2"/><path d="M19.2 45.2c4.5-.8 9.4-3.3 14.5-7.6"/><circle cx="43.7" cy="24.1" r="1.3" fill="currentColor" stroke="none"/>',
      "spice-whole": '<path d="m31.8 14.5 3.1 7.2 7.8-1-5.9 5.2 2.3 7.5-6.8-4-6.6 4.4 1.8-7.7-6.2-4.8 7.9.5 2.6-7.3Z"/><path d="M42.7 39.2 52 29.9m-7 4.7 7.1 7.1M19 43.3c3.2-4 6.2-6 9-6 2.4 0 4.8 1.2 7.2 3.6"/><circle cx="19" cy="43.3" r="1.3" fill="currentColor" stroke="none"/>',
      "spice-processed": '<path d="M20.5 19h23l3 35.5h-29L20.5 19Z"/><path d="M23.5 19v-6.2h17V19M23.3 30.2h17.4M27.2 40.8h9.6"/><path d="M28 47.4c2.7-2.3 5.3-2.3 8 0"/><circle cx="32" cy="34.5" r="1.2" fill="currentColor" stroke="none"/>',
      "gift": '<path d="M13.5 29h37v25.5h-37V29Z"/><path d="M32 29v25.5M13.5 37h37"/><path d="M32 29c-6.2 0-10-3.6-10-7.5 0-3.5 2.6-6 6-6 3.6 0 6.1 4.4 4 13.5Zm0 0c6.2 0 10-3.6 10-7.5 0-3.5-2.6-6-6-6-3.6 0-6.1 4.4-4 13.5Z"/><circle cx="32" cy="37" r="1.25" fill="currentColor" stroke="none"/>',
      "spice-center": '<path d="M14 31h36c0 14-7 23-18 23S14 45 14 31Z"/><path d="M22 31c2-8 5-12 10-12s8 4 10 12M38 20l13-11M42 17l7 6"/><path d="M18 55h28"/>',

      "snack-drink": '<path d="M21.5 19h23l-3.7 35.5H25.2L21.5 19Z"/><path d="M38.6 19 45 8.4M25 31.5h16M26 41h14"/><path d="M42.7 24.3c3.8-2.7 7.2-3.1 10.3-1.2"/><circle cx="31.8" cy="47.3" r="1.2" fill="currentColor" stroke="none"/>',
      "snack-sweet": '<path d="M16.5 36.5c0-9.2 7-16.5 15.5-16.5s15.5 7.3 15.5 16.5S40.5 53 32 53s-15.5-7.3-15.5-16.5Z"/><path d="M22.5 30.2c6.3 3.2 12.7 3.2 19 0M25.3 42.2c4.5 2.1 9 2.1 13.5 0"/><circle cx="32" cy="36.4" r="1.35" fill="currentColor" stroke="none"/>',
      "snack-savory": '<rect x="14.5" y="20" width="25" height="25" rx="6.5"/><rect x="25" y="28" width="24.5" height="24.5" rx="6"/><path d="M20.5 31h13M31 39h12"/><circle cx="22.5" cy="26.5" r="1.25" fill="currentColor" stroke="none"/><circle cx="42.5" cy="45" r="1.25" fill="currentColor" stroke="none"/>',
      "snack-practical": '<path d="M20.5 17.5h23l3.8 37h-30.6l3.8-37Z"/><path d="M22.3 25.5h19.4M25.5 38.5h13M28.3 45h7.4"/><path d="M25 17.5c1.8-3.1 4.1-4.7 7-4.7s5.2 1.6 7 4.7"/><circle cx="32" cy="31.8" r="1.25" fill="currentColor" stroke="none"/>',
      "snack-box": '<path d="M13 26 32 16l19 10-19 10-19-10Z"/><path d="M13 26v20.5L32 57l19-10.5V26M32 36v21"/><path d="M23.3 21.1 42 31.2M40.7 21.3 22 31.4"/><circle cx="32" cy="36" r="1.25" fill="currentColor" stroke="none"/>',
      "snack-center": '<path d="M12 37h25c-1 11-5 17-12 17s-12-6-13-17Z"/><path d="M36 16h16l-2 27H39l-3-27Z"/><path d="M45 16 51 6M19 33c2-5 5-8 8-8 4 0 7 3 9 8"/>'
    };
    return `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${drawings[kind] || drawings.gift}</svg>`;
  };

  const iconTuning = {
    "farm-agri": "translateY(-1px)",
    "farm-livestock": "translateY(-1px)",
    "farm-primary": "translateY(-1px)",
    "farm-seed": "translateY(-1px)",
    "farm-home": "translateY(-1px)",
    "spice-base": "translateY(-1px)",
    "spice-sambal": "translateY(-1px)",
    "spice-whole": "translateY(-1px)",
    "spice-processed": "translateY(-1px)",
    "gift": "translateY(-1px)",
    "snack-drink": "translateY(-1px)",
    "snack-sweet": "translateY(-1px)",
    "snack-savory": "translateY(-1px)",
    "snack-practical": "translateY(-1px)",
    "snack-box": "translateY(-1px)"
  };

  const prepareLockedVp2 = () => {
    if (!isMobileLine) return;
    neutralizeVp2BasePseudo();

    const key = document.body.dataset.lineKey;
    const cfg = {
      farm: {
        section: ".farm-master-vp2", layout: ".farm-master-understand-layout", intro: ".farm-master-intro", domains: ".farm-master-domains", when: ".farm-master-when",
        line: "AYA FARM", title: "Pilihan dari bumi dan peternakan, dekat dengan keseharian di rumah.", introCopy: "Hasil pertanian, peternakan, produk primer, dan kebutuhan yang melengkapi keseharian.",
        order: [0,1,2,4,3], labels: ["HASIL PERTANIAN","HASIL PETERNAKAN","PRODUK PRIMER","BIBIT & PERLENGKAPAN","KEBUTUHAN SEHARI-HARI"],
        icons: ["farm-agri","farm-livestock","farm-primary","farm-seed","farm-home"], center: "farm-center",
        art: "assets/visual/line-pages/farm-vp1-master.webp", artPos: "center 73%"
      },
      spice: {
        section: ".spice-master-vp2", layout: ".spice-master-understand-layout", intro: ".spice-master-intro", domains: ".spice-master-domains", when: ".spice-master-when",
        line: "AYA SPICE HAVEN", title: "Rasa Nusantara yang memberi karakter pada setiap hidangan.", introCopy: "Sambal, bumbu, rempah, dan olahan yang membawa rasa lebih jauh di meja makan.",
        order: [1,0,2,3,4], labels: ["BUMBU DASAR","SAMBAL NUSANTARA","REMPAH UTUH","OLAHAN REMPAH","PAKET & HAMPERS"],
        icons: ["spice-base","spice-sambal","spice-whole","spice-processed","gift"], center: "spice-center",
        art: "assets/visual/line-pages/spice-vp3-master.webp", artPos: "center 62%"
      },
      snack: {
        section: ".snacks-master-vp2", layout: ".snacks-master-understand-layout", intro: ".snacks-master-intro", domains: ".snacks-master-domains", when: ".snacks-master-when",
        line: "AYA SNACKS & DRINKS", title: "Teman santai, untuk momen yang dinikmati bersama.", introCopy: "Camilan dan minuman untuk menemani waktu santai, berbagi, dan berkumpul.",
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
    const cardWidth = compact ? 96 : 108;
    const cardHeight = compact ? 88 : 100;
    const positions = [
      {left:"50%",top:"0",transform:"translateX(-50%)"},
      {left:"0",top:`calc(49% - ${cardHeight / 2}px)`,transform:"none"},
      {right:"0",top:`calc(49% - ${cardHeight / 2}px)`,transform:"none"},
      {left:"14%",bottom:"0",transform:"none"},
      {right:"14%",bottom:"0",transform:"none"}
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
        Object.assign(icon.style,{width:compact?"32px":"37px",height:compact?"32px":"37px",margin:"0 auto 6px",display:"grid",placeItems:"center"});
        const svg = icon.querySelector("svg");
        if (svg) Object.assign(svg.style,{width:"100%",height:"100%",display:"block",transform:iconTuning[cfg.icons[index]] || "none",transformOrigin:"50% 50%"});
      }

      const label = document.createElement("div");
      label.textContent = cfg.labels[index];
      Object.assign(label.style, {
        maxWidth:"98px",font:`700 ${compact ? "8.8px" : "9.4px"}/1.14 var(--sans)`,letterSpacing:".015em",textTransform:"uppercase",
        textAlign:"center",whiteSpace:"normal",textWrap:"balance"
      });
      article.append(label);

      Object.assign(article.style, {
        position:"absolute",zIndex:"2",width:`${cardWidth}px`,height:`${cardHeight}px`,display:"flex",
        flexDirection:"column",alignItems:"center",justifyContent:"center",boxSizing:"border-box",padding:"7px 5px",
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

    const featuredKicker = document.querySelector(
      ".farm-master-featured-copy>.farm-master-kicker,.spice-master-featured-copy>.spice-master-kicker,.snacks-master-featured-copy>.snacks-master-kicker"
    );
    if (featuredKicker) {
      featuredKicker.textContent = "PRODUK PILIHAN";
      Object.assign(featuredKicker.style, {
        display:"block",margin:"0 0 6px",color:"var(--line-mobile-accent)",
        font:"700 8.8px/1.2 var(--sans)",letterSpacing:".14em",textTransform:"uppercase"
      });
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
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

  const hideVp1PseudoMedallion = () => {
    if (!isMobileLine || !previewStyle?.sheet) return;

    const walkRules = (rules) => {
      for (const rule of Array.from(rules || [])) {
        if (
          rule.selectorText?.includes(".farm-master-hero-copy::before") &&
          rule.selectorText?.includes(".spice-master-hero-copy::before") &&
          rule.selectorText?.includes(".snacks-master-hero-copy::before")
        ) {
          rule.style.display = "none";
        }
        if (rule.cssRules) walkRules(rule.cssRules);
      }
    };

    try { walkRules(previewStyle.sheet.cssRules); } catch { /* same-origin preview CSS only */ }
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
      order: "1",
      width: compact ? "116px" : "130px",
      height: compact ? "116px" : "130px",
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 13px",
      padding: "0",
      boxSizing: "border-box",
      border: "1px solid rgba(181,133,60,.74)",
      borderRadius: "50%",
      background: "rgba(255,249,237,.95)",
      boxShadow: "0 10px 27px rgba(66,33,18,.10), inset 0 0 0 5px rgba(255,252,245,.72)",
      lineHeight: "0"
    });

    const mark = document.createElement("img");
    mark.src = asset;
    mark.alt = alt;
    mark.draggable = false;
    Object.assign(mark.style, {
      display: "block",
      width: compact ? "92px" : "102px",
      height: compact ? "92px" : "102px",
      maxWidth: "none",
      maxHeight: "none",
      margin: "0",
      padding: "0",
      objectFit: "contain",
      objectPosition: "50% 50%",
      transform: "none"
    });

    medallion.append(mark);
    hero.prepend(medallion);
  };

  if (previewStyle) {
    previewStyle.addEventListener("load", () => {
      hideVp1PseudoMedallion();
      renderCanonicalVp1Mark();
    }, { once: true });
  }

  const polishLockedMobileLine = () => {
    if (!isMobileLine) return;

    hideVp1PseudoMedallion();
    renderCanonicalVp1Mark();

    const main = document.querySelector("#main");
    if (main) main.style.scrollPaddingTop = "0px";

    document.querySelectorAll(
      ".farm-master-vp,.spice-master-vp,.snacks-master-vp"
    ).forEach((section) => {
      section.style.scrollMarginTop = "0px";
    });

    document.querySelectorAll(
      ".farm-master-btn>span,.spice-master-btn>span,.snacks-master-btn>span"
    ).forEach((arrow) => arrow.remove());

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

    document.querySelectorAll(
      ".farm-master-vp3-media,.spice-master-vp3-media,.snacks-master-vp3-media"
    ).forEach((media) => {
      if (media.querySelector(".aya-vp3-image-feather")) return;
      const feather = document.createElement("span");
      feather.className = "aya-vp3-image-feather";
      feather.setAttribute("aria-hidden", "true");
      Object.assign(feather.style, {
        position: "absolute",
        zIndex: "2",
        left: "0",
        right: "0",
        bottom: "0",
        height: "76px",
        pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,250,241,0) 0%, rgba(255,250,241,.12) 26%, rgba(255,250,241,.48) 58%, rgba(255,250,241,.84) 82%, #fffaf1 100%)"
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

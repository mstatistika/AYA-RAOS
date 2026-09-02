(() => {
  "use strict";

  const mq = window.matchMedia("(max-width: 900px)");
  if (!mq.matches || document.documentElement.dataset.ayaMobileUiReady === "true") return;
  document.documentElement.dataset.ayaMobileUiReady = "true";

  const page = document.body?.dataset.page || "";
  const AYA = window.AYA;
  const escapeHTML = AYA?.escapeHTML || ((value = "") => String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]));
  const formatPrice = AYA?.formatPrice || ((value) => new Intl.NumberFormat("id-ID", {style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value)||0));

  const visibleProducts = () => (typeof AYA?.products === "function" ? AYA.products() : (Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : []))
    .filter((product) => product?.visible === true && product?.id && product?.name);

  function initLineMobile() {
    if (page !== "line") return;
    document.body.classList.add("aya-mobile-line-active");

    const renderCanonicalVp1Mark = () => {
        const config = {
          farm: [".farm-master-hero-copy", "assets/brand/aya-farm/mark.png", "AYA Farm"],
          spice: [".spice-master-hero-copy", "assets/brand/aya-spice-haven/mark.png", "AYA Spice Haven"],
          snack: [".snacks-master-hero-copy", "assets/brand/aya-snacks-drinks/mark.png", "AYA Snacks & Drinks"]
        }[document.body.dataset.lineKey];
        if (!config) return;

        const [heroSelector, asset, alt] = config;
        const hero = document.querySelector(heroSelector);
        if (!hero) return;
        hero.querySelector(":scope > p")?.remove();
        if (hero.querySelector(".aya-vp1-line-medallion")) return;

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


    document.body.dataset.mobileLineFinal = "true";
  }

  function initMobileCatalog() {
    if (page !== "products") return;
    const sourceMain = document.querySelector("main#main");
    if (!sourceMain || document.querySelector(".aya-mobile-catalog")) return;
    const products = visibleProducts().filter((product) => Array.isArray(product.variants) && product.variants.some((variant) => Number(variant?.price) > 0));
    if (!products.length) return;
    const lineMeta = {farm:{label:"AYA FARM",short:"FARM",mark:"⌁"},spice:{label:"AYA SPICE HAVEN",short:"SPICE HAVEN",mark:"✦"},snack:{label:"AYA SNACKS & DRINKS",short:"SNACKS & DRINKS",mark:"◌"}};
    const normalizeLine = (product) => product.lineKey === "snacks" ? "snack" : product.lineKey;
    const validLines = ["farm","spice","snack"];
    const urlLine = new URLSearchParams(location.search).get("line");
    let activeLine = validLines.includes(urlLine) ? urlLine : (products.some((p) => normalizeLine(p) === "spice") ? "spice" : normalizeLine(products[0]));
    let activeIndex = 0;
    const selectedVariant = new Map();
    const root = document.createElement("section");
    root.className = "aya-mobile-catalog";
    root.innerHTML = `<div class="aya-mobile-catalog-stage"><header class="aya-mobile-catalog-heading"><span>PRODUK AYA</span><h1>Temukan yang ingin Anda rasa.</h1></header><nav class="aya-mobile-product-nav" aria-label="Navigasi produk"><button type="button" data-mobile-product-prev aria-label="Produk sebelumnya">‹</button><button type="button" data-mobile-product-next aria-label="Produk berikutnya">›</button></nav><div class="aya-mobile-product-stage" data-mobile-product-stage aria-live="polite"></div><nav class="aya-mobile-line-filter" aria-label="Filter lini AYA">${validLines.map((line)=>`<button type="button" data-mobile-line="${line}"><span aria-hidden="true">${lineMeta[line].mark}</span><strong>${lineMeta[line].short}</strong></button>`).join("")}</nav></div><div class="aya-mobile-variant-backdrop" data-mobile-variant-backdrop aria-hidden="true"><section class="aya-mobile-variant-picker" role="dialog" aria-modal="true" aria-label="Pilih varian"><header><span>PILIH VARIAN</span><h2 data-mobile-variant-title>Varian</h2></header><div data-mobile-variant-options></div><button type="button" data-mobile-variant-close>TUTUP</button></section></div><div class="aya-mobile-photo-lightbox" data-mobile-photo-lightbox aria-hidden="true"><div class="aya-mobile-photo-frame"><div class="aya-mobile-photo-brand"><span data-mobile-photo-mark></span><strong data-mobile-photo-line></strong></div><button type="button" data-mobile-photo-close aria-label="Tutup foto">×</button><img data-mobile-photo-image alt=""><h2 data-mobile-photo-title></h2></div></div>`;
    sourceMain.insertAdjacentElement("beforebegin", root); sourceMain.setAttribute("data-mobile-source-hidden", "true");
    const stage=root.querySelector("[data-mobile-product-stage]"),prev=root.querySelector("[data-mobile-product-prev]"),next=root.querySelector("[data-mobile-product-next]"),lineButtons=[...root.querySelectorAll("[data-mobile-line]")],pickerBackdrop=root.querySelector("[data-mobile-variant-backdrop]"),pickerTitle=root.querySelector("[data-mobile-variant-title]"),pickerOptions=root.querySelector("[data-mobile-variant-options]");
    const productsForLine=()=>products.filter((product)=>normalizeLine(product)===activeLine);
    const variantsFor=(product)=>product.variants.filter((variant)=>variant?.name&&Number(variant.price)>0);
    const selectedFor=(product)=>{const variants=variantsFor(product),stored=selectedVariant.get(product.id);return variants.find((variant)=>variant.name===stored)||variants[0];};
    const factText=(value,fallback)=>String(value||fallback||"").trim();
    function productMarkup(product){const line=normalizeLine(product),meta=lineMeta[line]||lineMeta.spice,variant=selectedFor(product),image=product.image||product.placeholder||"assets/visual/aya-mark.svg",character=factText(product.flavorProfile,product.category||"Karakter rasa AYA."),suitable=factText(product.suitableUse,product.description||"Untuk dinikmati sesuai kebutuhan sehari-hari."),orderable=product.orderable===true;return `<article class="aya-mobile-product-card" data-mobile-product-id="${escapeHTML(product.id)}"><button class="aya-mobile-product-image" type="button" data-mobile-photo-open aria-label="Lihat foto ${escapeHTML(product.name)} lebih besar"><img src="${escapeHTML(image)}" alt="${escapeHTML(product.name)}" data-image-fallback="${escapeHTML(product.id)}"></button><div class="aya-mobile-product-identity">${escapeHTML(meta.label)}</div><div class="aya-mobile-product-body"><div><h2>${escapeHTML(product.name)}</h2><p>${escapeHTML(product.description||"Produk AYA untuk menemani keseharian.")}</p><dl><div><dt>Karakter</dt><dd>${escapeHTML(character)}</dd></div><div><dt>Cocok</dt><dd>${escapeHTML(suitable)}</dd></div></dl></div><div class="aya-mobile-commerce">${orderable?`<button class="aya-mobile-variant-trigger" type="button" data-mobile-variant-open>${escapeHTML(variant?.name||"Pilih varian")}</button>`:`<div class="aya-mobile-unavailable">Belum dapat ditambahkan ke keranjang</div>`}<div class="aya-mobile-buy">${variant?`<strong>${escapeHTML(formatPrice(variant.price).replace(/\s/g,""))}</strong>`:""}${orderable?`<button type="button" data-mobile-add-cart aria-label="Tambah ${escapeHTML(product.name)} ke keranjang"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5h2.2l1.7 9.1h9.5l2-6.3H7.2"/><circle cx="9.2" cy="18.2" r="1.15"/><circle cx="16.4" cy="18.2" r="1.15"/></svg></button>`:""}</div></div></div></article>`;}
    function render(){const list=productsForLine();activeIndex=list.length?((activeIndex%list.length)+list.length)%list.length:0;stage.innerHTML=list.length?productMarkup(list[activeIndex]):'<div class="aya-mobile-catalog-empty"><strong>Belum ada produk di lini ini.</strong><span>Coba lini AYA lainnya.</span></div>';prev.disabled=list.length<2;next.disabled=list.length<2;lineButtons.forEach((button)=>{const active=button.dataset.mobileLine===activeLine;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));});bindCard();}
    function bindCard(){const card=stage.querySelector(".aya-mobile-product-card");if(!card)return;const product=products.find((item)=>item.id===card.dataset.mobileProductId);card.querySelector("[data-mobile-variant-open]")?.addEventListener("click",()=>openPicker(product));card.querySelector("[data-mobile-add-cart]")?.addEventListener("click",()=>{const variant=selectedFor(product);if(variant)AYA?.addToCart?.(product.id,variant.name,product.minQuantity||1);});card.querySelector("[data-mobile-photo-open]")?.addEventListener("click",()=>openPhoto(product));}
    function move(direction){const list=productsForLine();if(list.length<2)return;activeIndex=(activeIndex+direction+list.length)%list.length;render();}
    prev.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));lineButtons.forEach((button)=>button.addEventListener("click",()=>{activeLine=button.dataset.mobileLine;activeIndex=0;render();}));
    let startX=0,startY=0;stage.addEventListener("touchstart",(event)=>{const touch=event.changedTouches[0];startX=touch.clientX;startY=touch.clientY;},{passive:true});stage.addEventListener("touchend",(event)=>{const touch=event.changedTouches[0],dx=touch.clientX-startX,dy=touch.clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)move(dx<0?1:-1);},{passive:true});
    function openPicker(product){pickerTitle.textContent=product.name;const selected=selectedFor(product);pickerOptions.innerHTML=variantsFor(product).map((variant)=>`<button type="button" data-mobile-variant="${escapeHTML(variant.name)}" class="${variant.name===selected?.name?"active":""}"><span>${escapeHTML(variant.name)}</span><i>✓</i></button>`).join("");pickerOptions.querySelectorAll("[data-mobile-variant]").forEach((button)=>button.addEventListener("click",()=>{selectedVariant.set(product.id,button.dataset.mobileVariant);closePicker();render();}));pickerBackdrop.classList.add("open");pickerBackdrop.setAttribute("aria-hidden","false");}
    function closePicker(){pickerBackdrop.classList.remove("open");pickerBackdrop.setAttribute("aria-hidden","true");}
    root.querySelector("[data-mobile-variant-close]").addEventListener("click",closePicker);pickerBackdrop.addEventListener("click",(event)=>{if(event.target===pickerBackdrop)closePicker();});
    const lightbox=root.querySelector("[data-mobile-photo-lightbox]");
    function openPhoto(product){const line=normalizeLine(product),meta=lineMeta[line]||lineMeta.spice,img=lightbox.querySelector("[data-mobile-photo-image]");img.src=product.image||product.placeholder||"assets/visual/aya-mark.svg";img.alt=product.name;lightbox.querySelector("[data-mobile-photo-title]").textContent=product.name;lightbox.querySelector("[data-mobile-photo-line]").textContent=meta.label;lightbox.querySelector("[data-mobile-photo-mark]").textContent=meta.mark;lightbox.classList.add("open");lightbox.setAttribute("aria-hidden","false");}
    function closePhoto(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");}
    root.querySelector("[data-mobile-photo-close]").addEventListener("click",closePhoto);lightbox.addEventListener("click",(event)=>{if(event.target===lightbox)closePhoto();});document.addEventListener("keydown",(event)=>{if(event.key==="Escape"){closePicker();closePhoto();}});render();
  }

  function initMobileTestimonials() {
    if (page !== "testimonials") return;
    const sourceMain=document.querySelector("main#main");if(!sourceMain||document.querySelector(".aya-mobile-testimonials"))return;
    const data=window.AYA_TESTIMONIALS||{},videos=Array.isArray(data.videos)?data.videos.filter(Boolean):[],photos=Array.isArray(data.featured)?data.featured.filter(Boolean):[],texts=Array.isArray(data.texts)?data.texts.filter(Boolean):[],productFor=(item)=>item?.productId?AYA?.getProduct?.(item.productId):null;
    const storyCard=(item,clone=false)=>{const product=productFor(item),image=product?.image||product?.placeholder||"assets/visual/aya-mark.svg";return `<article class="aya-mobile-story-card${clone?" is-clone":""}"${clone?' aria-hidden="true"':""}><div class="aya-mobile-story-product" style="background-image:url('${escapeHTML(image)}')"></div><div><blockquote>“${escapeHTML(item.quote||"")}”</blockquote><p><strong>${escapeHTML(item.name||"Pelanggan AYA")}</strong><span>${escapeHTML(item.meta||product?.name||"Produk AYA")}</span></p></div></article>`;};
    const photo=photos[0],photoSrc=photo?.displayImage||photo?.image||"",root=document.createElement("section");root.className="aya-mobile-testimonials";root.innerHTML=`<div class="aya-mobile-testimonial-stage"><header><span>PENGALAMAN RASA BERSAMA AYA</span><h1>Cerita dari meja mereka.</h1><p>Rasa yang sampai ke rumah, dinikmati sederhana, lalu jadi cerita.</p></header><nav class="aya-mobile-testimonial-tabs" aria-label="Format testimoni"><button data-mobile-testimonial-mode="video">VIDEO</button><button data-mobile-testimonial-mode="photo">FOTO</button><button class="active" data-mobile-testimonial-mode="text">TULISAN</button></nav><div class="aya-mobile-testimonial-media"><section data-mobile-testimonial-panel="video">${videos.length?`<div class="aya-mobile-video-stack">${videos.map((item,index)=>`<video ${index?"hidden":""} controls playsinline preload="metadata" ${item.poster?`poster="${escapeHTML(item.poster)}"`:""} src="${escapeHTML(item.url||"")}"></video>`).join("")}</div>`:`<div class="aya-mobile-video-empty"><strong>Video segera hadir.</strong><p>Cerita video hanya tampil setelah melalui peninjauan AYA.</p></div>`}</section><section data-mobile-testimonial-panel="photo" hidden>${photoSrc?`<figure><img src="${escapeHTML(photoSrc)}" alt="Foto testimoni pelanggan AYA"><figcaption>${escapeHTML(photo?.name||"Cerita pelanggan AYA")}</figcaption></figure>`:`<div class="aya-mobile-video-empty"><strong>Foto segera hadir.</strong><p>Cerita foto tampil setelah melalui peninjauan AYA.</p></div>`}</section><section class="active" data-mobile-testimonial-panel="text"><div class="aya-mobile-story-reel">${texts.length?[...texts.map((item)=>storyCard(item)),...texts.map((item)=>storyCard(item,true))].join(""):`<div class="aya-mobile-video-empty"><strong>Cerita segera hadir.</strong></div>`}</div></section></div><aside class="aya-mobile-share-mini"><div><h2>Sekarang giliran ceritamu.</h2><p>Bagikan pengalamanmu bersama AYA.</p></div><a href="share.html">BAGIKAN CERITAMU</a></aside></div>`;
    sourceMain.insertAdjacentElement("beforebegin",root);sourceMain.setAttribute("data-mobile-source-hidden","true");
    const modes=["text","photo","video"];let modeIndex=0,timer=null,videoIndex=0;const buttons=[...root.querySelectorAll("[data-mobile-testimonial-mode]")],panels=[...root.querySelectorAll("[data-mobile-testimonial-panel]")];
    const setMode=(mode)=>{buttons.forEach((button)=>button.classList.toggle("active",button.dataset.mobileTestimonialMode===mode));panels.forEach((panel)=>{const active=panel.dataset.mobileTestimonialPanel===mode;panel.hidden=!active;panel.classList.toggle("active",active);});modeIndex=Math.max(0,modes.indexOf(mode));};
    const restart=()=>{clearInterval(timer);if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;timer=setInterval(()=>{modeIndex=(modeIndex+1)%modes.length;setMode(modes[modeIndex]);},8000);};buttons.forEach((button)=>button.addEventListener("click",()=>{setMode(button.dataset.mobileTestimonialMode);restart();}));
    const reel=root.querySelector(".aya-mobile-story-reel");["touchstart","pointerdown","focusin"].forEach((name)=>reel?.addEventListener(name,()=>reel.classList.add("is-paused")));["pointerleave","focusout"].forEach((name)=>reel?.addEventListener(name,()=>reel.classList.remove("is-paused")));root.querySelectorAll("video").forEach((video,index)=>video.addEventListener("ended",()=>{if(videos.length<2)return;video.hidden=true;videoIndex=(index+1)%videos.length;const nextVideo=root.querySelectorAll("video")[videoIndex];nextVideo.hidden=false;nextVideo.play().catch(()=>{});}));setMode("text");restart();
  }

  function initMobileShare() {
    if (page !== "share") return;
    const sourceMain=document.querySelector("main#main"),form=document.querySelector("[data-testimonial-wizard]");if(!sourceMain||!form||document.querySelector(".aya-mobile-share"))return;
    const original={name:form.elements.customerName,city:form.elements.city,phone:form.elements.phone,product:form.elements.product,story:form.elements.testimonial,consent:form.elements.consent,radios:[...form.querySelectorAll('[name="testimonialFormat"]')],file:form.querySelector("[data-media-file]"),upload:form.querySelector("[data-media-upload]"),url:form.querySelector("[data-media-url]"),remove:form.querySelector("[data-media-remove]"),next:form.querySelector("[data-review-next]"),success:document.querySelector("[data-wizard-success]")};
    const products=visibleProducts(),root=document.createElement("section");root.className="aya-mobile-share";root.innerHTML=`<div class="aya-mobile-share-app"><header><span>BAGIKAN CERITAMU</span><h1>Kini giliran <em>ceritamu.</em></h1><p>Sedikit tentang kamu, lalu bagikan pengalaman rasa bersama AYA.</p></header><div class="aya-mobile-share-scroll"><h2>Tentang kamu</h2><div class="aya-mobile-share-two"><label data-mobile-field="name"><span>Nama <em>*</em><small></small></span><input type="text" maxlength="80" autocomplete="name" placeholder="Nama atau username"></label><label data-mobile-field="city"><span>Kota / area <em>*</em><small></small></span><input type="text" maxlength="80" autocomplete="address-level2" placeholder="Tangerang"></label></div><label data-mobile-field="phone"><span>WhatsApp <i>Opsional · privat</i></span><input type="tel" maxlength="24" inputmode="tel" placeholder="08xx xxxx xxxx"></label><div class="aya-mobile-product-field" data-mobile-field="product"><span>Produk AYA <em>*</em><small></small></span><button type="button" data-mobile-product-trigger aria-expanded="false"><b>Pilih produk</b><i>⌄</i></button></div><div class="aya-mobile-type-field" data-mobile-field="type"><span>Jenis testimoni <em>*</em><button type="button" data-mobile-type-status hidden></button></span><div><button type="button" data-mobile-format="text">Tulisan</button><button type="button" data-mobile-format="photo">Foto</button><button type="button" data-mobile-format="video">Video</button></div></div><label class="aya-mobile-story-field" data-mobile-field="story"><span>Ceritamu <em>*</em><small data-mobile-story-status></small></span><textarea maxlength="800" minlength="15" rows="3" placeholder="Ceritakan pengalamanmu menikmati AYA."></textarea><i><b data-mobile-count>0</b> / 800</i></label></div><button class="aya-mobile-share-submit" type="button" data-mobile-share-submit>KIRIM UNTUK DITINJAU</button><div class="aya-mobile-product-picker" data-mobile-product-picker aria-hidden="true"><section><header><span>PRODUK AYA</span><h2>Pilih produk</h2><button type="button" data-mobile-product-close>×</button></header><div>${products.map((product)=>`<button type="button" data-mobile-product="${escapeHTML(product.id)}"><span>${escapeHTML(product.name)}</span><i>✓</i></button>`).join("")}</div></section></div><div class="aya-mobile-media-popup" data-mobile-media-popup aria-hidden="true"><section><header><div><span data-mobile-media-kicker>FOTO</span><h2 data-mobile-media-heading>Tambahkan foto</h2></div><button type="button" data-mobile-media-close>×</button></header><div class="aya-mobile-media-stage"><div data-mobile-media-empty><strong>AYA</strong><button type="button" data-mobile-media-pick>TAMBAH FOTO</button></div><img data-mobile-media-image alt="" hidden><video data-mobile-media-video controls playsinline hidden></video><button type="button" data-mobile-media-remove hidden>×</button></div><div class="aya-mobile-media-name" data-mobile-media-name hidden></div><div class="aya-mobile-media-progress" data-mobile-media-progress hidden><span><b>Menyiapkan preview…</b><i data-mobile-progress-value>0%</i></span><div><i data-mobile-progress-bar></i></div></div><label>Link <small>Opsional</small><input type="url" data-mobile-media-url placeholder="https://"></label><p data-mobile-media-error></p><div class="aya-mobile-media-actions"><button type="button" data-mobile-media-cancel>KEMBALI</button><button type="button" data-mobile-media-save>SIMPAN</button></div></section></div><div class="aya-mobile-change-type" data-mobile-change-type aria-hidden="true"><section><span>GANTI JENIS TESTIMONI</span><h2>Ganti jenis testimoni?</h2><p data-mobile-change-copy>Ceritamu tetap tersimpan.</p><div><button type="button" data-mobile-change-back>KEMBALI</button><button type="button" data-mobile-change-confirm>GANTI JENIS</button></div></section></div></div>`;
    sourceMain.insertAdjacentElement("beforebegin",root);sourceMain.setAttribute("data-mobile-source-hidden","true");
    const q=(selector)=>root.querySelector(selector),fields={name:q('[data-mobile-field="name"] input'),city:q('[data-mobile-field="city"] input'),phone:q('[data-mobile-field="phone"] input'),story:q('[data-mobile-field="story"] textarea')},productTrigger=q("[data-mobile-product-trigger]"),picker=q("[data-mobile-product-picker]"),typeStatus=q("[data-mobile-type-status]"),storyStatus=q("[data-mobile-story-status]"),count=q("[data-mobile-count]"),formatButtons=[...root.querySelectorAll("[data-mobile-format]")],mediaPopup=q("[data-mobile-media-popup]"),mediaImage=q("[data-mobile-media-image]"),mediaVideo=q("[data-mobile-media-video]"),mediaEmpty=q("[data-mobile-media-empty]"),mediaName=q("[data-mobile-media-name]"),mediaRemove=q("[data-mobile-media-remove]"),mediaUrl=q("[data-mobile-media-url]"),mediaError=q("[data-mobile-media-error]"),progress=q("[data-mobile-media-progress]"),progressBar=q("[data-mobile-progress-bar]"),progressValue=q("[data-mobile-progress-value]"),change=q("[data-mobile-change-type]"),changeCopy=q("[data-mobile-change-copy]");
    let selectedProduct="",activeFormat="",formatLocked=false,popupFormat="",previewObjectUrl=null;const mediaReady={photo:false,video:false};
    const setOriginalFormat=(format)=>{const radio=original.radios.find((item)=>item.value===format);if(!radio)return;radio.checked=true;radio.dispatchEvent(new Event("change",{bubbles:true}));};
    const sync=()=>{original.name.value=fields.name.value;original.city.value=fields.city.value;original.phone.value=fields.phone.value;original.product.value=selectedProduct;original.product.dispatchEvent(new Event("change",{bubbles:true}));original.story.value=fields.story.value;original.story.dispatchEvent(new Event("input",{bubbles:true}));if(activeFormat)setOriginalFormat(activeFormat);};
    Object.entries(fields).forEach(([key,input])=>input.addEventListener("input",()=>{const orig=original[key];if(orig){orig.value=input.value;orig.dispatchEvent(new Event("input",{bubbles:true}));}q(`[data-mobile-field="${key}"]`)?.classList.remove("invalid");if(key==="story")updateStory();}));
    function updateStory(){count.textContent=String(fields.story.value.length);const len=fields.story.value.trim().length;storyStatus.textContent=len===0?"":len<15?"Min. 15 karakter":"";storyStatus.classList.toggle("show",len>0&&len<15);q('[data-mobile-field="story"]').classList.toggle("invalid",len>0&&len<15);}updateStory();
    function openPicker(){picker.classList.add("open");picker.setAttribute("aria-hidden","false");productTrigger.setAttribute("aria-expanded","true");}function closePicker(){picker.classList.remove("open");picker.setAttribute("aria-hidden","true");productTrigger.setAttribute("aria-expanded","false");}productTrigger.addEventListener("click",openPicker);q("[data-mobile-product-close]").addEventListener("click",closePicker);picker.addEventListener("click",(e)=>{if(e.target===picker)closePicker()});root.querySelectorAll("[data-mobile-product]").forEach((button)=>button.addEventListener("click",()=>{selectedProduct=button.dataset.mobileProduct;const product=products.find((item)=>item.id===selectedProduct);productTrigger.querySelector("b").textContent=product?.name||"Pilih produk";original.product.value=selectedProduct;original.product.dispatchEvent(new Event("change",{bubbles:true}));q('[data-mobile-field="product"]').classList.remove("invalid");closePicker();}));
    function renderFormat(){formatButtons.forEach((button)=>{const selected=button.dataset.mobileFormat===activeFormat;button.classList.toggle("active",selected);button.disabled=formatLocked&&!selected;});if(!formatLocked){typeStatus.hidden=true;typeStatus.textContent="";return;}const label=activeFormat==="photo"?"Foto siap":activeFormat==="video"?"Video siap":"Tulisan dipilih";typeStatus.hidden=false;typeStatus.textContent=`${label} · Ganti`;}
    function lockFormat(format){activeFormat=format;formatLocked=true;setOriginalFormat(format);q('[data-mobile-field="type"]').classList.remove("invalid");renderFormat();}function unlockFormat(){activeFormat="";formatLocked=false;original.radios.forEach((r)=>{r.checked=false});renderFormat();}
    formatButtons.forEach((button)=>button.addEventListener("click",()=>{const format=button.dataset.mobileFormat;if(formatLocked){if(format===activeFormat&&(format==="photo"||format==="video"))openMedia(format);return;}if(format==="text"){lockFormat("text");return;}setOriginalFormat(format);openMedia(format);}));typeStatus.addEventListener("click",()=>{if(!formatLocked)return;const readable=activeFormat==="photo"?"Foto":activeFormat==="video"?"Video":"Tulisan";changeCopy.textContent=activeFormat==="text"?"Jenis testimoni akan diganti. Ceritamu tetap tersimpan.":`${readable} yang sudah dipilih akan dilepas dari testimoni ini. Ceritamu tetap tersimpan.`;change.classList.add("open");change.setAttribute("aria-hidden","false");});q("[data-mobile-change-back]").addEventListener("click",()=>{change.classList.remove("open");change.setAttribute("aria-hidden","true")});q("[data-mobile-change-confirm]").addEventListener("click",()=>{if(activeFormat==="photo"||activeFormat==="video"){original.remove?.click();mediaReady[activeFormat]=false;}change.classList.remove("open");change.setAttribute("aria-hidden","true");unlockFormat();});
    function clearPreview(){if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl=null;}try{mediaVideo.pause()}catch{}mediaImage.hidden=true;mediaVideo.hidden=true;mediaImage.removeAttribute("src");mediaVideo.removeAttribute("src");mediaEmpty.hidden=false;mediaName.hidden=true;mediaRemove.hidden=true;progress.hidden=true;progressBar.style.width="0%";progressValue.textContent="0%";mediaError.textContent="";}
    function openMedia(format){popupFormat=format;clearPreview();q("[data-mobile-media-kicker]").textContent=format==="photo"?"FOTO":"VIDEO";q("[data-mobile-media-heading]").textContent=format==="photo"?"Tambahkan foto":"Tambahkan video";q("[data-mobile-media-pick]").textContent=format==="photo"?"TAMBAH FOTO":"TAMBAH VIDEO";mediaUrl.value=original.url?.value||"";const file=original.file?.files?.[0];if(file)showFile(file);mediaPopup.classList.add("open");mediaPopup.setAttribute("aria-hidden","false");}function closeMedia(){mediaPopup.classList.remove("open");mediaPopup.setAttribute("aria-hidden","true");}q("[data-mobile-media-close]").addEventListener("click",closeMedia);q("[data-mobile-media-cancel]").addEventListener("click",closeMedia);mediaPopup.addEventListener("click",(e)=>{if(e.target===mediaPopup)closeMedia()});q("[data-mobile-media-pick]").addEventListener("click",()=>{setOriginalFormat(popupFormat);original.upload?.click()});
    function showFile(file){clearPreview();previewObjectUrl=URL.createObjectURL(file);mediaEmpty.hidden=true;mediaName.hidden=false;mediaName.textContent=file.name;mediaRemove.hidden=false;if(popupFormat==="photo"){mediaImage.src=previewObjectUrl;mediaImage.hidden=false;}else{mediaVideo.src=previewObjectUrl;mediaVideo.hidden=false;}}
    async function showProgress(file){progress.hidden=false;let loaded=0;const start=performance.now();if(file.stream){const reader=file.stream().getReader();while(true){const {done,value}=await reader.read();if(done)break;loaded+=value.byteLength;const pct=file.size?Math.min(100,Math.round(loaded/file.size*100)):100;progressBar.style.width=pct+"%";progressValue.textContent=pct+"%";}reader.releaseLock?.();}else{progressBar.style.width="100%";progressValue.textContent="100%";}const elapsed=performance.now()-start;if(elapsed<650)await new Promise((r)=>setTimeout(r,650-elapsed));progress.hidden=true;}
    original.file?.addEventListener("change",()=>{const file=original.file.files?.[0];if(!file)return;showFile(file);showProgress(file).catch(()=>{progress.hidden=true});});mediaRemove.addEventListener("click",()=>{original.remove?.click();mediaReady[popupFormat]=false;clearPreview();});q("[data-mobile-media-save]").addEventListener("click",()=>{const file=original.file?.files?.[0],url=mediaUrl.value.trim();if(!file&&!/^https:\/\//i.test(url)){mediaError.textContent=`Tambahkan ${popupFormat==="photo"?"foto":"video"} atau link HTTPS terlebih dahulu.`;return;}if(url){original.url.value=url;original.url.dispatchEvent(new Event("input",{bubbles:true}));}mediaReady[popupFormat]=true;lockFormat(popupFormat);closeMedia();});
    function markInvalid(key,message="Belum diisi"){const wrap=q(`[data-mobile-field="${key}"]`);wrap?.classList.add("invalid");const note=wrap?.querySelector("small");if(note&&key!=="story")note.textContent=message;}
    function validate(){let valid=true;["name","city"].forEach((key)=>{q(`[data-mobile-field="${key}"]`)?.classList.remove("invalid");if(!fields[key].value.trim()){markInvalid(key);valid=false;}});q('[data-mobile-field="product"]').classList.remove("invalid");if(!selectedProduct){markInvalid("product");valid=false;}q('[data-mobile-field="type"]').classList.remove("invalid");if(!activeFormat){q('[data-mobile-field="type"]').classList.add("invalid");valid=false;}const len=fields.story.value.trim().length;if(!len){q('[data-mobile-field="story"]').classList.add("invalid");storyStatus.textContent="Belum diisi";storyStatus.classList.add("show");valid=false;}else if(len<15){q('[data-mobile-field="story"]').classList.add("invalid");storyStatus.textContent="Min. 15 karakter";storyStatus.classList.add("show");valid=false;}else{q('[data-mobile-field="story"]').classList.remove("invalid");storyStatus.textContent="";storyStatus.classList.remove("show");}if((activeFormat==="photo"||activeFormat==="video")&&!mediaReady[activeFormat]&&!original.file?.files?.[0]&&!/^https:\/\//i.test(original.url?.value||"")){q('[data-mobile-field="type"]').classList.add("invalid");valid=false;}return valid;}
    const confirmModal=document.querySelector("[data-testimonial-confirm-modal]"),confirmDialog=confirmModal?.querySelector(".testimonial-confirm-dialog"),confirmSend=confirmModal?.querySelector("[data-confirm-send]"),confirmCancel=confirmModal?.querySelector("[data-confirm-cancel]");let mobileConsent=null;
    function prepareConfirm(){if(!confirmModal||!confirmDialog)return;confirmDialog.classList.add("aya-mobile-confirm-dialog");confirmDialog.querySelector(".testimonial-confirm-icon")?.setAttribute("hidden","");confirmDialog.querySelector(".testimonial-confirm-kicker")?.setAttribute("hidden","");const title=confirmDialog.querySelector("h2");if(title)title.textContent="Apakah Anda sudah memeriksa data yang diisi?";const intro=confirmDialog.querySelector(".testimonial-confirm-intro");if(intro)intro.textContent="Pastikan ceritamu sudah sesuai, lalu beri persetujuan sebelum dikirim.";confirmDialog.querySelector(".testimonial-confirm-summary")?.setAttribute("hidden","");confirmDialog.querySelector(".testimonial-confirm-note")?.setAttribute("hidden","");if(!confirmDialog.querySelector("[data-mobile-confirm-consent]")){const label=document.createElement("label");label.className="aya-mobile-confirm-consent";label.dataset.mobileConfirmConsent="";label.innerHTML='<input type="checkbox"><span>Saya mengizinkan AYA RAOS meninjau dan mempublikasikan testimoni yang disetujui tanpa mengubah substansi cerita saya.</span>';confirmDialog.querySelector(".testimonial-confirm-actions")?.insertAdjacentElement("beforebegin",label);mobileConsent=label.querySelector("input");mobileConsent.addEventListener("change",()=>{original.consent.checked=mobileConsent.checked;confirmSend.disabled=!mobileConsent.checked;});}else mobileConsent=confirmDialog.querySelector("[data-mobile-confirm-consent] input");const back=confirmDialog.querySelector(".testimonial-confirm-secondary");if(back)back.textContent="KEMBALI";if(confirmSend){confirmSend.textContent="YA, KIRIM";confirmSend.disabled=true;}}
    prepareConfirm();confirmSend?.addEventListener("click",(event)=>{if(!mobileConsent?.checked){event.preventDefault();event.stopImmediatePropagation();return;}original.consent.checked=true;},true);confirmCancel?.addEventListener("click",()=>{if(mobileConsent)mobileConsent.checked=false;original.consent.checked=false;if(confirmSend)confirmSend.disabled=true;});q("[data-mobile-share-submit]").addEventListener("click",()=>{if(!validate())return;sync();original.consent.checked=true;original.next?.click();original.consent.checked=false;if(mobileConsent)mobileConsent.checked=false;if(confirmSend)confirmSend.disabled=true;});
    if(original.success){new MutationObserver(()=>{if(!original.success.hidden){root.innerHTML='<div class="aya-mobile-share-success"><span>✓</span><small>TESTIMONI TERKIRIM</small><h2>Ceritamu sudah kami terima.</h2><p>Terima kasih sudah berbagi pengalaman bersama AYA. Cerita akan ditinjau terlebih dahulu sebelum dapat ditampilkan.</p><a href="testimonials.html">KEMBALI KE TESTIMONI</a></div>';}}).observe(original.success,{attributes:true,attributeFilter:["hidden"]});}window.addEventListener("beforeunload",()=>{if(previewObjectUrl)URL.revokeObjectURL(previewObjectUrl)});renderFormat();
  }

  initLineMobile();
  initMobileCatalog();
  initMobileTestimonials();
  initMobileShare();
})();

(() => {
  "use strict";

  const mq = window.matchMedia("(max-width: 900px)");
  if (!mq.matches || document.body?.dataset.page !== "line") return;

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);

  const config = {
    farm: {
      prefix: "farm-master",
      lineName: "AYA FARM",
      title: "TUMBUH",
      vp1Copy: "Dari yang tumbuh, bermula keseharian.",
      logo: "assets/brand/aya-farm/primary.png",
      mark: "assets/brand/aya-farm/mark.png",
      vp2Headline: "Sumber alami pilihan, untuk hidup yang seimbang.",
      vp2Intro: "Kami menghadirkan hasil bumi dan peternakan terpercaya untuk kebutuhan sehari-hari.",
      categories: ["Hasil Pertanian", "Hasil Peternakan", "Produk Primer", "Bibit & Perlengkapan", "Kebutuhan Sehari-hari"],
      daily: "Dari hasil bumi dan peternakan, untuk melengkapi kebutuhan rumah sehari-hari.",
      productCopy: "Nasi yang baik dimulai dari beras yang dipilih dengan baik."
    },
    spice: {
      prefix: "spice-master",
      lineName: "AYA SPICE HAVEN",
      title: "DI OLAH",
      vp1Copy: "Diolah dengan rempah, menghadirkan rasa.",
      logo: "assets/brand/aya-spice-haven/primary.png",
      mark: "assets/brand/aya-spice-haven/mark.png",
      vp2Headline: "Rasa autentik, warisan rempah Nusantara.",
      vp2Intro: "Rempah terbaik diolah dengan teliti untuk rasa yang kaya dan berkarakter.",
      categories: ["Bumbu Dasar", "Sambal Nusantara", "Rempah Utuh", "Olahan Rempah", "Paket & Hampers"],
      daily: "Rasa berkarakter yang melengkapi makanan dan membuat hidangan keluarga terasa lebih istimewa.",
      productCopy: "Pedasnya berani dan gurihnya bikin nagih, dibuat untuk pencinta pedas."
    },
    snack: {
      prefix: "snacks-master",
      lineName: "AYA SNACKS & DRINKS",
      title: "DI NIKMATI",
      vp1Copy: "Dinikmati bersama, jadi momen berarti.",
      logo: "assets/brand/aya-snacks-drinks/primary.png",
      mark: "assets/brand/aya-snacks-drinks/mark.png",
      vp2Headline: "Teman santai, setiap waktu berharga.",
      vp2Intro: "Camilan dan minuman pilihan untuk menemani momen terbaik Anda.",
      categories: ["Minuman Segar", "Camilan Manis", "Camilan Gurih", "Snack Praktis", "Paket Hadiah"],
      daily: "Momen santai dan acara kecil terasa lebih menyenangkan dengan pilihan praktis untuk dinikmati bersama.",
      productCopy: "Gurihnya dimsum bertemu dengan chili oil yang bikin satu gigitan terasa belum cukup."
    }
  };

  function divider() {
    return '<span class="aya-lock-divider" aria-hidden="true"><i></i><b>✦</b><i></i></span>';
  }

  function applyLock() {
    if (document.documentElement.dataset.ayaLineLockApplied === "true") return;

    const key = document.body.dataset.lineKey;
    const c = config[key];
    if (!c) return;

    const p = c.prefix;
    const vp1 = document.querySelector(`.${p}-vp1`);
    const vp2 = document.querySelector(`.${p}-vp2`);
    const vp3 = document.querySelector(`.${p}-vp3`);
    if (!vp1 || !vp2 || !vp3) return;

    document.documentElement.dataset.ayaLineLockApplied = "true";
    document.body.classList.add("aya-lines-lock-parity");

    const heroCopy = vp1.querySelector(`.${p}-hero-copy`);
    const heroTitle = heroCopy?.querySelector("h1");
    const heroId = heroTitle?.id || `${key}-master-title`;
    if (heroCopy) {
      heroCopy.innerHTML = `
        <div class="aya-lock-vp1-medallion"><img src="${esc(c.logo)}" alt="${esc(c.lineName)}"></div>
        ${divider()}
        <h1 id="${esc(heroId)}">${esc(c.title)}</h1>
        ${divider()}
        <p>${esc(c.vp1Copy)}</p>
      `;
    }

    const vp2Layout = vp2.querySelector(`.${p}-understand-layout`);
    const vp2Title = vp2.querySelector(`.${p}-intro h2`);
    const vp2Id = vp2Title?.id || `${key}-about-title`;
    const sourceDomainIcons = [...vp2.querySelectorAll(`.${p}-domain-icon`)].map((node) => node.innerHTML);
    const sourceUseIcons = [...vp2.querySelectorAll(`.${p}-use-icon`)].map((node) => node.innerHTML);
    const iconPool = [...sourceDomainIcons, ...sourceUseIcons];

    if (vp2Layout && iconPool.length >= 5) {
      const cards = c.categories.map((label, index) => `
        <article class="aya-lock-vp2-card aya-lock-vp2-card-${index + 1}">
          <span class="aya-lock-vp2-icon" aria-hidden="true">${iconPool[index]}</span>
          <h3>${esc(label)}</h3>
        </article>
      `).join("");

      vp2Layout.innerHTML = `
        <div class="aya-lock-vp2-shell">
          <header class="aya-lock-vp2-heading">
            <span>${esc(c.lineName)}</span>
            <h2 id="${esc(vp2Id)}">${esc(c.vp2Headline)}</h2>
            <p>${esc(c.vp2Intro)}</p>
          </header>
          <div class="aya-lock-vp2-map" aria-label="Ruang lingkup ${esc(c.lineName)}">
            ${cards}
            <div class="aya-lock-vp2-center" aria-hidden="true"><img src="${esc(c.mark)}" alt=""></div>
          </div>
          <footer class="aya-lock-vp2-daily">
            <strong>DALAM KESEHARIAN</strong>
            <p>${esc(c.daily)}</p>
          </footer>
        </div>
      `;
    }

    const media = vp3.querySelector(`.${p}-vp3-media`);
    const featuredCopy = vp3.querySelector(`.${p}-featured-copy`);
    const featuredTitle = featuredCopy?.querySelector("h2");
    const featuredId = featuredTitle?.id || `${key}-featured-title`;
    const productName = featuredTitle?.textContent?.trim() || "";
    const detail = featuredCopy?.querySelector("[data-featured-detail]");
    const catalog = featuredCopy?.querySelector("[data-line-catalog]");
    const detailHref = detail?.getAttribute("href") || "#";
    const catalogHref = catalog?.getAttribute("href") || "products.html";

    if (media) {
      media.removeAttribute("aria-hidden");
      media.querySelector(".aya-lock-vp3-label")?.remove();
      media.insertAdjacentHTML("beforeend", '<span class="aya-lock-vp3-label">PRODUK PILIHAN</span>');
    }

    if (featuredCopy && productName) {
      featuredCopy.innerHTML = `
        <h2 id="${esc(featuredId)}">${esc(productName)}</h2>
        <p>${esc(c.productCopy)}</p>
        <div class="aya-lock-vp3-actions">
          <a class="aya-lock-vp3-primary" data-featured-detail href="${esc(detailHref)}">Lihat Detail</a>
          <a class="aya-lock-vp3-secondary" data-line-catalog href="${esc(catalogHref)}">Lihat Produk Lain</a>
        </div>
      `;
    }

    requestAnimationFrame(() => {
      const main = document.querySelector("main#main");
      if (main) main.scrollTop = 0;
    });
  }

  if (document.readyState === "complete") {
    requestAnimationFrame(applyLock);
  } else {
    window.addEventListener("load", () => requestAnimationFrame(applyLock), {once:true});
  }
})();

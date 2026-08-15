(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA || !Array.isArray(window.AYA_PRODUCTS)) return;

    const grid = document.querySelector("[data-product-grid]");
    const search = document.querySelector("[data-catalog-search]");
    const sort = document.querySelector("[data-catalog-sort]");
    const form = document.querySelector("[data-filter-form]");
    const panel = document.querySelector("[data-filter-panel]");
    const stateNode = document.querySelector("[data-catalog-state]");
    const minRange = document.querySelector("[data-price-min]");
    const maxRange = document.querySelector("[data-price-max]");
    const minLabel = document.querySelector("[data-price-min-label]");
    const maxLabel = document.querySelector("[data-price-max-label]");
    const groupNav = document.querySelector("[data-group-nav]");
    const prevButton = document.querySelector("[data-group-prev]");
    const nextButton = document.querySelector("[data-group-next]");
    const groupSize = 3;

    if (!grid || !search || !sort || !form || !minRange || !maxRange) return;

    const validVariants = (product) =>
      Array.isArray(product?.variants)
        ? product.variants.filter((variant) =>
            variant &&
            typeof variant.name === "string" &&
            variant.name.trim() &&
            Number.isFinite(Number(variant.price)) &&
            Number(variant.price) > 0
          )
        : [];

    const isPublicEligible = (product) => {
      if (!product || product.visible !== true) return false;
      const requiredText = [product.id, product.name, product.line, product.lineKey, product.category, product.description, product.publicStatus];
      if (requiredText.some((value) => typeof value !== "string" || !value.trim())) return false;
      if (!(product.image || product.placeholder)) return false;
      return validVariants(product).length > 0;
    };

    const products = window.AYA_PRODUCTS.filter(isPublicEligible);

    if (!products.length) {
      grid.innerHTML = '<div class="empty-state catalog-empty"><strong>Produk belum dapat ditampilkan.</strong><p>Data produk publik belum lengkap. Silakan coba kembali nanti.</p></div>';
      return;
    }

    const variantPrices = (product) => validVariants(product).map((variant) => Number(variant.price));
    const minPrice = (product) => Math.min(...variantPrices(product));
    const allPrices = products.flatMap(variantPrices);
    const priceFloor = Math.floor(Math.min(...allPrices) / 5000) * 5000;
    const priceCeil = Math.ceil(Math.max(...allPrices) / 5000) * 5000;

    const params = new URLSearchParams(location.search);
    const urlLines = params.getAll("line").filter((line) => ["farm", "spice", "snack"].includes(line));
    const state = {
      query: params.get("q") || "",
      lines: new Set(urlLines.length ? urlLines : ["farm", "spice", "snack"]),
      sort: params.get("sort") || "recommended",
      min: Number(params.get("min")),
      max: Number(params.get("max")),
      group: Math.max(0, Number(params.get("group")) || 0)
    };

    if (!Number.isFinite(state.min) || state.min < priceFloor) state.min = priceFloor;
    if (!Number.isFinite(state.max) || state.max > priceCeil || state.max < state.min) state.max = priceCeil;

    search.value = state.query;
    sort.value = ["recommended", "name-asc", "price-asc", "price-desc"].includes(state.sort) ? state.sort : "recommended";
    state.sort = sort.value;

    [minRange, maxRange].forEach((node) => {
      node.min = String(priceFloor);
      node.max = String(priceCeil);
      node.step = "5000";
    });
    minRange.value = String(state.min);
    maxRange.value = String(state.max);

    form.querySelectorAll('[name="line"]').forEach((node) => {
      node.checked = state.lines.has(node.value);
    });

    const format = (value) => window.AYA.formatPrice(Number(value));

    const syncRange = () => {
      minLabel.textContent = format(state.min);
      maxLabel.textContent = format(state.max);
      const span = Math.max(1, priceCeil - priceFloor);
      const left = ((state.min - priceFloor) / span) * 100;
      const right = 100 - ((state.max - priceFloor) / span) * 100;
      document.documentElement.style.setProperty("--catalog-range-left", `${left}%`);
      document.documentElement.style.setProperty("--catalog-range-right", `${right}%`);
    };

    const searchableText = (product) =>
      [product.name, product.line, product.category, product.description, product.suitableUse, product.flavorProfile]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("id");

    const matchesPrice = (product) =>
      variantPrices(product).some((price) => price >= state.min && price <= state.max);

    const filtered = () => {
      const query = state.query.trim().toLocaleLowerCase("id");
      const list = products.filter((product) =>
        state.lines.has(product.lineKey) &&
        matchesPrice(product) &&
        (!query || searchableText(product).includes(query))
      );

      list.sort((a, b) => {
        if (state.sort === "name-asc") return a.name.localeCompare(b.name, "id");
        if (state.sort === "price-asc") return minPrice(a) - minPrice(b);
        if (state.sort === "price-desc") return minPrice(b) - minPrice(a);
        return (a.catalogOrder || 999) - (b.catalogOrder || 999);
      });
      return list;
    };

    const quickAddIcon = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 8.5h9l1 11h-11l1-11Z"></path>
        <path d="M9.5 9V6.8a2.5 2.5 0 0 1 5 0V9"></path>
        <path d="M12 12v4M10 14h4"></path>
      </svg>`;

    const card = (product) => {
      const variants = validVariants(product);
      const price = minPrice(product);
      const multi = variants.length > 1;
      const disabled = !product.orderable;
      const image = product.image || product.placeholder;
      const detailUrl = `product.html?id=${encodeURIComponent(product.id)}`;

      return `<article class="product-card">
        <a class="product-card-image" href="${detailUrl}" aria-label="Lihat detail ${window.AYA.escapeHTML(product.name)}">
          <img src="${window.AYA.escapeHTML(image)}" alt="${window.AYA.escapeHTML(product.name)}" loading="lazy" width="760" height="560" data-image-fallback="${window.AYA.escapeHTML(product.id)}"/>
        </a>
        <button class="product-quick-add" type="button" data-quick-add="${window.AYA.escapeHTML(product.id)}" ${disabled ? "disabled" : ""} aria-label="${disabled ? "Produk belum dapat ditambahkan" : `Tambahkan ${window.AYA.escapeHTML(product.name)} ke keranjang`}">
          ${quickAddIcon}
        </button>
        <div class="product-card-body">
          <div class="product-card-kicker">
            <span class="line-label line-${window.AYA.escapeHTML(product.lineKey)}">${window.AYA.escapeHTML(product.line)}</span>
            <span aria-hidden="true">·</span>
            <span>${window.AYA.escapeHTML(product.category)}</span>
          </div>
          <h2><a href="${detailUrl}">${window.AYA.escapeHTML(product.name)}</a></h2>
          <p class="product-card-description">${window.AYA.escapeHTML(product.description)}</p>
          <div class="product-card-commerce">
            <div class="product-card-price">
              ${multi ? "<span>Mulai dari</span>" : ""}
              <strong>${format(price)}</strong>
            </div>
            ${multi ? `<span class="product-variant-count">${variants.length} pilihan varian</span>` : ""}
          </div>
          <a class="product-detail-link" href="${detailUrl}">Lihat Detail Produk <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    };

    const render = () => {
      const list = filtered();
      const maxGroup = Math.max(0, Math.ceil(list.length / groupSize) - 1);
      state.group = Math.min(state.group, maxGroup);
      const start = state.group * groupSize;
      const current = list.slice(start, start + groupSize);

      if (current.length) {
        grid.innerHTML = current.map(card).join("");
        stateNode.hidden = true;
        stateNode.textContent = "";
      } else {
        grid.innerHTML = '<div class="empty-state catalog-empty"><strong>Belum ada pilihan yang cocok.</strong><p>Ubah pencarian, aktifkan lini lain, atau reset rentang harga.</p><button class="button button-secondary" type="button" data-empty-reset>Reset Filter</button></div>';
      }

      const multipleGroups = list.length > groupSize;
      groupNav.hidden = !multipleGroups;
      prevButton.disabled = state.group === 0;
      nextButton.disabled = state.group >= maxGroup;
      syncRange();
      syncURL();
    };

    const syncURL = () => {
      const url = new URL(location.href);
      url.search = "";
      if (state.query) url.searchParams.set("q", state.query);
      if (state.sort !== "recommended") url.searchParams.set("sort", state.sort);
      if (state.min !== priceFloor) url.searchParams.set("min", String(state.min));
      if (state.max !== priceCeil) url.searchParams.set("max", String(state.max));
      if (state.group > 0) url.searchParams.set("group", String(state.group));
      if (state.lines.size !== 3) {
        ["farm", "spice", "snack"].forEach((line) => {
          if (state.lines.has(line)) url.searchParams.append("line", line);
        });
      }
      history.replaceState({}, "", url);
    };

    const readLines = () => {
      state.lines = new Set(
        [...form.querySelectorAll('[name="line"]:checked')].map((node) => node.value)
      );
      state.group = 0;
    };

    const updateRange = () => {
      let min = Number(minRange.value);
      let max = Number(maxRange.value);
      if (min > max - 5000) {
        if (document.activeElement === minRange) min = Math.max(priceFloor, max - 5000);
        else max = Math.min(priceCeil, min + 5000);
      }
      state.min = min;
      state.max = max;
      state.group = 0;
      minRange.value = String(min);
      maxRange.value = String(max);
      render();
    };

    let searchTimer;
    search.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.query = search.value;
        state.group = 0;
        render();
      }, 160);
    });

    sort.addEventListener("change", () => {
      state.sort = sort.value;
      state.group = 0;
      render();
    });

    form.addEventListener("change", (event) => {
      if (event.target === minRange || event.target === maxRange) return;
      if (event.target.matches('[name="line"]')) {
        readLines();
        render();
      }
    });

    minRange.addEventListener("input", updateRange);
    maxRange.addEventListener("input", updateRange);

    form.addEventListener("reset", () => {
      setTimeout(() => {
        state.lines = new Set(["farm", "spice", "snack"]);
        form.querySelectorAll('[name="line"]').forEach((node) => { node.checked = true; });
        state.min = priceFloor;
        state.max = priceCeil;
        state.group = 0;
        minRange.value = String(priceFloor);
        maxRange.value = String(priceCeil);
        render();
      }, 0);
    });

    prevButton.addEventListener("click", () => {
      if (state.group <= 0) return;
      state.group -= 1;
      render();
      grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    nextButton.addEventListener("click", () => {
      const list = filtered();
      const maxGroup = Math.max(0, Math.ceil(list.length / groupSize) - 1);
      if (state.group >= maxGroup) return;
      state.group += 1;
      render();
      grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    grid.addEventListener("click", (event) => {
      if (event.target.closest("[data-empty-reset]")) {
        search.value = "";
        state.query = "";
        sort.value = "recommended";
        state.sort = "recommended";
        form.reset();
        return;
      }
      const button = event.target.closest("[data-quick-add]");
      if (button) openVariant(button.dataset.quickAdd);
    });

    document.querySelector("[data-filter-open]")?.addEventListener("click", () => {
      panel?.classList.add("open");
      document.body.classList.add("filter-open");
    });
    document.querySelector("[data-filter-close]")?.addEventListener("click", () => {
      panel?.classList.remove("open");
      document.body.classList.remove("filter-open");
    });

    const dialog = document.querySelector("[data-variant-dialog]");
    const title = document.querySelector("[data-variant-title]");
    const optionsNode = document.querySelector("[data-variant-options]");
    const error = document.querySelector("[data-variant-error]");
    let selected = null;

    function openVariant(id) {
      const product = products.find((item) => item.id === id);
      if (!product || !product.orderable) return;

      const variants = validVariants(product);
      if (variants.length === 1) {
        window.AYA.addToCart(product.id, variants[0].name, product.minQuantity || 1);
        return;
      }

      selected = product;
      title.textContent = product.name;
      error.hidden = true;
      optionsNode.innerHTML = variants.map((variant) =>
        `<label class="variant-option">
          <input type="radio" name="quickVariant" value="${window.AYA.escapeHTML(variant.name)}"/>
          <span><strong>${window.AYA.escapeHTML(variant.name)}</strong><small>${format(variant.price)}</small></span>
        </label>`
      ).join("");
      dialog.showModal();
    }

    document.querySelector("[data-variant-form]")?.addEventListener("submit", (event) => {
      if (event.submitter?.value === "cancel" || !selected) return;
      event.preventDefault();
      const variant = new FormData(event.currentTarget).get("quickVariant");
      if (!variant) {
        error.hidden = false;
        error.textContent = "Pilih satu varian sebelum menambahkan produk.";
        error.focus();
        return;
      }
      window.AYA.addToCart(selected.id, variant, selected.minQuantity || 1);
      dialog.close();
      selected = null;
    });

    dialog?.addEventListener("close", () => { selected = null; });
    render();
  });
})();
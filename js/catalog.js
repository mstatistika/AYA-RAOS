(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA || !Array.isArray(window.AYA_PRODUCTS)) return;

    const products = window.AYA_PRODUCTS.filter((product) => product.visible);
    const grid = document.querySelector("[data-product-grid]");
    const count = document.querySelector("[data-result-count]");
    const pagination = document.querySelector("[data-pagination]");
    const search = document.querySelector("[data-catalog-search]");
    const sort = document.querySelector("[data-catalog-sort]");
    const pageSize = document.querySelector("[data-page-size]");
    const form = document.querySelector("[data-filter-form]");
    const summary = document.querySelector("[data-active-filter-summary]");
    const panel = document.querySelector("[data-filter-panel]");
    const minRange = document.querySelector("[data-price-min]");
    const maxRange = document.querySelector("[data-price-max]");
    const minLabel = document.querySelector("[data-price-min-label]");
    const maxLabel = document.querySelector("[data-price-max-label]");

    const minPrice = (product) => {
      const values = (product.variants || []).map((variant) => Number(variant.price)).filter(Number.isFinite);
      return values.length ? Math.min(...values) : Infinity;
    };
    const publicPrices = products.map(minPrice).filter(Number.isFinite);
    const priceFloor = Math.floor(Math.min(...publicPrices) / 5000) * 5000;
    const priceCeil = Math.ceil(Math.max(...publicPrices) / 5000) * 5000;

    const params = new URLSearchParams(location.search);
    const state = {
      query: params.get("q") || "",
      line: params.get("line") || "",
      category: params.get("category") || "",
      statuses: params.getAll("status"),
      sort: params.get("sort") || "recommended",
      page: Math.max(1, Number(params.get("page")) || 1),
      pageSize: [8, 12].includes(Number(params.get("size"))) ? Number(params.get("size")) : 12,
      min: Number.isFinite(Number(params.get("min"))) ? Number(params.get("min")) : priceFloor,
      max: Number.isFinite(Number(params.get("max"))) ? Number(params.get("max")) : priceCeil
    };
    state.min = Math.max(priceFloor, Math.min(state.min, priceCeil));
    state.max = Math.max(state.min, Math.min(state.max, priceCeil));

    search.value = state.query;
    sort.value = state.sort;
    pageSize.value = String(state.pageSize);
    [minRange, maxRange].forEach((node) => { node.min = String(priceFloor); node.max = String(priceCeil); node.step = "5000"; });
    minRange.value = String(state.min); maxRange.value = String(state.max);

    const categoryGroups = [
      ["Sambal", ["Sambal"]],
      ["Lauk & Olahan", ["Lauk Berbumbu", "Frozen Food", "Olahan"]],
      ["Pendamping", ["Pendamping"]],
      ["Camilan", ["Camilan", "Frozen Snack"]],
      ["Minuman", ["Minuman"]],
      ["Bahan Pokok", ["Bahan Pokok", "Beras"]]
    ];
    const availableCategories = new Set(products.map((product) => product.category));
    const options = categoryGroups.filter(([, values]) => values.some((value) => availableCategories.has(value)));
    document.querySelector("[data-category-options]").innerHTML = `<label><input type="radio" name="category" value="" ${!state.category ? "checked" : ""}/> Semua kategori</label>` + options.map(([label]) => `<label><input type="radio" name="category" value="${window.AYA.escapeHTML(label)}" ${state.category === label ? "checked" : ""}/> ${window.AYA.escapeHTML(label)}</label>`).join("");

    const setFormState = () => {
      const line = form.querySelector(`[name="line"][value="${CSS.escape(state.line)}"]`);
      const category = form.querySelector(`[name="category"][value="${CSS.escape(state.category)}"]`);
      if (line) line.checked = true;
      if (category) category.checked = true;
      form.querySelectorAll('[name="status"]').forEach((node) => { node.checked = state.statuses.includes(node.value); });
      minRange.value = String(state.min); maxRange.value = String(state.max);
    };
    setFormState();

    const groupMatch = (product, group) => {
      if (!group) return true;
      const entry = categoryGroups.find(([label]) => label === group);
      return entry ? entry[1].includes(product.category) : product.category === group;
    };

    const syncRangeLabels = () => {
      minLabel.textContent = window.AYA.formatPrice(state.min);
      maxLabel.textContent = window.AYA.formatPrice(state.max);
      const span = Math.max(1, priceCeil - priceFloor);
      const left = ((state.min - priceFloor) / span) * 100;
      const right = 100 - ((state.max - priceFloor) / span) * 100;
      document.documentElement.style.setProperty("--catalog-range-left", `${left}%`);
      document.documentElement.style.setProperty("--catalog-range-right", `${right}%`);
    };

    const readForm = () => {
      const data = new FormData(form);
      state.line = data.get("line") || "";
      state.category = data.get("category") || "";
      state.statuses = data.getAll("status");
      state.page = 1;
    };

    const filtered = () => {
      const query = state.query.trim().toLocaleLowerCase("id");
      const list = products.filter((product) => {
        const searchable = [product.name, product.line, product.category, product.description, product.suitableUse, product.flavorProfile].join(" ").toLocaleLowerCase("id");
        const price = minPrice(product);
        return (!query || searchable.includes(query)) &&
          (!state.line || product.lineKey === state.line) &&
          groupMatch(product, state.category) &&
          price >= state.min && price <= state.max &&
          (!state.statuses.length || state.statuses.includes(product.status));
      });
      list.sort((a, b) => state.sort === "name-asc" ? a.name.localeCompare(b.name, "id") :
        state.sort === "price-asc" ? minPrice(a) - minPrice(b) :
        state.sort === "price-desc" ? minPrice(b) - minPrice(a) :
        (a.catalogOrder || 999) - (b.catalogOrder || 999));
      return list;
    };

    const mockupImage = Object.freeze({
      "sambal-bawang": "assets/visual/catalog/catalog-sambal.webp",
      "bawang-goreng-sumenep": "assets/visual/catalog/catalog-bawang.webp",
      "rendang-daging-sapi": "assets/visual/catalog/catalog-rendang.webp",
      "ayam-goreng-kuning": "assets/visual/catalog/catalog-ayam.webp",
      "dimsum-chili-oil": "assets/visual/catalog/catalog-dimsum.webp"
    });

    const card = (product) => {
      const price = minPrice(product);
      const image = mockupImage[product.id] || product.image || product.placeholder;
      const disabled = !product.orderable;
      return `<article class="product-card">
        <a class="product-card-image" href="product.html?id=${encodeURIComponent(product.id)}">
          <img src="${window.AYA.escapeHTML(image)}" alt="${window.AYA.escapeHTML(product.name)}" loading="lazy" width="700" height="520" data-image-fallback="${window.AYA.escapeHTML(product.id)}"/>
          <span class="status-badge status-${product.status}">${window.AYA.escapeHTML(product.publicStatus)}</span>
        </a>
        <button class="product-quick-add" type="button" data-quick-add="${window.AYA.escapeHTML(product.id)}" ${disabled ? "disabled" : ""} aria-label="${disabled ? "Produk belum dapat ditambahkan" : `Tambahkan ${window.AYA.escapeHTML(product.name)} ke keranjang`}"><span aria-hidden="true">🛒</span></button>
        <div class="product-card-body">
          <div class="product-card-kicker"><span class="line-label line-${product.lineKey}">${window.AYA.escapeHTML(product.line)}</span></div>
          <h2><a href="product.html?id=${encodeURIComponent(product.id)}">${window.AYA.escapeHTML(product.name)}</a></h2>
          <p>${window.AYA.escapeHTML(product.description)}</p>
          <div class="product-card-price"><strong>${Number.isFinite(price) ? window.AYA.formatPrice(price) : "Belum tersedia"}</strong>${product.variants?.length > 1 ? "<span>mulai</span>" : ""}</div>
          <div class="product-card-actions"><a class="button product-detail-button" href="product.html?id=${encodeURIComponent(product.id)}">Lihat Detail</a></div>
        </div>
      </article>`;
    };

    const renderSummary = () => {
      const labels = [];
      if (state.query) labels.push(`Pencarian: ${state.query}`);
      if (state.line) labels.push({ spice: "AYA Spice Haven", farm: "AYA Farm", snack: "AYA Snacks & Drinks" }[state.line] || state.line);
      if (state.category) labels.push(state.category);
      if (state.statuses.length) labels.push(...state.statuses.map((s) => ({ available: "Tersedia", preorder: "Pre-order", soldout: "Habis" }[s] || s)));
      if (state.min !== priceFloor || state.max !== priceCeil) labels.push(`${window.AYA.formatPrice(state.min)}–${window.AYA.formatPrice(state.max)}`);
      summary.innerHTML = labels.map((label) => `<span>${window.AYA.escapeHTML(label)}</span>`).join("");
    };

    const syncURL = () => {
      const url = new URL(location.href); url.search = "";
      if (state.query) url.searchParams.set("q", state.query);
      if (state.line) url.searchParams.set("line", state.line);
      if (state.category) url.searchParams.set("category", state.category);
      state.statuses.forEach((value) => url.searchParams.append("status", value));
      if (state.min !== priceFloor) url.searchParams.set("min", String(state.min));
      if (state.max !== priceCeil) url.searchParams.set("max", String(state.max));
      if (state.sort !== "recommended") url.searchParams.set("sort", state.sort);
      if (state.pageSize !== 12) url.searchParams.set("size", String(state.pageSize));
      if (state.page > 1) url.searchParams.set("page", String(state.page));
      history.replaceState({}, "", url);
    };

    const renderPagination = (pages) => {
      const prev = Math.max(1, state.page - 1), next = Math.min(pages, state.page + 1);
      pagination.innerHTML = `<button type="button" data-page="${prev}" ${state.page === 1 ? "disabled" : ""} aria-label="Halaman sebelumnya">‹</button>` +
        Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i + 1}" ${state.page === i + 1 ? 'aria-current="page"' : ""}>${i + 1}</button>`).join("") +
        `<button type="button" data-page="${next}" ${state.page === pages ? "disabled" : ""} aria-label="Halaman berikutnya">›</button>`;
    };

    const render = () => {
      const list = filtered();
      const pages = Math.max(1, Math.ceil(list.length / state.pageSize));
      state.page = Math.min(state.page, pages);
      const start = (state.page - 1) * state.pageSize;
      const current = list.slice(start, start + state.pageSize);
      count.textContent = String(list.length);
      grid.innerHTML = current.length ? current.map(card).join("") : '<div class="empty-state catalog-empty"><strong>Produk tidak ditemukan.</strong><p>Ubah kata kunci atau reset filter untuk melihat pilihan lain.</p><button class="button button-secondary" type="button" data-empty-reset>Reset Filter</button></div>';
      renderPagination(pages); renderSummary(); syncRangeLabels(); syncURL();
    };

    let searchTimer;
    search.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.query = search.value; state.page = 1; render(); }, 160); });
    sort.addEventListener("change", () => { state.sort = sort.value; state.page = 1; render(); });
    pageSize.addEventListener("change", () => { state.pageSize = Number(pageSize.value); state.page = 1; render(); });
    form.addEventListener("change", (event) => {
      if (event.target === minRange || event.target === maxRange) return;
      readForm(); render();
    });
    const updateRange = () => {
      let min = Number(minRange.value), max = Number(maxRange.value);
      if (min > max - 5000) {
        if (document.activeElement === minRange) min = max - 5000; else max = min + 5000;
      }
      state.min = Math.max(priceFloor, min); state.max = Math.min(priceCeil, max); state.page = 1;
      minRange.value = String(state.min); maxRange.value = String(state.max); render();
    };
    minRange.addEventListener("input", updateRange); maxRange.addEventListener("input", updateRange);
    form.addEventListener("reset", () => setTimeout(() => {
      state.query = ""; search.value = ""; state.sort = "recommended"; sort.value = "recommended"; state.pageSize = 12; pageSize.value = "12";
      state.line = state.category = ""; state.statuses = []; state.min = priceFloor; state.max = priceCeil; state.page = 1; setFormState(); render();
    }, 0));
    pagination.addEventListener("click", (event) => { const button = event.target.closest("[data-page]"); if (!button || button.disabled) return; state.page = Number(button.dataset.page); render(); document.querySelector(".catalog-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); });
    grid.addEventListener("click", (event) => { if (event.target.closest("[data-empty-reset]")) { form.reset(); return; } const button = event.target.closest("[data-quick-add]"); if (button) openVariant(button.dataset.quickAdd); });
    document.querySelector("[data-filter-open]")?.addEventListener("click", () => { panel?.classList.add("open"); document.body.classList.add("filter-open"); });
    document.querySelector("[data-filter-close]")?.addEventListener("click", () => { panel?.classList.remove("open"); document.body.classList.remove("filter-open"); });

    const dialog = document.querySelector("[data-variant-dialog]");
    const title = document.querySelector("[data-variant-title]");
    const optionsNode = document.querySelector("[data-variant-options]");
    const error = document.querySelector("[data-variant-error]");
    let selected = null;
    function openVariant(id) {
      const product = window.AYA.getProduct(id); if (!product || !product.orderable) return;
      if (product.variants.length === 1) { window.AYA.addToCart(id, product.variants[0].name, product.minQuantity || 1); return; }
      selected = product; title.textContent = product.name; error.hidden = true;
      optionsNode.innerHTML = product.variants.map((variant) => `<label class="variant-option"><input type="radio" name="quickVariant" value="${window.AYA.escapeHTML(variant.name)}"/><span><strong>${window.AYA.escapeHTML(variant.name)}</strong><small>${window.AYA.formatPrice(variant.price)}</small></span></label>`).join("");
      dialog.showModal();
    }
    document.querySelector("[data-variant-form]")?.addEventListener("submit", (event) => {
      if (event.submitter?.value === "cancel" || !selected) return; event.preventDefault();
      const variant = new FormData(event.currentTarget).get("quickVariant");
      if (!variant) { error.hidden = false; error.textContent = "Pilih satu varian sebelum menambahkan produk."; error.focus(); return; }
      window.AYA.addToCart(selected.id, variant, selected.minQuantity || 1); dialog.close(); selected = null;
    });
    dialog?.addEventListener("close", () => { selected = null; });
    render();
  });
})();

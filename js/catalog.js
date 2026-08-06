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

    const state = { query: "", line: "", category: "", price: "", statuses: [], sort: "recommended", page: 1, pageSize: 8 };
    const params = new URLSearchParams(location.search);
    state.query = params.get("q") || "";
    state.line = params.get("line") || "";
    state.category = params.get("category") || "";
    state.price = params.get("price") || "";
    state.statuses = params.getAll("status");
    state.sort = params.get("sort") || "recommended";
    state.page = Math.max(1, Number(params.get("page")) || 1);
    state.pageSize = [8, 12].includes(Number(params.get("size"))) ? Number(params.get("size")) : 8;

    search.value = state.query;
    sort.value = state.sort;
    pageSize.value = String(state.pageSize);

    const categories = [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b, "id"));
    document.querySelector("[data-category-options]").innerHTML = `<label><input type="radio" name="category" value="" ${!state.category ? "checked" : ""}/> Semua kategori</label>` + categories.map((category) => `<label><input type="radio" name="category" value="${window.AYA.escapeHTML(category)}" ${state.category === category ? "checked" : ""}/> ${window.AYA.escapeHTML(category)}</label>`).join("");

    const setFormState = () => {
      const line = form.querySelector(`[name="line"][value="${CSS.escape(state.line)}"]`);
      const price = form.querySelector(`[name="price"][value="${CSS.escape(state.price)}"]`);
      if (line) line.checked = true;
      if (price) price.checked = true;
      form.querySelectorAll('[name="status"]').forEach((node) => { node.checked = state.statuses.includes(node.value); });
    };
    setFormState();

    const minPrice = (product) => {
      const values = (product.variants || []).map((variant) => variant.price).filter(Number.isFinite);
      return values.length ? Math.min(...values) : Infinity;
    };

    const priceMatch = (price, filter) => !filter ||
      (filter === "under50000" && price < 50000) ||
      (filter === "50000-80000" && price >= 50000 && price <= 80000) ||
      (filter === "over80000" && price > 80000);

    const syncURL = () => {
      const url = new URL(location.href);
      url.search = "";
      if (state.query) url.searchParams.set("q", state.query);
      if (state.line) url.searchParams.set("line", state.line);
      if (state.category) url.searchParams.set("category", state.category);
      if (state.price) url.searchParams.set("price", state.price);
      state.statuses.forEach((value) => url.searchParams.append("status", value));
      if (state.sort !== "recommended") url.searchParams.set("sort", state.sort);
      if (state.pageSize !== 8) url.searchParams.set("size", String(state.pageSize));
      if (state.page > 1) url.searchParams.set("page", String(state.page));
      history.replaceState({}, "", url);
    };

    const filtered = () => {
      const query = state.query.trim().toLocaleLowerCase("id");
      const list = products.filter((product) => {
        const searchable = [product.name, product.line, product.category, product.description, product.suitableUse, product.flavorProfile].join(" ").toLocaleLowerCase("id");
        return (!query || searchable.includes(query)) &&
          (!state.line || product.lineKey === state.line) &&
          (!state.category || product.category === state.category) &&
          priceMatch(minPrice(product), state.price) &&
          (!state.statuses.length || state.statuses.includes(product.status));
      });
      list.sort((a, b) => state.sort === "name-asc" ? a.name.localeCompare(b.name, "id") :
        state.sort === "price-asc" ? minPrice(a) - minPrice(b) :
        state.sort === "price-desc" ? minPrice(b) - minPrice(a) :
        (a.catalogOrder || 999) - (b.catalogOrder || 999));
      return list;
    };

    const card = (product) => {
      const price = minPrice(product);
      const disabled = !product.orderable;
      return `<article class="product-card">
        <a class="product-card-image" href="product.html?id=${encodeURIComponent(product.id)}">
          <img src="${window.AYA.escapeHTML(product.image || product.placeholder)}" alt="${window.AYA.escapeHTML(product.name)}" loading="lazy" width="700" height="700" data-image-fallback="${window.AYA.escapeHTML(product.id)}"/>
          <span class="status-badge status-${product.status}">${window.AYA.escapeHTML(product.publicStatus)}</span>
        </a>
        <div class="product-card-body">
          <div class="product-card-kicker"><span class="line-label line-${product.lineKey}">${window.AYA.escapeHTML(product.line)}</span><small>${window.AYA.escapeHTML(product.category)}</small></div>
          <h2><a href="product.html?id=${encodeURIComponent(product.id)}">${window.AYA.escapeHTML(product.name)}</a></h2>
          <p>${window.AYA.escapeHTML(product.description)}</p>
          <div class="product-card-price"><span>${Number.isFinite(price) ? "Mulai" : "Harga"}</span><strong>${Number.isFinite(price) ? window.AYA.formatPrice(price) : "Belum tersedia"}</strong></div>
          <div class="product-card-actions"><a class="button button-secondary" href="product.html?id=${encodeURIComponent(product.id)}">Detail</a><button class="button button-primary" type="button" data-quick-add="${window.AYA.escapeHTML(product.id)}" ${disabled ? "disabled" : ""}>${disabled ? "Belum Tersedia" : "Tambah"}</button></div>
        </div>
      </article>`;
    };

    const renderSummary = () => {
      const labels = [];
      if (state.query) labels.push(`Pencarian: ${state.query}`);
      if (state.line) labels.push({ spice: "Spice Haven", farm: "AYA Farm", snack: "Snack & Drinks" }[state.line] || state.line);
      if (state.category) labels.push(state.category);
      if (state.price) labels.push({ under50000: "< Rp50.000", "50000-80000": "Rp50.000–Rp80.000", over80000: "> Rp80.000" }[state.price]);
      if (state.statuses.length) labels.push(...state.statuses.map((s) => ({ available: "Tersedia", preorder: "Pre-order", soldout: "Habis" }[s])));
      summary.innerHTML = labels.length ? labels.map((label) => `<span>${window.AYA.escapeHTML(label)}</span>`).join("") : "<small>Semua produk</small>";
    };

    const render = () => {
      const list = filtered();
      const pages = Math.max(1, Math.ceil(list.length / state.pageSize));
      state.page = Math.min(state.page, pages);
      const start = (state.page - 1) * state.pageSize;
      const current = list.slice(start, start + state.pageSize);
      count.textContent = String(list.length);
      grid.innerHTML = current.length ? current.map(card).join("") : '<div class="empty-state catalog-empty"><strong>Produk tidak ditemukan.</strong><p>Ubah kata kunci atau reset filter untuk melihat pilihan lain.</p><button class="button button-secondary" type="button" data-empty-reset>Reset Filter</button></div>';
      pagination.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i + 1}" ${state.page === i + 1 ? 'aria-current="page"' : ""} aria-label="Halaman ${i + 1}">${i + 1}</button>`).join("") : "";
      renderSummary(); syncURL();
    };

    const readForm = () => {
      const data = new FormData(form);
      state.line = data.get("line") || "";
      state.category = data.get("category") || "";
      state.price = data.get("price") || "";
      state.statuses = data.getAll("status");
      state.page = 1;
    };

    let searchTimer;
    search.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.query = search.value; state.page = 1; render(); }, 180);
    });
    sort.addEventListener("change", () => { state.sort = sort.value; state.page = 1; render(); });
    pageSize.addEventListener("change", () => { state.pageSize = Number(pageSize.value); state.page = 1; render(); });
    form.addEventListener("submit", (event) => { event.preventDefault(); readForm(); render(); panel?.classList.remove("open"); document.body.classList.remove("filter-open"); });
    form.addEventListener("reset", () => setTimeout(() => {
      state.query = ""; search.value = ""; state.sort = "recommended"; sort.value = "recommended";
      state.line = state.category = state.price = ""; state.statuses = []; state.page = 1; setFormState(); render();
    }, 0));
    pagination.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page]"); if (!button) return;
      state.page = Number(button.dataset.page); render();
      scrollTo({ top: document.querySelector(".catalog-section").offsetTop - 90, behavior: "smooth" });
    });
    grid.addEventListener("click", (event) => {
      if (event.target.closest("[data-empty-reset]")) { form.reset(); return; }
      const button = event.target.closest("[data-quick-add]"); if (button) openVariant(button.dataset.quickAdd);
    });

    document.querySelector("[data-filter-open]")?.addEventListener("click", () => { panel?.classList.add("open"); document.body.classList.add("filter-open"); });
    document.querySelector("[data-filter-close]")?.addEventListener("click", () => { panel?.classList.remove("open"); document.body.classList.remove("filter-open"); });

    const dialog = document.querySelector("[data-variant-dialog]");
    const title = document.querySelector("[data-variant-title]");
    const options = document.querySelector("[data-variant-options]");
    const error = document.querySelector("[data-variant-error]");
    let selected = null;

    function openVariant(id) {
      const product = window.AYA.getProduct(id);
      if (!product || !product.orderable) return;
      if (product.variants.length === 1) {
        window.AYA.addToCart(id, product.variants[0].name, product.minQuantity || 1);
        return;
      }
      selected = product;
      title.textContent = product.name;
      error.hidden = true;
      options.innerHTML = product.variants.map((variant) => `<label class="variant-option"><input type="radio" name="quickVariant" value="${window.AYA.escapeHTML(variant.name)}"/><span><strong>${window.AYA.escapeHTML(variant.name)}</strong><small>${window.AYA.formatPrice(variant.price)}</small></span></label>`).join("");
      dialog.showModal();
    }

    document.querySelector("[data-variant-form]")?.addEventListener("submit", (event) => {
      const submitter = event.submitter;
      if (submitter?.value === "cancel" || !selected) return;
      event.preventDefault();
      const variant = new FormData(event.currentTarget).get("quickVariant");
      if (!variant) {
        error.hidden = false; error.textContent = "Pilih satu varian sebelum menambahkan produk."; error.focus(); return;
      }
      window.AYA.addToCart(selected.id, variant, selected.minQuantity || 1);
      dialog.close(); selected = null;
    });

    dialog?.addEventListener("close", () => { selected = null; });
    render();
  });
})();

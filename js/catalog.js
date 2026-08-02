(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;

    const grid = document.querySelector("[data-product-grid]");
    const resultCount = document.querySelector("[data-result-count]");
    const pageStatus = document.querySelector("[data-page-status]");
    const pagination = document.querySelector("[data-pagination]");
    const search = document.querySelector("[data-product-search]");
    const lineFilter = document.querySelector("[data-line-filter]");
    const categoryFilter = document.querySelector("[data-category-filter]");
    const priceFilter = document.querySelector("[data-price-filter]");
    const statusFilter = document.querySelector("[data-status-filter]");
    const sort = document.querySelector("[data-sort]");
    const reset = document.querySelector("[data-reset-filters]");
    const drawer = document.querySelector("[data-quick-drawer]");
    const drawerContent = document.querySelector("[data-drawer-content]");
    const drawerTitle = document.querySelector("#quickDrawerTitle");
    const backdrop = document.querySelector("[data-drawer-backdrop]");
    const closeButton = document.querySelector("[data-drawer-close]");

    if (!grid) return;

    const state = {
      query: "",
      line: new URLSearchParams(location.search).get("line") || "all",
      category: "all",
      price: "all",
      status: "all",
      sort: "recommended",
      page: 1,
      perPage: 8
    };

    if (lineFilter && ["spice", "farm", "snack"].includes(state.line)) lineFilter.value = state.line;
    else state.line = "all";

    const categories = [...new Set(window.AYA.products.map(product => product.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "id"));
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter?.appendChild(option);
    });

    const matchesPrice = product => {
      if (state.price === "all") return true;
      const price = window.AYA.minimumPrice(product);
      if (price === null) return false;
      if (state.price === "under-50000") return price < 50000;
      if (state.price === "50000-79999") return price >= 50000 && price < 80000;
      if (state.price === "80000-up") return price >= 80000;
      return true;
    };

    const visible = () => {
      const items = window.AYA.products.filter(product => {
        const haystack = [
          product.name,
          product.line,
          product.category,
          product.description,
          ...(product.variants || []).map(variant => variant.name)
        ].join(" ").toLowerCase();

        return (!state.query || haystack.includes(state.query))
          && (state.line === "all" || product.lineKey === state.line)
          && (state.category === "all" || product.category === state.category)
          && (state.status === "all" || product.status === state.status)
          && matchesPrice(product);
      });

      return items.sort((a, b) => {
        if (state.sort === "price-asc") return (window.AYA.minimumPrice(a) ?? Infinity) - (window.AYA.minimumPrice(b) ?? Infinity);
        if (state.sort === "price-desc") return (window.AYA.minimumPrice(b) ?? -1) - (window.AYA.minimumPrice(a) ?? -1);
        if (state.sort === "name-asc") return a.name.localeCompare(b.name, "id");
        return Number(a.priority || 99) - Number(b.priority || 99);
      });
    };

    function renderPagination(totalPages) {
      pagination?.replaceChildren();
      if (!pagination || totalPages <= 1) return;
      for (let page = 1; page <= totalPages; page += 1) {
        const button = window.AYA.make("button", page === state.page ? "active" : "", String(page));
        button.type = "button";
        button.setAttribute("aria-label", `Buka halaman ${page}`);
        if (page === state.page) button.setAttribute("aria-current", "page");
        button.addEventListener("click", () => {
          state.page = page;
          render();
          document.querySelector(".catalog-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        pagination.appendChild(button);
      }
    }

    function render() {
      const items = visible();
      const totalPages = Math.max(1, Math.ceil(items.length / state.perPage));
      if (state.page > totalPages) state.page = 1;
      const start = (state.page - 1) * state.perPage;
      const pageItems = items.slice(start, start + state.perPage);

      resultCount.textContent = `${items.length} produk ditemukan`;
      if (pageStatus) pageStatus.textContent = items.length ? `Halaman ${state.page} dari ${totalPages}` : "";
      grid.replaceChildren();

      if (!pageItems.length) {
        const empty = window.AYA.make("div", "empty-state product-grid-empty");
        empty.append(
          window.AYA.make("span", "", "Tidak ditemukan"),
          window.AYA.make("h3", "", "Belum ada produk yang sesuai."),
          window.AYA.make("p", "", "Ubah kata kunci atau reset filter untuk melihat pilihan lain.")
        );
        grid.appendChild(empty);
      } else {
        pageItems.forEach(product => grid.appendChild(window.AYA.createProductCard(product)));
      }
      renderPagination(totalPages);
    }

    function closeDrawer() {
      if (!drawer || !backdrop) return;
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      backdrop.hidden = true;
      document.body.classList.remove("drawer-open");
    }

    function openDrawer(productId, mode = "cart") {
      const product = window.AYA.getProduct(productId);
      if (!product || product.status === "soldout" || !product.variants?.length) {
        window.AYA.showToast("Produk ini belum tersedia untuk dipesan.", "warning");
        return;
      }
      if (!drawer || !drawerContent || !backdrop) {
        if (mode === "order") window.AYA.openWhatsApp(window.AYA.buildProductMessage(product, product.variants[0], 1));
        else window.AYA.addCartItem(product.id, 0, 1);
        return;
      }

      drawerContent.replaceChildren();
      drawerTitle.textContent = product.name;

      const media = window.AYA.createMedia(product, "drawer-product-media");
      const intro = window.AYA.make("div", "drawer-product-intro");
      intro.append(
        window.AYA.make("span", "", `${product.line} · ${product.category}`),
        window.AYA.make("h3", "", product.name),
        window.AYA.make("p", "", product.description)
      );
      const top = window.AYA.make("div", "drawer-product-top");
      top.append(media, intro);

      const form = window.AYA.make("div", "drawer-form");
      const variantField = window.AYA.make("label", "form-field");
      variantField.appendChild(window.AYA.make("span", "", "Varian"));
      const select = document.createElement("select");
      product.variants.forEach((variant, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${variant.name} — ${window.AYA.currency(variant.price)}`;
        select.appendChild(option);
      });
      variantField.appendChild(select);

      const qtyField = window.AYA.make("label", "form-field");
      qtyField.appendChild(window.AYA.make("span", "", "Jumlah"));
      const qty = document.createElement("input");
      qty.type = "number";
      qty.min = "1";
      qty.max = "99";
      qty.value = "1";
      qty.inputMode = "numeric";
      qtyField.appendChild(qty);

      const subtotal = window.AYA.make("div", "drawer-subtotal");
      const subtotalLabel = window.AYA.make("span", "", "Subtotal");
      const subtotalValue = window.AYA.make("strong", "", window.AYA.currency(product.variants[0].price));
      subtotal.append(subtotalLabel, subtotalValue);

      const refreshSubtotal = () => {
        const variant = product.variants[Number(select.value) || 0];
        subtotalValue.textContent = window.AYA.currency(variant.price * Math.max(1, Number(qty.value) || 1));
      };
      select.addEventListener("change", refreshSubtotal);
      qty.addEventListener("input", refreshSubtotal);

      const actions = window.AYA.make("div", "drawer-cta-grid");
      const order = window.AYA.make("button", "button button-primary", "Pesan via WhatsApp");
      order.type = "button";
      order.addEventListener("click", () => {
        const variant = product.variants[Number(select.value) || 0];
        window.AYA.openWhatsApp(window.AYA.buildProductMessage(product, variant, qty.value));
      });
      const add = window.AYA.make("button", "button button-secondary", "Tambah ke Keranjang");
      add.type = "button";
      add.addEventListener("click", () => {
        const added = window.AYA.addCartItem(product.id, select.value, qty.value);
        if (added) closeDrawer();
      });
      actions.append(order, add);

      form.append(variantField, qtyField, subtotal, actions);
      drawerContent.append(top, form);
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      backdrop.hidden = false;
      document.body.classList.add("drawer-open");
      closeButton?.focus();
    }

    [search, lineFilter, categoryFilter, priceFilter, statusFilter, sort].forEach(control => {
      control?.addEventListener(control === search ? "input" : "change", () => {
        state.query = search.value.trim().toLowerCase();
        state.line = lineFilter.value;
        state.category = categoryFilter.value;
        state.price = priceFilter.value;
        state.status = statusFilter.value;
        state.sort = sort.value;
        state.page = 1;
        render();
      });
    });

    reset?.addEventListener("click", () => {
      search.value = "";
      lineFilter.value = "all";
      categoryFilter.value = "all";
      priceFilter.value = "all";
      statusFilter.value = "all";
      sort.value = "recommended";
      Object.assign(state, { query: "", line: "all", category: "all", price: "all", status: "all", sort: "recommended", page: 1 });
      render();
    });

    document.addEventListener("click", event => {
      const trigger = event.target.closest("[data-quick-product]");
      if (trigger) openDrawer(trigger.dataset.quickProduct, trigger.dataset.quickMode);
    });

    closeButton?.addEventListener("click", closeDrawer);
    backdrop?.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeDrawer();
    });

    render();
  });
})();

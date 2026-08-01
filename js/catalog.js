(() => {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const grid =
        document.querySelector(
          "[data-product-grid]"
        );

      if (!grid || !window.AYA) return;

      const search =
        document.querySelector(
          "[data-product-search]"
        );

      const resultCount =
        document.querySelector(
          "[data-result-count]"
        );

      const drawer =
        document.querySelector(
          "[data-quick-drawer]"
        );

      const backdrop =
        document.querySelector(
          "[data-drawer-backdrop]"
        );

      const drawerContent =
        document.querySelector(
          "[data-drawer-content]"
        );

      let filter = "all";
      let query = "";

      function visibleProducts() {
        return window.AYA.products.filter(
          product => {
            const matchFilter =
              filter === "all" ||
              product.lineKey === filter;

            const haystack = [
              product.name,
              product.line,
              product.category,
              product.description
            ]
              .join(" ")
              .toLowerCase();

            const matchQuery =
              !query ||
              haystack.includes(query);

            return (
              matchFilter &&
              matchQuery
            );
          }
        );
      }

      function minPrice(product) {
        if (!product.variants.length) {
          return null;
        }

        return Math.min(
          ...product.variants.map(
            variant => variant.price
          )
        );
      }

      function card(product) {
        const price =
          minPrice(product);

        return `
          <article class="product-card">
            <a
              class="product-image-link"
              href="product.html?id=${encodeURIComponent(product.id)}"
              aria-label="Lihat detail ${product.name}"
            >
              ${window.AYA.imageOrPlaceholder(product)}

              ${
                product.badge
                  ? `
                    <span class="product-badge">
                      ${product.badge}
                    </span>
                  `
                  : ""
              }
            </a>

            <div class="product-card-body">
              <span class="product-line">
                ${product.line}
              </span>

              <a href="product.html?id=${encodeURIComponent(product.id)}">
                <h3>${product.name}</h3>
              </a>

              <p class="product-card-description">
                ${product.description}
              </p>

              <div class="product-card-footer">
                <div>
                  <span class="product-price-label">
                    ${price ? "Mulai dari" : "Status"}
                  </span>

                  <strong class="product-price">
                    ${
                      price
                        ? window.AYA.currency(price)
                        : "Segera hadir"
                    }
                  </strong>
                </div>

                ${
                  product.available &&
                  product.variants.length
                    ? `
                      <button
                        class="product-quick-add"
                        type="button"
                        data-quick-add="${product.id}"
                        aria-label="Pilih varian ${product.name}"
                      >
                        +
                      </button>
                    `
                    : `
                      <a
                        class="text-link"
                        href="product.html?id=${encodeURIComponent(product.id)}"
                      >
                        Detail
                      </a>
                    `
                }
              </div>
            </div>
          </article>
        `;
      }

      function render() {
        const items =
          visibleProducts();

        if (resultCount) {
          resultCount.textContent =
            `${items.length} produk ditemukan`;
        }

        grid.innerHTML =
          items.length
            ? items.map(card).join("")
            : `
              <div
                class="empty-state"
                style="grid-column:1/-1"
              >
                <h3>Produk tidak ditemukan.</h3>
                <p>
                  Coba kata kunci atau filter berbeda.
                </p>
              </div>
            `;
      }

      function openDrawer(productId) {
        const product =
          window.AYA.getProduct(
            productId
          );

        if (
          !product ||
          !product.variants.length
        ) {
          return;
        }

        /*
          Fallback bila struktur drawer tidak tersedia:
          langsung tambah varian pertama.
        */
        if (
          !drawer ||
          !backdrop ||
          !drawerContent
        ) {
          window.AYA.addCartItem(
            productId,
            0,
            1
          );

          return;
        }

        drawerContent.innerHTML = `
          <div class="drawer-product">
            ${
              product.image
                ? `
                  <img
                    src="${product.image}"
                    alt="${product.name}"
                  />
                `
                : `
                  <div class="drawer-product-placeholder">
                    AYA
                  </div>
                `
            }

            <div>
              <span class="product-line">
                ${product.line}
              </span>

              <h3>${product.name}</h3>
              <p>${product.description}</p>
            </div>
          </div>

          <div class="drawer-actions">
            <div class="form-field">
              <label for="quickVariant">
                Pilih varian
              </label>

              <select id="quickVariant">
                ${product.variants
                  .map(
                    (variant, index) => `
                      <option value="${index}">
                        ${variant.name}
                        —
                        ${window.AYA.currency(variant.price)}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>

            <div class="form-field">
              <label for="quickQty">
                Jumlah
              </label>

              <input
                id="quickQty"
                type="number"
                min="1"
                max="20"
                value="1"
                inputmode="numeric"
              />
            </div>

            <button
              class="button button-primary button-full"
              type="button"
              data-confirm-add="${product.id}"
            >
              Tambah ke keranjang
            </button>

            <a
              class="button button-secondary button-full"
              href="product.html?id=${encodeURIComponent(product.id)}"
            >
              Lihat detail produk
            </a>
          </div>
        `;

        drawer.classList.add("open");

        drawer.setAttribute(
          "aria-hidden",
          "false"
        );

        backdrop.hidden = false;

        document.body.classList.add(
          "drawer-open"
        );

        drawer
          .querySelector(
            "[data-drawer-close]"
          )
          ?.focus();
      }

      function closeDrawer() {
        if (!drawer || !backdrop) return;

        drawer.classList.remove("open");

        drawer.setAttribute(
          "aria-hidden",
          "true"
        );

        backdrop.hidden = true;

        document.body.classList.remove(
          "drawer-open"
        );
      }

      document.addEventListener(
        "click",
        event => {
          const filterButton =
            event.target.closest(
              "[data-filter]"
            );

          if (filterButton) {
            filter =
              filterButton.dataset.filter;

            document
              .querySelectorAll(
                "[data-filter]"
              )
              .forEach(button => {
                button.classList.toggle(
                  "active",
                  button === filterButton
                );
              });

            render();
            return;
          }

          const quick =
            event.target.closest(
              "[data-quick-add]"
            );

          if (quick) {
            event.preventDefault();

            openDrawer(
              quick.dataset.quickAdd
            );

            return;
          }

          const confirm =
            event.target.closest(
              "[data-confirm-add]"
            );

          if (confirm) {
            event.preventDefault();

            const variant = Number(
              drawerContent
                ?.querySelector(
                  "#quickVariant"
                )
                ?.value || 0
            );

            const quantity = Number(
              drawerContent
                ?.querySelector(
                  "#quickQty"
                )
                ?.value || 1
            );

            const originalText =
              confirm.textContent;

            const success =
              window.AYA.addCartItem(
                confirm.dataset.confirmAdd,
                variant,
                quantity
              );

            if (!success) return;

            confirm.disabled = true;
            confirm.textContent =
              "✓ Ditambahkan";

            window.setTimeout(() => {
              confirm.disabled = false;
              confirm.textContent =
                originalText;

              closeDrawer();
            }, 500);

            return;
          }

          if (
            event.target.closest(
              "[data-drawer-close]"
            ) ||
            event.target === backdrop
          ) {
            closeDrawer();
          }
        }
      );

      search?.addEventListener(
        "input",
        () => {
          query =
            search.value
              .trim()
              .toLowerCase();

          render();
        }
      );

      document.addEventListener(
        "keydown",
        event => {
          if (event.key === "Escape") {
            closeDrawer();
          }
        }
      );

      const params =
        new URLSearchParams(
          window.location.search
        );

      const requestedFilter =
        params.get("line");

      if (
        ["spice", "farm", "snack"]
          .includes(requestedFilter)
      ) {
        filter = requestedFilter;

        document
          .querySelectorAll(
            "[data-filter]"
          )
          .forEach(button => {
            button.classList.toggle(
              "active",
              button.dataset.filter === filter
            );
          });
      }

      render();
    }
  );
})();

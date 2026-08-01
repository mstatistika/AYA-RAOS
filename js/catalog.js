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

      const toolbar =
        document.querySelector(
          ".catalog-toolbar"
        );

      const drawer =
        document.querySelector(
          "[data-quick-drawer]"
        );

      const drawerTitle =
        document.querySelector(
          "#quickDrawerTitle"
        );

      const drawerContent =
        document.querySelector(
          "[data-drawer-content]"
        );

      const backdrop =
        document.querySelector(
          "[data-drawer-backdrop]"
        );

      let filter = "all";
      let query = "";
      let lastFocusedElement = null;

      const safeImagePath = value => {
        if (typeof value !== "string") {
          return "";
        }

        return /^assets\/images\/[a-z0-9._/-]+$/i
          .test(value)
          ? value
          : "";
      };

      const make = (
        tag,
        className = "",
        text
      ) => {
        const node =
          document.createElement(tag);

        if (className) {
          node.className = className;
        }

        if (text !== undefined) {
          node.textContent = text;
        }

        return node;
      };

      const minimumPrice = product => {
        if (!product.variants?.length) {
          return null;
        }

        return Math.min(
          ...product.variants.map(
            variant =>
              Number(variant.price) || 0
          )
        );
      };

      const visibleProducts = () =>
        window.AYA.products.filter(
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
              .filter(Boolean)
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

      function createProductImage(
        product
      ) {
        const imagePath =
          safeImagePath(product.image);

        if (imagePath) {
          const image =
            document.createElement("img");

          image.src = imagePath;
          image.alt =
            product.name ||
            "Produk AYA";

          image.loading = "lazy";
          image.width = 900;
          image.height = 720;

          return image;
        }

        const placeholder =
          make(
            "div",
            "product-placeholder",
            product.name ||
              "Produk AYA"
          );

        placeholder.setAttribute(
          "role",
          "img"
        );

        placeholder.setAttribute(
          "aria-label",
          `Foto ${
            product.name ||
            "produk AYA"
          } sedang disiapkan`
        );

        return placeholder;
      }

      function createProductCard(
        product
      ) {
        const article =
          make(
            "article",
            "product-card"
          );

        const detailUrl =
          `product.html?id=${
            encodeURIComponent(
              product.id
            )
          }`;

        const imageLink =
          make(
            "a",
            "product-image-link"
          );

        imageLink.href = detailUrl;

        imageLink.setAttribute(
          "aria-label",
          `Lihat detail ${
            product.name ||
            "produk AYA"
          }`
        );

        imageLink.appendChild(
          createProductImage(product)
        );

        if (product.badge) {
          imageLink.appendChild(
            make(
              "span",
              "product-badge",
              product.badge
            )
          );
        }

        const body =
          make(
            "div",
            "product-card-body"
          );

        body.appendChild(
          make(
            "span",
            "product-line",
            product.line || "AYA"
          )
        );

        const titleLink =
          document.createElement("a");

        titleLink.href = detailUrl;

        titleLink.appendChild(
          make(
            "h3",
            "",
            product.name ||
              "Produk AYA"
          )
        );

        body.appendChild(titleLink);

        body.appendChild(
          make(
            "p",
            "product-card-description",
            product.description || ""
          )
        );

        const footer =
          make(
            "div",
            "product-card-footer"
          );

        const priceBox =
          document.createElement("div");

        const price =
          minimumPrice(product);

        priceBox.appendChild(
          make(
            "span",
            "product-price-label",
            price
              ? "Mulai dari"
              : "Status"
          )
        );

        priceBox.appendChild(
          make(
            "strong",
            "product-price",
            price
              ? window.AYA.currency(
                  price
                )
              : "Segera hadir"
          )
        );

        footer.appendChild(priceBox);

        const productActions =
          make(
            "div",
            "product-actions"
          );

        const detailLink =
          make(
            "a",
            "product-detail-link",
            "Detail →"
          );

        detailLink.href =
          detailUrl;

        detailLink.setAttribute(
          "aria-label",
          `Lihat detail ${
            product.name ||
            "produk AYA"
          }`
        );

        productActions.appendChild(
          detailLink
        );

        if (
          product.available &&
          product.variants?.length
        ) {
          const quickAdd =
            make(
              "button",
              "product-quick-add",
              "+"
            );

          quickAdd.type = "button";

          quickAdd.dataset.quickAdd =
            product.id;

          quickAdd.setAttribute(
            "aria-label",
            `Pilih varian ${
              product.name
            }`
          );

          quickAdd.addEventListener(
            "click",
            event => {
              event.preventDefault();
              event.stopPropagation();

              try {
                openDrawer(product.id);
              } catch (error) {
                console.error(
                  "AYA quick-add error:",
                  error
                );

                window.AYA.showToast(
                  "Pilihan produk belum dapat dibuka. Silakan coba kembali."
                );
              }
            }
          );

          productActions.appendChild(
            quickAdd
          );
        }

        footer.appendChild(
          productActions
        );

        body.appendChild(footer);

        article.append(
          imageLink,
          body
        );

        return article;
      }

      function render() {
        const items =
          visibleProducts();

        if (resultCount) {
          resultCount.textContent =
            `${items.length} produk ditemukan`;
        }

        grid.replaceChildren();

        if (!items.length) {
          const empty =
            make(
              "div",
              "empty-state product-grid-empty"
            );

          empty.appendChild(
            make(
              "h3",
              "",
              "Produk tidak ditemukan."
            )
          );

          empty.appendChild(
            make(
              "p",
              "",
              "Coba kata kunci atau filter berbeda."
            )
          );

          grid.appendChild(empty);
          return;
        }

        const fragment =
          document.createDocumentFragment();

        items.forEach(product => {
          fragment.appendChild(
            createProductCard(product)
          );
        });

        grid.appendChild(fragment);
      }

      function createDrawerProduct(
        product
      ) {
        const wrapper =
          make(
            "div",
            "drawer-product"
          );

        const imagePath =
          safeImagePath(product.image);

        if (imagePath) {
          const image =
            document.createElement("img");

          image.src = imagePath;
          image.alt = product.name;
          image.width = 200;
          image.height = 200;

          wrapper.appendChild(image);
        } else {
          wrapper.appendChild(
            make(
              "div",
              "drawer-product-placeholder",
              "AYA"
            )
          );
        }

        const copy =
          document.createElement("div");

        copy.appendChild(
          make(
            "span",
            "product-line",
            product.line || "AYA"
          )
        );

        copy.appendChild(
          make(
            "h3",
            "",
            product.name
          )
        );

        copy.appendChild(
          make(
            "p",
            "",
            product.description || ""
          )
        );

        wrapper.appendChild(copy);

        return wrapper;
      }

      function openDrawer(
        productId
      ) {
        const product =
          window.AYA.getProduct(
            productId
          );

        if (
          !product ||
          !product.available ||
          !product.variants?.length
        ) {
          window.AYA.showToast(
            "Produk ini belum tersedia untuk dipesan."
          );

          return;
        }

        if (
          !drawer ||
          !drawerContent ||
          !backdrop
        ) {
          window.AYA.addCartItem(
            product.id,
            0,
            1
          );

          return;
        }

        lastFocusedElement =
          document.activeElement;

        drawerContent.replaceChildren();

        if (drawerTitle) {
          drawerTitle.textContent =
            `Pilih varian — ${product.name}`;
        }

        drawerContent.appendChild(
          createDrawerProduct(product)
        );

        const actions =
          make(
            "div",
            "drawer-actions"
          );

        const variantField =
          make(
            "div",
            "form-field"
          );

        const variantLabel =
          make(
            "label",
            "",
            "Pilih varian"
          );

        variantLabel.htmlFor =
          "quickVariant";

        const variantSelect =
          document.createElement(
            "select"
          );

        variantSelect.id =
          "quickVariant";

        variantSelect.name =
          "variant";

        product.variants.forEach(
          (variant, index) => {
            const option =
              document.createElement(
                "option"
              );

            option.value =
              String(index);

            option.textContent =
              `${variant.name} — ${
                window.AYA.currency(
                  variant.price
                )
              }`;

            variantSelect.appendChild(
              option
            );
          }
        );

        variantField.append(
          variantLabel,
          variantSelect
        );

        const quantityField =
          make(
            "div",
            "form-field"
          );

        const quantityLabel =
          make(
            "label",
            "",
            "Jumlah"
          );

        quantityLabel.htmlFor =
          "quickQty";

        const quantityInput =
          document.createElement(
            "input"
          );

        quantityInput.id = "quickQty";
        quantityInput.name = "quantity";
        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.max = "20";
        quantityInput.value = "1";
        quantityInput.inputMode =
          "numeric";

        quantityField.append(
          quantityLabel,
          quantityInput
        );

        const addButton =
          make(
            "button",
            "button button-primary button-full",
            "Tambah ke keranjang"
          );

        addButton.type = "button";

        addButton.dataset.confirmAdd =
          product.id;

        /*
          Listener langsung untuk memastikan tombol drawer
          selalu menambahkan produk.
        */
        addButton.addEventListener(
          "click",
          event => {
            event.preventDefault();
            event.stopPropagation();

            const originalText =
              addButton.textContent;

            try {
              const added =
                window.AYA.addCartItem(
                  product.id,
                  Number(
                    variantSelect.value
                  ),
                  Number(
                    quantityInput.value
                  )
                );

              if (!added) {
                return;
              }

              addButton.disabled = true;

              addButton.textContent =
                "✓ Ditambahkan";

              window.setTimeout(() => {
                addButton.disabled = false;
                addButton.textContent =
                  originalText;

                closeDrawer();
              }, 700);
            } catch (error) {
              console.error(
                "AYA add-to-cart error:",
                error
              );

              addButton.disabled = false;

              addButton.textContent =
                originalText;

              window.AYA.showToast(
                "Produk belum berhasil ditambahkan. Silakan coba kembali."
              );
            }
          }
        );

        const detailLink =
          make(
            "a",
            "button button-secondary button-full",
            "Lihat detail produk"
          );

        detailLink.href =
          `product.html?id=${
            encodeURIComponent(
              product.id
            )
          }`;

        actions.append(
          variantField,
          quantityField,
          addButton,
          detailLink
        );

        drawerContent.appendChild(
          actions
        );

        drawer.classList.add("open");

        drawer.setAttribute(
          "aria-hidden",
          "false"
        );

        backdrop.hidden = false;

        document.body.classList.add(
          "drawer-open"
        );

        const closeButton =
          drawer.querySelector(
            "[data-drawer-close]"
          );

        window.requestAnimationFrame(
          () => {
            closeButton?.focus();
          }
        );
      }

      function closeDrawer() {
        if (
          !drawer ||
          !backdrop
        ) {
          return;
        }

        drawer.classList.remove(
          "open"
        );

        drawer.setAttribute(
          "aria-hidden",
          "true"
        );

        backdrop.hidden = true;

        document.body.classList.remove(
          "drawer-open"
        );

        if (
          lastFocusedElement instanceof
            HTMLElement &&
          lastFocusedElement.isConnected
        ) {
          lastFocusedElement.focus();
        }

        lastFocusedElement = null;
      }

      function trapDrawerFocus(
        event
      ) {
        if (
          event.key !== "Tab" ||
          !drawer?.classList.contains(
            "open"
          )
        ) {
          return;
        }

        const focusable = [
          ...drawer.querySelectorAll(
            [
              "a[href]",
              "button:not([disabled])",
              "input:not([disabled])",
              "select:not([disabled])",
              "textarea:not([disabled])",
              '[tabindex]:not([tabindex="-1"])'
            ].join(",")
          )
        ].filter(element => {
          return (
            !element.hidden &&
            element.getAttribute(
              "aria-hidden"
            ) !== "true"
          );
        });

        if (!focusable.length) {
          event.preventDefault();
          drawer.focus();
          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[
            focusable.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
          return;
        }

        if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
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

          const quickButton =
            event.target.closest(
              "[data-quick-add]"
            );

          if (quickButton) {
            event.preventDefault();

            openDrawer(
              quickButton.dataset
                .quickAdd
            );

            return;
          }

          const confirmButton =
            event.target.closest(
              "[data-confirm-add]"
            );

          if (confirmButton) {
            event.preventDefault();

            const variantIndex =
              Number(
                drawerContent
                  ?.querySelector(
                    "#quickVariant"
                  )
                  ?.value || 0
              );

            const quantity =
              Number(
                drawerContent
                  ?.querySelector(
                    "#quickQty"
                  )
                  ?.value || 1
              );

            const originalText =
              confirmButton.textContent;

            const added =
              window.AYA.addCartItem(
                confirmButton.dataset
                  .confirmAdd,
                variantIndex,
                quantity
              );

            if (!added) return;

            confirmButton.disabled =
              true;

            confirmButton.textContent =
              "✓ Ditambahkan";

            window.setTimeout(() => {
              confirmButton.disabled =
                false;

              confirmButton.textContent =
                originalText;

              closeDrawer();
            }, 650);

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

      document.addEventListener(
        "keydown",
        event => {
          trapDrawerFocus(event);

          if (
            event.key === "Escape" &&
            drawer?.classList.contains(
              "open"
            )
          ) {
            event.preventDefault();
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

      /* AYA CATALOG STICKY STATE */
      const updateToolbarState = () => {
        if (!toolbar) return;

        const headerHeight =
          parseFloat(
            getComputedStyle(
              document.documentElement
            ).getPropertyValue(
              "--aya-header-height"
            )
          ) || 82;

        toolbar.classList.toggle(
          "is-stuck",
          toolbar
            .getBoundingClientRect()
            .top <=
            headerHeight + 9
        );
      };

      window.addEventListener(
        "scroll",
        updateToolbarState,
        { passive: true }
      );

      window.addEventListener(
        "resize",
        updateToolbarState
      );

      updateToolbarState();

      const params =
        new URLSearchParams(
          window.location.search
        );

      const requestedFilter =
        params.get("line");

      if (
        [
          "spice",
          "farm",
          "snack"
        ].includes(requestedFilter)
      ) {
        filter = requestedFilter;

        document
          .querySelectorAll(
            "[data-filter]"
          )
          .forEach(button => {
            button.classList.toggle(
              "active",
              button.dataset.filter ===
                filter
            );
          });
      }

      render();
    }
  );
})();

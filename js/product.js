(() => {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const mount =
        document.querySelector(
          "[data-product-detail]"
        );

      if (!mount || !window.AYA) {
        return;
      }

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

      const safeImagePath = value => {
        if (typeof value !== "string") {
          return "";
        }

        return /^assets\/images\/[a-z0-9._/-]+$/i
          .test(value)
          ? value
          : "";
      };

      const productId =
        new URLSearchParams(
          window.location.search
        ).get("id");

      const product =
        window.AYA.getProduct(
          productId
        );

      mount.replaceChildren();

      if (!product) {
        const empty =
          make(
            "div",
            "empty-state"
          );

        empty.appendChild(
          make(
            "h1",
            "",
            "Produk tidak ditemukan."
          )
        );

        empty.appendChild(
          make(
            "p",
            "",
            "Produk mungkin telah dipindahkan atau belum tersedia."
          )
        );

        const back =
          make(
            "a",
            "button button-primary mt-20",
            "Kembali ke katalog"
          );

        back.href = "products.html";

        empty.appendChild(back);
        mount.appendChild(empty);

        document.title =
          "Produk Tidak Ditemukan — AYA RAOS";

        return;
      }

      document.title =
        `${product.name} — AYA RAOS`;

      const minimumPrice =
        product.variants?.length
          ? Math.min(
              ...product.variants.map(
                variant =>
                  Number(
                    variant.price
                  ) || 0
              )
            )
          : null;

      const grid =
        make(
          "div",
          "product-detail-grid"
        );

      const gallery =
        make(
          "div",
          "product-gallery-main"
        );

      const imagePath =
        safeImagePath(product.image);

      if (imagePath) {
        const image =
          document.createElement("img");

        image.src = imagePath;
        image.alt = product.name;
        image.width = 1080;
        image.height = 1000;

        gallery.appendChild(image);
      } else {
        const placeholder =
          make(
            "div",
            "product-placeholder product-detail-placeholder",
            product.name
          );

        placeholder.setAttribute(
          "role",
          "img"
        );

        placeholder.setAttribute(
          "aria-label",
          `Foto ${product.name} sedang disiapkan`
        );

        gallery.appendChild(
          placeholder
        );
      }

      const copy =
        make(
          "div",
          "product-detail-copy"
        );

      copy.appendChild(
        make(
          "span",
          "eyebrow",
          product.line || "AYA"
        )
      );

      copy.appendChild(
        make(
          "h1",
          "",
          product.name
        )
      );

      copy.appendChild(
        make(
          "p",
          "product-detail-lead",
          product.details ||
            product.description ||
            ""
        )
      );

      copy.appendChild(
        make(
          "div",
          "detail-price",
          minimumPrice !== null
            ? `Mulai ${
                window.AYA.currency(
                  minimumPrice
                )
              }`
            : "Informasi sedang diperbarui"
        )
      );

      if (
        product.available &&
        product.variants?.length
      ) {
        const purchaseBox =
          make(
            "div",
            "purchase-box"
          );

        const purchaseRow =
          make(
            "div",
            "purchase-row"
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
            "Varian"
          );

        variantLabel.htmlFor =
          "detailVariant";

        const variantSelect =
          document.createElement(
            "select"
          );

        variantSelect.id =
          "detailVariant";

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
          "detailQty";

        const quantityInput =
          document.createElement(
            "input"
          );

        quantityInput.id = "detailQty";
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

        purchaseRow.append(
          variantField,
          quantityField
        );

        const addButton =
          make(
            "button",
            "button button-primary button-full",
            "Tambah ke keranjang"
          );

        addButton.type = "button";
        addButton.dataset.addDetail = "";

        const cartLink =
          make(
            "a",
            "button button-secondary button-full",
            "Lihat keranjang"
          );

        cartLink.href = "cart.html";

        purchaseBox.append(
          purchaseRow,
          addButton,
          cartLink
        );

        copy.appendChild(
          purchaseBox
        );

        addButton.addEventListener(
          "click",
          () => {
            const originalText =
              addButton.textContent;

            let added = false;

            try {
              added =
                window.AYA.addCartItem(
                  product.id,
                  Number(
                    variantSelect.value
                  ),
                  Number(
                    quantityInput.value
                  )
                );
            } catch (error) {
              console.error(
                "AYA product cart error:",
                error
              );

              window.AYA.showToast(
                "Produk belum berhasil ditambahkan."
              );
            }

            if (!added) return;

            addButton.disabled = true;

            addButton.textContent =
              "✓ Ditambahkan ke keranjang";

            window.setTimeout(() => {
              addButton.disabled =
                false;

              addButton.textContent =
                originalText;
            }, 1400);
          }
        );
      } else {
        const unavailable =
          make(
            "div",
            "purchase-box"
          );

        unavailable.appendChild(
          make(
            "strong",
            "",
            "Produk belum dibuka untuk pemesanan."
          )
        );

        unavailable.appendChild(
          make(
            "p",
            "purchase-box-note",
            "Informasi harga atau ketersediaan akan diperbarui."
          )
        );

        copy.appendChild(unavailable);
      }

      const facts =
        make(
          "div",
          "detail-facts"
        );

      const factItems = [
        [
          "Kategori",
          product.category
        ],
        [
          "Pengiriman",
          product.shipping
        ],
        [
          "Penyimpanan",
          product.storage
        ],
        [
          "Masa simpan",
          product.shelfLife
        ],
        [
          "Waktu produksi",
          window.AYA.config.leadTime ||
            "2–3 hari setelah pembayaran dikonfirmasi"
        ]
      ];

      factItems.forEach(
        ([label, value]) => {
          const fact =
            make(
              "div",
              "detail-fact"
            );

          fact.appendChild(
            make(
              "strong",
              "",
              label
            )
          );

          fact.appendChild(
            make(
              "span",
              "",
              value ||
                "Dikonfirmasi saat pemesanan."
            )
          );

          facts.appendChild(fact);
        }
      );

      copy.appendChild(facts);

      grid.append(
        gallery,
        copy
      );

      mount.appendChild(grid);
    }
  );
})();

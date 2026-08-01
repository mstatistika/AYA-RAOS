(() => {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const mount =
        document.querySelector(
          "[data-product-detail]"
        );

      if (!mount || !window.AYA) return;

      const id =
        new URLSearchParams(
          window.location.search
        ).get("id");

      const product =
        window.AYA.getProduct(id);

      if (!product) {
        mount.innerHTML = `
          <div class="empty-state">
            <h2>Produk tidak ditemukan.</h2>
            <p>
              Produk mungkin telah dipindahkan
              atau belum tersedia.
            </p>
            <a
              class="button button-primary"
              href="products.html"
            >
              Kembali ke katalog
            </a>
          </div>
        `;

        return;
      }

      document.title =
        `${product.name} — AYA RAOS`;

      const price =
        product.variants.length
          ? Math.min(
              ...product.variants.map(
                variant => variant.price
              )
            )
          : null;

      mount.innerHTML = `
        <div class="product-detail-grid">
          <div class="product-gallery-main">
            ${
              product.image
                ? `
                  <img
                    src="${product.image}"
                    alt="${product.name}"
                  />
                `
                : `
                  <div
                    class="product-placeholder"
                    style="aspect-ratio:1.08"
                  >
                    ${product.name}
                  </div>
                `
            }
          </div>

          <div class="product-detail-copy">
            <span class="eyebrow">
              ${product.line}
            </span>

            <h1>${product.name}</h1>

            <p class="product-detail-lead">
              ${product.details || product.description}
            </p>

            <div class="detail-price">
              ${
                price
                  ? `Mulai ${window.AYA.currency(price)}`
                  : "Informasi sedang diperbarui"
              }
            </div>

            ${
              product.available &&
              product.variants.length
                ? `
                  <div class="purchase-box">
                    <div class="purchase-row">
                      <div class="form-field">
                        <label for="detailVariant">
                          Varian
                        </label>

                        <select id="detailVariant">
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
                        <label for="detailQty">
                          Jumlah
                        </label>

                        <input
                          id="detailQty"
                          type="number"
                          min="1"
                          max="20"
                          value="1"
                          inputmode="numeric"
                        />
                      </div>
                    </div>

                    <button
                      class="button button-primary button-full"
                      type="button"
                      data-add-detail
                    >
                      Tambah ke keranjang
                    </button>

                    <a
                      class="button button-secondary button-full"
                      href="cart.html"
                    >
                      Lihat keranjang
                    </a>
                  </div>
                `
                : `
                  <div class="purchase-box">
                    <strong>
                      Produk belum dibuka untuk pemesanan.
                    </strong>

                    <p style="margin-top:7px">
                      Informasi harga atau ketersediaan
                      akan diperbarui.
                    </p>
                  </div>
                `
            }

            <div class="detail-facts">
              <div class="detail-fact">
                <strong>Kategori</strong>
                <span>${product.category}</span>
              </div>

              <div class="detail-fact">
                <strong>Pengiriman</strong>
                <span>${product.shipping}</span>
              </div>

              <div class="detail-fact">
                <strong>Penyimpanan</strong>
                <span>${product.storage}</span>
              </div>

              <div class="detail-fact">
                <strong>Masa simpan</strong>
                <span>${product.shelfLife}</span>
              </div>

              <div class="detail-fact">
                <strong>Waktu produksi</strong>
                <span>
                  ${
                    window.AYA.config.leadTime ||
                    "2–3 hari setelah pembayaran dikonfirmasi"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

      const addButton =
        document.querySelector(
          "[data-add-detail]"
        );

      addButton?.addEventListener(
        "click",
        () => {
          const variant = Number(
            document.querySelector(
              "#detailVariant"
            )?.value || 0
          );

          const quantity = Number(
            document.querySelector(
              "#detailQty"
            )?.value || 1
          );

          const originalText =
            addButton.textContent;

          const success =
            window.AYA.addCartItem(
              product.id,
              variant,
              quantity
            );

          if (!success) return;

          addButton.disabled = true;
          addButton.textContent =
            "✓ Ditambahkan ke keranjang";

          window.setTimeout(() => {
            addButton.disabled = false;
            addButton.textContent =
              originalText;
          }, 1400);
        }
      );
    }
  );
})();

(() => {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const list =
        document.querySelector(
          "[data-cart-list]"
        );

      const empty =
        document.querySelector(
          "[data-cart-empty]"
        );

      const subtotal =
        document.querySelector(
          "[data-cart-subtotal]"
        );

      const form =
        document.querySelector(
          "[data-checkout-form]"
        );

      const checkout =
        document.querySelector(
          "[data-checkout]"
        );

      if (
        !list ||
        !empty ||
        !subtotal ||
        !form ||
        !checkout ||
        !window.AYA
      ) {
        console.error(
          "AYA: elemen keranjang tidak lengkap."
        );

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

      function createActionButton(
        action,
        index,
        label,
        text
      ) {
        const button =
          make(
            "button",
            "",
            text
          );

        button.type = "button";

        button.dataset.cartAction =
          action;

        button.dataset.index =
          String(index);

        button.setAttribute(
          "aria-label",
          label
        );

        return button;
      }

      function createCartRow(
        item,
        index
      ) {
        const product =
          window.AYA.getProduct(
            item.productId
          );

        const productName =
          product?.name ||
          item.productId ||
          "Produk AYA";

        const article =
          make(
            "article",
            "cart-row"
          );

        const imagePath =
          safeImagePath(
            product?.image
          );

        if (imagePath) {
          const image =
            document.createElement("img");

          image.src = imagePath;
          image.alt = productName;
          image.width = 180;
          image.height = 180;

          article.appendChild(image);
        } else {
          article.appendChild(
            make(
              "div",
              "cart-row-placeholder",
              "AYA"
            )
          );
        }

        const copy =
          document.createElement("div");

        copy.appendChild(
          make(
            "h3",
            "",
            productName
          )
        );

        copy.appendChild(
          make(
            "p",
            "",
            item.variant ||
              "Varian standar"
          )
        );

        const controls =
          make(
            "div",
            "quantity-control"
          );

        controls.appendChild(
          createActionButton(
            "decrease",
            index,
            `Kurangi jumlah ${productName}`,
            "−"
          )
        );

        controls.appendChild(
          make(
            "strong",
            "",
            String(
              Number(
                item.quantity
              ) || 1
            )
          )
        );

        controls.appendChild(
          createActionButton(
            "increase",
            index,
            `Tambah jumlah ${productName}`,
            "+"
          )
        );

        copy.appendChild(controls);

        const remove =
          make(
            "button",
            "remove-link",
            "Hapus dari keranjang"
          );

        remove.type = "button";

        remove.dataset.cartAction =
          "remove";

        remove.dataset.index =
          String(index);

        copy.appendChild(remove);

        const rowPrice =
          make(
            "div",
            "cart-row-price",
            window.AYA.currency(
              Number(item.price) *
              Number(item.quantity)
            )
          );

        article.append(
          copy,
          rowPrice
        );

        return article;
      }

      function render() {
        const cart =
          window.AYA.getCart();

        const hasItems =
          cart.length > 0;

        empty.hidden = hasItems;
        list.hidden = !hasItems;
        checkout.disabled =
          !hasItems;

        subtotal.textContent =
          window.AYA.currency(
            window.AYA.cartTotal(
              cart
            )
          );

        list.replaceChildren();

        if (!hasItems) return;

        const fragment =
          document.createDocumentFragment();

        cart.forEach(
          (item, index) => {
            fragment.appendChild(
              createCartRow(
                item,
                index
              )
            );
          }
        );

        list.appendChild(fragment);
      }

      list.addEventListener(
        "click",
        event => {
          const button =
            event.target.closest(
              "[data-cart-action]"
            );

          if (!button) return;

          const cart =
            window.AYA.getCart();

          const index =
            Number(
              button.dataset.index
            );

          const item =
            cart[index];

          if (!item) return;

          const action =
            button.dataset.cartAction;

          if (action === "increase") {
            item.quantity = Math.min(
              20,
              Number(
                item.quantity
              ) + 1
            );
          }

          if (action === "decrease") {
            item.quantity =
              Number(
                item.quantity
              ) - 1;
          }

          if (
            action === "remove" ||
            Number(item.quantity) <= 0
          ) {
            cart.splice(index, 1);
          }

          window.AYA.saveCart(cart);

          render();
        }
      );

      form.addEventListener(
        "submit",
        event => {
          event.preventDefault();

          const cart =
            window.AYA.getCart();

          if (!cart.length) {
            window.AYA.showToast(
              "Keranjang masih kosong."
            );

            return;
          }

          const customerName =
            form.querySelector(
              "#customerName"
            );

          const deliveryZone =
            form.querySelector(
              "#deliveryZone"
            );

          const notes =
            form.querySelector(
              "#orderNotes"
            );

          const zoneText =
            deliveryZone
              ?.selectedOptions?.[0]
              ?.textContent
              ?.trim() ||
            deliveryZone?.value ||
            "";

          const message =
            window.AYA
              .buildWhatsAppMessage(
                cart,
                {
                  customerName:
                    customerName
                      ?.value
                      ?.trim() || "",

                  zone: zoneText,

                  notes:
                    notes
                      ?.value
                      ?.trim() || ""
                }
              );

          const opened =
            window.AYA.openWhatsApp(
              message
            );

          if (opened) {
            window.AYA.showToast(
              "Pesanan siap dikirim melalui WhatsApp."
            );
          }
        }
      );

      window.addEventListener(
        "aya:cart-updated",
        render
      );

      render();
    }
  );
})();

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;

    const list = document.querySelector("[data-cart-list]");
    const empty = document.querySelector("[data-cart-empty]");
    const subtotal = document.querySelector("[data-cart-subtotal]");
    const summaryCount = document.querySelector("[data-summary-count]");
    const form = document.querySelector("[data-checkout-form]");
    const status = document.querySelector("[data-cart-form-status]");

    if (!list || !form) return;

    function setStatus(message, type = "") {
      status.textContent = message;
      status.className = `form-status${type ? ` is-${type}` : ""}`;
    }

    function createCartItem(item) {
      const product = window.AYA.getProduct(item.productId);
      const article = window.AYA.make("article", "cart-item");
      const media = product
        ? window.AYA.createMedia(product, "cart-item-media")
        : window.AYA.make("div", "product-placeholder", "Produk AYA");

      const copy = window.AYA.make("div", "cart-item-copy");
      copy.append(
        window.AYA.make("span", "", product?.line || "AYA RAOS"),
        window.AYA.make("h3", "", product?.name || item.productId),
        window.AYA.make("p", "", `Varian: ${item.variant}`),
        window.AYA.make("strong", "", window.AYA.currency(item.price))
      );

      const controls = window.AYA.make("div", "cart-item-controls");
      const qtyLabel = window.AYA.make("label", "cart-qty-label");
      qtyLabel.appendChild(window.AYA.make("span", "", "Jumlah"));
      const qty = document.createElement("input");
      qty.type = "number";
      qty.min = "1";
      qty.max = "99";
      qty.value = item.quantity;
      qty.inputMode = "numeric";
      qty.setAttribute("aria-label", `Jumlah ${product?.name || item.productId}`);
      qty.addEventListener("change", () => {
        window.AYA.updateCartItem(item.productId, item.variant, qty.value);
        render();
      });
      qtyLabel.appendChild(qty);

      const itemSubtotal = window.AYA.make("strong", "cart-item-subtotal", window.AYA.currency(item.price * item.quantity));
      const remove = window.AYA.make("button", "cart-remove", "Hapus");
      remove.type = "button";
      remove.addEventListener("click", () => {
        window.AYA.removeCartItem(item.productId, item.variant);
        render();
      });

      controls.append(qtyLabel, itemSubtotal, remove);
      article.append(media, copy, controls);
      return article;
    }

    function render() {
      const cart = window.AYA.getCart();
      list.replaceChildren();
      empty.hidden = cart.length > 0;
      form.hidden = cart.length === 0;

      cart.forEach(item => list.appendChild(createCartItem(item)));
      subtotal.textContent = window.AYA.currency(window.AYA.cartTotal(cart));
      summaryCount.textContent = window.AYA.cartCount(cart);
      window.AYA.updateCartCount();
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      setStatus("");

      const cart = window.AYA.getCart();
      if (!cart.length) {
        setStatus("Keranjang masih kosong.", "error");
        return;
      }

      if (!form.reportValidity()) {
        setStatus("Lengkapi nama, WhatsApp, dan area terlebih dahulu.", "error");
        return;
      }

      const data = new FormData(form);
      const customer = Object.fromEntries(data.entries());
      const message = window.AYA.buildCartMessage(cart, customer);
      const opened = window.AYA.openWhatsApp(message);

      if (opened) {
        setStatus("Ringkasan pesanan dibuka di WhatsApp.", "success");
      }
    });

    window.addEventListener("aya:cart-updated", render);
    render();
  });
})();

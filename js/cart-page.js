(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector("[data-cart-list]");
    const empty = document.querySelector("[data-cart-empty]");
    const subtotal = document.querySelector("[data-cart-subtotal]");
    const checkout = document.querySelector("[data-checkout]");
    if (!list) return;

    function render() {
      const cart = window.AYA.getCart();
      empty.hidden = cart.length > 0;
      list.hidden = cart.length === 0;
      checkout.disabled = cart.length === 0;
      subtotal.textContent = window.AYA.currency(window.AYA.cartTotal(cart));

      list.innerHTML = cart.map((item, index) => {
        const product = window.AYA.getProduct(item.productId);
        const name = product ? product.name : item.productId;
        return `
          <article class="cart-row">
            ${product?.image ? `<img src="${product.image}" alt="${name}" />` : `<div class="cart-row-placeholder">AYA</div>`}
            <div>
              <h3>${name}</h3>
              <p>${item.variant}</p>
              <div class="quantity-control">
                <button type="button" data-cart-action="decrease" data-index="${index}" aria-label="Kurangi jumlah">−</button>
                <strong>${item.quantity}</strong>
                <button type="button" data-cart-action="increase" data-index="${index}" aria-label="Tambah jumlah">+</button>
              </div>
              <button class="remove-link" type="button" data-cart-action="remove" data-index="${index}">Hapus dari keranjang</button>
            </div>
            <div class="cart-row-price">${window.AYA.currency(item.price * item.quantity)}</div>
          </article>`;
      }).join("");
    }

    document.addEventListener("click", event => {
      const actionButton = event.target.closest("[data-cart-action]");
      if (!actionButton) return;
      const cart = window.AYA.getCart();
      const index = Number(actionButton.dataset.index);
      const action = actionButton.dataset.cartAction;
      if (!cart[index]) return;

      if (action === "increase") cart[index].quantity = Math.min(20, cart[index].quantity + 1);
      if (action === "decrease") cart[index].quantity -= 1;
      if (action === "remove" || cart[index].quantity <= 0) cart.splice(index, 1);
      window.AYA.saveCart(cart);
      render();
    });

    checkout.addEventListener("click", () => {
      const cart = window.AYA.getCart();
      if (!cart.length) return window.AYA.showToast("Keranjang masih kosong");
      const extra = {
        customerName: document.querySelector("#customerName").value.trim(),
        zone: document.querySelector("#deliveryZone").value,
        notes: document.querySelector("#orderNotes").value.trim()
      };
      window.AYA.openWhatsApp(window.AYA.buildWhatsAppMessage(cart, extra));
    });

    window.addEventListener("aya:cart-updated", render);
    render();
  });
})();

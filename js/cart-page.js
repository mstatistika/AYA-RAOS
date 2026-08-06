(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;

    const cartRoot = document.querySelector("[data-cart-items]");
    const subtotalNode = document.querySelector("[data-cart-subtotal]");
    const draft = Object.assign({ schemaVersion: 3, context: "personal", customer: {}, shipping: {}, notes: "" }, window.AYA.readDraft());
    const params = new URLSearchParams(location.search);
    const requestedContext = params.get("context");
    const legacyType = params.get("type");
    if (["personal", "event"].includes(requestedContext)) draft.context = requestedContext;
    else if (legacyType === "business") {
      draft.context = "event";
      const url = new URL(location.href); url.search = ""; url.searchParams.set("context", "event"); history.replaceState({}, "", url);
    } else if (legacyType === "personal") {
      draft.context = "personal";
      const url = new URL(location.href); url.search = ""; url.searchParams.set("context", "personal"); history.replaceState({}, "", url);
    }

    const migrationNotice = document.querySelector("[data-draft-migration]");
    if (window.AYA.consumeDraftMigrationNotice() && migrationNotice) {
      migrationNotice.hidden = false;
      migrationNotice.innerHTML = '<strong>Draft lama diperbarui.</strong><p>Pilihan “Acara / Usaha” sebelumnya sekarang diklasifikasikan sebagai “Untuk Acara” karena semua kebutuhan satu kali adalah B2C.</p>';
    }

    let stage = 1;
    const customerForm = document.querySelector("[data-customer-form]");
    const shippingForm = document.querySelector("[data-shipping-form]");
    const errors = document.querySelector("[data-order-errors]");
    const contextInputs = [...document.querySelectorAll('[name="orderContext"]')];
    const personalFields = document.querySelector("[data-personal-fields]");
    const eventFields = document.querySelector("[data-event-fields]");

    const fillForm = (form, values = {}) => {
      Object.entries(values).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (field && typeof value !== "object" && value != null) field.value = String(value);
      });
    };

    fillForm(customerForm, draft.customer);
    fillForm(shippingForm, draft.shipping);

    const invalidateTotal = () => {
      draft.shipping = { ...(draft.shipping || {}), amount: null, status: "integration-pending" };
      draft.total = null;
      window.AYA.saveDraft(draft);
      document.querySelector("[data-summary-shipping]").textContent = "Belum tersedia";
      document.querySelector("[data-summary-total]").textContent = "Belum dapat dihitung";
    };

    const renderCart = () => {
      const items = window.AYA.cartDetails();
      subtotalNode.textContent = window.AYA.formatPrice(window.AYA.cartSubtotal());
      if (!items.length) {
        cartRoot.innerHTML = '<div class="empty-state"><strong>Keranjang masih kosong.</strong><p>Pilih produk dan varian sebelum melanjutkan pemesanan.</p><a class="button button-primary" href="products.html">Buka Katalog</a></div>';
        return;
      }
      cartRoot.innerHTML = items.map(({ product, variant, quantity, subtotal }) => {
        const rules = window.AYA.quantityRules(product);
        return `<article class="cart-item">
          <img src="${window.AYA.escapeHTML(product.image || product.placeholder)}" alt="${window.AYA.escapeHTML(product.name)}" width="110" height="110" data-image-fallback="${window.AYA.escapeHTML(product.id)}"/>
          <div class="cart-item-main">
            <span>${window.AYA.escapeHTML(product.line)}</span><h3>${window.AYA.escapeHTML(product.name)}</h3>
            <label class="cart-variant-label"><span>Varian</span><select data-cart-variant="${window.AYA.escapeHTML(product.id)}" data-old-variant="${window.AYA.escapeHTML(variant.name)}">${product.variants.map((option) => `<option ${option.name === variant.name ? "selected" : ""}>${window.AYA.escapeHTML(option.name)}</option>`).join("")}</select></label>
            <strong class="cart-unit-price">${window.AYA.formatPrice(variant.price)} / unit</strong>
          </div>
          <div class="cart-item-side">
            <div class="quantity-stepper" aria-label="Jumlah ${window.AYA.escapeHTML(product.name)}"><button type="button" data-cart-decrease="${window.AYA.escapeHTML(product.id)}" data-variant="${window.AYA.escapeHTML(variant.name)}" aria-label="Kurangi jumlah">−</button><input type="number" min="${rules.min}" max="${rules.max}" step="${rules.step}" value="${quantity}" data-cart-qty="${window.AYA.escapeHTML(product.id)}" data-variant="${window.AYA.escapeHTML(variant.name)}" aria-label="Jumlah"/><button type="button" data-cart-increase="${window.AYA.escapeHTML(product.id)}" data-variant="${window.AYA.escapeHTML(variant.name)}" aria-label="Tambah jumlah">+</button></div>
            <strong class="cart-item-subtotal">${window.AYA.formatPrice(subtotal)}</strong>
            <button class="cart-remove" type="button" data-cart-remove="${window.AYA.escapeHTML(product.id)}" data-variant="${window.AYA.escapeHTML(variant.name)}">Hapus</button>
          </div>
        </article>`;
      }).join("");
    };

    cartRoot.addEventListener("change", (event) => {
      const qty = event.target.closest("[data-cart-qty]");
      if (qty) {
        window.AYA.updateCartItem(qty.dataset.cartQty, qty.dataset.variant, qty.value);
        invalidateTotal(); renderCart(); return;
      }
      const select = event.target.closest("[data-cart-variant]");
      if (select) {
        window.AYA.changeCartVariant(select.dataset.cartVariant, select.dataset.oldVariant, select.value);
        invalidateTotal(); renderCart();
      }
    });

    cartRoot.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-cart-remove]");
      if (remove) {
        window.AYA.removeCartItem(remove.dataset.cartRemove, remove.dataset.variant);
        invalidateTotal(); renderCart(); return;
      }
      const minus = event.target.closest("[data-cart-decrease]");
      const plus = event.target.closest("[data-cart-increase]");
      const button = minus || plus;
      if (!button) return;
      const input = cartRoot.querySelector(`[data-cart-qty="${CSS.escape(button.dataset.cartDecrease || button.dataset.cartIncrease)}"][data-variant="${CSS.escape(button.dataset.variant)}"]`);
      const product = window.AYA.getProduct(button.dataset.cartDecrease || button.dataset.cartIncrease);
      if (!input || !product) return;
      const step = window.AYA.quantityRules(product).step;
      const next = Number(input.value) + (plus ? step : -step);
      window.AYA.updateCartItem(product.id, button.dataset.variant, next);
      invalidateTotal(); renderCart();
    });

    window.addEventListener("aya:cart-change", renderCart);

    const setContext = (context, { updateUrl = true } = {}) => {
      draft.context = context === "event" ? "event" : "personal";
      contextInputs.forEach((input) => { input.checked = input.value === draft.context; });
      personalFields.hidden = draft.context !== "personal";
      eventFields.hidden = draft.context !== "event";
      personalFields.querySelectorAll("input").forEach((input) => { input.required = draft.context === "personal" && ["customerName", "whatsapp"].includes(input.name); });
      eventFields.querySelectorAll("input,select").forEach((input) => { input.required = draft.context === "event" && ["eventPic", "eventWhatsapp", "eventType", "eventDate"].includes(input.name); });
      if (updateUrl) {
        const url = new URL(location.href); url.search = ""; url.searchParams.set("context", draft.context); history.replaceState({}, "", url);
      }
      invalidateTotal();
    };

    contextInputs.forEach((input) => input.addEventListener("change", () => setContext(input.value)));
    setContext(draft.context, { updateUrl: !requestedContext && !legacyType });

    const showErrors = (messages) => {
      errors.hidden = !messages.length;
      errors.innerHTML = messages.length ? `<strong>Periksa data berikut:</strong><ul>${messages.map((message) => `<li>${window.AYA.escapeHTML(message)}</li>`).join("")}</ul>` : "";
      if (messages.length) errors.focus();
    };

    const customerData = () => Object.fromEntries(new FormData(customerForm));
    const shippingData = () => Object.fromEntries(new FormData(shippingForm));

    const validateCustomer = () => {
      const data = customerData();
      const messages = [];
      if (draft.context === "personal") {
        if (!data.customerName?.trim()) messages.push("Nama lengkap wajib diisi.");
        if (!data.whatsapp?.trim()) messages.push("Nomor WhatsApp wajib diisi.");
      } else {
        if (!data.eventPic?.trim()) messages.push("Nama pemesan atau PIC wajib diisi.");
        if (!data.eventWhatsapp?.trim()) messages.push("Nomor WhatsApp wajib diisi.");
        if (!data.eventType) messages.push("Jenis acara atau kebutuhan wajib dipilih.");
        if (!data.eventDate) messages.push("Tanggal acara atau kebutuhan wajib diisi.");
      }
      if (!window.AYA.cartDetails().length) messages.push("Keranjang masih kosong.");
      showErrors(messages);
      if (!messages.length) {
        draft.customer = data; draft.notes = data.notes || ""; window.AYA.saveDraft(draft);
      }
      return !messages.length;
    };

    const validateShipping = () => {
      const data = shippingData();
      const messages = [];
      if (!data.area?.trim()) messages.push("Area atau kota wajib diisi.");
      if (!data.address?.trim()) messages.push("Alamat atau detail lokasi wajib diisi.");
      showErrors(messages);
      if (!messages.length) {
        draft.shipping = { ...data, amount: null, status: "integration-pending" };
        window.AYA.saveDraft(draft);
      }
      return !messages.length;
    };

    const renderReview = () => {
      const items = window.AYA.cartDetails();
      const customer = draft.customer || {};
      const shipping = draft.shipping || {};
      const identity = draft.context === "event" ? (customer.eventPic || "") : (customer.customerName || "");
      document.querySelector("[data-order-review]").innerHTML = `<div class="review-block"><strong>${draft.context === "event" ? "Untuk Acara" : "Untuk Rumah"}</strong><p>${window.AYA.escapeHTML(identity)}</p></div><div class="review-block"><strong>Produk</strong>${items.map((item) => `<p>${window.AYA.escapeHTML(item.product.name)} · ${window.AYA.escapeHTML(item.variant.name)} × ${item.quantity}</p>`).join("")}</div><div class="review-block"><strong>Pengiriman</strong><p>${window.AYA.escapeHTML(shipping.area || "")} — ${window.AYA.escapeHTML(shipping.address || "")}</p></div>`;
      document.querySelector("[data-summary-subtotal]").textContent = window.AYA.formatPrice(window.AYA.cartSubtotal());
      document.querySelector("[data-summary-shipping]").textContent = "Belum tersedia";
      document.querySelector("[data-summary-total]").textContent = "Belum dapat dihitung";
    };

    const go = (target, shouldScroll = true) => {
      if (target === 2 && stage === 1 && !validateCustomer()) return;
      if (target === 3 && stage === 2 && !validateShipping()) return;
      if (target === 3 || target === 4) renderReview();
      stage = target;
      document.querySelectorAll("[data-stage]").forEach((node) => {
        const active = Number(node.dataset.stage) === stage;
        node.hidden = !active; node.classList.toggle("active", active);
      });
      document.querySelectorAll("[data-stage-button]").forEach((button) => {
        const position = Number(button.dataset.stageButton);
        button.classList.toggle("active", position === stage);
        button.classList.toggle("complete", position < stage);
        if (position === stage) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
      });
      if (shouldScroll) document.querySelector(".gateway-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    document.querySelectorAll("[data-next-stage]").forEach((button) => button.addEventListener("click", () => go(Number(button.dataset.nextStage))));
    document.querySelectorAll("[data-prev-stage]").forEach((button) => button.addEventListener("click", () => go(Number(button.dataset.prevStage))));
    document.querySelectorAll("[data-stage-button]").forEach((button) => button.addEventListener("click", () => {
      const target = Number(button.dataset.stageButton); if (target < stage) go(target);
    }));

    document.querySelector("[data-whatsapp-support]")?.addEventListener("click", () => {
      window.AYA.openWhatsApp("Halo AYA RAOS, saya sedang mengisi pesanan di website dan membutuhkan bantuan mengenai prosedur pemesanan.");
    });

    renderCart(); go(1, false);
  });
})();

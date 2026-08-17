(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;

    const AYA = window.AYA;
    const config = window.AYA_CONFIG || {};
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    const nodes = {
      cartGrid: $("#cartGrid"), items: $("#items"), itemCount: $("#itemCount"), unitCount: $("#unitCount"),
      miniItems: $("#miniItems"), miniUnits: $("#miniUnits"), desktopSummary: $("#desktopSummary"), desktopTotal: $("#desktopTotal"),
      mobileSummary: $("#mobileSummary"), dataPanel: $("#dataPanel"), eventBox: $("#eventBox"), eventDate: $("#eventDate"),
      eventDateError: $("#eventDateError"), name: $("#name"), phone: $("#phone"), notes: $("#notes"), address: $("#address"),
      locationStatus: $("#locationStatus"), sheet: $("#sheet"), variantOptions: $("#variantOptions"),
      paymentProducts: $("#paymentProducts"), paymentBreakdown: $("#paymentBreakdown"), paymentTotalLeft: $("#paymentTotalLeft"),
      paymentTotalMobile: $("#paymentTotalMobile"), qrisView: $("#qrisView"), vaView: $("#vaView")
    };

    const baseDraft = {
      schemaVersion: 1,
      context: "personal",
      customer: {},
      shipping: { address: "", lat: null, lng: null, confirmed: false, source: "address" },
      event: { eventDate: "", beforeEvent: "no" },
      notes: ""
    };
    const stored = AYA.readDraft() || {};
    const draft = {
      ...baseDraft,
      ...stored,
      customer: { ...baseDraft.customer, ...(stored.customer || {}) },
      shipping: { ...baseDraft.shipping, ...(stored.shipping || {}) },
      event: { ...baseDraft.event, ...(stored.event || {}) }
    };

    const params = new URLSearchParams(location.search);
    const requestedContext = params.get("context");
    if (requestedContext === "event") draft.context = "event";
    if (["personal", "regular"].includes(requestedContext)) draft.context = "personal";

    let activeVariant = null;
    let method = "qris";

    const format = (value) => AYA.formatPrice(Number(value) || 0);
    const details = () => AYA.cartDetails();
    const unitCount = () => details().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const shippingCharge = () => {
      const amount = Number(draft.shipping?.amount);
      return Number.isFinite(amount) && amount >= 0 ? amount : 25000;
    };
    const shippingCap = (units) => units >= 100 ? 50000 : units >= 50 ? 25000 : 0;
    const financials = () => {
      const units = unitCount();
      const subtotal = AYA.cartSubtotal();
      const shipping = shippingCharge();
      const cap = shippingCap(units);
      const benefit = Math.min(shipping, cap);
      return { units, subtotal, shipping, benefit, total: subtotal + shipping - benefit };
    };

    const saveDraft = () => {
      draft.schemaVersion = 1;
      draft.customer = { customerName: nodes.name.value.trim(), whatsapp: nodes.phone.value.trim() };
      draft.notes = nodes.notes.value;
      draft.shipping = { ...draft.shipping, address: nodes.address.value.trim() };
      draft.event = { ...draft.event, eventDate: nodes.eventDate.value };
      AYA.saveDraft(draft);
    };

    const toast = (message) => {
      if (typeof AYA.showToast === "function") { AYA.showToast(message); return; }
      const region = $("[data-toast-region]");
      if (!region) return;
      const node = document.createElement("div");
      node.className = "toast";
      node.textContent = message;
      region.appendChild(node);
      setTimeout(() => node.remove(), 3200);
    };

    const imageSrc = (product) => product.image || product.placeholder || "assets/visual/product-placeholder.svg";

    const benefitCopy = (units) => {
      if (units >= 100) return "100+ pcs · hingga Rp50.000";
      if (units >= 50) return "50–99 pcs · hingga Rp25.000";
      return "Belum ada benefit ongkir";
    };

    const summaryMarkup = (mobile = false) => {
      const money = financials();
      const core = `<div class="sum-row"><span>Subtotal Produk</span><strong>${format(money.subtotal)}</strong></div><div class="sum-row"><span>Biaya Pengiriman</span><strong>${format(money.shipping)}</strong></div><div class="benefit"><div><strong>Benefit Ongkir</strong><small>${benefitCopy(money.units)}</small></div><strong>${money.benefit ? `− ${format(money.benefit)}` : format(0)}</strong></div>`;
      return `${mobile ? '<div class="summary-title">Ringkasan Pesanan</div>' : ""}${core}${mobile ? `<div class="grand-total"><span>Total Pembayaran</span><strong>${format(money.total)}</strong></div>` : ""}`;
    };

    const emptyMarkup = () => '<div class="empty-cart"><div><strong>Keranjangmu masih kosong</strong><p>Pilih produk AYA yang ingin kamu nikmati, lalu tambahkan ke keranjang.</p><a href="products.html">Jelajahi Produk</a></div></div>';

    const renderItem = ({ product, variant, quantity, subtotal }) => {
      const rules = AYA.quantityRules(product);
      return `<article class="item" data-product="${AYA.escapeHTML(product.id)}" data-variant="${AYA.escapeHTML(variant.name)}">
        <div class="product"><div class="thumb"><img src="${AYA.escapeHTML(imageSrc(product))}" alt="${AYA.escapeHTML(product.name)}" data-image-fallback="${AYA.escapeHTML(product.id)}"></div><div><div class="pname">${AYA.escapeHTML(product.name)}</div><div class="pline">${AYA.escapeHTML(product.line)}</div></div></div>
        <button class="variant-btn" type="button" data-variant-trigger="${AYA.escapeHTML(product.id)}" data-current-variant="${AYA.escapeHTML(variant.name)}">${AYA.escapeHTML(variant.name)}</button>
        <div class="unit">${format(variant.price)}</div>
        <div class="qty"><div class="stepper"><button type="button" data-minus="${AYA.escapeHTML(product.id)}" data-variant="${AYA.escapeHTML(variant.name)}" aria-label="Kurangi jumlah">−</button><span>${quantity}</span><button type="button" data-plus="${AYA.escapeHTML(product.id)}" data-variant="${AYA.escapeHTML(variant.name)}" aria-label="Tambah jumlah">+</button></div></div>
        <div class="subtotal">${format(subtotal)}</div>
        <button class="trash" type="button" data-remove="${AYA.escapeHTML(product.id)}" data-variant="${AYA.escapeHTML(variant.name)}" aria-label="Hapus ${AYA.escapeHTML(product.name)} ${AYA.escapeHTML(variant.name)}">×</button>
        <span class="sr-only">Aturan jumlah: minimum ${rules.min}, maksimum ${rules.max}, kelipatan ${rules.step}.</span>
      </article>`;
    };

    const renderPayment = () => {
      const money = financials();
      nodes.paymentProducts.innerHTML = details().map(({ product, variant, quantity, subtotal }) => `<div class="pay-item"><img src="${AYA.escapeHTML(imageSrc(product))}" alt="${AYA.escapeHTML(product.name)}" data-image-fallback="${AYA.escapeHTML(product.id)}"><div><strong>${AYA.escapeHTML(product.name)}</strong><small>${AYA.escapeHTML(variant.name)} · ${quantity} pcs</small></div><div class="price">${format(subtotal)}</div></div>`).join("");
      nodes.paymentBreakdown.innerHTML = `<div class="sum-row"><span>Subtotal Produk</span><strong>${format(money.subtotal)}</strong></div><div class="sum-row"><span>Biaya Pengiriman</span><strong>${format(money.shipping)}</strong></div><div class="benefit"><div><strong>Benefit Ongkir</strong><small>${benefitCopy(money.units)}</small></div><strong>${money.benefit ? `− ${format(money.benefit)}` : format(0)}</strong></div>`;
      nodes.paymentTotalLeft.textContent = format(money.total);
      nodes.paymentTotalMobile.textContent = format(money.total);
    };

    const render = () => {
      const items = details();
      const raw = typeof AYA.getCart === "function" ? AYA.getCart() : [];
      const invalidCount = Math.max(0, raw.length - items.length);
      nodes.cartGrid.classList.toggle("empty", items.length === 0);
      nodes.items.innerHTML = items.length ? items.map(renderItem).join("") : emptyMarkup();
      const money = financials();
      nodes.itemCount.textContent = `${items.length} item`;
      nodes.unitCount.textContent = `${money.units} pcs`;
      nodes.miniItems.textContent = `${items.length} item`;
      nodes.miniUnits.textContent = `${money.units} pcs`;
      nodes.desktopSummary.innerHTML = summaryMarkup(false);
      nodes.desktopTotal.textContent = format(money.total);
      nodes.mobileSummary.innerHTML = summaryMarkup(true);
      renderPayment();
      if (invalidCount) toast(`${invalidCount} item keranjang tidak lagi valid dan tidak ditampilkan.`);
      if (!items.length) nodes.cartGrid.classList.remove("info-mode");
    };

    const openVariantSheet = (productId, currentVariant) => {
      const product = AYA.getProduct(productId);
      if (!product || !Array.isArray(product.variants)) return;
      activeVariant = { productId, currentVariant };
      nodes.variantOptions.innerHTML = product.variants.map((option) => `<button class="variant-option ${option.name === currentVariant ? "active" : ""}" type="button" data-set-variant="${AYA.escapeHTML(option.name)}"><span>${AYA.escapeHTML(option.name)}</span><small>${format(option.price)} / unit</small></button>`).join("");
      nodes.sheet.classList.add("open");
      nodes.sheet.setAttribute("aria-hidden", "false");
    };

    const closeVariantSheet = () => {
      activeVariant = null;
      nodes.sheet.classList.remove("open");
      nodes.sheet.setAttribute("aria-hidden", "true");
    };

    nodes.items.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-variant-trigger]");
      if (trigger) { openVariantSheet(trigger.dataset.variantTrigger, trigger.dataset.currentVariant); return; }
      const remove = event.target.closest("[data-remove]");
      if (remove) { AYA.removeCartItem(remove.dataset.remove, remove.dataset.variant); render(); return; }
      const minus = event.target.closest("[data-minus]");
      const plus = event.target.closest("[data-plus]");
      const control = minus || plus;
      if (!control) return;
      const productId = control.dataset.minus || control.dataset.plus;
      const product = AYA.getProduct(productId);
      const item = details().find((entry) => entry.product.id === productId && entry.variant.name === control.dataset.variant);
      if (!product || !item) return;
      const rules = AYA.quantityRules(product);
      const next = Number(item.quantity) + (plus ? rules.step : -rules.step);
      AYA.updateCartItem(productId, control.dataset.variant, next);
      render();
    });

    nodes.variantOptions.addEventListener("click", (event) => {
      const option = event.target.closest("[data-set-variant]");
      if (!option || !activeVariant) return;
      AYA.changeCartVariant(activeVariant.productId, activeVariant.currentVariant, option.dataset.setVariant);
      closeVariantSheet();
      render();
    });
    $("#closeSheet").addEventListener("click", closeVariantSheet);
    nodes.sheet.addEventListener("click", (event) => { if (event.target === nodes.sheet) closeVariantSheet(); });

    const setContext = (value, updateUrl = true) => {
      draft.context = value === "event" ? "event" : "personal";
      $$('[data-context]').forEach((button) => {
        const active = (button.dataset.context === "event") === (draft.context === "event");
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      nodes.eventBox.hidden = draft.context !== "event";
      if (updateUrl) {
        const url = new URL(location.href);
        url.search = "";
        url.searchParams.set("context", draft.context);
        history.replaceState({}, "", url);
      }
      saveDraft();
    };

    $$('[data-context]').forEach((button) => button.addEventListener("click", () => setContext(button.dataset.context)));
    $$('[data-receive]').forEach((button) => button.addEventListener("click", () => {
      draft.event.beforeEvent = button.dataset.receive;
      $$('[data-receive]').forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      saveDraft();
    }));

    const setLocationStatus = () => {
      const confirmed = Boolean(draft.shipping?.confirmed && Number.isFinite(Number(draft.shipping?.lat)) && Number.isFinite(Number(draft.shipping?.lng)));
      nodes.locationStatus.textContent = confirmed ? "Lokasi dikonfirmasi" : "Lokasi belum dikonfirmasi";
      nodes.locationStatus.classList.toggle("confirmed", confirmed);
    };

    $("#useLocation").addEventListener("click", () => {
      if (!navigator.geolocation) { toast("Perangkat ini tidak menyediakan akses lokasi. Tulis alamat dengan jelas beserta patokan."); return; }
      $("#useLocation").disabled = true;
      navigator.geolocation.getCurrentPosition((position) => {
        draft.shipping = { ...draft.shipping, lat: position.coords.latitude, lng: position.coords.longitude, confirmed: true, source: "gps" };
        saveDraft(); setLocationStatus(); $("#useLocation").disabled = false; toast("Lokasi berhasil dikonfirmasi.");
      }, () => {
        draft.shipping = { ...draft.shipping, lat: null, lng: null, confirmed: false, source: "address" };
        saveDraft(); setLocationStatus(); $("#useLocation").disabled = false; toast("Lokasi belum dapat dikonfirmasi. Mohon tulis alamat dengan jelas beserta patokan.");
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    });

    $("#mapLocation").addEventListener("click", () => toast("Pemilihan titik peta belum aktif pada staging. Alamat tetap dapat digunakan untuk melanjutkan."));
    nodes.address.addEventListener("input", () => {
      if (draft.shipping.confirmed) draft.shipping = { ...draft.shipping, lat: null, lng: null, confirmed: false, source: "address" };
      saveDraft(); setLocationStatus();
    });
    [nodes.name, nodes.phone, nodes.notes, nodes.eventDate].forEach((field) => field.addEventListener("input", saveDraft));

    const clearInvalid = () => {
      [nodes.name, nodes.phone, nodes.address, nodes.eventDate].forEach((field) => field.removeAttribute("aria-invalid"));
      nodes.eventDateError.hidden = true;
    };
    const validPhone = (value) => /^\+?[0-9][0-9\s()-]{7,18}$/.test(value.trim());
    const validate = () => {
      clearInvalid();
      const messages = [];
      if (!details().length) messages.push("Keranjang masih kosong.");
      if (!nodes.name.value.trim()) { nodes.name.setAttribute("aria-invalid", "true"); messages.push("Nama Lengkap wajib diisi."); }
      if (!validPhone(nodes.phone.value)) { nodes.phone.setAttribute("aria-invalid", "true"); messages.push("WhatsApp belum valid."); }
      if (!nodes.address.value.trim()) { nodes.address.setAttribute("aria-invalid", "true"); messages.push("Alamat Pengiriman wajib diisi."); }
      if (draft.context === "event" && !nodes.eventDate.value) { nodes.eventDate.setAttribute("aria-invalid", "true"); nodes.eventDateError.hidden = false; messages.push("Tanggal Acara wajib diisi."); }
      if (messages.length) {
        toast(messages[0]);
        const first = $("[aria-invalid='true']");
        first?.focus({ preventScroll: true });
        return false;
      }
      return true;
    };

    const openPayment = () => {
      if (!validate()) return;
      saveDraft();
      renderPayment();
      document.body.classList.add("payment-mode");
      setMethod("qris");
    };
    $("#openPayment").addEventListener("click", openPayment);
    $$('[data-back-payment]').forEach((button) => button.addEventListener("click", () => document.body.classList.remove("payment-mode")));

    const setMethod = (next) => {
      method = next === "va" ? "va" : "qris";
      $$('[data-method]').forEach((button) => {
        const active = button.dataset.method === method;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      nodes.qrisView.hidden = method !== "qris";
      nodes.vaView.hidden = method !== "va";
    };
    $$('[data-method]').forEach((button) => button.addEventListener("click", () => setMethod(button.dataset.method)));
    $$('[data-bank]').forEach((button) => button.addEventListener("click", () => {
      $$('[data-bank]').forEach((item) => item.classList.toggle("active", item === button));
    }));

    $("#showInfo").addEventListener("click", () => nodes.cartGrid.classList.add("info-mode"));
    $("#showCart").addEventListener("click", () => nodes.cartGrid.classList.remove("info-mode"));

    window.addEventListener("aya:cart-change", render);

    nodes.name.value = draft.customer.customerName || draft.customer.eventPic || "";
    nodes.phone.value = draft.customer.whatsapp || draft.customer.eventWhatsapp || "";
    nodes.notes.value = draft.notes || "";
    nodes.address.value = draft.shipping.address || "";
    nodes.eventDate.value = draft.event.eventDate || draft.customer.eventDate || "";
    const receiveValue = draft.event.beforeEvent === "yes" ? "yes" : "no";
    $$('[data-receive]').forEach((button) => {
      const active = button.dataset.receive === receiveValue;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    draft.event.beforeEvent = receiveValue;

    setLocationStatus();
    setContext(draft.context, !requestedContext);
    setMethod("qris");
    render();

    if (config.payment?.enabled) {
      toast("Provider pembayaran belum memiliki client backend aktif pada halaman ini; status pembayaran tetap dinonaktifkan.");
    }
  });
})();

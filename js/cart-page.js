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
    let updateMobileRuntime = () => {};

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
      const escapedId = AYA.escapeHTML(product.id);
      const escapedVariant = AYA.escapeHTML(variant.name);
      const escapedName = AYA.escapeHTML(product.name);
      const escapedLine = AYA.escapeHTML(product.line);
      const image = AYA.escapeHTML(imageSrc(product));
      const desktop = `<article class="item desktop-item" data-product="${escapedId}" data-variant="${escapedVariant}">
        <div class="product"><div class="thumb"><img src="${image}" alt="${escapedName}" data-image-fallback="${escapedId}"></div><div><div class="pname">${escapedName}</div><div class="pline">${escapedLine}</div></div></div>
        <button class="variant-btn" type="button" data-variant-trigger="${escapedId}" data-current-variant="${escapedVariant}">${escapedVariant}</button>
        <div class="unit">${format(variant.price)}</div>
        <div class="qty"><div class="stepper"><button type="button" data-minus="${escapedId}" data-variant="${escapedVariant}" aria-label="Kurangi jumlah">−</button><span>${quantity}</span><button type="button" data-plus="${escapedId}" data-variant="${escapedVariant}" aria-label="Tambah jumlah">+</button></div></div>
        <div class="subtotal">${format(subtotal)}</div>
        <button class="trash" type="button" data-remove="${escapedId}" data-variant="${escapedVariant}" aria-label="Hapus ${escapedName} ${escapedVariant}">×</button>
        <span class="sr-only">Aturan jumlah: minimum ${rules.min}, maksimum ${rules.max}, kelipatan ${rules.step}.</span>
      </article>`;
      const mobile = `<article class="mobile-cart-item" data-product="${escapedId}" data-variant="${escapedVariant}">
        <div class="m-cart-thumb"><img src="${image}" alt="${escapedName}" data-image-fallback="${escapedId}"></div>
        <div class="m-cart-copy"><div class="pline">${escapedLine}</div><div class="pname">${escapedName}</div><div class="m-cart-unit">${format(variant.price)} / unit</div></div>
        <button class="m-variant-btn" type="button" data-variant-trigger="${escapedId}" data-current-variant="${escapedVariant}"><span>${escapedVariant}</span></button>
        <div class="m-cart-bottom"><div class="m-stepper"><button type="button" data-minus="${escapedId}" data-variant="${escapedVariant}" aria-label="Kurangi jumlah" ${quantity <= rules.min ? 'disabled' : ''}>−</button><span>${quantity}</span><button type="button" data-plus="${escapedId}" data-variant="${escapedVariant}" aria-label="Tambah jumlah" ${quantity >= rules.max ? 'disabled' : ''}>+</button></div><div class="m-cart-subtotal">${format(subtotal)}</div><button class="m-cart-trash" type="button" data-remove="${escapedId}" data-variant="${escapedVariant}" aria-label="Hapus ${escapedName} ${escapedVariant}">×</button></div>
      </article>`;
      return desktop + mobile;
    };

    const renderPayment = () => {
      const money = financials();
      nodes.paymentProducts.innerHTML = details().map(({ product, variant, quantity, subtotal }) => `<div class="pay-item"><img src="${AYA.escapeHTML(imageSrc(product))}" alt="${AYA.escapeHTML(product.name)}" data-image-fallback="${AYA.escapeHTML(product.id)}"><div><strong>${AYA.escapeHTML(product.name)}</strong><small>${AYA.escapeHTML(variant.name)} · ${quantity} pcs</small></div><div class="price">${format(subtotal)}</div></div>`).join("");
      nodes.paymentBreakdown.innerHTML = `<div class="sum-row"><span>Subtotal Produk</span><strong>${format(money.subtotal)}</strong></div><div class="sum-row"><span>Biaya Pengiriman</span><strong>${format(money.shipping)}</strong></div><div class="benefit"><div><strong>Benefit Ongkir</strong><small>${benefitCopy(money.units)}</small></div><strong>${money.benefit ? `− ${format(money.benefit)}` : format(0)}</strong></div>`;
      nodes.paymentTotalLeft.textContent = format(money.total);
      nodes.paymentTotalMobile.textContent = format(money.total);
      updateMobileRuntime();
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
      const mobileStatus = $("#mLocationStatus");
      if (mobileStatus) { mobileStatus.textContent = confirmed ? "Lokasi dikonfirmasi" : "Belum dipilih"; mobileStatus.classList.toggle("confirmed", confirmed); }
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


    const mobileNodes = {
      panel: $("#mobileDataPanel"), name: $("#mName"), phone: $("#mPhone"), address: $("#mAddress"), notes: $("#mNotes"),
      eventDate: $("#mEventDate"), eventBox: $("#mEventBox"), dateTrigger: $("#mEventDateTrigger"), dateValue: $("#mEventDateValue"),
      calendar: $("#mCalendarOverlay"), calendarDays: $("#mCalendarDays"), calendarTitle: $("#mCalendarTitle"), calendarPicked: $("#mCalendarPicked")
    };
    const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    let calendarView = { year: new Date().getFullYear(), month: new Date().getMonth() };
    let calendarSelection = "";

    const syncValueClass = (field) => field?.classList.toggle("has-value", Boolean(String(field.value || "").trim()));
    const syncMobileToDesktop = () => {
      nodes.name.value = mobileNodes.name.value;
      nodes.phone.value = mobileNodes.phone.value;
      nodes.address.value = mobileNodes.address.value;
      nodes.notes.value = mobileNodes.notes.value;
      nodes.eventDate.value = mobileNodes.eventDate.value;
      saveDraft();
    };
    const syncMobileFromDraft = () => {
      mobileNodes.name.value = draft.customer.customerName || draft.customer.eventPic || "";
      mobileNodes.phone.value = draft.customer.whatsapp || draft.customer.eventWhatsapp || "";
      mobileNodes.address.value = draft.shipping.address || "";
      mobileNodes.notes.value = draft.notes || "";
      mobileNodes.eventDate.value = draft.event.eventDate || draft.customer.eventDate || "";
      [mobileNodes.name,mobileNodes.phone,mobileNodes.address,mobileNodes.notes].forEach(syncValueClass);
      syncMobileDateTrigger();
    };
    const syncMobileContext = () => {
      $$('[data-mobile-context]').forEach((button) => {
        const active = (button.dataset.mobileContext === "event") === (draft.context === "event");
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      mobileNodes.eventBox.hidden = draft.context !== "event";
      const copy = $("#mContextCopy");
      if (copy) copy.textContent = draft.context === "event" ? "Untuk pesanan yang terkait tanggal acara tertentu." : "Untuk kebutuhan pribadi atau rumah tanpa tanggal acara khusus.";
      $$('[data-mobile-receive]').forEach((button) => {
        const active = button.dataset.mobileReceive === (draft.event.beforeEvent === "yes" ? "yes" : "no");
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    };
    const setMobileError = (field, errorId, invalid) => {
      field.classList.toggle("invalid", invalid);
      const error = $(errorId);
      error?.classList.toggle("show", invalid);
      return invalid;
    };
    const mobileBasicValidate = () => {
      const errors = [];
      if (setMobileError(mobileNodes.name, "#mNameError", !mobileNodes.name.value.trim())) errors.push(mobileNodes.name);
      if (setMobileError(mobileNodes.phone, "#mPhoneError", !validPhone(mobileNodes.phone.value))) errors.push(mobileNodes.phone);
      if (setMobileError(mobileNodes.address, "#mAddressError", !mobileNodes.address.value.trim())) errors.push(mobileNodes.address);
      if (errors.length) { errors[0].focus({ preventScroll: true }); errors[0].scrollIntoView({ block: "center", behavior: "smooth" }); return false; }
      return true;
    };

    [mobileNodes.name,mobileNodes.phone,mobileNodes.address,mobileNodes.notes].forEach((field) => field?.addEventListener("input", () => { syncValueClass(field); syncMobileToDesktop(); }));
    $$('[data-mobile-context]').forEach((button) => button.addEventListener("click", () => { syncMobileToDesktop(); setContext(button.dataset.mobileContext); syncMobileContext(); }));
    $$('[data-mobile-receive]').forEach((button) => button.addEventListener("click", () => {
      draft.event.beforeEvent = button.dataset.mobileReceive;
      $$('[data-receive]').forEach((desktopButton) => { const active = desktopButton.dataset.receive === draft.event.beforeEvent; desktopButton.classList.toggle("active", active); desktopButton.setAttribute("aria-pressed", String(active)); });
      syncMobileContext(); saveDraft();
    }));

    $("#mUseLocation")?.addEventListener("click", () => $("#useLocation")?.click());
    $("#mMapLocation")?.addEventListener("click", () => $("#mapLocation")?.click());
    $("#mShowCart")?.addEventListener("click", () => nodes.cartGrid.classList.remove("info-mode"));
    $("#mBackData")?.addEventListener("click", () => mobileNodes.panel.classList.remove("confirm-mode"));
    $("#mBackDataBottom")?.addEventListener("click", () => mobileNodes.panel.classList.remove("confirm-mode"));
    $("#mEditData")?.addEventListener("click", () => mobileNodes.panel.classList.remove("confirm-mode"));
    $("#showInfo")?.addEventListener("click", () => { syncMobileFromDraft(); syncMobileContext(); mobileNodes.panel.classList.remove("confirm-mode"); });
    $("#mToConfirm")?.addEventListener("click", () => {
      if (!mobileBasicValidate()) return;
      syncMobileToDesktop();
      $("#mVp1Status").textContent = "Lengkap";
      $("#mSummaryName").textContent = mobileNodes.name.value.trim();
      $("#mSummaryAddress").textContent = mobileNodes.address.value.trim();
      mobileNodes.panel.classList.add("confirm-mode");
      updateMobileRuntime();
    });
    $("#mOpenPayment")?.addEventListener("click", () => {
      if (draft.context === "event" && setMobileError(mobileNodes.dateTrigger, "#mEventDateError", !mobileNodes.eventDate.value)) { mobileNodes.dateTrigger.focus(); return; }
      syncMobileToDesktop();
      openPayment();
      setMobilePaymentMethod("qris");
    });

    const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const displayDate = (iso) => { if (!iso) return "Pilih tanggal acara"; const [y,m,d] = iso.split("-").map(Number); return `${String(d).padStart(2,"0")} ${monthNames[m-1].slice(0,3)} ${y}`; };
    const fullDate = (iso) => { if (!iso) return "Pilih tanggal"; const [y,m,d] = iso.split("-").map(Number); return `${d} ${monthNames[m-1]} ${y}`; };
    function syncMobileDateTrigger() {
      const hasValue = Boolean(mobileNodes.eventDate.value);
      mobileNodes.dateTrigger.classList.toggle("empty", !hasValue);
      mobileNodes.dateTrigger.classList.toggle("has-value", hasValue);
      mobileNodes.dateValue.textContent = displayDate(mobileNodes.eventDate.value);
    }
    const renderCalendar = () => {
      mobileNodes.calendarTitle.textContent = `${monthNames[calendarView.month]} ${calendarView.year}`;
      mobileNodes.calendarPicked.textContent = fullDate(calendarSelection);
      const first = new Date(calendarView.year, calendarView.month, 1);
      const days = new Date(calendarView.year, calendarView.month + 1, 0).getDate();
      const cells = [];
      for (let i=0;i<first.getDay();i++) cells.push('<span aria-hidden="true"></span>');
      for (let day=1; day<=days; day++) { const iso = isoDate(new Date(calendarView.year, calendarView.month, day)); cells.push(`<button class="${iso === calendarSelection ? 'selected' : ''}" data-calendar-date="${iso}" type="button">${day}</button>`); }
      mobileNodes.calendarDays.innerHTML = cells.join("");
      $$('[data-calendar-date]', mobileNodes.calendarDays).forEach((button) => button.addEventListener("click", () => { calendarSelection = button.dataset.calendarDate; renderCalendar(); }));
    };
    mobileNodes.dateTrigger?.addEventListener("click", () => { const base = mobileNodes.eventDate.value || isoDate(new Date()); calendarSelection = base; const [y,m] = base.split("-").map(Number); calendarView = { year:y, month:m-1 }; renderCalendar(); mobileNodes.calendar.classList.add("open"); mobileNodes.calendar.setAttribute("aria-hidden","false"); mobileNodes.dateTrigger.setAttribute("aria-expanded","true"); });
    $("#mCalendarCancel")?.addEventListener("click", () => { mobileNodes.calendar.classList.remove("open"); mobileNodes.calendar.setAttribute("aria-hidden","true"); mobileNodes.dateTrigger.setAttribute("aria-expanded","false"); });
    $("#mCalendarApply")?.addEventListener("click", () => { mobileNodes.eventDate.value = calendarSelection; nodes.eventDate.value = calendarSelection; draft.event.eventDate = calendarSelection; saveDraft(); syncMobileDateTrigger(); setMobileError(mobileNodes.dateTrigger,"#mEventDateError",false); $("#mCalendarCancel").click(); });
    $("#mCalendarPrev")?.addEventListener("click", () => { calendarView.month--; if (calendarView.month < 0) { calendarView.month=11; calendarView.year--; } renderCalendar(); });
    $("#mCalendarNext")?.addEventListener("click", () => { calendarView.month++; if (calendarView.month > 11) { calendarView.month=0; calendarView.year++; } renderCalendar(); });
    mobileNodes.calendar?.addEventListener("click", (event) => { if (event.target === mobileNodes.calendar) $("#mCalendarCancel").click(); });

    const randomDigits = (length) => Array.from({length}, () => Math.floor(Math.random()*10)).join("");
    const bankPrefix = (bank) => ({BCA:"014",CIMB:"022",Permata:"013",BRI:"002",Mandiri:"008",BNI:"009"}[bank] || "000");
    const placeholderVa = (bank) => (bankPrefix(bank) + randomDigits(13)).match(/.{1,4}/g).join(" ");
    const setMobilePaymentMethod = (value) => {
      const qris = value !== "va";
      $$('[data-mobile-method]').forEach((button) => button.classList.toggle("active", (button.dataset.mobileMethod === "qris") === qris));
      $("#mQrisView").hidden = !qris;
      $("#mVaView").hidden = qris;
      $("#mPayHelper").textContent = qris ? "Scan QRIS menggunakan aplikasi pilihan Anda." : "Gunakan nomor Virtual Account sesuai bank pilihan Anda.";
      $("#mPaySecondary").textContent = qris ? "Download QRIS" : "Salin Nomor";
    };
    $$('[data-mobile-method]').forEach((button) => button.addEventListener("click", () => setMobilePaymentMethod(button.dataset.mobileMethod)));
    $$('[data-mobile-bank]').forEach((button) => button.addEventListener("click", () => { setMobilePaymentMethod("va"); $$('[data-mobile-bank]').forEach((item) => item.classList.toggle("active", item === button)); $("#mVaNumber").textContent = placeholderVa(button.dataset.mobileBank); $("#mVaLabel").textContent = `${button.dataset.mobileBank} · nomor placeholder visual`; }));

    updateMobileRuntime = () => {
      const entries = details();
      const money = financials();
      const countText = `${entries.length} item · ${money.units} pcs`;
      if ($("#mMiniMeta")) $("#mMiniMeta").textContent = countText;
      if ($("#mConfirmCount")) $("#mConfirmCount").textContent = countText;
      if ($("#mConfirmProducts")) $("#mConfirmProducts").textContent = entries.slice(0,2).map((entry) => entry.product.name).join(" + ") || "—";
      if ($("#mConfirmSubtotal")) $("#mConfirmSubtotal").textContent = format(money.subtotal);
      if ($("#mConfirmShipping")) $("#mConfirmShipping").textContent = format(money.shipping);
      if ($("#mConfirmTotal")) $("#mConfirmTotal").textContent = format(money.total);
      if ($("#mPaymentTotal")) $("#mPaymentTotal").textContent = format(money.total);
      const benefitRow = $("#mConfirmBenefitRow");
      if (benefitRow) { benefitRow.hidden = !money.benefit; if ($("#mConfirmBenefit")) $("#mConfirmBenefit").textContent = money.benefit ? `− ${format(money.benefit)}` : format(0); }
    };

    if (window.visualViewport) {
      const baseline = Math.max(document.documentElement.clientHeight, window.innerHeight);
      const syncMobileViewport = () => { const h = window.visualViewport.height; document.documentElement.style.setProperty("--b2c-mobile-h", baseline - h > 120 ? `${Math.round(h)}px` : "100svh"); };
      window.visualViewport.addEventListener("resize", syncMobileViewport);
      window.visualViewport.addEventListener("scroll", syncMobileViewport);
    }

    window.addEventListener("aya:cart-change", render);
    window.addEventListener("aya:cart-change", updateMobileRuntime);

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
    syncMobileFromDraft();
    syncMobileContext();
    setMobilePaymentMethod("qris");
    render();
    updateMobileRuntime();

    if (config.payment?.enabled) {
      toast("Provider pembayaran belum memiliki client backend aktif pada halaman ini; status pembayaran tetap dinonaktifkan.");
    }
  });
})();

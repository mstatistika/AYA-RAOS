(function () {
  "use strict";

  const STORAGE_KEY = "ayaRaos.businessDraft.v3";
  const SCHEMA_VERSION = 3;
  const CADENCES = Object.freeze([
    Object.freeze({ code: "W1", label: "1 minggu" }),
    Object.freeze({ code: "W2", label: "2 minggu" }),
    Object.freeze({ code: "M1", label: "1 bulan" }),
    Object.freeze({ code: "M2", label: "2 bulan" })
  ]);
  const FIELD_NAMES = Object.freeze(["company", "context", "pic", "whatsapp", "email", "neededDate", "location", "notes", "consent"]);
  const REQUIRED_FIELDS = Object.freeze(["company", "context", "pic", "whatsapp", "neededDate", "location", "consent"]);

  const supply = window.AYA_BUSINESS_SUPPLY || { products: {} };
  const catalog = Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : [];
  const catalogById = new Map(catalog.map((product) => [product.id, product]));
  const supplyIds = Object.keys((supply && supply.products) || {});
  const products = supplyIds.map((id) => catalogById.get(id)).filter(Boolean);
  const productById = new Map(products.map((product) => [product.id, product]));

  const state = {
    schemaVersion: SCHEMA_VERSION,
    rows: [],
    fields: Object.fromEntries(FIELD_NAMES.map((name) => [name, name === "consent" ? false : ""])),
    desktopStage: "input",
    mobileStage: "product",
    status: { kind: "idle", response: null }
  };

  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const qs = (selector, root = document) => root.querySelector(selector);
  const cadenceByCode = (code) => CADENCES.find((item) => item.code === code) || CADENCES[0];
  const isPersistenceEnabled = () => Boolean(window.AYA_CONFIG?.businessSupply?.persistence);

  function getSupplyMeta(productId) {
    return supply.products?.[productId] || null;
  }

  function variantsFor(productId) {
    const supplyMeta = getSupplyMeta(productId);
    const names = Object.keys(supplyMeta?.variants || {});
    if (names.length) return names;
    const product = productById.get(productId);
    return Array.isArray(product?.variants) ? product.variants.map((variant) => variant.name).filter(Boolean) : [];
  }

  function unitFor(productId, variant) {
    return getSupplyMeta(productId)?.variants?.[variant]?.defaultUnit || "Unit";
  }

  function makeRow(productId) {
    const selectedId = productId && productById.has(productId) ? productId : products[0]?.id || "";
    const variants = variantsFor(selectedId);
    const variant = variants[0] || "";
    return {
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId: selectedId,
      variant,
      quantity: 1,
      cadence: "W1"
    };
  }

  function normalizeRow(row) {
    const productId = productById.has(row?.productId) ? row.productId : products[0]?.id || "";
    const variants = variantsFor(productId);
    const variant = variants.includes(row?.variant) ? row.variant : variants[0] || "";
    const quantity = Number.isFinite(Number(row?.quantity)) ? Math.max(1, Math.round(Number(row.quantity))) : 1;
    const cadence = CADENCES.some((item) => item.code === row?.cadence) ? row.cadence : "W1";
    return { id: row?.id || makeRow(productId).id, productId, variant, quantity, cadence };
  }

  function restoreDraft() {
    if (!isPersistenceEnabled()) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.schemaVersion !== SCHEMA_VERSION) return;
      if (Array.isArray(parsed.rows)) state.rows = parsed.rows.map(normalizeRow).filter((row) => row.productId);
      if (parsed.fields && typeof parsed.fields === "object") {
        FIELD_NAMES.forEach((name) => {
          if (name in parsed.fields) state.fields[name] = name === "consent" ? Boolean(parsed.fields[name]) : String(parsed.fields[name] ?? "");
        });
      }
    } catch (error) {
      console.warn("AYA Pasokan draft restore failed", error);
    }
  }

  function persistDraft() {
    if (!isPersistenceEnabled()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, rows: state.rows, fields: state.fields }));
    } catch (error) {
      console.warn("AYA Pasokan draft save failed", error);
    }
  }

  function ensureInitialRow() {
    if (!state.rows.length && products.length) state.rows.push(makeRow(products[0].id));
  }

  function productImage(product) {
    return product?.image || product?.placeholder || "assets/placeholders/product-placeholder.svg";
  }

  function productLine(product) {
    return product?.line || "AYA RAOS";
  }

  function setDataState(message) {
    qsa("[data-business-data-state]").forEach((element) => {
      element.hidden = !message;
      element.textContent = message || "";
    });
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function optionHtml(value, label, selected) {
    return `<option value="${escapeHtml(value)}"${selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function renderDesktopRow(row) {
    const product = productById.get(row.productId);
    if (!product) return "";
    const variants = variantsFor(row.productId);
    const variantOptions = variants.map((name) => optionHtml(name, name, name === row.variant)).join("");
    const cadenceOptions = CADENCES.map((item) => optionHtml(item.code, item.label, item.code === row.cadence)).join("");
    return `<article class="business-product-row" data-business-row="${escapeHtml(row.id)}">
      <img class="business-product-thumb" src="${escapeHtml(productImage(product))}" alt="" loading="lazy">
      <div class="business-product-copy"><small>${escapeHtml(productLine(product))}</small><strong>${escapeHtml(product.name)}</strong></div>
      <select class="business-control" data-row-field="variant" aria-label="Varian ${escapeHtml(product.name)}">${variantOptions}</select>
      <div class="business-qty"><button type="button" data-row-qty="-1" aria-label="Kurangi jumlah">−</button><input type="number" min="1" step="1" inputmode="numeric" value="${row.quantity}" data-row-field="quantity" aria-label="Perkiraan jumlah ${escapeHtml(product.name)}"><button type="button" data-row-qty="1" aria-label="Tambah jumlah">＋</button></div>
      <select class="business-control" data-row-field="cadence" aria-label="Ritme ${escapeHtml(product.name)}">${cadenceOptions}</select>
      <button class="business-remove" type="button" data-row-remove aria-label="Hapus ${escapeHtml(product.name)}">×</button>
    </article>`;
  }

  function renderMobileRow(row) {
    const product = productById.get(row.productId);
    if (!product) return "";
    const variants = variantsFor(row.productId);
    const variantOptions = variants.map((name) => optionHtml(name, name, name === row.variant)).join("");
    const cadenceOptions = CADENCES.map((item) => optionHtml(item.code, item.label, item.code === row.cadence)).join("");
    return `<article class="business-mobile-product" data-business-row="${escapeHtml(row.id)}">
      <div class="business-mobile-product-top"><img class="business-product-thumb" src="${escapeHtml(productImage(product))}" alt="" loading="lazy"><div class="business-mobile-product-name"><small>${escapeHtml(productLine(product))}</small><strong>${escapeHtml(product.name)}</strong></div><select class="business-control" data-row-field="variant" aria-label="Varian ${escapeHtml(product.name)}">${variantOptions}</select></div>
      <div class="business-mobile-product-bottom"><div class="business-qty"><button type="button" data-row-qty="-1" aria-label="Kurangi jumlah">−</button><input type="number" min="1" step="1" inputmode="numeric" value="${row.quantity}" data-row-field="quantity" aria-label="Perkiraan jumlah ${escapeHtml(product.name)}"><button type="button" data-row-qty="1" aria-label="Tambah jumlah">＋</button></div><select class="business-control" data-row-field="cadence" aria-label="Ritme ${escapeHtml(product.name)}">${cadenceOptions}</select><button class="business-remove" type="button" data-row-remove aria-label="Hapus ${escapeHtml(product.name)}">×</button></div>
    </article>`;
  }

  function renderProducts() {
    qsa('[data-business-product-list="desktop"]').forEach((list) => { list.innerHTML = state.rows.map(renderDesktopRow).join(""); });
    qsa('[data-business-product-list="mobile"]').forEach((list) => { list.innerHTML = state.rows.map(renderMobileRow).join(""); });
    setDataState(products.length ? "" : "Konfigurasi produk Pasokan belum tersedia. Coba lagi setelah data produk dipublikasikan.");
    renderProductPickers();
  }

  function renderProductPickers() {
    const selected = new Set(state.rows.map((row) => row.productId));
    const available = products.filter((product) => !selected.has(product.id));
    qsa("[data-business-product-picker]").forEach((picker) => {
      if (!available.length) {
        picker.innerHTML = '<div class="business-picker-empty">Semua produk Pasokan yang tersedia sudah ditambahkan.</div>';
        return;
      }
      picker.innerHTML = `<div class="business-picker-title">Tambah produk Pasokan</div><div class="business-picker-list">${available.map((product) => `<button type="button" data-business-pick-product="${escapeHtml(product.id)}"><img src="${escapeHtml(productImage(product))}" alt=""><span><small>${escapeHtml(productLine(product))}</small><strong>${escapeHtml(product.name)}</strong></span></button>`).join("")}</div>`;
    });
  }

  function closePickers() {
    qsa("[data-business-product-picker]").forEach((picker) => { picker.hidden = true; });
  }

  function updateRow(rowId, field, value) {
    const row = state.rows.find((item) => item.id === rowId);
    if (!row) return;
    if (field === "variant") row.variant = variantsFor(row.productId).includes(value) ? value : variantsFor(row.productId)[0] || "";
    if (field === "cadence") row.cadence = CADENCES.some((item) => item.code === value) ? value : "W1";
    if (field === "quantity") row.quantity = Math.max(1, Math.round(Number(value) || 1));
    state.status = { kind: "idle", response: null };
    persistDraft();
    renderProducts();
    renderSummaries();
    renderStatus();
  }

  function addProduct(productId) {
    if (!productById.has(productId) || state.rows.some((row) => row.productId === productId)) return;
    state.rows.push(makeRow(productId));
    state.status = { kind: "idle", response: null };
    persistDraft();
    closePickers();
    renderProducts();
    renderSummaries();
  }

  function removeProduct(rowId) {
    if (state.rows.length <= 1) return;
    state.rows = state.rows.filter((row) => row.id !== rowId);
    state.status = { kind: "idle", response: null };
    persistDraft();
    renderProducts();
    renderSummaries();
    renderStatus();
  }

  function syncField(name, value, source) {
    state.fields[name] = name === "consent" ? Boolean(value) : String(value ?? "");
    qsa(`[data-business-field="${name}"]`).forEach((field) => {
      if (field === source) return;
      if (field.type === "checkbox") field.checked = Boolean(state.fields[name]);
      else field.value = state.fields[name];
    });
    state.status = { kind: "idle", response: null };
    persistDraft();
    renderSummaries();
    renderStatus();
  }

  function hydrateFields() {
    FIELD_NAMES.forEach((name) => {
      qsa(`[data-business-field="${name}"]`).forEach((field) => {
        if (field.type === "checkbox") field.checked = Boolean(state.fields[name]);
        else field.value = state.fields[name] || "";
      });
    });
  }

  function validateEmail(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validationMessage() {
    if (!products.length) return "Produk Pasokan belum tersedia.";
    if (!state.rows.length) return "Tambahkan setidaknya satu produk.";
    if (state.rows.some((row) => !row.productId || !row.variant || row.quantity < 1 || !CADENCES.some((cadence) => cadence.code === row.cadence))) return "Periksa kembali produk, varian, jumlah, dan ritme Pasokan.";
    const missing = REQUIRED_FIELDS.filter((name) => name === "consent" ? !state.fields.consent : !String(state.fields[name] || "").trim());
    if (missing.length) return "Lengkapi informasi usaha yang wajib sebelum melanjutkan.";
    if (!validateEmail(String(state.fields.email || "").trim())) return "Periksa kembali format email yang dimasukkan.";
    return "";
  }

  function showFormError(message) {
    qsa("[data-business-form-error]").forEach((element) => {
      element.hidden = !message;
      element.textContent = message || "";
    });
    if (message) qs("[data-business-form-error]:not([hidden])")?.focus({ preventScroll: true });
  }

  function rowSummary(row) {
    const product = productById.get(row.productId);
    return {
      name: product?.name || row.productId,
      variant: row.variant,
      quantity: row.quantity,
      unit: unitFor(row.productId, row.variant),
      cadence: cadenceByCode(row.cadence)
    };
  }

  function renderSummaries() {
    const rows = state.rows.map(rowSummary);
    qsa('[data-business-summary-products="desktop"]').forEach((target) => {
      target.innerHTML = rows.map((item) => `<div class="business-summary-row"><span>${escapeHtml(item.name)} · ${escapeHtml(item.variant)}</span><b>${item.quantity} · ${escapeHtml(item.cadence.label)}</b></div>`).join("");
    });
    qsa('[data-business-summary-products="mobile"]').forEach((target) => {
      target.innerHTML = rows.map((item) => `<div class="business-review-line"><span>${escapeHtml(item.name)} · ${escapeHtml(item.variant)}</span><b>${item.quantity} · ${escapeHtml(item.cadence.label)}</b></div>`).join("");
    });

    const companyRows = [
      ["Usaha", state.fields.company || "—"], ["Konteks", state.fields.context || "—"], ["PIC", state.fields.pic || "—"],
      ["WhatsApp", state.fields.whatsapp || "—"], ["Mulai", state.fields.neededDate || "—"], ["Lokasi", firstLine(state.fields.location) || "—"]
    ];
    qsa('[data-business-summary-company="desktop"]').forEach((target) => {
      target.innerHTML = companyRows.map(([label, value]) => `<div class="business-summary-row"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("");
    });
    const mobileCompany = [
      ["Usaha", state.fields.company || "—"],
      ["PIC / WhatsApp", [state.fields.pic, maskPhone(state.fields.whatsapp)].filter(Boolean).join(" · ") || "—"],
      ["Mulai / Lokasi", [state.fields.neededDate, firstLine(state.fields.location)].filter(Boolean).join(" · ") || "—"]
    ];
    qsa('[data-business-summary-company="mobile"]').forEach((target) => {
      target.innerHTML = mobileCompany.map(([label, value]) => `<div class="business-review-line"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("");
    });
  }

  function firstLine(value) {
    return String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
  }

  function maskPhone(value) {
    const compact = String(value || "").replace(/\s+/g, "");
    if (compact.length <= 8) return compact;
    return `${compact.slice(0, 4)}…${compact.slice(-4)}`;
  }

  function payload() {
    return {
      schemaVersion: SCHEMA_VERSION,
      products: state.rows.map((row) => ({
        productId: row.productId,
        variant: row.variant,
        quantity: row.quantity,
        unit: unitFor(row.productId, row.variant),
        cadence: row.cadence
      })),
      company: {
        name: String(state.fields.company || "").trim(),
        context: String(state.fields.context || "").trim(),
        pic: String(state.fields.pic || "").trim(),
        whatsapp: String(state.fields.whatsapp || "").trim(),
        email: String(state.fields.email || "").trim() || null,
        neededDate: String(state.fields.neededDate || "").trim(),
        location: String(state.fields.location || "").trim(),
        notes: String(state.fields.notes || "").trim() || null
      }
    };
  }

  function qualificationEndpoint() {
    const endpoint = window.AYA_CONFIG?.businessSupply?.qualificationEndpoint;
    return typeof endpoint === "string" && endpoint.trim() ? endpoint.trim() : "";
  }

  function safeActivationUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin) return "";
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function statusMarkup(kind, response, mobile) {
    const tag = mobile ? "div" : "section";
    if (kind === "checking") return `<${tag} class="business-status-card"><small>Status Pasokan Usaha</small><h4>Sedang memeriksa kebutuhan.</h4><p>Tunggu sebentar. Status hanya ditentukan oleh sistem Pasokan AYA.</p></${tag}>`;
    if (kind === "eligible") {
      const activationUrl = safeActivationUrl(response?.activationUrl);
      return `<${tag} class="business-status-card business-status-success"><small>Status Pasokan Usaha</small><h4>Bisa dilanjutkan sebagai Pasokan Usaha.</h4><p>${escapeHtml(response?.message || "Kebutuhan yang dimasukkan dapat melanjutkan proses Pasokan Usaha.")}</p>${activationUrl ? `<a class="business-primary business-status-action" href="${escapeHtml(activationUrl)}">Aktivasi Akun Pasokan →</a>` : '<div class="business-status-guidance">Aktivasi akun belum tersedia dari website ini. Tidak ada akun atau komitmen yang dibuat sebelum layanan aktivasi terhubung.</div>'}</${tag}>`;
    }
    if (kind === "adjust") {
      const reasons = Array.isArray(response?.reasons) ? response.reasons.filter(Boolean) : [];
      return `<${tag} class="business-status-card business-status-adjust"><small>Status Pasokan Usaha</small><h4>Kebutuhan masih perlu disesuaikan.</h4><p>${escapeHtml(response?.message || "Ada bagian kebutuhan yang belum masuk kriteria Pasokan Usaha pada ritme yang dipilih.")}</p>${reasons.length ? `<ul>${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>` : ""}<button class="business-secondary business-status-action" type="button" data-business-adjust>Sesuaikan kebutuhan</button></${tag}>`;
    }
    if (kind === "error") return `<${tag} class="business-status-card business-status-adjust"><small>Status Pasokan Usaha</small><h4>Status belum bisa diperiksa.</h4><p>${escapeHtml(response?.message || "Sistem pemeriksaan status Pasokan belum dapat dihubungi. Data yang kamu isi tetap dapat diperiksa kembali nanti.")}</p></${tag}>`;
    return `<${tag} class="business-status-card"><small>Status Pasokan Usaha</small><h4>Periksa status kebutuhan.</h4><p>Sistem akan memeriksa apakah kebutuhan ini dapat dilanjutkan sebagai Pasokan Usaha. Hasil tidak dihitung dari browser.</p>${mobile ? "" : '<button class="business-primary business-status-action" type="button" data-business-check-status>Periksa Status Pasokan →</button>'}</${tag}>`;
  }

  function renderStatus() {
    qsa('[data-business-status-panel="desktop"]').forEach((target) => { target.innerHTML = statusMarkup(state.status.kind, state.status.response, false); });
    qsa('[data-business-status-panel="mobile"]').forEach((target) => { target.innerHTML = statusMarkup(state.status.kind, state.status.response, true); });
  }

  async function checkStatus() {
    const message = validationMessage();
    if (message) {
      showFormError(message);
      showDesktopStage("input");
      showMobileStage("contact");
      return;
    }
    const endpoint = qualificationEndpoint();
    if (!endpoint) {
      state.status = { kind: "error", response: { message: "Pemeriksaan status Pasokan belum tersedia pada website saat ini. Tidak ada hasil yang dibuat dari browser." } };
      renderStatus();
      return;
    }
    state.status = { kind: "checking", response: null };
    renderStatus();
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload())
      });
      if (!response.ok) throw new Error(`Qualification HTTP ${response.status}`);
      const data = await response.json();
      if (data?.status === "eligible") state.status = { kind: "eligible", response: data };
      else if (data?.status === "adjust") state.status = { kind: "adjust", response: data };
      else throw new Error("Qualification response status is invalid");
    } catch (error) {
      console.error("AYA Pasokan qualification failed", error);
      state.status = { kind: "error", response: { message: "Sistem pemeriksaan status Pasokan belum dapat dihubungi. Silakan coba kembali nanti." } };
    }
    renderStatus();
  }

  function showDesktopStage(name) {
    state.desktopStage = name;
    qsa("[data-business-desktop-stage]").forEach((element) => { element.hidden = element.dataset.businessDesktopStage !== name; });
    if (name === "summary") { renderSummaries(); renderStatus(); }
  }

  function showMobileStage(name) {
    state.mobileStage = name;
    qsa("[data-business-mobile-state]").forEach((element) => { element.hidden = element.dataset.businessMobileState !== name; });
    if (name === "summary") { renderSummaries(); renderStatus(); }
    if (window.matchMedia("(max-width: 900px)").matches) qs("#kebutuhan-pasokan")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function moveToSummary() {
    const message = validationMessage();
    showFormError(message);
    if (message) return false;
    showDesktopStage("summary");
    showMobileStage("summary");
    return true;
  }

  function showLocationState(message) {
    qsa("[data-business-location-state]").forEach((element) => { element.hidden = !message; element.textContent = message || ""; });
  }

  function useLocation() {
    if (!navigator.geolocation) {
      showLocationState("Lokasi perangkat tidak tersedia. Isi alamat secara manual.");
      return;
    }
    showLocationState("Meminta lokasi perangkat…");
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
      const current = String(state.fields.location || "").trim();
      const value = current ? `${current}\nKoordinat: ${coords}` : `Koordinat: ${coords}`;
      syncField("location", value, null);
      showLocationState("Koordinat lokasi sudah ditambahkan. Lengkapi alamat atau patokan bila diperlukan.");
    }, () => showLocationState("Lokasi perangkat tidak dapat dibaca. Isi alamat secara manual."), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  function bind() {
    document.addEventListener("click", (event) => {
      const add = event.target.closest("[data-business-add-product]");
      if (add) {
        const picker = add.closest(".business-product-panel, .business-mobile-state")?.querySelector("[data-business-product-picker]");
        if (picker) picker.hidden = !picker.hidden;
        return;
      }
      const pick = event.target.closest("[data-business-pick-product]");
      if (pick) { addProduct(pick.dataset.businessPickProduct); return; }
      const rowElement = event.target.closest("[data-business-row]");
      if (rowElement) {
        const rowId = rowElement.dataset.businessRow;
        const qtyButton = event.target.closest("[data-row-qty]");
        if (qtyButton) {
          const row = state.rows.find((item) => item.id === rowId);
          if (row) updateRow(rowId, "quantity", row.quantity + Number(qtyButton.dataset.rowQty));
          return;
        }
        if (event.target.closest("[data-row-remove]")) { removeProduct(rowId); return; }
      }
      if (event.target.closest("[data-business-to-summary]")) { moveToSummary(); return; }
      if (event.target.closest("[data-business-back-input]")) { showDesktopStage("input"); return; }
      const mobileNext = event.target.closest("[data-business-mobile-next]");
      if (mobileNext) {
        if (mobileNext.dataset.businessMobileNext === "summary") {
          const message = validationMessage(); showFormError(message); if (message) return;
        }
        showMobileStage(mobileNext.dataset.businessMobileNext); return;
      }
      const mobileBack = event.target.closest("[data-business-mobile-back]");
      if (mobileBack) { showMobileStage(mobileBack.dataset.businessMobileBack); return; }
      if (event.target.closest("[data-business-check-status]")) { checkStatus(); return; }
      if (event.target.closest("[data-business-adjust]")) { showDesktopStage("input"); showMobileStage("product"); return; }
      if (event.target.closest("[data-business-use-location]")) { useLocation(); return; }
      if (event.target.closest("[data-business-map-point]")) { showLocationState("Pemilihan titik di peta belum tersedia. Isi alamat atau gunakan Lokasi Saya."); return; }
    });

    document.addEventListener("input", (event) => {
      const field = event.target.closest("[data-business-field]");
      if (field) syncField(field.dataset.businessField, field.type === "checkbox" ? field.checked : field.value, field);
      const rowElement = event.target.closest("[data-business-row]");
      const rowField = event.target.closest("[data-row-field]");
      if (rowElement && rowField) updateRow(rowElement.dataset.businessRow, rowField.dataset.rowField, rowField.value);
    });
    document.addEventListener("change", (event) => {
      const field = event.target.closest("[data-business-field]");
      if (field) syncField(field.dataset.businessField, field.type === "checkbox" ? field.checked : field.value, field);
      const rowElement = event.target.closest("[data-business-row]");
      const rowField = event.target.closest("[data-row-field]");
      if (rowElement && rowField) updateRow(rowElement.dataset.businessRow, rowField.dataset.rowField, rowField.value);
    });

    qsa(".business-scroll-cue").forEach((link) => link.addEventListener("click", (event) => {
      const target = qs(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }));
  }

  restoreDraft();
  ensureInitialRow();
  hydrateFields();
  renderProducts();
  renderSummaries();
  renderStatus();
  bind();
})();

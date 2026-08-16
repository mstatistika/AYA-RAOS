(() => {
  "use strict";

  const STORAGE_KEY = "ayaRaos.businessDraft.v2";
  const SCHEMA_VERSION = 2;
  const FREQUENCIES = Object.freeze([
    "Setiap hari",
    "Setiap minggu",
    "Setiap 2 minggu",
    "Setiap bulan",
    "Lainnya"
  ]);

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const asText = (value) => String(value == null ? "" : value).trim();
  const escapeHTML = (value) => window.AYA?.escapeHTML
    ? window.AYA.escapeHTML(value)
    : String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[char]);

  document.addEventListener("DOMContentLoaded", () => {
    const productState = qs("#productState");
    const productList = qs("[data-business-product-list]");
    const addProductButton = qs("[data-business-add-product]");
    const picker = qs("[data-business-product-picker]");
    const dataState = qs("[data-business-data-state]");
    const productError = qs("[data-business-product-error]");
    const contactForm = qs("[data-business-contact-form]");
    const contactError = qs("[data-business-contact-error]");
    const reviewState = qs("[data-business-review-state]");
    const reviewError = qs("[data-business-review-error]");
    const reviewConsent = qs("[data-business-review-consent]");
    const summaryList = qs("[data-business-summary-list]");
    const contactSummary = qs("[data-business-contact-summary]");
    const toContactButton = qs("[data-business-to-contact]");
    const toReviewButton = qs("[data-business-to-review]");
    const backProductsButton = qs("[data-business-back-products]");
    const backContactButton = qs("[data-business-back-contact]");
    const storySteps = qsa("[data-business-story-step]");
    const submitButton = qs("[data-submit-business]");

    if (!productState || !productList || !addProductButton || !picker || !contactForm || !reviewState) return;

    const AYA = window.AYA;
    const supply = window.AYA_BUSINESS_SUPPLY;
    let storageAvailable = true;
    let items = [];

    const showState = (message, kind = "info") => {
      if (!dataState) return;
      dataState.hidden = !message;
      dataState.className = `business-product-data-state ${kind === "error" ? "is-error" : ""}`.trim();
      dataState.textContent = message || "";
    };

    const showError = (node, messages) => {
      if (!node) return;
      const list = Array.isArray(messages) ? messages.filter(Boolean) : [messages].filter(Boolean);
      node.hidden = list.length === 0;
      node.innerHTML = list.length === 0
        ? ""
        : list.length === 1
          ? escapeHTML(list[0])
          : `<strong>Periksa kembali:</strong><ul>${list.map((message) => `<li>${escapeHTML(message)}</li>`).join("")}</ul>`;
      if (list.length) node.focus({ preventScroll: true });
    };

    const CONTACT_INLINE_FIELDS = Object.freeze([
      "company",
      "pic",
      "whatsapp",
      "email",
      "neededDate",
      "location",
      "consent"
    ]);

    const resolveContactErrorField = (message) => {
      const text = String(message || "");

      if (/usaha|organisasi/i.test(text)) return "company";
      if (/\bPIC\b/i.test(text)) return "pic";
      if (/whatsapp/i.test(text)) return "whatsapp";
      if (/email/i.test(text)) return "email";
      if (/waktu mulai|target kebutuhan|tanggal/i.test(text)) {
        return "neededDate";
      }
      if (/lokasi|area/i.test(text)) return "location";
      if (/persetujuan|pemahaman|centang/i.test(text)) {
        return "consent";
      }

      return "";
    };

    const conciseContactError = (name, message) => {
      const text = String(message || "");

      if (name === "email") return "Format email tidak valid";

      if (name === "whatsapp" && !/wajib|isi/i.test(text)) {
        return "Nomor belum valid";
      }

      if (name === "consent") return "Persetujuan perlu dicentang";

      return "Wajib diisi";
    };

    const setContactInlineError = (name, message = "") => {
      const control = contactForm.elements.namedItem(name);
      if (!control) return;

      const active = Boolean(message);

      if (name === "consent") {
        const row = control.closest(".contact-consent");
        const errorNode = row?.querySelector(
          "[data-business-consent-error]"
        );

        row?.classList.toggle("is-invalid", active);

        if (errorNode) {
          errorNode.textContent = message || "";
          errorNode.hidden = !active;
        }

        if (active) {
          control.setAttribute("aria-invalid", "true");
          control.setAttribute(
            "aria-describedby",
            "business-consent-error"
          );
        } else {
          control.removeAttribute("aria-invalid");
          control.removeAttribute("aria-describedby");
        }

        return;
      }

      const field = control.closest(".field");
      const errorNode = field?.querySelector(
        `[data-business-field-error="${name}"]`
      );

      field?.classList.toggle("is-invalid", active);

      if (errorNode) {
        errorNode.textContent = message || "";
        errorNode.hidden = !active;
      }

      if (active) {
        control.setAttribute("aria-invalid", "true");
        if (errorNode?.id) {
          control.setAttribute("aria-describedby", errorNode.id);
        }
      } else {
        control.removeAttribute("aria-invalid");
        control.removeAttribute("aria-describedby");
      }
    };

    const renderContactInlineErrors = (messages = []) => {
      CONTACT_INLINE_FIELDS.forEach((name) => {
        setContactInlineError(name, "");
      });

      messages.forEach((message) => {
        const name = resolveContactErrorField(message);
        if (!name) return;

        setContactInlineError(
          name,
          conciseContactError(name, message)
        );
      });

      if (!messages.length) return;

      const firstInvalid = contactForm.querySelector(
        ".field.is-invalid input,"
        + ".field.is-invalid textarea,"
        + ".contact-consent.is-invalid input"
      );

      if (firstInvalid) {
        requestAnimationFrame(() => {
          firstInvalid.scrollIntoView({
            block: "nearest",
            behavior: "smooth"
          });
          firstInvalid.focus({ preventScroll: true });
        });
      }
    };

    const clearEditedContactError = (target) => {
      if (!target?.name) return;
      if (!CONTACT_INLINE_FIELDS.includes(target.name)) return;

      if (target.name === "consent") {
        if (target.checked) {
          setContactInlineError("consent", "");
        }
        return;
      }

      if (String(target.value || "").trim()) {
        setContactInlineError(target.name, "");
      }
    };

    contactForm.addEventListener("input", (event) => {
      clearEditedContactError(event.target);
    });

    contactForm.addEventListener("change", (event) => {
      clearEditedContactError(event.target);
    });

    const readProducts = () => {
      if (!AYA || typeof AYA.products !== "function" || typeof AYA.getProduct !== "function") return [];
      try {
        const products = AYA.products();
        return Array.isArray(products) ? products.filter((product) => product?.visible && product?.orderable) : [];
      } catch {
        return [];
      }
    };

    const allOrderable = readProducts();
    const configuredProducts = allOrderable.filter((product) => supply?.products?.[product.id]);
    const missingSupplyMetadata = allOrderable.filter((product) => !supply?.products?.[product.id]);

    const hasCoreData = Boolean(AYA && supply && Number(supply.quantityStep) > 0 && configuredProducts.length);
    if (!hasCoreData) {
      showState("Pilihan produk Pasokan Usaha belum dapat dimuat. Silakan coba kembali nanti atau hubungi AYA melalui kanal yang tersedia.", "error");
      addProductButton.disabled = true;
      if (toContactButton) toContactButton.disabled = true;
    } else if (missingSupplyMetadata.length) {
      showState("Sebagian pilihan produk belum dapat digunakan di formulir Pasokan Usaha saat ini.");
    }

    const productById = (id) => configuredProducts.find((product) => product.id === id) || null;
    const productConfig = (id) => supply?.products?.[id] || null;
    const variantConfig = (id, variant) => productConfig(id)?.variants?.[variant] || null;
    const quantityStep = () => Math.max(1, Number(supply?.quantityStep) || 5);

    const normalizedVariants = (product) => {
      const source = Array.isArray(product?.variants) ? product.variants.map((variant) => asText(variant?.name)).filter(Boolean) : [];
      if (source.length === 0) return ["Original"];
      return source;
    };

    const defaultVariant = (product) => normalizedVariants(product)[0] || "Original";

    const makeItem = (productId) => {
      const product = productById(productId);
      if (!product) return null;
      const variant = defaultVariant(product);
      const config = variantConfig(productId, variant);
      if (!config) return null;
      return {
        productId,
        variant,
        qty: quantityStep(),
        unit: asText(config.defaultUnit),
        frequency: "Setiap minggu",
        customFrequency: ""
      };
    };

    const normalizeItem = (raw) => {
      const product = productById(asText(raw?.productId));
      if (!product) return null;
      const variants = normalizedVariants(product);
      const variant = variants.includes(asText(raw?.variant)) ? asText(raw.variant) : defaultVariant(product);
      const config = variantConfig(product.id, variant);
      if (!config) return null;
      const allowedUnits = Array.isArray(config.allowedUnits) ? config.allowedUnits.map(asText).filter(Boolean) : [];
      const defaultUnit = asText(config.defaultUnit || allowedUnits[0]);
      const unit = allowedUnits.includes(asText(raw?.unit)) ? asText(raw.unit) : defaultUnit;
      const step = quantityStep();
      const rawQty = Number(raw?.qty);
      const qty = Math.max(step, Math.round((Number.isFinite(rawQty) ? rawQty : step) / step) * step);
      const frequency = FREQUENCIES.includes(asText(raw?.frequency)) ? asText(raw.frequency) : "Setiap minggu";
      return {
        productId: product.id,
        variant,
        qty,
        unit,
        frequency,
        customFrequency: frequency === "Lainnya" ? asText(raw?.customFrequency) : ""
      };
    };

    const storageRead = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (!raw || raw.schemaVersion !== SCHEMA_VERSION) return null;
        return raw;
      } catch {
        storageAvailable = false;
        return null;
      }
    };

    const contactData = () => {
      const data = Object.fromEntries(new FormData(contactForm));
      return {
        company: asText(data.company),
        pic: asText(data.pic),
        whatsapp: asText(data.whatsapp),
        email: asText(data.email),
        neededDate: asText(data.neededDate),
        location: asText(data.location),
        notes: asText(data.notes),
        consent: Boolean(data.consent)
      };
    };

    const restoreContact = (contact) => {
      if (!contact || typeof contact !== "object") return;
      ["company", "pic", "whatsapp", "email", "neededDate", "location", "notes"].forEach((name) => {
        const field = contactForm.elements.namedItem(name);
        if (field) field.value = asText(contact[name]);
      });
      const consent = contactForm.elements.namedItem("consent");
      if (consent) consent.checked = Boolean(contact.consent);
    };

    const persist = () => {
      if (!storageAvailable) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          savedAt: new Date().toISOString(),
          items,
          contact: contactData()
        }));
      } catch {
        storageAvailable = false;
        showState("Draft tidak dapat disimpan di perangkat ini. Form tetap dapat digunakan selama halaman ini terbuka.");
      }
    };

    const restore = () => {
      const draft = storageRead();
      if (!draft) return;
      const seen = new Set();
      items = (Array.isArray(draft.items) ? draft.items : [])
        .map(normalizeItem)
        .filter((item) => item && !seen.has(item.productId) && seen.add(item.productId));
      restoreContact(draft.contact);
    };

    const imageSource = (product) => asText(product?.image || product?.placeholder);
    const imageFallback = (product) => asText(product?.placeholder);

    const controlVariant = (product, item, index) => {
      const variants = normalizedVariants(product);
      if (variants.length <= 1) {
        return `<input class="control" value="${escapeHTML(item.variant)}" disabled aria-label="Varian ${escapeHTML(product.name)}">`;
      }
      return `<select class="control" data-item-index="${index}" data-item-field="variant" aria-label="Varian ${escapeHTML(product.name)}">${variants.map((variant) => `<option value="${escapeHTML(variant)}"${variant === item.variant ? " selected" : ""}>${escapeHTML(variant)}</option>`).join("")}</select>`;
    };

    const controlUnit = (product, item, index) => {
      const config = variantConfig(product.id, item.variant);
      const units = Array.isArray(config?.allowedUnits) ? config.allowedUnits.map(asText).filter(Boolean) : [];
      if (units.length <= 1) {
        return `<input class="control" value="${escapeHTML(item.unit)}" disabled aria-label="Satuan ${escapeHTML(product.name)}">`;
      }
      return `<select class="control" data-item-index="${index}" data-item-field="unit" aria-label="Satuan ${escapeHTML(product.name)}">${units.map((unit) => `<option value="${escapeHTML(unit)}"${unit === item.unit ? " selected" : ""}>${escapeHTML(unit)}</option>`).join("")}</select>`;
    };

    const controlFrequency = (product, item, index) => `
      <div class="business-frequency-control">
        <select class="control" data-item-index="${index}" data-item-field="frequency" aria-label="Frekuensi ${escapeHTML(product.name)}">
          ${FREQUENCIES.map((frequency) => `<option value="${escapeHTML(frequency)}"${frequency === item.frequency ? " selected" : ""}>${escapeHTML(frequency)}</option>`).join("")}
        </select>
        ${item.frequency === "Lainnya" ? `<input class="control business-custom-frequency" data-item-index="${index}" data-item-field="customFrequency" value="${escapeHTML(item.customFrequency)}" placeholder="Contoh: tiap 10 hari" aria-label="Frekuensi lain ${escapeHTML(product.name)}">` : ""}
      </div>`;

    const renderProducts = () => {
      if (!hasCoreData) {
        productList.innerHTML = "";
        return;
      }
      if (!items.length) {
        productList.innerHTML = `<div class="business-product-empty"><strong>Belum ada produk dipilih.</strong><span>Gunakan “Tambah produk” untuk mulai menyusun kebutuhan pasokan.</span></div>`;
      } else {
        productList.innerHTML = items.map((item, index) => {
          const product = productById(item.productId);
          const src = imageSource(product);
          const fallback = imageFallback(product);
          return `<div class="prow" data-product-row="${escapeHTML(product.id)}">
            <div class="pid"><img class="pthumb" src="${escapeHTML(src)}"${fallback && fallback !== src ? ` data-fallback-src="${escapeHTML(fallback)}"` : ""} alt="${escapeHTML(product.name)}"><strong>${escapeHTML(product.name)}</strong></div>
            <div>${controlVariant(product, item, index)}</div>
            <div class="qty"><button type="button" data-qty-index="${index}" data-qty-delta="-${quantityStep()}" aria-label="Kurangi perkiraan ${escapeHTML(product.name)}">−</button><input value="${item.qty}" inputmode="numeric" data-item-index="${index}" data-item-field="qty" aria-label="Perkiraan kebutuhan ${escapeHTML(product.name)}"><button type="button" data-qty-index="${index}" data-qty-delta="${quantityStep()}" aria-label="Tambah perkiraan ${escapeHTML(product.name)}">＋</button></div>
            <div>${controlUnit(product, item, index)}</div>
            <div>${controlFrequency(product, item, index)}</div>
            <button class="remove" type="button" data-remove-index="${index}" aria-label="Hapus ${escapeHTML(product.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8v10M12 8v10M16 8v10M5 6h14M9 4h6M7 6l1 15h8l1-15"/></svg></button>
          </div>`;
        }).join("");
      }
      qsa("img[data-fallback-src]", productList).forEach((image) => {
        image.addEventListener("error", () => {
          if (image.dataset.fallbackUsed === "1") return;
          image.dataset.fallbackUsed = "1";
          image.src = image.dataset.fallbackSrc;
        }, { once: true });
      });
      renderPicker();
    };

    const renderPicker = () => {
      if (!hasCoreData) return;
      const chosen = new Set(items.map((item) => item.productId));
      const available = configuredProducts.filter((product) => !chosen.has(product.id));
      picker.innerHTML = available.length
        ? `<div class="business-picker-card"><div class="business-picker-head"><strong>Pilih produk</strong><button type="button" data-close-product-picker aria-label="Tutup pilihan produk">×</button></div><div class="business-picker-options">${available.map((product) => `<button type="button" data-pick-product="${escapeHTML(product.id)}"><img src="${escapeHTML(imageSource(product))}" alt=""><span><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.line || "AYA RAOS")}</small></span></button>`).join("")}</div></div>`
        : `<div class="business-picker-card"><div class="business-picker-head"><strong>Semua produk yang tersedia sudah ditambahkan.</strong><button type="button" data-close-product-picker aria-label="Tutup pilihan produk">×</button></div></div>`;
      addProductButton.disabled = available.length === 0;
    };

    const validateProducts = () => {
      const messages = [];
      if (!hasCoreData) messages.push("Pilihan produk belum tersedia.");
      if (!items.length) messages.push("Tambahkan setidaknya satu produk yang dibutuhkan.");
      items.forEach((item) => {
        const product = productById(item.productId);
        const config = product && variantConfig(product.id, item.variant);
        const step = quantityStep();
        if (!product || !config) {
          messages.push("Ada pilihan produk atau varian yang belum dapat digunakan.");
          return;
        }
        if (!Number.isFinite(Number(item.qty)) || Number(item.qty) < step || Number(item.qty) % step !== 0) {
          messages.push(`${product.name}: perkiraan jumlah harus dalam kelipatan ${step}.`);
        }
        if (!Array.isArray(config.allowedUnits) || !config.allowedUnits.includes(item.unit)) {
          messages.push(`${product.name}: pilih satuan yang tersedia.`);
        }
        if (!FREQUENCIES.includes(item.frequency)) {
          messages.push(`${product.name}: pilih frekuensi kebutuhan.`);
        }
        if (item.frequency === "Lainnya" && !asText(item.customFrequency)) {
          messages.push(`${product.name}: jelaskan frekuensi lainnya.`);
        }
      });
      showError(productError, messages);
      return messages.length === 0;
    };

    const validateContact = () => {
      const data = contactData();
      const messages = [];
      if (!data.company) messages.push("Nama usaha atau organisasi wajib diisi.");
      if (!data.pic) messages.push("Nama PIC wajib diisi.");
      if (!data.whatsapp) messages.push("Nomor WhatsApp wajib diisi.");
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) messages.push("Format email belum valid.");
      if (!data.neededDate) messages.push("Waktu mulai atau target kebutuhan wajib diisi.");
      if (!data.location) messages.push("Lokasi pengiriman atau area wajib diisi.");
      if (!data.consent) messages.push("Pernyataan pemahaman wajib disetujui.");
      renderContactInlineErrors(messages);
      showError(contactError, messages);
      return messages.length === 0;
    };

    const frequencyLabel = (item) => item.frequency === "Lainnya" ? asText(item.customFrequency) || "Lainnya" : item.frequency;

    const renderReview = () => {
      summaryList.innerHTML = items.map((item) => {
        const product = productById(item.productId);
        const src = imageSource(product);
        return `<div class="sum"><img src="${escapeHTML(src)}" alt="${escapeHTML(product.name)}"><div><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(item.variant)}</small></div><div class="metric">${escapeHTML(`${item.qty} ${item.unit}`)}<span>Perkiraan kebutuhan</span></div><div class="metric">${escapeHTML(frequencyLabel(item))}<span>Frekuensi</span></div></div>`;
      }).join("");

      const data = contactData();
      const rows = [
        ["Nama usaha / organisasi", data.company || "—"],
        ["Nama PIC", data.pic || "—"],
        ["Nomor WhatsApp", data.whatsapp || "—"],
        ["Email", data.email || "—"],
        ["Lokasi pengiriman / area", data.location || "—"],
        ["Waktu mulai / target", data.neededDate || "—"],
        ["Catatan kebutuhan", data.notes || "—"]
      ];
      contactSummary.innerHTML = rows.map(([label, value]) => `<div><b>${escapeHTML(label)}</b><span>${escapeHTML(value)}</span></div>`).join("");
      summaryList.classList.toggle("is-overflow", items.length > 3);
      summaryList.scrollTop = 0;
    };

    const workspaceStates = Object.freeze({
      product: productState,
      contact: contactForm,
      review: reviewState
    });
    const workspaceStep = Object.freeze({
      product: 1,
      contact: 2,
      review: 3
    });

    const setWorkspaceState = (name) => {
      const activeStep = workspaceStep[name] || 1;

      Object.entries(workspaceStates).forEach(([key, node]) => {
        if (node) node.hidden = key !== name;
      });

      storySteps.forEach((node) => {
        const number = Number(node.dataset.businessStoryStep);
        node.classList.toggle("active", number === activeStep);
        node.classList.toggle("complete", number < activeStep);
      });

      if (name === "review") {
        renderReview();
        if (reviewConsent) reviewConsent.checked = false;
        showError(reviewError, []);
        requestAnimationFrame(() => {
          summaryList.scrollTop = 0;
        });
      }
    };

    const buildMessage = () => {
      const data = contactData();
      const lines = [
        "Halo AYA RAOS, saya ingin membahas kebutuhan Pasokan Usaha dari website.",
        "",
        "KEBUTUHAN PRODUK"
      ];
      items.forEach((item, index) => {
        const product = productById(item.productId);
        lines.push(
          `${index + 1}. ${product?.name || item.productId}`,
          `   Varian: ${item.variant}`,
          `   Perkiraan kebutuhan: ${item.qty} ${item.unit}`,
          `   Frekuensi: ${frequencyLabel(item)}`
        );
      });
      lines.push(
        "",
        "INFORMASI KEBUTUHAN",
        `Usaha/Organisasi: ${data.company || "-"}`,
        `PIC: ${data.pic || "-"}`,
        `WhatsApp: ${data.whatsapp || "-"}`,
        `Email: ${data.email || "-"}`,
        `Waktu mulai/target: ${data.neededDate || "-"}`,
        `Lokasi/area: ${data.location || "-"}`
      );
      if (data.notes) lines.push(`Catatan kebutuhan: ${data.notes}`);
      lines.push(
        "",
        "Saya memahami informasi ini merupakan permintaan pembahasan Pasokan Usaha dan belum merupakan pesanan, penawaran harga, atau jaminan ketersediaan."
      );
      return lines.join("\n");
    };

    restore();
    renderProducts();
    setWorkspaceState("product");

    addProductButton.addEventListener("click", () => {
      renderPicker();
      picker.hidden = false;
      qs("[data-pick-product]", picker)?.focus();
    });

    picker.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close-product-picker]");
      if (close) {
        picker.hidden = true;
        addProductButton.focus();
        return;
      }
      const pick = event.target.closest("[data-pick-product]");
      if (!pick) return;
      const productId = asText(pick.dataset.pickProduct);
      if (items.some((item) => item.productId === productId)) return;
      const item = makeItem(productId);
      if (!item) {
        showError(productError, ["Produk tersebut belum dapat digunakan untuk Pasokan Usaha."]);
        return;
      }
      items.push(item);
      picker.hidden = true;
      showError(productError, []);
      renderProducts();
      persist();
      requestAnimationFrame(() => { productList.scrollTop = productList.scrollHeight; });
    });

    productList.addEventListener("click", (event) => {
      const qtyButton = event.target.closest("[data-qty-index]");
      if (qtyButton) {
        const index = Number(qtyButton.dataset.qtyIndex);
        if (!items[index]) return;
        const delta = Number(qtyButton.dataset.qtyDelta) || quantityStep();
        items[index].qty = Math.max(quantityStep(), Number(items[index].qty) + delta);
        renderProducts();
        persist();
        return;
      }
      const removeButton = event.target.closest("[data-remove-index]");
      if (removeButton) {
        const index = Number(removeButton.dataset.removeIndex);
        if (!items[index]) return;
        items.splice(index, 1);
        renderProducts();
        persist();
      }
    });

    const updateItemFromControl = (target) => {
      const index = Number(target.dataset.itemIndex);
      const field = target.dataset.itemField;
      const item = items[index];
      if (!item || !field) return;
      const product = productById(item.productId);
      if (field === "variant") {
        const variants = normalizedVariants(product);
        if (!variants.includes(target.value)) return;
        item.variant = target.value;
        const config = variantConfig(product.id, item.variant);
        item.unit = asText(config?.defaultUnit);
      } else if (field === "qty") {
        const step = quantityStep();
        const value = Number(target.value);
        item.qty = Math.max(step, Math.round((Number.isFinite(value) ? value : step) / step) * step);
      } else if (field === "unit") {
        const config = variantConfig(product.id, item.variant);
        if (config?.allowedUnits?.includes(target.value)) item.unit = target.value;
      } else if (field === "frequency") {
        if (!FREQUENCIES.includes(target.value)) return;
        item.frequency = target.value;
        if (target.value !== "Lainnya") item.customFrequency = "";
      } else if (field === "customFrequency") {
        item.customFrequency = target.value;
      }
      renderProducts();
      persist();
    };

    productList.addEventListener("change", (event) => updateItemFromControl(event.target));
    productList.addEventListener("input", (event) => {
      if (event.target.dataset.itemField === "customFrequency") {
        const index = Number(event.target.dataset.itemIndex);
        if (items[index]) {
          items[index].customFrequency = event.target.value;
          persist();
        }
      }
    });

    contactForm.addEventListener("input", persist);
    contactForm.addEventListener("change", persist);

    toContactButton?.addEventListener("click", () => {
      if (!validateProducts()) return;
      persist();
      setWorkspaceState("contact");
    });

    toReviewButton?.addEventListener("click", () => {
      if (!validateProducts()) {
        setWorkspaceState("product");
        return;
      }
      if (!validateContact()) return;
      persist();
      setWorkspaceState("review");
    });

    backProductsButton?.addEventListener("click", () => {
      renderContactInlineErrors([]);
      showError(contactError, []);
      setWorkspaceState("product");
    });

    backContactButton?.addEventListener("click", () => {
      setWorkspaceState("contact");
    });

    submitButton?.addEventListener("click", () => {
      const messages = [];
      if (!reviewConsent?.checked) messages.push("Centang persetujuan setelah memeriksa ringkasan kebutuhan.");
      if (!validateProducts()) messages.push("Kebutuhan produk perlu diperiksa kembali.");
      if (!validateContact()) messages.push("Informasi kontak perlu diperiksa kembali.");
      if (messages.length) {
        showError(reviewError, [...new Set(messages)]);
        return;
      }
      const url = AYA?.buildWhatsAppUrl?.(buildMessage());
      if (!url) {
        showError(reviewError, ["WhatsApp belum dapat dibuka. Silakan coba kembali nanti."]);
        return;
      }
      persist();
      window.open(url, "_blank", "noopener,noreferrer");
    });

    qsa(".scrollcue").forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = qs(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });
})();

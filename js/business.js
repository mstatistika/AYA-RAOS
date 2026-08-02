(() => {
  const products = (window.AYA_PRODUCTS || []).filter(
    product => product.available && product.variants?.length
  );
  const config = window.AYA_CONFIG || {};
  const currency = window.AYA?.currency || (value => `Rp${Number(value || 0).toLocaleString("id-ID")}`);

  const wizard = document.querySelector("[data-business-wizard]");
  if (!wizard) return;

  const form = wizard.querySelector("[data-business-form]");
  const steps = [...wizard.querySelectorAll("[data-wizard-step]")];
  const navButtons = [...wizard.querySelectorAll("[data-step-nav]")];
  const progress = wizard.querySelector("[data-wizard-progress]");
  const productRows = wizard.querySelector("[data-product-rows]");
  const addProductButton = wizard.querySelector("[data-add-product]");
  const previousButtons = [...wizard.querySelectorAll("[data-step-previous]")];
  const nextButtons = [...wizard.querySelectorAll("[data-step-next]")];

  const summary = {
    customer: wizard.querySelector("[data-summary-customer]"),
    type: wizard.querySelector("[data-summary-type]"),
    items: wizard.querySelector("[data-summary-items]"),
    productTotal: wizard.querySelector("[data-summary-product-total]"),
    extras: wizard.querySelector("[data-summary-extras]"),
    shipping: wizard.querySelector("[data-summary-shipping]"),
    date: wizard.querySelector("[data-summary-date]"),
    location: wizard.querySelector("[data-summary-location]"),
    initial: wizard.querySelector("[data-summary-initial]")
  };

  let currentStep = 1;
  let highestStep = 1;

  function createField(labelText, className = "") {
    const field = document.createElement("div");
    field.className = `v2-field ${className}`.trim();
    const label = document.createElement("label");
    label.textContent = labelText;
    field.appendChild(label);
    return { field, label };
  }

  function createProductRow(initial = {}) {
    const row = document.createElement("div");
    row.className = "v2-product-row";
    row.dataset.productRow = "";

    const productField = createField("Produk");
    const productSelect = document.createElement("select");
    productSelect.dataset.productSelect = "";
    productSelect.required = true;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Pilih produk";
    productSelect.appendChild(placeholder);

    products.forEach(product => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = `${product.name} · ${product.line}`;
      productSelect.appendChild(option);
    });
    productField.field.appendChild(productSelect);

    const variantField = createField("Varian");
    const variantSelect = document.createElement("select");
    variantSelect.dataset.variantSelect = "";
    variantSelect.required = true;
    variantField.field.appendChild(variantSelect);

    const quantityField = createField("Jumlah");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.max = "9999";
    quantityInput.value = String(initial.quantity || 1);
    quantityInput.inputMode = "numeric";
    quantityInput.dataset.quantityInput = "";
    quantityInput.required = true;
    quantityField.field.appendChild(quantityInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "v2-remove-row";
    removeButton.textContent = "Hapus";
    removeButton.setAttribute("aria-label", "Hapus produk dari pesanan");

    row.append(
      productField.field,
      variantField.field,
      quantityField.field,
      removeButton
    );

    function populateVariants(selectedVariant = "") {
      variantSelect.replaceChildren();
      const product = products.find(item => item.id === productSelect.value);

      if (!product) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Pilih produk dahulu";
        variantSelect.appendChild(option);
        variantSelect.disabled = true;
        return;
      }

      variantSelect.disabled = false;
      product.variants.forEach((variant, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `${variant.name} · ${currency(variant.price)}`;
        variantSelect.appendChild(option);
      });

      if (selectedVariant !== "") {
        variantSelect.value = String(selectedVariant);
      }
    }

    productSelect.addEventListener("change", () => {
      populateVariants();
      updateSummary();
    });
    variantSelect.addEventListener("change", updateSummary);
    quantityInput.addEventListener("input", updateSummary);
    removeButton.addEventListener("click", () => {
      if (productRows.querySelectorAll("[data-product-row]").length <= 1) {
        productSelect.value = "";
        populateVariants();
        quantityInput.value = "1";
      } else {
        row.remove();
      }
      updateSummary();
    });

    if (initial.productId) {
      productSelect.value = initial.productId;
    }
    populateVariants(initial.variantIndex || 0);

    return row;
  }

  function getOrderItems() {
    return [...productRows.querySelectorAll("[data-product-row]")]
      .map(row => {
        const productId = row.querySelector("[data-product-select]")?.value;
        const variantIndex = Number(row.querySelector("[data-variant-select]")?.value || 0);
        const quantity = Math.max(1, Number(row.querySelector("[data-quantity-input]")?.value || 1));
        const product = products.find(item => item.id === productId);
        const variant = product?.variants?.[variantIndex];
        if (!product || !variant) return null;
        return {
          product,
          variant,
          quantity,
          total: Number(variant.price) * quantity
        };
      })
      .filter(Boolean);
  }

  function getConfiguredExtraTotal() {
    const controls = [...form.querySelectorAll("[data-extra-charge]:checked")];
    return controls.reduce((total, control) => {
      const price = Number(control.dataset.price);
      return total + (Number.isFinite(price) ? price : 0);
    }, 0);
  }

  function getSelectedExtraLabels() {
    return [...form.querySelectorAll("[data-extra-charge]:checked")].map(control => {
      const price = Number(control.dataset.price);
      const priceLabel = Number.isFinite(price) && price > 0
        ? currency(price)
        : "tarif mengikuti konfigurasi AYA";
      return `${control.dataset.label || control.value} — ${priceLabel}`;
    });
  }

  function updateSummary() {
    const items = getOrderItems();
    const productTotal = items.reduce((sum, item) => sum + item.total, 0);
    const extraLabels = getSelectedExtraLabels();
    const extraTotal = getConfiguredExtraTotal();
    const businessType = form.elements.businessType?.value || "Belum dipilih";
    const customerName = form.elements.contactName?.value || "Belum diisi";
    const companyName = form.elements.companyName?.value;
    const deliveryDate = form.elements.needDate?.value || "Belum dipilih";
    const city = form.elements.city?.value || "Belum diisi";
    const deliveryMethod = form.elements.deliveryMethod?.value || "Belum dipilih";

    if (summary.customer) {
      summary.customer.textContent = companyName
        ? `${companyName} · ${customerName}`
        : customerName;
    }
    if (summary.type) summary.type.textContent = businessType;
    if (summary.items) {
      summary.items.textContent = items.length
        ? `${items.length} jenis produk · ${items.reduce((sum, item) => sum + item.quantity, 0)} unit`
        : "Belum ada produk";
    }
    if (summary.productTotal) summary.productTotal.textContent = currency(productTotal);
    if (summary.extras) {
      summary.extras.textContent = extraLabels.length
        ? `${extraLabels.length} pilihan · ${extraTotal > 0 ? currency(extraTotal) : "tarif mengikuti konfigurasi"}`
        : "Tidak ada pilihan tambahan";
    }
    if (summary.shipping) {
      summary.shipping.textContent = deliveryMethod === "Ambil sendiri"
        ? "Ambil sendiri"
        : "Tarif aktual Grab/Gojek";
    }
    if (summary.date) summary.date.textContent = deliveryDate;
    if (summary.location) summary.location.textContent = city;
    if (summary.initial) {
      summary.initial.textContent = "Rumus pembayaran awal belum dikunci";
    }
  }

  function validateStep(stepNumber) {
    const step = steps.find(item => Number(item.dataset.wizardStep) === stepNumber);
    if (!step) return true;

    if (stepNumber === 2 && !getOrderItems().length) {
      window.AYA?.showToast?.("Pilih minimal satu produk sebelum melanjutkan.");
      return false;
    }

    const fields = [...step.querySelectorAll("input, select, textarea")]
      .filter(field => !field.disabled && field.required);

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }

    return true;
  }

  function showStep(stepNumber) {
    currentStep = Math.max(1, Math.min(4, stepNumber));
    highestStep = Math.max(highestStep, currentStep);

    steps.forEach(step => {
      step.hidden = Number(step.dataset.wizardStep) !== currentStep;
    });

    navButtons.forEach(button => {
      const target = Number(button.dataset.stepNav);
      button.classList.toggle("is-active", target === currentStep);
      button.disabled = target > highestStep;
      button.setAttribute("aria-current", target === currentStep ? "step" : "false");
    });

    if (progress) progress.style.width = `${currentStep * 25}%`;
    updateSummary();
    wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  nextButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      showStep(currentStep + 1);
    });
  });

  previousButtons.forEach(button => {
    button.addEventListener("click", () => showStep(currentStep - 1));
  });

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      const target = Number(button.dataset.stepNav);
      if (target <= highestStep) showStep(target);
    });
  });

  addProductButton?.addEventListener("click", () => {
    productRows.appendChild(createProductRow());
    updateSummary();
  });

  form.addEventListener("input", updateSummary);
  form.addEventListener("change", updateSummary);
  form.addEventListener("submit", event => event.preventDefault());

  const cartPrefill = new URLSearchParams(window.location.search).get("prefill") === "cart";
  if (cartPrefill && window.AYA?.getCart) {
    const cart = window.AYA.getCart();
    productRows.replaceChildren();
    cart.forEach(item => {
      const product = products.find(entry => entry.id === item.productId);
      const variantIndex = product?.variants?.findIndex(variant => variant.name === item.variant) ?? 0;
      productRows.appendChild(createProductRow({
        productId: item.productId,
        variantIndex: Math.max(0, variantIndex),
        quantity: item.quantity
      }));
    });
  }

  if (!productRows.children.length) {
    productRows.appendChild(createProductRow({ productId: "sambal-bawang" }));
  }

  const configuredExtras = Array.isArray(config.businessExtraCharges)
    ? config.businessExtraCharges
    : [];

  form.querySelectorAll("[data-extra-charge]").forEach(control => {
    const configured = configuredExtras.find(item => item.id === control.value);
    if (!configured) return;
    control.dataset.price = String(configured.price ?? "");
    control.dataset.label = configured.name || control.dataset.label || control.value;
    const priceNode = form.querySelector(`[data-extra-price="${control.value}"]`);
    if (priceNode) {
      priceNode.textContent = Number.isFinite(Number(configured.price))
        ? currency(configured.price)
        : "Tarif akan dikonfigurasi";
    }
  });

  showStep(1);
})();

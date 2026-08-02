(() => {
  const wizard = document.querySelector("[data-business-wizard]");
  if (!wizard) return;

  const form = wizard.querySelector("[data-business-form]");
  const products = (window.AYA_PRODUCTS || []).filter(
    product => product.available && product.variants?.length
  );
  const config = window.AYA_CONFIG || {};
  const currency = window.AYA?.currency || (
    value => `Rp${Number(value || 0).toLocaleString("id-ID")}`
  );

  const steps = [...wizard.querySelectorAll("[data-wizard-step]")];
  const navButtons = [...wizard.querySelectorAll("[data-step-nav]")];
  const progress = wizard.querySelector("[data-wizard-progress]");
  const productRows = wizard.querySelector("[data-product-rows]");
  const addProductButton = wizard.querySelector("[data-add-product]");
  const previousButtons = [...wizard.querySelectorAll("[data-step-previous]")];
  const nextButtons = [...wizard.querySelectorAll("[data-step-next]")];

  const summary = Object.fromEntries(
    [
      "customer",
      "type",
      "items",
      "product-total",
      "extras",
      "shipping",
      "date",
      "location",
      "initial"
    ].map(key => [
      key.replace(/-([a-z])/g, (_, char) => char.toUpperCase()),
      wizard.querySelector(`[data-summary-${key}]`)
    ])
  );

  let currentStep = 1;
  let highestStep = 1;

  function createField(labelText) {
    const field = document.createElement("div");
    field.className = "v2-field";
    const label = document.createElement("label");
    label.textContent = labelText;
    field.appendChild(label);
    return field;
  }

  function createProductRow(initial = {}) {
    const row = document.createElement("div");
    row.className = "v2-product-row";
    row.dataset.productRow = "";

    const productField = createField("Produk");
    const productSelect = document.createElement("select");
    productSelect.dataset.productSelect = "";
    productSelect.required = true;
    productSelect.appendChild(new Option("Pilih produk", ""));
    products.forEach(product => {
      productSelect.appendChild(
        new Option(`${product.name} · ${product.line}`, product.id)
      );
    });
    productField.appendChild(productSelect);

    const variantField = createField("Varian");
    const variantSelect = document.createElement("select");
    variantSelect.dataset.variantSelect = "";
    variantSelect.required = true;
    variantField.appendChild(variantSelect);

    const quantityField = createField("Jumlah");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.max = "9999";
    quantityInput.value = String(initial.quantity || 1);
    quantityInput.inputMode = "numeric";
    quantityInput.dataset.quantityInput = "";
    quantityInput.required = true;
    quantityField.appendChild(quantityInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "v2-remove-row";
    removeButton.textContent = "Hapus";
    removeButton.setAttribute("aria-label", "Hapus produk dari pesanan");

    row.append(productField, variantField, quantityField, removeButton);

    function populateVariants(selectedVariant = 0) {
      variantSelect.replaceChildren();
      const product = products.find(item => item.id === productSelect.value);

      if (!product) {
        variantSelect.appendChild(new Option("Pilih produk dahulu", ""));
        variantSelect.disabled = true;
        return;
      }

      variantSelect.disabled = false;
      product.variants.forEach((variant, index) => {
        variantSelect.appendChild(
          new Option(`${variant.name} · ${currency(variant.price)}`, String(index))
        );
      });
      variantSelect.value = String(selectedVariant);
    }

    productSelect.addEventListener("change", () => {
      populateVariants(0);
      updateSummary();
    });
    variantSelect.addEventListener("change", updateSummary);
    quantityInput.addEventListener("input", updateSummary);
    removeButton.addEventListener("click", () => {
      if (productRows.querySelectorAll("[data-product-row]").length === 1) {
        productSelect.value = "";
        quantityInput.value = "1";
        populateVariants(0);
      } else {
        row.remove();
      }
      updateSummary();
    });

    if (initial.productId) productSelect.value = initial.productId;
    populateVariants(initial.variantIndex || 0);
    return row;
  }

  function getOrderItems() {
    return [...productRows.querySelectorAll("[data-product-row]")]
      .map(row => {
        const productId = row.querySelector("[data-product-select]")?.value;
        const variantIndex = Number(
          row.querySelector("[data-variant-select]")?.value || 0
        );
        const quantity = Math.max(
          1,
          Number(row.querySelector("[data-quantity-input]")?.value || 1)
        );
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

  function selectedExtras() {
    return [...form.querySelectorAll("[data-extra-charge]:checked")].map(control => {
      const price = Number(control.dataset.price);
      return {
        label: control.dataset.label || control.value,
        price: Number.isFinite(price) ? price : null
      };
    });
  }

  function updateSummary() {
    const items = getOrderItems();
    const extras = selectedExtras();
    const productTotal = items.reduce((sum, item) => sum + item.total, 0);
    const extraTotal = extras.reduce((sum, item) => sum + (item.price || 0), 0);
    const customerName = form.elements.contactName?.value || "Belum diisi";
    const companyName = form.elements.companyName?.value;
    const deliveryMethod = form.elements.deliveryMethod?.value || "Belum dipilih";

    if (summary.customer) {
      summary.customer.textContent = companyName
        ? `${companyName} · ${customerName}`
        : customerName;
    }
    if (summary.type) {
      summary.type.textContent = form.elements.businessType?.value || "Belum dipilih";
    }
    if (summary.items) {
      const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);
      summary.items.textContent = items.length
        ? `${items.length} jenis produk · ${unitCount} unit`
        : "Belum ada produk";
    }
    if (summary.productTotal) summary.productTotal.textContent = currency(productTotal);
    if (summary.extras) {
      summary.extras.textContent = extras.length
        ? `${extras.length} pilihan · ${extraTotal > 0 ? currency(extraTotal) : "tarif mengikuti konfigurasi"}`
        : "Tidak ada pilihan tambahan";
    }
    if (summary.shipping) {
      summary.shipping.textContent = deliveryMethod === "Ambil sendiri"
        ? "Ambil sendiri"
        : "Tarif aktual Grab/Gojek";
    }
    if (summary.date) {
      summary.date.textContent = form.elements.needDate?.value || "Belum dipilih";
    }
    if (summary.location) {
      summary.location.textContent = form.elements.city?.value || "Belum diisi";
    }
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

    const requiredFields = [...step.querySelectorAll("input, select, textarea")]
      .filter(field => !field.disabled && field.required);

    for (const field of requiredFields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }
    return true;
  }

  function showStep(stepNumber, shouldScroll = true) {
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
    if (shouldScroll) {
      wizard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  nextButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (validateStep(currentStep)) showStep(currentStep + 1);
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
      const variantIndex = product?.variants?.findIndex(
        variant => variant.name === item.variant
      ) ?? 0;
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
    control.dataset.price = String(configured.price ?? "pending");
    control.dataset.label = configured.name || control.dataset.label || control.value;
    const priceNode = form.querySelector(`[data-extra-price="${control.value}"]`);
    if (!priceNode) return;
    const numericPrice = Number(configured.price);
    priceNode.textContent = Number.isFinite(numericPrice)
      ? currency(numericPrice)
      : "Tarif akan dikonfigurasi";
  });

  showStep(1, false);
})();

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;

    const form = document.querySelector("[data-business-form]");
    const itemRoot = document.querySelector("[data-business-items]");
    const addItemButton = document.querySelector("[data-add-business-item]");
    const backButton = document.querySelector("[data-business-back]");
    const nextButton = document.querySelector("[data-business-next]");
    const submitButton = document.querySelector("[data-business-submit]");
    const status = document.querySelector("[data-business-status]");
    const review = document.querySelector("[data-business-review]");
    const liveSummary = document.querySelector("[data-business-live-summary]");
    const subtotalNode = document.querySelector("[data-business-subtotal]");
    const summaryStatus = document.querySelector("[data-business-summary-status]");

    if (!form || !itemRoot) return;

    let step = 1;

    const eligibleProducts = window.AYA.products.filter(product => product.status !== "soldout" && product.variants?.length);

    function setStatus(message, type = "") {
      status.textContent = message;
      status.className = `form-status${type ? ` is-${type}` : ""}`;
    }

    function createItemRow(initial = {}) {
      const row = window.AYA.make("div", "business-item-row");
      row.dataset.businessItem = "";

      const productField = window.AYA.make("label", "form-field");
      productField.appendChild(window.AYA.make("span", "", "Produk"));
      const select = document.createElement("select");
      select.name = "businessProduct";
      select.required = true;
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Pilih produk";
      select.appendChild(placeholder);
      eligibleProducts.forEach(product => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.name;
        select.appendChild(option);
      });
      if (initial.productId) select.value = initial.productId;
      productField.appendChild(select);

      const variantField = window.AYA.make("label", "form-field");
      variantField.appendChild(window.AYA.make("span", "", "Varian"));
      const variant = document.createElement("select");
      variant.name = "businessVariant";
      variant.required = true;
      variantField.appendChild(variant);

      const qtyField = window.AYA.make("label", "form-field");
      qtyField.appendChild(window.AYA.make("span", "", "Estimasi qty"));
      const qty = document.createElement("input");
      qty.name = "businessQty";
      qty.type = "number";
      qty.min = "1";
      qty.max = "9999";
      qty.inputMode = "numeric";
      qty.placeholder = "Contoh: 30";
      qty.required = true;
      if (initial.qty) qty.value = initial.qty;
      qtyField.appendChild(qty);

      const remove = window.AYA.make("button", "business-item-remove", "Hapus");
      remove.type = "button";
      remove.setAttribute("aria-label", "Hapus produk");
      remove.addEventListener("click", () => {
        row.remove();
        if (!itemRoot.children.length) itemRoot.appendChild(createItemRow());
        refreshSummary();
      });

      function populateVariants() {
        variant.replaceChildren();
        const product = window.AYA.getProduct(select.value);
        if (!product) {
          const option = document.createElement("option");
          option.value = "";
          option.textContent = "Pilih produk dahulu";
          variant.appendChild(option);
          return;
        }
        product.variants.forEach(item => {
          const option = document.createElement("option");
          option.value = item.name;
          option.dataset.price = item.price;
          option.textContent = `${item.name} — ${window.AYA.currency(item.price)}`;
          variant.appendChild(option);
        });
        if (initial.variant) variant.value = initial.variant;
      }

      select.addEventListener("change", () => {
        populateVariants();
        refreshSummary();
      });
      variant.addEventListener("change", refreshSummary);
      qty.addEventListener("input", refreshSummary);

      populateVariants();
      row.append(productField, variantField, qtyField, remove);
      return row;
    }

    function collectItems() {
      return [...itemRoot.querySelectorAll("[data-business-item]")].map(row => {
        const productId = row.querySelector('[name="businessProduct"]').value;
        const variantSelect = row.querySelector('[name="businessVariant"]');
        const qty = Number(row.querySelector('[name="businessQty"]').value) || 0;
        const product = window.AYA.getProduct(productId);
        const selectedOption = variantSelect.options[variantSelect.selectedIndex];
        const price = Number(selectedOption?.dataset.price) || 0;
        return {
          productId,
          productName: product?.name || "",
          variant: variantSelect.value,
          qty,
          price,
          subtotal: price * qty
        };
      }).filter(item => item.productId && item.variant && item.qty > 0);
    }

    function currentData() {
      const data = Object.fromEntries(new FormData(form).entries());
      data.items = collectItems();
      return data;
    }

    function refreshSummary() {
      const data = currentData();
      const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
      subtotalNode.textContent = window.AYA.currency(subtotal);
      liveSummary.replaceChildren();

      const hasAny = data.customerType || data.companyName || data.picName || data.items.length || data.requiredDate || data.deliveryLocation;
      if (!hasAny) {
        liveSummary.appendChild(window.AYA.make("p", "summary-placeholder", "Ringkasan akan terisi saat Anda melengkapi form."));
        return;
      }

      const list = window.AYA.make("div", "business-live-list");
      const addLine = (label, value) => {
        if (!value) return;
        const row = window.AYA.make("div");
        row.append(window.AYA.make("span", "", label), window.AYA.make("strong", "", value));
        list.appendChild(row);
      };

      addLine("Jenis", data.customerType);
      addLine("Perusahaan", data.companyName);
      addLine("PIC", data.picName);
      addLine("Lokasi", data.deliveryLocation);
      addLine("Tanggal", data.requiredDate);

      if (data.items.length) {
        const itemsBox = window.AYA.make("div", "business-live-items");
        itemsBox.appendChild(window.AYA.make("span", "", "Produk"));
        data.items.forEach(item => {
          itemsBox.appendChild(window.AYA.make("strong", "", `${item.productName} · ${item.variant} · ${item.qty}`));
        });
        list.appendChild(itemsBox);
      }

      liveSummary.appendChild(list);
    }

    function validateStep(current) {
      setStatus("");
      const section = form.querySelector(`[data-business-step="${current}"]`);
      if (!section) return true;

      const fields = [...section.querySelectorAll("input, select, textarea")].filter(field => !field.disabled);
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          setStatus("Lengkapi data wajib pada langkah ini.", "error");
          return false;
        }
      }

      if (current === 2 && !collectItems().length) {
        setStatus("Tambahkan minimal satu produk dan estimasi jumlah.", "error");
        return false;
      }
      return true;
    }

    function renderReview() {
      const data = currentData();
      review.replaceChildren();

      const sections = [
        ["Pemesan", [
          ["Jenis kebutuhan", data.customerType],
          ["Usaha / perusahaan", data.companyName || "-"],
          ["PIC", data.picName],
          ["WhatsApp", data.picWhatsapp],
          ["Email", data.email || "-"]
        ]],
        ["Produk", data.items.map(item => [
          item.productName,
          `${item.variant} · estimasi ${item.qty} · ${window.AYA.currency(item.subtotal)}`
        ])],
        ["Jadwal & lokasi", [
          ["Tanggal", data.requiredDate],
          ["Lokasi", data.deliveryLocation],
          ["Kebutuhan tambahan", data.extras || "-"],
          ["Catatan", data.notes || "-"]
        ]]
      ];

      sections.forEach(([title, rows]) => {
        const article = window.AYA.make("article");
        article.appendChild(window.AYA.make("h3", "", title));
        rows.forEach(row => {
          const item = window.AYA.make("div");
          item.append(window.AYA.make("span", "", row[0]), window.AYA.make("strong", "", row[1] || "-"));
          article.appendChild(item);
        });
        review.appendChild(article);
      });
    }

    function showStep(nextStep) {
      step = nextStep;
      form.querySelectorAll("[data-business-step]").forEach(section => {
        const active = Number(section.dataset.businessStep) === step;
        section.hidden = !active;
        section.classList.toggle("active", active);
      });
      form.querySelectorAll("[data-business-indicator]").forEach(item => {
        const index = Number(item.dataset.businessIndicator);
        item.classList.toggle("active", index === step);
        item.classList.toggle("complete", index < step);
      });

      backButton.hidden = step === 1;
      nextButton.hidden = step === 4;
      submitButton.hidden = step !== 4;

      if (step === 4) renderReview();
      setStatus("");
      refreshSummary();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function buildMessage(data) {
      const productLines = data.items.flatMap((item, index) => [
        `${index + 1}. ${item.productName}`,
        `   Varian: ${item.variant}`,
        `   Estimasi jumlah: ${item.qty}`,
        `   Estimasi subtotal: ${window.AYA.currency(item.subtotal)}`
      ]);

      return [
        `Halo ${window.AYA.config.businessName || "AYA RAOS"}, saya ingin mengirim inquiry pesanan usaha:`,
        "",
        `Jenis kebutuhan: ${data.customerType}`,
        `Nama usaha / perusahaan: ${data.companyName || "-"}`,
        `PIC: ${data.picName}`,
        `WhatsApp PIC: ${data.picWhatsapp}`,
        `Email: ${data.email || "-"}`,
        "",
        "Produk:",
        ...productLines,
        "",
        `Estimasi subtotal produk: ${window.AYA.currency(data.items.reduce((sum, item) => sum + item.subtotal, 0))}`,
        `Tanggal kebutuhan: ${data.requiredDate}`,
        `Lokasi pengiriman: ${data.deliveryLocation}`,
        `Kebutuhan tambahan: ${data.extras || "-"}`,
        `Catatan: ${data.notes || "-"}`,
        "",
        "Mohon konfirmasi ketersediaan, kapasitas, jadwal, ongkir, dan ketentuan berikutnya. Terima kasih."
      ].join("\n");
    }

    addItemButton?.addEventListener("click", () => {
      itemRoot.appendChild(createItemRow());
      refreshSummary();
    });

    nextButton?.addEventListener("click", () => {
      if (!validateStep(step)) return;
      showStep(Math.min(4, step + 1));
    });

    backButton?.addEventListener("click", () => showStep(Math.max(1, step - 1)));

    form.addEventListener("input", refreshSummary);
    form.addEventListener("change", refreshSummary);

    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!validateStep(4)) return;
      const data = currentData();
      if (!data.items.length) {
        setStatus("Produk belum terisi.", "error");
        showStep(2);
        return;
      }
      const opened = window.AYA.openWhatsApp(buildMessage(data));
      if (opened) {
        summaryStatus.textContent = "Dibuka di WhatsApp";
        setStatus("Inquiry dibuka di WhatsApp. Periksa kembali sebelum mengirim.", "success");
      }
    });

    itemRoot.appendChild(createItemRow());
    refreshSummary();
    showStep(1);
  });
})();

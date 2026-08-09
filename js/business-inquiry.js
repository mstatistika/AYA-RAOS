(() => {
  "use strict";
  const KEY = "ayaRaos.businessDraft.phase1";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;
    const form = document.querySelector("[data-business-inquiry-form]");
    if (!form) return;

    const errors = document.querySelector("[data-business-errors]");
    const productSelect = document.querySelector("[data-supply-product]");
    const submitButton = document.querySelector("[data-submit-business]");
    const review = document.querySelector("[data-business-review]");
    const steps = [...document.querySelectorAll("[data-business-step]")];
    const stepButtons = [...document.querySelectorAll("[data-business-step-button]")];
    let step = 1;

    const visibleProducts = window.AYA.products().filter((product) => product.visible && product.orderable);
    productSelect.innerHTML += visibleProducts.map((product) => `<option value="${window.AYA.escapeHTML(product.id)}">${window.AYA.escapeHTML(product.name)}</option>`).join("") + '<option value="other">Produk lain — jelaskan di catatan</option>';

    const read = () => {
      try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }
      catch { return {}; }
    };
    const write = (value) => {
      try { localStorage.setItem(KEY, JSON.stringify(value)); return true; }
      catch { return false; }
    };
    let draft = read();
    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (!field || value == null || typeof value === "object") return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = String(value);
    });

    const allData = () => {
      const data = Object.fromEntries(new FormData(form));
      return { ...data, consent: Boolean(data.consent), schemaVersion: 1 };
    };

    const showErrors = (messages) => {
      errors.hidden = !messages.length;
      errors.innerHTML = messages.length ? `<strong>Periksa data berikut:</strong><ul>${messages.map((message) => `<li>${window.AYA.escapeHTML(message)}</li>`).join("")}</ul>` : "";
      if (messages.length) errors.focus();
    };

    const requiredByStep = {
      1: {
        company: "Nama usaha, perusahaan, atau organisasi wajib diisi.",
        businessType: "Konteks kebutuhan wajib dipilih.",
        pic: "Nama PIC wajib diisi.",
        whatsapp: "Nomor WhatsApp wajib diisi.",
        email: "Email wajib diisi."
      },
      2: {
        product: "Produk yang dibutuhkan wajib dipilih.",
        estimatedQty: "Estimasi jumlah wajib diisi.",
        neededDate: "Tanggal kebutuhan wajib diisi.",
        location: "Lokasi wajib diisi."
      }
    };

    const validateStep = (number) => {
      const data = allData();
      const messages = [];
      Object.entries(requiredByStep[number] || {}).forEach(([name, message]) => {
        if (!String(data[name] || "").trim()) messages.push(message);
      });
      if (number === 1 && data.email && !/^\S+@\S+\.\S+$/.test(data.email)) messages.push("Format email belum valid.");
      if (number === 3 && !data.consent) messages.push("Pernyataan pemahaman wajib disetujui.");
      showErrors(messages);
      return { valid: !messages.length, data };
    };

    const persist = () => {
      draft = { ...draft, ...allData(), savedAt: new Date().toISOString() };
      write(draft);
    };

    const renderReview = () => {
      const data = allData();
      const product = window.AYA.getProduct(data.product);
      review.innerHTML = `<div><span>Profil</span><strong>${window.AYA.escapeHTML(data.company || "—")}</strong><small>${window.AYA.escapeHTML(data.businessType || "")}</small></div><div><span>PIC</span><strong>${window.AYA.escapeHTML(data.pic || "—")}</strong><small>${window.AYA.escapeHTML(data.whatsapp || "")} · ${window.AYA.escapeHTML(data.email || "")}</small></div><div><span>Produk & jumlah</span><strong>${window.AYA.escapeHTML(product?.name || data.product || "—")}</strong><small>${window.AYA.escapeHTML(data.estimatedQty || "")}</small></div><div><span>Tanggal & lokasi</span><strong>${window.AYA.escapeHTML(data.neededDate || "—")}</strong><small>${window.AYA.escapeHTML(data.location || "")}</small></div>`;
    };

    const go = (target, validate = true) => {
      if (validate && target > step) {
        const result = validateStep(step);
        if (!result.valid) return;
        persist();
      }
      if (target === 3) renderReview();
      step = target;
      steps.forEach((node) => {
        const active = Number(node.dataset.businessStep) === step;
        node.hidden = !active;
        node.classList.toggle("active", active);
      });
      stepButtons.forEach((button) => {
        const number = Number(button.dataset.businessStepButton);
        button.classList.toggle("active", number === step);
        button.classList.toggle("complete", number < step);
      });
    };

    document.querySelectorAll("[data-business-next]").forEach((button) => button.addEventListener("click", () => go(Number(button.dataset.businessNext))));
    document.querySelectorAll("[data-business-prev]").forEach((button) => button.addEventListener("click", () => { showErrors([]); go(Number(button.dataset.businessPrev), false); }));
    stepButtons.forEach((button) => button.addEventListener("click", () => { const target = Number(button.dataset.businessStepButton); if (target < step) go(target, false); }));

    const buildMessage = (data) => {
      const product = window.AYA.getProduct(data.product);
      const lines = [
        "Halo AYA RAOS, saya ingin mengirim inquiry B2B dari website.",
        "",
        `Konteks: ${data.businessType || "-"}`,
        `Usaha/Perusahaan/Organisasi: ${data.company || "-"}`,
        `PIC: ${data.pic || "-"}`,
        `WhatsApp: ${data.whatsapp || "-"}`,
        `Email: ${data.email || "-"}`,
        `Produk: ${product?.name || data.product || "-"}`,
        `Estimasi jumlah: ${data.estimatedQty || "-"}`,
        `Tanggal kebutuhan: ${data.neededDate || "-"}`,
        `Lokasi: ${data.location || "-"}`
      ];
      if (data.extras) lines.push(`Kebutuhan tambahan: ${data.extras}`);
      if (data.notes) lines.push(`Catatan: ${data.notes}`);
      lines.push("", "Inquiry ini belum merupakan order, quotation, jaminan kapasitas, atau persetujuan harga.");
      return lines.join("\n");
    };

    submitButton?.addEventListener("click", () => {
      const third = validateStep(3);
      if (!third.valid) return;
      const first = validateStep(1);
      if (!first.valid) { go(1, false); return; }
      const second = validateStep(2);
      if (!second.valid) { go(2, false); return; }
      go(3, false);
      persist();
      const url = window.AYA.buildWhatsAppUrl(buildMessage(third.data));
      if (!url) {
        showErrors(["WhatsApp belum tersedia. Silakan coba kembali nanti."]);
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    });

    form.addEventListener("input", persist);
    go(1, false);
  });
})();

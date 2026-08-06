(() => {
  "use strict";
  const KEY = "ayaRaos.businessDraft.v2";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;
    const form = document.querySelector("[data-business-inquiry-form]");
    if (!form) return;
    const errors = document.querySelector("[data-business-errors]");
    const saveState = document.querySelector("[data-business-save-state]");
    const productSelect = document.querySelector("[data-supply-product]");
    const submitButton = document.querySelector("[data-submit-business]");
    const successPanel = document.querySelector("[data-business-success]");
    const businessNumber = document.querySelector("[data-business-number]");
    const businessWhatsApp = document.querySelector("[data-business-whatsapp]");
    const copyButton = document.querySelector("[data-copy-business-id]");

    const eligible = window.AYA.products().filter((product) => product.supplyEligible);
    productSelect.innerHTML += eligible.map((product) => `<option value="${window.AYA.escapeHTML(product.id)}">${window.AYA.escapeHTML(product.name)}${product.orderable ? "" : " — perlu evaluasi"}</option>`).join("") + '<option value="other">Produk lain — perlu evaluasi</option>';

    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
    const write = (value) => { try { localStorage.setItem(KEY, JSON.stringify(value)); return true; } catch { return false; } };
    let draft = read();

    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else if (value != null && typeof value !== "object") field.value = String(value);
    });

    const showErrors = (messages) => {
      errors.hidden = !messages.length;
      errors.innerHTML = messages.length ? `<strong>Periksa data berikut:</strong><ul>${messages.map((message) => `<li>${window.AYA.escapeHTML(message)}</li>`).join("")}</ul>` : "";
      if (messages.length) errors.focus();
    };

    const validate = () => {
      const data = Object.fromEntries(new FormData(form));
      const messages = [];
      const required = {
        company: "Nama usaha atau perusahaan wajib diisi.", businessType: "Jenis usaha wajib dipilih.",
        pic: "Nama PIC wajib diisi.", role: "Jabatan atau peran PIC wajib diisi.",
        whatsapp: "Nomor WhatsApp wajib diisi.", email: "Email wajib diisi.",
        product: "Produk yang dibutuhkan wajib dipilih.", intendedUse: "Penggunaan produk wajib dipilih.",
        volume: "Estimasi volume per pengiriman wajib diisi.", frequency: "Frekuensi pasokan berulang wajib dipilih.",
        location: "Lokasi pasokan wajib diisi.", startDate: "Rencana mulai wajib diisi."
      };
      Object.entries(required).forEach(([name, message]) => { if (!String(data[name] || "").trim()) messages.push(message); });
      if (data.frequency && !["weekly", "biweekly", "monthly", "seasonal", "other-recurring"].includes(data.frequency)) messages.push("Frekuensi harus menunjukkan kebutuhan berulang.");
      if (!data.consent) messages.push("Pernyataan pemahaman wajib disetujui.");
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) messages.push("Format email belum valid.");
      showErrors(messages);
      return { valid: !messages.length, data: { ...data, consent: Boolean(data.consent), schemaVersion: 1 } };
    };

    const persistDraft = (data) => {
      draft = { ...draft, ...data, savedAt: new Date().toISOString() };
      return write(draft);
    };

    document.querySelector("[data-save-business-draft]")?.addEventListener("click", () => {
      const result = validate();
      if (!result.valid) return;
      if (!persistDraft(result.data)) { showErrors(["Penyimpanan browser tidak tersedia. Draft tidak dapat disimpan."]); return; }
      saveState.hidden = false;
      saveState.innerHTML = '<strong>Draft tersimpan di perangkat ini.</strong><p>Data belum dikirim sampai tombol pengajuan digunakan.</p>';
      saveState.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    const buildMessage = (result, data) => [
      "Halo AYA RAOS, saya sudah mengirim kebutuhan pasokan berkala melalui website.", "",
      `Business Inquiry ID: ${result.inquiryNumber}`, `Usaha: ${data.company}`, `PIC: ${data.pic} — ${data.role}`,
      `Produk: ${data.product}`, `Penggunaan: ${data.intendedUse}`, `Volume/pengiriman: ${data.volume}`,
      `Frekuensi: ${data.frequency}`, `Lokasi: ${data.location}`, `Rencana mulai: ${data.startDate}`,
      "", "Pengajuan ini belum merupakan order, quotation, jaminan kapasitas, atau persetujuan harga."
    ].join("\n");

    const showSuccess = (result, data) => {
      draft.submittedInquiry = result;
      write(draft);
      businessNumber.textContent = result.inquiryNumber;
      businessWhatsApp.href = window.AYA.buildWhatsAppUrl(buildMessage(result, data));
      successPanel.hidden = false;
      submitButton.disabled = true;
      submitButton.textContent = "Pengajuan Sudah Tersimpan";
      successPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    if (draft.submittedInquiry?.inquiryNumber) showSuccess(draft.submittedInquiry, draft);

    submitButton?.addEventListener("click", async () => {
      const result = validate();
      if (!result.valid) return;
      if (!window.AYA_ORDER_API?.isConfigured || !window.AYA_CONFIG?.businessSupply?.persistence) {
        showErrors(["Layanan pengajuan pasokan belum tersedia. Silakan coba kembali nanti."]);
        return;
      }
      draft.idempotencyKey = draft.idempotencyKey || window.AYA_ORDER_API.idempotencyKey();
      persistDraft(result.data);
      submitButton.disabled = true;
      submitButton.textContent = "Menyimpan pengajuan…";
      showErrors([]);
      try {
        const response = await window.AYA_ORDER_API.createBusinessInquiry(result.data, draft.idempotencyKey);
        if (!response?.inquiryNumber) throw new Error("Server tidak mengembalikan Business Inquiry ID.");
        showSuccess(response, result.data);
      } catch (error) {
        submitButton.disabled = false;
        submitButton.textContent = "Coba Kirim Pengajuan Lagi";
        showErrors([error?.message || "Pengajuan belum tersimpan. Silakan coba kembali."]);
      }
    });

    form.addEventListener("input", () => {
      if (!draft.submittedInquiry) return;
      draft.submittedInquiry = null;
      draft.idempotencyKey = null;
      write(draft);
      successPanel.hidden = true;
      submitButton.disabled = false;
      submitButton.textContent = "Kirim Pengajuan & Dapatkan Inquiry ID";
    });

    copyButton?.addEventListener("click", async () => {
      const id = draft.submittedInquiry?.inquiryNumber;
      if (!id) return;
      try { await navigator.clipboard.writeText(id); window.AYA.toast("Business Inquiry ID disalin.", "success"); }
      catch { window.AYA.toast("Business Inquiry ID belum dapat disalin otomatis.", "error"); }
    });

    document.querySelector("[data-business-help]")?.addEventListener("click", () => {
      window.AYA.openWhatsApp("Halo AYA RAOS, saya ingin memahami prosedur pasokan berkala untuk usaha.");
    });
  });
})();

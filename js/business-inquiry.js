(() => {
  "use strict";
  const KEY = "ayaRaos.businessDraft.v1";

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;
    const form = document.querySelector("[data-business-inquiry-form]");
    if (!form) return;
    const errors = document.querySelector("[data-business-errors]");
    const saveState = document.querySelector("[data-business-save-state]");
    const productSelect = document.querySelector("[data-supply-product]");

    const eligible = window.AYA.products().filter((product) => product.supplyEligible);
    productSelect.innerHTML += eligible.map((product) => `<option value="${window.AYA.escapeHTML(product.id)}">${window.AYA.escapeHTML(product.name)}${product.orderable ? "" : " — belum tersedia"}</option>`).join("") + '<option value="other">Produk lain — perlu evaluasi</option>';

    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
    const write = (value) => { try { localStorage.setItem(KEY, JSON.stringify(value)); return true; } catch { return false; } };

    const draft = read();
    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (!field) return;
      if (field.type === "checkbox") field.checked = Boolean(value);
      else if (value != null) field.value = String(value);
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
        company: "Nama usaha atau perusahaan wajib diisi.",
        businessType: "Jenis usaha wajib dipilih.",
        pic: "Nama PIC wajib diisi.",
        role: "Jabatan atau peran PIC wajib diisi.",
        whatsapp: "Nomor WhatsApp wajib diisi.",
        email: "Email wajib diisi.",
        product: "Produk yang dibutuhkan wajib dipilih.",
        intendedUse: "Penggunaan produk wajib dipilih.",
        volume: "Estimasi volume per pengiriman wajib diisi.",
        frequency: "Frekuensi pasokan berulang wajib dipilih.",
        location: "Lokasi pasokan wajib diisi.",
        startDate: "Rencana mulai wajib diisi."
      };
      Object.entries(required).forEach(([name, message]) => { if (!String(data[name] || "").trim()) messages.push(message); });
      if (data.frequency && !["weekly", "biweekly", "monthly", "seasonal", "other-recurring"].includes(data.frequency)) messages.push("Frekuensi harus menunjukkan kebutuhan berulang.");
      if (!data.consent) messages.push("Pernyataan pemahaman wajib disetujui.");
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) messages.push("Format email belum valid.");
      showErrors(messages);
      return { valid: !messages.length, data: { ...data, consent: Boolean(data.consent), savedAt: new Date().toISOString(), schemaVersion: 1 } };
    };

    document.querySelector("[data-save-business-draft]")?.addEventListener("click", () => {
      const result = validate();
      if (!result.valid) return;
      if (!write(result.data)) {
        showErrors(["Penyimpanan browser tidak tersedia. Draft tidak dapat disimpan."]);
        return;
      }
      saveState.hidden = false;
      saveState.innerHTML = '<strong>Draft tersimpan di perangkat ini.</strong><p>Data belum dikirim ke AYA dan belum memiliki Business Inquiry ID.</p>';
      saveState.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    document.querySelector("[data-business-help]")?.addEventListener("click", () => {
      window.AYA.openWhatsApp("Halo AYA RAOS, saya ingin memahami prosedur pasokan berkala untuk usaha. Saya belum mengirim pengajuan melalui website.");
    });
  });
})();

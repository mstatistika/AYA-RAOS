(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-testimonial-form]");
    const status = document.querySelector("[data-form-status]");
    if (!form || !status) return;

    function setStatus(message, type) {
      status.textContent = message;
      status.className = `form-status show ${type}`;
      status.focus();
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const file = form.elements.media.files[0];
      if (file && file.size > 10 * 1024 * 1024) {
        setStatus("Ukuran foto atau video maksimal 10 MB.", "error");
        return;
      }

      const endpoint = window.AYA.config.testimonialEndpoint;
      const formData = new FormData(form);
      formData.append("status", "pending");
      formData.append("submittedAt", new Date().toISOString());

      try {
        if (endpoint) {
          const response = await fetch(endpoint, { method: "POST", body: formData });
          if (!response.ok) throw new Error("Gagal mengirim testimoni");
        } else {
          const pending = JSON.parse(localStorage.getItem("aya-pending-testimonials") || "[]");
          pending.push({
            name: formData.get("name"),
            city: formData.get("city"),
            product: formData.get("product"),
            testimonial: formData.get("testimonial"),
            displayType: formData.get("displayType"),
            hasMedia: Boolean(file),
            status: "pending",
            submittedAt: new Date().toISOString()
          });
          localStorage.setItem("aya-pending-testimonials", JSON.stringify(pending));
        }

        form.reset();
        setStatus(
          endpoint
            ? "Terima kasih. Testimoni sudah dikirim dan menunggu persetujuan admin AYA."
            : "Mode preview: testimoni tersimpan sebagai pending di browser ini. Sambungkan testimonialEndpoint agar dapat masuk ke admin AYA.",
          "success"
        );
      } catch (error) {
        setStatus("Testimoni belum berhasil dikirim. Silakan coba lagi atau hubungi AYA melalui WhatsApp.", "error");
      }
    });
  });
})();

(() => {
  const STORAGE_KEY =
    "aya-raos-testimonial-submissions";

  const fallbackTestimonials = [
    {
      quote:
        "Makan di CFC pun tetap pakai Sambal Bawang AYA.",
      name: "@Rafaelers",
      meta: "Sambal Bawang"
    },
    {
      quote:
        "Enak bangettt—jadi stok pendamping makan di rumah.",
      name: "Pelanggan AYA",
      meta: "Bawang Goreng"
    },
    {
      quote:
        "Rasanya gurih, renyah, dan bikin nasi hangat langsung habis.",
      name: "@dapur.nita",
      meta: "Bawang Goreng"
    }
  ];

  function getTestimonials() {
    const fromData =
      window.AYA_TESTIMONIALS?.texts;

    if (
      Array.isArray(fromData) &&
      fromData.length
    ) {
      return fromData;
    }

    return fallbackTestimonials;
  }

  function renderTestimonials() {
    const wall =
      document.querySelector(
        "[data-testimonial-wall]"
      );

    if (!wall) return;

    const items =
      getTestimonials().slice(0, 8);

    wall.replaceChildren();

    items.forEach(item => {
      const article =
        document.createElement("article");

      article.className =
        "testimonial-written-card";

      const quote =
        document.createElement("p");

      quote.textContent =
        `“${item.quote || ""}”`;

      const footer =
        document.createElement("footer");

      const name =
        document.createElement("strong");

      name.textContent =
        item.name || "Pelanggan AYA";

      const meta =
        document.createElement("span");

      meta.textContent =
        item.meta ||
        item.product ||
        "Produk AYA";

      footer.append(name, meta);
      article.append(quote, footer);
      wall.appendChild(article);
    });
  }

  function populateProducts() {
    const select =
      document.querySelector("#product");

    if (!select) return;

    const products =
      window.AYA_PRODUCTS ||
      window.AYA?.products ||
      [];

    select.replaceChildren();

    const placeholder =
      document.createElement("option");

    placeholder.value = "";
    placeholder.textContent =
      "Pilih produk";

    select.appendChild(placeholder);

    products.forEach(product => {
      if (!product?.id || !product?.name) {
        return;
      }

      const option =
        document.createElement("option");

      option.value = product.id;
      option.textContent = product.name;

      select.appendChild(option);
    });
  }

  function getProductName(productId) {
    const products =
      window.AYA_PRODUCTS ||
      window.AYA?.products ||
      [];

    return (
      products.find(
        product =>
          product.id === productId
      )?.name ||
      productId
    );
  }

  function saveLocally(payload) {
    const current = JSON.parse(
      localStorage.getItem(
        STORAGE_KEY
      ) || "[]"
    );

    current.push(payload);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(current)
    );
  }

  function bindForm() {
    const form =
      document.querySelector(
        "[data-testimonial-form]"
      );

    const status =
      document.querySelector(
        "[data-form-status]"
      );

    if (!form || !status) return;

    form.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        status.className =
          "testimonial-form-status";

        status.textContent = "";

        const honeypot =
          form.elements.website;

        if (
          honeypot &&
          honeypot.value.trim()
        ) {
          form.reset();
          return;
        }

        if (!form.reportValidity()) {
          return;
        }

        const formData =
          new FormData(form);

        const productId =
          String(
            formData.get("product") || ""
          );

        const payload = {
          customerName:
            String(
              formData.get(
                "customerName"
              ) || ""
            ).trim(),

          productId,

          productName:
            getProductName(productId),

          testimonial:
            String(
              formData.get(
                "testimonial"
              ) || ""
            ).trim(),

          mediaType:
            String(
              formData.get(
                "mediaType"
              ) || "text"
            ),

          mediaUrl:
            String(
              formData.get(
                "mediaUrl"
              ) || ""
            ).trim(),

          consent:
            Boolean(
              formData.get("consent")
            ),

          status: "pending",

          submittedAt:
            new Date().toISOString()
        };

        const submitButton =
          form.querySelector(
            'button[type="submit"]'
          );

        const originalText =
          submitButton?.textContent;

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent =
            "Mengirim…";
        }

        try {
          const endpoint =
            window.AYA_CONFIG
              ?.testimonialEndpoint
              ?.trim();

          if (endpoint) {
            const response =
              await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json"
                },
                body: JSON.stringify(payload)
              });

            if (!response.ok) {
              throw new Error(
                "Endpoint menolak kiriman."
              );
            }
          } else {
            saveLocally(payload);
          }

          form.reset();

          status.classList.add(
            "is-success"
          );

          status.textContent =
            "Terima kasih. Testimoni Anda sudah diterima dan menunggu persetujuan.";
        } catch (error) {
          console.error(
            "Testimonial submission error:",
            error
          );

          status.classList.add(
            "is-error"
          );

          status.textContent =
            "Testimoni belum berhasil dikirim. Silakan coba kembali.";
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
              originalText;
          }
        }
      }
    );
  }

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      renderTestimonials();
      populateProducts();
      bindForm();
    }
  );
})();

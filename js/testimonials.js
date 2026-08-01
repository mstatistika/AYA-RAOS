(() => {
  const fallbackTestimonials =
    window.AYA_TESTIMONIALS
      ?.texts || [];

  const make = (
    tag,
    className = "",
    text
  ) => {
    const node =
      document.createElement(tag);

    if (className) {
      node.className =
        className;
    }

    if (text !== undefined) {
      node.textContent = text;
    }

    return node;
  };

  function normalizeRemoteItem(
    item
  ) {
    return {
      quote:
        item.public_text || "",

      name:
        item.display_name ||
        "Pelanggan AYA",

      meta: [
        item.product_name,
        item.city
      ]
        .filter(Boolean)
        .join(" · "),

      format:
        item.testimonial_format ||
        "text",

      mediaUrl:
        item.public_media_url ||
        "",

      featured:
        Boolean(
          item.is_featured
        )
    };
  }

  function renderTestimonials(
    items
  ) {
    const wall =
      document.querySelector(
        "[data-testimonial-wall]"
      );

    if (!wall) return;

    wall.replaceChildren();

    const visibleItems =
      items.slice(0, 10);

    if (!visibleItems.length) {
      const empty =
        make(
          "div",
          "testimonial-empty-state"
        );

      empty.appendChild(
        make(
          "strong",
          "",
          "Testimoni sedang disiapkan."
        )
      );

      empty.appendChild(
        make(
          "p",
          "",
          "Pengalaman pelanggan akan tampil setelah melalui proses persetujuan."
        )
      );

      wall.appendChild(empty);
      return;
    }

    visibleItems.forEach(item => {
      const article =
        make(
          "article",
          "testimonial-written-card"
        );

      const quote =
        make(
          "p",
          "",
          `“${item.quote || ""}”`
        );

      const footer =
        document.createElement(
          "footer"
        );

      footer.append(
        make(
          "strong",
          "",
          item.name ||
            "Pelanggan AYA"
        ),

        make(
          "span",
          "",
          item.meta ||
            "Produk AYA"
        )
      );

      article.append(
        quote,
        footer
      );

      wall.appendChild(article);
    });
  }

  async function loadApproved() {
    const wall =
      document.querySelector(
        "[data-testimonial-wall]"
      );

    if (!wall) return;

    renderTestimonials(
      fallbackTestimonials
    );

    if (
      !window.AYA_SUPABASE
        ?.isConfigured
    ) {
      return;
    }

    try {
      const data =
        await window
          .AYA_SUPABASE
          .rpc(
            "get_approved_aya_testimonials",
            {
              p_environment:
                window
                  .AYA_SUPABASE
                  .environment
            }
          );

      if (
        Array.isArray(data) &&
        data.length
      ) {
        renderTestimonials(
          data.map(
            normalizeRemoteItem
          )
        );
      }
    } catch (error) {
      console.warn(
        "AYA approved testimonials:",
        error
      );
    }
  }

  function populateProducts() {
    const select =
      document.querySelector(
        "#product"
      );

    if (!select) return;

    const products =
      window.AYA_PRODUCTS ||
      window.AYA?.products ||
      [];

    select.replaceChildren();

    const placeholder =
      document.createElement(
        "option"
      );

    placeholder.value = "";
    placeholder.textContent =
      "Pilih produk";

    select.appendChild(
      placeholder
    );

    products.forEach(product => {
      if (
        !product?.id ||
        !product?.name
      ) {
        return;
      }

      const option =
        document.createElement(
          "option"
        );

      option.value =
        product.id;

      option.textContent =
        product.name;

      select.appendChild(
        option
      );
    });
  }

  function getProductName(
    productId
  ) {
    const products =
      window.AYA_PRODUCTS ||
      window.AYA?.products ||
      [];

    return (
      products.find(
        product =>
          product.id ===
          productId
      )?.name ||
      productId
    );
  }

  function setStatus(
    status,
    message,
    type = ""
  ) {
    status.className =
      "testimonial-form-status";

    if (type) {
      status.classList.add(
        `is-${type}`
      );
    }

    status.textContent =
      message;

    if (message) {
      status.focus({
        preventScroll: true
      });
    }
  }

  function applyFormat(
    form,
    selectedFormat
  ) {
    form
      .querySelectorAll(
        "[data-format-field]"
      )
      .forEach(field => {
        const isMatch =
          field.dataset
            .formatField ===
          selectedFormat;

        field.hidden = !isMatch;

        field
          .querySelectorAll(
            "input, textarea, select"
          )
          .forEach(input => {
            input.disabled =
              !isMatch;

            input.required =
              isMatch;
          });
      });
  }

  function bindFormatFields(
    form
  ) {
    const radios = [
      ...form.querySelectorAll(
        "[data-format-toggle]"
      )
    ];

    if (!radios.length) {
      return;
    }

    const update = () => {
      const selected =
        form.querySelector(
          "[data-format-toggle]:checked"
        )?.value || "text";

      applyFormat(
        form,
        selected
      );
    };

    radios.forEach(radio => {
      radio.addEventListener(
        "change",
        update
      );
    });

    update();
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

    if (!form || !status) {
      return;
    }

    bindFormatFields(form);

    form.addEventListener(
      "submit",
      async event => {
        event.preventDefault();

        setStatus(
          status,
          ""
        );

        const honeypot =
          form.elements.website;

        if (
          honeypot &&
          honeypot.value.trim()
        ) {
          form.reset();
          applyFormat(
            form,
            "text"
          );
          return;
        }

        if (
          !form.reportValidity()
        ) {
          return;
        }

        if (
          !window.AYA_SUPABASE
            ?.isConfigured
        ) {
          setStatus(
            status,
            "Sistem pengiriman testimoni belum terhubung.",
            "error"
          );
          return;
        }

        const formData =
          new FormData(form);

        const productId =
          String(
            formData.get(
              "product"
            ) || ""
          );

        const format =
          String(
            formData.get(
              "testimonialFormat"
            ) || "text"
          );

        let mediaUrl = "";

        if (
          format === "photo"
        ) {
          mediaUrl =
            String(
              formData.get(
                "photoUrl"
              ) || ""
            ).trim();
        }

        if (
          format === "video"
        ) {
          mediaUrl =
            String(
              formData.get(
                "videoUrl"
              ) || ""
            ).trim();
        }

        const submitButton =
          form.querySelector(
            'button[type="submit"]'
          );

        const originalText =
          submitButton
            ?.textContent;

        if (submitButton) {
          submitButton.disabled =
            true;

          submitButton.textContent =
            "Mengirim…";
        }

        try {
          await window
            .AYA_SUPABASE
            .rpc(
              "submit_aya_testimonial",
              {
                p_display_name:
                  String(
                    formData.get(
                      "customerName"
                    ) || ""
                  ).trim(),

                p_city:
                  String(
                    formData.get(
                      "city"
                    ) || ""
                  ).trim(),

                p_email:
                  String(
                    formData.get(
                      "email"
                    ) || ""
                  ).trim(),

                p_product_id:
                  productId,

                p_product_name:
                  getProductName(
                    productId
                  ),

                p_testimonial_text:
                  String(
                    formData.get(
                      "testimonial"
                    ) || ""
                  ).trim(),

                p_testimonial_format:
                  format,

                p_media_url:
                  mediaUrl || null,

                p_consent_to_publish:
                  Boolean(
                    formData.get(
                      "consent"
                    )
                  ),

                p_environment:
                  window
                    .AYA_SUPABASE
                    .environment,

                p_website:
                  String(
                    formData.get(
                      "website"
                    ) || ""
                  )
              }
            );

          form.reset();

          applyFormat(
            form,
            "text"
          );

          setStatus(
            status,
            "Terima kasih. Testimoni Anda sudah diterima dan menunggu persetujuan.",
            "success"
          );
        } catch (error) {
          console.error(
            "AYA testimonial submission:",
            error
          );

          setStatus(
            status,
            error?.message ||
              "Testimoni belum berhasil dikirim. Silakan coba kembali.",
            "error"
          );
        } finally {
          if (submitButton) {
            submitButton.disabled =
              false;

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
      loadApproved();
      populateProducts();
      bindForm();
    }
  );
})();

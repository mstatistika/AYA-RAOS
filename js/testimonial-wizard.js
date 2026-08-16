(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-testimonial-wizard]");
    if (!form) return;

    const shell = document.querySelector("[data-wizard-shell]");
    const sidebar = document.querySelector("[data-wizard-sidebar]");
    const indicators = [...document.querySelectorAll("[data-step-indicator]")];
    const editWorkspace = form.querySelector("[data-edit-workspace]");
    const reviewWorkspace = form.querySelector("[data-review-workspace]");
    const success = document.querySelector("[data-wizard-success]");
    const reviewNext = form.querySelector("[data-review-next]");
    const reviewBack = form.querySelector("[data-review-back]");
    const submitButton = form.querySelector("[data-wizard-submit]");
    const editError = form.querySelector("[data-step-error]");
    const reviewError = form.querySelector("[data-review-error]");
    const statusBox = form.querySelector("[data-submit-status]");
    const formatRadios = [...form.querySelectorAll('[name="testimonialFormat"]')];
    const storyInput = form.elements.testimonial;
    const characterCount = form.querySelector("[data-character-count]");
    const storyAudioHelp = form.querySelector("[data-story-audio-help]");
    const mediaWorkspace = form.querySelector("[data-media-workspace]");
    const mediaEmpty = form.querySelector("[data-media-empty]");
    const mediaEmptyTitle = form.querySelector("[data-media-empty-title]");
    const mediaFileInput = form.querySelector("[data-media-file]");
    const mediaUploadButton = form.querySelector("[data-media-upload]");
    const mediaUploadLabel = form.querySelector("[data-media-upload-label]");
    const mediaLinkToggle = form.querySelector("[data-media-link-toggle]");
    const mediaHint = form.querySelector("[data-media-hint]");
    const mediaLinkField = form.querySelector("[data-media-link-field]");
    const mediaUrlInput = form.querySelector("[data-media-url]");
    const mediaLinkLabel = form.querySelector("[data-media-link-label]");
    const mediaLinkHelp = form.querySelector("[data-media-link-help]");
    const mediaLinkClear = form.querySelector("[data-media-link-clear]");
    const mediaSelection = form.querySelector("[data-media-selection]");
    const mediaSelectionImage = form.querySelector("[data-media-selection-image]");
    const mediaSelectionVideo = form.querySelector("[data-media-selection-video]");
    const mediaSelectionFallback = form.querySelector("[data-media-selection-fallback]");
    const mediaSelectionName = form.querySelector("[data-media-selection-name]");
    const mediaSelectionSize = form.querySelector("[data-media-selection-size]");
    const mediaChangeButton = form.querySelector("[data-media-change]");
    const mediaRemoveButton = form.querySelector("[data-media-remove]");
    const audioState = form.querySelector("[data-audio-state]");
    const audioTitle = form.querySelector("[data-audio-title]");
    const audioCopy = form.querySelector("[data-audio-copy]");
    const textCompanion = form.querySelector("[data-text-companion]");
    const textCompanionImage = form.querySelector("[data-text-companion-image]");
    const textCompanionPlaceholder = form.querySelector("[data-text-companion-placeholder]");
    const textCompanionName = form.querySelector("[data-text-companion-name]");
    const textCompanionCopy = form.querySelector("[data-text-companion-copy]");

    const state = {
      view: "edit",
      format: "text",
      mediaMethod: null,
      mediaFile: null,
      externalUrl: "",
      objectUrl: null,
      uploadedPath: null,
      audioStatus: "not-applicable"
    };

    const mediaRules = {
      photo: {
        emptyTitle: "Tambahkan foto",
        uploadLabel: "Upload foto",
        hint: "JPG, PNG, atau WebP · maksimal 8 MB.",
        accept: ["image/jpeg", "image/png", "image/webp"],
        acceptAttribute: "image/jpeg,image/png,image/webp",
        maxBytes: 8 * 1024 * 1024,
        linkLabel: "Link foto",
        linkHelp: "Gunakan link HTTPS yang dapat dibuka."
      },
      video: {
        emptyTitle: "Tambahkan video",
        uploadLabel: "Upload video",
        hint: "MP4, MOV, atau WebM · maksimal 40 MB.",
        accept: ["video/mp4", "video/quicktime", "video/webm"],
        acceptAttribute: "video/mp4,video/quicktime,video/webm",
        maxBytes: 40 * 1024 * 1024,
        linkLabel: "Link video",
        linkHelp: "Gunakan link HTTPS yang dapat dibuka."
      }
    };

    function getProducts() {
      if (typeof window.AYA?.products === "function") return window.AYA.products();
      return Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : [];
    }

    function populateProducts() {
      const select = form.elements.product;
      const value = select.value;
      select.replaceChildren(new Option("Pilih produk", ""));
      getProducts().filter((product) => product?.id && product?.name).forEach((product) => select.add(new Option(product.name, product.id)));
      select.value = value;
    }

    function getProductName(productId) {
      return getProducts().find((product) => product.id === productId)?.name || productId || "—";
    }

    function getProduct(productId) {
      return getProducts().find((product) => product.id === productId) || null;
    }

    function renderTextCompanion() {
      if (!textCompanion) return;

      const product = getProduct(form.elements.product.value);

      if (!product) {
        textCompanionImage.hidden = true;
        textCompanionImage.removeAttribute("src");
        textCompanionPlaceholder.hidden = false;
        textCompanionName.textContent = "Pilih produk AYA";
        textCompanionCopy.textContent =
          "Pilih produk di bagian Tentang kamu. Cerita tulisanmu akan ditampilkan bersama foto produk AYA tersebut.";
        return;
      }

      const image =
        product.image ||
        product.images?.[0] ||
        product.placeholder ||
        "";

      textCompanionName.textContent = product.name;
      textCompanionCopy.textContent =
        `Saat dipublikasikan, cerita tulisanmu akan disandingkan dengan foto ${product.name} dari katalog AYA.`;

      textCompanionPlaceholder.hidden = Boolean(image);
      textCompanionImage.hidden = !image;

      if (image) {
        textCompanionImage.onerror = () => {
          if (
            product.placeholder &&
            textCompanionImage.src &&
            !textCompanionImage.src.endsWith(product.placeholder)
          ) {
            textCompanionImage.src = product.placeholder;
            return;
          }

          textCompanionImage.hidden = true;
          textCompanionPlaceholder.hidden = false;
        };

        textCompanionImage.src = image;
        textCompanionImage.alt = product.name;
      }
    }

    function formatBytes(bytes) {
      if (!Number.isFinite(bytes) || bytes <= 0) return "";
      if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function isValidHttpsUrl(value) {
      try { return new URL(value).protocol === "https:"; }
      catch { return false; }
    }

    function clearMessages() {
      editError.textContent = "";
      reviewError.textContent = "";
      statusBox.textContent = "";
      statusBox.className = "testimonial-submit-status";
    }

    function setError(message, target, review = false) {
      (review ? reviewError : editError).textContent = message;
      target?.focus?.();
    }

    function revokeObjectUrl() {
      if (!state.objectUrl) return;
      URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = null;
    }

    function resetPreview() {
      mediaSelectionImage.hidden = true;
      mediaSelectionVideo.hidden = true;
      mediaSelectionFallback.hidden = true;
      mediaSelectionImage.onerror = null;
      mediaSelectionImage.removeAttribute("src");
      try { mediaSelectionVideo.pause(); } catch {}
      mediaSelectionVideo.removeAttribute("src");
    }

    function renderAudioState() {
      const isVideo = state.format === "video";

      audioState.hidden = !isVideo;
      if (!isVideo) return;

      if (state.externalUrl && !state.mediaFile) {
        audioTitle.textContent = "Audio link tidak diperiksa";
        audioCopy.textContent =
          "Pemeriksaan audio otomatis hanya tersedia untuk file video yang diunggah langsung.";
        audioState.dataset.status = "unknown";
        return;
      }

      if (!state.mediaFile && !state.externalUrl) {
        audioTitle.textContent = "Audio belum diperiksa";
        audioCopy.textContent =
          "Status audio akan diperiksa setelah video dipilih.";
        audioState.dataset.status = "unknown";
        return;
      }

      const messages = {
        checking: [
          "Memeriksa suara…",
          "Cerita tertulis tetap wajib selama audio diperiksa."
        ],
        audible: [
          "Suara terdeteksi",
          "Video memiliki audio. Tambahkan cerita tertulis agar proses peninjauan lebih lengkap."
        ],
        silent: [
          "Video tanpa suara",
          "Cerita tertulis wajib agar pengalamanmu tetap dapat dipahami."
        ],
        unknown: [
          "Audio belum dapat dipastikan",
          "Cerita tertulis wajib agar pengalamanmu tetap dapat dipahami."
        ]
      };

      const [title, copy] =
        messages[state.audioStatus] || messages.unknown;

      audioTitle.textContent = title;
      audioCopy.textContent = copy;
      audioState.dataset.status = state.audioStatus;
    }

    function syncPreviewMediaState() {
      const isVideo = state.format === "video";
      const hasFile = Boolean(state.mediaFile);
      const hasUrl = Boolean(state.externalUrl);

      if (isVideo) {
        mediaSelectionImage.hidden = true;
        mediaSelectionImage.removeAttribute("src");
        mediaSelectionImage.removeAttribute("alt");

        if (!hasFile) {
          mediaSelectionVideo.hidden = true;
          mediaSelectionVideo.pause();
          mediaSelectionVideo.removeAttribute("src");
          mediaSelectionVideo.load();
        }
      } else {
        mediaSelectionVideo.hidden = true;
        mediaSelectionVideo.pause();
        mediaSelectionVideo.removeAttribute("src");
        mediaSelectionVideo.load();
      }

      if (!hasFile && !hasUrl) {
        mediaSelectionFallback.hidden = true;
      }
    }

    function updateStoryRequirement() {
      // Backend RPC current contract requires 15–800 characters for every format.
      // Keep the frontend contract aligned until the Supabase contract is explicitly reopened.
      storyInput.required = true;
      if (state.format === "text") storyAudioHelp.textContent = "Cerita tertulis wajib untuk testimoni tulisan.";
      else if (state.format === "photo") storyAudioHelp.textContent = "Cerita tertulis wajib agar foto memiliki konteks yang jelas saat ditinjau.";
      else if (state.audioStatus === "checking") storyAudioHelp.textContent = "Sedang memeriksa suara. Cerita tertulis tetap wajib untuk melanjutkan.";
      else if (state.audioStatus === "audible") storyAudioHelp.textContent = "Suara terdeteksi. Tambahkan cerita tertulis agar proses peninjauan lebih lengkap.";
      else if (state.audioStatus === "silent") storyAudioHelp.textContent = "Video terdeteksi tanpa suara. Cerita tertulis wajib agar pengalamanmu tetap dapat dipahami.";
      else storyAudioHelp.textContent = "Audio belum dapat dipastikan. Cerita tertulis wajib agar pengalamanmu tetap dapat dipahami.";
      syncPreviewMediaState();
      renderAudioState();
    }

    function clearMediaSelection(options = {}) {
      revokeObjectUrl();
      state.mediaFile = null;
      state.externalUrl = "";
      state.uploadedPath = null;
      mediaFileInput.value = "";
      mediaUrlInput.value = "";
      state.audioStatus = state.format === "video" ? "unknown" : "not-applicable";
      mediaSelection.hidden = true;
      mediaEmpty.hidden = false;
      resetPreview();
      if (!options.keepMethod) {
        state.mediaMethod = null;
        mediaLinkField.hidden = false;
        mediaLinkToggle.setAttribute("aria-expanded", "true");
      }
      updateStoryRequirement();
    }

    function renderSelection() {
      resetPreview();
      const upload = state.mediaMethod === "upload" && state.mediaFile;
      const link = state.mediaMethod === "link" && isValidHttpsUrl(state.externalUrl);
      const hasMedia = Boolean(upload || link);
      mediaSelection.hidden = !hasMedia;
      mediaEmpty.hidden = hasMedia;
      if (!hasMedia) { renderAudioState(); return; }

      if (upload) {
        if (!state.objectUrl) state.objectUrl = URL.createObjectURL(state.mediaFile);
        mediaSelectionName.textContent = state.mediaFile.name;
        mediaSelectionSize.textContent = formatBytes(state.mediaFile.size);
        if (state.format === "photo") {
          mediaSelectionImage.src = state.objectUrl;
          mediaSelectionImage.hidden = false;
        } else {
          mediaSelectionVideo.src = state.objectUrl;
          mediaSelectionVideo.hidden = false;
        }
      } else {
        mediaSelectionName.textContent = state.format === "photo" ? "Link foto" : "Link video";
        mediaSelectionSize.textContent = "Link eksternal";
        if (state.format === "photo") {
          mediaSelectionImage.onerror = () => { mediaSelectionImage.hidden = true; mediaSelectionFallback.hidden = false; };
          mediaSelectionImage.src = state.externalUrl;
          mediaSelectionImage.hidden = false;
        } else {
          mediaSelectionFallback.hidden = false;
        }
      }
      syncPreviewMediaState();
      renderAudioState();
    }

    function setFormat(format, initial = false) {
      const normalized =
        ["text", "photo", "video"].includes(format)
          ? format
          : "text";

      const changed = normalized !== state.format;

      state.format = normalized;
      state.audioStatus =
        normalized === "video"
          ? "unknown"
          : "not-applicable";

      formatRadios.forEach((radio) => {
        radio.checked = radio.value === normalized;
      });

      if (!initial && changed) {
        clearMediaSelection();
      }

      const isText = normalized === "text";

      textCompanion.hidden = !isText;
      mediaWorkspace.hidden = isText;
      mediaWorkspace.setAttribute(
        "aria-hidden",
        String(isText)
      );

      if (isText) {
        renderTextCompanion();
      } else {
        const rules = mediaRules[normalized];

        mediaEmptyTitle.textContent = rules.emptyTitle;
        mediaUploadLabel.textContent = rules.uploadLabel;
        mediaHint.textContent = rules.hint;
        mediaFileInput.accept = rules.acceptAttribute;
        mediaLinkLabel.textContent = rules.linkLabel;
        mediaLinkHelp.textContent = rules.linkHelp;

        // Link row remains physically present for Foto / Video.
        mediaLinkField.hidden = false;
        mediaLinkToggle.setAttribute("aria-expanded", "true");
      }

      updateStoryRequirement();
    }

    function validateFile(file) {
      const rules = mediaRules[state.format];
      if (!rules) return "Pilih format foto atau video terlebih dahulu.";
      if (!rules.accept.includes(file.type)) return state.format === "photo" ? "Gunakan file JPG, PNG, atau WebP." : "Gunakan file MP4, MOV, atau WebM.";
      if (file.size > rules.maxBytes) return state.format === "photo" ? "Ukuran foto maksimal 8 MB." : "Ukuran video maksimal 40 MB.";
      return "";
    }

    async function detectVideoSound(file) {
      if (!file || !file.type.startsWith("video/")) return "unknown";
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return "unknown";
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.preload = "auto";
      video.playsInline = true;
      video.muted = false;
      video.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none";
      document.body.append(video);
      const ctx = new AudioCtx();
      let source, analyser, gain, frame;
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("metadata-timeout")), 4500);
          video.addEventListener("loadeddata", () => { clearTimeout(timeout); resolve(); }, { once: true });
          video.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("video-error")); }, { once: true });
        });
        source = ctx.createMediaElementSource(video);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        gain = ctx.createGain();
        gain.gain.value = 0;
        source.connect(analyser);
        analyser.connect(gain);
        gain.connect(ctx.destination);
        await ctx.resume();
        if (Number.isFinite(video.duration) && video.duration > 2) video.currentTime = Math.min(1, video.duration * 0.15);
        await video.play();
        const samples = new Uint8Array(analyser.fftSize);
        let peak = 0;
        const started = performance.now();
        await new Promise((resolve) => {
          const sample = () => {
            analyser.getByteTimeDomainData(samples);
            for (const value of samples) peak = Math.max(peak, Math.abs(value - 128));
            if (performance.now() - started >= 1600 || video.ended) return resolve();
            frame = requestAnimationFrame(sample);
          };
          sample();
        });
        video.pause();
        return peak >= 3 ? "audible" : "silent";
      } catch {
        return "unknown";
      } finally {
        if (frame) cancelAnimationFrame(frame);
        try { video.pause(); } catch {}
        try { source?.disconnect(); analyser?.disconnect(); gain?.disconnect(); } catch {}
        try { await ctx.close(); } catch {}
        video.remove();
        URL.revokeObjectURL(url);
      }
    }

    function validateEditWorkspace() {
      clearMessages();
      const controls = [...editWorkspace.querySelectorAll("input, select, textarea")].filter((control) => !control.disabled && !control.closest(".form-honeypot"));
      const invalid = controls.find((control) => !control.checkValidity());
      if (invalid) {
        setError(invalid.validationMessage || "Lengkapi bagian ini terlebih dahulu.", invalid);
        invalid.reportValidity();
        return false;
      }

      if (state.format !== "text") {
        if (state.mediaMethod === "upload" && state.mediaFile) return true;
        if (state.mediaMethod === "link") {
          state.externalUrl = mediaUrlInput.value.trim();
          if (isValidHttpsUrl(state.externalUrl)) return true;
          setError("Masukkan link HTTPS yang valid.", mediaUrlInput);
          return false;
        }
        setError(`Tambahkan ${state.format === "photo" ? "foto" : "video"} terlebih dahulu.`, mediaUploadButton);
        return false;
      }
      return true;
    }

    function updateReview() {
      const labels = { text: "Tulisan", photo: "Foto + tulisan", video: "Video + cerita" };
      form.querySelector("[data-review-name]").textContent = form.elements.customerName.value.trim() || "—";
      form.querySelector("[data-review-city]").textContent = form.elements.city.value.trim() || "—";
      form.querySelector("[data-review-product]").textContent = getProductName(form.elements.product.value);
      form.querySelector("[data-review-format]").textContent = labels[state.format];
      form.querySelector("[data-review-story]").textContent = `“${storyInput.value.trim()}”`;
    }

    function setView(view) {
      state.view = view === "review" ? "review" : "edit";
      editWorkspace.hidden = state.view !== "edit";
      reviewWorkspace.hidden = state.view !== "review";
      indicators.forEach((indicator) => {
        const number = Number(indicator.dataset.stepIndicator);
        indicator.classList.toggle("active", state.view === "review" ? number === 3 : number === 2);
        indicator.classList.toggle("complete", state.view === "review" && number < 3);
        if ((state.view === "review" && number === 3) || (state.view === "edit" && number === 2)) indicator.setAttribute("aria-current", "step");
        else indicator.removeAttribute("aria-current");
      });
      if (state.view === "review") {
        updateReview();
        reviewWorkspace.querySelector("h2")?.focus({ preventScroll: true });
      } else {
        form.querySelector("#identityTitle")?.focus?.({ preventScroll: true });
      }
      window.scrollTo({ top: Math.max(0, form.offsetTop - 90), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }

    form.elements.product.addEventListener("change", renderTextCompanion);
    formatRadios.forEach((radio) => radio.addEventListener("change", () => setFormat(radio.value)));
    mediaUploadButton.addEventListener("click", () => {
      clearMessages();
      if (state.mediaMethod === "link" || state.externalUrl) clearMediaSelection({ keepMethod: true });
      state.mediaMethod = "upload";
      mediaLinkField.hidden = false;
      mediaLinkToggle.setAttribute("aria-expanded", "true");
      mediaFileInput.click();
    });
    mediaLinkToggle.addEventListener("click", () => {
      clearMessages();
      if (state.mediaMethod === "upload" || state.mediaFile) clearMediaSelection({ keepMethod: true });
      state.mediaMethod = "link";
      mediaLinkField.hidden = false;
      mediaLinkToggle.setAttribute("aria-expanded", "true");
      mediaUrlInput.focus();
    });
    mediaFileInput.addEventListener("change", () => {
      const file = mediaFileInput.files?.[0];
      if (!file) return;
      const error = validateFile(file);
      if (error) { mediaFileInput.value = ""; setError(error, mediaUploadButton); return; }
      clearMessages();
      revokeObjectUrl();
      state.mediaMethod = "upload";
      state.mediaFile = file;
      state.externalUrl = "";
      state.uploadedPath = null;
      state.objectUrl = URL.createObjectURL(file);
      mediaUrlInput.value = "";
      mediaLinkField.hidden = false;
      renderSelection();
      if (state.format === "video") {
        state.audioStatus = "checking";
        updateStoryRequirement();
        detectVideoSound(file).then((result) => {
          if (state.mediaFile !== file || state.format !== "video") return;
          state.audioStatus = result;
          updateStoryRequirement();
        });
      }
    });
    mediaUrlInput.addEventListener("input", () => {
      state.mediaMethod = "link";
      state.externalUrl = mediaUrlInput.value.trim();
      state.uploadedPath = null;
      if (state.format === "video") state.audioStatus = "unknown";
      renderSelection();
      updateStoryRequirement();
    });
    mediaLinkClear.addEventListener("click", () => {
      clearMediaSelection();
      state.mediaMethod = "link";
      mediaLinkField.hidden = false;
      mediaLinkToggle.setAttribute("aria-expanded", "true");
      mediaUrlInput.focus();
    });
    mediaChangeButton.addEventListener("click", () => {
      if (state.mediaMethod === "upload") mediaFileInput.click();
      else { mediaLinkField.hidden = false; mediaUrlInput.focus(); }
    });
    mediaRemoveButton.addEventListener("click", () => clearMediaSelection());
    storyInput.addEventListener("input", () => { characterCount.textContent = String(storyInput.value.length); });
    reviewNext.addEventListener("click", () => { if (validateEditWorkspace()) setView("review"); });
    reviewBack.addEventListener("click", () => setView("edit"));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessages();
      if (state.view !== "review") return;
      const honeypot = form.elements.website;
      if (honeypot?.value.trim()) return;
      if (!form.elements.consent.checked) { setError("Berikan persetujuan sebelum mengirim testimoni.", form.elements.consent, true); return; }
      if (!window.AYA_SUPABASE?.isConfigured) {
        statusBox.className = "testimonial-submit-status is-error";
        statusBox.textContent = "Sistem pengiriman testimoni belum terhubung.";
        return;
      }

      const productId = form.elements.product.value;
      let mediaPath = null, mediaUrl = null, mediaSource = null, mediaMime = null, mediaSize = null;
      const original = submitButton.textContent;
      submitButton.disabled = true;
      try {
        if (state.format !== "text" && state.mediaMethod === "upload") {
          submitButton.textContent = "Mengunggah media…";
          if (!state.uploadedPath) state.uploadedPath = (await window.AYA_SUPABASE.uploadTestimonialMedia(state.mediaFile, state.format)).path;
          mediaSource = "upload";
          mediaPath = state.uploadedPath;
          mediaMime = state.mediaFile.type;
          mediaSize = state.mediaFile.size;
        } else if (state.format !== "text") {
          mediaSource = "external_url";
          mediaUrl = state.externalUrl;
        }

        submitButton.textContent = "Mengirim testimoni…";
        await window.AYA_SUPABASE.rpc("submit_aya_testimonial", {
          p_display_name: form.elements.customerName.value.trim(),
          p_city: form.elements.city.value.trim() || null,
          p_phone: form.elements.phone.value.trim() || null,
          p_email: null,
          p_product_id: productId,
          p_product_name: getProductName(productId),
          p_testimonial_text: storyInput.value.trim(),
          p_testimonial_format: state.format,
          p_media_source: mediaSource,
          p_media_url: mediaUrl,
          p_media_path: mediaPath,
          p_media_mime: mediaMime,
          p_media_size: mediaSize,
          p_consent_to_publish: true,
          p_environment: window.AYA_SUPABASE.environment,
          p_website: honeypot?.value || ""
        });

        form.hidden = true;
        sidebar.hidden = true;
        shell?.classList.add("is-success");
        success.hidden = false;
        success.querySelector("h2")?.focus();
      } catch (error) {
        console.error("AYA testimonial submission:", error);
        statusBox.className = "testimonial-submit-status is-error";
        statusBox.textContent = error?.message || "Ceritamu belum berhasil dikirim. Data yang sudah diisi tetap tersimpan; silakan coba lagi.";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = original;
      }
    });

    window.addEventListener("beforeunload", revokeObjectUrl);
    populateProducts();
    renderTextCompanion();
    setFormat("text", true);
    setView("edit");
  });
})();


/* Share context state — exclusive sidebar + consent routing */
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  if (!body || body.dataset.page !== "share") return;

  const form =
    document.querySelector("[data-testimonial-wizard]") ||
    document.querySelector("#testimonialWizardForm") ||
    document.querySelector("form");

  if (!form) return;

  const steps = Array.from(
    document.querySelectorAll(
      ".testimonial-share-steps [data-step-indicator]"
    )
  );

  const step1 = steps.find(
    (el) => el.dataset.stepIndicator === "1"
  );

  const step2 = steps.find(
    (el) => el.dataset.stepIndicator === "2"
  );

  const step3 = steps.find(
    (el) => el.dataset.stepIndicator === "3"
  );

  function setContext(number) {
    const value = String(number);

    body.dataset.shareContext = value;

    steps.forEach((step) => {
      step.classList.toggle(
        "is-context-active",
        step.dataset.stepIndicator === value
      );
    });
  }

  /* ---------------------------------------------
     ABOUT
  --------------------------------------------- */

  const aboutControls = Array.from(
    form.querySelectorAll(
      [
        "[data-share-about-control]",
        "#testimonialName",
        "#testimonialCity",
        "#testimonialPhone",
        "#product",
        'input[name="customerName"]',
        'input[name="city"]',
        'input[name="phone"]',
        'select[name="product"]'
      ].join(",")
    )
  );

  aboutControls.forEach((control) => {
    ["focus", "pointerdown", "input", "change"].forEach(
      (eventName) => {
        control.addEventListener(
          eventName,
          () => setContext(1)
        );
      }
    );
  });

  /* ---------------------------------------------
     STORY
  --------------------------------------------- */

  const storyPanel =
    document.querySelector(".testimonial-create-panel");

  if (storyPanel) {
    [
      "focusin",
      "pointerdown",
      "input",
      "change"
    ].forEach((eventName) => {
      storyPanel.addEventListener(
        eventName,
        () => setContext(2)
      );
    });
  }

  /* ---------------------------------------------
     MAIN WIZARD STATE -> REVIEW
     Existing wizard remains authority.
  --------------------------------------------- */

  const syncFromWizard = () => {
    if (
      step3 &&
      (
        step3.classList.contains("active") ||
        step3.getAttribute("aria-current") === "step"
      )
    ) {
      setContext(3);
      return;
    }

    /*
      Do not overwrite ABOUT while user is actively
      working in About controls.
    */
    if (
      aboutControls.includes(document.activeElement)
    ) {
      setContext(1);
      return;
    }

    if (
      step2 &&
      (
        step2.classList.contains("active") ||
        step2.getAttribute("aria-current") === "step"
      )
    ) {
      setContext(2);
    }
  };

  const stepObserver = new MutationObserver(
    syncFromWizard
  );

  steps.forEach((step) => {
    stepObserver.observe(step, {
      attributes:true,
      attributeFilter:["class", "aria-current"]
    });
  });

  /* ---------------------------------------------
     CONSENT ERROR ROUTING
     Keep one existing error element; move it only
     when consent is the FIRST invalid control.
  --------------------------------------------- */

  const consent =
    form.querySelector('input[name="consent"]');

  const consentLabel =
    consent?.closest("label");

  const stepError =
    form.querySelector("[data-step-error]");

  let errorHome = null;

  if (stepError && stepError.parentNode) {
    errorHome = document.createComment(
      "aya-step-error-home"
    );

    stepError.parentNode.insertBefore(
      errorHome,
      stepError
    );
  }

  function restoreStepErrorHome() {
    if (
      !stepError ||
      !errorHome ||
      !errorHome.parentNode
    ) return;

    errorHome.parentNode.insertBefore(
      stepError,
      errorHome.nextSibling
    );

    stepError.classList.remove(
      "is-consent-error"
    );
  }

  function getFirstInvalidControl() {
    return Array.from(form.elements).find(
      (control) =>
        control &&
        control.willValidate &&
        !control.validity.valid
    ) || null;
  }

  function routeCurrentValidationError() {
    if (
      !consent ||
      !consentLabel ||
      !stepError
    ) return;

    const firstInvalid =
      getFirstInvalidControl();

    if (firstInvalid === consent) {
      stepError.textContent =
        "Centang persetujuan terlebih dahulu.";

      stepError.classList.add(
        "is-consent-error"
      );

      consentLabel.insertAdjacentElement(
        "afterend",
        stepError
      );

      return;
    }

    if (
      stepError.classList.contains(
        "is-consent-error"
      )
    ) {
      stepError.textContent = "";
    }

    restoreStepErrorHome();
  }

  /*
    Existing wizard validation executes first.
    Run routing immediately afterwards.
  */
  const actionButtons = [
    form.querySelector("[data-wizard-next]"),
    form.querySelector("[data-wizard-submit]"),
    ...Array.from(
      form.querySelectorAll(
        ".testimonial-primary-action"
      )
    )
  ].filter(Boolean);

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTimeout(() => {
        routeCurrentValidationError();
        syncFromWizard();
      }, 0);
    });
  });

  if (consent) {
    consent.addEventListener("invalid", (event) => {
      /*
        Existing visible error state replaces the
        browser-native validation bubble.
      */
      event.preventDefault();

      setTimeout(
        routeCurrentValidationError,
        0
      );
    });

    consent.addEventListener("change", () => {
      if (consent.checked) {
        if (
          stepError?.classList.contains(
            "is-consent-error"
          )
        ) {
          stepError.textContent = "";
        }

        restoreStepErrorHome();
      }
    });
  }

  /* Initial edit context */
  setContext(2);
  syncFromWizard();
});


/* Testimonial confirmation layer — canonical */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body?.dataset.page !== "share") return;

  const body = document.body;
  const form =
    document.querySelector("[data-testimonial-wizard]") ||
    document.querySelector("form");

  const openButton =
    form?.querySelector("[data-confirm-open]");

  const modal =
    document.querySelector(
      "[data-testimonial-confirm-modal]"
    );

  if (!form || !openButton || !modal) return;

  const dialog =
    modal.querySelector(
      ".testimonial-confirm-dialog"
    );

  const cancelButtons =
    [...modal.querySelectorAll(
      "[data-confirm-cancel]"
    )];

  const sendButton =
    modal.querySelector(
      "[data-confirm-send]"
    );

  const confirmError =
    modal.querySelector(
      "[data-confirm-error]"
    );

  const confirmName =
    modal.querySelector(
      "[data-confirm-name]"
    );

  const confirmCity =
    modal.querySelector(
      "[data-confirm-city]"
    );

  const confirmProduct =
    modal.querySelector(
      "[data-confirm-product]"
    );

  const confirmFormat =
    modal.querySelector(
      "[data-confirm-format]"
    );

  const consent =
    form.querySelector(
      'input[name="consent"]'
    );

  const stepError =
    form.querySelector(
      "[data-step-error]"
    );

  const statusBox =
    form.querySelector(
      "[data-submit-status], .testimonial-submit-status"
    );

  const success =
    document.querySelector(
      [
        "[data-wizard-success]",
        "[data-testimonial-success]",
        ".testimonial-share-success",
        ".aya-wizard-success"
      ].join(",")
    );

  const internalSubmit =
    form.querySelector(
      [
        "[data-wizard-submit]",
        "[data-submit-testimonial]",
        'button[type="submit"]'
      ].join(",")
    );

  let previousFocus = null;
  let allowOriginalNext = false;
  let sending = false;

  const formatLabels = {
    text:"Tulisan",
    photo:"Foto",
    video:"Video"
  };

  function validHttps(value){
    try{
      return new URL(value).protocol === "https:";
    }catch{
      return false;
    }
  }

  function getFirstInvalid(){
    return [...form.elements].find(
      control =>
        control &&
        control.willValidate &&
        !control.validity.valid
    ) || null;
  }

  function routeConsentError(){
    if (!consent || consent.checked) return false;

    if (stepError){
      stepError.textContent =
        "Centang persetujuan terlebih dahulu.";

      stepError.classList.add(
        "is-consent-error"
      );

      consent
        .closest("label")
        ?.insertAdjacentElement(
          "afterend",
          stepError
        );
    }

    consent.focus();
    return true;
  }

  function validateBeforeConfirm(){
    if (routeConsentError()) return false;

    const invalid = getFirstInvalid();

    if (invalid){
      if (stepError){
        stepError.textContent =
          invalid.validationMessage ||
          "Lengkapi bagian ini terlebih dahulu.";
      }

      invalid.focus();
      return false;
    }

    const format =
      form.querySelector(
        'input[name="testimonialFormat"]:checked'
      )?.value || "text";

    if (format !== "text"){
      const file =
        form.querySelector(
          "[data-media-file]"
        )?.files?.[0];

      const url =
        form.querySelector(
          "[data-media-url]"
        )?.value?.trim() || "";

      if (!file && !validHttps(url)){
        if (stepError){
          stepError.textContent =
            format === "photo"
              ? "Tambahkan foto atau link foto terlebih dahulu."
              : "Tambahkan video atau link video terlebih dahulu.";
        }

        (
          form.querySelector("[data-media-upload]") ||
          form.querySelector("[data-media-url]")
        )?.focus();

        return false;
      }
    }

    if (stepError){
      stepError.textContent = "";
      stepError.classList.remove(
        "is-consent-error"
      );
    }

    return true;
  }

  function fillSummary(){
    const name =
      form.elements.customerName?.value?.trim() ||
      form.elements.name?.value?.trim() ||
      "—";

    const city =
      form.elements.city?.value?.trim() ||
      "—";

    const product =
      form.elements.product?.selectedOptions?.[0]
        ?.textContent?.trim() ||
      "—";

    const format =
      form.querySelector(
        'input[name="testimonialFormat"]:checked'
      )?.value || "text";

    confirmName.textContent = name;
    confirmCity.textContent = city;
    confirmProduct.textContent = product;
    confirmFormat.textContent =
      formatLabels[format] || format;
  }

  function setSidebarSendState(){
    body.dataset.shareContext = "3";

    document
      .querySelectorAll(
        ".testimonial-share-steps [data-step-indicator]"
      )
      .forEach(step => {
        step.classList.toggle(
          "is-context-active",
          step.dataset.stepIndicator === "3"
        );
      });
  }

  function restoreSidebarStoryState(){
    body.dataset.shareContext = "2";

    document
      .querySelectorAll(
        ".testimonial-share-steps [data-step-indicator]"
      )
      .forEach(step => {
        step.classList.toggle(
          "is-context-active",
          step.dataset.stepIndicator === "2"
        );
      });
  }

  function openConfirm(){
    fillSummary();

    previousFocus =
      document.activeElement;

    confirmError.textContent = "";
    modal.hidden = false;

    body.classList.add(
      "aya-testimonial-confirm-open"
    );

    setSidebarSendState();

    requestAnimationFrame(() => {
      dialog.focus();
      sendButton.focus();
    });
  }

  function internalBackToEdit(){
    const back =
      [...form.querySelectorAll(
        "button,a"
      )].find(el =>
        /kembali.*edit/i.test(
          el.textContent || ""
        )
      );

    back?.click();
  }

  function closeConfirm(options = {}){
    if (
      options.restoreEdit &&
      sending
    ){
      internalBackToEdit();
    }

    sending = false;

    sendButton.disabled = false;
    cancelButtons.forEach(
      button => button.disabled = false
    );

    sendButton.innerHTML =
      'Ya, kirim <span aria-hidden="true">→</span>';

    modal.hidden = true;

    body.classList.remove(
      "aya-testimonial-confirm-open"
    );

    restoreSidebarStoryState();

    previousFocus?.focus?.();
  }

  /*
    Capture before the existing "Lanjut ke Periksa"
    listener. Only the internal confirmation pass is
    allowed to reach that original listener.
  */
  openButton.addEventListener(
    "click",
    event => {
      if (allowOriginalNext){
        allowOriginalNext = false;
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      if (!validateBeforeConfirm()) return;

      openConfirm();
    },
    true
  );

  cancelButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (sending) return;
      closeConfirm();
    });
  });

  /*
    Final confirmation:
    1. allow original next logic once;
    2. it validates using the existing wizard;
    3. internal review state is covered by modal;
    4. invoke existing canonical submit button.
  */
  sendButton.addEventListener(
    "click",
    async () => {
      if (sending) return;

      sending = true;
      confirmError.textContent = "";

      sendButton.disabled = true;
      cancelButtons.forEach(
        button => button.disabled = true
      );

      sendButton.textContent =
        "Menyiapkan…";

      allowOriginalNext = true;
      openButton.click();

      let tries = 0;

      const waitForInternalSubmit =
        window.setInterval(() => {
          tries += 1;

          const available =
            internalSubmit &&
            !internalSubmit.hidden &&
            !internalSubmit.disabled;

          if (available){
            clearInterval(
              waitForInternalSubmit
            );

            sendButton.textContent =
              "Mengirim…";

            internalSubmit.click();
            return;
          }

          if (tries >= 30){
            clearInterval(
              waitForInternalSubmit
            );

            sending = false;

            sendButton.disabled = false;
            cancelButtons.forEach(
              button => button.disabled = false
            );

            sendButton.innerHTML =
              'Ya, kirim <span aria-hidden="true">→</span>';

            confirmError.textContent =
              "Periksa kembali bagian yang belum lengkap.";
          }
        }, 35);
    }
  );

  /*
    Existing submission remains source of truth.
    We only mirror its result into this confirmation layer.
  */
  const resultObserver =
    new MutationObserver(() => {

      if (
        success &&
        !success.hidden
      ){
        modal.hidden = true;

        body.classList.remove(
          "aya-testimonial-confirm-open"
        );

        return;
      }

      const errorText =
        statusBox?.textContent?.trim();

      if (
        sending &&
        errorText &&
        (
          statusBox.classList.contains(
            "is-error"
          ) ||
          /belum berhasil|gagal|belum terhubung/i
            .test(errorText)
        )
      ){
        sending = false;

        sendButton.disabled = false;

        cancelButtons.forEach(
          button => button.disabled = false
        );

        sendButton.innerHTML =
          'Coba kirim lagi <span aria-hidden="true">→</span>';

        confirmError.textContent =
          errorText;
      }
    });

  if (statusBox){
    resultObserver.observe(
      statusBox,
      {
        childList:true,
        subtree:true,
        attributes:true
      }
    );
  }

  if (success){
    resultObserver.observe(
      success,
      {
        attributes:true,
        attributeFilter:["hidden"]
      }
    );
  }

  dialog.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        !sending
      ){
        closeConfirm();
      }
    }
  );
});

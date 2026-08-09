(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-testimonial-wizard]");
    if (!form) return;

    const shell = document.querySelector("[data-wizard-shell]");
    const sidebar = document.querySelector("[data-wizard-sidebar]");
    const success = document.querySelector("[data-wizard-success]");
    const steps = [...form.querySelectorAll("[data-wizard-step]")];
    const indicators = [...document.querySelectorAll("[data-step-indicator]")];

    const contextTitle = document.querySelector("[data-context-title]");
    const contextDescription = document.querySelector("[data-context-description]");
    const stepMeta = document.querySelector("[data-step-meta]");
    const progressLabel = document.querySelector("[data-progress-label]");
    const progressCount = document.querySelector("[data-progress-count]");
    const progressBar = document.querySelector("[data-progress-bar]");

    const backButton = form.querySelector("[data-wizard-back]");
    const nextButton = form.querySelector("[data-wizard-next]");
    const submitButton = form.querySelector("[data-wizard-submit]");
    const errorBox = form.querySelector("[data-step-error]");
    const statusBox = form.querySelector("[data-submit-status]");
    const actionNoteTitle = form.querySelector("[data-action-note-title]");
    const actionNoteCopy = form.querySelector("[data-action-note-copy]");

    const formatRadios = [...form.querySelectorAll('[name="testimonialFormat"]')];
    const storyLayout = form.querySelector("[data-story-layout]");
    const storyInput = form.elements.testimonial;
    const characterCount = form.querySelector("[data-character-count]");
    const storyAudioHelp = form.querySelector("[data-story-audio-help]");

    const mediaWorkspace = form.querySelector("[data-media-workspace]");
    const mediaTitle = form.querySelector("[data-media-title]");
    const mediaSubtitle = form.querySelector("[data-media-subtitle]");
    const mediaStatus = form.querySelector("[data-media-status]");
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
    const mediaPreviewOpenButtons = [...form.querySelectorAll("[data-media-preview-open]")];
    const mediaChangeButton = form.querySelector("[data-media-change]");
    const mediaRemoveButton = form.querySelector("[data-media-remove]");

    const reviewMainGrid = form.querySelector("[data-review-main-grid]");
    const reviewMediaCard = form.querySelector("[data-review-media-card]");
    const reviewMediaCaption = form.querySelector("[data-review-media-caption]");
    const reviewMediaPreview = form.querySelector("[data-review-media-preview]");
    const reviewMediaImage = form.querySelector("[data-review-media-image]");
    const reviewMediaVideo = form.querySelector("[data-review-media-video]");
    const reviewMediaFallback = form.querySelector("[data-review-media-fallback]");
    const reviewMediaLink = form.querySelector("[data-review-media-link]");

    const modal = document.querySelector("[data-media-modal]");
    const modalDialog = modal.querySelector(".aya-media-modal-dialog");
    const modalImage = modal.querySelector("[data-modal-image]");
    const modalVideo = modal.querySelector("[data-modal-video]");
    const modalExternal = modal.querySelector("[data-modal-external]");
    const modalExternalLink = modal.querySelector("[data-modal-external-link]");
    const modalCloseButtons = [...modal.querySelectorAll("[data-modal-close]")];

    const state = {
      currentStep: 1,
      format: "text",
      mediaMethod: null,
      mediaFile: null,
      externalUrl: "",
      objectUrl: null,
      uploadedPath: null,
      previousFocus: null,
      audioStatus: "unknown"
    };

    const contexts = {
      1: {
        title: "Tentang Anda",
        description: "Beritahu kami siapa yang membagikan pengalaman dan produk AYA yang dicoba.",
        next: "Lanjut ke Cerita →",
        noteTitle: "Data Anda tetap privat.",
        noteCopy: "Nomor WhatsApp tidak ditampilkan kepada publik."
      },
      2: {
        title: "Cerita Anda",
        description: "Ceritakan pengalaman dengan bahasa yang paling nyaman bagi Anda.",
        next: "Tinjau Testimoni →",
        noteTitle: "Data Anda tetap privat.",
        noteCopy: "Media hanya digunakan untuk meninjau testimoni Anda."
      },
      3: {
        title: "Tinjau & Kirim",
        description: "Periksa kembali sebelum testimoni dikirim untuk ditinjau.",
        noteTitle: "Menunggu persetujuan.",
        noteCopy: "Testimoni tidak langsung dipublikasikan."
      }
    };

    const mediaRules = {
      photo: {
        title: "Foto pendamping",
        subtitle: "Upload langsung atau gunakan link.",
        uploadLabel: "Upload foto",
        hint: "JPG, PNG, atau WebP · maksimal 8 MB.",
        accept: ["image/jpeg", "image/png", "image/webp"],
        acceptAttribute: "image/jpeg,image/png,image/webp",
        maxBytes: 8 * 1024 * 1024,
        linkLabel: "Link foto",
        linkHelp: "Gunakan link HTTPS dari Google Drive, Instagram, Dropbox, atau penyimpanan lain.",
        placeholder: "https://drive.google.com/..."
      },
      video: {
        title: "Video pendamping",
        subtitle: "Upload langsung atau gunakan link.",
        uploadLabel: "Upload video",
        hint: "MP4, MOV, atau WebM · maksimal 40 MB.",
        accept: ["video/mp4", "video/quicktime", "video/webm"],
        acceptAttribute: "video/mp4,video/quicktime,video/webm",
        maxBytes: 40 * 1024 * 1024,
        linkLabel: "Link video",
        linkHelp: "Gunakan link HTTPS dari YouTube, Instagram, TikTok, atau Google Drive.",
        placeholder: "https://youtube.com/..."
      }
    };

    function getProducts() {
      return window.AYA_PRODUCTS || window.AYA?.products || [];
    }

    function populateProducts() {
      const select = form.elements.product;
      const currentValue = select.value;
      select.replaceChildren();

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Pilih produk";
      select.appendChild(placeholder);

      getProducts()
        .filter(product => product?.id && product?.name)
        .forEach(product => {
          const option = document.createElement("option");
          option.value = product.id;
          option.textContent = product.name;
          select.appendChild(option);
        });

      select.value = currentValue;
    }

    function getProductName(productId) {
      return getProducts().find(product => product.id === productId)?.name || productId || "—";
    }

    function formatBytes(bytes) {
      if (!Number.isFinite(bytes) || bytes <= 0) return "";
      if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function isValidHttpsUrl(value) {
      try {
        const url = new URL(value);
        return url.protocol === "https:";
      } catch {
        return false;
      }
    }

    function clearMessages() {
      errorBox.textContent = "";
      statusBox.textContent = "";
      statusBox.className = "aya-wizard-status";
    }

    function setError(message, target) {
      errorBox.textContent = message;
      target?.focus?.();
    }

    function revokeObjectUrl() {
      if (state.objectUrl) {
        URL.revokeObjectURL(state.objectUrl);
        state.objectUrl = null;
      }
    }

    function resetPreviewElements() {
      mediaSelectionImage.hidden = true;
      mediaSelectionVideo.hidden = true;
      mediaSelectionFallback.hidden = true;
      mediaSelectionImage.onerror = null;
      mediaSelectionImage.removeAttribute("src");
      mediaSelectionVideo.pause();
      mediaSelectionVideo.removeAttribute("src");
    }

    function clearMediaSelection(options = {}) {
      const keepMethod = Boolean(options.keepMethod);
      revokeObjectUrl();
      state.mediaFile = null;
      state.externalUrl = "";
      state.uploadedPath = null;
      mediaFileInput.value = "";
      mediaUrlInput.value = "";
      mediaSelection.hidden = true;
      resetPreviewElements();
      mediaStatus.textContent = "Belum dipilih";
      mediaStatus.classList.remove("is-ready");

      if (state.format === "video") state.audioStatus = "unknown";
      updateStoryRequirement();
      if (!keepMethod) {
        state.mediaMethod = null;
        mediaLinkField.hidden = true;
        mediaLinkToggle.setAttribute("aria-expanded", "false");
      }
    }

    function showSelectionFallback() {
      mediaSelectionImage.hidden = true;
      mediaSelectionVideo.hidden = true;
      mediaSelectionFallback.hidden = false;
    }

    function renderMediaSelection() {
      resetPreviewElements();

      const hasUpload = state.mediaMethod === "upload" && state.mediaFile;
      const hasLink = state.mediaMethod === "link" && isValidHttpsUrl(state.externalUrl);
      const hasMedia = Boolean(hasUpload || hasLink);

      mediaSelection.hidden = !hasMedia;
      mediaStatus.textContent = hasMedia ? "Siap dikirim" : "Belum dipilih";
      mediaStatus.classList.toggle("is-ready", hasMedia);

      if (!hasMedia) return;

      if (hasUpload) {
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
        return;
      }

      mediaSelectionName.textContent = state.format === "photo" ? "Link foto" : "Link video";
      mediaSelectionSize.textContent = "Link eksternal";

      if (state.format === "photo") {
        mediaSelectionImage.onerror = showSelectionFallback;
        mediaSelectionImage.src = state.externalUrl;
        mediaSelectionImage.hidden = false;
      } else {
        mediaSelectionFallback.hidden = false;
      }
    }

    function updateStoryRequirement() {
      const videoOptional = state.format === "video" && state.audioStatus === "audible";
      storyInput.required = !videoOptional;
      if (!storyAudioHelp) return;
      if (state.format === "text") storyAudioHelp.textContent = "Tulisan wajib untuk testimoni tulisan.";
      else if (state.format === "photo") storyAudioHelp.textContent = "Tulisan wajib untuk testimoni foto agar admin dapat menyusun photo + cerita dalam satu frame final.";
      else if (state.audioStatus === "checking") storyAudioHelp.textContent = "Menganalisis audio video… Cerita pendamping tetap wajib sampai suara berhasil terdeteksi.";
      else if (state.audioStatus === "audible") storyAudioHelp.textContent = "Suara terdeteksi. Cerita pendamping opsional; Anda tetap boleh menambah caption untuk membantu proses review.";
      else if (state.audioStatus === "silent") storyAudioHelp.textContent = "Video terdeteksi tanpa suara yang berarti. Cerita pendamping wajib agar pengalaman Anda tetap dapat dipahami.";
      else storyAudioHelp.textContent = "Audio belum dapat dipastikan. Cerita pendamping wajib sebagai fallback aman.";
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
      video.crossOrigin = "anonymous";
      video.style.position = "fixed";
      video.style.width = "1px";
      video.style.height = "1px";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";
      document.body.append(video);
      const ctx = new AudioCtx();
      let source, analyser, gain, timer;
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
        if (Number.isFinite(video.duration) && video.duration > 2) video.currentTime = Math.min(1, video.duration * .15);
        await video.play();
        const samples = new Uint8Array(analyser.fftSize);
        let peak = 0;
        const started = performance.now();
        await new Promise((resolve) => {
          const sample = () => {
            analyser.getByteTimeDomainData(samples);
            for (const value of samples) peak = Math.max(peak, Math.abs(value - 128));
            if (performance.now() - started >= 1600 || video.ended) { resolve(); return; }
            timer = requestAnimationFrame(sample);
          };
          sample();
        });
        video.pause();
        return peak >= 3 ? "audible" : "silent";
      } catch {
        return "unknown";
      } finally {
        if (timer) cancelAnimationFrame(timer);
        try { video.pause(); } catch {}
        try { source?.disconnect(); analyser?.disconnect(); gain?.disconnect(); } catch {}
        try { await ctx.close(); } catch {}
        video.remove();
        URL.revokeObjectURL(url);
      }
    }

    function setFormat(nextFormat, options = {}) {
      const initial = Boolean(options.initial);
      const normalized = ["text", "photo", "video"].includes(nextFormat) ? nextFormat : "text";

      if (!initial && normalized !== state.format) clearMediaSelection();
      state.format = normalized;
      state.audioStatus = normalized === "video" ? "unknown" : "not-applicable";

      formatRadios.forEach(radio => {
        radio.checked = radio.value === normalized;
      });

      const isText = normalized === "text";
      mediaWorkspace.hidden = isText;
      storyLayout.classList.toggle("is-text", isText);

      if (isText) {
        clearMediaSelection();
        updateStoryRequirement();
        return;
      }

      const rules = mediaRules[normalized];
      mediaTitle.textContent = rules.title;
      mediaSubtitle.textContent = rules.subtitle;
      mediaUploadLabel.textContent = rules.uploadLabel;
      mediaHint.textContent = rules.hint;
      mediaFileInput.accept = rules.acceptAttribute;
      mediaLinkLabel.textContent = rules.linkLabel;
      mediaLinkHelp.textContent = rules.linkHelp;
      mediaUrlInput.placeholder = rules.placeholder;
      renderMediaSelection();
      updateStoryRequirement();
    }

    function validateFile(file) {
      const rules = mediaRules[state.format];
      if (!rules) return "Pilih format foto atau video terlebih dahulu.";
      if (!rules.accept.includes(file.type)) {
        return state.format === "photo"
          ? "Gunakan file JPG, PNG, atau WebP."
          : "Gunakan file MP4, MOV, atau WebM.";
      }
      if (file.size > rules.maxBytes) {
        return state.format === "photo"
          ? "Ukuran foto maksimal 8 MB."
          : "Ukuran video maksimal 40 MB.";
      }
      return "";
    }

    function startUpload() {
      clearMessages();
      if (state.mediaMethod === "link" || state.externalUrl) clearMediaSelection({ keepMethod: true });
      state.mediaMethod = "upload";
      mediaLinkField.hidden = true;
      mediaLinkToggle.setAttribute("aria-expanded", "false");
      mediaFileInput.click();
    }

    function openLinkField() {
      clearMessages();
      if (state.mediaMethod === "upload" || state.mediaFile) clearMediaSelection({ keepMethod: true });
      state.mediaMethod = "link";
      mediaLinkField.hidden = false;
      mediaLinkToggle.setAttribute("aria-expanded", "true");
      mediaUrlInput.focus();
    }

    function validateStep(stepNumber) {
      clearMessages();
      const step = form.querySelector(`[data-wizard-step="${stepNumber}"]`);
      const controls = [...step.querySelectorAll("input, select, textarea")].filter(control => !control.disabled);
      const invalid = controls.find(control => !control.checkValidity());

      if (invalid) {
        setError(invalid.validationMessage || "Lengkapi bagian ini terlebih dahulu.", invalid);
        invalid.reportValidity();
        return false;
      }

      if (stepNumber === 2 && state.format !== "text") {
        if (state.mediaMethod === "upload" && state.mediaFile) return true;
        if (state.mediaMethod === "link") {
          state.externalUrl = mediaUrlInput.value.trim();
          if (isValidHttpsUrl(state.externalUrl)) return true;
          setError("Masukkan link HTTPS yang valid.", mediaUrlInput);
          return false;
        }
        setError(`Pilih ${state.format === "photo" ? "Upload foto" : "Upload video"} atau Tempel link.`, mediaUploadButton);
        return false;
      }

      return true;
    }

    function resetReviewMedia() {
      reviewMediaImage.hidden = true;
      reviewMediaVideo.hidden = true;
      reviewMediaFallback.hidden = true;
      reviewMediaLink.hidden = true;
      reviewMediaImage.onerror = null;
      reviewMediaImage.removeAttribute("src");
      reviewMediaVideo.pause();
      reviewMediaVideo.removeAttribute("src");
      reviewMediaLink.removeAttribute("href");
    }

    function updateReview() {
      const formatLabels = {
        text: "Tulisan",
        photo: "Foto + tulisan",
        video: "Video"
      };

      form.querySelector("[data-review-name]").textContent = form.elements.customerName.value.trim() || "—";
      form.querySelector("[data-review-city]") && (form.querySelector("[data-review-city]").textContent = form.elements.city.value.trim() || "—");
      form.querySelector("[data-review-product]").textContent = getProductName(form.elements.product.value);
      form.querySelector("[data-review-format]").textContent = formatLabels[state.format];
      form.querySelector("[data-review-story]").textContent = storyInput.value.trim() ? `“${storyInput.value.trim()}”` : "Tidak ada cerita pendamping.";

      resetReviewMedia();
      const isText = state.format === "text";
      reviewMediaCard.hidden = isText;
      reviewMainGrid.classList.toggle("is-text", isText);
      if (isText) return;

      reviewMediaCaption.textContent = state.mediaMethod === "upload" ? "1 file siap dikirim" : "1 link media";

      if (state.mediaMethod === "upload") {
        if (state.format === "photo") {
          reviewMediaImage.src = state.objectUrl;
          reviewMediaImage.hidden = false;
        } else {
          reviewMediaVideo.src = state.objectUrl;
          reviewMediaVideo.hidden = false;
        }
        return;
      }

      reviewMediaLink.href = state.externalUrl;
      reviewMediaLink.textContent = state.format === "photo" ? "Buka link foto" : "Buka link video";
      reviewMediaLink.hidden = false;

      if (state.format === "photo") {
        reviewMediaImage.onerror = () => {
          reviewMediaImage.hidden = true;
          reviewMediaFallback.hidden = false;
        };
        reviewMediaImage.src = state.externalUrl;
        reviewMediaImage.hidden = false;
      } else {
        reviewMediaFallback.hidden = false;
      }
    }

    function updateActionNote(stepNumber) {
      const context = contexts[stepNumber];
      actionNoteTitle.textContent = context.noteTitle;
      actionNoteCopy.textContent = context.noteCopy;
    }

    function goToStep(stepNumber) {
      state.currentStep = Math.max(1, Math.min(3, stepNumber));
      clearMessages();

      steps.forEach(step => {
        const active = Number(step.dataset.wizardStep) === state.currentStep;
        step.hidden = !active;
        step.classList.toggle("active", active);
      });

      indicators.forEach(indicator => {
        const number = Number(indicator.dataset.stepIndicator);
        indicator.classList.toggle("active", number === state.currentStep);
        indicator.classList.toggle("complete", number < state.currentStep);
        if (number === state.currentStep) indicator.setAttribute("aria-current", "step");
        else indicator.removeAttribute("aria-current");
      });

      const context = contexts[state.currentStep];
      contextTitle.textContent = context.title;
      contextDescription.textContent = context.description;
      stepMeta.textContent = `LANGKAH 0${state.currentStep} DARI 03`;
      progressLabel.textContent = `${Math.round((state.currentStep / 3) * 100)}% selesai`;
      progressCount.textContent = `${state.currentStep} dari 3`;
      progressBar.style.width = `${(state.currentStep / 3) * 100}%`;
      backButton.hidden = state.currentStep === 1;
      nextButton.hidden = state.currentStep === 3;
      submitButton.hidden = state.currentStep !== 3;
      if (state.currentStep < 3) nextButton.textContent = context.next;
      updateActionNote(state.currentStep);
      if (state.currentStep === 3) updateReview();

      form.querySelector(`[data-wizard-step="${state.currentStep}"] h2`)?.focus({ preventScroll: true });
      window.scrollTo({
        top: Math.max(0, shell.offsetTop - 92),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }

    function currentMediaSource() {
      if (state.format === "text") return null;
      if (state.mediaMethod === "upload" && state.mediaFile && state.objectUrl) {
        return { type: state.format, url: state.objectUrl, external: false };
      }
      if (state.mediaMethod === "link" && isValidHttpsUrl(state.externalUrl)) {
        return { type: state.format, url: state.externalUrl, external: true };
      }
      return null;
    }

    function showModalExternal(url) {
      modalImage.hidden = true;
      modalVideo.hidden = true;
      modalExternalLink.href = url;
      modalExternal.hidden = false;
    }

    function openModal() {
      const source = currentMediaSource();
      if (!source) return;

      state.previousFocus = document.activeElement;
      modalImage.hidden = true;
      modalVideo.hidden = true;
      modalExternal.hidden = true;
      modalImage.onerror = null;
      modalImage.removeAttribute("src");
      modalVideo.pause();
      modalVideo.removeAttribute("src");

      if (source.type === "photo") {
        modalImage.onerror = () => showModalExternal(source.url);
        modalImage.src = source.url;
        modalImage.hidden = false;
      } else if (!source.external) {
        modalVideo.src = source.url;
        modalVideo.hidden = false;
      } else {
        showModalExternal(source.url);
      }

      modal.hidden = false;
      document.body.classList.add("aya-modal-open");
      modalDialog.focus();
    }

    function closeModal() {
      if (modal.hidden) return;
      modalVideo.pause();
      modal.hidden = true;
      document.body.classList.remove("aya-modal-open");
      state.previousFocus?.focus?.();
    }

    function trapModalFocus(event) {
      if (modal.hidden || event.key !== "Tab") return;
      const focusable = [...modalDialog.querySelectorAll('button:not([disabled]), a[href], video[controls]')]
        .filter(node => !node.hidden);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    formatRadios.forEach(radio => {
      radio.addEventListener("change", () => setFormat(radio.value));
    });

    mediaUploadButton.addEventListener("click", startUpload);
    mediaLinkToggle.addEventListener("click", openLinkField);

    mediaFileInput.addEventListener("change", () => {
      const file = mediaFileInput.files?.[0];
      if (!file) return;

      const message = validateFile(file);
      if (message) {
        mediaFileInput.value = "";
        setError(message, mediaUploadButton);
        return;
      }

      clearMessages();
      revokeObjectUrl();
      state.mediaMethod = "upload";
      state.mediaFile = file;
      state.externalUrl = "";
      state.uploadedPath = null;
      mediaUrlInput.value = "";
      mediaLinkField.hidden = true;
      mediaLinkToggle.setAttribute("aria-expanded", "false");
      state.objectUrl = URL.createObjectURL(file);
      renderMediaSelection();
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
      updateStoryRequirement();
      renderMediaSelection();
    });

    mediaLinkClear.addEventListener("click", () => {
      clearMediaSelection();
      mediaLinkField.hidden = false;
      state.mediaMethod = "link";
      mediaLinkToggle.setAttribute("aria-expanded", "true");
      mediaUrlInput.focus();
    });

    mediaChangeButton.addEventListener("click", () => {
      if (state.mediaMethod === "upload") mediaFileInput.click();
      else {
        mediaLinkField.hidden = false;
        mediaLinkToggle.setAttribute("aria-expanded", "true");
        mediaUrlInput.focus();
      }
    });

    mediaRemoveButton.addEventListener("click", () => clearMediaSelection());
    mediaPreviewOpenButtons.forEach(button => button.addEventListener("click", openModal));
    reviewMediaPreview.addEventListener("click", openModal);
    modalCloseButtons.forEach(button => button.addEventListener("click", closeModal));
    modal.addEventListener("keydown", trapModalFocus);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    storyInput.addEventListener("input", () => {
      characterCount.textContent = String(storyInput.value.length);
    });

    nextButton.addEventListener("click", () => {
      if (validateStep(state.currentStep)) goToStep(state.currentStep + 1);
    });

    backButton.addEventListener("click", () => goToStep(state.currentStep - 1));
    form.querySelector("[data-edit-story]").addEventListener("click", () => goToStep(2));
    form.querySelector("[data-edit-media]").addEventListener("click", () => goToStep(2));

    form.addEventListener("submit", async event => {
      event.preventDefault();
      clearMessages();

      if (state.currentStep !== 3 || !validateStep(3)) return;
      const honeypot = form.elements.website;
      if (honeypot?.value.trim()) return;

      if (!window.AYA_SUPABASE?.isConfigured) {
        statusBox.className = "aya-wizard-status is-error";
        statusBox.textContent = "Sistem pengiriman testimoni belum terhubung.";
        return;
      }

      const productId = form.elements.product.value;
      let mediaPath = null;
      let mediaUrl = null;
      let mediaSource = null;
      let mediaMime = null;
      let mediaSize = null;
      const originalText = submitButton.textContent;
      submitButton.disabled = true;

      try {
        if (state.format !== "text" && state.mediaMethod === "upload") {
          submitButton.textContent = "Mengunggah media…";
          if (!state.uploadedPath) {
            const upload = await window.AYA_SUPABASE.uploadTestimonialMedia(state.mediaFile, state.format);
            state.uploadedPath = upload.path;
          }
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
          p_consent_to_publish: Boolean(form.elements.consent.checked),
          p_environment: window.AYA_SUPABASE.environment,
          p_website: honeypot?.value || ""
        });

        form.hidden = true;
        sidebar.hidden = true;
        shell.classList.add("is-success");
        success.hidden = false;
        success.querySelector("h2")?.focus();
        window.scrollTo({
          top: Math.max(0, shell.offsetTop - 92),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      } catch (error) {
        console.error("AYA testimonial submission:", error);
        statusBox.className = "aya-wizard-status is-error";
        statusBox.textContent = error?.message || "Testimoni belum berhasil dikirim. Silakan coba kembali.";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });

    window.addEventListener("beforeunload", revokeObjectUrl);
    populateProducts();
    setFormat("text", { initial: true });
    goToStep(1);
  });
})();

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const AYA = window.AYA;
    const data = window.AYA_TESTIMONIALS || {};
    const videoStage = document.querySelector("[data-testimonial-video-stage]");
    const videoContent = document.querySelector("[data-video-content]");
    const videoGalleryOpen = document.querySelector("[data-video-gallery-open]");
    const storyViewport = document.querySelector("[data-story-viewport]");
    const storyTrack = document.querySelector("[data-story-track]");
    const reelHint = document.querySelector("[data-reel-hint]");
    const photoStage = document.querySelector("[data-photo-stage]");
    const photoContent = document.querySelector("[data-photo-content]");
    const photoDots = document.querySelector("[data-photo-dots]");
    const photoGalleryOpen = document.querySelector("[data-photo-gallery-open]");
    const dialog = document.querySelector("[data-testimonial-gallery-dialog]");
    const galleryTitle = document.querySelector("[data-gallery-title]");
    const galleryKicker = document.querySelector("[data-gallery-kicker]");
    const galleryBody = document.querySelector("[data-gallery-body]");
    const galleryClose = document.querySelector("[data-gallery-close]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!videoContent || !storyTrack || !photoContent) return;

    const escapeHTML = AYA?.escapeHTML || ((value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]));
    const videos = Array.isArray(data.videos) ? data.videos.filter(Boolean) : [];
    const photos = Array.isArray(data.featured) ? data.featured.filter(Boolean) : [];
    const texts = Array.isArray(data.texts) ? data.texts.filter(Boolean) : [];
    let activeVideoIndex = 0;
    let activePhotoIndex = 0;
    let photoTimer = null;
    let galleryMode = null;

    const productFor = (item) => {
      if (!item) return null;
      if (item.productId && typeof AYA?.getProduct === "function") return AYA.getProduct(item.productId);
      const products = typeof AYA?.products === "function" ? AYA.products() : (Array.isArray(window.AYA_PRODUCTS) ? window.AYA_PRODUCTS : []);
      const meta = String(item.meta || "").toLocaleLowerCase("id");
      return products.find((product) => {
        const name = String(product?.name || "").toLocaleLowerCase("id");
        return name && meta.includes(name);
      }) || null;
    };

    const mediaState = (title, copy = "", extraClass = "") => `<div class="testimonial-media-state${extraClass ? ` ${extraClass}` : ""}"><strong>${escapeHTML(title)}</strong>${copy ? `<small>${escapeHTML(copy)}</small>` : ""}</div>`;

    const photoBrandFallback = (title = "Cerita foto sedang dipersiapkan", copy = "Media pelanggan belum dapat ditampilkan.") => `<div class="testimonial-photo-brand-fallback" role="status"><span>${escapeHTML(title)}</span><small>${escapeHTML(copy)}</small></div>`;

    function renderVideo(index = 0, autoplay = false) {
      if (!videos.length) {
        videoContent.innerHTML = mediaState("Video segera hadir", "Video pelanggan hanya tampil setelah melalui review AYA.", "testimonial-video-empty-state");
        videoStage?.classList.add("is-empty");
        videoGalleryOpen.hidden = true;
        return;
      }

      const item = videos[Math.max(0, Math.min(videos.length - 1, index))];
      if (!item?.url) {
        videoContent.innerHTML = mediaState("Video belum dapat ditampilkan", "Media pelanggan ini belum memiliki sumber video yang valid.");
        return;
      }

      activeVideoIndex = videos.indexOf(item);
      const name = item.name || "Pelanggan AYA";
      const place = item.city || item.location || "";
      videoContent.innerHTML = `
        <div class="testimonial-video-frame">
          <video controls playsinline preload="metadata" ${item.poster ? `poster="${escapeHTML(item.poster)}"` : ""}>
            <source src="${escapeHTML(item.url)}">
          </video>
          <div class="testimonial-video-lower-third">
            <strong>${escapeHTML(name)}</strong>
            ${place ? `<span>${escapeHTML(place)}</span>` : ""}
          </div>
          <div class="testimonial-video-error" data-video-error hidden>
            <strong>Video belum dapat diputar.</strong><small>Silakan coba video lainnya.</small>
          </div>
        </div>`;

      const video = videoContent.querySelector("video");
      const errorState = videoContent.querySelector("[data-video-error]");
      video?.addEventListener("error", () => { if (errorState) errorState.hidden = false; });
      video?.addEventListener("ended", () => {
        if (videos.length < 2) return;
        renderVideo((activeVideoIndex + 1) % videos.length, true);
      });
      if (autoplay) video?.play().catch(() => {});
      videoGalleryOpen.hidden = videos.length < 2;
    }

    function storyCard(item, clone = false) {
      const product = productFor(item);
      const image = product?.image || product?.placeholder || "assets/visual/aya-mark.svg";
      const productName = product?.name || item.meta || "Produk AYA";
      const fallback = product?.id ? ` data-image-fallback="${escapeHTML(product.id)}"` : "";
      return `<article class="testimonial-story-card${clone ? " is-clone" : ""}"${clone ? ' aria-hidden="true"' : ""}>
        <div class="testimonial-story-product"><img src="${escapeHTML(image)}" alt="${clone ? "" : escapeHTML(productName)}"${fallback}></div>
        <div class="testimonial-story-copy">
          <blockquote>“${escapeHTML(item.quote || "")}”</blockquote>
          <div><strong>${escapeHTML(item.name || "Pelanggan AYA")}</strong><span>${escapeHTML(item.meta || productName)}</span></div>
        </div>
      </article>`;
    }

    function renderStories() {
      if (!texts.length) {
        storyTrack.classList.remove("is-moving");
        storyTrack.innerHTML = mediaState("Cerita tulisan belum tersedia", "Cerita akan tampil setelah melalui review AYA.");
        storyViewport.removeAttribute("tabindex");
        reelHint.hidden = true;
        return;
      }

      const originals = texts.map((item) => storyCard(item, false));
      const shouldMove = texts.length >= 2 && !reducedMotion.matches;
      storyTrack.innerHTML = shouldMove
        ? [...originals, ...texts.map((item) => storyCard(item, true))].join("")
        : originals.join("");
      storyTrack.classList.toggle("is-moving", shouldMove);
      reelHint.hidden = !shouldMove;
      storyViewport.setAttribute("tabindex", "0");
      storyTrack.querySelectorAll(".testimonial-story-product img").forEach((image) => {
        image.addEventListener("error", () => {
          if (image.dataset.fallbackApplied === "true") return;
          image.dataset.fallbackApplied = "true";
          const product = image.dataset.imageFallback && typeof AYA?.getProduct === "function"
            ? AYA.getProduct(image.dataset.imageFallback)
            : null;
          image.src = product?.placeholder || "assets/visual/aya-mark.svg";
        });
      });
    }

    function stopPhotoTimer() {
      if (photoTimer) window.clearInterval(photoTimer);
      photoTimer = null;
    }

    function startPhotoTimer() {
      stopPhotoTimer();
      if (photos.length < 2 || reducedMotion.matches || galleryMode === "photo") return;
      photoTimer = window.setInterval(() => renderPhoto((activePhotoIndex + 1) % photos.length), 10000);
    }

    function renderPhoto(index = 0) {
      if (!photos.length) {
        photoContent.innerHTML = photoBrandFallback("Cerita foto sedang dipersiapkan", "Photo artwork tampil setelah disetujui dan disiapkan untuk publikasi.");
        photoStage?.classList.add("is-empty");
        photoDots.hidden = true;
        photoGalleryOpen.hidden = true;
        stopPhotoTimer();
        return;
      }

      const item = photos[Math.max(0, Math.min(photos.length - 1, index))];
      const source = item.displayImage || item.image;
      activePhotoIndex = photos.indexOf(item);
      if (!source) {
        photoContent.innerHTML = photoBrandFallback("Cerita foto sedang dipersiapkan", "Media pelanggan ini belum memiliki sumber gambar yang valid.");
        photoDots.hidden = true;
        photoGalleryOpen.hidden = true;
        stopPhotoTimer();
        return;
      }

      photoContent.innerHTML = `<button class="testimonial-photo-frame" data-photo-open type="button" aria-label="Lihat foto testimoni lebih besar"><img src="${escapeHTML(source)}" alt="Foto testimoni pelanggan AYA"><span class="testimonial-photo-error" data-photo-error hidden>Foto belum dapat ditampilkan.</span></button>`;
      const image = photoContent.querySelector("img");
      const error = photoContent.querySelector("[data-photo-error]");
      image?.addEventListener("error", () => {
        const frame = image.closest(".testimonial-photo-frame");
        image.hidden = true;
        frame?.classList.add("is-fallback");
        frame?.setAttribute("aria-label", "Foto testimoni belum dapat ditampilkan");
        if (error) {
          error.hidden = false;
          error.textContent = "Cerita foto sedang dipersiapkan.";
        }
      });
      photoContent.querySelector("[data-photo-open]")?.addEventListener("click", () => openGallery("photo", activePhotoIndex));

      if (photos.length > 1) {
        photoDots.hidden = false;
        photoDots.innerHTML = photos.map((_, dotIndex) => `<i class="${dotIndex === activePhotoIndex ? "active" : ""}"></i>`).join("");
        photoGalleryOpen.hidden = false;
      } else {
        photoDots.hidden = true;
        photoGalleryOpen.hidden = true;
      }
      startPhotoTimer();
    }

    function videoGalleryMarkup() {
      return `<div class="testimonial-video-gallery">
        ${videos.map((item, index) => `<button class="testimonial-video-choice${index === activeVideoIndex ? " active" : ""}" data-gallery-video-index="${index}" type="button">
          <span class="testimonial-video-choice-poster">${item.poster ? `<img src="${escapeHTML(item.poster)}" alt="">` : "▶"}</span>
          <span><strong>${escapeHTML(item.name || "Pelanggan AYA")}</strong><small>${escapeHTML(item.city || item.location || "Video pelanggan")}</small></span>
        </button>`).join("")}
      </div>`;
    }

    function photoGalleryMarkup(selectedIndex = 0) {
      return `<div class="testimonial-photo-gallery">
        <figure class="testimonial-photo-gallery-main"><img src="${escapeHTML(photos[selectedIndex]?.displayImage || photos[selectedIndex]?.image || "")}" alt="Foto testimoni pelanggan AYA"></figure>
        ${photos.length > 1 ? `<div class="testimonial-photo-gallery-list">${photos.map((item, index) => `<button class="${index === selectedIndex ? "active" : ""}" data-gallery-photo-index="${index}" type="button"><img src="${escapeHTML(item.displayImage || item.image || "")}" alt="Foto ${index + 1}"></button>`).join("")}</div>` : ""}
      </div>`;
    }

    function bindPhotoGalleryChoices() {
      const mainImage = galleryBody.querySelector(".testimonial-photo-gallery-main img");
      mainImage?.addEventListener("error", () => {
        const frame = mainImage.closest(".testimonial-photo-gallery-main");
        if (frame) frame.innerHTML = mediaState("Foto belum dapat ditampilkan", "Coba foto lainnya atau tutup galeri.");
      });
      galleryBody.querySelectorAll("[data-gallery-photo-index]").forEach((button) => {
        const thumb = button.querySelector("img");
        thumb?.addEventListener("error", () => { button.hidden = true; });
        button.addEventListener("click", () => {
          const nextIndex = Number(button.dataset.galleryPhotoIndex);
          galleryBody.innerHTML = photoGalleryMarkup(nextIndex);
          bindPhotoGalleryChoices();
        });
      });
    }

    function openGallery(mode, selectedIndex = 0) {
      if (!dialog || !galleryBody) return;
      galleryMode = mode;
      stopPhotoTimer();
      if (mode === "video") {
        galleryKicker.textContent = "VIDEO PELANGGAN";
        galleryTitle.textContent = "Lihat semua video";
        galleryBody.innerHTML = videoGalleryMarkup();
        galleryBody.querySelectorAll("[data-gallery-video-index]").forEach((button) => {
          button.addEventListener("click", () => {
            closeGallery();
            renderVideo(Number(button.dataset.galleryVideoIndex), false);
            videoContent.querySelector("video")?.focus();
          });
        });
      } else {
        galleryKicker.textContent = "PHOTO ARTWORK";
        galleryTitle.textContent = "Foto cerita pelanggan";
        galleryBody.innerHTML = photoGalleryMarkup(selectedIndex);
        bindPhotoGalleryChoices();
      }
      if (!dialog.open) dialog.showModal();
      galleryClose?.focus();
    }

    function closeGallery() {
      if (!dialog?.open) return;
      dialog.close();
      galleryMode = null;
      startPhotoTimer();
    }

    videoGalleryOpen?.addEventListener("click", () => openGallery("video"));
    photoGalleryOpen?.addEventListener("click", () => openGallery("photo", activePhotoIndex));
    galleryClose?.addEventListener("click", closeGallery);
    dialog?.addEventListener("click", (event) => { if (event.target === dialog) closeGallery(); });
    dialog?.addEventListener("close", () => {
      galleryMode = null;
      startPhotoTimer();
    });
    photoStage?.addEventListener("mouseenter", stopPhotoTimer);
    photoStage?.addEventListener("mouseleave", startPhotoTimer);
    photoStage?.addEventListener("focusin", stopPhotoTimer);
    photoStage?.addEventListener("focusout", startPhotoTimer);
    reducedMotion.addEventListener?.("change", () => { renderStories(); startPhotoTimer(); });

    renderVideo(0, false);
    renderStories();
    renderPhoto(0);
  });
})();

(() => {
  const config = window.AYA_CONFIG?.supabase || {};
  const url = String(config.url || "").trim().replace(/\/+$/, "");
  const publishableKey = String(config.publishableKey || "").trim();
  const environment = String(config.environment || "staging").trim();
  const timeoutMs = Math.max(5000, Number(config.timeoutMs) || 20000);
  const isConfigured = /^https:\/\/.+\.supabase\.co$/i.test(url) && publishableKey.length > 20;

  async function request(endpoint, options = {}, customTimeout = timeoutMs) {
    if (!isConfigured) throw new Error("Supabase belum dikonfigurasi.");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), customTimeout);
    try {
      const response = await fetch(`${url}${endpoint}`, {
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
        ...options,
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Accept: "application/json",
          ...(options.headers || {})
        }
      });
      const responseText = await response.text();
      let data = null;
      if (responseText) {
        try { data = JSON.parse(responseText); }
        catch { data = responseText; }
      }
      if (!response.ok) {
        const message = data?.message || data?.hint || data?.details || (typeof data === "string" ? data : "") || `Supabase request gagal (${response.status}).`;
        throw new Error(message);
      }
      return data;
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("Koneksi ke server terlalu lama.");
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function rpc(functionName, payload = {}) {
    return request(`/rest/v1/rpc/${encodeURIComponent(functionName)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  function safeExtension(file) {
    const byMime = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "video/mp4": "mp4",
      "video/quicktime": "mov",
      "video/webm": "webm"
    };
    return byMime[file.type] || "bin";
  }

  function encodedObjectPath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  async function uploadTestimonialMedia(file, format) {
    if (!(file instanceof File)) throw new Error("File media belum dipilih.");
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const id = crypto.randomUUID();
    const path = `${environment}/${year}/${month}/${id}.${safeExtension(file)}`;
    await request(`/storage/v1/object/aya-testimonial-media/${encodedObjectPath(path)}`, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "x-upsert": "false",
        "cache-control": "3600"
      },
      body: file
    }, format === "video" ? 120000 : 45000);
    return { path };
  }

  window.AYA_SUPABASE = Object.freeze({
    isConfigured,
    environment,
    rpc,
    uploadTestimonialMedia
  });
})();

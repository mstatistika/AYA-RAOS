(() => {
  "use strict";

  const config = window.AYA_CONFIG?.supabase || {};
  const url = String(config.url || "").trim().replace(/\/+$/, "");
  const publishableKey = String(config.publishableKey || "").trim();
  const environment = String(config.environment || window.AYA_CONFIG?.environment || "staging").trim();
  const timeoutMs = Math.max(5000, Number(config.timeoutMs) || 20000);
  const isConfigured = /^https:\/\/.+\.supabase\.co$/i.test(url) && publishableKey.length > 20;

  async function rpc(functionName, payload = {}) {
    if (!isConfigured) throw new Error("Layanan penyimpanan order belum dikonfigurasi.");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${url}/rest/v1/rpc/${encodeURIComponent(functionName)}`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const raw = await response.text();
      let data = null;
      if (raw) {
        try { data = JSON.parse(raw); }
        catch { data = raw; }
      }
      if (!response.ok) {
        const message = data?.message || data?.hint || data?.details || (typeof data === "string" ? data : "") || `Permintaan gagal (${response.status}).`;
        throw new Error(message);
      }
      return Array.isArray(data) && data.length === 1 ? data[0] : data;
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("Koneksi ke server terlalu lama. Silakan coba kembali.");
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const idempotencyKey = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
      const value = Math.random() * 16 | 0;
      return (char === "x" ? value : (value & 0x3 | 0x8)).toString(16);
    });
  };

  const createOrder = (payload, key) => rpc("create_aya_order_v1", {
    p_payload: payload,
    p_idempotency_key: key,
    p_environment: environment,
    p_website: ""
  });

  const createBusinessInquiry = (payload, key) => rpc("create_aya_business_inquiry_v1", {
    p_payload: payload,
    p_idempotency_key: key,
    p_environment: environment,
    p_website: ""
  });

  window.AYA_ORDER_API = Object.freeze({
    isConfigured,
    environment,
    idempotencyKey,
    createOrder,
    createBusinessInquiry
  });
})();

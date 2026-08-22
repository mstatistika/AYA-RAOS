"use strict";

const { allowMethods, readJsonBody, sendJson } = require("../../server/http");
const { callRpc } = require("../../server/supabase");

function validatePublicPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "invalid_payload";
  if (payload.schemaVersion !== 3) return "unsupported_schema_version";
  if (!Array.isArray(payload.products) || payload.products.length < 1 || payload.products.length > 20) return "invalid_products";

  const cadences = new Set(["W1", "W2", "M1", "M2"]);
  for (const row of payload.products) {
    if (!row || typeof row !== "object") return "invalid_product_row";
    if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(String(row.productId || ""))) return "invalid_product_id";
    if (!String(row.variant || "").trim() || String(row.variant).length > 120) return "invalid_variant";
    if (!String(row.unit || "").trim() || String(row.unit).length > 40) return "invalid_unit";
    if (!Number.isInteger(Number(row.quantity)) || Number(row.quantity) < 1 || Number(row.quantity) > 1000000) return "invalid_quantity";
    if (!cadences.has(String(row.cadence || ""))) return "invalid_cadence";
  }

  const company = payload.company;
  if (!company || typeof company !== "object" || Array.isArray(company)) return "invalid_company";

  const bounded = (value, min, max) => {
    const text = String(value || "").trim();
    return text.length >= min && text.length <= max;
  };
  if (!bounded(company.name, 2, 160)) return "invalid_company_name";
  if (!bounded(company.context, 2, 160)) return "invalid_context";
  if (!bounded(company.pic, 2, 120)) return "invalid_pic";

  const whatsapp = String(company.whatsapp || "").replace(/[^0-9+]/g, "");
  if (whatsapp.length < 7 || whatsapp.length > 24) return "invalid_whatsapp";

  const email = String(company.email || "").trim();
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return "invalid_email";

  const neededDate = String(company.neededDate || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(neededDate)) return "invalid_needed_date";
  if (!bounded(company.location, 2, 1200)) return "invalid_location";
  if (company.notes != null && String(company.notes).length > 4000) return "invalid_notes";
  return "";
}

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  let payload;
  try {
    payload = readJsonBody(req);
  } catch (error) {
    return sendJson(res, error.code === "request_too_large" ? 413 : 400, {
      ok: false,
      error: error.code || "invalid_request"
    });
  }

  const validationError = validatePublicPayload(payload);
  if (validationError) {
    return sendJson(res, 400, { ok: false, error: validationError });
  }

  try {
    // Qualification only needs commercial rows. Company identity stays at the API edge
    // until the separate Account Activation domain is implemented.
    const qualificationPayload = {
      schemaVersion: payload.schemaVersion,
      products: payload.products
    };
    const result = await callRpc("aya_b2b_qualify_v1", { p_payload: qualificationPayload });
    if (!result || !["eligible", "adjust"].includes(result.status)) {
      return sendJson(res, 503, {
        status: "unavailable",
        message: "Sistem pemeriksaan status Pasokan belum siap digunakan."
      });
    }
    return sendJson(res, 200, result);
  } catch (error) {
    console.error("AYA B2B qualification backend failed", {
      code: error.code || "unknown",
      status: error.status || null,
      detail: error.detail || ""
    });
    return sendJson(res, 503, {
      status: "unavailable",
      message: "Sistem pemeriksaan status Pasokan belum dapat dihubungi. Silakan coba kembali nanti."
    });
  }
};

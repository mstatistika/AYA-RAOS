"use strict";

const { allowMethods, readJsonBody, sendJson } = require("../../server/http");
const { patchTable } = require("../../server/dev-admin");

const allowedKeys = new Set([
  "product_name", "line_name", "category_name", "public_status", "visible",
  "orderable", "min_quantity", "max_quantity", "quantity_step", "supply_eligible"
]);

function cleanPayload(input) {
  const payload = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) payload[key] = input[key];
  }
  if (payload.product_name != null && !String(payload.product_name).trim()) throw new Error("product_name_required");
  if (payload.public_status != null && !["Tersedia", "Pre-order", "Habis"].includes(payload.public_status)) throw new Error("invalid_public_status");
  for (const key of ["visible", "orderable", "supply_eligible"]) {
    if (payload[key] != null) payload[key] = Boolean(payload[key]);
  }
  for (const key of ["min_quantity", "max_quantity", "quantity_step"]) {
    if (payload[key] != null) payload[key] = Number(payload[key]);
  }
  payload.updated_at = new Date().toISOString();
  return payload;
}

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["PATCH"])) return;
  try {
    const body = readJsonBody(req);
    const productId = String(body.product_id || "").trim();
    if (!productId) return sendJson(res, 400, { ok: false, error: "product_id_required" });
    const updated = await patchTable("aya_catalog_products", { product_id: productId }, cleanPayload(body));
    sendJson(res, 200, { ok: true, product: Array.isArray(updated) ? updated[0] || null : updated });
  } catch (error) {
    sendJson(res, error.status || 400, { ok: false, error: error.code || error.message || "dev_admin_product_update_failed" });
  }
};

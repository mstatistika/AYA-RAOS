"use strict";

const { allowMethods, readJsonBody, sendJson } = require("../../server/http");
const { patchTable } = require("../../server/dev-admin");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["PATCH"])) return;
  try {
    const body = readJsonBody(req);
    const type = String(body.type || "");
    let updated;

    if (type === "variant") {
      const productId = String(body.product_id || "").trim();
      const variantName = String(body.variant_name || "").trim();
      if (!productId || !variantName) return sendJson(res, 400, { ok: false, error: "variant_identity_required" });
      const unitPrice = Number(body.unit_price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return sendJson(res, 400, { ok: false, error: "unit_price_invalid" });
      updated = await patchTable("aya_catalog_variants", { product_id: productId, variant_name: variantName }, {
        unit_price: Math.round(unitPrice),
        orderable: body.orderable == null ? true : Boolean(body.orderable),
        updated_at: new Date().toISOString()
      });
    } else if (type === "cms") {
      const slotKey = String(body.slot_key || "").trim();
      if (!slotKey) return sendJson(res, 400, { ok: false, error: "slot_key_required" });
      const text = String(body.text ?? "");
      updated = await patchTable("aya_cms_slots", { slot_key: slotKey }, {
        draft_content: { text },
        draft_version: Number(body.draft_version || 1) + 1,
        updated_at: new Date().toISOString()
      });
    } else {
      return sendJson(res, 400, { ok: false, error: "unsupported_content_type" });
    }

    sendJson(res, 200, { ok: true, data: Array.isArray(updated) ? updated[0] || null : updated });
  } catch (error) {
    sendJson(res, error.status || 400, { ok: false, error: error.code || error.message || "dev_admin_content_update_failed" });
  }
};

"use strict";

const { allowMethods, sendJson } = require("../../server/http");
const { assertDevPreview, selectTable } = require("../../server/dev-admin");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  try {
    assertDevPreview();
    const [products, variants, cms, testimonials, b2b] = await Promise.all([
      selectTable("aya_catalog_products", "product_id,product_name,line_name,category_name,public_status,visible,orderable,min_quantity,max_quantity,quantity_step,supply_eligible,updated_at", { order: "updated_at.desc", limit: 250 }),
      selectTable("aya_catalog_variants", "product_id,variant_name,unit_price,orderable,updated_at", { order: "updated_at.desc", limit: 500 }),
      selectTable("aya_cms_slots", "slot_key,area,label,draft_content,published_content,draft_version,published_version,updated_at,published_at", { order: "updated_at.desc", limit: 100 }),
      selectTable("aya_testimonials", "id,display_name,product_name_snapshot,testimonial_format,status,is_featured,testimonial_text,approved_text,public_display_name,public_city,city,submitted_at", { order: "submitted_at.desc", limit: 250 }),
      selectTable("aya_b2b_product_config", "product_id,supply_eligible,updated_at", { order: "updated_at.desc", limit: 250 })
    ]);

    sendJson(res, 200, {
      ok: true,
      environment: "preview",
      mode: "dev-admin",
      readOnly: false,
      data: { products, variants, cms, testimonials, b2b }
    });
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, error: error.code || "dev_admin_read_failed", detail: error.message });
  }
};

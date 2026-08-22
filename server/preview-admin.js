"use strict";

const { backendConfig } = require("./supabase");

const TABLES = new Set([
  "aya_catalog_products",
  "aya_catalog_variants",
  "aya_b2b_product_config",
  "aya_b2b_measurements",
  "aya_b2b_qualification_thresholds",
  "aya_b2b_qualification_settings",
  "aya_b2b_companies",
  "aya_b2b_company_members",
  "aya_testimonials",
  "aya_testimonial_publish_assets",
  "aya_orders",
  "aya_order_items",
  "aya_cms_slots",
  "aya_cms_versions",
  "aya_media_assets",
  "aya_admin_audit_log",
  "aya_admin_functions",
  "aya_admin_roles",
  "aya_admin_users",
  "aya_admin_user_roles",
  "aya_admin_role_functions",
  "aya_product_master",
  "aya_product_variants"
]);

const RPC_FUNCTIONS = new Set([
  "aya_admin_save_cms_draft",
  "aya_admin_publish_cms_slot",
  "aya_admin_rollback_cms_slot",
  "aya_admin_update_product",
  "aya_b2b_measurement_economics_v1",
  "aya_admin_update_b2b_measurement",
  "aya_admin_moderate_testimonial",
  "aya_admin_set_testimonial_publication",
  "aya_admin_set_role_functions",
  "aya_admin_create_role",
  "aya_admin_assign_role",
  "aya_admin_upsert_product_master",
  "aya_admin_upsert_product_variant"
]);

function fail(code, status = 400, detail = "") {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  error.detail = detail;
  throw error;
}

function assertDevPreview() {
  if (process.env.VERCEL_ENV !== "preview") fail("preview_only", 404);
  const config = backendConfig();
  if (!config.ready) fail("backend_not_configured", 503);
  return config;
}

function assertTable(table) {
  if (!TABLES.has(table)) fail("table_not_allowed", 400);
  return table;
}

function assertRpc(functionName) {
  if (!RPC_FUNCTIONS.has(functionName)) fail("rpc_not_allowed", 400);
  return functionName;
}

function encode(value) {
  return encodeURIComponent(String(value));
}

async function request(path, options = {}) {
  const config = assertDevPreview();
  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch (_) { body = text; }
  }
  if (!response.ok) {
    const error = new Error(body?.message || body?.error || "supabase_request_failed");
    error.code = body?.code || "supabase_request_failed";
    error.status = response.status;
    error.detail = body?.hint || body?.details || "";
    throw error;
  }
  return { body, response };
}

function buildRestQuery({ select = "*", filters = [], orders = [], limit, offset }) {
  const query = new URLSearchParams();
  query.set("select", select || "*");
  for (const filter of filters || []) {
    if (!filter?.column) continue;
    if (filter.operator === "in") {
      const values = Array.isArray(filter.value) ? filter.value : [];
      query.set(filter.column, `in.(${values.map((value) => String(value).replace(/[(),]/g, "")).join(",")})`);
    } else {
      query.set(filter.column, `${filter.operator || "eq"}.${String(filter.value)}`);
    }
  }
  for (const order of orders || []) {
    if (order?.column) query.append("order", `${order.column}.${order.ascending === false ? "desc" : "asc"}`);
  }
  if (Number.isFinite(Number(limit))) query.set("limit", String(Math.max(0, Number(limit))));
  if (Number.isFinite(Number(offset))) query.set("offset", String(Math.max(0, Number(offset))));
  return query.toString();
}

async function selectTable(table, options = {}) {
  assertTable(table);
  const head = Boolean(options.head);
  const headers = head ? { Prefer: "count=exact" } : {};
  const { body, response } = await request(`/rest/v1/${encode(table)}?${buildRestQuery(options)}`, {
    method: head ? "HEAD" : "GET",
    headers
  });
  const contentRange = response.headers.get("content-range") || "";
  const rangeCount = contentRange.includes("/") ? Number(contentRange.split("/").pop()) : NaN;
  return {
    data: head ? null : (Array.isArray(body) ? body : body == null ? [] : [body]),
    count: Number.isFinite(rangeCount) ? rangeCount : (Array.isArray(body) ? body.length : 0)
  };
}

function filtersToQuery(filters = []) {
  const query = new URLSearchParams();
  for (const filter of filters) {
    if (!filter?.column) continue;
    if (filter.operator === "in") {
      const values = Array.isArray(filter.value) ? filter.value : [];
      query.set(filter.column, `in.(${values.map((value) => String(value).replace(/[(),]/g, "")).join(",")})`);
    } else {
      query.set(filter.column, `${filter.operator || "eq"}.${String(filter.value)}`);
    }
  }
  return query.toString();
}

async function patchTable(table, filters, payload) {
  assertTable(table);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) fail("invalid_payload", 400);
  const { body } = await request(`/rest/v1/${encode(table)}?${filtersToQuery(filters)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(payload)
  });
  return Array.isArray(body) ? body : body == null ? [] : [body];
}

async function insertTable(table, payload) {
  assertTable(table);
  if (!payload || typeof payload !== "object") fail("invalid_payload", 400);
  const { body } = await request(`/rest/v1/${encode(table)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(payload)
  });
  return Array.isArray(body) ? body : body == null ? [] : [body];
}

const PREVIEW_ACTOR = process.env.AYA_PREVIEW_ACTOR_ID || "c8b72460-9c4e-4f93-8916-cb8c4f131831";

async function one(table, filters, select = "*") {
  const result = await selectTable(table, { select, filters, limit: 1 });
  return result.data?.[0] || null;
}

async function audit(functionKey, entityType, entityId, action, reason = null) {
  try {
    await insertTable("aya_admin_audit_log", {
      actor_user_id: PREVIEW_ACTOR,
      effective_function: functionKey,
      entity_type: entityType,
      entity_id: String(entityId),
      action,
      reason: reason || null
    });
  } catch (_) {
    // Preview writes must remain usable even if an older staging schema lacks an audit column.
  }
}

async function directRpc(functionName, args) {
  const now = new Date().toISOString();

  if (functionName === "aya_admin_save_cms_draft") {
    const key = String(args.p_slot_key || "");
    const slot = await one("aya_cms_slots", [{ column: "slot_key", value: key }]);
    if (!slot) fail("content_slot_not_found", 404);
    const version = Number(slot.draft_version || 0) + 1;
    const content = args.p_content && typeof args.p_content === "object" ? args.p_content : {};
    await patchTable("aya_cms_slots", [{ column: "slot_key", value: key }], { draft_content: content, draft_version: version, updated_by: PREVIEW_ACTOR, updated_at: now });
    await insertTable("aya_cms_versions", { slot_key: key, version, content, version_status: "draft", created_by: PREVIEW_ACTOR, reason: args.p_reason || null });
    await audit("website.edit", "cms_slot", key, "save_draft", args.p_reason);
    return { slotKey: key, draftVersion: version };
  }

  if (functionName === "aya_admin_publish_cms_slot") {
    const key = String(args.p_slot_key || "");
    const slot = await one("aya_cms_slots", [{ column: "slot_key", value: key }]);
    if (!slot) fail("content_slot_not_found", 404);
    await patchTable("aya_cms_slots", [{ column: "slot_key", value: key }], { published_content: slot.draft_content || {}, published_version: slot.draft_version, published_at: now, updated_by: PREVIEW_ACTOR, updated_at: now });
    await audit("website.publish", "cms_slot", key, "publish", args.p_reason);
    return { slotKey: key, publishedVersion: slot.draft_version };
  }

  if (functionName === "aya_admin_rollback_cms_slot") {
    const key = String(args.p_slot_key || "");
    const source = await one("aya_cms_versions", [{ column: "slot_key", value: key }, { column: "version", value: Number(args.p_version) }]);
    const slot = await one("aya_cms_slots", [{ column: "slot_key", value: key }]);
    if (!source || !slot) fail("cms_version_not_found", 404);
    const version = Math.max(Number(slot.draft_version || 0), Number(slot.published_version || 0)) + 1;
    await patchTable("aya_cms_slots", [{ column: "slot_key", value: key }], { draft_content: source.content, published_content: source.content, draft_version: version, published_version: version, published_at: now, updated_by: PREVIEW_ACTOR, updated_at: now });
    await insertTable("aya_cms_versions", { slot_key: key, version, content: source.content, version_status: "rollback_source", created_by: PREVIEW_ACTOR, reason: args.p_reason || `Rollback from version ${args.p_version}` });
    await audit("website.rollback", "cms_slot", key, "rollback", args.p_reason);
    return { slotKey: key, publishedVersion: version, sourceVersion: Number(args.p_version) };
  }

  if (functionName === "aya_admin_update_product") {
    const id = String(args.p_product_id || "");
    if (!await one("aya_catalog_products", [{ column: "product_id", value: id }], "product_id")) fail("product_not_found", 404);
    await patchTable("aya_catalog_products", [{ column: "product_id", value: id }], { public_status: args.p_public_status, orderable: Boolean(args.p_orderable), visible: Boolean(args.p_visible), updated_at: now });
    if (args.p_supply_eligible !== null && args.p_supply_eligible !== undefined) {
      await patchTable("aya_b2b_product_config", [{ column: "product_id", value: id }], { supply_eligible: Boolean(args.p_supply_eligible), updated_at: now });
    }
    await audit("product.edit", "catalog_product", id, "update");
    return { productId: id, updated: true };
  }

  if (functionName === "aya_admin_update_b2b_measurement") {
    const id = String(args.p_measurement_id || "");
    if (!await one("aya_b2b_measurements", [{ column: "id", value: id }], "id")) fail("measurement_not_found", 404);
    await patchTable("aya_b2b_measurements", [{ column: "id", value: id }], { base_cost: args.p_base_cost == null ? null : Number(args.p_base_cost), final_unit_price: args.p_final_unit_price == null ? null : Number(args.p_final_unit_price), updated_at: now });
    await audit("b2b.cogs.edit", "b2b_measurement", id, "update");
    return { measurementId: id, updated: true };
  }

  if (functionName === "aya_admin_moderate_testimonial") {
    const id = String(args.p_id || "");
    const current = await one("aya_testimonials", [{ column: "id", value: id }], "id,display_name,city,testimonial_text");
    if (!current) fail("testimonial_not_found", 404);
    const approved = args.p_decision === "approved";
    if (!approved && args.p_decision !== "rejected") fail("invalid_decision", 400);
    await patchTable("aya_testimonials", [{ column: "id", value: id }], {
      status: args.p_decision,
      approved_text: approved ? (String(args.p_approved_text || "").trim() || current.testimonial_text) : undefined,
      public_display_name: approved ? (String(args.p_public_name || "").trim() || current.display_name) : undefined,
      public_city: approved ? (String(args.p_public_city || "").trim() || current.city || null) : undefined,
      rejection_note: approved ? null : (String(args.p_rejection_note || "").trim() || "Tidak disetujui"),
      approved_at: approved ? now : null,
      updated_at: now
    });
    await audit("testimonial.moderate", "testimonial", id, "moderate", args.p_rejection_note);
    return { id, status: args.p_decision };
  }

  if (functionName === "aya_admin_set_testimonial_publication") {
    const id = String(args.p_id || "");
    if (!await one("aya_testimonials", [{ column: "id", value: id }], "id")) fail("testimonial_not_found", 404);
    await patchTable("aya_testimonials", [{ column: "id", value: id }], { is_featured: Boolean(args.p_publish), display_order: args.p_display_order == null ? null : Number(args.p_display_order), public_media_url: args.p_public_media_url || null, updated_at: now });
    await audit("testimonial.publish", "testimonial", id, args.p_publish ? "publish" : "unpublish");
    return { id, published: Boolean(args.p_publish) };
  }

  if (functionName === "aya_admin_upsert_product_master") {
    const id = String(args.p_product_id || "").trim();
    if (!id || !String(args.p_product_name || "").trim()) fail("product_identity_required", 400);
    const payload = { product_id: id, product_name: String(args.p_product_name).trim(), line_name: String(args.p_line_name || "").trim(), category_name: String(args.p_category_name || "").trim(), active: Boolean(args.p_active), updated_at: now };
    const existing = await one("aya_product_master", [{ column: "product_id", value: id }], "product_id");
    const data = existing ? await patchTable("aya_product_master", [{ column: "product_id", value: id }], payload) : await insertTable("aya_product_master", payload);
    await audit("product.edit", "product_master", id, existing ? "update" : "create");
    return data[0] || payload;
  }

  if (functionName === "aya_admin_upsert_product_variant") {
    const productId = String(args.p_product_id || "").trim();
    const name = String(args.p_variant_name || "").trim();
    if (!productId || !name) fail("variant_identity_required", 400);
    const payload = { product_id: productId, variant_name: name, active: Boolean(args.p_active), updated_at: now };
    const existing = await one("aya_product_variants", [{ column: "product_id", value: productId }, { column: "variant_name", value: name }], "product_id,variant_name");
    const data = existing ? await patchTable("aya_product_variants", [{ column: "product_id", value: productId }, { column: "variant_name", value: name }], payload) : await insertTable("aya_product_variants", payload);
    await audit("product.variant.edit", "product_variant", `${productId}:${name}`, existing ? "update" : "create");
    return data[0] || payload;
  }

  if (functionName === "aya_admin_assign_role") {
    const filter = [{ column: "user_id", value: args.p_user_id }, { column: "role_id", value: args.p_role_id }];
    if (args.p_assign) await insertTable("aya_admin_user_roles", { user_id: args.p_user_id, role_id: args.p_role_id });
    else await request(`/rest/v1/aya_admin_user_roles?${filtersToQuery(filter)}`, { method: "DELETE" });
    return { assigned: Boolean(args.p_assign) };
  }

  if (functionName === "aya_admin_create_role") {
    const role = (await insertTable("aya_admin_roles", { role_code: String(args.p_role_code || "").trim(), role_name: String(args.p_role_name || "").trim(), description: args.p_description || null, is_system: false }))[0];
    for (const key of Array.isArray(args.p_function_keys) ? args.p_function_keys : []) await insertTable("aya_admin_role_functions", { role_id: role.id, function_key: key });
    return role;
  }

  if (functionName === "aya_admin_set_role_functions") {
    const roleId = String(args.p_role_id || "");
    await request(`/rest/v1/aya_admin_role_functions?${filtersToQuery([{ column: "role_id", value: roleId }])}`, { method: "DELETE" });
    for (const key of Array.isArray(args.p_function_keys) ? args.p_function_keys : []) await insertTable("aya_admin_role_functions", { role_id: roleId, function_key: key });
    return { roleId, updated: true };
  }

  return null;
}

async function callRpc(functionName, args = {}) {
  assertRpc(functionName);
  if (functionName !== "aya_b2b_measurement_economics_v1") return directRpc(functionName, args);
  const { body } = await request(`/rest/v1/rpc/${encode(functionName)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args || {})
  });
  return body;
}

async function uploadObject(bucket, objectPath, buffer, contentType = "application/octet-stream") {
  if (bucket !== "aya-admin-media") fail("bucket_not_allowed", 400);
  if (!objectPath || !Buffer.isBuffer(buffer)) fail("invalid_upload", 400);
  const { body } = await request(`/storage/v1/object/${encode(bucket)}/${objectPath.split("/").map(encode).join("/")}`, {
    method: "POST",
    headers: { "Content-Type": contentType, "x-upsert": "false", "cache-control": "3600" },
    body: buffer
  });
  return body;
}

async function signedObjectUrl(bucket, objectPath, expiresIn = 120) {
  if (bucket !== "aya-admin-media") fail("bucket_not_allowed", 400);
  const { body } = await request(`/storage/v1/object/sign/${encode(bucket)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths: [objectPath], expiresIn })
  });
  const item = Array.isArray(body) ? body[0] : body;
  const value = item?.signedURL || item?.signedUrl || item?.path || "";
  const config = backendConfig();
  return { signedUrl: value.startsWith("http") ? value : `${config.url}/storage/v1${value}` };
}

module.exports = {
  assertDevPreview,
  selectTable,
  patchTable,
  insertTable,
  callRpc,
  uploadObject,
  signedObjectUrl
};

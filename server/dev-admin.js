"use strict";

const { backendConfig } = require("./supabase");

function devPreviewError(code, status = 403) {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  return error;
}

function assertDevPreview() {
  if (process.env.VERCEL_ENV !== "preview") {
    throw devPreviewError("dev_admin_preview_only", 404);
  }
  const config = backendConfig();
  if (!config.ready) {
    throw devPreviewError("dev_admin_backend_not_configured", 503);
  }
  return config;
}

async function supabaseRequest(path, options = {}) {
  const config = assertDevPreview();
  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    Accept: "application/json",
    ...(options.headers || {})
  };
  if (options.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); }
    catch (_) { data = text; }
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || data?.details || `Supabase request failed (${response.status}).`);
    error.code = "supabase_request_failed";
    error.status = response.status;
    throw error;
  }
  return data;
}

function encode(value) {
  return encodeURIComponent(String(value));
}

function tableQuery(table, select, params = {}) {
  const query = new URLSearchParams({ select, limit: String(params.limit || 100) });
  if (params.order) query.set("order", params.order);
  for (const [key, value] of Object.entries(params.filters || {})) {
    query.set(key, `eq.${value}`);
  }
  return `/rest/v1/${encode(table)}?${query.toString()}`;
}

async function selectTable(table, select, params = {}) {
  return supabaseRequest(tableQuery(table, select, params));
}

async function patchTable(table, filters, payload) {
  const query = new URLSearchParams({});
  for (const [key, value] of Object.entries(filters)) query.set(key, `eq.${value}`);
  return supabaseRequest(`/rest/v1/${encode(table)}?${query.toString()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(payload)
  });
}

async function insertTable(table, payload) {
  return supabaseRequest(`/rest/v1/${encode(table)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(payload)
  });
}

async function uploadObject(bucket, objectPath, buffer, contentType) {
  assertDevPreview();
  return supabaseRequest(`/storage/v1/object/${encode(bucket)}/${objectPath.split("/").map(encode).join("/")}`, {
    method: "POST",
    headers: { "Content-Type": contentType, "x-upsert": "false", "cache-control": "3600" },
    body: buffer
  });
}

async function signedObjectUrl(bucket, objectPath, expiresIn = 3600) {
  const data = await supabaseRequest(`/storage/v1/object/sign/${encode(bucket)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths: [objectPath], expiresIn })
  });
  const signed = Array.isArray(data) ? data[0] : data;
  const path = signed?.path || objectPath;
  return { path, signedUrl: path?.startsWith("http") ? path : `${backendConfig().url}/storage/v1${path}` };
}

module.exports = {
  assertDevPreview,
  supabaseRequest,
  selectTable,
  patchTable,
  insertTable,
  uploadObject,
  signedObjectUrl
};

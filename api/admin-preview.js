"use strict";

const { allowMethods, readJsonBody, sendJson } = require("../server/http");
const {
  assertDevPreview,
  selectTable,
  patchTable,
  insertTable,
  callRpc,
  uploadObject,
  signedObjectUrl
} = require("../server/preview-admin");

function text(value, fallback = "") {
  return value == null ? fallback : String(value);
}

function cleanFilters(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item) => ({
    column: text(item?.column).trim(),
    operator: text(item?.operator, "eq"),
    value: item?.value
  })).filter((item) => item.column && ["eq", "neq", "gt", "gte", "lt", "lte", "in"].includes(item.operator));
}

function cleanOrders(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 4).map((item) => ({ column: text(item?.column).trim(), ascending: item?.ascending !== false })).filter((item) => item.column);
}

function sendError(res, error) {
  sendJson(res, Number(error?.status) || 500, {
    ok: false,
    error: error?.code || "admin_preview_failed",
    detail: error?.detail || error?.message || "Unknown error"
  });
}

module.exports = async function handler(req, res) {
  try {
    assertDevPreview();
    if (!allowMethods(req, res, ["POST"])) return;
    const body = readJsonBody(req, 10 * 1024 * 1024);
    const op = text(body.op).trim();

    if (op === "select") {
      const result = await selectTable(text(body.table).trim(), {
        select: text(body.select, "*").slice(0, 400),
        filters: cleanFilters(body.filters),
        orders: cleanOrders(body.orders),
        limit: Math.min(500, Math.max(0, Number(body.limit ?? 250))),
        offset: Math.max(0, Number(body.offset ?? 0)),
        head: Boolean(body.head)
      });
      return sendJson(res, 200, { ok: true, ...result });
    }

    if (op === "update") {
      const result = await patchTable(text(body.table).trim(), cleanFilters(body.filters), body.payload);
      return sendJson(res, 200, { ok: true, data: result });
    }

    if (op === "insert") {
      const result = await insertTable(text(body.table).trim(), body.payload);
      return sendJson(res, 200, { ok: true, data: result });
    }

    if (op === "rpc") {
      const result = await callRpc(text(body.functionName).trim(), body.args || {});
      return sendJson(res, 200, { ok: true, data: result });
    }

    if (op === "upload") {
      const encoded = text(body.base64);
      if (!encoded || encoded.length > 8 * 1024 * 1024) return sendJson(res, 413, { ok: false, error: "upload_too_large" });
      const result = await uploadObject(text(body.bucket).trim(), text(body.objectPath).trim(), Buffer.from(encoded, "base64"), text(body.contentType, "application/octet-stream"));
      return sendJson(res, 200, { ok: true, data: result });
    }

    if (op === "signed-url") {
      const result = await signedObjectUrl(text(body.bucket).trim(), text(body.objectPath).trim(), Math.min(3600, Math.max(30, Number(body.expiresIn ?? 120))));
      return sendJson(res, 200, { ok: true, data: result });
    }

    return sendJson(res, 400, { ok: false, error: "unknown_operation" });
  } catch (error) {
    return sendError(res, error);
  }
};

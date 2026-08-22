"use strict";

function setSecurityHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function sendJson(res, statusCode, payload) {
  setSecurityHeaders(res);
  res.status(statusCode).send(JSON.stringify(payload));
}

function allowMethods(req, res, methods) {
  const allowed = new Set(methods);
  if (allowed.has(req.method)) return true;
  res.setHeader("Allow", Array.from(allowed).join(", "));
  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  return false;
}

function readJsonBody(req, maxBytes = 65536) {
  const length = Number(req.headers["content-length"] || 0);
  if (Number.isFinite(length) && length > maxBytes) {
    const error = new Error("request_too_large");
    error.code = "request_too_large";
    throw error;
  }

  if (req.body == null || req.body === "") return {};
  if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;

  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    const error = new Error("request_too_large");
    error.code = "request_too_large";
    throw error;
  }

  try {
    return JSON.parse(raw);
  } catch (_) {
    const error = new Error("invalid_json");
    error.code = "invalid_json";
    throw error;
  }
}

module.exports = { allowMethods, readJsonBody, sendJson };

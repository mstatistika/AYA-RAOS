"use strict";

const { allowMethods, readJsonBody, sendJson } = require("../../server/http");
const { callRpc } = require("../../server/supabase");
const { verifyWebhook } = require("../../server/payment-providers");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const provider = String(req.headers["x-aya-payment-provider"] || req.query?.provider || "").toLowerCase();
  if (!["doku", "midtrans"].includes(provider)) {
    return sendJson(res, 400, { ok: false, error: "unsupported_provider" });
  }

  let payload;
  try {
    payload = readJsonBody(req);
  } catch (error) {
    return sendJson(res, error.code === "request_too_large" ? 413 : 400, { ok: false, error: error.code || "invalid_request" });
  }

  try {
    const verification = await verifyWebhook(provider, req, payload);
    if (!verification || verification.verified !== true || !verification.eventId) {
      return sendJson(res, 401, { ok: false, error: "unverified_webhook" });
    }

    const inboxId = await callRpc("aya_b2b_receive_payment_webhook_v1", {
      p_provider: provider,
      p_provider_event_id: verification.eventId,
      p_event_type: verification.eventType || null,
      p_signature_verified: true,
      p_payload: payload
    });

    return sendJson(res, 202, { ok: true, received: true, inboxId });
  } catch (error) {
    console.error("AYA payment webhook rejected", {
      provider,
      code: error.code || "unknown"
    });
    return sendJson(res, error.status || 503, {
      ok: false,
      error: error.code || "webhook_unavailable"
    });
  }
};

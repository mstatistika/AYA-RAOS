"use strict";

const { allowMethods, sendJson } = require("../../server/http");
const { callRpc } = require("../../server/supabase");
const { verifyWebhook } = require("../../server/payment-providers");

const MAX_BYTES = 65536;

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "utf8");
  if (req.body && typeof req.body === "object") {
    const error = new Error("raw_body_required"); error.code = "raw_body_required"; error.status = 503; throw error;
  }
  const chunks=[]; let size=0;
  for await (const chunk of req) {
    const buffer=Buffer.from(chunk); size+=buffer.length;
    if(size>MAX_BYTES){const error=new Error("request_too_large");error.code="request_too_large";error.status=413;throw error;}
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

module.exports.config = { api: { bodyParser: false } };

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  const provider = String(req.headers["x-aya-payment-provider"] || req.query?.provider || "").toLowerCase();
  if (!["doku", "midtrans"].includes(provider)) return sendJson(res, 400, { ok:false, error:"unsupported_provider" });

  let rawBody;
  try { rawBody = await readRawBody(req); }
  catch (error) { return sendJson(res,error.status||400,{ok:false,error:error.code||"invalid_request"}); }

  let payload;
  try { payload = rawBody.length ? JSON.parse(rawBody.toString("utf8")) : {}; }
  catch (_) { return sendJson(res,400,{ok:false,error:"invalid_json"}); }

  // Preserve exact bytes for DOKU digest verification.
  req.body = rawBody;
  try {
    const verification = await verifyWebhook(provider, req, payload);
    if (!verification?.verified || !verification.eventId) return sendJson(res,401,{ok:false,error:"unverified_webhook"});
    const inboxId = await callRpc("aya_b2b_receive_payment_webhook_v1", {
      p_provider: provider,
      p_provider_event_id: verification.eventId,
      p_event_type: verification.eventType || null,
      p_signature_verified: true,
      p_payload: payload
    });
    return sendJson(res,202,{ok:true,received:true,inboxId});
  } catch (error) {
    console.error("AYA payment webhook rejected",{provider,code:error.code||"unknown"});
    return sendJson(res,error.status||503,{ok:false,error:error.code||"webhook_unavailable"});
  }
};

"use strict";

const crypto = require("crypto");

function providerConfig(provider) {
  if (provider === "doku") return { enabled: process.env.AYA_DOKU_ENABLED === "true", configured: Boolean(process.env.AYA_DOKU_CLIENT_ID && process.env.AYA_DOKU_SECRET_KEY && process.env.AYA_DOKU_API_BASE_URL) };
  if (provider === "midtrans") return { enabled: process.env.AYA_MIDTRANS_ENABLED === "true", configured: Boolean(process.env.AYA_MIDTRANS_SERVER_KEY && process.env.AYA_MIDTRANS_API_BASE_URL) };
  return { enabled: false, configured: false };
}
function selectProvider() {
  const doku=providerConfig("doku"); if(doku.enabled&&doku.configured)return "doku";
  const midtrans=providerConfig("midtrans"); if(midtrans.enabled&&midtrans.configured)return "midtrans";
  return null;
}
function assertConfigured(provider){const cfg=providerConfig(provider);if(!cfg.enabled||!cfg.configured){const e=new Error(`Payment provider ${provider} is not configured`);e.code="provider_unavailable";e.status=503;throw e;}}
function safeEqual(a,b){const x=Buffer.from(String(a||""));const y=Buffer.from(String(b||""));return x.length===y.length&&crypto.timingSafeEqual(x,y);}

function verifyDokuNotification(req,payload){
  assertConfigured("doku");
  const clientId=String(req.headers["client-id"]||""), requestId=String(req.headers["request-id"]||""), requestTimestamp=String(req.headers["request-timestamp"]||""), signature=String(req.headers.signature||"");
  if(!clientId||!requestId||!requestTimestamp||!signature){const e=new Error("Missing DOKU notification signature headers");e.code="invalid_provider_signature";e.status=401;throw e;}
  if(clientId!==process.env.AYA_DOKU_CLIENT_ID){const e=new Error("DOKU Client-Id mismatch");e.code="invalid_provider_signature";e.status=401;throw e;}
  const rawBody=Buffer.isBuffer(req.body)?req.body:(typeof req.body==="string"?Buffer.from(req.body,"utf8"):null);
  if(!rawBody){const e=new Error("Raw request body unavailable for DOKU digest verification");e.code="raw_body_required";e.status=503;throw e;}
  const digest=crypto.createHash("sha256").update(rawBody).digest("base64");
  const target=String(process.env.AYA_DOKU_NOTIFICATION_TARGET||"/api/payment/webhook");
  const component=[`Client-Id:${clientId}`,`Request-Id:${requestId}`,`Request-Timestamp:${requestTimestamp}`,`Request-Target:${target}`,`Digest:${digest}`].join("\n");
  const expected=`HMACSHA256=${crypto.createHmac("sha256",process.env.AYA_DOKU_SECRET_KEY).update(component).digest("base64")}`;
  if(!safeEqual(signature,expected)){const e=new Error("Invalid DOKU notification signature");e.code="invalid_provider_signature";e.status=401;throw e;}
  return {verified:true,eventId:requestId,eventType:payload?.service?.id||payload?.transaction?.status||"payment_notification"};
}

function verifyMidtransNotification(req,payload){
  assertConfigured("midtrans");
  const orderId=String(payload?.order_id||""), statusCode=String(payload?.status_code||""), grossAmount=String(payload?.gross_amount||""), received=String(req.headers["x-signature"]||"");
  if(!orderId||!statusCode||!grossAmount||!received){const e=new Error("Missing Midtrans notification signature fields");e.code="invalid_provider_signature";e.status=401;throw e;}
  const expected=crypto.createHash("sha512").update(orderId+statusCode+grossAmount+process.env.AYA_MIDTRANS_SERVER_KEY).digest("hex");
  if(!safeEqual(received,expected)){const e=new Error("Invalid Midtrans notification signature");e.code="invalid_provider_signature";e.status=401;throw e;}
  return {verified:true,eventId:String(payload.transaction_id||orderId),eventType:String(payload.transaction_status||"payment_notification")};
}

async function createPaymentAttempt(){const provider=selectProvider();if(!provider){const e=new Error("No configured payment provider");e.code="payment_provider_unavailable";e.status=503;throw e;}const e=new Error(`Payment initiation adapter for ${provider} is not wired to a live credential set`);e.code="provider_adapter_unavailable";e.status=503;throw e;}
async function verifyWebhook(provider,req,payload){if(provider==="doku")return verifyDokuNotification(req,payload);if(provider==="midtrans")return verifyMidtransNotification(req,payload);const e=new Error("Unsupported payment provider");e.code="unsupported_provider";e.status=400;throw e;}
module.exports={providerConfig,selectProvider,createPaymentAttempt,verifyWebhook};

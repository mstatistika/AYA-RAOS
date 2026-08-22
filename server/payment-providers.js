"use strict";

function providerConfig(provider) {
  if (provider === "doku") {
    return {
      enabled: process.env.AYA_DOKU_ENABLED === "true",
      configured: Boolean(process.env.AYA_DOKU_CLIENT_ID && process.env.AYA_DOKU_SECRET_KEY && process.env.AYA_DOKU_API_BASE_URL)
    };
  }
  if (provider === "midtrans") {
    return {
      enabled: process.env.AYA_MIDTRANS_ENABLED === "true",
      configured: Boolean(process.env.AYA_MIDTRANS_SERVER_KEY && process.env.AYA_MIDTRANS_API_BASE_URL)
    };
  }
  return { enabled: false, configured: false };
}

function selectProvider() {
  const doku = providerConfig("doku");
  if (doku.enabled && doku.configured) return "doku";
  const midtrans = providerConfig("midtrans");
  if (midtrans.enabled && midtrans.configured) return "midtrans";
  return null;
}

function assertConfigured(provider) {
  const cfg = providerConfig(provider);
  if (!cfg.enabled || !cfg.configured) {
    const error = new Error(`Payment provider ${provider} is not configured`);
    error.code = "provider_unavailable";
    error.status = 503;
    throw error;
  }
}

// Provider-specific request/signature implementations are intentionally not guessed.
// DOKU is primary and Midtrans fallback; each adapter must be implemented from the
// provider's current contract before AYA marks a payment as verified.
async function createPaymentAttempt() {
  const provider = selectProvider();
  if (!provider) {
    const error = new Error("No configured payment provider");
    error.code = "payment_provider_unavailable";
    error.status = 503;
    throw error;
  }
  assertConfigured(provider);
  const error = new Error(`Adapter for ${provider} is pending provider-contract implementation`);
  error.code = "provider_adapter_not_implemented";
  error.status = 503;
  throw error;
}

async function verifyWebhook(provider) {
  assertConfigured(provider);
  const error = new Error(`Webhook verifier for ${provider} is pending provider-contract implementation`);
  error.code = "provider_webhook_verifier_not_implemented";
  error.status = 503;
  throw error;
}

module.exports = { providerConfig, selectProvider, createPaymentAttempt, verifyWebhook };

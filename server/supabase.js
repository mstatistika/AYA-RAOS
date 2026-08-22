"use strict";

function backendConfig() {
  const url = String(process.env.AYA_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceRoleKey = String(process.env.AYA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  return { url, serviceRoleKey, ready: Boolean(url && serviceRoleKey) };
}

async function callRpc(functionName, args, timeoutMs = 8000) {
  const config = backendConfig();
  if (!config.ready) {
    const error = new Error("backend_not_configured");
    error.code = "backend_not_configured";
    throw error;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${config.url}/rest/v1/rpc/${encodeURIComponent(functionName)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "apikey": config.serviceRoleKey,
        "Authorization": `Bearer ${config.serviceRoleKey}`
      },
      body: JSON.stringify(args || {}),
      signal: controller.signal
    });

    const text = await response.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); }
      catch (_) { data = null; }
    }

    if (!response.ok) {
      const error = new Error("supabase_rpc_failed");
      error.code = "supabase_rpc_failed";
      error.status = response.status;
      error.detail = data?.message || data?.hint || data?.details || "";
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { backendConfig, callRpc };

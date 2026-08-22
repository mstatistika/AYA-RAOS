"use strict";

const { allowMethods, sendJson } = require("../server/http");
const { backendConfig } = require("../server/supabase");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  const config = backendConfig();
  sendJson(res, 200, {
    ok: true,
    service: "aya-raos-backend",
    environment: process.env.VERCEL_ENV || "unknown",
    supabaseConfigured: config.ready
  });
};

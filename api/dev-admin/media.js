"use strict";

const crypto = require("node:crypto");
const { allowMethods, readJsonBody, sendJson } = require("../../server/http");
const { selectTable, insertTable, uploadObject, signedObjectUrl } = require("../../server/dev-admin");

const mediaTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  try {
    if (req.method === "GET") {
      const assets = await selectTable("aya_media_assets", "id,domain,asset_kind,bucket_name,object_path,original_filename,mime_type,size_bytes,alt_text,lifecycle_status,created_at,updated_at", { order: "created_at.desc", limit: 250 });
      const withUrls = await Promise.all((assets || []).map(async (asset) => {
        try {
          const signed = await signedObjectUrl(asset.bucket_name, asset.object_path, 1800);
          return { ...asset, signed_url: signed.signedUrl };
        } catch (_) {
          return asset;
        }
      }));
      return sendJson(res, 200, { ok: true, assets: withUrls });
    }

    const body = readJsonBody(req, 8 * 1024 * 1024);
    const contentType = String(body.content_type || "").toLowerCase();
    const extension = mediaTypes.get(contentType);
    const encoded = String(body.data_base64 || "").replace(/^data:[^;]+;base64,/, "");
    if (!extension || !encoded) return sendJson(res, 400, { ok: false, error: "image_file_required" });
    const buffer = Buffer.from(encoded, "base64");
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) return sendJson(res, 400, { ok: false, error: "image_size_invalid" });

    const domain = String(body.domain || "admin").trim().replace(/[^a-z0-9_-]/gi, "-").slice(0, 40) || "admin";
    const assetKind = String(body.asset_kind || "development_image").trim().slice(0, 80) || "development_image";
    const originalFilename = String(body.filename || `upload.${extension}`).trim().slice(0, 160);
    const date = new Date().toISOString().slice(0, 10);
    const objectPath = `dev/${domain}/${date}/${crypto.randomUUID()}.${extension}`;

    await uploadObject("aya-admin-media", objectPath, buffer, contentType);
    const inserted = await insertTable("aya_media_assets", {
      domain,
      asset_kind: assetKind,
      bucket_name: "aya-admin-media",
      object_path: objectPath,
      original_filename: originalFilename,
      mime_type: contentType,
      size_bytes: buffer.length,
      alt_text: String(body.alt_text || "").trim().slice(0, 240) || null,
      metadata: { mode: "development-preview" }
    });
    const asset = Array.isArray(inserted) ? inserted[0] : inserted;
    const signed = await signedObjectUrl("aya-admin-media", objectPath, 1800);
    sendJson(res, 201, { ok: true, asset: { ...asset, signed_url: signed.signedUrl } });
  } catch (error) {
    sendJson(res, error.status || 400, { ok: false, error: error.code || error.message || "dev_admin_media_failed" });
  }
};

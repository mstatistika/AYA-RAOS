/**
 * AYA RAOS — Partner Portal Auth
 * Route: /pasokan/partner
 * Auth: magic link primary (email). OTP code optional if email template includes {{ .Token }}.
 * Session isolated from Admin (storageKey: aya-partner-auth).
 */
(() => {
  "use strict";

  const cfg = window.AYA_CONFIG?.supabase || {};
  if (!window.supabase?.createClient || !cfg.url || !cfg.publishableKey) {
    console.error("[partner-auth] Supabase config missing");
    const login = document.getElementById("loginView");
    if (login) login.hidden = false;
    const err = document.getElementById("loginError");
    if (err) {
      err.textContent = "Konfigurasi Supabase belum siap. Muat ulang halaman atau cek js/config.js.";
      err.className = "form-error error";
    }
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "aya-partner-auth"
    }
  });
  window.AYA_PARTNER_AUTH = client;

  const $ = (id) => document.getElementById(id);
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );

  function showView(name) {
    const views = ["loginView", "otpView", "activateView", "dashboardView", "loadingView"];
    views.forEach((id) => {
      const el = $(id);
      if (el) el.hidden = id !== name;
    });
  }

  function msg(id, text, type = "error") {
    const el = $(id);
    if (!el) return;
    el.textContent = text || "";
    el.className = `form-error ${type}`;
  }

  function setAuthTab(tab) {
    document.querySelectorAll("[data-auth-tab]").forEach((b) => {
      b.classList.toggle("active", b.dataset.authTab === tab);
    });
    const emailPanel = $("emailAuthPanel");
    const waPanel = $("waAuthPanel");
    if (emailPanel) emailPanel.hidden = tab !== "email";
    if (waPanel) waPanel.hidden = tab !== "wa";
  }

  function normalizePhone(raw) {
    let s = String(raw || "").replace(/[^\d+]/g, "");
    if (s.startsWith("0")) s = "+62" + s.slice(1);
    if (s.startsWith("62") && !s.startsWith("+")) s = "+" + s;
    if (!s.startsWith("+") && s.length >= 9) s = "+62" + s;
    return s;
  }

  async function ensureProfile(session) {
    if (!session?.user) return null;
    const user = session.user;
    const email = user.email || user.user_metadata?.email || null;
    const phone = user.phone || user.user_metadata?.phone || null;
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (email ? email.split("@")[0] : "Mitra AYA");

    try {
      const { data, error } = await client.rpc("aya_b2b_partner_bootstrap_v1", {
        p_full_name: fullName,
        p_email: email,
        p_phone_e164: phone ? normalizePhone(phone) : null
      });
      if (!error && data) return data;
    } catch (_) {}

    try {
      const { data: memberships } = await client
        .from("aya_b2b_company_members")
        .select("company_id, is_primary, status, aya_b2b_companies(id, company_name, status)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(5);
      return {
        user_id: user.id,
        has_membership: Array.isArray(memberships) && memberships.length > 0,
        memberships: memberships || [],
        profile_exists: true
      };
    } catch {
      return {
        user_id: user.id,
        has_membership: false,
        memberships: [],
        profile_exists: false
      };
    }
  }

  async function routeAfterAuth(session) {
    showView("loadingView");
    let state = null;
    try {
      state = await Promise.race([
        ensureProfile(session),
        new Promise((resolve) => setTimeout(() => resolve(null), 8000))
      ]);
    } catch (err) {
      console.warn("[partner-auth] ensureProfile failed", err);
    }
    window.AYA_PARTNER_STATE = state || {
      user_id: session?.user?.id,
      has_membership: false,
      memberships: [],
      profile_exists: false
    };
    const label = $("sessionLabel");
    if (label) {
      label.textContent =
        session.user?.email ||
        session.user?.phone ||
        "Mitra";
    }

    try {
      if (window.location.hash || window.location.search.includes("code=")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (_) {}

    if (state?.has_membership) {
      showView("dashboardView");
      window.dispatchEvent(new CustomEvent("aya-partner:dashboard"));
    } else {
      showView("activateView");
      window.dispatchEvent(new CustomEvent("aya-partner:activate"));
    }
  }

  async function init() {
    showView("loginView");

    document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
      btn.addEventListener("click", () => setAuthTab(btn.dataset.authTab));
    });
    setAuthTab("email");

    $("emailOtpForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg("loginError", "");
      const email = $("loginEmail")?.value.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        msg("loginError", "Masukkan email yang valid.");
        return;
      }
      const btn = e.submitter || $("emailOtpBtn");
      if (btn) btn.disabled = true;
      try {
        const redirectTo = `${window.location.origin}/pasokan/partner/`;
        const { error } = await client.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: true,
            data: { role: "b2b_partner" }
          }
        });
        if (error) throw error;
        $("otpEmailHint").textContent = email;
        showView("otpView");
        msg(
          "otpError",
          "Cek email Anda. Klik tautan \"Sign in\" — Anda akan kembali ke portal mitra. Atau masukkan kode 6 digit jika ada di email.",
          "success"
        );
      } catch (err) {
        msg("loginError", err.message || "Gagal mengirim tautan masuk.");
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    $("otpForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg("otpError", "");
      const email = $("otpEmailHint")?.textContent?.trim();
      const token = $("otpCode")?.value.trim();
      if (!token || token.length < 6) {
        msg(
          "otpError",
          "Belum ada kode di form. Lebih mudah: buka email lalu klik \"Sign in\" — tautan akan mengarahkan ke portal ini."
        );
        return;
      }
      const btn = e.submitter;
      if (btn) btn.disabled = true;
      try {
        const { data, error } = await client.auth.verifyOtp({
          email,
          token,
          type: "email"
        });
        if (error) throw error;
        if (data?.session) await routeAfterAuth(data.session);
      } catch (err) {
        msg("otpError", err.message || "Kode tidak valid.");
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    $("backToLoginBtn")?.addEventListener("click", () => {
      showView("loginView");
      msg("loginError", "");
    });

    $("waAuthForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg("waError", "");
      const raw = $("loginPhone")?.value.trim();
      const phone = normalizePhone(raw);
      if (!/^\+[1-9][0-9]{6,14}$/.test(phone)) {
        msg("waError", "Format nomor WA tidak valid. Contoh: 0812… atau +62812…");
        return;
      }
      const btn = e.submitter;
      if (btn) btn.disabled = true;
      try {
        const { error } = await client.auth.signInWithOtp({
          phone,
          options: {
            shouldCreateUser: true,
            data: { role: "b2b_partner", channel: "whatsapp" }
          }
        });
        if (error) {
          msg(
            "waError",
            "Login via WhatsApp belum diaktifkan di staging. Gunakan email, lalu lengkapi nomor WA di aktivasi akun."
          );
          return;
        }
        $("otpEmailHint").textContent = phone;
        showView("otpView");
        msg("otpError", "Cek WhatsApp/SMS untuk tautan atau kode (jika provider aktif).", "success");
      } catch (err) {
        msg(
          "waError",
          err.message || "Login via WhatsApp belum tersedia. Silakan gunakan email."
        );
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    $("logoutBtn")?.addEventListener("click", async () => {
      await client.auth.signOut();
      window.AYA_PARTNER_STATE = null;
      showView("loginView");
    });

    const isAuthCallback =
      /[?&#](code|access_token)=/.test(window.location.href) ||
      window.location.hash.includes("access_token");

    if (isAuthCallback) {
      showView("loadingView");
    }

    let routed = false;
    const safeRoute = async (session) => {
      if (!session || routed) return;
      routed = true;
      await routeAfterAuth(session);
    };

    client.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        routed = false;
        window.AYA_PARTNER_STATE = null;
        showView("loginView");
      }
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") && session) {
        await safeRoute(session);
      }
    });

    try {
      const { data } = await client.auth.getSession();
      if (data?.session) {
        await safeRoute(data.session);
      } else if (isAuthCallback) {
        await new Promise((r) => setTimeout(r, 2500));
        const again = await client.auth.getSession();
        if (again?.data?.session) {
          await safeRoute(again.data.session);
        } else {
          showView("loginView");
          msg(
            "loginError",
            "Tautan masuk tidak valid atau sudah kedaluwarsa. Kirim tautan baru dari halaman ini (bukan dari production)."
          );
        }
      } else {
        showView("loginView");
      }
    } catch (err) {
      console.error("[partner-auth] getSession", err);
      showView("loginView");
      msg("loginError", err.message || "Gagal memuat sesi.");
    }
  }

  window.AYA_PARTNER = Object.freeze({
    client,
    showView,
    msg,
    normalizePhone,
    ensureProfile,
    esc
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

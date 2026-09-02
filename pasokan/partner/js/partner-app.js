/**
 * AYA RAOS — Partner Portal App (Activation + Read-only Dashboard)
 * Phases 2–3. Trusted backend truth only. No fabricated commercial state.
 */
(() => {
  "use strict";

  const money = (n) =>
    n == null || n === ""
      ? "—"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0
        }).format(Number(n));

  const dateId = (v) => {
    if (!v) return "—";
    try {
      return new Date(v).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  };

  const dateTimeId = (v) => {
    if (!v) return "—";
    try {
      return new Date(v).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "—";
    }
  };

  const chip = (v, c = "") =>
    `<span class="chip ${c}">${window.AYA_PARTNER?.esc(v) ?? v}</span>`;

  const STATUS_CHIP = {
    active: "good",
    confirmed: "good",
    delivered: "good",
    onboarding: "blue",
    draft: "warn",
    scheduled: "blue",
    h3_locked: "blue",
    preparing: "blue",
    ready: "blue",
    out_for_delivery: "blue",
    suspended: "danger",
    closed: "danger",
    customer_failed: "danger",
    aya_failed: "danger",
    cancelled: "danger"
  };

  function $(id) {
    return document.getElementById(id);
  }

  /* ---------- Phase 2: Activation ---------- */
  async function submitActivation(e) {
    e.preventDefault();
    const P = window.AYA_PARTNER;
    if (!P) return;
    P.msg("activateError", "");

    const companyName = $("companyName")?.value.trim();
    const businessContext = $("businessContext")?.value.trim() || null;
    const fullName = $("fullName")?.value.trim();
    const phoneRaw = $("activatePhone")?.value.trim();
    const phone = phoneRaw ? P.normalizePhone(phoneRaw) : null;
    const responsibilities = [
      ...document.querySelectorAll("[name=responsibility]:checked")
    ].map((el) => el.value);

    if (!companyName || companyName.length < 2) {
      P.msg("activateError", "Nama usaha wajib diisi (min. 2 karakter).");
      return;
    }
    if (!fullName || fullName.length < 2) {
      P.msg("activateError", "Nama lengkap PIC wajib diisi.");
      return;
    }
    if (phone && !/^\+[1-9][0-9]{6,14}$/.test(phone)) {
      P.msg("activateError", "Format nomor WA tidak valid.");
      return;
    }
    if (!responsibilities.length) {
      P.msg("activateError", "Pilih minimal satu tanggung jawab.");
      return;
    }

    const btn = e.submitter || $("activateSubmit");
    if (btn) btn.disabled = true;

    try {
      const client = window.AYA_PARTNER_AUTH;
      const { data, error } = await client.rpc("aya_b2b_partner_activate_v1", {
        p_company_name: companyName,
        p_business_context: businessContext,
        p_full_name: fullName,
        p_phone_e164: phone,
        p_responsibilities: responsibilities
      });
      if (error) throw error;

      const { data: sess } = await client.auth.getSession();
      if (sess?.session) {
        const state = await P.ensureProfile(sess.session);
        window.AYA_PARTNER_STATE = state;
      }
      P.showView("dashboardView");
      window.dispatchEvent(new CustomEvent("aya-partner:dashboard"));
    } catch (err) {
      const m = err?.message || String(err);
      if (/function.*does not exist|Could not find/i.test(m)) {
        P.msg(
          "activateError",
          "Aktivasi backend belum di-deploy (RPC aya_b2b_partner_activate_v1). Terapkan migration partner portal terlebih dahulu."
        );
      } else {
        P.msg("activateError", m);
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function bindActivation() {
    $("activateForm")?.addEventListener("submit", submitActivation);
    window.AYA_PARTNER_AUTH?.auth.getSession().then(({ data }) => {
      const u = data?.session?.user;
      if (!u) return;
      if ($("fullName") && !$("fullName").value) {
        $("fullName").value =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          (u.email ? u.email.split("@")[0] : "");
      }
      if ($("activatePhone") && u.phone) {
        $("activatePhone").value = u.phone;
      }
    });
  }

  /* ---------- Phase 3: Read-only Dashboard ---------- */
  async function loadDashboard() {
    const root = $("dashboardRoot");
    if (!root) return;
    root.innerHTML = `<div class="loading-overlay"><div class="spinner"></div><p>Memuat ringkasan mitra…</p></div>`;

    const client = window.AYA_PARTNER_AUTH;
    if (!client) {
      root.innerHTML = `<div class="message error">Auth client tidak tersedia.</div>`;
      return;
    }

    try {
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        root.innerHTML = `<div class="message error">Sesi tidak valid. Silakan masuk ulang.</div>`;
        return;
      }

      let snapshot = null;
      try {
        const { data, error } = await client.rpc("aya_b2b_partner_snapshot_v1");
        if (!error && data) snapshot = data;
      } catch (_) {}

      if (!snapshot) {
        snapshot = await loadSnapshotViaQueries(client, userId);
      }

      renderDashboard(root, snapshot);
    } catch (err) {
      root.innerHTML = `<div class="message error">Gagal memuat data: ${
        window.AYA_PARTNER?.esc(err.message) || "unknown"
      }</div>
      <p class="muted" style="margin-top:12px">Dashboard hanya menampilkan data yang sudah ada di backend. Jika relationship belum dibuat oleh AYA, area komersial akan kosong.</p>`;
    }
  }

  async function loadSnapshotViaQueries(client, userId) {
    const { data: members, error: mErr } = await client
      .from("aya_b2b_company_members")
      .select(
        "company_id, is_primary, status, aya_b2b_companies(id, company_name, status, business_context, created_at)"
      )
      .eq("user_id", userId)
      .eq("status", "active");
    if (mErr) throw mErr;

    const companies = (members || [])
      .map((m) => m.aya_b2b_companies)
      .filter(Boolean);
    const companyIds = companies.map((c) => c.id);

    let relationships = [];
    let summaries = [];
    let deliveries = [];
    let credits = [];
    let profile = null;

    if (companyIds.length) {
      const [relRes, profileRes] = await Promise.all([
        client
          .from("aya_b2b_relationships")
          .select("*")
          .in("company_id", companyIds)
          .order("opened_at", { ascending: false }),
        client
          .from("aya_b2b_user_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()
      ]);
      relationships = relRes.data || [];
      profile = profileRes.data || null;

      const relIds = relationships.map((r) => r.id);
      if (relIds.length) {
        const [sumRes, delRes, credRes] = await Promise.all([
          client
            .from("aya_b2b_commercial_summaries")
            .select("*")
            .in("relationship_id", relIds)
            .order("version_no", { ascending: false }),
          client
            .from("aya_b2b_delivery_occurrences")
            .select("*")
            .in("relationship_id", relIds)
            .order("scheduled_at", { ascending: false })
            .limit(50),
          client
            .from("aya_b2b_credit_ledger")
            .select("*")
            .in("relationship_id", relIds)
            .order("created_at", { ascending: false })
            .limit(50)
        ]);
        summaries = sumRes.data || [];
        deliveries = delRes.data || [];
        credits = credRes.data || [];
      }
    } else {
      const { data: p } = await client
        .from("aya_b2b_user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      profile = p || null;
    }

    return {
      profile,
      companies,
      memberships: members || [],
      relationships,
      summaries,
      deliveries,
      credits
    };
  }

  function renderDashboard(root, snap) {
    const esc = window.AYA_PARTNER?.esc || ((v) => String(v ?? ""));
    const companies = snap.companies || [];
    const relationships = snap.relationships || [];
    const summaries = snap.summaries || [];
    const deliveries = snap.deliveries || [];
    const credits = snap.credits || [];
    const profile = snap.profile || {};

    const activeRel = relationships.filter((r) => r.status === "active");
    const openRel = relationships.filter((r) => r.status !== "closed");
    const confirmedSum = summaries.filter((s) => s.status === "confirmed");
    const upcoming = deliveries.filter((d) =>
      ["scheduled", "h3_locked", "preparing", "ready", "out_for_delivery"].includes(
        d.status
      )
    );
    const creditBal = credits.reduce((a, x) => a + Number(x.amount_delta || 0), 0);

    const companyLabel = companies[0]?.company_name || "Akun Mitra";

    let html = `
      <div class="page-head">
        <p class="eyebrow">PORTAL MITRA PASOKAN</p>
        <h1>${esc(companyLabel)}</h1>
        <p>Ringkasan hubungan pasokan, komitmen komersial, pengiriman, dan Kredit Pasokan. Semua angka berasal dari backend AYA — tidak ada estimasi di sisi browser.</p>
      </div>

      <div class="grid cols4">
        <div class="card metric">
          <b>Relationship</b>
          <strong>${openRel.length ? openRel[0].lifecycle_stage : "—"}</strong>
          <small>${openRel.length ? chip(openRel[0].status, STATUS_CHIP[openRel[0].status] || "") : "Belum ada"}</small>
        </div>
        <div class="card metric">
          <b>Commercial</b>
          <strong>${confirmedSum.length ? "Confirmed" : summaries.length ? "Draft" : "—"}</strong>
          <small>${confirmedSum.length ? `${confirmedSum.length} ringkasan aktif` : "Belum dikonfirmasi"}</small>
        </div>
        <div class="card metric">
          <b>Pengiriman mendatang</b>
          <strong>${upcoming.length}</strong>
          <small>occurrence terjadwal</small>
        </div>
        <div class="card metric">
          <b>Kredit Pasokan</b>
          <strong>${money(creditBal)}</strong>
          <small>saldo ledger (immutable)</small>
        </div>
      </div>
    `;

    if (!companies.length) {
      html += `
        <div class="empty-state" style="margin-top:28px">
          <h3>Akun belum terhubung ke usaha</h3>
          <p>Selesaikan aktivasi agar AYA dapat menautkan relationship komersial ke akun Anda.</p>
        </div>`;
      root.innerHTML = html;
      return;
    }

    html += `
      <div class="section-title">
        <h2>Identitas</h2>
        <span>profil mitra</span>
      </div>
      <div class="card">
        <div class="grid cols2">
          <div>
            <b style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">PIC</b>
            <div style="margin-top:4px;font-weight:600">${esc(profile.full_name || "—")}</div>
            <div class="muted" style="font-size:13px;margin-top:2px">${esc(profile.email || "")}</div>
          </div>
          <div>
            <b style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">WhatsApp</b>
            <div style="margin-top:4px;font-weight:600">${esc(profile.phone_e164 || "Belum diisi")}</div>
            <div class="muted" style="font-size:13px;margin-top:2px">${
              profile.phone_verified_at
                ? "Terverifikasi " + dateId(profile.phone_verified_at)
                : "Belum terverifikasi"
            }</div>
          </div>
        </div>
      </div>
    `;

    html += `
      <div class="section-title">
        <h2>Relationship</h2>
        <span>lifecycle &amp; status</span>
      </div>
    `;
    if (!relationships.length) {
      html += `
        <div class="empty-state">
          <h3>Belum ada relationship komersial</h3>
          <p>Relationship dibuat oleh AYA setelah kualifikasi dan komitmen disepakati. Portal ini hanya menampilkan data yang sudah tercatat di backend.</p>
        </div>`;
    } else {
      html += `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lifecycle</th>
                <th>Status</th>
                <th>Dibuka</th>
                <th>Ditutup</th>
              </tr>
            </thead>
            <tbody>
              ${relationships
                .map(
                  (r) => `
                <tr>
                  <td>${chip(r.lifecycle_stage, "blue")}</td>
                  <td>${chip(r.status, STATUS_CHIP[r.status] || "")}</td>
                  <td>${dateId(r.opened_at)}</td>
                  <td>${dateId(r.closed_at)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
    }

    html += `
      <div class="section-title">
        <h2>Commercial Summary</h2>
        <span>snapshot immutable setelah confirmed</span>
      </div>
    `;
    if (!summaries.length) {
      html += `
        <div class="message info">Belum ada Commercial Summary. Ringkasan muncul setelah AYA menyusun dan mengonfirmasi komitmen pasokan.</div>`;
    } else {
      html += `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Jenis</th>
                <th>Versi</th>
                <th>Status</th>
                <th>Billing</th>
                <th>Pembayaran</th>
                <th>Nilai komitmen</th>
                <th>Dikonfirmasi</th>
              </tr>
            </thead>
            <tbody>
              ${summaries
                .map(
                  (s) => `
                <tr>
                  <td>${esc(s.summary_kind)}</td>
                  <td>v${s.version_no}</td>
                  <td>${chip(s.status, STATUS_CHIP[s.status] || "")}</td>
                  <td>${esc(s.billing_option)}</td>
                  <td>${esc(s.payment_option)}</td>
                  <td>${money(s.total_committed_value)}</td>
                  <td>${dateTimeId(s.confirmed_at)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
    }

    html += `
      <div class="section-title">
        <h2>Pengiriman</h2>
        <span>delivery occurrences</span>
      </div>
    `;
    if (!deliveries.length) {
      html += `
        <div class="message info">Belum ada jadwal pengiriman. Occurrence dibuat sistem setelah commercial summary aktif dan schedule digenerate.</div>`;
    } else {
      html += `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cadence</th>
                <th>Jadwal</th>
                <th>H-3 Lock</th>
                <th>Nilai barang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${deliveries
                .map(
                  (d) => `
                <tr>
                  <td>${esc(d.cadence)}</td>
                  <td>${dateTimeId(d.scheduled_at)}</td>
                  <td>${dateTimeId(d.h3_lock_at)}</td>
                  <td>${money(d.goods_value_snapshot)}</td>
                  <td>${chip(d.status, STATUS_CHIP[d.status] || "")}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
    }

    html += `
      <div class="section-title">
        <h2>Kredit Pasokan</h2>
        <span>immutable ledger — bukan wallet editable</span>
      </div>
    `;
    if (!credits.length) {
      html += `
        <div class="message info">Belum ada entri Kredit Pasokan. Kredit muncul dari outcome pengiriman (delay/failure) atau penyesuaian yang disetujui sistem.</div>`;
    } else {
      html += `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sumber</th>
                <th>Referensi</th>
                <th>Delta</th>
                <th>Deskripsi</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              ${credits
                .map(
                  (c) => `
                <tr>
                  <td>${esc(c.source_type)}</td>
                  <td>${esc(c.source_reference)}</td>
                  <td>${money(c.amount_delta)}</td>
                  <td>${esc(c.description)}</td>
                  <td>${dateTimeId(c.created_at)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`;
    }

    html += `
      <div class="portal-footer">
        Portal Mitra AYA RAOS · Staging · Data read-only dari backend terpercaya<br>
        Butuh bantuan? Hubungi AYA via
        <a href="https://wa.me/${window.AYA_CONFIG?.whatsappNumber || "628562646444"}" target="_blank" rel="noopener">WhatsApp</a>
      </div>`;

    root.innerHTML = html;
  }

  /* ---------- Boot ---------- */
  function start() {
    bindActivation();
    window.addEventListener("aya-partner:dashboard", loadDashboard);
    window.addEventListener("aya-partner:activate", () => {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

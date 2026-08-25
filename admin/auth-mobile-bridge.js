(()=>{
'use strict';
/* Mobile auth bridge v26c: touch+click, error above fold, always visible feedback. */
const $ = id => document.getElementById(id);

const showMsg = (text, type = 'error') => {
  const el = $('loginError');
  if (!el) return;
  el.textContent = text || '';
  el.className = `form-error ${type}`;
  el.setAttribute('data-has-msg', text ? '1' : '0');
  el.style.cssText = text
    ? `display:block;padding:10px 12px;border-radius:10px;margin:0 0 4px;background:${type === 'success' ? 'rgba(64,105,85,.14)' : 'rgba(151,61,61,.14)'};color:${type === 'success' ? '#406955' : '#973d3d'};font-size:14px;font-weight:600;`
    : 'min-height:16px;margin:0;';
};

const classify = e => {
  const m = String(e?.message || e || '');
  if (/invalid api key/i.test(m)) return 'Konfigurasi Supabase tidak valid.';
  if (/invalid login credentials|invalid password|invalid_credentials/i.test(m)) return 'Email atau password salah.';
  if (/network|fetch|failed to fetch/i.test(m)) return 'Tidak dapat terhubung ke Supabase.';
  if (/email rate limit|over_email_send_rate_limit/i.test(m)) return 'Terlalu banyak permintaan. Coba lagi nanti.';
  return m || 'Login gagal. Silakan coba lagi.';
};

const bindOnce = (el, type, fn) => {
  if (!el) return;
  const key = `ayaBound_${type}`;
  if (el.dataset[key] === '1') return;
  el.dataset[key] = '1';
  el.addEventListener(type, fn, { capture: true, passive: false });
};

const bind = () => {
  const sb = window.AYA_ADMIN_AUTH;
  const form = $('loginForm');
  const forgot = $('forgotPasswordBtn');
  const email = $('loginEmail');
  const password = $('loginPassword');
  const masukBtn = form?.querySelector('button[type="submit"]');
  if (!sb || !form || !email || !password || !masukBtn) return false;
  if (form.dataset.mobileAuthBridge === '3') return true;
  form.dataset.mobileAuthBridge = '3';

  let busy = false;

  const doLogin = async () => {
    if (busy) return;
    showMsg('');
    const em = (email.value || '').trim();
    const pw = password.value || '';
    if (!em || !pw) {
      showMsg('Email dan password wajib diisi.');
      (!pw ? password : email).focus();
      return;
    }
    busy = true;
    const prev = masukBtn.textContent;
    masukBtn.disabled = true;
    masukBtn.textContent = 'Memproses…';
    try {
      const { data, error: authError } = await sb.auth.signInWithPassword({ email: em, password: pw });
      if (authError) throw authError;
      if (data?.session) {
        showMsg('Login berhasil. Memuat panel…', 'success');
        window.location.reload();
        return;
      }
      showMsg('Login tidak menghasilkan session. Silakan coba lagi.');
    } catch (err) {
      showMsg(classify(err));
    } finally {
      busy = false;
      masukBtn.disabled = false;
      masukBtn.textContent = prev;
    }
  };

  const doForgot = async () => {
    if (busy) return;
    showMsg('');
    const value = (email.value || '').trim();
    if (!value) {
      showMsg('Masukkan email Admin terlebih dahulu.');
      email.focus();
      return;
    }
    busy = true;
    const prev = forgot.textContent;
    forgot.disabled = true;
    forgot.textContent = 'Mengirim…';
    try {
      const { error: resetError } = await sb.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/admin/`
      });
      if (resetError) throw resetError;
      showMsg('Jika email terdaftar, instruksi reset password telah dikirim.', 'success');
    } catch (err) {
      showMsg(classify(err));
    } finally {
      busy = false;
      forgot.disabled = false;
      forgot.textContent = prev;
    }
  };

  const onMasuk = e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    doLogin();
  };
  const onForgot = e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    doForgot();
  };

  form.addEventListener('submit', onMasuk, true);
  bindOnce(masukBtn, 'click', onMasuk);
  bindOnce(masukBtn, 'touchend', onMasuk);
  bindOnce(masukBtn, 'pointerup', onMasuk);
  bindOnce(forgot, 'click', onForgot);
  bindOnce(forgot, 'touchend', onForgot);
  bindOnce(forgot, 'pointerup', onForgot);

  // Confirm bridge live for support
  const badge = $('authBuildBadge');
  if (badge) badge.textContent = 'auth v26c · bridge ok';

  return true;
};

const start = () => { if (bind()) return; setTimeout(start, 40); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
window.addEventListener('aya:admin-auth-ready-to-bind', start);
})();

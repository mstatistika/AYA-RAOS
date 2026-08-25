(()=>{
'use strict';
/* Mobile/emergency auth bridge: always-visible feedback; does not depend on form submit alone. */
const $ = id => document.getElementById(id);

const showMsg = (text, type = 'error') => {
  const el = $('loginError');
  if (!el) return;
  el.textContent = text || '';
  el.className = `form-error ${type}`;
  el.style.display = text ? 'block' : '';
  el.style.padding = text ? '10px 12px' : '';
  el.style.borderRadius = text ? '10px' : '';
  el.style.background = text
    ? (type === 'success' ? 'rgba(64,105,85,.12)' : 'rgba(151,61,61,.12)')
    : '';
  el.style.color = type === 'success' ? '#406955' : '#973d3d';
  el.style.marginTop = text ? '8px' : '';
  try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
};

const classify = e => {
  const m = String(e?.message || e || '');
  if (/invalid api key/i.test(m)) return 'Konfigurasi Supabase tidak valid.';
  if (/invalid login credentials|invalid password|invalid_credentials/i.test(m)) return 'Email atau password salah.';
  if (/network|fetch|failed to fetch/i.test(m)) return 'Tidak dapat terhubung ke Supabase.';
  if (/email rate limit|over_email_send_rate_limit/i.test(m)) return 'Terlalu banyak permintaan. Coba lagi nanti.';
  return m || 'Login gagal. Silakan coba lagi.';
};

const bind = () => {
  const sb = window.AYA_ADMIN_AUTH;
  const form = $('loginForm');
  const forgot = $('forgotPasswordBtn');
  const email = $('loginEmail');
  const password = $('loginPassword');
  const masukBtn = form?.querySelector('button[type="submit"]');
  if (!sb || !form || !email || !password || !masukBtn) return false;
  if (form.dataset.mobileAuthBridge === '2') return true;
  form.dataset.mobileAuthBridge = '2';

  const doLogin = async () => {
    showMsg('');
    const em = email.value.trim();
    const pw = password.value || '';
    if (!em || !pw) {
      showMsg('Email dan password wajib diisi.');
      if (!pw) password.focus();
      else email.focus();
      return;
    }
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
      masukBtn.disabled = false;
      masukBtn.textContent = prev;
    }
  };

  // Capture-phase submit (covers Enter key)
  form.addEventListener('submit', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    doLogin();
  }, true);

  // Explicit click — does not depend on HTML5 constraint validation blocking submit
  masukBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    doLogin();
  }, true);

  forgot?.addEventListener('click', async e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    showMsg('');
    const value = email.value.trim();
    if (!value) {
      showMsg('Masukkan email Admin terlebih dahulu.');
      email.focus();
      return;
    }
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
      forgot.disabled = false;
      forgot.textContent = prev;
    }
  }, true);

  return true;
};

const start = () => {
  if (bind()) return;
  setTimeout(start, 40);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

// Also bind when auth.js finishes creating the shared client
window.addEventListener('aya:admin-auth-ready-to-bind', start);
})();

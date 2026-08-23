(() => {
  'use strict';

  const cfg = window.AYA_CONFIG?.supabase || {};
  if (!window.supabase?.createClient || !cfg.url || !cfg.publishableKey) return;

  const auth = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.AYA_ADMIN_AUTH = auth;

  const $ = (id) => document.getElementById(id);

  function show(view) {
    const login = $('loginView');
    const reset = $('resetView');
    const app = $('appView');
    if (login) login.hidden = view !== 'login';
    if (reset) reset.hidden = view !== 'reset';
    if (app) app.hidden = view !== 'app';
  }

  function message(id, text, type = 'error') {
    const el = $(id);
    if (!el) return;
    el.textContent = text || '';
    el.className = `form-error ${type}`;
  }

  async function init() {
    const recovery = window.location.hash.includes('type=recovery');
    if (recovery) show('reset');

    const { data } = await auth.auth.getSession();
    if (data?.session && !recovery) {
      show('app');
    } else if (!recovery) {
      show('login');
    }

    auth.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        show('reset');
        return;
      }
      if (event === 'SIGNED_IN' && session) show('app');
      if (event === 'SIGNED_OUT') show('login');
    });

    const loginForm = $('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        message('loginError', '');
        const email = $('loginEmail')?.value.trim();
        const password = $('loginPassword')?.value || '';
        const { error } = await auth.auth.signInWithPassword({ email, password });
        if (error) message('loginError', error.message);
      }, { capture: true });
    }

    $('forgotPasswordBtn')?.addEventListener('click', async () => {
      const email = $('loginEmail')?.value.trim();
      message('loginError', '');
      if (!email) {
        message('loginError', 'Masukkan email Admin terlebih dahulu.');
        $('loginEmail')?.focus();
        return;
      }
      const redirectTo = `${window.location.origin}/admin/`;
      const { error } = await auth.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        message('loginError', error.message);
        return;
      }
      message('loginError', 'Link reset password sudah dikirim. Cek inbox email Anda.', 'success');
    });

    $('resetForm')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      message('resetError', '');
      const password = $('newPassword')?.value || '';
      const confirmation = $('confirmPassword')?.value || '';
      if (password.length < 8) {
        message('resetError', 'Password minimal 8 karakter.');
        return;
      }
      if (password !== confirmation) {
        message('resetError', 'Konfirmasi password tidak sama.');
        return;
      }
      const { error } = await auth.auth.updateUser({ password });
      if (error) {
        message('resetError', error.message);
        return;
      }
      window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
      show('app');
      message('resetError', 'Password berhasil dibuat. Anda sudah masuk ke Admin.', 'success');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

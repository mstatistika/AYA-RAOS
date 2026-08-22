(() => {
  'use strict';

  const cfg = window.AYA_CONFIG?.supabase || {};
  const sb = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const requestForm = document.querySelector('#requestForm');
  const updateForm = document.querySelector('#updateForm');
  const pageTitle = document.querySelector('#pageTitle');
  const pageIntro = document.querySelector('#pageIntro');
  const requestMessage = document.querySelector('#requestMessage');
  const updateMessage = document.querySelector('#updateMessage');

  function setMessage(node, text, type = '') {
    node.textContent = text;
    node.className = `form-error ${type}`.trim();
  }

  function previewUrl(path) {
    return new URL(path, window.location.href).toString();
  }

  function showUpdateForm() {
    requestForm.hidden = true;
    updateForm.hidden = false;
    pageTitle.textContent = 'Buat password baru.';
    pageIntro.textContent = 'Password baru hanya berlaku untuk akun Admin ini.';
  }

  function showRequestForm() {
    requestForm.hidden = false;
    updateForm.hidden = true;
    pageTitle.textContent = 'Reset password Admin.';
    pageIntro.textContent = 'Masukkan email Admin untuk menerima link reset password.';
  }

  async function detectRecoverySession() {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const hasRecoveryToken = hash.has('access_token') || query.get('type') === 'recovery';
    if (!hasRecoveryToken) return;

    const { data: { session }, error } = await sb.auth.getSession();
    if (error) {
      setMessage(updateMessage, error.message, 'error');
      return;
    }
    if (session) {
      showUpdateForm();
      return;
    }

    setMessage(updateMessage, 'Link reset tidak lagi aktif. Kirim link baru dari halaman ini.', 'error');
  }

  requestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(requestMessage, '');
    const email = document.querySelector('#requestEmail').value.trim();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: previewUrl('./reset-password.html')
    });
    if (error) {
      setMessage(requestMessage, error.message, 'error');
      return;
    }
    setMessage(requestMessage, 'Link reset sudah dikirim. Periksa inbox email Anda.', 'success');
  });

  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(updateMessage, '');
    const password = document.querySelector('#newPassword').value;
    const confirmation = document.querySelector('#confirmPassword').value;
    if (password.length < 8) {
      setMessage(updateMessage, 'Password minimal 8 karakter.', 'error');
      return;
    }
    if (password !== confirmation) {
      setMessage(updateMessage, 'Konfirmasi password belum sama.', 'error');
      return;
    }

    const { error } = await sb.auth.updateUser({ password });
    if (error) {
      setMessage(updateMessage, error.message, 'error');
      return;
    }
    await sb.auth.signOut();
    setMessage(updateMessage, 'Password berhasil diperbarui. Mengarahkan ke login Admin…', 'success');
    window.setTimeout(() => { window.location.href = './index.html'; }, 900);
  });

  showRequestForm();
  detectRecoverySession();
})();

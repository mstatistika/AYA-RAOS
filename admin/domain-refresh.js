(() => {
  'use strict';

  const button = document.getElementById('refreshBtn');
  if (!button) return;

  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const activePage = () => document.querySelector('.page.active')?.dataset.page || 'dashboard';
  const navButton = page => document.querySelector(`[data-go="${page}"]`) || document.querySelector(`[data-mgo="${page}"]`);

  const notify = (text, type = 'success') => {
    const box = document.getElementById('globalMessage');
    if (!box) return;
    box.hidden = false;
    box.className = `message ${type}`;
    box.textContent = text;
    window.setTimeout(() => { box.hidden = true; }, 2200);
  };

  const waitForLoadingToSettle = async () => {
    const loading = document.getElementById('loadingState');
    const started = Date.now();
    await sleep(120);
    while (loading && loading.style.display !== 'none' && Date.now() - started < 10000) {
      await sleep(80);
    }
    // Live domain modules can render immediately after the canonical page render.
    await sleep(220);
  };

  // Own the Refresh interaction so legacy app.js and domain-specific listeners
  // cannot produce duplicate/silent refreshes.
  button.addEventListener('click', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.disabled) return;

    const page = activePage();
    const nav = navButton(page);
    const previous = button.textContent || 'Refresh';

    button.disabled = true;
    button.textContent = 'Memuat…';
    button.setAttribute('aria-busy', 'true');

    try {
      if (!nav) throw new Error('Navigasi halaman aktif tidak ditemukan.');
      nav.click();
      await waitForLoadingToSettle();
      button.textContent = 'Diperbarui';
      notify('Data halaman diperbarui.');
      await sleep(650);
    } catch (error) {
      console.error('[AYA Admin] refresh failed:', error);
      button.textContent = 'Gagal';
      notify(`Refresh gagal: ${error.message || error}`, 'error');
      await sleep(900);
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = previous;
    }
  }, { capture: true });
})();
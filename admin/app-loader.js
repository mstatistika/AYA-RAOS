(() => {
  'use strict';

  const sourceUrl = './app.js?loaderFix=20260823';

  async function load() {
    try {
      const response = await fetch(sourceUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Admin app gagal dimuat (${response.status})`);
      let source = await response.text();

      // Temporary compatibility repair for the currently deployed admin bundle.
      // Keep the canonical app source intact while staging preview is being hardened.
      source = source.replace('const S = {const S = {', 'const S = {');
      source = source.replace('sb = initSb();', 'sb = window.AYA_ADMIN_SUPABASE || initSb();');
      source = source.replace('previewMode: false,', 'previewMode: window.AYA_CONFIG?.previewAdminBypass === true,');

      (0, eval)(source);

      // app.js registers DOMContentLoaded itself. If this loader completed after
      // that event, replay it once so boot() is not skipped.
      if (document.readyState !== 'loading') {
        document.dispatchEvent(new Event('DOMContentLoaded'));
      }
    } catch (error) {
      console.error('[AYA Admin] loader failed:', error);
      const loading = document.querySelector('#loadingState p');
      if (loading) loading.textContent = `Admin gagal dimuat: ${error.message}`;
    }
  }

  load();
})();

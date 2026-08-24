(() => {
  'use strict';

  const sourceUrl = './app.js?authBootstrap=20260824';

  async function load() {
    try {
      const response = await fetch(sourceUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Admin app gagal dimuat (${response.status})`);
      let source = await response.text();

      // Keep the loader narrowly scoped to legacy syntax repair only.
      source = source.replace('const S = {const S = {', 'const S = {');

      // Inject the verified database-backed permission set before app.js executes.
      // This removes the old preview permission bypass without rewriting app.js here.
      source = source.replace('fx: new Set(),', 'fx: new Set(window.AYA_ADMIN_FUNCTIONS || []),');
      source = source.replace('previewMode: false,', 'previewMode: false,');
      source = source.replace('const can = k => S.fx.has(k) || S.previewMode;', 'const can = k => S.fx.has(k);');

      // Main staging uses real Supabase Auth. No preview client or no-auth bypass.
      source = source.replace(
        "$('#loginView').hidden = true;\n  $('#appView').hidden = false;",
        "if (!S.session) { $('#loginView').hidden = false; $('#appView').hidden = true; return; }\n  $('#loginView').hidden = true;\n  $('#appView').hidden = false;"
      );

      (0, eval)(source);

      if (document.readyState !== 'loading') {
        document.dispatchEvent(new Event('DOMContentLoaded'));
      }
    } catch (error) {
      console.error('[AYA Admin] bootstrap failed:', error);
      const loading = document.querySelector('#loadingState p');
      if (loading) loading.textContent = `Admin gagal dimuat: ${error.message}`;
    }
  }

  load();
})();

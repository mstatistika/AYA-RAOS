(() => {
  'use strict';

  const sourceUrl = './app.js?authBootstrap=20260823';

  async function load() {
    try {
      const response = await fetch(sourceUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Admin app gagal dimuat (${response.status})`);
      let source = await response.text();

      // app.js contains an existing malformed duplicate declaration. Repair only that
      // syntax defect at load time so the rest of the Admin implementation remains intact.
      source = source.replace('const S = {const S = {', 'const S = {');

      // Main staging uses real Supabase Auth. No preview client or no-auth bypass.
      source = source.replace('S.previewMode = true;', 'S.previewMode = false;');
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

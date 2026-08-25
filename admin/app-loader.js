(() => {
  'use strict';

  const sourceUrl = './app.js?authBootstrap=20260825';
  let loaded = false;

  const legacyLoginHandler = "$('#loginForm').onsubmit = async e => {\n  e.preventDefault();\n  $('#loginError').textContent='';\n  if(!sb){$('#loginError').textContent='Supabase tidak tersambung.'; return;}\n  const {data,error}=await sb.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});\n  if(error){$('#loginError').textContent=error.message; return;}\n  $('#loginView').hidden=true; $('#appView').hidden=false; boot();\n};";

  async function loadApp() {
    if (loaded) return;
    if (!(window.AYA_ADMIN_FUNCTIONS instanceof Set) || !window.AYA_ADMIN_AUTH) return;
    loaded = true;

    try {
      const response = await fetch(sourceUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Admin app gagal dimuat (${response.status})`);
      let source = await response.text();

      source = source.replace('const S = {const S = {', 'const S = {');
      source = source.replace('fx: new Set(),', 'fx: new Set(window.AYA_ADMIN_FUNCTIONS || []),');
      source = source.replace('S.fx = new Set(previewFx);', 'S.fx = new Set(window.AYA_ADMIN_FUNCTIONS || []);');
      source = source.replace('S.previewMode = true;', 'S.previewMode = false;');
      source = source.replace('const can = k => S.fx.has(k) || S.previewMode;', 'const can = k => S.fx.has(k);');

      // auth.js is the single owner of login. Never install the legacy login handler.
      source = source.replace(legacyLoginHandler, '// Login handled by auth.js.');

      // The app shell may only be opened after auth.js has verified the Admin user.
      source = source.replace(
        "$('#loginView').hidden = true;\n  $('#appView').hidden = false;",
        "if (!S.session || !(window.AYA_ADMIN_FUNCTIONS instanceof Set)) { $('#loginView').hidden = false; $('#appView').hidden = true; return; }\n  $('#loginView').hidden = true;\n  $('#appView').hidden = false;"
      );

      (0, eval)(source);

      // app.js registers its boot on DOMContentLoaded. Trigger it only after auth verification.
      document.dispatchEvent(new Event('DOMContentLoaded'));
    } catch (error) {
      loaded = false;
      console.error('[AYA Admin] bootstrap failed:', error);
      const loading = document.querySelector('#loadingState p');
      if (loading) loading.textContent = `Admin gagal dimuat: ${error.message}`;
    }
  }

  // No anonymous/preview app boot. Login page remains a pure auth surface.
  window.addEventListener('aya:admin-auth-ready', loadApp, { once: false });

  // Existing authenticated session: auth.js will emit aya:admin-auth-ready after verification.
})();

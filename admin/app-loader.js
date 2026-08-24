(() => {
  'use strict';

  const sourceUrl = './app.js?authBootstrap=20260825';

  const legacyLoginHandler = "$('#loginForm').onsubmit = async e => {\n  e.preventDefault();\n  $('#loginError').textContent='';\n  if(!sb){$('#loginError').textContent='Supabase tidak tersambung.'; return;}\n  const {data,error}=await sb.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});\n  if(error){$('#loginError').textContent=error.message; return;}\n  $('#loginView').hidden=true; $('#appView').hidden=false; boot();\n};";

  async function waitForVerifiedAdmin() {
    const auth = window.AYA_ADMIN_AUTH;
    if (!auth) return;
    try {
      const { data } = await auth.auth.getSession();
      if (!data?.session || window.AYA_ADMIN_FUNCTIONS instanceof Set) return;
      await Promise.race([
        new Promise(resolve => window.addEventListener('aya:admin-auth-ready', resolve, { once: true })),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
    } catch (_) {}
  }

  async function load() {
    try {
      const response = await fetch(sourceUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Admin app gagal dimuat (${response.status})`);
      let source = await response.text();

      // Keep the loader narrowly scoped to legacy syntax repair only.
      source = source.replace('const S = {const S = {', 'const S = {');

      // Use the verified database-backed permission set. Do not allow preview permissions.
      source = source.replace('fx: new Set(),', 'fx: new Set(window.AYA_ADMIN_FUNCTIONS || []),');
      source = source.replace('S.fx = new Set(previewFx);', 'S.fx = new Set(window.AYA_ADMIN_FUNCTIONS || []);');
      source = source.replace('S.previewMode = true;', 'S.previewMode = false;');
      source = source.replace('const can = k => S.fx.has(k) || S.previewMode;', 'const can = k => S.fx.has(k);');

      // auth.js is the single owner of login. Disable the legacy duplicate handler in app.js.
      source = source.replace(legacyLoginHandler, '// Login handled by auth.js.');

      // Admin shell opens only after a verified Supabase Admin session exists.
      source = source.replace(
        "$('#loginView').hidden = true;\n  $('#appView').hidden = false;",
        "if (!S.session || !(window.AYA_ADMIN_FUNCTIONS instanceof Set)) { $('#loginView').hidden = false; $('#appView').hidden = true; return; }\n  $('#loginView').hidden = true;\n  $('#appView').hidden = false;"
      );

      await waitForVerifiedAdmin();
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

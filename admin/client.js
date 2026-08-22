(() => {
  'use strict';
  const config = window.AYA_CONFIG?.supabase || {};
  if (!window.supabase?.createClient) throw new Error('Supabase client library gagal dimuat.');
  const create = window.supabase.createClient.bind(window.supabase);
  const shared = create(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.AYA_ADMIN_SUPABASE = shared;
  // Admin domain modules intentionally share one GoTrue/Data client in this page.
  window.supabase.createClient = () => shared;
})();
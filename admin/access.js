(() => {
  'use strict';
  const sb = window.AYA_ADMIN_SB;
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const can = k => window.AYA_ADMIN_FUNCTIONS instanceof Set && window.AYA_ADMIN_FUNCTIONS.has(k);
  const page = () => document.querySelector('[data-page="access"]');
  const chip = (v,c='') => `<span class="chip ${c}">${esc(v)}</span>`;
  const head = (k,h,p) => `<div class="page-head"><div><span class="eyebrow">${k}</span><h1>${h}</h1><p>${p}</p></div></div>`;
  async function query(table, select='*', order='') {
    if (!sb) throw new Error('Supabase belum tersambung.');
    let q = sb.from(table).select(select);
    if (order) q = q.order(order);
    const {data,error} = await q;
    if (error) throw error;
    return data || [];
  }
  async function renderAccess() {
    const el = page(); if (!el) return;
    if (!can('users.access.view')) { el.innerHTML = head('ACCESS','Users & Access','Akun ini tidak memiliki akses ke module ini.'); return; }
    el.innerHTML = head('ACCESS','Users & Access','Function Registry, Roles, dan Admin Users dari sumber data aktual.') + `<div class="access-tabs" role="tablist"><button class="btn primary" data-access-tab="functions">Function Registry</button><button class="btn ghost" data-access-tab="roles">Roles</button><button class="btn ghost" data-access-tab="users">Admin Users</button></div><div id="accessContent" class="stack"></div>`;
    el.querySelectorAll('[data-access-tab]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.accessTab)));
    await showTab('functions');
  }
  async function showTab(tab) {
    const content = $('#accessContent'); if (!content) return;
    content.innerHTML = '<div class="card"><p class="muted">Memuat...</p></div>';
    try { if (tab === 'functions') return await renderFunctions(content); if (tab === 'roles') return await renderRoles(content); return await renderUsers(content); }
    catch (e) { content.innerHTML = `<div class="card"><p class="form-error">${esc(e.message)}</p></div>`; }
  }
  async function renderFunctions(content) {
    const rows = await query('aya_admin_functions','id,function_key,domain,label,description,system_only','function_key');
    content.innerHTML = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Function Key</th><th>Domain</th><th>Label</th><th>Description</th><th>Authority</th></tr></thead><tbody>${rows.map(r => `<tr><td><code>${esc(r.function_key)}</code></td><td>${esc(r.domain)}</td><td>${esc(r.label)}</td><td>${esc(r.description || '—')}</td><td>${r.system_only ? chip('SYSTEM ONLY','warn') : chip('Assignable','ok')}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  async function renderRoles(content) {
    const [roles, functions, assignments] = await Promise.all([query('aya_admin_roles','id,role_code,role_name,description,is_active','role_code'),query('aya_admin_functions','id,function_key,domain,label,system_only','function_key'),query('aya_admin_role_functions','role_id,function_key')]);
    const byRole = new Map(); assignments.forEach(a => { if (!byRole.has(a.role_id)) byRole.set(a.role_id,[]); byRole.get(a.role_id).push(a.function_key); });
    content.innerHTML = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Role</th><th>Status</th><th>Functions</th><th>System-only</th></tr></thead><tbody>${roles.map(r => { const fx = byRole.get(r.id) || []; const system = functions.filter(f => f.system_only && fx.includes(f.function_key)).length; return `<tr><td><strong>${esc(r.role_name)}</strong><br><code>${esc(r.role_code)}</code></td><td>${r.is_active ? chip('Active','ok') : chip('Inactive','warn')}</td><td>${fx.length}</td><td>${system ? chip('CHECK','danger') : chip('Protected','ok')}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  }
  async function renderUsers(content) {
    const [users, links, roles] = await Promise.all([query('aya_admin_users','user_id,display_name,is_active','display_name'),query('aya_admin_user_roles','user_id,role_id'),query('aya_admin_roles','id,role_code,role_name')]);
    const roleMap = new Map(roles.map(r => [r.id,r])); const linksMap = new Map();
    links.forEach(l => { if (!linksMap.has(l.user_id)) linksMap.set(l.user_id,[]); linksMap.get(l.user_id).push(roleMap.get(l.role_id)); });
    content.innerHTML = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Admin User</th><th>Status</th><th>Roles</th></tr></thead><tbody>${users.map(u => { const rs = (linksMap.get(u.user_id) || []).filter(Boolean); return `<tr><td><strong>${esc(u.display_name)}</strong><br><code>${esc(u.user_id)}</code></td><td>${u.is_active ? chip('Active','ok') : chip('Inactive','warn')}</td><td>${rs.length ? rs.map(r => chip(r.role_name)).join(' ') : chip('No role','danger')}</td></tr>`; }).join('')}</tbody></table></div></div>`;
  }
  window.AYA_ADMIN_PAGES = window.AYA_ADMIN_PAGES || {};
  window.AYA_ADMIN_PAGES.access = renderAccess;
})();

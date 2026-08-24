(() => {
'use strict';

const cfg = window.AYA_CONFIG?.supabase || {};
let sb = null;
function initSb() {
  const cfg = window.AYA_CONFIG?.supabase || {};
  if (!cfg.url || !cfg.publishableKey) return null;
  try {
    return window.supabase.createClient(cfg.url, cfg.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  } catch(e) {
    console.warn('Supabase init failed', e);
    return null;
  }
}
sb = initSb();

const S = {
  session: null,
  fx: new Set(window.AYA_ADMIN_FUNCTIONS || []),
  page: 'dashboard',
  previewMode: false,
  products: [], variants: [], b2b: [], measures: [],
  cms: [], testimonials: [], orders: [],
  roles: [], admins: [], users: [],
  b2bInquiries: []
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
const money = n => n == null ? '—' : new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n));
const chip = (v, c = '') => `<span class="chip ${c}">${esc(v)}</span>`;
const can = k => S.fx.has(k);

const head = (k, h, p, a = '') => `<div class="page-head"><div><span class="eyebrow">${k}</span><h1>${h}</h1><p>${p}</p></div><div class="head-actions">${a}</div></div>`;
const metric = (l, v, s) => `<div class="card metric"><b>${l}</b><strong>${v}</strong><small>${s}</small></div>`;
const modal = html => { $('#modalBody').innerHTML = html; $('#modal').showModal(); };
const msg = (m, t = '') => {
  const e = $('#globalMessage');
  e.hidden = false; e.className = `message ${t}`; e.textContent = m;
  setTimeout(() => e.hidden = true, 5000);
};
const showLoading = () => { $('#loadingState').style.display = 'flex'; };
const hideLoading = () => { $('#loadingState').style.display = 'none'; };

const navItems = [
  ['dashboard','◈','Dashboard','dashboard.view'],
  ['cms','▤','Website / CMS','website.view'],
  ['products','◇','Product Master','product.view'],
  ['b2c','▣','B2C Operations','b2c.view'],
  ['b2b','⌁','B2B Operations','b2b.view'],
  ['testimonials','✦','Testimonials','testimonial.view'],
  ['finance','◎','Finance','finance.view'],
  ['access','♙','Users & Access','users.access.view'],
  ['history','≡','History','audit.view'],
  ['system','⚙','System','system.view']
];

function renderNav() {
  const n = $('#nav');
  n.innerHTML = navItems.filter(x => can(x[3])).map(x =>
    `<button data-go="${x[0]}" class="${S.page === x[0] ? 'active' : ''}"><span class="ico">${x[1]}</span>${x[2]}</button>`
  ).join('');
  n.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
  const mp = $('#mobileNavPanel');
  mp.innerHTML = navItems.filter(x => can(x[3])).map(x =>
    `<button data-go="${x[0]}" class="${S.page === x[0] ? 'active' : ''}"><span class="ico">${x[1]}</span>${x[2]}</button>`
  ).join('');
  mp.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
}

function page(id) { return document.querySelector(`#page-${id}`) || document.querySelector('#page'); }
function go(id) {
  const item = navItems.find(x => x[0] === id);
  if (!item || !can(item[3])) { msg('Akses tidak tersedia untuk akun ini.','warn'); return; }
  S.page = id;
  renderNav();
  if (typeof window.AYA_ADMIN_PAGES?.[id] === 'function') return window.AYA_ADMIN_PAGES[id]();
  const target = document.querySelector('#page');
  if (target) target.innerHTML = head('ADMIN', id, 'Module belum dimuat.');
}

function boot() {
  if (!(S.fx instanceof Set) || !S.fx.size) {
    $('#loginView').hidden = false;
    $('#appView').hidden = true;
    msg('Permission Admin belum tersedia.','error');
    return;
  }
  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  renderNav();
  const first = navItems.find(x => can(x[3]));
  if (first) go(first[0]);
  hideLoading();
}

window.AYA_ADMIN_BOOT = boot;
window.AYA_ADMIN_STATE = S;
window.AYA_ADMIN_SB = sb;

if (window.AYA_ADMIN_AUTH) {
  window.AYA_ADMIN_AUTH.auth.getSession().then(({data}) => {
    S.session = data?.session || null;
    if (S.session && window.AYA_ADMIN_FUNCTIONS instanceof Set) boot();
  }).catch(() => {});
}
})();

(() => {
  'use strict';

  const data = {
    products: [
      ['Sambal Bawang', 'DIOLAH · Hero', 'Tersedia', 'Rp35.000'],
      ['Sambal Ijo', 'DIOLAH', 'Tersedia', 'Rp35.000'],
      ['Dimsum + Chili Oil', 'DINIKMATI · Hero', 'Pre-order', 'Rp55.000'],
      ['Paket Tumbuh', 'TUMBUH', 'Tersedia', 'Rp85.000']
    ],
    orders: [
      ['AYA-2026-001', 'Preview Customer', 'Personal', 'Rp125.000', 'Reviewing']
    ],
    testimonials: [
      ['Rani · Jakarta', 'Sambal Bawang', 'Photo', 'Pending'],
      ['Dimas · Depok', 'Dimsum + Chili Oil', 'Video', 'Approved']
    ]
  };

  const nav = [
    ['dashboard', '◈', 'Dashboard'], ['cms', '▤', 'Website / CMS'], ['products', '◇', 'Product Master'],
    ['b2c', '▣', 'B2C Operations'], ['b2b', '⌁', 'B2B Operations'], ['testimonials', '✦', 'Testimonials'],
    ['finance', '◎', 'Finance'], ['access', '♙', 'Users & Access'], ['audit', '≡', 'Audit'], ['system', '⚙', 'System']
  ];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = (value) => value;
  const page = (name) => document.querySelector(`[data-page="${name}"]`);
  const chip = (value, tone = '') => `<span class="chip ${tone}">${esc(value)}</span>`;
  const head = (eyebrow, title, copy, action = '') => `<div class="page-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(copy)}</p></div><div class="head-actions">${action}</div></div>`;
  const metric = (label, value, copy) => `<div class="card metric"><b>${esc(label)}</b><strong>${esc(value)}</strong><small>${esc(copy)}</small></div>`;
  const table = (headers, rows) => `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  function renderDashboard() {
    page('dashboard').innerHTML = head('OPERATIONAL OVERVIEW', 'Yang perlu perhatian, dulu.', 'Preview data untuk meninjau hierarki Admin AYA. Dashboard asli akan membaca Supabase setelah autentikasi diaktifkan.', chip('Demo read-only', 'warn')) +
      `<div class="grid cols4">${metric('Pending Testimonials', '1', 'Menunggu moderation.')}${metric('B2C Orders', '1', 'Contoh order staging.')}${metric('B2B Eligible', '10', 'Product Master config.')}${metric('Media Assets', '0', 'Belum ada media private.')}</div>` +
      `<div class="section-title"><h2>Readiness</h2><span>preview capability state</span></div><div class="grid cols2"><div class="card pad"><div class="list"><div class="row"><div><b>AYA RAOS Universe</b><small>Semesta → Dunia → Hero.</small></div>${chip('Active', 'good')}</div><div class="row"><div><b>Three Worlds</b><small>TUMBUH · DIOLAH · DINIKMATI.</small></div>${chip('Mapped', 'good')}</div></div></div><div class="card pad"><div class="list"><div class="row"><div><b>Preview mode</b><small>Perubahan tidak disimpan.</small></div>${chip('Read-only', 'warn')}</div><div class="row"><div><b>Payment provider</b><small>Belum terhubung pada staging.</small></div>${chip('Inactive', 'warn')}</div></div></div></div>`;
  }

  function renderCms() {
    page('cms').innerHTML = head('WEBSITE / CMS', 'Konten terkontrol + Media Library.', 'Preview struktur CMS, slot konten, dan media tanpa operasi write.', chip('Preview only', 'warn')) +
      table(['Slot', 'Area', 'Draft', 'Published', 'State'], [
        ['Homepage universe', 'Homepage', 'Semesta AYA RAOS', 'Current source', chip('Preview', 'good')],
        ['World intro', 'Three Worlds', 'Dunia → Hero', 'Current source', chip('Preview', 'good')],
        ['Product story', 'Product Detail', 'Hero product context', 'Current source', chip('Preview', 'good')]
      ]);
  }

  function renderProducts() {
    page('products').innerHTML = head('PRODUCT MASTER', 'Satu produk, dua commercial layers.', 'Product Master menyatukan Hero B2C dan konfigurasi Pasokan B2B.', chip(`${data.products.length} preview products`, 'good')) +
      table(['Product / Hero', 'World', 'Status', 'B2C'], data.products.map((p) => [ `<b>${esc(p[0])}</b>`, esc(p[1]), chip(p[2], p[2] === 'Tersedia' ? 'good' : 'warn'), money(p[3]) ]));
  }

  function renderB2c() {
    page('b2c').innerHTML = head('B2C OPERATIONS', 'Sekali beli tetap B2C.', 'Contoh state order untuk review operasi storefront.', chip('Persistence preview', 'warn')) +
      table(['Order', 'Customer', 'Context', 'Subtotal', 'State'], data.orders.map((o) => [esc(o[0]), esc(o[1]), esc(o[2]), money(o[3]), chip(o[4], 'blue')]));
  }

  function renderB2b() {
    page('b2b').innerHTML = head('B2B OPERATIONS', 'Pasokan tumbuh bersama relasi.', 'Preview struktur qualification, company identity, dan commercial summary.', chip('Foundation', 'good')) +
      `<div class="grid cols4">${metric('Companies', '0', 'B2B identity foundation')}${metric('Eligible Products', '10', 'Explicit product config')}${metric('Qualification', 'Ready', 'Rule version tersedia')}${metric('Commitment', 'Draft', 'Lifecycle backend-owned')}</div>` +
      `<div class="section-title"><h2>Qualification flow</h2><span>Preview map</span></div>` + table(['Step', 'Domain', 'Status'], [['1', 'Company identity', chip('Foundation', 'good')], ['2', 'Product eligibility', chip('Configured', 'good')], ['3', 'Commercial Summary', chip('Backend-ready', 'blue')], ['4', 'Commitment / Delivery', chip('Pending data', 'warn')]]);
  }

  function renderTestimonials() {
    page('testimonials').innerHTML = head('TESTIMONIALS', 'Moderate dulu. Publish kemudian.', 'Preview submission, moderation, dan publish asset flow.', chip(`${data.testimonials.length} preview submissions`, 'good')) +
      table(['Name', 'Product Hero', 'Format', 'Status'], data.testimonials.map((t) => [esc(t[0]), esc(t[1]), esc(t[2]), chip(t[3], t[3] === 'Approved' ? 'good' : 'warn')]));
  }

  function renderFinance() {
    page('finance').innerHTML = head('FINANCE / PAYMENT', 'Paid bukan Settled.', 'Provider belum aktif; panel ini hanya untuk melihat struktur dependency.', chip('Inactive', 'warn')) +
      `<div class="grid cols3">${metric('DOKU', 'Target', 'Primary payment adapter')}${metric('Midtrans', 'Fallback', 'Only when configured')}${metric('Mark Paid', 'Blocked', 'System-only verification')}</div>` +
      `<div class="section-title"><h2>Operational boundaries</h2><span>truthful state</span></div><div class="card pad"><div class="provider-line"><div><b>Invoices</b><small>Authority remains backend-owned.</small></div>${chip('Pending', 'warn')}</div><div class="provider-line"><div><b>Payments</b><small>No provider connected in Preview.</small></div>${chip('Inactive', 'warn')}</div><div class="provider-line"><div><b>Refunds / reconciliation</b><small>No fake state is created by demo mode.</small></div>${chip('Blocked', 'danger')}</div></div>`;
  }

  function renderAccess() {
    page('access').innerHTML = head('USERS & ACCESS', 'Functions → Roles → Admin Users.', 'Preview RBAC layout. Demo mode does not expose real users.', chip('Protected in real mode', 'warn')) +
      table(['Subject', 'Role', 'Functions', 'State'], [['Preview reviewer', 'Super Admin (demo)', 'Dashboard · CMS · Product · B2B · Audit', chip('Demo', 'warn')], ['Public website', 'No admin role', 'Read-only public source', chip('Separate', 'blue')]]);
  }

  function renderAudit() {
    page('audit').innerHTML = head('AUDIT', 'Siapa mengubah apa.', 'Preview audit log structure. Demo mode never records a real event.', chip('0 real events', 'good')) +
      `<div class="empty">Belum ada event nyata pada Preview Demo. Semua tombol operasi write sengaja tidak tersedia.</div>`;
  }

  function renderSystem() {
    page('system').innerHTML = head('SYSTEM', 'Capability health.', 'Status transparan untuk membedakan fondasi, Preview, dan Production.', chip('Staging / noindex', 'blue')) +
      `<div class="card pad"><div class="provider-line"><div><b>Public storefront</b><small>Current locked source tetap menjadi sumber publik.</small></div>${chip('Active', 'good')}</div><div class="provider-line"><div><b>Supabase Auth + RLS</b><small>Login real disiapkan untuk mode operational.</small></div>${chip('Available', 'good')}</div><div class="provider-line"><div><b>Admin Preview</b><small>Dashboard demo untuk review, tanpa write.</small></div>${chip('Read-only', 'warn')}</div><div class="provider-line"><div><b>Production</b><small>Branch main tidak disentuh oleh Preview Demo.</small></div>${chip('Protected', 'good')}</div></div>`;
  }

  const renderers = { dashboard: renderDashboard, cms: renderCms, products: renderProducts, b2c: renderB2c, b2b: renderB2b, testimonials: renderTestimonials, finance: renderFinance, access: renderAccess, audit: renderAudit, system: renderSystem };

  function go(name) {
    document.querySelectorAll('.page').forEach((section) => section.classList.toggle('active', section.dataset.page === name));
    document.querySelectorAll('[data-go]').forEach((button) => button.classList.toggle('active', button.dataset.go === name));
    document.querySelector('#pageTitle').textContent = nav.find((item) => item[0] === name)?.[2] || name;
    renderers[name]();
  }

  document.querySelector('#nav').innerHTML = nav.map(([id, icon, label]) => `<button type="button" data-go="${id}"><span class="ico">${icon}</span>${label}</button>`).join('');
  document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => go(button.dataset.go)));
  document.querySelector('#refreshBtn').addEventListener('click', () => go(document.querySelector('.page.active')?.dataset.page || 'dashboard'));
  go('dashboard');
})();

(() => {
  'use strict';

  const state = { data: { products: [], variants: [], cms: [], testimonials: [], b2b: [] }, error: null, active: 'dashboard', loading: true };
  const nav = [
    ['dashboard', '◈', 'Dashboard'], ['cms', '▤', 'Website / CMS'], ['products', '◇', 'Product Master'],
    ['b2c', '▣', 'B2C Operations'], ['b2b', '⌁', 'B2B Operations'], ['testimonials', '✦', 'Testimonials'],
    ['finance', '◎', 'Finance'], ['access', '♙', 'Users & Access'], ['audit', '≡', 'Audit'], ['system', '⚙', 'System']
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
  const chip = (value, tone = '') => `<span class="chip ${tone}">${esc(value)}</span>`;
  const page = (name) => document.querySelector(`[data-page="${name}"]`);
  const setMessage = (text, tone = 'warning') => {
    const node = $('#globalMessage');
    if (!node) return;
    node.hidden = !text;
    node.className = `message ${tone}`;
    node.textContent = text || '';
  };
  const head = (eyebrow, title, copy, action = '') => `<div class="page-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(copy)}</p></div><div class="head-actions">${action}</div></div>`;
  const metric = (label, value, copy) => `<div class="card metric"><b>${esc(label)}</b><strong>${esc(value)}</strong><small>${esc(copy)}</small></div>`;
  const table = (headers, rows) => `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}"><div class="empty">Belum ada data.</div></td></tr>`}</tbody></table></div>`;

  async function request(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) throw new Error(payload.error || payload.detail || `Request gagal (${response.status})`);
    return payload;
  }

  async function loadData() {
    state.loading = true;
    renderCurrent();
    try {
      const payload = await request('/api/dev-admin');
      state.data = payload.data || state.data;
      state.error = null;
      setMessage('Terhubung ke Supabase Preview. Mode Dev Admin aktif.', 'success');
    } catch (error) {
      state.error = error.message;
      setMessage(`Dev Admin belum terhubung: ${error.message}. Tambahkan env Preview dan redeploy untuk membaca data Supabase.`, 'error');
    } finally {
      state.loading = false;
      renderCurrent();
    }
  }

  function renderDashboard() {
    const { products, variants, cms, testimonials, b2b } = state.data;
    page('dashboard').innerHTML = head('DEVELOPMENT ADMIN', 'Ruang kerja AYA RAOS.', 'Ini Admin development yang membaca Supabase Preview. Perubahan disimpan ke database development, bukan data production.', chip('Live Preview', 'good')) +
      `<div class="grid cols4">${metric('Produk', products.length, 'Product Master')}${metric('Varian', variants.length, 'Harga dan orderability')}${metric('CMS slots', cms.length, 'Draft content')}${metric('Testimonials', testimonials.length, 'Submission database')}</div>` +
      `<div class="section-title"><h2>Semesta → Dunia → Hero</h2><span>source of truth</span></div><div class="grid cols2"><div class="card pad"><div class="list"><div class="row"><div><b>AYA RAOS</b><small>Semesta besar brand dan pengalaman.</small></div>${chip('Active', 'good')}</div><div class="row"><div><b>Tiga Dunia</b><small>TUMBUH · DIOLAH · DINIKMATI.</small></div>${chip('Mapped', 'good')}</div><div class="row"><div><b>Hero produk</b><small>${esc(products.length)} product record terhubung ke Product Master.</small></div>${chip('Editable', 'blue')}</div></div></div><div class="card pad"><div class="list"><div class="row"><div><b>Supabase Preview</b><small>${state.error ? 'Belum terhubung' : 'Data development tersedia untuk review.'}</small></div>${chip(state.error ? 'Needs env' : 'Connected', state.error ? 'warn' : 'good')}</div><div class="row"><div><b>B2B configuration</b><small>${esc(b2b.length)} konfigurasi produk terbaca.</small></div>${chip('Available', 'good')}</div><div class="row"><div><b>Write mode</b><small>Edit produk, CMS, dan upload media memakai endpoint Preview.</small></div>${chip('Dev only', 'warn')}</div></div></div></div>`;
  }

  function renderCms() {
    const slots = state.data.cms || [];
    page('cms').innerHTML = head('WEBSITE / CMS', 'Konten Semesta dapat diedit.', 'Edit draft content untuk slot website. Publish workflow dapat ditambahkan setelah struktur copy disetujui.', chip(`${slots.length} slots`, 'good')) +
      (slots.length ? `<div class="grid cols2">${slots.map((slot) => `<article class="card pad cms-card" data-slot-key="${esc(slot.slot_key)}"><div class="section-title" style="margin-top:0"><h2>${esc(slot.label || slot.slot_key)}</h2>${chip(`v${slot.draft_version || 1}`, 'blue')}</div><p class="muted-line">${esc(slot.area || 'Website')} · ${esc(slot.slot_key)}</p><textarea data-cms-text rows="7">${esc(slot.draft_content?.text || slot.draft_content?.body || JSON.stringify(slot.draft_content || {}, null, 2))}</textarea><div class="toolbar" style="margin-top:10px"><button class="btn primary" type="button" data-save-cms>Save draft</button><span class="muted-line" data-save-state></span></div></article>`).join('')}</div>` : `<div class="empty">CMS slots belum terisi pada Supabase Preview.</div>`);
  }

  function renderProducts() {
    const { products, variants } = state.data;
    const variantMap = new Map();
    variants.forEach((variant) => { if (!variantMap.has(variant.product_id)) variantMap.set(variant.product_id, []); variantMap.get(variant.product_id).push(variant); });
    page('products').innerHTML = head('PRODUCT MASTER', 'Hero produk yang bisa dikembangkan.', 'Edit nama, Dunia, status, orderability, quantity, dan varian langsung pada data development.', chip(`${products.length} products`, 'good')) +
      `<div class="product-editor-list">${products.length ? products.map((product) => `<article class="card pad product-editor" data-product-id="${esc(product.product_id)}"><div class="page-head"><div><span class="eyebrow">${esc(product.line_name)}</span><h2>${esc(product.product_name)}</h2><p>${esc(product.product_id)} · ${esc(product.category_name)}</p></div>${chip(product.public_status, product.public_status === 'Tersedia' ? 'good' : 'warn')}</div><div class="form-grid"><label>Nama produk<input data-field="product_name" value="${esc(product.product_name)}"></label><label>Dunia / Line<input data-field="line_name" value="${esc(product.line_name)}"></label><label>Kategori<input data-field="category_name" value="${esc(product.category_name)}"></label><label>Status<select data-field="public_status"><option ${product.public_status === 'Tersedia' ? 'selected' : ''}>Tersedia</option><option ${product.public_status === 'Pre-order' ? 'selected' : ''}>Pre-order</option><option ${product.public_status === 'Habis' ? 'selected' : ''}>Habis</option></select></label><label>Min quantity<input data-field="min_quantity" type="number" min="1" value="${esc(product.min_quantity)}"></label><label>Max quantity<input data-field="max_quantity" type="number" min="1" value="${esc(product.max_quantity || '')}"></label></div><div class="toolbar" style="margin-top:12px"><button class="btn primary" type="button" data-save-product>Simpan produk</button><label class="upload-control">Ganti foto<input type="file" accept="image/jpeg,image/png,image/webp" data-upload-product hidden></label><span class="muted-line" data-save-state></span></div><div class="section-title"><h2>Varian</h2><span>${(variantMap.get(product.product_id) || []).length} varian</span></div>${table(['Varian', 'Harga', 'Orderable', 'Action'], (variantMap.get(product.product_id) || []).map((variant) => [`<b>${esc(variant.variant_name)}</b>`, `<input class="inline-input" data-variant-price="${esc(variant.variant_name)}" type="number" min="0" value="${esc(variant.unit_price)}">`, chip(variant.orderable ? 'Yes' : 'No', variant.orderable ? 'good' : 'warn'), `<button class="btn ghost" type="button" data-save-variant="${esc(variant.variant_name)}">Simpan</button>`]))}</article>`).join('') : `<div class="empty">Belum ada product record pada Supabase Preview.</div>`}</div>`;
  }

  function renderB2c() {
    page('b2c').innerHTML = head('B2C OPERATIONS', 'Commerce foundation.', 'Order dan customer flow ditampilkan setelah tabel order terhubung ke Preview.', chip('Preview', 'blue')) + `<div class="card pad"><div class="empty">Belum ada order development yang tersedia untuk ditampilkan.</div></div>`;
  }

  function renderB2b() {
    const rows = (state.data.b2b || []).map((item) => [esc(item.product_id), chip(item.supply_eligible ? 'Eligible' : 'Not eligible', item.supply_eligible ? 'good' : 'warn'), esc(item.updated_at || '—')]);
    page('b2b').innerHTML = head('B2B OPERATIONS', 'Pasokan tumbuh bersama relasi.', 'Konfigurasi eligibility produk yang dibaca dari Supabase Preview.', chip(`${rows.length} configs`, 'good')) + table(['Product', 'Supply eligibility', 'Updated'], rows);
  }

  function renderTestimonials() {
    const rows = (state.data.testimonials || []).map((item) => [esc(item.display_name || item.public_display_name || 'Anonymous'), esc(item.product_name_snapshot || '—'), esc(item.testimonial_format || '—'), chip(item.status || 'Draft', item.status === 'Approved' ? 'good' : 'warn')]);
    page('testimonials').innerHTML = head('TESTIMONIALS', 'Cerita pelanggan untuk direview.', 'Moderation dan media asset akan bekerja di Preview setelah data tersedia.', chip(`${rows.length} records`, 'good')) + table(['Name', 'Hero product', 'Format', 'Status'], rows);
  }

  function renderFinance() {
    page('finance').innerHTML = head('FINANCE / PAYMENT', 'Paid bukan settled.', 'Payment provider tetap inactive sampai kredensial staging dikonfigurasi.', chip('Staging inactive', 'warn')) + `<div class="grid cols3">${metric('DOKU', 'Inactive', 'No provider env')}${metric('Midtrans', 'Inactive', 'No provider env')}${metric('Mark Paid', 'Blocked', 'Backend verification only')}</div>`;
  }

  function renderAccess() {
    page('access').innerHTML = head('USERS & ACCESS', 'Role dan permission.', 'Dev Admin bypass hanya untuk development Preview; mode operational tetap memakai Auth + RBAC.', chip('Dev bypass', 'warn')) + `<div class="card pad"><div class="provider-line"><div><b>Current Preview</b><small>No-login development mode untuk pembangunan website.</small></div>${chip('Enabled', 'warn')}</div><div class="provider-line"><div><b>Operational Admin</b><small>Auth User + Super Admin role tetap tersedia.</small></div>${chip('Ready later', 'good')}</div></div>`;
  }

  function renderAudit() {
    page('audit').innerHTML = head('AUDIT', 'Perubahan yang terlihat.', 'Dev Preview menampilkan status operasi tanpa membuat audit event production.', chip('Development', 'blue')) + `<div class="card pad"><div class="empty">Audit event akan diaktifkan bersama operation log setelah workflow publish ditentukan.</div></div>`;
  }

  function renderSystem() {
    page('system').innerHTML = head('SYSTEM', 'Development capability health.', 'Status transparan untuk membedakan database Preview, branch integration, dan Production.', chip('noindex', 'blue')) + `<div class="card pad"><div class="provider-line"><div><b>Integration branch</b><small>Dev Admin changes are isolated from main.</small></div>${chip('Active', 'good')}</div><div class="provider-line"><div><b>Supabase Preview</b><small>${state.error ? esc(state.error) : 'Connected through server-side Preview API.'}</small></div>${chip(state.error ? 'Needs env' : 'Connected', state.error ? 'warn' : 'good')}</div><div class="provider-line"><div><b>Write operations</b><small>Product/CMS/media writes are restricted to Vercel Preview.</small></div>${chip('Preview-only', 'warn')}</div><div class="provider-line"><div><b>Production / main</b><small>Not touched by this development flow.</small></div>${chip('Protected', 'good')}</div></div>`;
  }

  const renderers = { dashboard: renderDashboard, cms: renderCms, products: renderProducts, b2c: renderB2c, b2b: renderB2b, testimonials: renderTestimonials, finance: renderFinance, access: renderAccess, audit: renderAudit, system: renderSystem };

  function renderCurrent() {
    if (!state.loading && renderers[state.active]) renderers[state.active]();
    document.querySelectorAll('.page').forEach((section) => section.classList.toggle('active', section.dataset.page === state.active));
    document.querySelectorAll('[data-go]').forEach((button) => button.classList.toggle('active', button.dataset.go === state.active));
  }

  async function saveProduct(card) {
    const body = { product_id: card.dataset.productId };
    card.querySelectorAll('[data-field]').forEach((field) => { body[field.dataset.field] = field.type === 'number' ? (field.value === '' ? null : Number(field.value)) : field.value; });
    const stateNode = $('[data-save-state]', card);
    stateNode.textContent = 'Menyimpan…';
    try { await request('/api/dev-admin/products', { method: 'PATCH', body: JSON.stringify(body) }); stateNode.textContent = 'Tersimpan ke Preview.'; await loadData(); }
    catch (error) { stateNode.textContent = `Gagal: ${error.message}`; }
  }

  async function saveVariant(card, button) {
    const variantName = button.dataset.saveVariant;
    const price = $(`[data-variant-price="${CSS.escape(variantName)}"]`, card)?.value;
    const stateNode = $('[data-save-state]', card);
    stateNode.textContent = 'Menyimpan varian…';
    try { await request('/api/dev-admin/content', { method: 'PATCH', body: JSON.stringify({ type: 'variant', product_id: card.dataset.productId, variant_name: variantName, unit_price: Number(price) }) }); stateNode.textContent = 'Varian tersimpan.'; await loadData(); }
    catch (error) { stateNode.textContent = `Gagal: ${error.message}`; }
  }

  async function saveCms(card) {
    const stateNode = $('[data-save-state]', card);
    stateNode.textContent = 'Menyimpan draft…';
    try { const slot = state.data.cms.find((item) => item.slot_key === card.dataset.slotKey); await request('/api/dev-admin/content', { method: 'PATCH', body: JSON.stringify({ type: 'cms', slot_key: card.dataset.slotKey, text: $('[data-cms-text]', card).value, draft_version: slot?.draft_version || 1 }) }); stateNode.textContent = 'Draft tersimpan.'; await loadData(); }
    catch (error) { stateNode.textContent = `Gagal: ${error.message}`; }
  }

  async function uploadProductImage(card, file) {
    if (!file) return;
    const stateNode = $('[data-save-state]', card);
    stateNode.textContent = 'Mengunggah foto…';
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const payload = await request('/api/dev-admin/media', { method: 'POST', body: JSON.stringify({ filename: file.name, content_type: file.type, data_base64: reader.result, domain: card.dataset.productId, asset_kind: 'product_hero', alt_text: card.querySelector('[data-field="product_name"]')?.value || '' }) });
        stateNode.textContent = 'Foto tersimpan di Media Library Preview.';
        const image = document.createElement('img'); image.src = payload.asset?.signed_url || ''; image.alt = 'Uploaded preview'; image.className = 'uploaded-preview';
        card.querySelector('.uploaded-preview')?.remove(); card.querySelector('.toolbar').appendChild(image);
      } catch (error) { stateNode.textContent = `Upload gagal: ${error.message}`; }
    };
    reader.readAsDataURL(file);
  }

  document.querySelector('#nav').innerHTML = nav.map(([id, icon, label]) => `<button type="button" data-go="${id}"><span class="ico">${icon}</span>${label}</button>`).join('');
  document.querySelector('#nav').addEventListener('click', (event) => { const button = event.target.closest('[data-go]'); if (!button) return; state.active = button.dataset.go; renderCurrent(); });
  document.querySelector('#refreshBtn').addEventListener('click', loadData);
  document.querySelector('.content').addEventListener('click', (event) => {
    const productSave = event.target.closest('[data-save-product]'); if (productSave) return saveProduct(event.target.closest('.product-editor'));
    const variantSave = event.target.closest('[data-save-variant]'); if (variantSave) return saveVariant(event.target.closest('.product-editor'), variantSave);
    const cmsSave = event.target.closest('[data-save-cms]'); if (cmsSave) return saveCms(event.target.closest('.cms-card'));
  });
  document.querySelector('.content').addEventListener('change', (event) => { const input = event.target.closest('[data-upload-product]'); if (input) uploadProductImage(event.target.closest('.product-editor'), input.files[0]); });

  loadData();
})();

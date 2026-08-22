(() => {
'use strict';

const cfg = window.AYA_CONFIG?.supabase || {};
let sb = null;
try {
  sb = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
} catch(e) {
  console.warn('Supabase not connected — running in offline preview');
}

const S = {
  session: null,
  fx: new Set(),
  page: 'dashboard',
  previewMode: true,
  products: [], variants: [], b2b: [], measures: [],
  cms: [], testimonials: [], orders: [],
  roles: [], functions: [], admins: []
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money = n => n == null ? '—' : new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n));
const chip = (v, c = '') => `<span class="chip ${c}">${esc(v)}</span>`;
const can = k => S.fx.has(k) || S.previewMode;

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
  ['audit','≡','Audit','audit.view'],
  ['system','⚙','System','system.view']
];

const previewFx = [
  'dashboard.view','website.view','website.edit','website.publish','website.rollback',
  'media.view','media.upload','media.edit','product.view','product.edit','product.b2b.manage',
  'b2c.view','b2c.order.review','b2c.order.status.edit','b2b.view','b2b.cogs.view',
  'b2b.cogs.edit','b2b.unit_price.edit','testimonial.view','testimonial.moderate',
  'testimonial.publish_asset.upload','testimonial.overlay.edit','testimonial.publish',
  'users.access.view','users.access.manage','audit.view','finance.view','system.view'
];

function renderNav() {
  const n = $('#nav');
  n.innerHTML = navItems.filter(x => can(x[3])).map(x =>
    `<button data-go="${x[0]}" class="${S.page === x[0] ? 'active' : ''}"><span class="ico">${x[1]}</span>${x[2]}</button>`
  ).join('');
  n.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));

  // Mobile nav
  const mp = $('#mobileNavPanel');
  mp.innerHTML = navItems.filter(x => can(x[3])).map(x =>
    `<button data-mgo="${x[0]}" class="${S.page === x[0] ? 'active' : ''}">${x[1]} ${x[2]}</button>`
  ).join('');
  mp.querySelectorAll('[data-mgo]').forEach(b => b.onclick = () => {
    go(b.dataset.mgo);
    mp.classList.remove('open');
  });
}

async function go(n) {
  S.page = n;
  $$('.page').forEach(p => p.classList.toggle('active', p.dataset.page === n));
  $('#pageTitle').textContent = navItems.find(x => x[0] === n)?.[2] || n;
  renderNav();
  showLoading();
  try { await render(n); }
  catch(e) { page(n).innerHTML = head('ERROR','Data belum dapat dimuat.',e.message,chip('Error','danger')); }
  finally { hideLoading(); }
}

const rows = async (t, sel = '*') => {
  if (!sb) return [];
  try { const {data,error} = await sb.from(t).select(sel); if(error) throw error; return data||[]; }
  catch(e) { console.warn(`Failed to load ${t}:`,e.message); return []; }
};

// Dummy data
const dummyProducts = [
  {product_id:'SAM-001',product_name:'Sambal Bawang',line_name:'Spice Haven',public_status:'Tersedia',orderable:true,visible:true},
  {product_id:'SAM-002',product_name:'Sambal Rawang',line_name:'Spice Haven',public_status:'Tersedia',orderable:true,visible:true},
  {product_id:'BGS-001',product_name:'Bawang Goreng Sumenep',line_name:'Spice Haven',public_status:'Pre-order',orderable:true,visible:true},
  {product_id:'REN-001',product_name:'Rendang Daging Sapi',line_name:'Spice Haven',public_status:'Tersedia',orderable:true,visible:true},
  {product_id:'BER-001',product_name:'Beras Pilihan',line_name:'Farm',public_status:'Tersedia',orderable:true,visible:true},
];
const dummyVariants = [
  {product_id:'SAM-001',variant_name:'Original',unit_price:40000},
  {product_id:'SAM-001',variant_name:'Extra Pedas',unit_price:42000},
  {product_id:'SAM-001',variant_name:'Teri',unit_price:45000},
  {product_id:'SAM-001',variant_name:'Ebi',unit_price:48000},
  {product_id:'SAM-002',variant_name:'Original',unit_price:40000},
  {product_id:'BGS-001',variant_name:'100g',unit_price:60000},
  {product_id:'BGS-001',variant_name:'250g',unit_price:120000},
  {product_id:'REN-001',variant_name:'500g',unit_price:105000},
];
const dummyB2B = [
  {product_id:'SAM-001',supply_eligible:true},
  {product_id:'SAM-002',supply_eligible:true},
  {product_id:'BER-001',supply_eligible:false},
];
const dummyMeasures = [
  {id:'m1',product_id:'SAM-001',variant_name:'Original',unit_label:'jar 200g',base_cost:25000,final_unit_price:40000,commercial_enabled:true},
  {id:'m2',product_id:'SAM-001',variant_name:'Extra Pedas',unit_label:'jar 200g',base_cost:26000,final_unit_price:42000,commercial_enabled:true},
];
const dummyOrders = [
  {id:'ord1',order_number:'AYA-260822-001',customer_name:'Budi Santoso',context:'personal',subtotal_amount:125000,order_status:'received',payment_status:'pending'},
  {id:'ord2',order_number:'AYA-260822-002',customer_name:'Siti Aminah',context:'personal',subtotal_amount:85000,order_status:'confirmed',payment_status:'paid'},
];
const dummyTestimonials = [
  {id:'t1',display_name:'Rina Wulandari',product_name_snapshot:'Sambal Bawang',testimonial_format:'photo',status:'pending',is_featured:false,testimonial_text:'Sambalnya enak banget, pedasnya pas!',city:'Jakarta'},
  {id:'t2',display_name:'Ahmad Fauzi',product_name_snapshot:'Bawang Goreng',testimonial_format:'text',status:'approved',is_featured:true,testimonial_text:'Renyah dan gurih, cocok untuk nasi uduk.',city:'Bandung'},
  {id:'t3',display_name:'Dewi Kusuma',product_name_snapshot:'Rendang',testimonial_format:'video',status:'pending',is_featured:false,testimonial_text:'Dagingnya empuk dan bumbunya meresap.',city:'Surabaya'},
];
const dummyCMS = [
  {slot_key:'hero_title',label:'Hero Title',area:'homepage',draft_version:3,published_version:2,published_at:'2026-08-20T10:00:00Z',draft_content:{text:'AYA RAOS. Ada Rasa.'},published_content:{text:'AYA RAOS. Ada Rasa.'}},
  {slot_key:'about_text',label:'About Text',area:'homepage',draft_version:2,published_version:1,published_at:'2026-08-18T08:00:00Z',draft_content:{text:'Rasa yang dekat dengan keseharian.'},published_content:{text:'Rasa yang dekat dengan keseharian.'}},
];
const dummyRoles = [
  {id:'r1',role_name:'Super Admin',description:'Full access',is_system:true,role_code:'superadmin'},
  {id:'r2',role_name:'Content Manager',description:'CMS only',is_system:false,role_code:'content'},
  {id:'r3',role_name:'Order Manager',description:'B2C operations',is_system:false,role_code:'orders'},
];
const dummyAdmins = [
  {user_id:'u1',display_name:'Admin Utama',is_active:true},
  {user_id:'u2',display_name:'Content Editor',is_active:true},
];

function page(n) { return $(`[data-page="${n}"]`); }

async function dashboard() {
  let t={count:0},o={count:0},b={count:0},c={count:0},m={count:0};
  if(sb){try{[t,o,b,c,m]=await Promise.all([can('testimonial.view')?sb.from('aya_testimonials').select('id',{head:true,count:'exact'}).eq('status','pending'):Promise.resolve({count:0}),can('b2c.view')?sb.from('aya_orders').select('id',{head:true,count:'exact'}):Promise.resolve({count:0}),can('b2b.view')?sb.from('aya_b2b_product_config').select('product_id',{head:true,count:'exact'}).eq('supply_eligible',true):Promise.resolve({count:0}),can('website.view')?sb.from('aya_cms_slots').select('slot_key',{head:true,count:'exact'}):Promise.resolve({count:0}),can('media.view')?sb.from('aya_media_assets').select('id',{head:true,count:'exact'}).eq('lifecycle_status','active'):Promise.resolve({count:0})]);}catch(e){}}
  const tc=t.count??1,oc=o.count??2,bc=b.count??2,mc=m.count??0,cc=c.count??2;
  page('dashboard').innerHTML = head('OPERATIONAL OVERVIEW','Yang perlu perhatian, dulu.','Preview mode — data mungkin sample. Hubungkan backend untuk data live.',chip('Preview Mode','warn')) +
    `<div class="grid cols4">${metric('Pending Testimonials',tc,'Menunggu moderation.')}${metric('B2C Orders',oc,'Persisted staging records.')}${metric('B2B Eligible',bc,'Explicit Product Master config.')}${metric('CMS Slots',cc,'Content slots aktif.')}</div>` +
    `<div class="section-title"><h2>Readiness</h2><span>capability state</span></div><div class="grid cols2">` +
    `<div class="card pad"><div class="list"><div class="row"><div><b>CMS persistence</b><small>${cc} slots · versioned Draft/Publish/Rollback.</small></div>${chip('Active','good')}</div>` +
    `<div class="row"><div><b>Payment provider</b><small>AYA_CONFIG.payment.enabled = ${String(window.AYA_CONFIG?.payment?.enabled??false)}</small></div>${chip('Inactive','warn')}</div>` +
    `<div class="row"><div><b>Shipping provider</b><small>AYA_CONFIG.shipping.enabled = ${String(window.AYA_CONFIG?.shipping?.enabled??false)}</small></div>${chip('Inactive','warn')}</div></div></div>` +
    `<div class="card pad"><div class="list"><div class="row"><div><b>B2B Core</b><small>Product config, measurements and qualification tables.</small></div>${chip('Active foundation','good')}</div>` +
    `<div class="row"><div><b>Preview Mode</b><small>Admin panel tanpa login untuk UI/UX review.</small></div>${chip('Active','good')}</div>` +
    `<div class="row"><div><b>Public Publish Layer</b><small>Admin DB belum menggantikan locked public source.</small></div>${chip('Integration pending','warn')}</div></div></div></div>`;
}

async function cms() {
  S.cms = await rows('aya_cms_slots');
  if(!S.cms.length) S.cms = dummyCMS;
  page('cms').innerHTML = head('WEBSITE / CMS','Konten terkontrol + Media Library.','Preview mode — edit tersimpan lokal (tidak ke database).',chip('Preview','warn')) +
    `<div class="subnav"><button class="active" data-cmst="slots">Content Slots</button><button data-cmst="media">Media Library</button></div>` +
    `<div id="cmsSlots"><div class="table-wrap"><table><thead><tr><th>Slot</th><th>Area</th><th>Draft</th><th>Published</th><th>State</th><th></th></tr></thead><tbody>` +
    S.cms.map(s=>`<tr><td><b>${esc(s.label)}</b><div class="muted-line">${esc(s.slot_key)}</div></td><td>${esc(s.area)}</td><td>${s.draft_version}</td><td>${s.published_version??'—'}</td><td>${s.published_at?chip('Published','good'):chip('Draft','warn')}</td><td><button class="btn ghost" data-slot="${esc(s.slot_key)}">Open</button></td></tr>`).join('') +
    `</tbody></table></div></div><div id="cmsMedia" hidden><div class="empty" style="margin-top:20px"><p>Media Library — Preview Mode</p><p class="muted">Upload dan manajemen asset akan tersedia setelah backend terhubung.</p></div></div>`;
  page('cms').querySelectorAll('[data-cmst]').forEach(b=>b.onclick=()=>{
    page('cms').querySelectorAll('[data-cmst]').forEach(x=>x.classList.toggle('active',x===b));
    $('#cmsSlots').hidden=b.dataset.cmst!=='slots'; $('#cmsMedia').hidden=b.dataset.cmst!=='media';
  });
  page('cms').querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>openSlotPreview(b.dataset.slot));
}

function openSlotPreview(k) {
  const s=S.cms.find(x=>x.slot_key===k)||dummyCMS[0];
  modal(`<h2>${esc(s.label)}</h2><label>Draft content<textarea id="slotText">${esc(s.draft_content?.text??'')}</textarea></label>` +
    `<label style="display:block;margin-top:10px">Reason<input id="slotReason" placeholder="Alasan perubahan"></label>` +
    `<div class="section-title"><h2>Published</h2><span>current version</span></div><div class="preview-box">${esc(s.published_content?.text??'Belum dipublikasikan.')}</div>` +
    `<div class="toolbar" style="margin-top:14px"><button id="saveSlot" class="btn">Save Draft (Local)</button><button id="pubSlot" class="btn primary">Publish (Local)</button></div>` +
    `<div class="message" style="margin-top:10px">Preview mode: perubahan tidak tersimpan ke database.</div>`);
  $('#saveSlot').onclick=()=>{msg('Draft tersimpan (lokal).','success');$('#modal').close();};
  $('#pubSlot').onclick=()=>{msg('Published (lokal).','success');$('#modal').close();};
}

async function products() {
  [S.products,S.variants,S.b2b,S.measures]=await Promise.all([rows('aya_catalog_products'),rows('aya_catalog_variants'),rows('aya_b2b_product_config'),rows('aya_b2b_measurements')]);
  if(!S.products.length){S.products=dummyProducts;S.variants=dummyVariants;S.b2b=dummyB2B;S.measures=dummyMeasures;}
  page('products').innerHTML = head('PRODUCT MASTER','Satu produk, dua commercial layers.','Preview mode — edit tidak tersimpan ke database.',chip(`${S.products.length} products`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Product</th><th>Line</th><th>Status</th><th>B2C</th><th>Variants</th><th>Pasokan</th><th></th></tr></thead><tbody>` +
    S.products.map(p=>{const b=S.b2b.find(x=>x.product_id===p.product_id);const vcount=S.variants.filter(v=>v.product_id===p.product_id).length;
      return `<tr><td><b>${esc(p.product_name)}</b><div class="muted-line">${esc(p.product_id)}</div></td><td>${esc(p.line_name)}</td>` +
      `<td>${chip(p.public_status,p.public_status==='Tersedia'?'good':p.public_status==='Pre-order'?'warn':'danger')}</td>` +
      `<td>${p.orderable?chip('Orderable','good'):chip('Off')}</td><td>${vcount}</td><td>${b?.supply_eligible?chip('Bisa','blue'):chip('Tidak')}</td>` +
      `<td><button class="btn ghost" data-p="${p.product_id}">Edit</button></td></tr>`;}).join('') + `</tbody></table></div>`;
  page('products').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>openProductPreview(b.dataset.p));
}

function openProductPreview(id) {
  const p=S.products.find(x=>x.product_id===id)||dummyProducts[0];
  const b=S.b2b.find(x=>x.product_id===id);
  const vs=S.variants.filter(x=>x.product_id===id);
  const ms=S.measures.filter(x=>x.product_id===id);
  modal(`<h2>${esc(p.product_name)}</h2><div class="form-grid">` +
    `<label>Status<select id="ppStatus"><option ${p.public_status==='Tersedia'?'selected':''}>Tersedia</option><option ${p.public_status==='Pre-order'?'selected':''}>Pre-order</option><option ${p.public_status==='Habis'?'selected':''}>Habis</option></select></label>` +
    `<label>Orderable<select id="ppOrder"><option value="true" ${p.orderable?'selected':''}>Ya</option><option value="false" ${!p.orderable?'selected':''}>Tidak</option></select></label>` +
    `<label>Visible<select id="ppVisible"><option value="true" ${p.visible?'selected':''}>Ya</option><option value="false" ${!p.visible?'selected':''}>Tidak</option></select></label>` +
    `<label>Pasokan<select id="ppSupply"><option value="true" ${b?.supply_eligible?'selected':''}>Bisa</option><option value="false" ${!b?.supply_eligible?'selected':''}>Tidak Bisa</option></select></label></div>` +
    `<div class="section-title"><h2>B2C Variants</h2><span>current</span></div><div class="list">${vs.map(v=>`<div class="row"><b>${esc(v.variant_name)}</b><strong>${money(v.unit_price)}</strong></div>`).join('')||'<div class="empty">No variants.</div>'}</div>` +
    `<div class="section-title"><h2>B2B Measurements</h2><span>economics</span></div><div class="list">${ms.map(m=>`<div class="row"><div><b>${esc(m.variant_name)} · ${esc(m.unit_label)}</b><small>Base ${money(m.base_cost)} · Final ${money(m.final_unit_price)}</small></div></div>`).join('')||'<div class="empty">No measurements.</div>'}</div>` +
    `<div class="toolbar" style="margin-top:14px"><button id="productSave" class="btn primary">Save (Local)</button></div><div class="message" style="margin-top:10px">Preview mode: perubahan tidak tersimpan ke database.</div>`);
  $('#productSave').onclick=()=>{msg('Product updated (lokal).','success');$('#modal').close();};
}

async function b2c() {
  const {data,error}=sb?await sb.from('aya_orders').select('*').order('submitted_at',{ascending:false}).limit(100):{data:null,error:null};
  S.orders=data||dummyOrders; if(!S.orders.length) S.orders=dummyOrders;
  page('b2c').innerHTML = head('B2C OPERATIONS','Sekali beli tetap B2C.','Preview mode — order status read-only.',chip(`${S.orders.length} orders`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Context</th><th>Subtotal</th><th>Order</th><th>Payment</th></tr></thead><tbody>` +
    S.orders.map(o=>`<tr><td>${esc(o.order_number)}</td><td>${esc(o.customer_name)}</td><td>${esc(o.context)}</td><td>${money(o.subtotal_amount)}</td><td>${chip(o.order_status,'blue')}</td><td>${chip(o.payment_status,o.payment_status==='paid'?'good':o.payment_status==='pending'?'warn':'')}</td></tr>`).join('') +
    `</tbody></table></div>`;
}

async function b2b() {
  const [cfgs,ms,ths,set,companies,members]=await Promise.all([rows('aya_b2b_product_config'),rows('aya_b2b_measurements'),rows('aya_b2b_qualification_thresholds'),rows('aya_b2b_qualification_settings'),rows('aya_b2b_companies'),rows('aya_b2b_company_members')]);
  S.b2b=cfgs.length?cfgs:dummyB2B; S.measures=ms.length?ms:dummyMeasures;
  const settings=set[0]||{};
  page('b2b').innerHTML = head('B2B OPERATIONS','Konfigurasi nyata; lifecycle mengikuti backend.','Preview mode — data sample.',settings?.qualification_enabled?chip('Qualification ON','good'):chip('Qualification OFF','warn')) +
    `<div class="grid cols4">${metric('Companies',companies.length||0,'B2B identity foundation')}${metric('Company Members',members.length||0,'Individual identities')}${metric('Eligible Products',S.b2b.filter(x=>x.supply_eligible).length,'Explicit config')}${metric('Commercial Enabled',S.measures.filter(x=>x.commercial_enabled).length,'Subject to margin guard')}</div>` +
    `<div class="section-title"><h2>Measurements</h2><span>economics backend-owned</span></div><div class="table-wrap"><table><thead><tr><th>Product</th><th>Variant</th><th>Unit</th><th>Base Cost</th><th>Final Price</th><th>Enabled</th></tr></thead><tbody>` +
    S.measures.map(m=>`<tr><td>${esc(m.product_id)}</td><td>${esc(m.variant_name)}</td><td>${esc(m.unit_label)}</td><td>${money(m.base_cost)}</td><td>${money(m.final_unit_price)}</td><td>${m.commercial_enabled?chip('Yes','good'):chip('No')}</td></tr>`).join('') +
    `</tbody></table></div>`;
}

async function testimonials() {
  const {data,error}=sb?await sb.from('aya_testimonials').select('*').order('submitted_at',{ascending:false}):{data:null,error:null};
  S.testimonials=data||dummyTestimonials; if(!S.testimonials.length) S.testimonials=dummyTestimonials;
  page('testimonials').innerHTML = head('TESTIMONIALS','Moderate dulu. Publish kemudian.','Preview mode — moderation tidak tersimpan.',chip(`${S.testimonials.length} submissions`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Name</th><th>Product</th><th>Format</th><th>Status</th><th>Public</th><th></th></tr></thead><tbody>` +
    S.testimonials.map(t=>`<tr><td>${esc(t.display_name)}</td><td>${esc(t.product_name_snapshot)}</td><td>${esc(t.testimonial_format)}</td><td>${chip(t.status,t.status==='approved'?'good':t.status==='rejected'?'danger':'warn')}</td><td>${t.is_featured?chip('Published','good'):chip('Not public')}</td><td><button class="btn ghost" data-t="${t.id}">Review</button></td></tr>`).join('') +
    `</tbody></table></div>`;
  page('testimonials').querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>testimonialPreview(b.dataset.t));
}

function testimonialPreview(id) {
  const t=S.testimonials.find(x=>x.id===id)||dummyTestimonials[0];
  modal(`<h2>${esc(t.display_name)}</h2><p class="muted">${esc(t.product_name_snapshot)} · ${esc(t.testimonial_format)} · ${esc(t.city||'')}</p><div class="preview-box">${esc(t.testimonial_text)}</div>` +
    `<div class="form-grid" style="margin-top:14px"><label>Public Text<textarea id="ttText">${esc(t.testimonial_text)}</textarea></label><label class="full">Rejection Note<input id="ttReject" placeholder="Alasan penolakan"></label></div>` +
    `<div class="toolbar" style="margin-top:14px"><button id="ttApprove" class="btn primary">Approve (Local)</button><button id="ttRejectBtn" class="btn danger">Reject (Local)</button></div>` +
    `<div class="message" style="margin-top:10px">Preview mode: perubahan tidak tersimpan ke database.</div>`);
  $('#ttApprove').onclick=()=>{msg('Approved (lokal).','success');$('#modal').close();};
  $('#ttRejectBtn').onclick=()=>{msg('Rejected (lokal).','success');$('#modal').close();};
}

async function finance() {
  page('finance').innerHTML = head('FINANCE / PAYMENT','Paid bukan Settled.','Provider belum aktif.',window.AYA_CONFIG?.payment?.enabled?chip('Provider Active','good'):chip('Provider Inactive','warn')) +
    `<div class="grid cols3">${metric('DOKU','Primary Target','AYA Payment Layer')}${metric('Midtrans','Fallback Target','Only if primary unavailable')}${metric('Mark Paid','Unavailable','System-only verification')}</div>` +
    `<div class="section-title"><h2>Setup Checklist</h2><span>sebelum go-live</span></div><div class="card pad"><div class="list">` +
    `<div class="row"><div><b>1. Konfigurasi Payment Provider</b><small>Hubungkan DOKU atau Midtrans di environment variables.</small></div>${chip('Pending','warn')}</div>` +
    `<div class="row"><div><b>2. Aktifkan Payment Flag</b><small>Set AYA_CONFIG.payment.enabled = true.</small></div>${chip('Pending','warn')}</div>` +
    `<div class="row"><div><b>3. Test Transaction</b><small>Lakukan transaksi test end-to-end.</small></div>${chip('Pending','warn')}</div>` +
    `<div class="row"><div><b>4. Settlement Reconciliation</b><small>Pastikan settlement feed tersambung.</small></div>${chip('Pending','warn')}</div></div></div>`;
}

async function access() {
  [S.functions,S.roles,S.admins]=await Promise.all([rows('aya_admin_functions'),rows('aya_admin_roles'),rows('aya_admin_users')]);
  if(!S.roles.length) S.roles=dummyRoles; if(!S.admins.length) S.admins=dummyAdmins;
  page('access').innerHTML = head('USERS & ACCESS','Functions → Roles → Admin Users.','Preview mode — role assignment tidak tersimpan.',can('users.access.manage')?'<button id="newRole" class="btn primary">New Role</button>':'') +
    `<div class="grid cols2"><div class="card pad"><div class="section-title" style="margin-top:0"><h2>Admin Users</h2></div><div class="list">` +
    S.admins.map(a=>`<div class="row"><div><b>${esc(a.display_name||'Admin')}</b><small>${a.is_active?'Active':'Disabled'}</small></div></div>`).join('') +
    `</div></div><div class="card pad"><div class="section-title" style="margin-top:0"><h2>Roles</h2></div><div class="list">` +
    S.roles.map(r=>`<div class="row"><div><b>${esc(r.role_name)}</b><small>${esc(r.description||'')} · ${r.is_system?'System':'Custom'}</small></div></div>`).join('') +
    `</div></div></div>`;
}

async function audit() {
  const {data,error}=sb?await sb.from('aya_admin_audit_log').select('*').order('created_at',{ascending:false}).limit(250):{data:null,error:null};
  const logs=data||[];
  page('audit').innerHTML = head('AUDIT','Siapa mengubah apa, dengan fungsi apa.','Preview mode — log mungkin tidak lengkap.',chip(`${logs.length} events`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Time</th><th>Function</th><th>Entity</th><th>Action</th></tr></thead><tbody>` +
    (logs.length?logs.map(a=>`<tr><td>${new Date(a.created_at).toLocaleString('id-ID')}</td><td><code>${esc(a.effective_function||'')}</code></td><td>${esc(a.entity_type)} · ${esc(a.entity_id||'')}</td><td>${esc(a.action)}</td></tr>`).join(''):'<tr><td colspan="4">No audit events yet.</td></tr>') +
    `</tbody></table></div>`;
}

async function system() {
  const s=(await rows('aya_b2b_qualification_settings'))[0]||{};
  page('system').innerHTML = head('SYSTEM','Capability health dan rule versions.','Technical health check.',chip('Preview','blue')) +
    `<div class="card pad"><div class="provider-line"><div><b>Supabase Auth + RLS</b><small>${sb?'Client initialized':'Not connected — preview mode'}</small></div>${sb?chip('Healthy','good'):chip('Preview','warn')}</div>` +
    `<div class="provider-line"><div><b>B2B qualification</b><small>${esc(s?.active_rule_version||'—')} · evaluation=${esc(s?.evaluation_scope||'—')}</small></div>${s?.qualification_enabled?chip('Enabled','good'):chip('Disabled','warn')}</div>` +
    `<div class="provider-line"><div><b>Payment</b><small>AYA_CONFIG.payment.enabled=${String(window.AYA_CONFIG?.payment?.enabled??false)}</small></div>${chip('Inactive','warn')}</div>` +
    `<div class="provider-line"><div><b>Shipping</b><small>AYA_CONFIG.shipping.enabled=${String(window.AYA_CONFIG?.shipping?.enabled??false)}</small></div>${chip('Inactive','warn')}</div>` +
    `<div class="provider-line"><div><b>Preview Mode</b><small>Admin panel tanpa login untuk UI/UX review.</small></div>${chip('Active','good')}</div></div>`;
}

async function render(n) {
  if(n==='dashboard')return dashboard(); if(n==='cms')return cms(); if(n==='products')return products();
  if(n==='b2c')return b2c(); if(n==='b2b')return b2b(); if(n==='testimonials')return testimonials();
  if(n==='finance')return finance(); if(n==='access')return access(); if(n==='audit')return audit(); if(n==='system')return system();
}

async function boot() {
  S.fx = new Set(previewFx);
  S.previewMode = true;
  if(sb){try{const {data}=await sb.auth.getSession(); if(data.session){S.session=data.session; S.previewMode=false; $('#sessionLabel').textContent=data.session.user.email||'Admin';}}catch(e){}}
  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  renderNav();
  const first = navItems.find(x=>can(x[3]))?.[0] || 'dashboard';
  await go(first);
}

$('#refreshBtn').onclick = () => render(S.page);
$('#toggleLoginBtn').onclick = () => { $('#loginView').hidden=false; $('#appView').hidden=true; };
$('#mobileNavToggle').onclick = () => $('#mobileNavPanel').classList.toggle('open');
$('#modal').onclick = (e) => { if(e.target===$('#modal')) $('#modal').close(); };

// Login form (optional)
$('#loginForm').onsubmit = async e => {
  e.preventDefault();
  $('#loginError').textContent='';
  if(!sb){$('#loginError').textContent='Supabase tidak tersambung.'; return;}
  const {data,error}=await sb.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});
  if(error){$('#loginError').textContent=error.message; return;}
  $('#loginView').hidden=true; $('#appView').hidden=false; boot();
};

document.addEventListener('DOMContentLoaded', () => boot());
})();
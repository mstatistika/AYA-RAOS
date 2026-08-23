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
  fx: new Set(),
  page: 'dashboard',
  previewMode: false,
  products: [], variants: [], b2b: [], measures: [],
  cms: [], testimonials: [], orders: [],
  roles: [], admins: [], users: [],
  b2bInquiries: []
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
  ['history','≡','History','audit.view'],
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

/* ============================================================
   DUMMY DATA
   ============================================================ */
const dummyProducts = [
  {product_id:'SAM-001',product_name:'Sambal Bawang',line_name:'Spice Haven',orderable:true,visible:true},
  {product_id:'SAM-002',product_name:'Sambal Rawang',line_name:'Spice Haven',orderable:true,visible:true},
  {product_id:'BGS-001',product_name:'Bawang Goreng Sumenep',line_name:'Spice Haven',orderable:true,visible:true},
  {product_id:'REN-001',product_name:'Rendang Daging Sapi',line_name:'Spice Haven',orderable:true,visible:true},
  {product_id:'BER-001',product_name:'Beras Pilihan',line_name:'Farm',orderable:true,visible:true},
];
const dummyB2B = [
  {product_id:'SAM-001',supply_eligible:true},
  {product_id:'SAM-002',supply_eligible:true},
  {product_id:'BER-001',supply_eligible:false},
];

const dummyVariants = [
  {variant_id:'v1',product_id:'SAM-001',variant_name:'Original',unit_price:40000},
  {variant_id:'v2',product_id:'SAM-001',variant_name:'Extra Pedas',unit_price:42000},
  {variant_id:'v3',product_id:'SAM-001',variant_name:'Teri',unit_price:45000},
  {variant_id:'v4',product_id:'SAM-001',variant_name:'Ebi',unit_price:48000},
  {variant_id:'v5',product_id:'SAM-002',variant_name:'Original',unit_price:40000},
  {variant_id:'v6',product_id:'BGS-001',variant_name:'100g',unit_price:60000},
  {variant_id:'v7',product_id:'BGS-001',variant_name:'250g',unit_price:120000},
  {variant_id:'v8',product_id:'REN-001',variant_name:'500g',unit_price:105000},
];
const dummyMeasures = [
  {id:'m1',product_id:'SAM-001',variant_name:'Original',unit_label:'jar 200g',base_cost:25000,final_unit_price:40000,commercial_enabled:true},
  {id:'m2',product_id:'SAM-001',variant_name:'Extra Pedas',unit_label:'jar 200g',base_cost:26000,final_unit_price:42000,commercial_enabled:true},
];
const dummyOrders = [
  {id:'ord1',order_number:'AYA-260822-001',customer_name:'Budi Santoso',phone:'081234567890',context:'personal',subtotal_amount:125000,order_status:'confirmed',payment_status:'pending',repeat_count:1},
  {id:'ord2',order_number:'AYA-260822-002',customer_name:'Siti Aminah',phone:'',context:'personal',subtotal_amount:85000,order_status:'delivering',payment_status:'paid',repeat_count:3},
  {id:'ord3',order_number:'AYA-260823-001',customer_name:'Ahmad Fauzi',phone:'082345678901',context:'personal',subtotal_amount:210000,order_status:'received',payment_status:'paid',repeat_count:2},
];
const dummyTestimonials = [
  {id:'t1',display_name:'Rina Wulandari',phone:'081298765432',city:'Jakarta',product_name_snapshot:'Sambal Bawang',testimonial_format:'photo',status:'pending',is_featured:false,testimonial_text:'Sambalnya enak banget, pedasnya pas!'},
  {id:'t2',display_name:'Ahmad Fauzi',phone:'',city:'Bandung',product_name_snapshot:'Bawang Goreng',testimonial_format:'text',status:'approved',is_featured:true,testimonial_text:'Renyah dan gurih, cocok untuk nasi uduk.'},
  {id:'t3',display_name:'Dewi Kusuma',phone:'083312345678',city:'Surabaya',product_name_snapshot:'Rendang',testimonial_format:'video',status:'refine',is_featured:false,testimonial_text:'Dagingnya empuk dan bumbunya meresap.'},
  {id:'t4',display_name:'Budi Santoso',phone:'081234567890',city:'Jakarta',product_name_snapshot:'Sambal Rawang',testimonial_format:'text',status:'draft',is_featured:false,testimonial_text:'Pedasnya nampol, recommended!'},
];
const dummyCMS = [
  {slot_key:'hero_title',label:'Hero Title',area:'homepage',position:'Hero Section',viewport:'1',state:'published',draft_content:{text:'AYA RAOS. Ada Rasa.'},published_content:{text:'AYA RAOS. Ada Rasa.'}},
  {slot_key:'hero_subtitle',label:'Hero Subtitle',area:'homepage',position:'Hero Section',viewport:'1',state:'published',draft_content:{text:'Wilujeng Sumping'},published_content:{text:'Wilujeng Sumping'}},
  {slot_key:'about_text',label:'About Text',area:'homepage',position:'About Section',viewport:'2',state:'published',draft_content:{text:'Rasa yang dekat dengan keseharian.'},published_content:{text:'Rasa yang dekat dengan keseharian.'}},
  {slot_key:'about_values',label:'About Values',area:'homepage',position:'About Section',viewport:'2',state:'draft',draft_content:{text:'Sederhana, Hangat, Jelas'},published_content:{text:''}},
  {slot_key:'lines_title',label:'Lines Title',area:'homepage',position:'Lines Section',viewport:'3',state:'published',draft_content:{text:'Satu keluarga, ada tiga rasa.'},published_content:{text:'Satu keluarga, ada tiga rasa.'}},
  {slot_key:'closing_cta',label:'Closing CTA',area:'homepage',position:'Closing Section',viewport:'4',state:'draft',draft_content:{text:'Mulai dari AYA.'},published_content:{text:''}},
  {slot_key:'footer_tagline',label:'Footer Tagline',area:'footer',position:'Footer',viewport:'4',state:'published',draft_content:{text:'Rasa yang dekat dengan keseharian.'},published_content:{text:'Rasa yang dekat dengan keseharian.'}},
];
const dummyRoles = [
  {id:'r1',role_name:'Super Admin',description:'Full access',is_system:true,access:{dashboard:'ved',cms:'ved',products:'ved',b2c:'ved',b2b:'ved',testimonials:'ved',finance:'ved',access:'ved',history:'ved',system:'ved'}},
  {id:'r2',role_name:'Content Manager',description:'CMS only',is_system:false,access:{dashboard:'v',cms:'ved',products:'v',b2c:'',b2b:'',testimonials:'ve',finance:'',access:'',history:'v',system:''}},
  {id:'r3',role_name:'Order Manager',description:'B2C operations',is_system:false,access:{dashboard:'v',cms:'v',products:'v',b2c:'ved',b2b:'v',testimonials:'v',finance:'v',access:'',history:'v',system:''}},
];
const dummyUsers = [
  {id:'u1',display_name:'Mstatistika',email:'admin@ayaraos.id',phone:'081234567890',role_id:'r1',is_active:true},
  {id:'u2',display_name:'Content Editor',email:'content@ayaraos.id',phone:'',role_id:'r2',is_active:true},
];
const dummyB2BInquiries = [
  {id:'inq1',company_name:'PT Sejahtera',contact_name:'Budi',phone:'081234567890',status:'success',total_items:150,nominal:7500000,frequency:'weekly',shipping_cost:250000,inquiries:[{product:'Sambal Bawang',qty:100,price:40000},{product:'Sambal Rawang',qty:50,price:40000}]},
  {id:'inq2',company_name:'CV Makmur',contact_name:'Siti',phone:'',status:'failed',total_items:80,nominal:3200000,frequency:'monthly',shipping_cost:150000,inquiries:[{product:'Bawang Goreng 100g',qty:80,price:60000}]},
  {id:'inq3',company_name:'UD Abadi',contact_name:'Ahmad',phone:'082345678901',status:'success',total_items:200,nominal:12000000,frequency:'weekly',shipping_cost:300000,inquiries:[{product:'Rendang 500g',qty:100,price:105000},{product:'Beras Pilihan',qty:100,price:15000}]},
];
const dummyHistory = [
  {id:'h1',time:'2026-08-22T14:30:00Z',user:'Mstatistika',action:'Login',entity:'Session',detail:'Admin login via preview mode'},
  {id:'h2',time:'2026-08-22T14:35:00Z',user:'Mstatistika',action:'View',entity:'Product Master',detail:'Viewed product list'},
  {id:'h3',time:'2026-08-22T14:40:00Z',user:'Mstatistika',action:'Edit',entity:'CMS Slot',detail:'Edited hero_title draft'},
];

const missingFeatures = [
  {feature:'Payment Provider (DOKU/Midtrans)',status:'not-started',priority:'high',note:'Belum ada akun payment gateway'},
  {feature:'Shipping Provider Integration',status:'not-started',priority:'high',note:'Belum pilih kurir (JNE/Sicepat/J&T)'},
  {feature:'B2B Inquiry Form Public',status:'not-started',priority:'medium',note:'Form inquiry untuk corporate client'},
  {feature:'Auto WA Notification',status:'not-started',priority:'medium',note:'Kirim notifikasi status order via WA'},
  {feature:'Email Notification',status:'not-started',priority:'low',note:'Order confirmation & newsletter'},
  {feature:'Analytics Dashboard',status:'not-started',priority:'low',note:'Google Analytics / Meta Pixel'},
  {feature:'Stock / Inventory Management',status:'not-started',priority:'medium',note:'Track stok real-time'},
  {feature:'Discount / Voucher System',status:'not-started',priority:'low',note:'Kode promo & diskon'},
  {feature:'Multi-currency Support',status:'not-started',priority:'low',note:'USD, SGD untuk B2B export'},
  {feature:'API Documentation',status:'in-progress',priority:'medium',note:'Swagger / OpenAPI spec'},
];

function page(n) { return $(`[data-page="${n}"]`); }

/* ============================================================
   DASHBOARD
   ============================================================ */
async function dashboard() {
  let t={count:0},o={count:0},b={count:0},c={count:0},m={count:0};
  if(sb){try{[t,o,b,c,m]=await Promise.all([can('testimonial.view')?sb.from('aya_testimonials').select('id',{head:true,count:'exact'}).eq('status','pending'):Promise.resolve({count:0}),can('b2c.view')?sb.from('aya_orders').select('id',{head:true,count:'exact'}):Promise.resolve({count:0}),can('b2b.view')?sb.from('aya_b2b_product_config').select('product_id',{head:true,count:'exact'}).eq('supply_eligible',true):Promise.resolve({count:0}),can('website.view')?sb.from('aya_cms_slots').select('slot_key',{head:true,count:'exact'}):Promise.resolve({count:0}),can('media.view')?sb.from('aya_media_assets').select('id',{head:true,count:'exact'}).eq('lifecycle_status','active'):Promise.resolve({count:0})]);}catch(e){}}
  const tc=t.count??1,oc=o.count??3,bc=b.count??2,mc=m.count??0,cc=c.count??7;
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

/* ============================================================
   CMS
   ============================================================ */
async function cms() {
  S.cms = await rows('aya_cms_slots');
  if(!S.cms.length) S.cms = dummyCMS;
  const areas = [...new Set(S.cms.map(s => s.area))];

  page('cms').innerHTML = head('WEBSITE / CMS','Konten terkontrol + Media Library.','Preview mode — edit tersimpan lokal (tidak ke database).',chip('Preview','warn')) +
    `<div class="subnav"><button class="active" data-cmst="slots">Content Slots</button><button data-cmst="media">Media Library</button></div>` +
    `<div class="toolbar" style="margin:16px 0;gap:8px;display:flex;flex-wrap:wrap;">` +
    `<span style="font-size:11px;color:var(--muted);align-self:center;">Filter area:</span>` +
    `<button class="btn ghost cms-filter active" data-area="all" style="font-size:11px;padding:6px 12px;">All</button>` +
    areas.map(a => `<button class="btn ghost cms-filter" data-area="${esc(a)}" style="font-size:11px;padding:6px 12px;">${esc(a)}</button>`).join('') +
    `</div>` +
    `<div id="cmsSlots"><div class="table-wrap"><table><thead><tr><th>Slot</th><th>Area</th><th>Position</th><th>VP</th><th>State</th><th></th></tr></thead><tbody>` +
    S.cms.map(s => `<tr data-cms-area="${esc(s.area)}"><td><b>${esc(s.label)}</b><div class="muted-line">${esc(s.slot_key)}</div></td><td>${esc(s.area)}</td><td>${esc(s.position)}</td><td>${esc(s.viewport)}</td>` +
    `<td>${s.state==='published'?chip('Published','good'):chip('Draft','warn')}</td><td><button class="btn ghost" data-slot="${esc(s.slot_key)}">Open</button></td></tr>`).join('') +
    `</tbody></table></div></div>` +
    `<div id="cmsMedia" hidden><div class="empty" style="margin-top:20px"><p>Media Library — Preview Mode</p><p class="muted">Upload dan manajemen asset akan tersedia setelah backend terhubung.</p></div></div>`;

  page('cms').querySelectorAll('[data-cmst]').forEach(b => b.onclick = () => {
    page('cms').querySelectorAll('[data-cmst]').forEach(x => x.classList.toggle('active', x === b));
    $('#cmsSlots').hidden = b.dataset.cmst !== 'slots';
    $('#cmsMedia').hidden = b.dataset.cmst !== 'media';
  });

  page('cms').querySelectorAll('.cms-filter').forEach(b => b.onclick = () => {
    page('cms').querySelectorAll('.cms-filter').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const area = b.dataset.area;
    page('cms').querySelectorAll('tbody tr').forEach(tr => {
      tr.style.display = (area === 'all' || tr.dataset.cmsArea === area) ? '' : 'none';
    });
  });

  page('cms').querySelectorAll('[data-slot]').forEach(b => b.onclick = () => openSlotPreview(b.dataset.slot));
}

function openSlotPreview(k) {
  const s = S.cms.find(x => x.slot_key === k) || dummyCMS[0];
  modal(`<h2>${esc(s.label)}</h2><p class="muted">${esc(s.position)} · ${esc(s.viewport)}</p>` +
    `<label>Draft content<textarea id="slotText">${esc(s.draft_content?.text??'')}</textarea></label>` +
    `<label style="display:block;margin-top:10px">Reason<input id="slotReason" placeholder="Alasan perubahan"></label>` +
    `<div class="section-title"><h2>Published</h2><span>current version</span></div>` +
    `<div class="preview-box">${esc(s.published_content?.text??'Belum dipublikasikan.')}</div>` +
    `<div class="toolbar" style="margin-top:14px">` +
    `<button id="saveSlot" class="btn">Save Draft</button>` +
    `<button id="pubSlot" class="btn primary">Publish</button>` +
    `</div>` +
    `<div class="message" style="margin-top:10px">Preview mode: perubahan tidak tersimpan ke database.</div>`);

  $('#saveSlot').onclick = () => { msg('Draft tersimpan (lokal).','success'); $('#modal').close(); };
  $('#pubSlot').onclick = () => { msg('Published (lokal).','success'); $('#modal').close(); };
}

/* ============================================================
   PRODUCTS
   ============================================================ */
async function products() {
  [S.products,S.variants,S.b2b,S.measures] = await Promise.all([
    rows('aya_catalog_products'),rows('aya_catalog_variants'),rows('aya_b2b_product_config'),rows('aya_b2b_measurements')
  ]);
  if(!S.products.length){S.products=dummyProducts;S.variants=dummyVariants;S.b2b=dummyB2B;S.measures=dummyMeasures;}

  page('products').innerHTML = head('PRODUCT MASTER','Satu produk, dua commercial layers.','Preview mode — edit tidak tersimpan ke database.',chip(`${S.products.length} products`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Product</th><th>Line</th><th>B2C</th><th>Variants</th><th>Pasokan</th><th></th></tr></thead><tbody>` +
    S.products.map(p => {
      const b = S.b2b.find(x => x.product_id === p.product_id);
      const vcount = S.variants.filter(v => v.product_id === p.product_id).length;
      return `<tr><td><b>${esc(p.product_name)}</b><div class="muted-line">${esc(p.product_id)}</div></td><td>${esc(p.line_name)}</td>` +
      `<td>${p.orderable?chip('Orderable','good'):chip('Off')}</td><td>${vcount}</td>` +
      `<td>${b?.supply_eligible?chip('Bisa','blue'):chip('Tidak')}</td>` +
      `<td><button class="btn ghost" data-p="${p.product_id}">Edit</button></td></tr>`;
    }).join('') + `</tbody></table></div>`;

  page('products').querySelectorAll('[data-p]').forEach(b => b.onclick = () => openProductEdit(b.dataset.p));
}

function openProductEdit(id) {
  const p = S.products.find(x => x.product_id === id) || dummyProducts[0];
  const b = S.b2b.find(x => x.product_id === id);
  const vs = S.variants.filter(x => x.product_id === id);
  const ms = S.measures.filter(x => x.product_id === id);

  modal(`<h2>${esc(p.product_name)}</h2>` +
    `<div class="form-grid" style="grid-template-columns:repeat(3,1fr);">` +
    `<label>Orderable<select id="ppOrder"><option value="true" ${p.orderable?'selected':''}>Ya</option><option value="false" ${!p.orderable?'selected':''}>Tidak</option></select></label>` +
    `<label>Visible<select id="ppVisible"><option value="true" ${p.visible?'selected':''}>Ya</option><option value="false" ${!p.visible?'selected':''}>Tidak</option></select></label>` +
    `<label>Pasokan<select id="ppSupply"><option value="true" ${b?.supply_eligible?'selected':''}>Bisa</option><option value="false" ${!b?.supply_eligible?'selected':''}>Tidak Bisa</option></select></label>` +
    `</div>` +
    `<div class="section-title"><h2>B2C Variants</h2><span>editable</span></div>` +
    `<div class="list" id="variantList">` +
    vs.map((v,i) => `<div class="row variant-row" data-vi="${i}"><input class="v-name" value="${esc(v.variant_name)}" style="flex:1;border:1px solid transparent;background:transparent;font:inherit;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"><input class="v-price" type="number" value="${v.unit_price}" style="width:100px;text-align:right;border:1px solid transparent;background:transparent;font:inherit;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"></div>`).join('') +
    `</div>` +
    `<button class="btn ghost" id="addVariant" type="button" style="margin-top:8px;font-size:11px;">+ Tambah Variant</button>` +
    `<div class="section-title"><h2>B2B Measurements</h2><span>editable per variant</span></div>` +
    `<div class="list" id="measureList">` +
    ms.map((m,i) => `<div class="row measure-row" data-mi="${i}"><div style="flex:1"><input class="m-variant" value="${esc(m.variant_name)}" style="border:1px solid transparent;background:transparent;font:inherit;width:100%;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"><small><input class="m-unit" value="${esc(m.unit_label)}" style="border:1px solid transparent;background:transparent;font:inherit;width:100%;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"></small></div><div style="text-align:right"><input class="m-base" type="number" value="${m.base_cost}" style="width:80px;border:1px solid transparent;background:transparent;font:inherit;text-align:right;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"><br><input class="m-final" type="number" value="${m.final_unit_price}" style="width:80px;border:1px solid transparent;background:transparent;font:inherit;text-align:right;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"></div></div>`).join('') +
    `</div>` +
    `<button class="btn ghost" id="addMeasure" type="button" style="margin-top:8px;font-size:11px;">+ Tambah Measurement</button>` +
    `<div class="toolbar" style="margin-top:20px"><button id="productSave" class="btn primary">Save</button></div>` +
    `<div class="message" style="margin-top:10px">Preview mode: perubahan tidak tersimpan ke database.</div>`);

  $('#addVariant').onclick = () => {
    const div = document.createElement('div');
    div.className = 'row variant-row';
    div.innerHTML = `<input class="v-name" placeholder="Nama variant" style="flex:1;border:1px solid transparent;background:transparent;font:inherit;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"><input class="v-price" type="number" placeholder="Harga" style="width:100px;text-align:right;border:1px solid transparent;background:transparent;font:inherit;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'">`;
    $('#variantList').appendChild(div);
  };

  $('#addMeasure').onclick = () => {
    const div = document.createElement('div');
    div.className = 'row measure-row';
    div.innerHTML = `<div style="flex:1"><input class="m-variant" placeholder="Variant name" style="border:1px solid transparent;background:transparent;font:inherit;width:100%;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"><small><input class="m-unit" placeholder="Unit label" style="border:1px solid transparent;background:transparent;font:inherit;width:100%;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"></small></div><div style="text-align:right"><input class="m-base" type="number" placeholder="Base" style="width:80px;border:1px solid transparent;background:transparent;font:inherit;text-align:right;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"><br><input class="m-final" type="number" placeholder="Final" style="width:80px;border:1px solid transparent;background:transparent;font:inherit;text-align:right;padding:4px;border-radius:4px;" onfocus="this.style.borderColor='var(--gold)';this.style.background='white'" onblur="this.style.borderColor='transparent';this.style.background='transparent'"></div>`;
    $('#measureList').appendChild(div);
  };

  $('#productSave').onclick = () => { msg('Product updated (lokal).','success'); $('#modal').close(); };
}

/* ============================================================
   B2C OPERATIONS
   ============================================================ */
async function b2c() {
  const {data,error} = sb ? await sb.from('aya_orders').select('*').order('submitted_at',{ascending:false}).limit(100) : {data:null,error:null};
  S.orders = data || dummyOrders;
  if(!S.orders.length) S.orders = dummyOrders;

  page('b2c').innerHTML = head('B2C OPERATIONS','Sekali beli tetap B2C.','Preview mode — order status editable.',chip(`${S.orders.length} orders`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Context</th><th>Subtotal</th><th>Repeat</th><th>Order</th><th>Payment</th></tr></thead><tbody>` +
    S.orders.map(o => {
      const phoneDisplay = o.phone ? `<a href="https://wa.me/${o.phone.replace(/\D/g,'')}" target="_blank" class="wa-link">${esc(o.phone)}</a>` : `<span class="muted">Belum ada WA</span>`;
      return `<tr><td>${esc(o.order_number)}</td><td>${esc(o.customer_name)}</td><td>${phoneDisplay}</td><td>${esc(o.context)}</td><td>${money(o.subtotal_amount)}</td><td>${o.repeat_count}x</td>` +
      `<td>${chip(o.order_status,o.order_status==='received'?'good':o.order_status==='delivering'?'blue':o.order_status==='confirmed'?'warn':'')}</td>` +
      `<td>${chip(o.payment_status,o.payment_status==='paid'?'good':o.payment_status==='refund'?'danger':o.payment_status==='pending'?'warn':'')}</td></tr>`;
    }).join('') +
    `</tbody></table></div>` +
    `<div class="section-title"><h2>Order Status Flow</h2><span>reference</span></div>` +
    `<div class="card pad"><p style="font-size:12px;color:var(--muted);">` +
    `<span style="display:inline-block;margin-right:16px;"><strong>in_cart</strong> → Keranjang</span>` +
    `<span style="display:inline-block;margin-right:16px;"><strong>confirmed</strong> → Dikonfirmasi</span>` +
    `<span style="display:inline-block;margin-right:16px;"><strong>delivering</strong> → Dikirim</span>` +
    `<span style="display:inline-block;margin-right:16px;"><strong>received</strong> → Diterima</span>` +
    `</p></div>` +
    `<div class="section-title"><h2>Payment Status</h2><span>reference</span></div>` +
    `<div class="card pad"><p style="font-size:12px;color:var(--muted);">` +
    `<span style="display:inline-block;margin-right:16px;"><strong>canceled</strong> → Dibatalkan</span>` +
    `<span style="display:inline-block;margin-right:16px;"><strong>pending</strong> → Menunggu</span>` +
    `<span style="display:inline-block;margin-right:16px;"><strong>paid</strong> → Lunas</span>` +
    `<span style="display:inline-block;margin-right:16px;"><strong>refund</strong> → Dikembalikan</span>` +
    `</p></div>`;
}

/* ============================================================
   B2B OPERATIONS
   ============================================================ */
async function b2b() {
  const [cfgs,ms,ths,set,companies,members] = await Promise.all([
    rows('aya_b2b_product_config'),rows('aya_b2b_measurements'),rows('aya_b2b_qualification_thresholds'),
    rows('aya_b2b_qualification_settings'),rows('aya_b2b_companies'),rows('aya_b2b_company_members')
  ]);
  S.b2b = cfgs.length?cfgs:dummyB2B;
  S.measures = ms.length?ms:dummyMeasures;
  S.b2bInquiries = dummyB2BInquiries;
  const settings = set[0]||{};

  page('b2b').innerHTML = head('B2B OPERATIONS','Konfigurasi nyata; lifecycle mengikuti backend.','Preview mode — data sample.',settings?.qualification_enabled?chip('Qualification ON','good'):chip('Qualification OFF','warn')) +
    `<div style="overflow-y:auto;max-height:calc(100vh - 200px);">` +
    `<div class="grid cols4">${metric('Companies',companies.length||0,'B2B identity foundation')}${metric('Company Members',members.length||0,'Individual identities')}${metric('Eligible Products',S.b2b.filter(x=>x.supply_eligible).length,'Explicit config')}${metric('Commercial Enabled',S.measures.filter(x=>x.commercial_enabled).length,'Subject to margin guard')}</div>` +
    `<div class="section-title"><h2>Inquiry Tracker</h2><span>siapa, berapa, frekuensi</span></div>` +
    `<div class="table-wrap"><table><thead><tr><th>Company</th><th>Contact</th><th>Phone</th><th>Status</th><th>Items</th><th>Nominal</th><th>Freq</th><th></th></tr></thead><tbody>` +
    S.b2bInquiries.map(iq => {
      const phoneDisplay = iq.phone ? `<a href="https://wa.me/${iq.phone.replace(/\D/g,'')}" target="_blank" class="wa-link">${esc(iq.phone)}</a>` : `<span class="muted">Belum ada WA</span>`;
      return `<tr><td><b>${esc(iq.company_name)}</b></td><td>${esc(iq.contact_name)}</td><td>${phoneDisplay}</td>` +
      `<td>${chip(iq.status,iq.status==='success'?'good':'danger')}</td><td>${iq.total_items}</td><td>${money(iq.nominal)}</td><td>${esc(iq.frequency)}</td>` +
      `<td><button class="btn ghost" data-inq="${esc(iq.id)}">Detail</button></td></tr>`;
    }).join('') +
    `</tbody></table></div>` +
    `<div class="section-title"><h2>Measurements</h2><span>economics backend-owned</span></div>` +
    `<div class="table-wrap"><table><thead><tr><th>Product</th><th>Variant</th><th>Unit</th><th>Base Cost</th><th>Final Price</th><th>Enabled</th></tr></thead><tbody>` +
    S.measures.map(m => `<tr><td>${esc(m.product_id)}</td><td>${esc(m.variant_name)}</td><td>${esc(m.unit_label)}</td><td>${money(m.base_cost)}</td><td>${money(m.final_unit_price)}</td><td>${m.commercial_enabled?chip('Yes','good'):chip('No')}</td></tr>`).join('') +
    `</tbody></table></div></div>`;

  page('b2b').querySelectorAll('[data-inq]').forEach(b => b.onclick = () => openInquiryDetail(b.dataset.inq));
}

function openInquiryDetail(id) {
  const iq = S.b2bInquiries.find(x => x.id === id) || dummyB2BInquiries[0];
  modal(`<h2>${esc(iq.company_name)}</h2><p class="muted">${esc(iq.contact_name)} · ${iq.phone?esc(iq.phone):'No phone'} · ${esc(iq.frequency)}</p>` +
    `<div class="grid cols3" style="margin:16px 0;">${metric('Total Items',iq.total_items,'pcs')}${metric('Nominal',money(iq.nominal),'total')}${metric('Shipping',money(iq.shipping_cost),'cost')}</div>` +
    `<div class="section-title"><h2>Inquiry Items</h2><span>detail</span></div>` +
    `<div class="list">${iq.inquiries.map(it => `<div class="row"><div><b>${esc(it.product)}</b></div><div>${it.qty} pcs × ${money(it.price)} = <strong>${money(it.qty*it.price)}</strong></div></div>`).join('')}</div>` +
    `<div class="toolbar" style="margin-top:14px"><button id="inqClose" class="btn primary">Tutup</button></div>`);
  $('#inqClose').onclick = () => $('#modal').close();
}

/* ============================================================
   TESTIMONIALS
   ============================================================ */
async function testimonials() {
  const {data,error} = sb ? await sb.from('aya_testimonials').select('*').order('submitted_at',{ascending:false}) : {data:null,error:null};
  S.testimonials = data || dummyTestimonials;
  if(!S.testimonials.length) S.testimonials = dummyTestimonials;

  page('testimonials').innerHTML = head('TESTIMONIALS','Moderate dulu. Publish kemudian.','Preview mode — moderation tidak tersimpan.',chip(`${S.testimonials.length} submissions`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Name</th><th>WA</th><th>City</th><th>Product</th><th>Format</th><th>State</th><th></th></tr></thead><tbody>` +
    S.testimonials.map(t => {
      const waDisplay = t.phone ? `<a href="https://wa.me/${t.phone.replace(/\D/g,'')}" target="_blank" class="wa-link">${esc(t.phone)}</a>` : `<span class="muted">Belum ada WA</span>`;
      const stateChip = t.status==='approved'||t.status==='published'?chip('Published','good'):t.status==='rejected'?chip('Rejected','danger'):t.status==='refine'?chip('Refine','warn'):chip('Draft','');
      return `<tr><td>${esc(t.display_name)}</td><td>${waDisplay}</td><td>${esc(t.city||'')}</td><td>${esc(t.product_name_snapshot)}</td><td>${esc(t.testimonial_format)}</td><td>${stateChip}</td><td><button class="btn ghost" data-t="${t.id}">Review</button></td></tr>`;
    }).join('') +
    `</tbody></table></div>`;

  page('testimonials').querySelectorAll('[data-t]').forEach(b => b.onclick = () => testimonialReview(b.dataset.t));
}

function testimonialReview(id) {
  const t = S.testimonials.find(x => x.id === id) || dummyTestimonials[0];
  const isText = t.testimonial_format === 'text';
  const isPhoto = t.testimonial_format === 'photo';
  const isVideo = t.testimonial_format === 'video';

  let mediaSection = '';
  if(isPhoto) {
    mediaSection = `<div class="section-title"><h2>Photo</h2><span>asset</span></div>` +
      `<div class="preview-box" style="min-height:120px;display:flex;align-items:center;justify-content:center;color:var(--muted);">[Photo Preview Placeholder]</div>` +
      `<div class="toolbar" style="margin-top:10px;gap:8px;"><button class="btn ghost" id="ttDownload">Download Photo</button><button class="btn ghost" id="ttUpload">Upload Refine</button></div>`;
  } else if(isVideo) {
    mediaSection = `<div class="section-title"><h2>Video</h2><span>with name & address overlay</span></div>` +
      `<div class="preview-box" style="min-height:120px;display:flex;align-items:center;justify-content:center;color:var(--muted);">[Video Preview: ${esc(t.display_name)} — ${esc(t.city||'')}]</div>` +
      `<div class="toolbar" style="margin-top:10px;gap:8px;"><button class="btn ghost" id="ttDownload">Download Video</button><button class="btn ghost" id="ttUpload">Upload Refine</button></div>`;
  }

  modal(`<h2>${esc(t.display_name)}</h2><p class="muted">${esc(t.product_name_snapshot)} · ${esc(t.testimonial_format)} · ${esc(t.city||'')}</p>` +
    `<label>Public Text<textarea id="ttText">${esc(t.testimonial_text)}</textarea></label>` +
    mediaSection +
    `<div class="toolbar" style="margin-top:20px;gap:10px;">` +
    `<button id="ttSave" class="btn">Save</button>` +
    `<button id="ttPublish" class="btn primary">Publish</button>` +
    `</div>` +
    `<div class="message" style="margin-top:10px">Preview mode: perubahan tidak tersimpan ke database.</div>`);

  $('#ttSave').onclick = () => { msg('Saved (lokal).','success'); };
  $('#ttPublish').onclick = () => { msg('Published (lokal).','success'); $('#modal').close(); };
  if($('#ttDownload')) $('#ttDownload').onclick = () => msg('Download started (dummy).','success');
  if($('#ttUpload')) $('#ttUpload').onclick = () => msg('Upload dialog (dummy).','success');
}

/* ============================================================
   FINANCE
   ============================================================ */
async function finance() {
  page('finance').innerHTML = head('FINANCE / PAYMENT','Paid bukan Settled.','Provider belum aktif.',window.AYA_CONFIG?.payment?.enabled?chip('Provider Active','good'):chip('Provider Inactive','warn')) +
    `<div class="grid cols3">${metric('DOKU','Primary Target','AYA Payment Layer')}${metric('Midtrans','Fallback Target','Only if primary unavailable')}${metric('Mark Paid','Unavailable','System-only verification')}</div>` +
    `<div class="section-title"><h2>Setup Checklist</h2><span>sebelum go-live</span></div>` +
    `<div class="card pad"><div class="list">` +
    `<div class="row"><div><b>1. Konfigurasi Payment Provider</b><small>Hubungkan DOKU atau Midtrans di environment variables.</small></div>${chip('Pending','warn')}</div>` +
    `<div class="row"><div><b>2. Aktifkan Payment Flag</b><small>Set AYA_CONFIG.payment.enabled = true.</small></div>${chip('Pending','warn')}</div>` +
    `<div class="row"><div><b>3. Test Transaction</b><small>Lakukan transaksi test end-to-end.</small></div>${chip('Pending','warn')}</div>` +
    `<div class="row"><div><b>4. Settlement Reconciliation</b><small>Pastikan settlement feed tersambung.</small></div>${chip('Pending','warn')}</div>` +
    `</div></div>`;
}

/* ============================================================
   USERS & ACCESS (REWORKED)
   ============================================================ */
async function access() {
  [S.roles,S.users] = await Promise.all([rows('aya_admin_roles'),rows('aya_admin_users')]);
  if(!S.roles.length) S.roles = dummyRoles;
  if(!S.users.length) S.users = dummyUsers;

  const accessLabels = {v:'View',e:'Edit',d:'Delete',c:'Create'};
  const pages = ['dashboard','cms','products','b2c','b2b','testimonials','finance','access','history','system'];

  page('access').innerHTML = head('USERS & ACCESS','Functions → Roles → Admin Users.','Preview mode — tidak tersimpan.',can('users.access.manage')?'<button id="newRoleBtn" class="btn primary">New Role</button>':'') +
    `<div class="subnav" style="margin-bottom:16px;"><button class="active" data-acct="roles">Roles</button><button data-acct="users">Users</button></div>` +
    `<div id="accessRoles">` +
    `<div class="table-wrap"><table><thead><tr><th>Role</th><th>Description</th><th>Type</th><th>Access Summary</th><th></th></tr></thead><tbody>` +
    S.roles.map(r => {
      const accessCount = Object.values(r.access||{}).filter(a => a).length;
      return `<tr><td><b>${esc(r.role_name)}</b></td><td>${esc(r.description||'')}</td><td>${r.is_system?chip('System','good'):chip('Custom','blue')}</td><td>${accessCount} permissions</td><td><button class="btn ghost" data-role="${esc(r.id)}">Edit Access</button></td></tr>`;
    }).join('') +
    `</tbody></table></div></div>` +
    `<div id="accessUsers" hidden>` +
    `<div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th></tr></thead><tbody>` +
    S.users.map(u => {
      const role = S.roles.find(r => r.id === u.role_id);
      const phoneDisplay = u.phone ? `<a href="https://wa.me/${u.phone.replace(/\D/g,'')}" target="_blank" class="wa-link">${esc(u.phone)}</a>` : `<span class="muted">—</span>`;
      return `<tr><td><b>${esc(u.display_name)}</b></td><td>${esc(u.email)}</td><td>${phoneDisplay}</td><td>${esc(role?.role_name||'—')}</td><td>${u.is_active?chip('Active','good'):chip('Disabled')}</td></tr>`;
    }).join('') +
    `</tbody></table></div></div>`;

  page('access').querySelectorAll('[data-acct]').forEach(b => b.onclick = () => {
    page('access').querySelectorAll('[data-acct]').forEach(x => x.classList.toggle('active', x === b));
    $('#accessRoles').hidden = b.dataset.acct !== 'roles';
    $('#accessUsers').hidden = b.dataset.acct !== 'users';
  });

  page('access').querySelectorAll('[data-role]').forEach(b => b.onclick = () => openRoleEdit(b.dataset.role));
  if($('#newRoleBtn')) $('#newRoleBtn').onclick = () => openRoleEdit('new');
}

function openRoleEdit(roleId) {
  const isNew = roleId === 'new';
  const r = isNew ? {id:'new',role_name:'',description:'',is_system:false,access:{}} : (S.roles.find(x => x.id === roleId) || dummyRoles[0]);
  const pages = [
    {key:'dashboard',label:'Dashboard'},{key:'cms',label:'Website / CMS'},{key:'products',label:'Product Master'},
    {key:'b2c',label:'B2C Operations'},{key:'b2b',label:'B2B Operations'},{key:'testimonials',label:'Testimonials'},
    {key:'finance',label:'Finance'},{key:'access',label:'Users & Access'},{key:'history',label:'History'},{key:'system',label:'System'}
  ];

  modal(`<h2>${isNew?'New Role':esc(r.role_name)}</h2>` +
    `<label>Role Name<input id="roleName" value="${esc(r.role_name)}"></label>` +
    `<label>Description<input id="roleDesc" value="${esc(r.description||'')}"></label>` +
    `<div class="section-title"><h2>Access Matrix</h2><span>v=view, e=edit, d=delete, c=create</span></div>` +
    `<div class="list">${pages.map(p => {
      const access = r.access?.[p.key] || '';
      return `<div class="row" style="align-items:center;"><b style="flex:1">${p.label}</b>` +
        `<label style="display:flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" class="acc-v" data-p="${p.key}" ${access.includes('v')?'checked':''}> View</label>` +
        `<label style="display:flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" class="acc-e" data-p="${p.key}" ${access.includes('e')?'checked':''}> Edit</label>` +
        `<label style="display:flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" class="acc-d" data-p="${p.key}" ${access.includes('d')?'checked':''}> Delete</label>` +
        `<label style="display:flex;align-items:center;gap:4px;font-size:11px;margin:0;"><input type="checkbox" class="acc-c" data-p="${p.key}" ${access.includes('c')?'checked':''}> Create</label>` +
        `</div>`;
    }).join('')}</div>` +
    `<div class="toolbar" style="margin-top:20px"><button id="roleSave" class="btn primary">Save Role</button></div>` +
    `<div class="message" style="margin-top:10px">Preview mode: perubahan tidak tersimpan.</div>`);

  $('#roleSave').onclick = () => { msg('Role saved (lokal).','success'); $('#modal').close(); };
}

/* ============================================================
   HISTORY (was Audit)
   ============================================================ */
async function history() {
  const {data,error} = sb ? await sb.from('aya_admin_audit_log').select('*').order('created_at',{ascending:false}).limit(250) : {data:null,error:null};
  const logs = data || dummyHistory;

  page('history').innerHTML = head('HISTORY','Riwayat aktivitas di panel admin.','Preview mode — log mungkin tidak lengkap.',chip(`${logs.length} events`,'good')) +
    `<div class="table-wrap"><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Detail</th></tr></thead><tbody>` +
    (logs.length?logs.map(h => `<tr><td>${new Date(h.time).toLocaleString('id-ID')}</td><td>${esc(h.user)}</td><td>${chip(h.action,'blue')}</td><td>${esc(h.entity)}</td><td>${esc(h.detail)}</td></tr>`).join(''):'<tr><td colspan="5">No history yet.</td></tr>') +
    `</tbody></table></div>`;
}

/* ============================================================
   SYSTEM — Missing Features Tracker
   ============================================================ */
async function system() {
  page('system').innerHTML = head('SYSTEM','Fitur yang belum di-implementasi.','Track progress pengembangan.',chip('Tracker','blue')) +
    `<div class="section-title"><h2>Missing Features</h2><span>apa yang kurang</span></div>` +
    `<div class="table-wrap"><table><thead><tr><th>Feature</th><th>Priority</th><th>Status</th><th>Note</th></tr></thead><tbody>` +
    missingFeatures.map(f => `<tr><td><b>${esc(f.feature)}</b></td><td>${chip(f.priority,f.priority==='high'?'danger':f.priority==='medium'?'warn':'')}</td>` +
    `<td>${chip(f.status,f.status==='done'?'good':f.status==='in-progress'?'blue':'')}</td><td>${esc(f.note)}</td></tr>`).join('') +
    `</tbody></table></div>` +
    `<div class="section-title"><h2>Health Check</h2><span>technical</span></div>` +
    `<div class="card pad">` +
    `<div class="provider-line"><div><b>Supabase Auth + RLS</b><small>${sb?'Client initialized':'Not connected'}</small></div>${sb?chip('Healthy','good'):chip('Preview','warn')}</div>` +
    `<div class="provider-line"><div><b>Payment</b><small>AYA_CONFIG.payment.enabled=${String(window.AYA_CONFIG?.payment?.enabled??false)}</small></div>${chip('Inactive','warn')}</div>` +
    `<div class="provider-line"><div><b>Shipping</b><small>AYA_CONFIG.shipping.enabled=${String(window.AYA_CONFIG?.shipping?.enabled??false)}</small></div>${chip('Inactive','warn')}</div>` +
    `<div class="provider-line"><div><b>Preview Mode</b><small>Admin panel tanpa login untuk UI/UX review.</small></div>${chip('Active','good')}</div>` +
    `</div>`;
}

async function render(n) {
  if(n==='dashboard')return dashboard(); if(n==='cms')return cms(); if(n==='products')return products();
  if(n==='b2c')return b2c(); if(n==='b2b')return b2b(); if(n==='testimonials')return testimonials();
  if(n==='finance')return finance(); if(n==='access')return access(); if(n==='history')return history(); if(n==='system')return system();
}

async function boot() {
  if(sb){try{const {data}=await sb.auth.getSession(); if(data.session){S.session=data.session; S.previewMode=false; await loadUserPermissions(data.session.user.id); $('#sessionLabel').textContent=data.session.user.email||'Admin'; $('#toggleLoginBtn').textContent='Logout'; $('#toggleLoginBtn').onclick=()=>{sb.auth.signOut(); location.reload();}; $('#previewToggleBtn').style.display='none'; showApp(); return;}}catch(e){console.warn('Session check failed',e);}}
  $('#loginView').hidden=false; $('#appView').hidden=true; $('#sessionLabel').textContent='Please login';
  $('#previewToggleBtn').style.display='inline-block'; $('#previewToggleBtn').onclick=()=>{S.fx=new Set(previewFx); S.previewMode=true; $('#sessionLabel').textContent='Preview Mode'; $('#toggleLoginBtn').style.display='none'; showApp();};
  $('#loginForm').onsubmit=async(e)=>{e.preventDefault(); try{const {data,error}=await sb.auth.signInWithPassword({email:$('#loginEmail').value, password:$('#loginPassword').value}); if(error) throw error; S.session=data.session; S.previewMode=false; await loadUserPermissions(data.session.user.id); $('#sessionLabel').textContent=data.session.user.email; $('#toggleLoginBtn').textContent='Logout'; $('#toggleLoginBtn').onclick=()=>{sb.auth.signOut(); location.reload();}; $('#previewToggleBtn').style.display='none'; showApp();}catch(err){$('#loginError').textContent=err.message||'Login failed';}};
}

function showApp() {
  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  renderNav();
  const first = navItems.find(x => can(x[3]))?.[0] || 'dashboard';
  go(first);
}

async function loadUserPermissions(userId) {
  if(!sb || !userId) return;
  try {
    const {data: userRoles} = await sb.from('aya_admin_user_roles').select('role_id').eq('user_id', userId);
    if(!userRoles?.length){S.fx=new Set(); return;}
    const roleIds = userRoles.map(ur => ur.role_id);
    const {data: roleFuncs} = await sb.from('aya_admin_role_functions').select('function_id').in('role_id', roleIds);
    if(!roleFuncs?.length){S.fx=new Set(); return;}
    const funcIds = roleFuncs.map(rf => rf.function_id);
    const {data: functions} = await sb.from('aya_admin_functions').select('function_code').in('id', funcIds);
    S.fx = new Set((functions || []).map(f => f.function_code));
  } catch(e) {
    console.warn('Permission load failed', e);
    S.fx = new Set();
  }
}
async function boot() {
  S.fx = new Set(previewFx);
  // Removed: auto preview mode — now handled in boot()
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
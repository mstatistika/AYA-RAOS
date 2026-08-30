(() => {
'use strict';
// Shared client from auth.js — never create a second GoTrueClient (breaks login/forgot-password).
const getSb=()=>{const c=window.AYA_ADMIN_AUTH;if(!c)throw new Error('Admin auth belum siap');return c;};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>n==null||Number.isNaN(Number(n))?'—':new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n));
const chip=(v,c='')=>`<span class="chip ${c}">${esc(v)}</span>`;
const num=(v,fallback=null)=>{if(v===null||v===undefined||String(v).trim()==='')return fallback;const n=Number(v);return Number.isFinite(n)?n:fallback;};
const head=`<div class="page-head"><div><span class="eyebrow">PRODUCT MASTER</span><h1>Identity + B2C + B2B commercial model.</h1><p>Product Master adalah identity authority. Add Product sekarang membuat konfigurasi internal lengkap, tetapi storefront publik tetap tidak otomatis berubah sampai Publish Layer diaktifkan.</p></div><div class="head-actions"><button id="pmNew" class="btn primary">Add Product</button></div></div>`;
async function q(t){const{data,error}=await getSb().from(t).select('*');if(error)throw error;return data||[]}
async function render(){
  const el=document.querySelector('[data-page="products"]');
  if(!el||!el.classList.contains('active'))return;
  try{
    const{data:{session}}=await getSb().auth.getSession();if(!session)return;
    const [master,vars,catalog,cvars,b2b,measures,costs]=await Promise.all([
      q('aya_product_master'),q('aya_product_variants'),q('aya_catalog_products'),q('aya_catalog_variants'),q('aya_b2b_product_config'),q('aya_b2b_measurements'),q('aya_b2b_measurement_cost_components')
    ]);
    el.innerHTML=head+`<div class="message">Add Product menyimpan Product Master, initial variant, B2C commercial data, B2B config, Base Cost/COGS, dan measurement. Foto disimpan di private Admin Media. Storefront publik tetap aman karena tidak auto-publish.</div><div class="table-wrap"><table><thead><tr><th>Product</th><th>Line</th><th>Category</th><th>Master</th><th>B2C</th><th>B2B</th><th></th></tr></thead><tbody>${master.map(p=>{const c=catalog.find(x=>x.product_id===p.product_id),b=b2b.find(x=>x.product_id===p.product_id),pm=measures.filter(x=>x.product_id===p.product_id);return `<tr><td><b>${esc(p.product_name)}</b><div class="muted-line">${esc(p.product_id)}${p.image_path?' · photo':''}</div></td><td>${esc(p.line_name)}</td><td>${esc(p.category_name)}</td><td>${p.active?chip('Active','good'):chip('Inactive')}</td><td>${c?chip(`${c.public_status} · ${c.orderable?'Orderable':'Off'}`,c.public_status==='Tersedia'?'good':c.public_status==='Pre-order'?'warn':'danger'):chip('Not configured','warn')}</td><td>${b?.supply_eligible?chip(`${pm.length} unit · Eligible`,'blue'):chip(`${pm.length} unit · Not eligible`)}</td><td><button class="btn ghost" data-pm="${esc(p.product_id)}">Open</button></td></tr>`}).join('')}</tbody></table></div>`;
    const data={master,vars,catalog,cvars,b2b,measures,costs};
    el.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>openProduct(b.dataset.pm,data));
    el.querySelector('#pmNew').onclick=()=>openNew();
  }catch(e){el.innerHTML=head+`<div class="message error">Product Master gagal dimuat: ${esc(e.message)}</div>`}
}
function modal(html){document.querySelector('#modalBody').innerHTML=html;document.querySelector('#modal').showModal()}
function notify(m,t=''){const e=document.querySelector('#globalMessage');e.hidden=false;e.className=`message ${t}`;e.textContent=m;setTimeout(()=>e.hidden=true,6500)}
function unitOptions(){return `<datalist id="unitOptions"><option value="Botol"><option value="Pouch"><option value="Toples"><option value="Paket"><option value="Pcs"><option value="Box"><option value="Tray"><option value="g"><option value="kg"><option value="ml"><option value="Liter"></datalist>`}
function setCalc(){
  const base=num(document.querySelector('#nBase')?.value,0)||0;
  const extra=num(document.querySelector('#nAdditional')?.value,0)||0;
  const final=num(document.querySelector('#nFinal')?.value,0)||0;
  const cogs=base+extra;
  const recommended=cogs+5000;
  const supply=Math.max(0,final-2000);
  const margin=supply-cogs;
  const set=(id,value,klass='')=>{const x=document.querySelector(id);if(x){x.textContent=value;x.className=klass;}};
  set('#calcCogs',money(cogs));
  set('#calcRecommended',money(recommended));
  set('#calcSupply',money(supply));
  set('#calcMargin',money(margin),margin>0?'calc-good':'calc-danger');
  const hint=document.querySelector('#marginHint');
  if(hint){hint.textContent=margin>0?'Margin valid. B2B Commercial dapat diaktifkan.':'Margin harus > 0 untuk mengaktifkan B2B Commercial.';hint.className=`muted-line ${margin>0?'calc-good':'calc-danger'}`;}
}
function openNew(){
  modal(`<div class="product-create"><div class="create-title"><div><span class="eyebrow">PRODUCT MASTER</span><h2>Add Product</h2><p class="muted-line">Satu flow untuk identity, foto, B2C, biaya/COGS, dan B2B.</p></div></div>
  <div class="create-section"><div class="section-title"><h2>1. Product Identity</h2><span>internal master</span></div><div class="create-photo-row"><div class="product-image-box"><img id="productImagePreview" alt="Preview product" hidden><div class="image-placeholder">PHOTO</div></div><div><input id="productImageInput" type="file" accept="image/jpeg,image/png,image/webp" hidden><button id="productImageButton" class="btn" type="button">Choose Photo</button><p class="muted-line">JPG, PNG, WebP · max 5 MB</p></div></div><div class="form-grid"><label>Product ID<input id="nId" placeholder="produk-baru" autocomplete="off"></label><label>Product Name<input id="nName" autocomplete="off"></label><label>Line<select id="nLine"><option>AYA Spice Haven</option><option>AYA Farm</option><option>AYA Snacks & Drinks</option></select></label><label>Category<input id="nCat" autocomplete="off"></label><label>Active<select id="nActive"><option value="true">Ya</option><option value="false">Tidak</option></select></label><label>Initial Variant<input id="nVariant" placeholder="Original / 250 g / Paket" autocomplete="off"></label></div></div>
  <div class="create-section"><div class="section-title"><h2>2. B2C Commercial</h2><span>tidak auto-publish</span></div><div class="form-grid"><label>Measurement Unit B2C<input id="nB2cUnit" list="unitOptions" placeholder="Botol / Pouch / Pcs"></label><label>Final Unit Price / B2C Price<input id="nFinal" type="number" min="0" step="1000" inputmode="numeric" placeholder="0"></label><label>Public Status<select id="nStatus"><option value="Habis">Habis</option><option value="Pre-order">Pre-order</option><option value="Tersedia">Tersedia</option></select></label><label>Minimum Quantity<input id="nMinQty" type="number" min="1" step="1" value="1" inputmode="numeric"></label><label>Visible<select id="nVisible"><option value="false">Tidak</option><option value="true">Ya</option></select></label><label>Orderable<select id="nOrderable"><option value="false">Tidak</option><option value="true">Ya</option></select></label></div><div class="message compact">Default aman: <b>Habis + Hidden + Not orderable</b>. Mengisi B2C di sini belum mengubah locked storefront source.</div></div>
  <div class="create-section"><div class="section-title"><h2>3. Cost & COGS</h2><span>internal only</span></div><div class="form-grid"><label>Base Cost<input id="nBase" type="number" min="0" step="1000" inputmode="numeric" placeholder="0"></label><label>Additional Cost<input id="nAdditional" type="number" min="0" step="1000" inputmode="numeric" value="0"></label></div><div class="econ-grid"><div><small>COGS</small><strong id="calcCogs">Rp0</strong><span>Base + Additional</span></div><div><small>Recommended</small><strong id="calcRecommended">Rp5.000</strong><span>COGS + Rp5.000</span></div><div><small>Supply Price</small><strong id="calcSupply">Rp0</strong><span>Final − Rp2.000</span></div><div><small>Margin</small><strong id="calcMargin">Rp0</strong><span>Supply − COGS</span></div></div><p id="marginHint" class="muted-line calc-danger">Margin harus &gt; 0 untuk mengaktifkan B2B Commercial.</p></div>
  <div class="create-section"><div class="section-title"><h2>4. B2B Detail</h2><span>Pasokan Usaha</span></div><div class="form-grid"><label>Pasokan Eligible<select id="nSupply"><option value="false">Tidak</option><option value="true">Ya</option></select></label><label>Product Class<select id="nClass"><option value="standard">Standard</option><option value="rice">Rice / Beras</option></select></label><label>Measurement Unit B2B<input id="nB2bUnit" list="unitOptions" placeholder="Kosong = sama dengan B2C"></label><label>Kg per Unit <span class="optional">(optional)</span><input id="nKg" type="number" min="0" step="0.001" inputmode="decimal" placeholder="contoh 5"></label><label>Commercial<select id="nCommercial"><option value="false">Disabled</option><option value="true">Enabled</option></select></label></div><div class="message compact"><b>Minimum B2B mengikuti Product Class:</b> Standard = nilai commitment per cadence; Rice = minimum kg per cadence. Supply Price dan margin tetap dihitung sistem.</div></div>
  ${unitOptions()}
  <div class="create-actions"><button id="nSave" class="btn primary" type="button">Create Complete Product</button><span id="nSaveState" class="muted-line"></span></div></div>`);
  window.AYA_ADMIN_PRODUCT_MEDIA?.mount();
  ['#nBase','#nAdditional','#nFinal'].forEach(s=>document.querySelector(s)?.addEventListener('input',setCalc));
  document.querySelector('#nB2cUnit')?.addEventListener('input',e=>{const b=document.querySelector('#nB2bUnit');if(b&&!b.dataset.edited)b.value=e.target.value;});
  document.querySelector('#nB2bUnit')?.addEventListener('input',e=>{e.target.dataset.edited='1';});
  setCalc();
  document.querySelector('#nSave').onclick=async()=>{
    const button=document.querySelector('#nSave'),state=document.querySelector('#nSaveState');
    const productId=document.querySelector('#nId').value.trim();
    const name=document.querySelector('#nName').value.trim();
    const category=document.querySelector('#nCat').value.trim();
    const variant=document.querySelector('#nVariant').value.trim();
    const b2cUnit=document.querySelector('#nB2cUnit').value.trim();
    const b2bUnit=document.querySelector('#nB2bUnit').value.trim()||b2cUnit;
    const finalPrice=num(document.querySelector('#nFinal').value,null);
    const baseCost=num(document.querySelector('#nBase').value,null);
    const additional=num(document.querySelector('#nAdditional').value,0)||0;
    if(!productId||!name||!category||!variant||!b2cUnit){notify('Product ID, Product Name, Category, Initial Variant, dan Measurement Unit B2C wajib diisi.','error');return;}
    if(finalPrice===null||finalPrice<=0){notify('Final Unit Price / B2C Price harus lebih dari 0.','error');return;}
    if(baseCost===null||baseCost<0){notify('Base Cost wajib diisi dan tidak boleh negatif.','error');return;}
    button.disabled=true;button.textContent='Creating...';state.textContent='Menyimpan Product Master + commercial layers...';
    try{
      const payload={
        p_product_id:productId,
        p_product_name:name,
        p_line_name:document.querySelector('#nLine').value,
        p_category_name:category,
        p_active:document.querySelector('#nActive').value==='true',
        p_variant_name:variant,
        p_b2c_unit_label:b2cUnit,
        p_final_unit_price:finalPrice,
        p_public_status:document.querySelector('#nStatus').value,
        p_visible:document.querySelector('#nVisible').value==='true',
        p_orderable:document.querySelector('#nOrderable').value==='true',
        p_min_quantity:num(document.querySelector('#nMinQty').value,1)||1,
        p_product_class:document.querySelector('#nClass').value,
        p_supply_eligible:document.querySelector('#nSupply').value==='true',
        p_b2b_unit_label:b2bUnit,
        p_quantity_in_kg_per_unit:num(document.querySelector('#nKg').value,null),
        p_base_cost:baseCost,
        p_additional_cost:additional,
        p_commercial_enabled:document.querySelector('#nCommercial').value==='true'
      };
      const{data,error}=await getSb().rpc('aya_admin_create_product_complete',payload);if(error)throw error;
      const file=window.AYA_ADMIN_PRODUCT_MEDIA?.state?.selected;
      if(file){
        state.textContent='Mengunggah foto produk...';
        try{await window.AYA_ADMIN_PRODUCT_MEDIA.uploadProductImage(productId,file);}catch(imageError){notify(`Product berhasil dibuat, tetapi foto gagal diunggah: ${imageError.message}`,'error');document.querySelector('#modal').close();await render();return;}
      }
      notify(`Product dibuat. COGS ${money(data?.cogs)} · Supply ${money(data?.supplyPrice)} · Margin ${money(data?.margin)}.`,'success');
      window.AYA_ADMIN_PRODUCT_MEDIA?.clearSelection();
      document.querySelector('#modal').close();await render();
    }catch(e){notify(e.message,'error');button.disabled=false;button.textContent='Create Complete Product';state.textContent='';}
  };
}
function economics(m,costs){
  const extra=costs.filter(c=>c.measurement_id===m.id&&c.active).reduce((a,x)=>a+Number(x.amount||0),0);
  const base=m.base_cost==null?null:Number(m.base_cost);
  const cogs=base==null?null:base+extra;
  const final=m.final_unit_price==null?null:Number(m.final_unit_price);
  const recommended=cogs==null?null:cogs+5000;
  const supply=final==null?null:final-2000;
  const margin=cogs==null||supply==null?null:supply-cogs;
  return{extra,cogs,recommended,supply,margin};
}
async function openProduct(id,d){
  const p=d.master.find(x=>x.product_id===id),vs=d.vars.filter(x=>x.product_id===id&&x.status!=='archived'),c=d.catalog.find(x=>x.product_id===id),cv=d.cvars.filter(x=>x.product_id===id),b=d.b2b.find(x=>x.product_id===id),ms=d.measures.filter(x=>x.product_id===id);
  modal(`<h2>${esc(p.product_name)}</h2><div class="create-photo-row"><div class="product-image-box"><img id="productImagePreview" alt="${esc(p.image_alt||p.product_name)}" hidden><div class="image-placeholder">${p.image_path?'PHOTO':'NO PHOTO'}</div></div><div><input id="productImageInput" type="file" accept="image/jpeg,image/png,image/webp" hidden><button id="productImageButton" class="btn" type="button">${p.image_path?'Replace Photo':'Add Photo'}</button><button id="pImageSave" class="btn ghost" type="button" style="margin-left:6px">Save Photo</button><p class="muted-line">Private Admin Media · JPG/PNG/WebP</p></div></div><div class="form-grid"><label>Name<input id="pName" value="${esc(p.product_name)}"></label><label>Line<select id="pLine"><option ${p.line_name==='AYA Spice Haven'?'selected':''}>AYA Spice Haven</option><option ${p.line_name==='AYA Farm'?'selected':''}>AYA Farm</option><option ${p.line_name==='AYA Snacks & Drinks'?'selected':''}>AYA Snacks & Drinks</option></select></label><label>Category<input id="pCat" value="${esc(p.category_name)}"></label><label>Master Active<select id="pActive"><option value="true" ${p.active?'selected':''}>Ya</option><option value="false" ${!p.active?'selected':''}>Tidak</option></select></label></div><div class="toolbar" style="margin-top:12px"><button id="pMasterSave" class="btn primary">Save Identity</button><button id="pAddVariant" class="btn">Add Variant</button></div><div class="section-title"><h2>Master Variants</h2><span>identity</span></div><div class="list">${vs.map(v=>`<div class="row"><div><b>${esc(v.variant_name)}</b><small>${v.active?'Active':'Inactive'}</small></div><div><button class="btn ghost" data-var="${esc(v.variant_name)}">Toggle</button><button class="btn ghost" data-delvar="${esc(v.variant_name)}">Delete</button></div></div>`).join('')||'<div class="empty">No master variants.</div>'}</div><div class="section-title"><h2>B2C Commercial</h2><span>transitional publish layer</span></div>${c?`<div class="grid cols3"><div class="card metric"><b>Status</b><strong style="font-size:16px">${esc(c.public_status)}</strong><small>${c.orderable?'Orderable':'Not orderable'} · ${c.visible?'Visible':'Hidden'}</small></div><div class="card metric"><b>Variants</b><strong>${cv.length}</strong><small>${cv.map(v=>`${esc(v.variant_name)} · ${esc(v.unit_label||'unit')} · ${money(v.unit_price)}`).join(' · ')}</small></div><div class="card metric"><b>Public Sync</b><strong style="font-size:16px">Manual</strong><small>Locked public source is not auto-published.</small></div></div>`:'<div class="message">Produk ini belum ada di current public catalog layer.</div>'}<div class="section-title"><h2>B2B Commercial Detail</h2><span>COGS internal</span></div>${ms.length?`<div class="table-wrap"><table><thead><tr><th>Variant</th><th>Unit</th><th>Base</th><th>Additional</th><th>COGS</th><th>Final</th><th>Supply</th><th>Margin</th><th>Commercial</th></tr></thead><tbody>${ms.map(m=>{const e=economics(m,d.costs);return `<tr><td>${esc(m.variant_name)}</td><td>${esc(m.unit_label)}</td><td>${money(m.base_cost)}</td><td>${money(e.extra)}</td><td><b>${money(e.cogs)}</b></td><td>${money(m.final_unit_price)}</td><td>${money(e.supply)}</td><td>${chip(money(e.margin),Number(e.margin)>0?'good':'danger')}</td><td>${m.commercial_enabled?chip('Enabled','good'):chip('Disabled')}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="message">Belum ada B2B measurement.</div>'}<div class="message" style="margin-top:14px">Pasokan eligibility: <b>${b?.supply_eligible?'Bisa':'Tidak Bisa'}</b> · Product Class: <b>${esc(b?.product_class||'—')}</b>. Supply Price = Final Unit Price − Rp2.000; margin wajib &gt; 0.</div>`);
  window.AYA_ADMIN_PRODUCT_MEDIA?.mount();
  if(p.image_path){try{const url=await window.AYA_ADMIN_PRODUCT_MEDIA?.signedUrl(p.image_path);const img=document.querySelector('#productImagePreview');if(url&&img){img.src=url;img.hidden=false;}}catch(_){} }
  document.querySelector('#pImageSave').onclick=async()=>{const file=window.AYA_ADMIN_PRODUCT_MEDIA?.state?.selected;if(!file){notify('Pilih foto terlebih dahulu.','error');return;}try{await window.AYA_ADMIN_PRODUCT_MEDIA.uploadProductImage(id,file);notify('Foto produk tersimpan.','success');document.querySelector('#modal').close();await render();}catch(e){notify(e.message,'error')}};
  document.querySelector('#pMasterSave').onclick=async()=>{try{const{error}=await getSb().rpc('aya_admin_upsert_product_master',{p_product_id:id,p_product_name:document.querySelector('#pName').value.trim(),p_line_name:document.querySelector('#pLine').value,p_category_name:document.querySelector('#pCat').value.trim(),p_active:document.querySelector('#pActive').value==='true'});if(error)throw error;notify('Product identity saved + audited.','success');document.querySelector('#modal').close();await render()}catch(e){notify(e.message,'error')}};
  document.querySelector('#pAddVariant').onclick=()=>variantDialog(id,null);
  document.querySelectorAll('[data-var]').forEach(btn=>btn.onclick=()=>{const v=vs.find(x=>x.variant_name===btn.dataset.var);variantDialog(id,v)});
  document.querySelectorAll('[data-delvar]').forEach(btn=>btn.onclick=async()=>{const name=btn.dataset.delvar;if(!confirm(`Delete variant "${name}"? If it has entered Finance, it will be archived instead of physically removed.`))return;try{const{data,error}=await getSb().rpc('aya_admin_delete_product_variant',{p_product_id:id,p_variant_name:name});if(error)throw error;const mode=data?.mode==='archived'?'archived':'hard deleted';notify(`Variant ${mode}.`,'success');document.querySelector('#modal').close();await render()}catch(e){notify(e.message,'error')}});
}
function variantDialog(id,v){modal(`<h2>${v?'Edit':'Add'} Variant</h2><div class="form-grid"><label>Variant Name<input id="vName" value="${esc(v?.variant_name||'')}" ${v?'disabled':''}></label><label>Active<select id="vActive"><option value="true" ${v?.active!==false?'selected':''}>Ya</option><option value="false" ${v?.active===false?'selected':''}>Tidak</option></select></label></div><div class="toolbar" style="margin-top:14px"><button id="vSave" class="btn primary">Save Variant</button></div><div class="message" style="margin-top:14px">Variant identity saja. B2C/B2B commercial data untuk variant baru perlu dikonfigurasi setelahnya.</div>`);document.querySelector('#vSave').onclick=async()=>{try{const{error}=await getSb().rpc('aya_admin_upsert_product_variant',{p_product_id:id,p_variant_name:document.querySelector('#vName').value.trim(),p_active:document.querySelector('#vActive').value==='true'});if(error)throw error;notify('Variant saved + audited.','success');document.querySelector('#modal').close();await render()}catch(e){notify(e.message,'error')}}}
const obs=new MutationObserver(()=>{const el=document.querySelector('[data-page="products"]');if(el?.classList.contains('active'))render()});
const start=()=>{const el=document.querySelector('[data-page="products"]');if(el)obs.observe(el,{attributes:true,attributeFilter:['class']});document.addEventListener('click',e=>{if(e.target.closest?.('[data-go="products"]'))setTimeout(render,50)});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

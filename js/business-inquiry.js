(() => {
  "use strict";
  const KEY = "ayaRaos.businessDraft.v3";
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AYA) return;
    const form = document.querySelector("[data-business-inquiry-form]"); if (!form) return;
    const errors = document.querySelector("[data-business-errors]");
    const saveState = document.querySelector("[data-business-save-state]");
    const productSelect = document.querySelector("[data-supply-product]");
    const submitButton = document.querySelector("[data-submit-business]");
    const successPanel = document.querySelector("[data-business-success]");
    const businessNumber = document.querySelector("[data-business-number]");
    const businessWhatsApp = document.querySelector("[data-business-whatsapp]");
    const copyButton = document.querySelector("[data-copy-business-id]");
    const review = document.querySelector("[data-business-review]");
    const steps = [...document.querySelectorAll("[data-business-step]")];
    const stepButtons = [...document.querySelectorAll("[data-business-step-button]")];
    let step = 1;

    const eligible = window.AYA.products().filter((product) => product.supplyEligible);
    productSelect.innerHTML += eligible.map((product) => `<option value="${window.AYA.escapeHTML(product.id)}">${window.AYA.escapeHTML(product.name)}${product.orderable ? "" : " — perlu evaluasi"}</option>`).join("") + '<option value="other">Produk lain — perlu evaluasi</option>';
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem("ayaRaos.businessDraft.v2")) || {}; } catch { return {}; } };
    const write = (value) => { try { localStorage.setItem(KEY, JSON.stringify(value)); return true; } catch { return false; } };
    let draft = read();
    Object.entries(draft).forEach(([name,value]) => { const field=form.elements.namedItem(name); if (!field) return; if (field.type==="checkbox") field.checked=Boolean(value); else if(value!=null && typeof value!=="object") field.value=String(value); });

    const allData = () => { const d=Object.fromEntries(new FormData(form)); return {...d, consent:Boolean(d.consent), schemaVersion:1}; };
    const showErrors = (messages) => { errors.hidden=!messages.length; errors.innerHTML=messages.length?`<strong>Periksa data berikut:</strong><ul>${messages.map(m=>`<li>${window.AYA.escapeHTML(m)}</li>`).join("")}</ul>`:""; if(messages.length) errors.focus(); };
    const requiredByStep = {
      1: {company:"Nama usaha atau perusahaan wajib diisi.",businessType:"Jenis usaha wajib dipilih.",pic:"Nama PIC wajib diisi.",role:"Jabatan atau peran PIC wajib diisi.",whatsapp:"Nomor WhatsApp wajib diisi.",email:"Email wajib diisi."},
      2: {product:"Produk yang dibutuhkan wajib dipilih.",intendedUse:"Penggunaan produk wajib dipilih.",volume:"Estimasi volume per pengiriman wajib diisi.",frequency:"Frekuensi pasokan berulang wajib dipilih.",location:"Lokasi pasokan wajib diisi.",startDate:"Rencana mulai wajib diisi."}
    };
    const validateStep = (n) => { const data=allData(); const messages=[]; Object.entries(requiredByStep[n]||{}).forEach(([name,msg])=>{if(!String(data[name]||"").trim()) messages.push(msg);}); if(n===1 && data.email && !/^\S+@\S+\.\S+$/.test(data.email)) messages.push("Format email belum valid."); if(n===2 && data.frequency && !["weekly","biweekly","monthly","seasonal","other-recurring"].includes(data.frequency)) messages.push("Frekuensi harus menunjukkan kebutuhan berulang."); if(n===3 && !data.consent) messages.push("Pernyataan pemahaman wajib disetujui."); showErrors(messages); return {valid:!messages.length,data}; };
    const persist = () => { draft={...draft,...allData(),savedAt:new Date().toISOString()}; write(draft); };
    const renderReview = () => { const d=allData(); const product=window.AYA.getProduct(d.product); review.innerHTML=`<div><span>Usaha</span><strong>${window.AYA.escapeHTML(d.company||"—")}</strong><small>${window.AYA.escapeHTML(d.businessType||"")}</small></div><div><span>PIC</span><strong>${window.AYA.escapeHTML(d.pic||"—")}</strong><small>${window.AYA.escapeHTML(d.whatsapp||"")}</small></div><div><span>Produk</span><strong>${window.AYA.escapeHTML(product?.name || d.product || "—")}</strong><small>${window.AYA.escapeHTML(d.volume||"")} · ${window.AYA.escapeHTML(d.frequency||"")}</small></div><div><span>Lokasi & mulai</span><strong>${window.AYA.escapeHTML(d.location||"—")}</strong><small>${window.AYA.escapeHTML(d.startDate||"")}</small></div>`; };
    const go = (target, validate=true) => { if(validate && target>step){const r=validateStep(step); if(!r.valid)return; persist();} if(target===3)renderReview(); step=target; steps.forEach(n=>{const active=Number(n.dataset.businessStep)===step;n.hidden=!active;n.classList.toggle("active",active);}); stepButtons.forEach(b=>{const n=Number(b.dataset.businessStepButton);b.classList.toggle("active",n===step);b.classList.toggle("complete",n<step);}); };
    document.querySelectorAll("[data-business-next]").forEach(b=>b.addEventListener("click",()=>go(Number(b.dataset.businessNext))));
    document.querySelectorAll("[data-business-prev]").forEach(b=>b.addEventListener("click",()=>{showErrors([]);go(Number(b.dataset.businessPrev),false);}));
    stepButtons.forEach(b=>b.addEventListener("click",()=>{const t=Number(b.dataset.businessStepButton); if(t<step)go(t,false);}));

    const buildMessage = (result,data) => ["Halo AYA RAOS, saya sudah mengirim kebutuhan pasokan berkala melalui website.","",`Business Inquiry ID: ${result.inquiryNumber}`,`Usaha: ${data.company}`,`PIC: ${data.pic} — ${data.role}`,`Produk: ${window.AYA.getProduct(data.product)?.name || data.product}`,`Penggunaan: ${data.intendedUse}`,`Volume/pengiriman: ${data.volume}`,`Frekuensi: ${data.frequency}`,`Lokasi: ${data.location}`,`Rencana mulai: ${data.startDate}`,"","Pengajuan ini belum merupakan order, quotation, jaminan kapasitas, atau persetujuan harga."].join("\n");
    const showSuccess = (result,data) => { draft.submittedInquiry=result;write(draft);businessNumber.textContent=result.inquiryNumber;businessWhatsApp.href=window.AYA.buildWhatsAppUrl(buildMessage(result,data));successPanel.hidden=false;submitButton.disabled=true;submitButton.textContent="Inquiry Sudah Tersimpan"; };
    const hasSubmitted = Boolean(draft.submittedInquiry?.inquiryNumber); if(hasSubmitted){go(3,false);showSuccess(draft.submittedInquiry,draft);}
    submitButton?.addEventListener("click",async()=>{const r=validateStep(3);if(!r.valid)return; const first=validateStep(1);if(!first.valid){go(1,false);return;}const second=validateStep(2);if(!second.valid){go(2,false);return;}go(3,false); if(!window.AYA_ORDER_API?.isConfigured||!window.AYA_CONFIG?.businessSupply?.persistence){showErrors(["Layanan pengajuan pasokan belum tersedia. Silakan coba kembali nanti."]);return;}draft.idempotencyKey=draft.idempotencyKey||window.AYA_ORDER_API.idempotencyKey();persist();submitButton.disabled=true;submitButton.textContent="Menyimpan inquiry…";try{const response=await window.AYA_ORDER_API.createBusinessInquiry(r.data,draft.idempotencyKey);if(!response?.inquiryNumber)throw new Error("Server tidak mengembalikan Business Inquiry ID.");showSuccess(response,r.data);}catch(error){submitButton.disabled=false;submitButton.textContent="Coba Kirim Inquiry Lagi";showErrors([error?.message||"Pengajuan belum tersimpan. Silakan coba kembali."]);}});
    form.addEventListener("input",()=>{ if(draft.submittedInquiry){draft.submittedInquiry=null;draft.idempotencyKey=null;write(draft);successPanel.hidden=true;submitButton.disabled=false;submitButton.textContent="Kirim Inquiry";} });
    copyButton?.addEventListener("click",async()=>{const id=draft.submittedInquiry?.inquiryNumber;if(!id)return;try{await navigator.clipboard.writeText(id);window.AYA.toast("Business Inquiry ID disalin.","success");}catch{window.AYA.toast("Business Inquiry ID belum dapat disalin otomatis.","error");}});
    if(!hasSubmitted) go(1,false);
  });
})();

(()=>{
'use strict';
/* Mobile bridge v26d — only needed if auth.js handlers somehow missing; prefers shared client. */
const $=id=>document.getElementById(id);
const showMsg=(text,type='error')=>{
  const el=$('loginError');if(!el)return;
  el.textContent=text||'';
  el.className=`form-error ${type}`;
  el.style.cssText=text
    ?`display:block;padding:10px 12px;border-radius:10px;margin:0 0 4px;background:${type==='success'?'rgba(64,105,85,.14)':'rgba(151,61,61,.14)'};color:${type==='success'?'#406955':'#973d3d'};font-size:14px;font-weight:600;`
    :'min-height:16px;margin:0;';
};
const classify=e=>{
  const m=String(e?.message||e||'');
  if(/invalid login credentials|invalid password|invalid_credentials/i.test(m))return 'Email atau password salah.';
  if(/network|fetch|failed to fetch/i.test(m))return 'Tidak dapat terhubung ke Supabase.';
  return m||'Login gagal.';
};

const bind=()=>{
  const sb=window.AYA_ADMIN_AUTH;
  const form=$('loginForm');
  const email=$('loginEmail');
  const password=$('loginPassword');
  const masuk=$('loginSubmitBtn')||form?.querySelector('button[type="submit"]');
  const forgot=$('forgotPasswordBtn');
  if(!sb||!form||!email||!password||!masuk)return false;
  if(form.dataset.mobileAuthBridge==='4')return true;
  form.dataset.mobileAuthBridge='4';

  // auth.js already bound submit; this is a safety net for touch-only gaps.
  // Do not stopImmediatePropagation so auth.js handler can also run if both fire.
  let busy=false;
  const doLogin=async()=>{
    if(busy)return;
    const em=(email.value||'').trim(),pw=password.value||'';
    if(!em||!pw){showMsg('Email dan password wajib diisi.');return;}
    // If auth.js already handles submit, skip duplicate network call when form submit path works.
    // Still provide feedback for pure touch without submit.
    busy=true;
    const prev=masuk.textContent;
    masuk.disabled=true;masuk.textContent='Memproses…';
    try{
      const{data,error}=await sb.auth.signInWithPassword({email:em,password:pw});
      if(error)throw error;
      if(data?.session){showMsg('Login berhasil. Memuat…','success');window.location.reload();return;}
      showMsg('Login tidak menghasilkan session.');
    }catch(err){showMsg(classify(err));}
    finally{busy=false;masuk.disabled=false;masuk.textContent=prev;}
  };

  // Only attach extra touch handlers if auth.js hasn't marked ready yet — avoid double login.
  // Actually auth.js binds submit only; touch on button still needs this for some WebViews.
  masuk.addEventListener('touchend',e=>{e.preventDefault();doLogin();},{passive:false});

  forgot?.addEventListener('touchend',async e=>{
    e.preventDefault();
    if(busy)return;
    const value=(email.value||'').trim();
    if(!value){showMsg('Masukkan email Admin terlebih dahulu.');return;}
    busy=true;
    const prev=forgot.textContent;
    forgot.disabled=true;forgot.textContent='Mengirim…';
    try{
      const{error}=await sb.auth.resetPasswordForEmail(value,{redirectTo:`${window.location.origin}/admin/`});
      if(error)throw error;
      showMsg('Jika email terdaftar, instruksi reset password telah dikirim.','success');
    }catch(err){showMsg(classify(err));}
    finally{busy=false;forgot.disabled=false;forgot.textContent=prev;}
  },{passive:false});

  const badge=$('authBuildBadge');
  if(badge)badge.textContent='auth v26d · bridge ok';
  return true;
};

const start=()=>{if(bind())return;setTimeout(start,40);};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
window.addEventListener('aya:admin-auth-ready-to-bind',start);
})();

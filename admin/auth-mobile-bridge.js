(()=>{
'use strict';
/* Emergency/mobile auth bridge: binds controls independently of auth.js session bootstrap. */
const bind=()=>{
  const sb=window.AYA_ADMIN_AUTH;
  const form=document.getElementById('loginForm');
  const forgot=document.getElementById('forgotPasswordBtn');
  const email=document.getElementById('loginEmail');
  const password=document.getElementById('loginPassword');
  const error=document.getElementById('loginError');
  if(!sb||!form||!email||!password)return false;
  if(form.dataset.mobileAuthBridge==='1')return true;
  form.dataset.mobileAuthBridge='1';
  const msg=t=>{if(error)error.textContent=t||'';};
  form.addEventListener('submit',async e=>{
    e.preventDefault();e.stopImmediatePropagation();msg('');
    const btn=form.querySelector('button[type="submit"]');
    if(!email.value.trim()||!password.value){msg('Email dan password wajib diisi.');return;}
    if(btn)btn.disabled=true;
    try{
      const {data,error:authError}=await sb.auth.signInWithPassword({email:email.value.trim(),password:password.value});
      if(authError)throw authError;
      if(data?.session){window.location.reload();return;}
      msg('Login tidak menghasilkan session. Silakan coba lagi.');
    }catch(err){msg(String(err?.message||err||'Login gagal.'));}
    finally{if(btn)btn.disabled=false;}
  },true);
  forgot?.addEventListener('click',async e=>{
    e.preventDefault();e.stopImmediatePropagation();msg('');
    const value=email.value.trim();
    if(!value){msg('Masukkan email Admin terlebih dahulu.');email.focus();return;}
    try{
      const {error:resetError}=await sb.auth.resetPasswordForEmail(value,{redirectTo:`${window.location.origin}/admin/`});
      if(resetError)throw resetError;
      msg('Jika email terdaftar, instruksi reset password telah dikirim.');
    }catch(err){msg(String(err?.message||err||'Reset password gagal.'));}
  },true);
  return true;
};
const start=()=>{if(bind())return;setTimeout(start,50);};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
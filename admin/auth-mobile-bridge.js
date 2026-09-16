(()=>{
'use strict';
/* Mobile bridge v26e — touch compatibility only; auth.js remains the single Auth owner. */
const $=id=>document.getElementById(id);

const bind=()=>{
  const form=$('loginForm');
  const masuk=$('loginSubmitBtn')||form?.querySelector('button[type="submit"]');
  const forgot=$('forgotPasswordBtn');
  if(!window.AYA_ADMIN_AUTH_HANDLERS_BOUND||!form||!masuk||!forgot)return false;
  if(form.dataset.mobileAuthBridge==='5')return true;
  form.dataset.mobileAuthBridge='5';

  // Some older Android/WebView touch paths can miss the synthetic click/submit.
  // Delegate touch to the canonical auth.js handlers instead of making a second Auth request.
  masuk.addEventListener('touchend',e=>{
    e.preventDefault();
    if(masuk.disabled)return;
    if(typeof form.requestSubmit==='function')form.requestSubmit(masuk);
    else form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  },{passive:false});

  forgot.addEventListener('touchend',e=>{
    e.preventDefault();
    if(forgot.disabled)return;
    forgot.click();
  },{passive:false});

  const badge=$('authBuildBadge');
  if(badge)badge.textContent='auth v26e · mobile ready';
  return true;
};

const start=()=>{if(bind())return;setTimeout(start,80);};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
window.addEventListener('aya:admin-auth-ready-to-bind',start);
})();

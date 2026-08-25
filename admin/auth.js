(()=>{
'use strict';
const $=id=>document.getElementById(id);
const ensureHiddenStyles=()=>{if(document.getElementById('aya-admin-auth-visibility'))return;const style=document.createElement('style');style.id='aya-admin-auth-visibility';style.textContent='#loginView[hidden],#resetView[hidden],#appView[hidden],#mobileNavPanel[hidden]{display:none!important}.login-card input{pointer-events:auto;touch-action:manipulation}.login-card button{pointer-events:auto;touch-action:manipulation}';document.head.appendChild(style);};
const loadSupabaseFallback=()=>new Promise(resolve=>{if(window.supabase?.createClient)return resolve(true);const s=document.createElement('script');s.src='https://unpkg.com/@supabase/supabase-js@2.111.0/dist/umd/supabase.min.js';s.async=false;s.onload=()=>resolve(!!window.supabase?.createClient);s.onerror=()=>resolve(false);document.head.appendChild(s);});
const message=(id,text,type='error')=>{const el=$(id);if(!el)return;el.textContent=text||'';el.className=`form-error ${type}`;};
const classify=e=>{const m=String(e?.message||e||'');if(/invalid api key/i.test(m))return 'Konfigurasi Supabase tidak valid. Periksa URL dan publishable key.';if(/invalid login credentials|invalid password/i.test(m))return 'Email atau password salah.';if(/network|fetch|failed to fetch/i.test(m))return 'Tidak dapat terhubung ke Supabase.';return m||'Login gagal. Silakan coba lagi.';};
async function bootstrap(){
  ensureHiddenStyles();
  const cfg=window.AYA_CONFIG?.supabase||{};
  const ready=await loadSupabaseFallback();
  if(!ready||!cfg.url||!cfg.publishableKey){message('loginError','Supabase Admin belum siap. Silakan muat ulang halaman.');return;}
  const sb=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.AYA_ADMIN_AUTH=sb;
  const show=view=>{const login=$('loginView'),reset=$('resetView'),app=$('appView');if(login)login.hidden=view!=='login';if(reset)reset.hidden=view!=='reset';if(app)app.hidden=view!=='app';};
  async function verifyAdmin(session){
    const userId=session?.user?.id;if(!userId)return{ok:false,msg:'Session Admin tidak valid.'};
    const{data,error}=await sb.from('aya_admin_users').select('user_id,display_name,is_active').eq('user_id',userId).maybeSingle();if(error)throw error;if(!data)return{ok:false,msg:'Akun berhasil login, tetapi belum terdaftar sebagai Admin AYA.'};if(!data.is_active)return{ok:false,msg:'Akun Admin tidak aktif.'};
    const{data:roles,error:rolesError}=await sb.from('aya_admin_user_roles').select('role_id,aya_admin_roles(id,role_code,role_name,is_system)').eq('user_id',userId);if(rolesError)throw rolesError;const roleRows=(roles||[]).map(r=>r.aya_admin_roles).filter(Boolean);if(!roleRows.length)return{ok:false,msg:'Akun Admin aktif tetapi belum memiliki Role.'};
    const roleIds=roleRows.map(r=>r.id);const{data:roleFunctions,error:functionError}=await sb.from('aya_admin_role_functions').select('role_id,function_key').in('role_id',roleIds);if(functionError)throw functionError;const functionKeys=[...new Set((roleFunctions||[]).map(x=>x.function_key).filter(Boolean))];
    const{data:functions,error:catalogError}=await sb.from('aya_admin_functions').select('function_key,domain,label,description,system_only').in('function_key',functionKeys);if(catalogError)throw catalogError;const assignableFunctions=(functions||[]).filter(f=>!f.system_only).map(f=>f.function_key);const systemOnlyGranted=(functions||[]).filter(f=>f.system_only).map(f=>f.function_key);
    return{ok:true,user:{user_id:data.user_id,display_name:data.display_name,email:session.user.email||''},roles:roleRows,functionKeys:assignableFunctions,systemOnlyGranted};
  }
  async function enter(session){if(!session){show('login');return;}try{const v=await verifyAdmin(session);if(!v.ok){await sb.auth.signOut();show('login');message('loginError',v.msg);return;}window.AYA_ADMIN_USER=v.user;window.AYA_ADMIN_ROLES=v.roles;window.AYA_ADMIN_FUNCTIONS=new Set(v.functionKeys);window.AYA_ADMIN_SYSTEM_ONLY=new Set(v.systemOnlyGranted);show('app');window.dispatchEvent(new CustomEvent('aya:admin-auth-ready',{detail:{session,adminUser:v.user,roles:v.roles,functionKeys:v.functionKeys}}));}catch(e){await sb.auth.signOut();show('login');message('loginError',`Admin access gagal diverifikasi: ${classify(e)}`);}}
  async function init(){
    const recovery=window.location.hash.includes('type=recovery');if(recovery)show('reset');const{data}=await sb.auth.getSession();if(data?.session&&!recovery)await enter(data.session);else if(!recovery)show('login');
    $('loginForm')?.addEventListener('submit',async event=>{event.preventDefault();message('loginError','');const email=$('loginEmail')?.value.trim()||'';const password=$('loginPassword')?.value||'';if(!email||!password){message('loginError','Email dan password wajib diisi.');return;}const btn=$('loginForm')?.querySelector('button[type="submit"]');if(btn)btn.disabled=true;try{const{data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;await enter(data.session);}catch(e){message('loginError',classify(e));}finally{if(btn)btn.disabled=false;}});
    $('forgotPasswordBtn')?.addEventListener('click',async()=>{const email=$('loginEmail')?.value.trim();message('loginError','');if(!email){message('loginError','Masukkan email Admin terlebih dahulu.');$('loginEmail')?.focus();return;}const redirectTo=`${window.location.origin}/admin/`;try{const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo});if(error)throw error;message('loginError','Jika email terdaftar, instruksi reset password telah dikirim.','success');}catch(e){message('loginError',classify(e));}});
    $('resetForm')?.addEventListener('submit',async event=>{event.preventDefault();message('resetError','');const password=$('newPassword')?.value||'',confirmation=$('confirmPassword')?.value||'';if(password.length<8)return message('resetError','Password minimal 8 karakter.');if(password!==confirmation)return message('resetError','Konfirmasi password tidak sama.');const{error}=await sb.auth.updateUser({password});if(error)return message('resetError',classify(error));window.history.replaceState({},document.title,`${window.location.pathname}${window.location.search}`);show('login');message('loginError','Password berhasil diperbarui. Silakan login kembali.','success');});
    sb.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY')show('reset');else if(event==='SIGNED_OUT')show('login');});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}
bootstrap().catch(e=>{ensureHiddenStyles();message('loginError',`Admin Auth gagal dimuat: ${classify(e)}`);});
})();
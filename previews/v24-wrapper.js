/* V24 — wrapper deadlock/control reliability fixes only.
   R5.13 remains the authority for normal page physics, gesture geometry,
   completion thresholds, reverse illusion and transition timing. */
let v24ReverseOverride=false;
let v24ReversePointerId=null;
let v24CartPointerId=null;
let v24CartStart=null;
let v24LastCartActivation=0;
let v24NonReadSince=0;
let v24GuardTimer=0;
let v24HookedFlip=null;

function v24SyncCurrentPage(){
  try{
    const idx=Number(pageFlip?.getCurrentPageIndex?.());
    if(Number.isFinite(idx))currentPage=Math.max(0,Math.min(sets[activeLine].length-1,idx));
  }catch{}
}

function v24ResetPointerState(){
  v24ReverseOverride=false;
  v24ReversePointerId=null;
  gestureActive=false;
  gestureDragging=false;
  gesturePointerId=null;
  gestureStartRaw=null;
}

function v24ResetReverseFlags(){
  cancelAnimationFrame(reverseRAF); reverseRAF=0;
  if(reverseOriginalTurnNext){
    try{pageFlip.turnToNextPage=reverseOriginalTurnNext}catch{}
    reverseOriginalTurnNext=null;
  }
  reverseActive=false;
  reverseCommitPending=false;
  reverseCancelPending=false;
  reversePrevIndex=-1;
  reverseOriginIndex=-1;
  reverseProgress=0;
  removeReverseCoverage();
}

function v24HardRecover(){
  if(!pageFlip)return;
  const idx=Math.max(0,Math.min(sets[activeLine].length-1,Number(currentPage)||0));
  const controller=pageFlip.getFlipController?.();
  const render=pageFlip.getRender?.();

  v24ResetPointerState();
  v24ResetReverseFlags();

  /* Recovery is only used after a stale/non-read timeout. It is not part of
     normal R5.13 motion. Reset calc first so finishing a stale render animation
     cannot advance another page. */
  try{controller?.reset?.()}catch{}
  try{render?.finishAnimation?.()}catch{}
  try{render?.setBottomPage?.(null)}catch{}
  try{render?.setFlippingPage?.(null)}catch{}
  try{render?.clearShadow?.()}catch{}
  try{controller?.setState?.('read')}catch{}
  try{pageFlip.getPageCollection?.().show(idx)}catch{
    try{pageFlip.turnToPage?.(idx)}catch{}
  }

  currentPage=idx;
  setTurning(false);
  variantPop.classList.remove('open');
  renderUnderlay();
  updateRenderedCommerce();
  buildVariantPop();
  updateControlState();
  v24NonReadSince=0;
}

function v24ScheduleGuard(){
  clearTimeout(v24GuardTimer);
  v24GuardTimer=setTimeout(()=>{
    if(!pageFlip)return;
    let state='read';
    try{state=pageFlip.getState?.()||'read'}catch{}
    if(state!=='read' && !gestureActive && !v24ReverseOverride)v24HardRecover();
  },1100);
}

function v24AttachEngineHooks(){
  if(!pageFlip||pageFlip===v24HookedFlip)return;
  v24HookedFlip=pageFlip;
  pageFlip.on('changeState',e=>{
    if(e.data==='read'){
      v24NonReadSince=0;
      clearTimeout(v24GuardTimer);
      v24ResetPointerState();
      v24SyncCurrentPage();
      setTurning(false);
      renderUnderlay();
      updateRenderedCommerce();
      updateControlState();
      return;
    }
    if(!v24NonReadSince)v24NonReadSince=performance.now();
    v24ScheduleGuard();
  });
}

/* initFlip is called after mountBook in a RAF. Wrap it before the first mount,
   and on every later line/remount, so every PageFlip instance receives the
   same deadlock guard. */
const v24BaseInitFlip=initFlip;
initFlip=function(){
  v24BaseInitFlip();
  v24AttachEngineHooks();
};

/* A new pointerdown proves the previous single-finger transaction has ended.
   If Android lost its pointerup/lostcapture, clear only the stale wrapper flags.
   If PageFlip itself has remained non-read beyond a normal 540 ms animation,
   settle it before allowing the new gesture. */
bookWrap.addEventListener('pointerdown',e=>{
  if(isBookControl(e.target))return;

  if(gestureActive||v24ReverseOverride)v24ResetPointerState();

  let state='read';
  try{state=pageFlip?.getState?.()||'read'}catch{}
  if(state!=='read'){
    const age=v24NonReadSince?performance.now()-v24NonReadSince:1200;
    if(age>=900){
      v24HardRecover();
    }else{
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
},true);

/* Preserve V23's useful acquisition fix: a genuine left->right drag may enter
   the exact R5.13 reverse engine from anywhere on the leaf. Forward motion is
   untouched and falls through to the original R5.13 listener. */
bookWrap.addEventListener('pointermove',e=>{
  if(v24ReverseOverride){
    if(e.pointerId!==v24ReversePointerId||!gestureStartRaw)return;
    const raw=rawPagePoint(e.clientX,e.clientY);
    if(raw&&reverseActive)updateVirtualReverse(raw,gestureStartRaw);
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }

  if(!gestureActive||gestureDragging||e.pointerId!==gesturePointerId||!pageFlip||!gestureStartRaw)return;
  const raw=rawPagePoint(e.clientX,e.clientY); if(!raw)return;
  const dx=raw.x-gestureStartRaw.x,dy=raw.y-gestureStartRaw.y;
  if(Math.hypot(dx,dy)<DRAG_THRESHOLD)return;

  if(dx>0&&Math.abs(dx)>=Math.abs(dy)*.30){
    v24SyncCurrentPage();
    if(currentPage<=0)return;
    if(!prepareVirtualReverse())return;
    gestureAnchorSide='left';
    gestureDragging=true;
    v24ReverseOverride=true;
    v24ReversePointerId=e.pointerId;
    updateVirtualReverse(raw,gestureStartRaw);
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},true);

bookWrap.addEventListener('pointerup',e=>{
  if(!v24ReverseOverride||e.pointerId!==v24ReversePointerId)return;
  const raw=rawPagePoint(e.clientX,e.clientY),start=gestureStartRaw;
  v24ReverseOverride=false; v24ReversePointerId=null;
  gestureActive=false; gestureDragging=false; gesturePointerId=null; gestureStartRaw=null;
  if(raw&&start&&reverseActive){
    const travel=Math.max(0,raw.x-start.x);
    const commit=travel>=raw.w*.46||raw.x>=raw.w*.90;
    if(commit)commitVirtualReverse(reverseProgress); else cancelVirtualReverse(reverseProgress);
    v24ScheduleGuard();
  }
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

bookWrap.addEventListener('pointercancel',e=>{
  if(v24ReverseOverride&&e.pointerId===v24ReversePointerId){
    v24ReverseOverride=false; v24ReversePointerId=null;
    if(reverseActive)cancelVirtualReverse(reverseProgress);
    v24ResetPointerState();
    v24ScheduleGuard();
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},true);

/* Browser may auto-release capture without delivering the expected handler to
   the element after DOM/compositor changes. Never leave a dead pointer owner. */
bookWrap.addEventListener('lostpointercapture',e=>{
  if(gestureActive&&e.pointerId===gesturePointerId){
    v24ResetPointerState();
    v24ScheduleGuard();
  }
});
window.addEventListener('pointerup',()=>{
  setTimeout(()=>{
    if(gestureActive||v24ReverseOverride){
      v24ResetPointerState();
      v24ScheduleGuard();
    }
  },0);
});
window.addEventListener('pointercancel',()=>{
  setTimeout(()=>{
    if(gestureActive||v24ReverseOverride){
      v24ResetPointerState();
      v24ScheduleGuard();
    }
  },0);
});

/* Cart delivery: use pointer-up as primary, click as Android fallback, with
   dedupe. This replaces only the delivery wrapper; cart semantics are unchanged. */
function v24ActivateCart(){
  const now=performance.now();
  if(now-v24LastCartActivation<300)return;
  v24LastCartActivation=now;
  v24SyncCurrentPage();
  updateControlState();
  const p=currentProduct();
  if(!p?.variants?.length)return;
  cartCount++;
  count.textContent=cartCount;
  const index=currentPage;
  bookWrap.querySelectorAll(`.page-cart[data-product-index="${index}"]`).forEach(el=>el.classList.add('done'));
  setTimeout(()=>bookWrap.querySelectorAll(`.page-cart[data-product-index="${index}"]`).forEach(el=>el.classList.remove('done')),650);
}

cartHit.style.touchAction='none';
cartHit.addEventListener('pointerdown',e=>{
  v24CartPointerId=e.pointerId;
  v24CartStart={x:e.clientX,y:e.clientY};
  try{cartHit.setPointerCapture?.(e.pointerId)}catch{}
  e.stopImmediatePropagation();
},true);
cartHit.addEventListener('pointerup',e=>{
  if(e.pointerId!==v24CartPointerId)return;
  const s=v24CartStart;
  v24CartPointerId=null; v24CartStart=null;
  const moved=s?Math.hypot(e.clientX-s.x,e.clientY-s.y):999;
  if(moved<=24)v24ActivateCart();
  e.preventDefault();
  e.stopImmediatePropagation();
},true);
cartHit.addEventListener('pointercancel',e=>{
  if(e.pointerId===v24CartPointerId){v24CartPointerId=null;v24CartStart=null}
  e.stopImmediatePropagation();
},true);
cartHit.addEventListener('click',e=>{
  /* A synthetic click immediately following our pointer-up is deduped; if the
     browser skipped pointer-up but still produces click, this is the fallback. */
  if(performance.now()-v24LastCartActivation>=300)v24ActivateCart();
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

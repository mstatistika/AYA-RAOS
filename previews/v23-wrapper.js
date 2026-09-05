/* V23 — wrapper fixes only. R5.13 physics remains authoritative. */
let v23ReverseOverride=false;
let v23ReversePointerId=null;
let v23CartPointerId=null;
let v23CartStart=null;

function v23SyncCurrentPage(){
  try{
    const idx=Number(pageFlip?.getCurrentPageIndex?.());
    if(Number.isFinite(idx))currentPage=Math.max(0,Math.min(sets[activeLine].length-1,idx));
  }catch{}
}

/* Reverse acquisition bug-fix:
   R5.13 reverse physics is unchanged. We only allow a real left->right drag
   to enter that same reverse engine from anywhere on the leaf, instead of
   requiring the touch to begin inside the left 25% tap zone. */
bookWrap.addEventListener('pointermove',e=>{
  if(v23ReverseOverride){
    if(e.pointerId!==v23ReversePointerId||!gestureStartRaw)return;
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

  /* Only acquire reverse for a genuine rightward gesture. Forward remains
     completely owned by the original R5.13 listener. */
  if(dx>0&&Math.abs(dx)>=Math.abs(dy)*.30){
    v23SyncCurrentPage();
    if(currentPage<=0)return;
    if(!prepareVirtualReverse())return;
    gestureAnchorSide='left';
    gestureDragging=true;
    v23ReverseOverride=true;
    v23ReversePointerId=e.pointerId;
    updateVirtualReverse(raw,gestureStartRaw);
    e.preventDefault();
    e.stopImmediatePropagation();
  }
},true);

bookWrap.addEventListener('pointerup',e=>{
  if(!v23ReverseOverride||e.pointerId!==v23ReversePointerId)return;
  const raw=rawPagePoint(e.clientX,e.clientY),start=gestureStartRaw;
  v23ReverseOverride=false; v23ReversePointerId=null;
  gestureActive=false; gestureDragging=false; gesturePointerId=null; gestureStartRaw=null;
  if(raw&&start&&reverseActive){
    const travel=Math.max(0,raw.x-start.x);
    const commit=travel>=raw.w*.46||raw.x>=raw.w*.90;
    if(commit)commitVirtualReverse(reverseProgress); else cancelVirtualReverse(reverseProgress);
  }
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

bookWrap.addEventListener('pointercancel',e=>{
  if(!v23ReverseOverride||e.pointerId!==v23ReversePointerId)return;
  v23ReverseOverride=false; v23ReversePointerId=null;
  if(reverseActive)cancelVirtualReverse(reverseProgress);
  gestureActive=false; gestureDragging=false; gesturePointerId=null; gestureStartRaw=null;
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

/* Android control delivery fix:
   Do not depend on synthetic click. A clean pointer-up inside the transparent
   cart control performs the action directly. R5.13 book gestures never own
   this element. */
cartHit.style.touchAction='none';
cartHit.addEventListener('pointerdown',e=>{
  v23CartPointerId=e.pointerId;
  v23CartStart={x:e.clientX,y:e.clientY};
  try{cartHit.setPointerCapture?.(e.pointerId)}catch{}
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

cartHit.addEventListener('pointerup',e=>{
  if(e.pointerId!==v23CartPointerId)return;
  const s=v23CartStart;
  v23CartPointerId=null; v23CartStart=null;
  const moved=s?Math.hypot(e.clientX-s.x,e.clientY-s.y):999;
  if(moved<=18){
    v23SyncCurrentPage();
    updateControlState();
    const p=currentProduct();
    if(p?.variants?.length){
      cartCount++;
      count.textContent=cartCount;
      const index=currentPage;
      bookWrap.querySelectorAll(`.page-cart[data-product-index="${index}"]`).forEach(el=>el.classList.add('done'));
      setTimeout(()=>bookWrap.querySelectorAll(`.page-cart[data-product-index="${index}"]`).forEach(el=>el.classList.remove('done')),650);
    }
  }
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

cartHit.addEventListener('pointercancel',e=>{
  if(e.pointerId===v23CartPointerId){v23CartPointerId=null;v23CartStart=null}
  e.stopImmediatePropagation();
},true);

/* Suppress the older click-based cart handler so one physical tap can never
   double-add after the pointer-up path above. */
cartHit.addEventListener('click',e=>{
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

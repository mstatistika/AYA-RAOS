/* V22 — R5.13 is the interaction authority. Only V14 visual/binding and control fixes are adapted around it. */
let gestureAnchorSide='right';
let gestureAnchorY='bottom';
let gestureStartRaw=null;
let gestureDragging=false;
const DRAG_THRESHOLD=10;

function rawPagePoint(clientX,clientY){
  if(!pageFlip)return null;
  const dist=pageFlip.getUI().getDistElement();
  const rect=dist.getBoundingClientRect();
  return {x:clientX-rect.left,y:clientY-rect.top,w:rect.width,h:rect.height};
}
function anchoredPoint(raw,isStart=false,allowOvertravel=false){
  if(!raw)return null;
  const anchorX=gestureAnchorSide==='right'?raw.w-2:2;
  const anchorY=gestureAnchorY==='top'?2:raw.h-2;
  if(isStart)return{x:anchorX,y:anchorY};
  const y=anchorY+(raw.y-anchorY)*0.20;
  const minX=allowOvertravel?-12:1,maxX=allowOvertravel?raw.w+12:raw.w-1;
  return{x:Math.max(minX,Math.min(maxX,raw.x)),y:Math.max(1,Math.min(raw.h-1,y))};
}
function createReverseCoverage(index){
  removeReverseCoverage();
  try{
    const source=pageFlip.getPage(index)?.getElement?.();
    const parent=source?.parentElement;
    if(!source||!parent)return null;
    const clone=source.cloneNode(true);
    clone.classList.add('reverse-current-coverage');
    clone.style.cssText=`display:block;position:absolute;inset:0;width:100%;height:100%;transform:none;transform-origin:0 0;clip-path:none;-webkit-clip-path:none;overflow:hidden;pointer-events:none;z-index:${pageFlip.getSettings().startZIndex+1};`;
    const currentInner=clone.querySelector?.('.page-inner');
    reverseCoverageCurrentTemplate=currentInner?.cloneNode(true)||null;
    const prevEl=pageFlip.getPage(index-1)?.getElement?.();
    const prevInner=prevEl?.querySelector?.('.page-inner');
    reverseCoveragePreviousTemplate=prevInner?.cloneNode(true)||null;
    parent.appendChild(clone);
    reverseCoverageEl=clone; reverseCoverageMode='current';
    reverseCoverageEl.style.setProperty('--aya-handoff','0');
    return clone;
  }catch{return null}
}
function syncTransitionIllusion(progress){
  if(!reverseCoverageEl)return;
  const center=.60,left=.52,right=.69;
  let strength=0;
  if(progress>=left&&progress<=center)strength=(progress-left)/(center-left);
  else if(progress>center&&progress<=right)strength=1-((progress-center)/(right-center));
  strength=Math.max(0,Math.min(1,strength));
  reverseCoverageEl.style.setProperty('--aya-handoff',strength.toFixed(3));
}
function setCoverageMode(mode){
  if(!reverseCoverageEl||mode===reverseCoverageMode)return;
  const template=mode==='previous'?reverseCoveragePreviousTemplate:reverseCoverageCurrentTemplate;
  const currentInner=reverseCoverageEl.querySelector?.('.page-inner');
  if(!template||!currentInner)return;
  currentInner.replaceWith(template.cloneNode(true));
  reverseCoverageMode=mode;
}
function syncOccludedCoverage(progress){
  syncTransitionIllusion(progress);
  if(progress>=REVERSE_OCCLUDED_SWAP_IN)setCoverageMode('previous');
  else if(progress<=REVERSE_OCCLUDED_SWAP_OUT)setCoverageMode('current');
}
function reverseEngineMetrics(){
  const rect=pageFlip.getRender().getRect();
  return{w:rect.pageWidth,h:rect.height,globalVisibleLeft:rect.left+rect.width/2};
}
function reversePoint(localX,metrics){
  const margin=metrics.h/10;
  return{x:metrics.globalVisibleLeft+localX,y:gestureAnchorY==='top'?margin:metrics.h-margin};
}
function prepareVirtualReverse(){
  if(!pageFlip||currentPage<=0)return false;
  const collection=pageFlip.getPageCollection(),controller=pageFlip.getFlipController(),metrics=reverseEngineMetrics();
  reverseOriginIndex=currentPage; reversePrevIndex=currentPage-1; reverseProgress=0;
  createReverseCoverage(reverseOriginIndex); setCoverageMode('current');
  const originalSpread=collection.getCurrentSpreadIndex(),originalGetCurrent=pageFlip.getCurrentPageIndex;
  let started=false;
  try{
    collection.setCurrentSpreadIndex(reversePrevIndex);
    pageFlip.getCurrentPageIndex=()=>reversePrevIndex;
    started=controller.start({x:metrics.globalVisibleLeft+metrics.w-2,y:gestureAnchorY==='top'?2:metrics.h-2});
  }finally{
    pageFlip.getCurrentPageIndex=originalGetCurrent;
    collection.setCurrentSpreadIndex(originalSpread);
  }
  if(!started){reversePrevIndex=-1;reverseOriginIndex=-1;reverseProgress=0;removeReverseCoverage();return false}
  controller.fold(reversePoint(-metrics.w+2,metrics));
  reverseActive=true; setTurning(true); return true;
}
function updateVirtualReverse(raw,start){
  if(!reverseActive||!raw||!start)return;
  const metrics=reverseEngineMetrics(),travel=Math.max(0,raw.x-start.x);
  reverseProgress=Math.max(0,Math.min(1,travel/(raw.w*.92)));
  syncOccludedCoverage(reverseProgress);
  const localX=-metrics.w+(2*metrics.w*reverseProgress);
  pageFlip.getFlipController().fold(reversePoint(localX,metrics));
}
function animateVirtualReverse(from,to,onDone){
  cancelAnimationFrame(reverseRAF);
  const controller=pageFlip.getFlipController(),metrics=reverseEngineMetrics(),started=performance.now(),distance=Math.abs(to-from);
  const duration=Math.max(140,Math.min(420,(pageFlip.getSettings().flippingTime||540)*distance*.92));
  function frame(now){
    const t=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-t,3);
    reverseProgress=from+(to-from)*ease; syncOccludedCoverage(reverseProgress);
    const localX=-metrics.w+(2*metrics.w*reverseProgress);
    controller.fold(reversePoint(localX,metrics));
    if(t<1)reverseRAF=requestAnimationFrame(frame); else onDone?.();
  }
  reverseRAF=requestAnimationFrame(frame);
}
function commitVirtualReverse(fromProgress){
  animateVirtualReverse(Math.max(.46,fromProgress),1,()=>{
    const collection=pageFlip.getPageCollection(),controller=pageFlip.getFlipController(),metrics=reverseEngineMetrics();
    setCoverageMode('previous'); syncTransitionIllusion(1);
    currentPage=reversePrevIndex; collection.show(reversePrevIndex);
    renderUnderlay(); updateRenderedCommerce(); buildVariantPop();
    requestAnimationFrame(()=>requestAnimationFrame(removeReverseCoverage));
    controller.fold(reversePoint(metrics.w-2,metrics)); reverseCommitPending=true;
    requestAnimationFrame(()=>controller.stopMove());
  });
}
function cancelVirtualReverse(fromProgress){
  animateVirtualReverse(fromProgress,0,()=>{
    const controller=pageFlip.getFlipController(),metrics=reverseEngineMetrics();
    setCoverageMode('current'); syncTransitionIllusion(0);
    controller.fold(reversePoint(-metrics.w+2,metrics));
    reverseOriginalTurnNext=pageFlip.turnToNextPage; pageFlip.turnToNextPage=()=>{};
    reverseCancelPending=true; controller.stopMove();
  });
}
function runVirtualReverseTap(){
  if(!prepareVirtualReverse())return;
  animateVirtualReverse(0,1,()=>{
    const collection=pageFlip.getPageCollection(),controller=pageFlip.getFlipController(),metrics=reverseEngineMetrics();
    setCoverageMode('previous'); syncTransitionIllusion(1);
    currentPage=reversePrevIndex; collection.show(reversePrevIndex);
    renderUnderlay(); updateRenderedCommerce(); buildVariantPop();
    requestAnimationFrame(()=>requestAnimationFrame(removeReverseCoverage));
    controller.fold(reversePoint(metrics.w-2,metrics)); reverseCommitPending=true;
    requestAnimationFrame(()=>controller.stopMove());
  });
}
function isBookControl(target){return !!target.closest('.control-shield,.variant-pop')}
bookWrap.addEventListener('pointerdown',e=>{
  if(!pageFlip||isBookControl(e.target))return;
  const raw=rawPagePoint(e.clientX,e.clientY); if(!raw)return;
  if(raw.x<0||raw.y<0||raw.x>raw.w||raw.y>raw.h)return;
  gestureAnchorSide=raw.x<raw.w*.25?'left':'right';
  gestureAnchorY=raw.y<raw.h*.50?'top':'bottom';
  variantPop.classList.remove('open');
  gestureActive=true; gestureDragging=false; gesturePointerId=e.pointerId; gestureStartRaw=raw;
  bookWrap.setPointerCapture?.(e.pointerId); e.preventDefault();
},{passive:false});
bookWrap.addEventListener('pointermove',e=>{
  if(!gestureActive||e.pointerId!==gesturePointerId||!pageFlip||!gestureStartRaw)return;
  const raw=rawPagePoint(e.clientX,e.clientY); if(!raw)return;
  const dx=raw.x-gestureStartRaw.x,dy=raw.y-gestureStartRaw.y;
  if(gestureAnchorSide==='left'&&currentPage>0){
    if(!gestureDragging&&Math.hypot(dx,dy)>=DRAG_THRESHOLD){
      if(dx<=0&&Math.abs(dx)>Math.abs(dy))return;
      if(!prepareVirtualReverse())return;
      gestureDragging=true;
    }
    if(gestureDragging&&reverseActive)updateVirtualReverse(raw,gestureStartRaw);
    e.preventDefault(); return;
  }
  if(!gestureDragging&&Math.hypot(dx,dy)>=DRAG_THRESHOLD){
    gestureDragging=true; setTurning(true);
    pageFlip.startUserTouch(anchoredPoint(gestureStartRaw,true));
  }
  if(gestureDragging)pageFlip.userMove(anchoredPoint(raw,false),true);
  e.preventDefault();
},{passive:false});
function finishGesture(e){
  if(!gestureActive||e.pointerId!==gesturePointerId||!pageFlip)return;
  const raw=rawPagePoint(e.clientX,e.clientY),start=gestureStartRaw,wasDrag=gestureDragging;
  const reverseSide=gestureAnchorSide==='left'&&currentPage>0;
  gestureActive=false; gestureDragging=false; gesturePointerId=null; gestureStartRaw=null;
  if(!raw||!start)return;
  if(reverseSide){
    if(wasDrag&&reverseActive){
      const travel=Math.max(0,raw.x-start.x),commit=travel>=raw.w*.46||raw.x>=raw.w*.90;
      if(commit)commitVirtualReverse(reverseProgress); else cancelVirtualReverse(reverseProgress);
    }else runVirtualReverseTap();
    e.preventDefault(); return;
  }
  if(wasDrag){
    const side=gestureAnchorSide,travel=side==='right'?(start.x-raw.x):(raw.x-start.x);
    const crossedHalf=travel>=raw.w*.46;
    const reachedOppositeEdge=side==='right'?raw.x<=raw.w*.10:raw.x>=raw.w*.90;
    if(crossedHalf||reachedOppositeEdge){
      const finalRaw={x:side==='right'?-12:raw.w+12,y:raw.y,w:raw.w,h:raw.h};
      const finalPoint=anchoredPoint(finalRaw,false,true);
      pageFlip.userMove(finalPoint,true); pageFlip.userStop(finalPoint,false);
    }else pageFlip.userStop(anchoredPoint(raw,false),false);
  }else{
    const corner=raw.y<raw.h*.50?'top':'bottom';
    setTurning(true);
    if(raw.x<raw.w*.25)runVirtualReverseTap(); else pageFlip.flipNext(corner);
  }
  e.preventDefault();
}
bookWrap.addEventListener('pointerup',finishGesture,{passive:false});
bookWrap.addEventListener('pointercancel',e=>{
  if(!gestureActive||!pageFlip)return;
  const raw=rawPagePoint(e.clientX,e.clientY);
  if(reverseActive)cancelVirtualReverse(reverseProgress);
  else if(gestureDragging&&raw)pageFlip.userStop(anchoredPoint(raw,false),false);
  gestureActive=false; gestureDragging=false; gesturePointerId=null; gestureStartRaw=null;
},{passive:false});
document.querySelectorAll('.ribbon').forEach(btn=>btn.addEventListener('click',()=>mountBook(btn.dataset.line)));
let resizeTimer; window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>mountBook(activeLine),120)});
requestAnimationFrame(()=>mountBook('spice'));

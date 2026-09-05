const state={spice:sets.spice.map(()=>0),snacks:sets.snacks.map(()=>0),farm:sets.farm.map(()=>0)};
let activeLine='spice',currentPage=0,pageFlip=null,cartCount=0,activeBookEl=null;
let gestureActive=false,gesturePointerId=null;
let reverseActive=false,reversePrevIndex=-1,reverseOriginIndex=-1,reverseProgress=0,reverseRAF=0,reverseCommitPending=false,reverseCancelPending=false,reverseOriginalTurnNext=null;
let reverseCoverageEl=null,reverseCoveragePreviousTemplate=null,reverseCoverageCurrentTemplate=null,reverseCoverageMode='current';
const REVERSE_OCCLUDED_SWAP_IN=.60,REVERSE_OCCLUDED_SWAP_OUT=.54;
const stage=document.querySelector('.stage');
const book=document.getElementById('book');
const bookWrap=document.getElementById('bookWrap');
const bookUnderlay=document.getElementById('bookUnderlay');
const variantHit=document.getElementById('variantHit');
const cartHit=document.getElementById('cartHit');
const variantPop=document.getElementById('variantPop');
const count=document.getElementById('count');

function money(n){return 'Rp'+new Intl.NumberFormat('id-ID').format(n)}
function productMarkup(p,line,index){
  const meta=lineMeta[line];
  const vi=state[line][index]||0;
  const v=p.variants[vi]||p.variants[0];
  const facts=[
    p.character?`<div class="fact"><b>KARAKTER</b><span>${p.character}</span></div>`:'',
    p.pairing?`<div class="fact"><b>COCOK</b><span>${p.pairing}</span></div>`:''
  ].join('');
  const commerce=v
    ?`<div class="page-commerce"><div><div class="variant-label">VARIAN</div><div class="variant"><span class="page-variant" data-product-index="${index}">${v[0]}</span>${p.variants.length>1?'<span class="chev">⌄</span>':''}</div></div><div class="price-cart"><div class="price page-price" data-product-index="${index}">${money(v[1])}</div><div class="cart page-cart" data-product-index="${index}">${CART_ICON}</div></div></div>`
    :`<div class="page-commerce unavailable-commerce"><div><div class="variant-label">STATUS</div><div class="variant status-only">${p.status||'Belum tersedia'}</div></div></div>`;
  return `<div class="leaf"><div class="photo"><img src="${p.image}" alt="${p.name}"></div><div class="line-signature"><img src="${meta.mark}" alt=""><span>${meta.title}</span></div><div class="content"><h1 class="product-title">${p.name}</h1><p class="lead">${p.lead}</p><div class="notes">${facts}</div>${commerce}</div></div>`;
}
function pageShell(p,line,index){return `<div class="page" data-density="soft" data-product-index="${index}"><div class="page-inner">${productMarkup(p,line,index)}</div></div>`}
function currentProduct(){return sets[activeLine][Math.max(0,Math.min(currentPage,sets[activeLine].length-1))]}
function currentVariantIndex(){return state[activeLine][currentPage]||0}
function updateBookmarks(){document.querySelectorAll('.ribbon').forEach(b=>b.classList.toggle('active',b.dataset.line===activeLine))}
function updateControlState(){const p=currentProduct();const has=!!p?.variants?.length;variantHit.disabled=!has||p.variants.length<2;cartHit.disabled=!has;variantHit.setAttribute('aria-label',has&&p.variants.length>1?'Pilih varian':'Varian');cartHit.setAttribute('aria-label',has?'Tambah ke keranjang':'Produk tidak tersedia')}
function updateRenderedCommerce(){
  const p=currentProduct(); if(!p)return;
  const v=p.variants[currentVariantIndex()];
  if(v){
    bookWrap.querySelectorAll(`.page-variant[data-product-index="${currentPage}"]`).forEach(el=>el.textContent=v[0]);
    bookWrap.querySelectorAll(`.page-price[data-product-index="${currentPage}"]`).forEach(el=>el.textContent=money(v[1]));
  }
  updateControlState();
}
function buildVariantPop(){
  variantPop.innerHTML='';
  const p=currentProduct();
  if(!p||p.variants.length<2){variantPop.classList.remove('open');return}
  const active=currentVariantIndex();
  p.variants.forEach((v,i)=>{
    const btn=document.createElement('button');
    btn.type='button'; btn.className='variant-opt'+(i===active?' active':'');
    btn.innerHTML=`<span>${v[0]}</span><span class="vprice">${money(v[1])}</span>`;
    btn.addEventListener('pointerdown',e=>e.stopPropagation());
    btn.addEventListener('pointerup',e=>e.stopPropagation());
    btn.addEventListener('click',e=>{e.stopPropagation();state[activeLine][currentPage]=i;updateRenderedCommerce();buildVariantPop();variantPop.classList.remove('open')});
    variantPop.appendChild(btn);
  });
}
variantHit.addEventListener('pointerdown',e=>e.stopPropagation());
variantHit.addEventListener('pointerup',e=>e.stopPropagation());
variantHit.addEventListener('click',e=>{e.stopPropagation();if(variantHit.disabled)return;buildVariantPop();variantPop.classList.toggle('open')});
cartHit.addEventListener('pointerdown',e=>e.stopPropagation());
cartHit.addEventListener('pointerup',e=>e.stopPropagation());
cartHit.addEventListener('click',e=>{e.stopPropagation();if(cartHit.disabled)return;cartCount++;count.textContent=cartCount;bookWrap.querySelectorAll(`.page-cart[data-product-index="${currentPage}"]`).forEach(el=>el.classList.add('done'));setTimeout(()=>bookWrap.querySelectorAll(`.page-cart[data-product-index="${currentPage}"]`).forEach(el=>el.classList.remove('done')),650)});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.variant-pop')&&e.target!==variantHit)variantPop.classList.remove('open')},true);
function renderUnderlay(){const arr=sets[activeLine];const next=currentPage<arr.length-1?currentPage+1:currentPage>0?currentPage-1:currentPage;const p=arr[next];bookUnderlay.innerHTML=p?`<div class="page-inner">${productMarkup(p,activeLine,next)}</div>`:''}
function setTurning(on){stage.classList.toggle('engine-turning',!!on)}

function removeReverseCoverage(){
  if(reverseCoverageEl){reverseCoverageEl.remove();reverseCoverageEl=null}
  reverseCoveragePreviousTemplate=null;
  reverseCoverageCurrentTemplate=null;
  reverseCoverageMode='current';
}

function mountBook(line){
  removeReverseCoverage();
  cancelAnimationFrame(reverseRAF); reverseRAF=0;
  reverseActive=false; reversePrevIndex=-1; reverseOriginIndex=-1; reverseProgress=0;
  reverseCommitPending=false; reverseCancelPending=false; reverseOriginalTurnNext=null;
  activeLine=line; currentPage=0; gestureActive=false; setTurning(false); variantPop.classList.remove('open');
  if(pageFlip){try{pageFlip.destroy()}catch{} pageFlip=null}
  book.innerHTML=sets[line].map((p,i)=>pageShell(p,line,i)).join('');
  activeBookEl=book;
  updateBookmarks();
  requestAnimationFrame(initFlip);
}

function initFlip(){
  const w=Math.floor(bookWrap.clientWidth),h=Math.floor(bookWrap.clientHeight);
  activeBookEl.style.width=w+'px'; activeBookEl.style.height=h+'px';
  pageFlip=new St.PageFlip(activeBookEl,{
    width:w,height:h,size:'fixed',showCover:false,usePortrait:true,mobileScrollSupport:false,
    maxShadowOpacity:.30,flippingTime:540,drawShadow:true,autoSize:false,clickEventForward:false,
    useMouseEvents:false,showPageCorners:true
  });
  pageFlip.loadFromHTML(activeBookEl.querySelectorAll('.page'));
  pageFlip.on('flip',e=>{
    currentPage=Math.max(0,Math.min(sets[activeLine].length-1,Number(e.data)||0));
    variantPop.classList.remove('open');
    renderUnderlay(); updateRenderedCommerce(); buildVariantPop();
  });
  pageFlip.on('changeState',e=>{
    if(e.data!=='read')return;
    if(reverseOriginalTurnNext){pageFlip.turnToNextPage=reverseOriginalTurnNext;reverseOriginalTurnNext=null}
    if(reverseCommitPending||reverseCancelPending){
      const wasCancel=reverseCancelPending;
      reverseActive=false; reverseCommitPending=false; reverseCancelPending=false;
      reversePrevIndex=-1; reverseOriginIndex=-1; reverseProgress=0;
      buildVariantPop();
      if(wasCancel)requestAnimationFrame(removeReverseCoverage);
    }
    setTurning(false); renderUnderlay(); updateRenderedCommerce(); updateControlState();
  });
  renderUnderlay(); updateRenderedCommerce(); buildVariantPop();
}

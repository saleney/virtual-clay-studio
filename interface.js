import {loadShelf} from './shelf-store.js';
// Interface layer. The studio scene now uses a floor-standing wheel housing; clay and painting behavior are retained.
const surface=document.querySelector('[data-surface]');
const storageKey='virtual-clay-studio-shelf-v1'+(new URLSearchParams(location.search).has('qa')?'-qa':'');
const stages=[...document.querySelectorAll('[data-process]')];
const grid=document.querySelector('[data-collection-grid]');
let lastCollection='',sessionCollection=null;
function updateInterface(){
 const phase=surface.classList.contains('is-complete')?'complete':surface.classList.contains('is-final-firing')?'finishing':surface.classList.contains('is-glazing')?'glazing':surface.classList.contains('is-firing')?'firing':'throwing';
 const active=phase==='complete'?'finishing':phase;
 for(const [i,step] of stages.entries()){
  if(step.dataset.process===active)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
  step.classList.toggle('is-past',i<stages.findIndex(s=>s.dataset.process===active));
 }
 document.querySelector('.process').setAttribute('aria-label',phase==='complete'?'Pottery process: finished':'Pottery process: '+active);
 updateCollection();
}
function updateCollection(){
 let raw;if(sessionCollection!==null)raw=JSON.stringify(sessionCollection);else try{raw=localStorage.getItem(storageKey)||'[]';}catch{raw='[]';}
 if(raw===lastCollection)return;lastCollection=raw;
 let pieces;try{pieces=JSON.parse(raw);}catch{pieces=[];}
 if(!Array.isArray(pieces))pieces=[];
 pieces=pieces.filter(p=>typeof p.id==='string'&&typeof p.image==='string'&&p.image.startsWith('data:image/png;base64,'));
 grid.replaceChildren();document.querySelector('[data-collection-empty]').hidden=pieces.length>0;
 for(const [i,piece] of pieces.entries()){
  const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption'),number=document.createElement('span'),download=document.createElement('a');
  figure.className='collection-piece';image.src=piece.image;image.loading='lazy';image.alt='Your finished pottery piece '+(i+1);
  number.textContent=String(i+1).padStart(2,'0');download.textContent='Save image';download.href=piece.image;download.download='my-pottery-'+(i+1)+'.png';
  caption.append(number,download);figure.append(image,caption);grid.append(figure);
 }
}
new MutationObserver(updateInterface).observe(surface,{attributes:true,attributeFilter:['class']});
window.addEventListener('clay-shelf-update',event=>{sessionCollection=event.detail.pieces;document.querySelector('.collection-footnote').textContent=event.detail.persisted?'Kept in this browser.':'Some changes are kept only for this visit. Save their images before leaving.';updateCollection();});
window.addEventListener('storage',updateCollection);window.addEventListener('pageshow',updateCollection);
updateInterface();

loadShelf(storageKey).then(pieces=>{if(sessionCollection===null){sessionCollection=pieces;updateCollection();}});

// Move only from the dedicated handle, never from a clay gesture.
const dock=document.querySelector('.slip-tray'),handle=dock.querySelector('.dock-drag');
const toggle=dock.querySelector('.dock-toggle');
function placeDock(x,y){
 const parent=dock.offsetParent.getBoundingClientRect();
 const footer=document.querySelector('.controls').getBoundingClientRect();
 dock.classList.add('is-moved');
 dock.style.left=Math.max(0,Math.min(parent.width-dock.offsetWidth,x-parent.left))+'px';
 dock.style.top=Math.max(0,Math.min(footer.top-parent.top-52-dock.offsetHeight,y-parent.top))+'px';
 dock.style.bottom='auto';
}
function keepDockVisible(){if(dock.classList.contains('is-moved')){const r=dock.getBoundingClientRect();placeDock(r.left,r.top);}}
toggle.addEventListener('click',()=>{const collapsed=dock.classList.toggle('is-minimized');toggle.textContent=collapsed?'+':'−';toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'Expand tool palette':'Minimize tool palette');keepDockVisible();});
function resetDock(){dock.style.removeProperty('left');dock.style.removeProperty('top');dock.style.removeProperty('bottom');dock.classList.remove('is-moved');}
dock.querySelector('.dock-reset').addEventListener('click',resetDock);
let moving=null;
handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=dock.getBoundingClientRect();moving={x:e.clientX-r.left,y:e.clientY-r.top};handle.setPointerCapture(e.pointerId);e.preventDefault();});
handle.addEventListener('pointermove',e=>{if(moving)placeDock(e.clientX-moving.x,e.clientY-moving.y);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(name,()=>moving=null);
window.addEventListener('resize',resetDock);
new ResizeObserver(keepDockVisible).observe(dock);
handle.addEventListener('keydown',e=>{if(e.key==='Escape')resetDock();const moves={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(moves[e.key]){e.preventDefault();const r=dock.getBoundingClientRect(),[x,y]=moves[e.key];placeDock(r.left+x,r.top+y);}});

if(matchMedia('(max-width:620px)').matches)toggle.click();

// Interface layer. The studio scene now uses a floor-standing wheel housing; clay and painting behavior are retained.
const surface=document.querySelector('[data-surface]');
const storageKey='virtual-clay-studio-shelf-v1'+(new URLSearchParams(location.search).has('qa')?'-qa':'');
const stages=[...document.querySelectorAll('[data-process]')];
const grid=document.querySelector('[data-collection-grid]');
let lastCollection='';
function updateInterface(){
 const phase=surface.classList.contains('is-complete')?'complete':surface.classList.contains('is-glazing')?'glazing':surface.classList.contains('is-firing')?'firing':'throwing';
 const active=phase==='complete'?'glazing':phase;
 for(const [i,step] of stages.entries()){
  if(step.dataset.process===active)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
  step.classList.toggle('is-past',i<stages.findIndex(s=>s.dataset.process===active));
 }
 document.querySelector('.process').setAttribute('aria-label',phase==='complete'?'Pottery process: finished and saved':'Pottery process: '+active);
 updateCollection();
}
function updateCollection(){
 let raw;try{raw=localStorage.getItem(storageKey)||'[]';}catch{raw='[]';}
 if(raw===lastCollection)return;lastCollection=raw;
 let pieces;try{pieces=JSON.parse(raw);}catch{pieces=[];}
 if(!Array.isArray(pieces))pieces=[];
 pieces=pieces.filter(p=>typeof p.id==='string'&&typeof p.image==='string'&&p.image.startsWith('data:image/png;base64,')).slice(-6);
 grid.replaceChildren();document.querySelector('[data-collection-empty]').hidden=pieces.length>0;
 for(const [i,piece] of pieces.entries()){
  const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption'),number=document.createElement('span'),download=document.createElement('a');
  figure.className='collection-piece';image.src=piece.image;image.alt='Your finished pottery piece '+(i+1);
  number.textContent=String(i+1).padStart(2,'0');download.textContent='Save image';download.href=piece.image;download.download='my-pottery-'+(i+1)+'.png';
  caption.append(number,download);figure.append(image,caption);grid.append(figure);
 }
}
new MutationObserver(updateInterface).observe(surface,{attributes:true,attributeFilter:['class']});
window.addEventListener('storage',updateCollection);window.addEventListener('pageshow',updateCollection);
updateInterface();

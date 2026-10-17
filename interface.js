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



// Phone-only presentation: move existing semantic controls, never duplicate actions.
const phoneQuery=matchMedia('(max-width:620px)');
const studio=document.querySelector('.studio');
const phoneDock=document.createElement('section');phoneDock.className='phone-dock';phoneDock.setAttribute('aria-label','Studio controls');
const phoneBody=document.createElement('div');phoneBody.className='phone-dock-body';
const phoneBar=document.createElement('div');phoneBar.className='phone-dock-bar';
const settingsButton=document.createElement('button');settingsButton.type='button';settingsButton.className='phone-settings';settingsButton.textContent='Tool settings';settingsButton.setAttribute('aria-expanded','false');
const backButton=document.createElement('button');backButton.type='button';backButton.className='phone-back';backButton.textContent='← Back';
phoneBody.append(backButton);phoneDock.append(phoneBody,phoneBar);studio.append(phoneDock);
const starter=document.querySelector('.clay-amount'),glazes=document.querySelector('.glaze-tray'),bottom=document.querySelector('.bottom-interface'),recovery=document.querySelector('.recovery-controls'),phaseMessage=document.querySelector('.phase-note');
const relocations=[starter,dock,glazes,bottom,recovery,phaseMessage,document.querySelector('.shelf-link')].map(node=>{const marker=document.createComment('desktop position');node.before(marker);return {node,marker};});
const controls=document.querySelector('.controls'),resetButton=document.querySelector('.making-actions [data-new]');
const resetLabel=resetButton.textContent;
let phoneSettings=false,lastPhonePhase='',lastPhoneTool='';
function closePhoneSettings(focus=false){phoneSettings=false;document.querySelectorAll('.carve-settings,.finish-effects').forEach(n=>n.open=false);syncPhoneDock();if(focus)(phoneDock.dataset.phase==='glazing'?glazes.querySelector('summary'):settingsButton).focus();}
function syncPhoneDock(){
 if(!phoneQuery.matches)return;
 const phase=surface.classList.contains('is-complete')?'complete':surface.classList.contains('is-final-firing')?'finishing':surface.classList.contains('is-firing')?'firing':surface.classList.contains('is-glazing')?'glazing':!starter.classList.contains('is-tucked')?'starter':'throwing';
 const tool=document.querySelector('[data-tool][aria-pressed="true"]')?.dataset.tool;
 if(phase!==lastPhonePhase||tool!==lastPhoneTool)phoneSettings=false;
 lastPhonePhase=phase;lastPhoneTool=tool;
 phoneDock.dataset.phase=phase;phoneDock.dataset.activeTool=tool;phoneDock.dataset.settings=String(phoneSettings);
 settingsButton.hidden=!['rib','carve','brush'].includes(tool);settingsButton.setAttribute('aria-expanded',String(phoneSettings));
 if(phoneSettings&&tool==='carve')document.querySelector('.carve-settings').open=true;
}
settingsButton.addEventListener('click',()=>{phoneSettings=true;syncPhoneDock();backButton.focus();});
backButton.addEventListener('click',()=>closePhoneSettings(true));
glazes.querySelector('summary').addEventListener('click',()=>{if(phoneQuery.matches){phoneSettings=true;syncPhoneDock();requestAnimationFrame(()=>backButton.focus());}});
phoneDock.addEventListener('keydown',e=>{if(e.key==='Escape'&&phoneSettings){e.preventDefault();closePhoneSettings(true);}});
function configurePhoneDock(){
 if(phoneQuery.matches){
  resetDock();dock.classList.remove('is-minimized');phoneSettings=false;document.querySelector('.finish-effects').open=false;
  phoneBody.append(starter,dock,glazes,phaseMessage);phoneBar.append(bottom);controls.append(recovery);dock.append(settingsButton); controls.append(bottom.querySelector('.shelf-link')||document.querySelector('.shelf-link'));
  resetButton.textContent='New clay';studio.classList.add('phone-layout');
  syncPhoneDock();
 }else{
  studio.classList.remove('phone-layout');for(const {node,marker} of relocations)marker.after(node);
  settingsButton.remove();resetButton.textContent=resetLabel;phoneSettings=false;
 }
 window.dispatchEvent(new Event('resize'));
}
new MutationObserver(syncPhoneDock).observe(surface,{attributes:true,attributeFilter:['class']});
new MutationObserver(syncPhoneDock).observe(starter,{attributes:true,attributeFilter:['class']});
new MutationObserver(syncPhoneDock).observe(dock.querySelector('.tool-row'),{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
phoneQuery.addEventListener('change',configurePhoneDock);configurePhoneDock();

// Keep phone instructions brief without changing the scene's descriptive messages.
const fullHint=document.querySelector('[data-tool-hint]');
const phoneHint=document.createElement('p');phoneHint.className='phone-tool-hint';phoneHint.setAttribute('role','status');phoneHint.setAttribute('aria-live','polite');fullHint.after(phoneHint);
function updatePhoneHint(){
 const tool=document.querySelector('[data-tool][aria-pressed="true"]')?.dataset.tool;
 const messages={hand:fullHint.textContent.includes('Inside:')?'Down: deepen · Out: widen · Up: lift':'Drag down at center to open.',rib:'Press in/out; lift to shape.',carve:'Drag to carve a shallow groove.',sponge:'Hold to soften tool marks.',brush:fullHint.textContent.startsWith('Slip')?'Brush slip onto the clay.':'Brush water to soften the clay.'};
 phoneHint.textContent=messages[tool]||'';
}
new MutationObserver(updatePhoneHint).observe(fullHint,{childList:true,characterData:true,subtree:true});updatePhoneHint();
// Hold the dock's size through a canvas gesture, even when starter choices disappear.
let phoneDockPointer=null;
document.addEventListener('pointerdown',event=>{if(phoneQuery.matches&&event.target.matches('canvas')&&phoneDockPointer===null){phoneDockPointer=event.pointerId;phoneDock.style.height=phoneDock.getBoundingClientRect().height+'px';}},true);
function releasePhoneDock(event){if(event.pointerId!==phoneDockPointer)return;phoneDockPointer=null;requestAnimationFrame(()=>phoneDock.style.removeProperty('height'));}
for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,releasePhoneDock,true);
new ResizeObserver(()=>window.dispatchEvent(new Event('resize'))).observe(document.querySelector('[data-stage]'));
const phoneStartHint=document.createElement('p');phoneStartHint.className='phone-start-hint';phoneStartHint.textContent='Touch clay to begin';controls.prepend(phoneStartHint);

// Desktop uses a separate native dialog; phones retain the dock settings view.
const effectsDetails=document.querySelector('.finish-effects');
const effectsPanel=document.querySelector('.finish-effects-panel');
const effectsDialog=document.createElement('dialog');effectsDialog.className='desktop-effects-dialog';effectsDialog.setAttribute('aria-labelledby','effects-dialog-title');
const dialogTitle=document.createElement('h2');dialogTitle.id='effects-dialog-title';dialogTitle.textContent='Customize glaze';
const closeEffects=document.createElement('button');closeEffects.type='button';closeEffects.textContent='Done';
effectsDialog.append(dialogTitle,closeEffects);document.body.append(effectsDialog);
function restoreEffects(){effectsDetails.append(effectsPanel);effectsDetails.open=false;}
closeEffects.addEventListener('click',()=>effectsDialog.close());
effectsDialog.addEventListener('close',()=>{restoreEffects();if(!phoneQuery.matches)effectsDetails.querySelector('summary').focus();});
effectsDetails.querySelector('summary').addEventListener('click',event=>{if(phoneQuery.matches)return;event.preventDefault();effectsDetails.open=false;effectsDialog.insertBefore(effectsPanel,closeEffects);effectsDialog.showModal();});
function desktopControls(){if(phoneQuery.matches){if(effectsDialog.open)effectsDialog.close();restoreEffects();}else controls.prepend(recovery);}
phoneQuery.addEventListener('change',desktopControls);desktopControls();

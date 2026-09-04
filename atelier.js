import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const stage = document.querySelector('[data-stage]');
const surface = document.querySelector('[data-surface]');
const status = document.querySelector('[data-status]');
const stageNote = document.querySelector('[data-stage-note]');
const caption = document.querySelector('[data-caption]');
const fallback = document.querySelector('[data-fallback]');
const contact = document.querySelector('[data-contact]');
const savedShelf = document.querySelector('[data-saved-shelf]');
const savedToast = document.querySelector('[data-saved-toast]');
const STORAGE_KEY = 'virtual-clay-studio-pieces-v1';
const materials = {
  terracotta:{color:0x958675,roughness:.72,metalness:0}, porcelain:{color:0xc8bcae,roughness:.53,metalness:0},
  stoneware:{color:0x807667,roughness:.58,metalness:0}, red:{color:0x904332,roughness:.54,metalness:0}, charcoal:{color:0x4d4b49,roughness:.6,metalness:0}
};
const mobile = matchMedia('(max-width:620px)').matches;
const ringCount = mobile ? 42 : 56;
const segments = mobile ? 40 : 56;
const minRadius = .3;
const minGap = .018;
const state = {
  material:'terracotta', fired:false, phase:'form', profile:[], innerProfile:null, surfaceSmooth:[], history:[], redo:[], pointer:null, tool:'hand', slipColor:'cream',
  glaze:{history:[],redo:[],pointer:null,before:null,changed:false},
  yaw:-.42, pitch:0, wheel:{angle:0,speed:0,target:matchMedia('(prefers-reduced-motion:reduce)').matches?.55:4.4,resumeTarget:matchMedia('(prefers-reduced-motion:reduce)').matches?.55:4.4,paused:false}, topDome:.065, localAlterations:[], before:null, strokeChanged:false
};
let renderer, scene, camera, raycaster, pointer, wheelGroup, clay, geometry, material, clayMaps, glazeCanvas, glazeContext, glazeTexture, glazeMesh, glazeMaterial, innerMesh, lastTime=0;

try { init(); } catch (error) { console.error(error); fallback.classList.add('is-visible'); }

function init() {
  renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.04;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex=0; renderer.domElement.setAttribute('aria-label','Three-dimensional pottery wheel. Touch and guide the spinning clay. When focused, use arrow keys to shape its middle.'); stage.append(renderer.domElement);
  scene=new THREE.Scene(); camera=new THREE.PerspectiveCamera(33,1,.1,100); raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2();
  scene.add(new THREE.HemisphereLight(0xfffbf2,0x62594d,1.42));
  const key=new THREE.DirectionalLight(0xffe6c9,2.65); key.position.set(-4.2,5.8,3.4); key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-5; key.shadow.camera.right=5; key.shadow.camera.top=5; key.shadow.camera.bottom=-5; key.shadow.bias=-.00015; key.shadow.normalBias=.025; key.shadow.radius=4; scene.add(key);
  const fill=new THREE.DirectionalLight(0xcbd5d1,.55); fill.position.set(4,2.4,3); scene.add(fill);
  const rim=new THREE.DirectionalLight(0xd5d1c8,.12); rim.position.set(-3,3.6,-4); scene.add(rim);
  wheelGroup=new THREE.Group(); scene.add(wheelGroup);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(2.0,2.16,.38,72),new THREE.MeshStandardMaterial({color:0x292b2b,roughness:.9})); base.position.y=-1.81; base.receiveShadow=true; wheelGroup.add(base);
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(1.86,1.91,.13,72),new THREE.MeshStandardMaterial({color:0xb7bdc0,map:makeWheelHeadTexture(),roughness:.48,metalness:.42})); wheel.position.y=-1.52; wheel.castShadow=true; wheel.receiveShadow=true; wheelGroup.add(wheel);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.8,.032,10,80),new THREE.MeshStandardMaterial({color:0x39322f,roughness:.86})); ring.rotation.x=Math.PI/2; ring.position.y=-1.44; wheelGroup.add(ring);
  const wheelContact=new THREE.Mesh(new THREE.CircleGeometry(1.15,48),new THREE.MeshBasicMaterial({color:0x241914,transparent:true,opacity:.18,depthWrite:false})); wheelContact.rotation.x=-Math.PI/2; wheelContact.position.y=-1.457; wheelGroup.add(wheelContact);
  clayMaps=makeClayMaps();
  makeClay(); renderSavedShelf(); window.addEventListener('resize',resize); resize(); bind(); requestAnimationFrame(render);
}

function initialProfile() {
  return Array.from({length:ringCount},(_,i)=>{
    const t=i/(ringCount-1); const settle=Math.sin(Math.PI*t);
    return {y:-1.43+t*1.46,r:Math.max(minRadius,1.2+.09*settle-.31*Math.pow(t,2.4))};
  });
}
function makeWheelHeadTexture() {
  const canvas=document.createElement('canvas'); canvas.width=canvas.height=256; const ctx=canvas.getContext('2d'); const c=128;
  ctx.fillStyle='#a6aaab';ctx.fillRect(0,0,256,256);
  for(let r=14;r<128;r+=10){ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.strokeStyle=`rgba(52,59,61,${.07+(r%20)/850})`;ctx.lineWidth=1+(r%3);ctx.stroke();}
  for(let i=0;i<22;i++){const a=i*2.399;const r=18+(i*31)%94;ctx.beginPath();ctx.arc(c,c,r,a,a+.18+(i%4)*.08);ctx.strokeStyle='rgba(235,241,240,.17)';ctx.lineWidth=1.2;ctx.stroke();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function makeClayMaps() {
  const size=256; const color=document.createElement('canvas'); const roughness=document.createElement('canvas'); const bump=document.createElement('canvas');
  [color,roughness,bump].forEach(canvas=>{canvas.width=canvas.height=size;});
  const colorData=color.getContext('2d').createImageData(size,size); const roughData=roughness.getContext('2d').createImageData(size,size); const bumpData=bump.getContext('2d').createImageData(size,size);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const i=(y*size+x)*4; const u=x/size; const v=y/size;
    const grain=Math.sin(x*2.73+y*5.19)*.5+Math.sin(x*9.11-y*3.17)*.25;
    const rings=Math.sin(v*132+Math.sin(v*23)*2.3+Math.sin(u*Math.PI*2*2.0)*1.1);
    const streak=Math.max(0,Math.sin(u*Math.PI*2*3.0-v*21))*Math.max(0,Math.sin(u*Math.PI*2*7.0+v*8.0));
    const damp=.5+grain*.16+rings*.07-streak*.11;
    colorData.data[i]=Math.round(206+damp*16); colorData.data[i+1]=Math.round(196+damp*14); colorData.data[i+2]=Math.round(178+damp*11); colorData.data[i+3]=255;
    const rough=Math.max(0,Math.min(255,184-grain*17-rings*12-streak*28)); roughData.data[i]=roughData.data[i+1]=roughData.data[i+2]=rough; roughData.data[i+3]=255;
    const relief=Math.max(0,Math.min(255,128+grain*29+rings*17+streak*12)); bumpData.data[i]=bumpData.data[i+1]=bumpData.data[i+2]=relief; bumpData.data[i+3]=255;
  }
  color.getContext('2d').putImageData(colorData,0,0); roughness.getContext('2d').putImageData(roughData,0,0); bump.getContext('2d').putImageData(bumpData,0,0);
  const makeTexture=(canvas,isColor=false)=>{const texture=new THREE.CanvasTexture(canvas);texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;if(isColor)texture.colorSpace=THREE.SRGBColorSpace;return texture;};
  return {color:makeTexture(color,true),roughness:makeTexture(roughness),bump:makeTexture(bump)};
}
function claySurfaceDetail(ringIndex, segmentIndex) {
  const t=ringIndex/(ringCount-1); const a=segmentIndex/segments*Math.PI*2;
  const smooth=1-(state.surfaceSmooth[ringIndex]||0);const throwingRing=Math.sin(t*Math.PI*31+a*.12+Math.sin(t*11)*.7)*.0035*smooth;
  const softWobble=(Math.sin(a*3.1+t*7.3)*.005+Math.sin(a*7.2-t*13.1)*.0025)*smooth;
  const slipStreak=Math.max(0,Math.sin(a*2.0-t*18.0))*Math.max(0,Math.sin(a*5.2+t*5.4))*.003*smooth;
  const moisture=.965+Math.sin(a*3.1+t*19.2)*.018+Math.sin(a*8.4-t*8.7)*.009;
  return {radius:throwingRing+softWobble+slipStreak, moisture};
}
function makeClay() {
  state.profile=initialProfile(); state.innerProfile=null; state.surfaceSmooth=Array(ringCount).fill(0); state.topDome=.065; state.localAlterations=[]; state.history=[]; state.redo=[]; state.fired=false; state.phase='form'; state.glaze={history:[],redo:[],pointer:null,before:null,changed:false}; surface.classList.remove('is-fired','is-glazing');
  if (clay) wheelGroup.remove(clay); geometry=new THREE.BufferGeometry();
  if (innerMesh) { wheelGroup.remove(innerMesh); innerMesh.geometry.dispose(); innerMesh.material.dispose(); innerMesh=null; }
  if (glazeMesh) { wheelGroup.remove(glazeMesh); glazeMesh.geometry.dispose(); glazeMesh.material.dispose(); glazeMesh=null; }
  glazeCanvas=glazeContext=glazeTexture=glazeMaterial=null;
  material=new THREE.MeshPhysicalMaterial({color:materials[state.material].color,map:clayMaps.color,roughness:materials[state.material].roughness,roughnessMap:clayMaps.roughness,bumpMap:clayMaps.bump,bumpScale:.027,metalness:materials[state.material].metalness,clearcoat:.012,clearcoatRoughness:.82,vertexColors:true,side:THREE.FrontSide,flatShading:false});
  clay=new THREE.Mesh(geometry,material); clay.castShadow=true; clay.receiveShadow=true; wheelGroup.add(clay); rebuildMesh(); makeGlazeLayer(); updateMaterial(); resetView();
}
function rebuildMesh() {
  if(innerMesh){wheelGroup.remove(innerMesh);innerMesh.geometry.dispose();innerMesh.material.dispose();innerMesh=null;}
  const vertices=[]; const colors=[]; const uvs=[]; const indices=[];
  state.profile.forEach((ring,r)=>{for(let s=0;s<segments;s++){const a=s/segments*Math.PI*2;const detail=claySurfaceDetail(r,s);const alteration=localAlterationAt(ring.y,a);const radius=Math.max(minRadius,ring.r+detail.radius+alteration.radial);vertices.push(Math.cos(a)*radius,ring.y+alteration.vertical,Math.sin(a)*radius);colors.push(detail.moisture*1.015,detail.moisture*.985,detail.moisture*.955);uvs.push(s/segments,r/(ringCount-1));}});
  for(let r=0;r<ringCount-1;r++) for(let s=0;s<segments;s++){const next=(s+1)%segments;const a=r*segments+s,b=(r+1)*segments+s,c=(r+1)*segments+next,d=r*segments+next;indices.push(a,b,d,b,c,d);}
  const bottomIndex=vertices.length/3; vertices.push(0,state.profile[0].y,0);colors.push(.94,.9,.86);uvs.push(.5,0); const topIndex=bottomIndex+1; vertices.push(0,state.profile.at(-1).y+state.topDome,0);colors.push(.97,.93,.89);uvs.push(.5,1);
  const hasOpening=Boolean(state.innerProfile?.length);
  for(let s=0;s<segments;s++){const next=(s+1)%segments;indices.push(bottomIndex,next,s);if(!hasOpening){const a=(ringCount-1)*segments+s,b=(ringCount-1)*segments+next;indices.push(topIndex,b,a);}}
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  if(hasOpening)buildInteriorMesh();
}
function buildInteriorMesh(){
  const vertices=[],colors=[],uvs=[],indices=[],top=state.profile.at(-1),inner=state.innerProfile;
  for(let s=0;s<segments;s++){const a=s/segments*Math.PI*2;const alteration=localAlterationAt(top.y,a);const radius=Math.max(minRadius,top.r+alteration.radial);vertices.push(Math.cos(a)*radius,top.y+alteration.vertical,Math.sin(a)*radius);colors.push(.94,.91,.85);uvs.push(s/segments,1);}
  const innerStart=vertices.length/3;
  inner.forEach((ring,r)=>{for(let s=0;s<segments;s++){const a=s/segments*Math.PI*2;const alteration=localAlterationAt(ring.y,a);const radius=Math.max(.018,ring.r+alteration.radial);vertices.push(Math.cos(a)*radius,ring.y+alteration.vertical,Math.sin(a)*radius);colors.push(.94,.91,.85);uvs.push(s/segments,r/(inner.length-1));}});
  for(let r=0;r<inner.length-1;r++)for(let s=0;s<segments;s++){const next=(s+1)%segments;const a=innerStart+r*segments+s,b=innerStart+(r+1)*segments+s,c=innerStart+(r+1)*segments+next,d=innerStart+r*segments+next;indices.push(a,d,b,b,d,c);}
  const floorCenter=vertices.length/3,floor=inner[0];vertices.push(0,floor.y,0);colors.push(.94,.91,.85);uvs.push(.5,0);for(let s=0;s<segments;s++){const next=(s+1)%segments;indices.push(floorCenter,innerStart+s,innerStart+next);}
  const innerTop=innerStart+(inner.length-1)*segments;for(let s=0;s<segments;s++){const next=(s+1)%segments;const oa=s,ob=next,ia=innerTop+s,ib=innerTop+next;indices.push(oa,ob,ia,ob,ib,ia);}
  const innerGeometry=new THREE.BufferGeometry();innerGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));innerGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));innerGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));innerGeometry.setIndex(indices);innerGeometry.computeVertexNormals();
  const innerMaterial=material.clone();innerMaterial.vertexColors=true;innerMaterial.side=THREE.DoubleSide;
  // A tiny warm bounce-light lift keeps the real clay floor readable under its rim.
  innerMaterial.emissive.setHex(0x251a10);innerMaterial.emissiveIntensity=.055;
  innerMesh=new THREE.Mesh(innerGeometry,innerMaterial);innerMesh.castShadow=true;innerMesh.receiveShadow=true;wheelGroup.add(innerMesh);
}
function updateMaterial() { const sample=materials[state.material]; material.color.setHex(sample.color); material.roughness=state.fired?Math.max(.3,sample.roughness-.18):sample.roughness; material.metalness=0; material.clearcoat=state.fired?.1:.012; material.clearcoatRoughness=state.fired?.42:.82; material.needsUpdate=true; }
function makeGlazeLayer() {
  const size=mobile?256:512; glazeCanvas=document.createElement('canvas'); glazeCanvas.width=glazeCanvas.height=size; glazeContext=glazeCanvas.getContext('2d');
  glazeTexture=new THREE.CanvasTexture(glazeCanvas); glazeTexture.colorSpace=THREE.SRGBColorSpace; glazeTexture.wrapS=THREE.RepeatWrapping; glazeTexture.wrapT=THREE.ClampToEdgeWrapping;
  glazeMaterial=new THREE.MeshStandardMaterial({map:glazeTexture,transparent:true,opacity:1,roughness:.88,metalness:0,depthWrite:false,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  glazeMesh=new THREE.Mesh(geometry,glazeMaterial); glazeMesh.renderOrder=2; wheelGroup.add(glazeMesh);
}
function snapshotGlaze(){return glazeContext.getImageData(0,0,glazeCanvas.width,glazeCanvas.height);}
function restoreGlaze(snapshot){glazeContext.putImageData(snapshot,0,0);glazeTexture.needsUpdate=true;}
function readSavedPieces(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]').filter(piece=>piece?.profile?.rings?.length).slice(0,6);}catch{return [];}
}
function pieceThumbnail(piece){
  const canvas=document.createElement('canvas');canvas.width=120;canvas.height=150;const ctx=canvas.getContext('2d');
  const rings=piece.profile.rings,minY=rings[0].y,maxY=rings.at(-1).y+.08,maxR=Math.max(...rings.map(r=>r.r)),cx=60;
  const xScale=46/maxR,yScale=112/(maxY-minY);ctx.beginPath();
  rings.forEach((ring,index)=>{const x=cx-ring.r*xScale,y=132-(ring.y-minY)*yScale;index?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  for(let i=rings.length-1;i>=0;i--){const ring=rings[i];ctx.lineTo(cx+ring.r*xScale,132-(ring.y-minY)*yScale);}ctx.closePath();
  const gradient=ctx.createLinearGradient(16,0,104,0);gradient.addColorStop(0,'#5b4638');gradient.addColorStop(.28,'#b39b82');gradient.addColorStop(.58,'#8d7561');gradient.addColorStop(1,'#49372f');ctx.fillStyle=gradient;ctx.fill();
  if(piece.profile.innerProfile){const rim=rings.at(-1),outer=rim.r*xScale,inner=piece.profile.innerProfile.at(-1).r*xScale,y=132-(rim.y-minY)*yScale;ctx.beginPath();ctx.ellipse(cx,y,outer,Math.max(3,outer*.18),0,0,Math.PI*2);ctx.fillStyle='#b9a48b';ctx.fill();ctx.beginPath();ctx.ellipse(cx,y,inner,Math.max(2,inner*.18),0,0,Math.PI*2);ctx.fillStyle='#3b2d26';ctx.fill();}
  ctx.beginPath();ctx.ellipse(cx,136,45,5,0,0,Math.PI*2);ctx.fillStyle='rgba(34,22,15,.22)';ctx.fill();return canvas.toDataURL('image/png');
}
function renderSavedShelf(){
  if(!savedShelf)return;savedShelf.replaceChildren();readSavedPieces().forEach((piece,index)=>{const button=document.createElement('button'),image=document.createElement('img');button.type='button';button.className='saved-piece';button.setAttribute('aria-label',`Return ${piece.name||`saved piece ${index+1}`} to the wheel`);button.title=piece.name||`Saved piece ${index+1}`;image.src=piece.thumbnail||pieceThumbnail(piece);image.alt='';button.append(image);button.addEventListener('click',()=>restoreSavedPiece(piece));savedShelf.append(button);});
}
function announceSaved(message){if(!savedToast)return;savedToast.textContent=message;savedToast.classList.add('is-visible');clearTimeout(announceSaved.timer);announceSaved.timer=setTimeout(()=>savedToast.classList.remove('is-visible'),2200);}
function keepCurrentPiece(){
  const pieces=readSavedPieces(),number=pieces.length+1,profile=cloneProfile();
  const piece={id:`piece-${Date.now()}`,name:`Atelier piece ${number}`,createdAt:new Date().toISOString(),profile,material:state.material,fired:state.fired,phase:state.phase,glaze:glazeCanvas?.toDataURL('image/png')||null};piece.thumbnail=pieceThumbnail(piece);
  pieces.unshift(piece);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(pieces.slice(0,6)));renderSavedShelf();announceSaved('Your piece is resting on the shelf');status.textContent='Kept. Your piece will still be here when you return.';}catch{status.textContent='This browser could not save the piece. Try freeing some site storage.';}
}
function restoreSavedPiece(piece){
  makeClay();state.profile=piece.profile.rings.map(r=>({...r}));state.innerProfile=piece.profile.innerProfile?.map(r=>({...r}))||null;state.surfaceSmooth=[...piece.profile.surfaceSmooth];state.topDome=piece.profile.topDome;state.localAlterations=piece.profile.localAlterations.map(mark=>({...mark}));state.material=piece.material||'terracotta';state.fired=Boolean(piece.fired);state.phase=piece.phase||'glaze';rebuildMesh();updateMaterial();surface.classList.toggle('is-fired',state.fired);surface.classList.toggle('is-glazing',state.phase==='glaze');
  if(piece.glaze){const image=new Image();image.onload=()=>{glazeContext.clearRect(0,0,glazeCanvas.width,glazeCanvas.height);glazeContext.drawImage(image,0,0,glazeCanvas.width,glazeCanvas.height);glazeTexture.needsUpdate=true;};image.src=piece.glaze;}
  stageNote.textContent=state.phase==='glaze'?'touch the turning ceramic':'touch the spinning clay';status.textContent=`${piece.name||'Your saved piece'} returned to the wheel.`;announceSaved('Returned from your shelf');
}
function paintGlaze(uv,speed=0){
  if(!uv||!glazeContext)return; const clayHex=materials[state.material].color;const colors={clay:[clayHex>>16&255,clayHex>>8&255,clayHex&255],cream:[198,177,142],rust:[154,80,56],brown:[71,51,41],charcoal:[54,54,56]};const [red,green,blue]=colors[state.slipColor];const size=glazeCanvas.width; const x=uv.x*size; const y=(1-uv.y)*size; const radius=mobile?14:20; const alpha=Math.max(.018,.05/(1+speed*.055));
  [-size,0,size].forEach(offset=>{const gradient=glazeContext.createRadialGradient(x+offset,y,0,x+offset,y,radius);gradient.addColorStop(0,`rgba(${red}, ${green}, ${blue}, ${alpha})`);gradient.addColorStop(.3,`rgba(${red}, ${green}, ${blue}, ${alpha*.62})`);gradient.addColorStop(.72,`rgba(${red}, ${green}, ${blue}, ${alpha*.14})`);gradient.addColorStop(1,`rgba(${red}, ${green}, ${blue}, 0)`);glazeContext.fillStyle=gradient;glazeContext.beginPath();glazeContext.arc(x+offset,y,radius,0,Math.PI*2);glazeContext.fill();});
  glazeTexture.needsUpdate=true;state.glaze.changed=true;
}
function carveSlip(uv){
  if(!uv||!glazeContext)return;const size=glazeCanvas.width,x=uv.x*size,y=(1-uv.y)*size,radius=mobile?8:12;glazeContext.save();glazeContext.globalCompositeOperation='destination-out';[-size,0,size].forEach(offset=>{const gradient=glazeContext.createRadialGradient(x+offset,y,0,x+offset,y,radius);gradient.addColorStop(0,'rgba(0,0,0,.7)');gradient.addColorStop(1,'rgba(0,0,0,0)');glazeContext.fillStyle=gradient;glazeContext.beginPath();glazeContext.arc(x+offset,y,radius,0,Math.PI*2);glazeContext.fill();});glazeContext.restore();glazeTexture.needsUpdate=true;state.glaze.changed=true;
}
function softenSlip(uv){
  if(!uv||!glazeContext)return;const size=glazeCanvas.width,x=Math.round(uv.x*size),y=Math.round((1-uv.y)*size),radius=mobile?12:17,left=Math.max(0,x-radius),top=Math.max(0,y-radius),width=Math.min(radius*2,size-left),height=Math.min(radius*2,size-top);const image=glazeContext.getImageData(left,top,width,height),data=image.data,copy=new Uint8ClampedArray(data);for(let row=1;row<height-1;row++)for(let col=1;col<width-1;col++){const index=(row*width+col)*4;for(let channel=0;channel<4;channel++)data[index+channel]=(copy[index+channel]+copy[index-4+channel]+copy[index+4+channel]+copy[index-width*4+channel]+copy[index+width*4+channel])/5;}glazeContext.putImageData(image,left,top);glazeTexture.needsUpdate=true;state.glaze.changed=true;
}
function applyHeldGlaze(){if(state.phase!=='glaze'||!state.glaze.pointer)return;const hit=getHitAt(state.glaze.pointer.x,state.glaze.pointer.y);if(hit?.uv)paintGlaze(hit.uv,state.glaze.pointer.speed);}
function enterGlaze(){if(state.phase!=='fired')return;state.phase='glaze';surface.classList.add('is-glazing');makeGlazeLayer();stageNote.textContent='touch the turning ceramic';caption.textContent='Hold still for a band. Drift up or down for a spiral. Every pass leaves more glaze.';status.textContent='The wheel keeps turning. Touch the vessel and let the glaze gather.';}
function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=mobile?54:36;camera.updateProjectionMatrix();}
function setCamera(){const radius=7.15;camera.position.set(Math.sin(state.yaw)*radius,2.68+state.pitch*.2,Math.cos(state.yaw)*radius);camera.lookAt(0,-.54,0);}
function render(time){const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;const acceleration=reduced?1.35:2.5;state.wheel.speed=THREE.MathUtils.damp(state.wheel.speed,state.wheel.target,acceleration,dt);state.wheel.angle+=state.wheel.speed*dt;wheelGroup.rotation.y=state.wheel.angle;setCamera();applyHeldGlaze();renderer.render(scene,camera);requestAnimationFrame(render);}
function getHitAt(clientX,clientY){
  const r=renderer.domElement.getBoundingClientRect();
  pointer.x=((clientX-r.left)/r.width)*2-1;pointer.y=-((clientY-r.top)/r.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  // Once a hollow exists, the inner surface is a real, separate mesh. Raycast it
  // too so a gesture that begins inside the pot is never mistaken for an outside
  // wall gesture.
  const targets=innerMesh?[innerMesh,clay]:[clay];
  return raycaster.intersectObjects(targets,false)[0]||null;
}
function getHit(event){return getHitAt(event.clientX,event.clientY);}
function wrappedAngleDistance(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b));}
function localAlterationAt(y,angle){return state.localAlterations.reduce((total,mark)=>{const height=(y-mark.y)/mark.heightRadius;const arc=wrappedAngleDistance(angle,mark.angle)/mark.angleRadius;const falloff=Math.exp(-.5*(height*height+arc*arc));total.radial+=mark.radialDelta*falloff;total.vertical+=(mark.verticalDelta||0)*falloff;return total;},{radial:0,vertical:0});}
function restoreTowardSymmetry(hit,strength,heightRadius,angleRadius){
  if(!hit||hit.object!==clay||!state.localAlterations.length)return false;
  const local=wheelGroup.worldToLocal(hit.point.clone());let changed=false;
  state.localAlterations=state.localAlterations.filter(mark=>{
    const height=(local.y-mark.y)/heightRadius,arc=wrappedAngleDistance(Math.atan2(local.z,local.x),mark.angle)/angleRadius;const influence=Math.exp(-.5*(height*height+arc*arc));
    if(influence>.001){const damp=1-strength*influence;mark.radialDelta*=damp;mark.verticalDelta=(mark.verticalDelta||0)*damp;changed=true;}
    return Math.abs(mark.radialDelta)>=.0015||Math.abs(mark.verticalDelta||0)>=.0015;
  });
  if(changed){rebuildMesh();state.strokeChanged=true;}return changed;
}
function cloneProfile(){return {rings:state.profile.map(r=>({...r})),innerProfile:state.innerProfile?.map(r=>({...r}))||null,surfaceSmooth:[...state.surfaceSmooth],topDome:state.topDome,localAlterations:state.localAlterations.map(mark=>({...mark}))};}
function saveBeforeStroke(){state.before=cloneProfile();state.strokeChanged=false;}
function finishStroke(){if(state.strokeChanged){state.history.push(state.before);if(state.history.length>18)state.history.shift();state.redo=[];}state.before=null;}
function profileIndexFromHit(hit){const local=wheelGroup.worldToLocal(hit.point.clone());let closest=0;let best=Infinity;state.profile.forEach((ring,i)=>{const d=Math.abs(ring.y-local.y);if(d<best){best=d;closest=i;}});return closest;}
function stabilizeProfile(){
  const baseY=-1.43; const maxTop=1.03; const maxSlope=.038; const maxGap=.052;
  state.profile[0].y=baseY;
  for(let i=1;i<state.profile.length;i++)state.profile[i].y=THREE.MathUtils.clamp(state.profile[i].y,state.profile[i-1].y+minGap,state.profile[i-1].y+maxGap);
  const top=state.profile.at(-1).y;
  if(top>maxTop){const scale=(maxTop-baseY)/(top-baseY);state.profile.forEach(ring=>ring.y=baseY+(ring.y-baseY)*scale);}
  for(let i=1;i<state.profile.length;i++)state.profile[i].r=THREE.MathUtils.clamp(state.profile[i].r,state.profile[i-1].r-maxSlope,state.profile[i-1].r+maxSlope);
  for(let i=state.profile.length-2;i>=0;i--)state.profile[i].r=THREE.MathUtils.clamp(state.profile[i].r,state.profile[i+1].r-maxSlope,state.profile[i+1].r+maxSlope);
}
function smoothProfileRadius(index,buffer=14,passes=3){
  const from=Math.max(1,index-buffer),to=Math.min(state.profile.length-2,index+buffer);
  for(let pass=0;pass<passes;pass++){
    const next=state.profile.map(ring=>ring.r);
    for(let i=from;i<=to;i++)next[i]=state.profile[i-1].r*.21+state.profile[i].r*.58+state.profile[i+1].r*.21;
    for(let i=from;i<=to;i++)state.profile[i].r=next[i];
  }
}
function applyRadius(index,amount){
  const limited=THREE.MathUtils.clamp(amount,-.032,.032),sigma=8.4;
  state.profile.forEach((ring,i)=>{const d=i-index;if(Math.abs(d)>18)return;const falloff=Math.exp(-(d*d)/(2*sigma*sigma));ring.r=THREE.MathUtils.clamp(ring.r+limited*falloff,minRadius,1.42);});
  smoothProfileRadius(index);stabilizeProfile();
}
function applyHeight(index,amount){
  const limited=THREE.MathUtils.clamp(amount,-.028,.028),sigma=8.8;
  state.profile.forEach((ring,i)=>{const d=i-index;if(Math.abs(d)>19)return;const falloff=Math.exp(-(d*d)/(2*sigma*sigma));ring.y+=limited*falloff;});
  stabilizeProfile();
}
function applySponge(index){
  state.surfaceSmooth.forEach((amount,i)=>{const d=i-index;if(Math.abs(d)>10)return;const falloff=Math.exp(-(d*d)/(2*4.5*4.5));state.surfaceSmooth[i]=THREE.MathUtils.clamp(amount+.075*falloff,0,1);});
  // On solid clay, repeated top sponge passes gently round the cap into a mound.
  // Once opened, this remains ordinary rim/surface smoothing and never fills it.
  if(!state.innerProfile&&index>=ringCount-7){state.topDome=THREE.MathUtils.clamp(state.topDome+.012,.065,.18);smoothProfileRadius(ringCount-1,9,2);}
  else smoothProfileRadius(index,5,1);
  stabilizeProfile();rebuildMesh();state.strokeChanged=true;
}
function applyCarve(index){state.profile.forEach((ring,i)=>{const d=i-index;if(Math.abs(d)>3)return;const falloff=Math.exp(-(d*d)/(2*1.15*1.15));ring.r=THREE.MathUtils.clamp(ring.r-.014*falloff,minRadius,1.42);});stabilizeProfile();rebuildMesh();state.strokeChanged=true;}
function editProfile(index,radial,vertical){
  // The vessel spins in world space, but its profile remains axisymmetric. Screen motion is
  // therefore mapped to a stable ring index instead of chasing individual rotating vertices.
  if(Math.abs(vertical)>Math.abs(radial)*1.12) applyHeight(index,-vertical*.00115);
  else applyRadius(index,radial*.0018);
  rebuildMesh();state.strokeChanged=true;
}
function moveContact(clientX,clientY,active){
  if(!contact)return;const r=renderer.domElement.getBoundingClientRect();contact.style.left=`${clientX-r.left}px`;contact.style.top=`${clientY-r.top}px`;contact.className=`contact contact--${state.tool}`;contact.classList.toggle('is-active',active);
}
function outwardScreenDirection(local,clientX,clientY){
  const r=renderer.domElement.getBoundingClientRect();const point=wheelGroup.localToWorld(local.clone());const radial=new THREE.Vector3(local.x,0,local.z).normalize().transformDirection(wheelGroup.matrixWorld);const ahead=point.clone().add(radial.multiplyScalar(.22));
  point.project(camera);ahead.project(camera);let x=(ahead.x-point.x)*r.width*.5,y=-(ahead.y-point.y)*r.height*.5,length=Math.hypot(x,y);
  // A front-facing wall normal points almost directly at the camera, so it has
  // no useful screen direction. In that one case, use the visible direction
  // away from the vessel axis—the same intuitive push/pull cue a potter sees.
  if(length<5){const axis=wheelGroup.localToWorld(new THREE.Vector3(0,local.y,0)).project(camera);x=clientX-(axis.x+1)*r.width*.5;y=clientY-(-axis.y+1)*r.height*.5;length=Math.hypot(x,y);}
  length=length||1;return {x:x/length,y:y/length};
}
function outerRadiusAt(y){
  for(let i=1;i<state.profile.length;i++){const a=state.profile[i-1],b=state.profile[i];if(y<=b.y){const t=THREE.MathUtils.clamp((y-a.y)/(b.y-a.y),0,1);return THREE.MathUtils.lerp(a.r,b.r,t);}}
  return state.profile.at(-1).r;
}
function setInterior(depth,radius){
  const top=state.profile.at(-1).y;const floorY=THREE.MathUtils.clamp(top-depth,state.profile[0].y+.22,top-.025);const outerAtFloor=outerRadiusAt(floorY);const maxRadius=Math.max(.035,Math.min(outerAtFloor-.16,state.profile.at(-1).r-.12));const rimRadius=THREE.MathUtils.clamp(radius,.08,maxRadius);const floorRadius=Math.max(.035,rimRadius*.58);const lift=top-floorY;
  const innerRings=9;
  state.innerProfile=Array.from({length:innerRings},(_,index)=>{
    const t=index/(innerRings-1), eased=t*t*(3-2*t);
    return {y:THREE.MathUtils.lerp(floorY,top,t),r:THREE.MathUtils.lerp(floorRadius,rimRadius,eased)};
  });
  rebuildMesh();state.strokeChanged=true;
}
function interiorInfo(){if(!state.innerProfile)return null;const floor=state.innerProfile[0],rim=state.innerProfile.at(-1);return {depth:state.profile.at(-1).y-floor.y,radius:rim.r,floorY:floor.y};}
function openClay(depthDelta,radiusDelta=0){
  const current=interiorInfo();
  // The first press makes a small, visible well—not a preset bowl. A readable
  // target lets the next outward pull continue the same clay action.
  const depthBase=current?.depth||.07;const radiusBase=current?.radius||.14;
  setInterior(THREE.MathUtils.clamp(depthBase+depthDelta,.052,.62),THREE.MathUtils.clamp(radiusBase+radiusDelta,.08,.58));
}
function widenInterior(amount){
  if(!state.innerProfile)return;
  // Pulling from inside moves the inner floor most. The upper inner rings follow
  // softly, so the outside silhouette stays put while a believable wall develops.
  const last=state.innerProfile.length-1;
  state.innerProfile.forEach((ring,index)=>{
    const falloff=THREE.MathUtils.lerp(1,.48,index/last);
    const safeRadius=Math.max(.018,outerRadiusAt(ring.y)-.16);
    ring.r=THREE.MathUtils.clamp(ring.r+amount*falloff,.018,safeRadius);
  });
  // Soften only the inner floor-to-wall transition, retaining its overall pull.
  for(let pass=0;pass<2;pass++){
    const next=state.innerProfile.map(ring=>ring.r);
    for(let i=1;i<state.innerProfile.length-1;i++)next[i]=state.innerProfile[i-1].r*.16+state.innerProfile[i].r*.68+state.innerProfile[i+1].r*.16;
    for(let i=1;i<state.innerProfile.length-1;i++)state.innerProfile[i].r=next[i];
  }
  rebuildMesh();state.strokeChanged=true;
}
function onDown(event){
  renderer.domElement.focus();renderer.domElement.setPointerCapture(event.pointerId);const hit=getHit(event);if(!hit)return;
  if(state.phase==='glaze'||(state.phase==='form'&&state.tool==='brush')){state.glaze.before=snapshotGlaze();state.glaze.changed=false;state.glaze.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,speed:0};paintGlaze(hit.uv);return;}
  if(state.phase!=='form')return;const r=renderer.domElement.getBoundingClientRect();const index=profileIndexFromHit(hit);const local=wheelGroup.worldToLocal(hit.point.clone());const top=state.profile.at(-1).y;const radial=Math.hypot(local.x,local.z);const rimRadius=state.innerProfile?.at(-1).r||0;
  if(state.wheel.paused&&state.tool==='hand'&&state.innerProfile&&local.y>top-.14&&radial>rimRadius-.09){state.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,mode:'alter-rim',outward:outwardScreenDirection(local,event.clientX,event.clientY),alteration:{y:top,angle:Math.atan2(local.z,local.x),radialDelta:0,verticalDelta:0,heightRadius:.13,angleRadius:.26}};saveBeforeStroke();moveContact(event.clientX,event.clientY,true);status.textContent='Lift, lower, flare, or tuck one small section of the rim.';return;}
  if(state.wheel.paused&&state.tool==='hand'&&hit.object===clay&&local.y>state.profile[0].y+.18&&local.y<top-.2){state.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,mode:'alter',outward:outwardScreenDirection(local,event.clientX,event.clientY),alteration:{y:local.y,angle:Math.atan2(local.z,local.x),radialDelta:0,heightRadius:.14,angleRadius:.32}};saveBeforeStroke();moveContact(event.clientX,event.clientY,true);status.textContent='Push inward for a dent, or pull outward for a small bulge.';return;}
  const upperCenter=local.y>top-.2&&radial<state.profile.at(-1).r*.72;
  // Keep the newly opened interior forgivingly tappable from this elevated view.
  const inside=state.innerProfile&&(hit.object===innerMesh||(radial<=state.innerProfile.at(-1).r+.12&&local.y>=state.innerProfile[0].y-.04));
  state.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,axisX:r.left+r.width/2,index,mode:state.tool==='sponge'?'sponge':(state.tool==='carve'?'carve':(inside?'inside':(upperCenter?'start':'outside')))};saveBeforeStroke();moveContact(event.clientX,event.clientY,true);
}
function onMove(event){
  if(state.glaze.pointer?.id===event.pointerId){const dx=event.clientX-state.glaze.pointer.x,dy=event.clientY-state.glaze.pointer.y;state.glaze.pointer.x=event.clientX;state.glaze.pointer.y=event.clientY;state.glaze.pointer.speed=Math.hypot(dx,dy);const hit=getHitAt(event.clientX,event.clientY);if(state.tool==='carve')carveSlip(hit?.uv);else if(state.tool==='sponge')softenSlip(hit?.uv);else paintGlaze(hit?.uv,state.glaze.pointer.speed);return;}
  if(!state.pointer){if(event.pointerType==='mouse')moveContact(event.clientX,event.clientY,true);return;}if(state.phase!=='form'||state.pointer.id!==event.pointerId)return;const rawX=event.clientX-state.pointer.x,rawY=event.clientY-state.pointer.y;const dx=THREE.MathUtils.clamp(rawX,-18,18),dy=THREE.MathUtils.clamp(rawY,-18,18);if(Math.hypot(dx,dy)<2)return;const side=Math.sign(state.pointer.x-state.pointer.axisX)||1;const radial=dx*side;const vertical=Math.abs(dy)>Math.abs(dx)*1.12;
  if(state.pointer.mode==='alter'){const dragX=event.clientX-state.pointer.startX,dragY=event.clientY-state.pointer.startY;const signedDistance=dragX*state.pointer.outward.x+dragY*state.pointer.outward.y;const amount=THREE.MathUtils.clamp(signedDistance*.0019,-.115,.105);if(Math.abs(amount)<.012)return;state.pointer.alteration.radialDelta=amount;if(!state.pointer.alterationSaved){state.localAlterations.push(state.pointer.alteration);state.pointer.alterationSaved=true;}rebuildMesh();state.strokeChanged=true;status.textContent=amount<0?'One small dent stays where your hand left it.':'One small outward pull stays where your hand left it.';}
  else if(state.pointer.mode==='alter-rim'){const dragX=event.clientX-state.pointer.startX,dragY=event.clientY-state.pointer.startY;const mostlyVertical=Math.abs(dragY)>Math.abs(dragX)*1.15,mostlyHorizontal=Math.abs(dragX)>Math.abs(dragY)*1.15;const radialAmount=mostlyVertical?0:THREE.MathUtils.clamp((dragX*state.pointer.outward.x+dragY*state.pointer.outward.y)*.00165,-.085,.085);const verticalAmount=mostlyHorizontal?0:THREE.MathUtils.clamp(-dragY*.00165,-.1,.1);if(Math.max(Math.abs(radialAmount),Math.abs(verticalAmount))<.01)return;state.pointer.alteration.radialDelta=radialAmount;state.pointer.alteration.verticalDelta=verticalAmount;if(!state.pointer.alterationSaved){state.localAlterations.push(state.pointer.alteration);state.pointer.alterationSaved=true;}rebuildMesh();state.strokeChanged=true;status.textContent=mostlyVertical?(verticalAmount>0?'One rim section lifts softly.':'One rim section settles softly.'):(radialAmount>0?'One rim section flares outward.':'One rim section tucks inward.');}
  else if(state.pointer.mode==='sponge'){applySponge(state.pointer.index);softenSlip(getHit(event)?.uv);status.textContent='The sponge settles the clay into a softer curve.';}
  else if(state.pointer.mode==='carve'){applyCarve(state.pointer.index);carveSlip(getHit(event)?.uv);status.textContent='A small groove gathers beneath the carving tool.';}
  else if(state.pointer.mode==='start'&&dy>0){openClay(dy*.0017);state.pointer.mode='inside';status.textContent='A small clay floor appears beneath the cursor.';}
  else if(state.pointer.mode==='inside'){
    if(dy>0&&Math.abs(dy)>Math.abs(dx)*.72){openClay(dy*.00155);status.textContent='The inner floor deepens, held above the wheel.';}
    else if(Math.abs(dx)>1){widenInterior(Math.abs(dx)*.0027);status.textContent='The inner floor travels outward; the outside stays steady.';}
  }
  else {
    editProfile(state.pointer.index,radial,dy);
    if(!state.wheel.paused&&state.tool==='hand'&&restoreTowardSymmetry(getHit(event),.07,.28,.58))status.textContent='Your hands gently work this part back toward center.';
    if(state.tool==='rib') { smoothProfileRadius(state.pointer.index,18,4); stabilizeProfile(); rebuildMesh(); if(!state.wheel.paused&&restoreTowardSymmetry(getHit(event),.18,.34,.7))status.textContent='The rib steadily brings this part back toward center.'; }
  }
  state.pointer.x=event.clientX;state.pointer.y=event.clientY;moveContact(event.clientX,event.clientY,true);
}
function onUp(event){
  if(state.glaze.pointer?.id===event.pointerId){if(state.glaze.changed){state.glaze.history.push(state.glaze.before);if(state.glaze.history.length>18)state.glaze.history.shift();state.glaze.redo=[];}state.glaze.before=null;state.glaze.pointer=null;return;}
  if(state.pointer?.id===event.pointerId){finishStroke();state.pointer=null;contact?.classList.remove('is-active');}
}
function restore(snapshot){state.profile=snapshot.rings.map(r=>({...r}));state.innerProfile=snapshot.innerProfile?.map(r=>({...r}))||null;state.surfaceSmooth=snapshot.surfaceSmooth?[...snapshot.surfaceSmooth]:Array(ringCount).fill(0);state.topDome=snapshot.topDome??.065;state.localAlterations=snapshot.localAlterations?.map(mark=>({...mark}))||[];rebuildMesh();}
function resetView(){state.yaw=-.42;state.pitch=0;}
function fire(){if(state.phase!=='form')return;state.fired=true;state.phase='fired';surface.classList.add('is-fired');material.color.lerp(new THREE.Color(0x70402f),.18);updateMaterial();status.textContent='Fired. The wheel keeps turning while the surface waits for glaze.';}
function keyboardShape(event){const key=event.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)||state.phase!=='form')return;event.preventDefault();saveBeforeStroke();const middle=Math.floor(state.profile.length/2);if(key==='ArrowLeft')applyRadius(middle,-.045);if(key==='ArrowRight')applyRadius(middle,.045);if(key==='ArrowUp')applyHeight(middle,.035);if(key==='ArrowDown')applyHeight(middle,-.035);rebuildMesh();state.strokeChanged=true;finishStroke();status.textContent={ArrowLeft:'The middle draws inward.',ArrowRight:'The middle opens outward.',ArrowUp:'The middle lifts.',ArrowDown:'The middle settles.'}[key];}
function undo(){if(state.phase==='glaze'){const previous=state.glaze.history.pop();if(!previous){status.textContent='No glaze stroke to undo yet.';return;}state.glaze.redo.push(snapshotGlaze());restoreGlaze(previous);status.textContent='One glaze gesture lifted away.';return;}const previous=state.history.pop();if(!previous){status.textContent='Nothing to undo yet.';return;}state.redo.push(cloneProfile());restore(previous);status.textContent='One whole clay gesture gently lifted away.';}
function redo(){if(state.phase==='glaze'){const next=state.glaze.redo.pop();if(!next){status.textContent='No glaze stroke to redo yet.';return;}state.glaze.history.push(snapshotGlaze());restoreGlaze(next);status.textContent='The glaze gesture returned.';return;}const next=state.redo.pop();if(!next){status.textContent='Nothing to redo yet.';return;}state.history.push(cloneProfile());restore(next);status.textContent='The clay gesture returned.';}
function selectTool(tool){state.tool=tool;document.querySelectorAll('[data-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tool===tool)));status.textContent={hand:'Your hands are back on the clay.',brush:'The slip brush is ready.',carve:'Carve back through the slip.',sponge:'The sponge will soften nearby slip.',rib:'The rib will gently settle the outer curve.'}[tool];}
function selectSlipColor(color){state.slipColor=color;document.querySelectorAll('[data-slip-color]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.slipColor===color)));status.textContent=`${color} slip is ready for the brush.`;}
function bind(){
  renderer.domElement.addEventListener('pointerdown',onDown); renderer.domElement.addEventListener('pointermove',onMove); renderer.domElement.addEventListener('pointerleave',()=>contact?.classList.remove('is-active')); renderer.domElement.addEventListener('pointerup',onUp); renderer.domElement.addEventListener('pointercancel',onUp); renderer.domElement.addEventListener('keydown',keyboardShape);
  document.querySelectorAll('[data-undo]').forEach(button=>button.addEventListener('click',undo)); document.querySelectorAll('[data-redo]').forEach(button=>button.addEventListener('click',redo)); document.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>selectTool(button.dataset.tool))); document.querySelectorAll('[data-slip-color]').forEach(button=>button.addEventListener('click',()=>selectSlipColor(button.dataset.slipColor)));
  const wheelSpeed=document.querySelector('[data-wheel-speed]'), wheelSpeedValue=document.querySelector('[data-wheel-speed-value]'), wheelToggle=document.querySelector('[data-wheel-toggle]');
  if(wheelSpeed&&wheelSpeedValue){
    wheelSpeed.value=state.wheel.target; wheelSpeedValue.textContent=Number(state.wheel.target).toFixed(1);
    wheelSpeed.addEventListener('input',()=>{const speed=Number(wheelSpeed.value);state.wheel.resumeTarget=speed;if(!state.wheel.paused)state.wheel.target=speed;wheelSpeedValue.textContent=speed.toFixed(1);status.textContent=state.wheel.paused?'The wheel is paused; its next speed is set.':speed===0?'The wheel comes to rest.':`Wheel speed: ${speed.toFixed(1)}.`;});
  }
  wheelToggle?.addEventListener('click',()=>{
    state.wheel.paused=!state.wheel.paused;
    if(state.wheel.paused){state.wheel.resumeTarget=state.wheel.target;state.wheel.target=0;state.wheel.speed=0;wheelToggle.textContent='Resume wheel';wheelToggle.setAttribute('aria-pressed','true');status.textContent='The wheel rests. Press and drag one outer spot to leave a small dent.';}
    else {state.wheel.target=state.wheel.resumeTarget;wheelToggle.textContent='Pause wheel';wheelToggle.setAttribute('aria-pressed','false');status.textContent='The wheel turns again; the dent travels with the clay.';}
  });
  document.querySelector('[data-fire]')?.addEventListener('click',fire); document.querySelector('[data-glaze]')?.addEventListener('click',enterGlaze); document.querySelector('[data-back]')?.addEventListener('click',()=>{state.fired=false;state.phase='form';surface.classList.remove('is-fired');updateMaterial();status.textContent='Back at the table. The clay is yours again.';});
  document.querySelector('[data-keep]')?.addEventListener('click',keepCurrentPiece);
  document.querySelectorAll('[data-new]').forEach(button=>button.addEventListener('click',()=>{makeClay();caption.textContent='Guide the clay outward or inward; lift it up or settle it down. With the clay focused, arrow keys shape its middle.';stageNote.textContent='touch the spinning clay';status.textContent='Fresh clay. The wheel keeps turning.';}));
}

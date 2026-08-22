import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const stage = document.querySelector('[data-stage]');
const surface = document.querySelector('[data-surface]');
const status = document.querySelector('[data-status]');
const stageNote = document.querySelector('[data-stage-note]');
const caption = document.querySelector('[data-caption]');
const fallback = document.querySelector('[data-fallback]');
const hands = document.querySelector('[data-hands]');
const materials = {
  terracotta:{color:0x8e6b5a,roughness:.55,metalness:0}, porcelain:{color:0xc8bcae,roughness:.53,metalness:0},
  stoneware:{color:0x807667,roughness:.58,metalness:0}, red:{color:0x904332,roughness:.54,metalness:0}, charcoal:{color:0x4d4b49,roughness:.6,metalness:0}
};
const mobile = matchMedia('(max-width:620px)').matches;
const ringCount = mobile ? 36 : 46;
const segments = mobile ? 40 : 56;
const minRadius = .3;
const minGap = .045;
const state = {
  material:'terracotta', fired:false, phase:'form', profile:[], opening:{radius:0,depth:0}, history:[], redo:[], pointer:null,
  glaze:{history:[],redo:[],pointer:null,before:null,changed:false},
  yaw:-.08, pitch:0, wheel:{angle:0,speed:0,target:matchMedia('(prefers-reduced-motion:reduce)').matches?.55:4.4}, before:null, strokeChanged:false
};
let renderer, scene, camera, raycaster, pointer, wheelGroup, clay, geometry, material, clayMaps, glazeCanvas, glazeContext, glazeTexture, glazeMesh, glazeMaterial, innerWall, lastTime=0;

try { init(); } catch (error) { console.error(error); fallback.classList.add('is-visible'); }

function init() {
  renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.04;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex=0; renderer.domElement.setAttribute('aria-label','Three-dimensional pottery wheel. Touch and guide the spinning clay. When focused, use arrow keys to shape its middle.'); stage.append(renderer.domElement);
  scene=new THREE.Scene(); camera=new THREE.PerspectiveCamera(33,1,.1,100); raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2();
  scene.add(new THREE.HemisphereLight(0xfffbf2,0x62594d,1.42));
  const key=new THREE.DirectionalLight(0xfff0d5,3.5); key.position.set(-5,5.2,4.5); key.castShadow=true; key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-5; key.shadow.camera.right=5; key.shadow.camera.top=5; key.shadow.camera.bottom=-5; key.shadow.bias=-.00015; key.shadow.normalBias=.025; key.shadow.radius=4; scene.add(key);
  const fill=new THREE.DirectionalLight(0xd5e4e3,.78); fill.position.set(4,2.4,3); scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffe1b8,.38); rim.position.set(-3,3.6,-4); scene.add(rim);
  wheelGroup=new THREE.Group(); scene.add(wheelGroup);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(2.72,2.95,.48,72),new THREE.MeshStandardMaterial({color:0x47372e,roughness:.88})); base.position.y=-1.78; base.receiveShadow=true; wheelGroup.add(base);
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.58,.17,72),new THREE.MeshStandardMaterial({color:0x80614a,map:makeWheelHeadTexture(),roughness:.72})); wheel.position.y=-1.425; wheel.castShadow=true; wheel.receiveShadow=true; wheelGroup.add(wheel);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.42,.045,10,80),new THREE.MeshStandardMaterial({color:0x33261f,roughness:.82})); ring.rotation.x=Math.PI/2; ring.position.y=-1.315; wheelGroup.add(ring);
  const contact=new THREE.Mesh(new THREE.CircleGeometry(1.16,48),new THREE.MeshBasicMaterial({color:0x241914,transparent:true,opacity:.25,depthWrite:false})); contact.rotation.x=-Math.PI/2; contact.position.y=-1.338; wheelGroup.add(contact);
  clayMaps=makeClayMaps();
  makeClay(); window.addEventListener('resize',resize); resize(); bind(); requestAnimationFrame(render);
}

function initialProfile() {
  return Array.from({length:ringCount},(_,i)=>{
    const t=i/(ringCount-1); const settle=Math.sin(Math.PI*t);
    return {y:-1.34+t*1.34,r:Math.max(minRadius,1.2+.075*settle-.025*t)};
  });
}
function makeWheelHeadTexture() {
  const canvas=document.createElement('canvas'); canvas.width=canvas.height=256; const ctx=canvas.getContext('2d'); const c=128;
  ctx.fillStyle='#9c7657';ctx.fillRect(0,0,256,256);
  for(let r=14;r<128;r+=10){ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.strokeStyle=`rgba(66,42,29,${.045+(r%20)/900})`;ctx.lineWidth=1+(r%3);ctx.stroke();}
  for(let i=0;i<22;i++){const a=i*2.399;const r=18+(i*31)%94;ctx.beginPath();ctx.arc(c,c,r,a,a+.18+(i%4)*.08);ctx.strokeStyle='rgba(246,219,182,.15)';ctx.lineWidth=1.2;ctx.stroke();}
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
    colorData.data[i]=Math.round(236+damp*14); colorData.data[i+1]=Math.round(218+damp*9); colorData.data[i+2]=Math.round(203+damp*6); colorData.data[i+3]=255;
    const rough=Math.max(0,Math.min(255,148-grain*19-rings*13-streak*36)); roughData.data[i]=roughData.data[i+1]=roughData.data[i+2]=rough; roughData.data[i+3]=255;
    const relief=Math.max(0,Math.min(255,128+grain*29+rings*17+streak*12)); bumpData.data[i]=bumpData.data[i+1]=bumpData.data[i+2]=relief; bumpData.data[i+3]=255;
  }
  color.getContext('2d').putImageData(colorData,0,0); roughness.getContext('2d').putImageData(roughData,0,0); bump.getContext('2d').putImageData(bumpData,0,0);
  const makeTexture=(canvas,isColor=false)=>{const texture=new THREE.CanvasTexture(canvas);texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;if(isColor)texture.colorSpace=THREE.SRGBColorSpace;return texture;};
  return {color:makeTexture(color,true),roughness:makeTexture(roughness),bump:makeTexture(bump)};
}
function claySurfaceDetail(ringIndex, segmentIndex) {
  const t=ringIndex/(ringCount-1); const a=segmentIndex/segments*Math.PI*2;
  const throwingRing=Math.sin(t*Math.PI*31+a*.12+Math.sin(t*11)*.7)*.0035;
  const softWobble=Math.sin(a*3.1+t*7.3)*.005+Math.sin(a*7.2-t*13.1)*.0025;
  const slipStreak=Math.max(0,Math.sin(a*2.0-t*18.0))*Math.max(0,Math.sin(a*5.2+t*5.4))*.003;
  const moisture=.965+Math.sin(a*3.1+t*19.2)*.018+Math.sin(a*8.4-t*8.7)*.009;
  return {radius:throwingRing+softWobble+slipStreak, moisture};
}
function makeClay() {
  state.profile=initialProfile(); state.opening={radius:0,depth:0}; state.history=[]; state.redo=[]; state.fired=false; state.phase='form'; state.glaze={history:[],redo:[],pointer:null,before:null,changed:false}; surface.classList.remove('is-fired','is-glazing');
  if (clay) wheelGroup.remove(clay); geometry=new THREE.BufferGeometry();
  if (innerWall) { wheelGroup.remove(innerWall); innerWall.geometry.dispose(); innerWall.material.dispose(); innerWall=null; }
  if (glazeMesh) { wheelGroup.remove(glazeMesh); glazeMesh.geometry.dispose(); glazeMesh.material.dispose(); glazeMesh=null; }
  glazeCanvas=glazeContext=glazeTexture=glazeMaterial=null;
  material=new THREE.MeshPhysicalMaterial({color:materials[state.material].color,map:clayMaps.color,roughness:materials[state.material].roughness,roughnessMap:clayMaps.roughness,bumpMap:clayMaps.bump,bumpScale:.045,metalness:materials[state.material].metalness,clearcoat:.1,clearcoatRoughness:.42,vertexColors:true,flatShading:false});
  clay=new THREE.Mesh(geometry,material); clay.castShadow=true; clay.receiveShadow=true; wheelGroup.add(clay); rebuildMesh(); updateMaterial(); resetView();
}
function rebuildMesh() {
  const vertices=[]; const colors=[]; const uvs=[]; const indices=[];
  state.profile.forEach((ring,r)=>{for(let s=0;s<segments;s++){const a=s/segments*Math.PI*2;const detail=claySurfaceDetail(r,s);const radius=ring.r+detail.radius;vertices.push(Math.cos(a)*radius,ring.y,Math.sin(a)*radius);colors.push(detail.moisture*1.015,detail.moisture*.985,detail.moisture*.955);uvs.push(s/segments,r/(ringCount-1));}});
  for(let r=0;r<ringCount-1;r++) for(let s=0;s<segments;s++){const next=(s+1)%segments;const a=r*segments+s,b=(r+1)*segments+s,c=(r+1)*segments+next,d=r*segments+next;indices.push(a,b,d,b,c,d);}
  const bottomIndex=vertices.length/3; vertices.push(0,state.profile[0].y,0);colors.push(.94,.9,.86);uvs.push(.5,0); const topIndex=bottomIndex+1; vertices.push(0,state.profile.at(-1).y,0);colors.push(.97,.93,.89);uvs.push(.5,1);
  for(let s=0;s<segments;s++){const next=(s+1)%segments;indices.push(bottomIndex,next,s);if(!state.opening.depth){const a=(ringCount-1)*segments+s,b=(ringCount-1)*segments+next;indices.push(topIndex,a,b);}}
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  updateOpeningVisual();
}
function updateOpeningVisual(){
  if(innerWall){wheelGroup.remove(innerWall);innerWall.geometry.dispose();innerWall.material.dispose();innerWall=null;}
  if(state.opening.depth<.08)return;
  const top=state.profile.at(-1).y-.006, bottom=top-state.opening.depth;
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(state.opening.radius*.98,state.opening.radius*.9,state.opening.depth,segments,1,true),new THREE.MeshStandardMaterial({color:0x3d2419,roughness:.72,side:THREE.BackSide}));
  wall.position.y=(top+bottom)/2; wheelGroup.add(wall);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(state.opening.radius*.9,segments),new THREE.MeshStandardMaterial({color:0x4c2b1d,roughness:.76,side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=bottom;wall.add(floor);innerWall=wall;
}
function updateMaterial() { const sample=materials[state.material]; material.color.setHex(sample.color); material.roughness=state.fired?Math.max(.24,sample.roughness-.23):sample.roughness; material.metalness=0; material.clearcoat=state.fired?.24:.17; material.clearcoatRoughness=state.fired?.22:.3; material.needsUpdate=true; }
function makeGlazeLayer() {
  const size=mobile?256:512; glazeCanvas=document.createElement('canvas'); glazeCanvas.width=glazeCanvas.height=size; glazeContext=glazeCanvas.getContext('2d');
  glazeTexture=new THREE.CanvasTexture(glazeCanvas); glazeTexture.colorSpace=THREE.SRGBColorSpace; glazeTexture.wrapS=THREE.RepeatWrapping; glazeTexture.wrapT=THREE.ClampToEdgeWrapping;
  glazeMaterial=new THREE.MeshPhysicalMaterial({map:glazeTexture,transparent:true,opacity:1,roughness:.22,metalness:0,clearcoat:.38,clearcoatRoughness:.18,depthWrite:false,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  glazeMesh=new THREE.Mesh(geometry,glazeMaterial); glazeMesh.renderOrder=2; wheelGroup.add(glazeMesh);
}
function snapshotGlaze(){return glazeContext.getImageData(0,0,glazeCanvas.width,glazeCanvas.height);}
function restoreGlaze(snapshot){glazeContext.putImageData(snapshot,0,0);glazeTexture.needsUpdate=true;}
function paintGlaze(uv,speed=0){
  if(!uv||!glazeContext)return; const size=glazeCanvas.width; const x=uv.x*size; const y=(1-uv.y)*size; const radius=mobile?10:15; const alpha=Math.max(.009,.026/(1+speed*.07));
  [-size,0,size].forEach(offset=>{const gradient=glazeContext.createRadialGradient(x+offset,y,0,x+offset,y,radius);gradient.addColorStop(0,`rgba(63, 94, 91, ${alpha})`);gradient.addColorStop(.52,`rgba(76, 111, 105, ${alpha*.58})`);gradient.addColorStop(1,'rgba(76, 111, 105, 0)');glazeContext.fillStyle=gradient;glazeContext.beginPath();glazeContext.arc(x+offset,y,radius,0,Math.PI*2);glazeContext.fill();});
  glazeTexture.needsUpdate=true;state.glaze.changed=true;
}
function applyHeldGlaze(){if(state.phase!=='glaze'||!state.glaze.pointer)return;const hit=getHitAt(state.glaze.pointer.x,state.glaze.pointer.y);if(hit?.uv)paintGlaze(hit.uv,state.glaze.pointer.speed);}
function enterGlaze(){if(state.phase!=='fired')return;state.phase='glaze';surface.classList.add('is-glazing');makeGlazeLayer();stageNote.textContent='touch the turning ceramic';caption.textContent='Hold still for a band. Drift up or down for a spiral. Every pass leaves more glaze.';status.textContent='The wheel keeps turning. Touch the vessel and let the glaze gather.';}
function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=mobile?52:39;camera.updateProjectionMatrix();}
function setCamera(){const radius=6.85;camera.position.set(Math.sin(state.yaw)*radius,.32+state.pitch*.2,Math.cos(state.yaw)*radius);camera.lookAt(0,-.78,0);}
function render(time){const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;const acceleration=reduced?1.35:2.5;state.wheel.speed=THREE.MathUtils.damp(state.wheel.speed,state.wheel.target,acceleration,dt);state.wheel.angle+=state.wheel.speed*dt;wheelGroup.rotation.y=state.wheel.angle;setCamera();applyHeldGlaze();renderer.render(scene,camera);requestAnimationFrame(render);}
function getHitAt(clientX,clientY){const r=renderer.domElement.getBoundingClientRect();pointer.x=((clientX-r.left)/r.width)*2-1;pointer.y=-((clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);return raycaster.intersectObject(clay,false)[0]||null;}
function getHit(event){return getHitAt(event.clientX,event.clientY);}
function cloneProfile(){return {rings:state.profile.map(r=>({...r})),opening:{...state.opening}};}
function saveBeforeStroke(){state.before=cloneProfile();state.strokeChanged=false;}
function finishStroke(){if(state.strokeChanged){state.history.push(state.before);if(state.history.length>18)state.history.shift();state.redo=[];}state.before=null;}
function profileIndexFromHit(hit){const local=wheelGroup.worldToLocal(hit.point.clone());let closest=0;let best=Infinity;state.profile.forEach((ring,i)=>{const d=Math.abs(ring.y-local.y);if(d<best){best=d;closest=i;}});return closest;}
function applyRadius(index,amount){state.profile.forEach((ring,i)=>{const d=Math.abs(i-index);if(d>6)return;const falloff=Math.pow(1-d/7,2);ring.r=THREE.MathUtils.clamp(ring.r+amount*falloff,minRadius,1.68);});}
function applyHeight(index,amount){state.profile.forEach((ring,i)=>{const d=Math.abs(i-index);if(d>7)return;const falloff=Math.pow(1-d/8,2);ring.y+=amount*falloff;});for(let i=1;i<state.profile.length;i++)state.profile[i].y=Math.max(state.profile[i].y,state.profile[i-1].y+minGap);for(let i=state.profile.length-2;i>=0;i--)state.profile[i].y=Math.min(state.profile[i].y,state.profile[i+1].y-minGap);const center=(state.profile[0].y+state.profile.at(-1).y)/2;state.profile.forEach(ring=>ring.y=THREE.MathUtils.clamp(ring.y-center,-1.48,1.55));}
function editProfile(index,radial,vertical){
  // The vessel spins in world space, but its profile remains axisymmetric. Screen motion is
  // therefore mapped to a stable ring index instead of chasing individual rotating vertices.
  if(Math.abs(vertical)>Math.abs(radial)*1.12) applyHeight(index,-vertical*.0035);
  else applyRadius(index,radial*.0052);
  rebuildMesh();state.strokeChanged=true;
}
function moveHands(clientX,clientY,active){
  if(!hands)return;const r=renderer.domElement.getBoundingClientRect();hands.style.setProperty('--hand-x',`${((clientX-r.left)/r.width)*100}%`);hands.style.setProperty('--hand-y',`${((clientY-r.top)/r.height)*100}%`);hands.classList.toggle('is-resting',!active);
}
function openClay(amount){
  const nextRadius=THREE.MathUtils.clamp(state.opening.radius+amount*.0048,.18,.66);const nextDepth=THREE.MathUtils.clamp(state.opening.depth+amount*.008,.08,.82);state.opening={radius:nextRadius,depth:nextDepth};rebuildMesh();state.strokeChanged=true;
}
function onDown(event){
  renderer.domElement.focus();renderer.domElement.setPointerCapture(event.pointerId);const hit=getHit(event);if(!hit)return;
  if(state.phase==='glaze'){state.glaze.before=snapshotGlaze();state.glaze.changed=false;state.glaze.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,speed:0};return;}
  if(state.phase!=='form')return;const r=renderer.domElement.getBoundingClientRect();const index=profileIndexFromHit(hit);const local=wheelGroup.worldToLocal(hit.point.clone());const top=state.profile.at(-1).y;const upperCenter=local.y>top-.2&&Math.hypot(local.x,local.z)<state.profile.at(-1).r*.72;state.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,axisX:r.left+r.width/2,index,opening:(index>ringCount-5||upperCenter)&&state.opening.depth===0};saveBeforeStroke();moveHands(event.clientX,event.clientY,true);
}
function onMove(event){
  if(state.phase==='glaze'&&state.glaze.pointer?.id===event.pointerId){const dx=event.clientX-state.glaze.pointer.x,dy=event.clientY-state.glaze.pointer.y;state.glaze.pointer.x=event.clientX;state.glaze.pointer.y=event.clientY;state.glaze.pointer.speed=Math.hypot(dx,dy);return;}
  if(state.phase!=='form'||!state.pointer||state.pointer.id!==event.pointerId)return;const dx=event.clientX-state.pointer.x,dy=event.clientY-state.pointer.y;if(Math.hypot(dx,dy)<2)return;const side=Math.sign(state.pointer.x-state.pointer.axisX)||1;const radial=dx*side;if(state.pointer.opening&&dy>0)openClay(dy);else editProfile(state.pointer.index,radial,dy);state.pointer.x=event.clientX;state.pointer.y=event.clientY;moveHands(event.clientX,event.clientY,true);status.textContent=state.pointer.opening&&dy>0?'The center opens under your hands.':Math.abs(dy)>Math.abs(radial)*1.12?(dy<0?'The clay rises under your hand.':'The clay settles and gathers.'):(radial>0?'The wall opens outward.':'The wall comes inward.');
}
function onUp(event){
  if(state.phase==='glaze'&&state.glaze.pointer?.id===event.pointerId){if(state.glaze.changed){state.glaze.history.push(state.glaze.before);if(state.glaze.history.length>18)state.glaze.history.shift();state.glaze.redo=[];}state.glaze.before=null;state.glaze.pointer=null;return;}
  if(state.pointer?.id===event.pointerId){finishStroke();state.pointer=null;hands?.classList.add('is-resting');}
}
function restore(snapshot){state.profile=snapshot.rings.map(r=>({...r}));state.opening={...snapshot.opening};rebuildMesh();}
function resetView(){state.yaw=-.08;state.pitch=0;}
function fire(){if(state.phase!=='form')return;state.fired=true;state.phase='fired';surface.classList.add('is-fired');material.color.lerp(new THREE.Color(0x70402f),.18);updateMaterial();status.textContent='Fired. The wheel keeps turning while the surface waits for glaze.';}
function keyboardShape(event){const key=event.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)||state.phase!=='form')return;event.preventDefault();saveBeforeStroke();const middle=Math.floor(state.profile.length/2);if(key==='ArrowLeft')applyRadius(middle,-.045);if(key==='ArrowRight')applyRadius(middle,.045);if(key==='ArrowUp')applyHeight(middle,.035);if(key==='ArrowDown')applyHeight(middle,-.035);rebuildMesh();state.strokeChanged=true;finishStroke();status.textContent={ArrowLeft:'The middle draws inward.',ArrowRight:'The middle opens outward.',ArrowUp:'The middle lifts.',ArrowDown:'The middle settles.'}[key];}
function undo(){if(state.phase==='glaze'){const previous=state.glaze.history.pop();if(!previous){status.textContent='No glaze stroke to undo yet.';return;}state.glaze.redo.push(snapshotGlaze());restoreGlaze(previous);status.textContent='One glaze gesture lifted away.';return;}const previous=state.history.pop();if(!previous){status.textContent='Nothing to undo yet.';return;}state.redo.push(cloneProfile());restore(previous);status.textContent='One whole clay gesture gently lifted away.';}
function redo(){if(state.phase==='glaze'){const next=state.glaze.redo.pop();if(!next){status.textContent='No glaze stroke to redo yet.';return;}state.glaze.history.push(snapshotGlaze());restoreGlaze(next);status.textContent='The glaze gesture returned.';return;}const next=state.redo.pop();if(!next){status.textContent='Nothing to redo yet.';return;}state.history.push(cloneProfile());restore(next);status.textContent='The clay gesture returned.';}
function bind(){renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointermove',onMove);renderer.domElement.addEventListener('pointerup',onUp);renderer.domElement.addEventListener('pointercancel',onUp);renderer.domElement.addEventListener('keydown',keyboardShape);document.querySelectorAll('[data-undo]').forEach(button=>button.addEventListener('click',undo));document.querySelectorAll('[data-redo]').forEach(button=>button.addEventListener('click',redo));document.querySelector('[data-fire]')?.addEventListener('click',fire);document.querySelector('[data-glaze]')?.addEventListener('click',enterGlaze);document.querySelector('[data-back]')?.addEventListener('click',()=>{state.fired=false;state.phase='form';surface.classList.remove('is-fired');updateMaterial();status.textContent='Back at the table. The clay is yours again.';});document.querySelectorAll('[data-new]').forEach(button=>button.addEventListener('click',()=>{makeClay();caption.textContent='Guide the clay outward or inward; lift it up or settle it down. With the clay focused, arrow keys shape its middle.';stageNote.textContent='touch the spinning clay';status.textContent='Fresh clay. The wheel keeps turning.';}));}

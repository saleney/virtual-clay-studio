import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../atelier.js',import.meta.url),'utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);let braces=0,end=source.indexOf('{',start);const body=end;do{const c=source[end++];if(c==='{')braces++;if(c==='}')braces--;}while(braces);return source.slice(start,end);}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const context={THREE:{MathUtils:{clamp,lerp:(a,b,t)=>a+(b-a)*t}},state:{},rebuildMesh(){},ringCount:42,minGap:.018,minRadius:.3,clayAmountScale:()=>1};
vm.createContext(context);
vm.runInContext(['outerRadiusAt','reconcileInterior','interiorInfo','setInterior','openClay','widenInterior','stabilizeProfile','smoothProfileRadius','applyRadius','applyHeight','compressRib'].map(extract).join('\n'),context);
for(const size of [5,10,15]){
 const scale=Math.cbrt(size/5);context.clayAmountScale=()=>scale;
 const state=context.state;state.profile=Array.from({length:42},(_,i)=>({y:-1.43+i*.025*scale,r:.8*scale}));
 const top=state.profile.at(-1).y;
 state.innerProfile=Array.from({length:9},(_,i)=>({y:top-.3+i*.3/8,r:.45*scale}));
 // Outer tools shorten a vessel while the pre-fix cavity keeps its previous height.
 state.profile.forEach((ring,i)=>ring.y=-1.43+i*.018);
 context.reconcileInterior();
 assert.equal(state.innerProfile.at(-1).y,state.profile.at(-1).y);
 for(let iteration=0;iteration<100;iteration++){
  context.openClay(.025);context.widenInterior(.02);
  for(const ring of state.innerProfile){assert.ok(Number.isFinite(ring.y)&&Number.isFinite(ring.r));assert.ok(ring.y<=state.profile.at(-1).y+1e-8);assert.ok(ring.y>=state.profile[0].y+.119);assert.ok(ring.r<=context.outerRadiusAt(ring.y)-.119);}
 }
 // Height changes and squeezed necks must retain a cavity inside the wall.
 state.profile.forEach((ring,i)=>{ring.y+=i/41*.5;ring.r=.4*scale;});context.reconcileInterior();
 assert.equal(state.innerProfile.at(-1).y,state.profile.at(-1).y);
 console.log(`${size} lb: shortening, deepening, widening, height change, and neck squeeze passed`);
}
assert.ok(source.includes("['hand','rib'].includes(state.tool)&&inside"));
assert.ok(source.includes("['hand','rib'].includes(state.tool)&&upperCenter"));
for(const size of [5,10,15]){
 context.clayAmountScale=()=>Math.cbrt(size/5);
 const state=context.state;state.profile=Array.from({length:42},(_,i)=>({y:-1.43+i*.035,r:.8}));state.innerProfile=null;
 context.openClay(.08);
 const initialY=state.profile[32].y;context.compressRib(32,0,18);
 assert.ok(state.profile[32].y<initialY,'Downward rib drag compresses height');
 const initialR=state.profile[20].r;context.compressRib(20,-18,0);
 assert.ok(state.profile[20].r<initialR,'Inward rib drag compresses width');
 for(let i=0;i<80;i++){
  const top=state.profile.at(-1).y;
  context.compressRib(32,-12,18);context.reconcileInterior();
  assert.ok(state.profile.at(-1).y<=top+1e-8,'Compression must not lift the vessel');
  context.openClay(.01);context.widenInterior(.01);context.reconcileInterior();
  assert.equal(state.innerProfile.at(-1).y,state.profile.at(-1).y);
  for(const ring of [...state.profile,...state.innerProfile])assert.ok(Number.isFinite(ring.r)&&Number.isFinite(ring.y));
 }
 const height=state.profile.at(-1).y;context.compressRib(32,0,-18);
 assert.ok(state.profile.at(-1).y<=height+1e-8,'Upward rib movement must not stretch clay');
 console.log(`${size} lb: rib compression, opening, widening, and attached rim passed`);
}

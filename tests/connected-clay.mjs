import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../atelier.js',import.meta.url),'utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);let braces=0,end=source.indexOf('{',start);do{const c=source[end++];if(c==='{')braces++;if(c==='}')braces--;}while(braces);return source.slice(start,end);}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
for(const rings of [42,56])for(const size of [5,10,15])for(const hollow of [false,true]){
 const scale=Math.cbrt(size/5),state={profile:Array.from({length:rings},(_,i)=>({y:-1.43+i/(rings-1)*1.4*scale,r:.8*scale})),innerProfile:null};
 const ctx={THREE:{MathUtils:{clamp,lerp:(a,b,t)=>a+(b-a)*t}},state,ringCount:rings,minGap:.018,minRadius:.3,clayAmountScale:()=>scale,rebuildMesh(){}};
 vm.createContext(ctx);vm.runInContext(['localWorkability','outerRadiusAt','reconcileInterior','interiorInfo','setInterior','openClay','stabilizeProfile','smoothProfileRadius','profileVolume','clayVolume','safeOuterRadius','balanceClayVolume','applyRadius','applyHeight','applySponge'].map(extract).join('\n'),ctx);
 if(hollow)ctx.openClay(.1);
 state.surfaceSmooth=Array(rings).fill(0);
 const plain=state.profile.map(r=>({...r})),center=Math.floor(rings*.5);
 state.profile.forEach((r,i)=>r.r+=.14*Math.exp(-.5*((i-center)/3)**2));
 const ridge=state.profile[center].r,topRadius=state.profile.at(-1).r;
 for(let hold=0;hold<100;hold++)ctx.applySponge(center);
 assert.ok(state.profile[center].r<ridge-.06,'Sustained sponge removes broad ridge');
 assert.equal(state.profile.at(-1).r,topRadius,'Sponge preserves rim');
 assert.deepEqual(state.profile.map(r=>r.y),plain.map(r=>r.y),'Sponge cannot stretch vertically');
 state.profile=plain;
 const initial=JSON.stringify(state.profile),initialInner=JSON.stringify(state.innerProfile);
 // Shoulder pressure should stay local; low pressure must include the foot.
 const shoulder=Math.floor(rings*.85),belly=Math.floor(rings*.45);
 const shoulderBefore=state.profile[shoulder].r,bellyBefore=state.profile[belly].r;
 ctx.applyRadius(shoulder,-.025);
 assert.ok(shoulderBefore-state.profile[shoulder].r > 4*Math.abs(bellyBefore-state.profile[belly].r),'Closing the shoulder preserves the belly');
 state.profile=JSON.parse(initial);state.innerProfile=JSON.parse(initialInner);
 const footBefore=state.profile[0].r;
 ctx.applyRadius(Math.floor(rings*.18),-.025);
 assert.ok(state.profile[0].r<footBefore,'Low pressure reaches the foot');
 state.profile=JSON.parse(initial);state.innerProfile=JSON.parse(initialInner);

 for(const amount of [.02,-.02]){
  state.profile=JSON.parse(initial);state.innerProfile=JSON.parse(initialInner);
  const footprint=state.profile[0].r,volume=ctx.clayVolume();
  ctx.applyHeight(0,amount);
  assert.ok(amount>0?state.profile[0].r<footprint:state.profile[0].r>footprint,'Base drag changes the footprint in the expected direction');
  assert.equal(state.profile[0].y,-1.43,'Contact plane stays on wheel');
  assert.ok(Math.abs(ctx.clayVolume()/volume-1)<.005,'Base drag preserves clay volume');
 }
 state.profile=JSON.parse(initial);state.innerProfile=JSON.parse(initialInner);
 const index=Math.floor(rings*.65),volume=ctx.clayVolume(),before=JSON.stringify(state.profile),top=state.profile.at(-1).y,radius=state.profile[index].r;
 ctx.applyHeight(index,.02);
 assert.ok(state.profile.at(-1).y>top,'Pulling raises the upper wall');assert.ok(state.profile[index].r<radius,'Pulling narrows the wall');assert.ok(Math.abs(ctx.clayVolume()/volume-1)<.005,'Pulling preserves volume within 0.5%');
 state.profile=JSON.parse(before);ctx.reconcileInterior();const downRadius=state.profile[index].r,downTop=state.profile.at(-1).y;
 ctx.applyHeight(index,-.02);assert.ok(state.profile.at(-1).y<downTop,'Pressing settles the upper wall');assert.ok(state.profile[index].r>downRadius,'Pressing spreads clay');
 for(let i=0;i<120;i++){ctx.applyHeight(index,i<60?.018:-.018);ctx.applyRadius(index,i%2?.01:-.01);assert.equal(state.profile[0].y,-1.43);for(const ring of state.profile)assert.ok(Number.isFinite(ring.y)&&Number.isFinite(ring.r)&&ring.r>=.3);if(hollow)for(const ring of state.innerProfile)assert.ok(ctx.outerRadiusAt(ring.y)-ring.r>=.119999,'Hollow wall retains thickness');}
 if(hollow){
  ctx.setInterior(.5,.55*scale);const opening=state.innerProfile.at(-1).r;
  for(let stroke=0;stroke<40;stroke++)ctx.applyRadius(rings-1,-.025);
  assert.ok(state.innerProfile.at(-1).r<opening,'Inward neck pressure narrows the existing opening');
  assert.ok(state.innerProfile.at(-1).r>=.018,'Opening cannot invert');
  for(const ring of state.innerProfile)assert.ok(ctx.outerRadiusAt(ring.y)-ring.r>=.119999,'Narrowed neck retains wall thickness');
 }
 console.log(`${rings} rings, ${size} lb, ${hollow?'open':'solid'}: connected pull/press, conserved volume and stable repeated shaping`);
}

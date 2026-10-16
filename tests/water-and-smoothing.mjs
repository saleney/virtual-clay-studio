import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as THREE from '../three.module.js';
const source=fs.readFileSync(new URL('../atelier.js',import.meta.url),'utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);let braces=0,end=source.indexOf('{',start);do{const c=source[end++];if(c==='{')braces++;if(c==='}')braces--;}while(braces);return source.slice(start,end);}
let rebuilds=0,splashes=0;
const material=new THREE.MeshPhysicalMaterial({color:0xd1c3ad,roughness:.78,clearcoat:.012,clearcoatRoughness:.82});
const innerMaterial=material.clone(),clay={};
const state={phase:'form',fired:false,material:'terracotta',pointer:null,tool:'brush',brushMaterial:'water',localWetness:Array(42).fill(0),localAlterations:[],glaze:{pointer:null},surfaceSmooth:Array(42).fill(0),profile:Array.from({length:42},(_,i)=>({y:-1.43+i*.03,r:.8})),history:[],wheel:{angle:0}};
const ctx={THREE,state,rawClayMaps:{color:new THREE.Texture(),normal:new THREE.Texture(),roughness:new THREE.Texture()},clayMaps:{color:new THREE.Texture(),bump:new THREE.Texture(),roughness:new THREE.Texture()},ringCount:42,wetness:0,wetColorTime:0,wetClayTint:new THREE.Color(0x89765d),materialColor:new THREE.Color(),material,innerMesh:{material:innerMaterial},clay,materials:{terracotta:{color:0xd1c3ad,roughness:.78}},status:{},surface:{clientWidth:390,clientHeight:844,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),append(){splashes++}},document:{createElement:()=>({style:{},setAttribute(){},addEventListener(){}}),querySelector:()=>({classList:{add(){}}})},completeFirstInvite(){},rebuildMesh(){rebuilds++},renderer:{domElement:{setPointerCapture(){}}},getHit:()=>({object:clay}),getHitAt:()=>({object:clay,point:new THREE.Vector3(.8,-.6,0),uv:{}}),wheelGroup:{updateMatrixWorld(){},worldToLocal:p=>p},profileIndexFromHit:()=>1,applySponge:()=>{rebuilds++},softenSlip(){},smoothProfileRadius(){},stabilizeProfile(){}};
vm.createContext(ctx);
vm.runInContext(['localWorkability','updateWetColors','updateMaterial','addWater','dryWater','onDown','restoreTowardSymmetry','applyHeldSmoothing','wrappedAngleDistance'].map(extract).join('\n'),ctx);
const untouched=JSON.stringify(state.profile),wheel=JSON.stringify(state.wheel);
ctx.addWater(200,330);
assert.equal(JSON.stringify(state.profile),untouched,'Water must not deform the clay');
assert.equal(JSON.stringify(state.wheel),wheel,'Water must not change the wheel');
assert.equal(rebuilds,0);assert.equal(state.localWetness[1],1);assert.ok(state.localWetness[41]<.001);
assert.equal(ctx.localWorkability(1),1.65);assert.ok(ctx.localWorkability(41)<1.001);
assert.ok(material.roughness<.98&&material.roughness>.27);assert.equal(innerMaterial.roughness,material.roughness);
for(let i=0;i<200;i++)ctx.dryWater(.1);
assert.equal(ctx.wetness,0);assert.equal(ctx.localWorkability(1),1);assert.ok(Math.abs(material.roughness-.98)<1e-9);
state.phase='glaze';ctx.addWater(1,1);assert.equal(ctx.wetness,0);
console.log('Water: local softening without deformation, distant clay unchanged, full drying and blocked after firing');
// Identical pressure must move a wet section farther than a dry one.
ctx.minRadius=.3;ctx.clayAmountScale=()=>1;
vm.runInContext(['profileVolume','clayVolume','safeOuterRadius','balanceClayVolume','reconcileInterior','outerRadiusAt','applyRadius','applyHeight'].map(extract).join('\n'),ctx);
for(const operation of ['applyRadius','applyHeight']){
 const field=operation==='applyRadius'?'r':'y',original=state.profile.map(r=>({...r}));
 state.localWetness.fill(0);ctx[operation](20,.01);const dryDelta=state.profile[20][field]-original[20][field];
 state.profile=original.map(r=>({...r}));state.localWetness[20]=1;ctx[operation](20,.01);const wetDelta=state.profile[20][field]-original[20][field];
 assert.ok(wetDelta>dryDelta*1.5,'Wet clay must yield more under the same shaping pressure');state.profile=original;state.localWetness.fill(0);
}
console.log('Water changes local width and height response under equal shaping pressure');
for(const tool of ['sponge','rib'])for(const turning of [false,true]){
 state.phase='form';state.tool=tool;state.pointer={id:1,x:200,y:330};
 state.localAlterations=[{y:-.6,angle:0,radialDelta:-.045,heightRadius:.065,angleRadius:.09,strokeId:1},{y:2,angle:2,radialDelta:-.045,heightRadius:.065,angleRadius:.09,strokeId:2}];
 let angle=0;
 ctx.getHitAt=()=>({object:clay,point:new THREE.Vector3(.8*Math.cos(angle),-.6,.8*Math.sin(angle)),uv:{}});
 const shape=JSON.stringify(state.profile);
 for(let i=0;i<600;i++){if(turning)angle=i*.04;ctx.applyHeldSmoothing(.02);}
 if(tool==='sponge'){
  const cut=state.localAlterations.find(m=>m.strokeId===1);assert.ok(cut,'Deep cut must remain');
  assert.ok(-cut.radialDelta>=.045*.7-1e-9);assert.ok(-cut.radialDelta<.045,'Edges should soften');
  assert.ok(cut.heightRadius<=.065*1.2+1e-9,'Softening width is bounded');
 }else assert.ok(!state.localAlterations.some(m=>m.strokeId===1),'Rib retains compression recovery');
 assert.ok(state.localAlterations.some(m=>m.strokeId===2),'A distant groove must remain');
 assert.equal(JSON.stringify(state.profile),shape,'Holding a smoothing tool must not stretch clay vertically');
 console.log(`${tool}, ${turning?'turning':'paused'}: bounded sponge softening / rib recovery, distant groove preserved`);
}
console.log('All water and held-smoothing regression checks passed');

ctx.document.querySelectorAll=()=>[];ctx.contact=null;
vm.runInContext(['onUp','finishStroke','selectTool','rememberAction','updateToolUI'].map(extract).join('\n'),ctx);
state.before={saved:true};state.strokeChanged=true;state.pointer={id:1};state.history=[];
ctx.selectTool('water');
assert.equal(state.pointer,null);assert.equal(state.history.length,1);assert.equal(state.tool,'water');
state.glaze={pointer:{id:2},changed:false,before:{},history:[],redo:[]};
ctx.selectTool('hand');assert.equal(state.glaze.pointer,null);
console.log('Mid-gesture tool changes cleanly finish shaping and brush gestures');

state.phase='form';state.tool='rib';
for(const mode of ['start','inside']){
 state.pointer={id:1,x:200,y:330,mode};const before=rebuilds;
 for(let i=0;i<200;i++)ctx.applyHeldSmoothing(.02);
 assert.equal(rebuilds,before,'Rib opening must not simultaneously reshape the outer wall');
}
console.log('Rib center/inside contact leaves outer smoothing inactive');

state.tool='sponge';state.phase='form';state.localAlterations=[{y:-.6,angle:0,radialDelta:-.012,heightRadius:.065,angleRadius:.09,strokeId:4}];
ctx.getHitAt=()=>({object:clay,point:new THREE.Vector3(.8,-.6,0),uv:{}});
state.pointer={id:1,x:200,y:330};for(let i=0;i<600;i++)ctx.applyHeldSmoothing(.02);
assert.equal(state.localAlterations.length,0,'Shallow marks can disappear');
console.log('Shallow sponge marks disappear while deep cuts retain their floor');

vm.runInContext(['applySponge','applyCarve'].map(extract).join('\n'),ctx);
state.profile=Array.from({length:42},(_,i)=>({y:-1.43+i*.03,r:.8}));state.innerProfile=null;
state.carveWidth=1;state.carveDepth=1;state.surfaceSmooth=Array(42).fill(0);
for(let i=0;i<5;i++)ctx.applyCarve(20);
const cutRadius=state.profile[20].r,removed=state.profile[20].carvedDepth;
for(let i=0;i<500;i++)ctx.applySponge(20);
assert.ok(state.profile[20].r<=cutRadius+removed*.3+1e-8,'Full-ring deep cut cannot be filled by sponge');
console.log('Full-ring sponge recovery is capped');

state.localAlterations=[{y:-.6,angle:0,radialDelta:-.01,spongeOriginalDepth:.08,spongeOriginalHeight:.065,spongeOriginalAngle:.09,heightRadius:.065,angleRadius:.09,strokeId:10}];
ctx.restoreTowardSymmetry(ctx.getHitAt(),.2,.2,.55,false);
assert.ok(-state.localAlterations[0].radialDelta<=.01,'Returning from Rib must not deepen a softened cut');

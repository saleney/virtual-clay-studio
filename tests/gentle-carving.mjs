import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../atelier.js',import.meta.url),'utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);let end=source.indexOf('{',start),depth=0;do{const c=source[end++];if(c==='{')depth++;if(c==='}')depth--;}while(depth);return source.slice(start,end);}
for(const segments of [144,192]){
 const ctx={segments,alterationBands:new Map(),alterationAngles:[],alterationSignature:'',state:{localAlterations:[]}};vm.createContext(ctx);vm.runInContext(['wrappedAngleDistance','prepareAlterationAngles','localAlterationAt'].map(extract).join('\n'),ctx);
 // Even 100 retraces/crossings retain the strongest single cut, not their sum.
 ctx.state.localAlterations=Array.from({length:100},(_,i)=>({y:0,angle:0,radialDelta:-.048,heightRadius:.144,angleRadius:.216,strokeId:i+1}));
 ctx.prepareAlterationAngles();assert.equal(ctx.localAlterationAt(0,0).radial,-.048);
 ctx.state.localAlterations.push({y:0,angle:0,radialDelta:.03,heightRadius:.1,angleRadius:.1});ctx.prepareAlterationAngles();assert.ok(Math.abs(ctx.localAlterationAt(0,0).radial+.018)<1e-9,'Hand alterations remain independent of knife cuts');
 const left=ctx.localAlterationAt(.05,.1).radial,right=ctx.localAlterationAt(.05,-.1).radial;assert.ok(Math.abs(left-right)<1e-9,'Cut falloff stays symmetric at the angular seam');
 console.log(`${segments} segments: 100 retraces bounded; hand marks preserved; seam smooth`);
}
const state={pointer:{carveStrokeId:1,carvePoint:{y:0,angle:0}},localAlterations:[],carveDepth:1,carveWidth:1};
const clay={},ctx={state,clay,THREE:{MathUtils:{lerp:(a,b,t)=>a+(b-a)*t}},wheelGroup:{worldToLocal:p=>p},rebuildMesh(){}};
vm.createContext(ctx);vm.runInContext(['wrappedAngleDistance','carveVertical'].map(extract).join('\n'),ctx);
const hit=y=>({object:clay,point:{x:1,y,z:0,clone(){return this;}}});
ctx.carveVertical(hit(.04));assert.ok(state.localAlterations.length>0);
const count=state.localAlterations.length;ctx.carveVertical(hit(1));assert.equal(state.localAlterations.length,count,'A large jump must not cut a bridge across the vessel');
console.log('Touch jitter filtered; out-of-surface jump does not bridge cuts');

const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=readFileSync('atelier.js','utf8');
const functions=['stabilizeProfile','compressRib'].map(name=>source.slice(source.indexOf(`function ${name}(`),source.indexOf('\nfunction ',source.indexOf(`function ${name}(`)+1))).join('\n');
for(const count of [42,56]){
 const rings=Array.from({length:count},(_,i)=>({y:-1.43+i*.04,r:.8+.065*Math.sin(i*.3)}));
 const middle=Math.floor(count/2);
 const make=()=>{const state={profile:structuredClone(rings),before:{rings:structuredClone(rings)},pointer:{},surfaceSmooth:Array(count).fill(0)};const context=vm.createContext({state,minRadius:.2,minGap:.018,clayAmountScale:()=>1,rebuildMesh(){},THREE:{MathUtils:{clamp:(n,a,b)=>Math.max(a,Math.min(b,n))}}});vm.runInContext(functions,context);return {state,press:(x,y=0)=>context.compressRib(middle,x,y)};};
 const curvature=profile=>{let result=0;for(let i=middle-4;i<=middle+4;i++)result+=Math.abs(profile[i-1].r-2*profile[i].r+profile[i+1].r);return result;};
 const single=make();single.press(-90);
 assert(curvature(single.state.profile)<curvature(rings)*.15,'Broad section should become straight');
 assert.deepEqual(single.state.profile.map(r=>r.y),rings.map(r=>r.y),'Rib must not lift or settle the wall');
 assert.equal(single.state.profile[0].r,rings[0].r,'Base stays untouched');
 assert(single.state.profile.every((r,i)=>r.r<=rings[i].r+1e-9&&r.r>=.2),'Pressure only moves inward and respects radius limits');
 const many=make();for(let i=0;i<9;i++)many.press(-10);
 assert.deepEqual(many.state.profile,single.state.profile,'Equivalent pressure should not depend on pointer event count');
 const noop=make();noop.press(18);noop.press(-2,18);
 assert.deepEqual(noop.state.profile,rings,'Outward and vertical drags must not hand-shape');
 const gentle=make();gentle.press(-8);
 assert(curvature(single.state.profile)<curvature(gentle.state.profile),'More pressure should straighten further');
 console.log(`Rib geometry checks passed (${count} rings)`);
}

const {readFileSync}=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=readFileSync('atelier.js','utf8');
const functions=['localWorkability','stabilizeProfile','safeOuterRadius','compressRib'].map(name=>source.slice(source.indexOf(`function ${name}(`),source.indexOf('\nfunction ',source.indexOf(`function ${name}(`)+1))).join('\n');
for(const count of [42,56])for(const amount of [5,10,15]){
 const scale=Math.cbrt(amount/5),rings=Array.from({length:count},(_,i)=>({y:-1.43+i*.04,r:scale*(.8+.07*Math.sin(i*.16))})),mid=Math.floor(count/2);
 const make=()=>{const state={profile:structuredClone(rings),before:{rings:structuredClone(rings)},pointer:{},surfaceSmooth:Array(count).fill(0)};const ctx=vm.createContext({state,minRadius:.3,minGap:.018,clayAmountScale:()=>scale,rebuildMesh(){},THREE:{MathUtils:{clamp:(n,a,b)=>Math.max(a,Math.min(b,n))}}});vm.runInContext(functions,ctx);return{state,ctx,press:(x,y=0,index=mid)=>ctx.compressRib(index,x,y)};};
 const one=make(),many=make();one.press(-90);for(let i=0;i<9;i++)many.press(-10);
 one.state.profile.forEach((r,i)=>assert(Math.abs(r.r-many.state.profile[i].r)<1e-9,'Equal pressure independent of event count'));
 assert.deepEqual(one.state.profile.map(r=>r.y),rings.map(r=>r.y));assert.equal(one.state.profile[0].r,rings[0].r);
 const out=make();out.press(24);assert(out.state.profile[mid].r>rings[mid].r,'Outward pressure follows direction');
 const trace=make();trace.press(0,18,mid-6);trace.press(-18,10,mid+6);
 assert(trace.state.profile[mid+6].r<rings[mid+6].r,'Contact travels to another height');
 assert(one.state.profile.every((r,i)=>Math.abs(r.r-rings[i].r)<.08*scale),'One gesture bounded');
 assert(Math.max(...one.state.profile.map(r=>r.r))-Math.min(...one.state.profile.map(r=>r.r))>.06*scale,'Broad curved contour survives');
 for(let pass=0;pass<300;pass++){one.state.before={rings:structuredClone(one.state.profile)};one.state.pointer={};one.press(pass%2?18:-18,12,1+pass%(count-1));assert(one.state.profile.every(r=>Number.isFinite(r.r)&&r.r>=.3&&Number.isFinite(r.y)));}
 console.log(`${count} rings/${amount}lb: directional contour, event-density independence, 300 stable gestures`);
}

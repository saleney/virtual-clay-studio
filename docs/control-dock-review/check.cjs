const {chromium}=require('/Users/salene/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});let results=[];
for(const [width,height] of [[320,568],[390,664],[430,740],[1024,650],[1440,900],[844,390]]){
const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});await p.route('**/atelier.js*',async r=>{const res=await r.fetch();await r.fulfill({response:res,body:(await res.text())+'\nwindow.dockQA={fire,state};'});});await p.goto('http://127.0.0.1:8107/?dock-review');await p.waitForFunction(()=>window.dockQA);await p.locator('canvas').first().focus();await p.keyboard.press('ArrowUp');
console.log(width,height,await p.locator('.clay-amount').getAttribute('class'));await p.screenshot({path:'/tmp/dock-debug.png'});for(const tool of ['hand','rib','carve','sponge','brush']){
await p.locator('[data-tool="'+tool+'"]').click();
const check=await p.evaluate(()=>{const selectors=['.tool-hint','.tool-row','[data-fire]','[data-wheel-toggle]','.recovery-controls'];return selectors.map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),c=getComputedStyle(e);return{s,visible:c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth}})});
assert(check.every(x=>x.visible),JSON.stringify({width,height,tool,check}));
if(tool==='rib')await p.screenshot({path:'docs/control-dock-review/'+width+'-'+height+'.png'});
}
results.push({width,height,tools:true});await p.close();
}await b.close();fs.writeFileSync('docs/control-dock-review/results.json',JSON.stringify(results,null,2));console.log(results)})()

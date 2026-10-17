const {chromium,webkit}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),mode='after';
(async()=>{
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.join(root,name==='/'?'index.html':name);if(!file.startsWith(root+path.sep))throw Error('path');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/?qa`,results=[];
try{for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
const browser=await type.launch({headless:true,...(engine==='chromium'?{executablePath:chromium.executablePath(),args:['--enable-unsafe-swiftshader']}:{} )});
console.log(engine,'REAL BROWSER LAUNCHED',browser.version());
try{for(const width of [320,390,430,1280]){
 const height=width===1280?720:width===320?667:844,page=await browser.newPage({viewport:{width,height},...(width<=620?{isMobile:true,hasTouch:true}:{}),reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.locator('canvas').waitFor();await page.waitForTimeout(800);
 const fallback=await page.locator('[data-fallback]').evaluate(n=>n.classList.contains('is-visible'));assert(!fallback,'WebGL initialized');
 const shots=[];
 async function shot(name){await regions();await page.screenshot({path:path.join(__dirname,`${engine}-${width}-${name}.png`)});shots.push(name);}
 async function regions(){if(width>620)return;const r=await page.evaluate(()=>{const a=document.querySelector('.work-surface').getBoundingClientRect(),b=document.querySelector('.phone-dock').getBoundingClientRect(),c=document.querySelector('canvas').getBoundingClientRect();return {clayBottom:a.bottom,dockTop:b.top,canvasBottom:c.bottom,overflow:document.documentElement.scrollWidth>innerWidth}});assert(r.clayBottom<=r.dockTop+1);assert(r.canvasBottom<=r.dockTop+1);assert(!r.overflow);const bad=await page.locator('.phone-dock button,.phone-dock summary,.phone-dock select,.phone-dock .finish-effects-panel label').evaluateAll(ns=>ns.filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden'&&!n.closest('.tool-row,.glaze-colors')).map(n=>({text:n.textContent.trim(),r:n.getBoundingClientRect(),font:parseFloat(getComputedStyle(n).fontSize)})).filter(({r,font})=>r.width>0&&(r.left<0||r.right>innerWidth+1||r.height<43||font<13)).map(({text,r,font})=>({text,x:r.x,w:r.width,h:r.height,font})));assert.deepEqual(bad,[],'Readable controls fit horizontally and retain 44px targets');}
 await regions();await shot('starter');
 const starter=await page.locator('.clay-amount').boundingBox();
 const canvas=await page.locator('canvas').boundingBox();if(width<=620){await page.mouse.move(width/2,canvas.y+canvas.height*.4);await page.mouse.down();await page.mouse.move(width/2+10,canvas.y+canvas.height*.4-14,{steps:8});await page.mouse.up();await page.locator('.phone-dock[data-phase=throwing]').waitFor();assert(await page.locator('[data-undo]').isEnabled(),'Real clay gesture creates Undo');}else{await page.locator('canvas').focus();await page.keyboard.press('ArrowUp');}await page.waitForTimeout(200);await shot('throwing');
 if(width<=620){
  for(const tool of ['rib','carve','brush']){
   await page.locator(`[data-tool="${tool}"]`).click();await page.locator('.phone-settings').click();await shot(tool+'-settings');await regions();
   if(tool==='brush'){await page.locator('.slip-decoration summary').click();await page.locator('[data-slip-color="rust"]').click();}
   await page.locator('.phone-back').click();
  }
  assert(await page.locator('.material-tray').getAttribute('data-material')==='slip','Back retains slip');
  await page.locator('[data-tool="hand"]').click();
 }
 await page.locator('[data-fire]').click();await shot('firing');await regions();await page.locator('.work-surface.is-glazing').waitFor({timeout:15000});await shot('glazing');
 await page.locator('.finish-effects summary').click();await shot('effects');await regions();
 for(const effect of await page.locator('[data-glaze-effect]').all()){await effect.check();assert(await effect.isChecked());}
 await page.locator('[data-piece-finish]').selectOption('gloss');
 if(width<=620)await page.locator('.phone-back').click();else await page.getByRole('button',{name:'Done',exact:true}).click();
 const tray=await page.locator('.glaze-tray').boundingBox(),shelf=await page.locator('.shelf-link').boundingBox();assert(shelf,'Shelf reachable');
 await page.locator('[data-coat-glaze]').click();await page.locator('[data-finish]').click();await shot('final-fire');await regions();await page.locator('.work-surface.is-complete').waitFor({timeout:15000});await shot('complete');await regions();
 results.push({engine,width,height,starter,tray,shelf,shots,errors});assert.deepEqual(errors,[]);await page.close();console.log(mode,engine,width,'done');
}}finally{await browser.close();}}
}finally{server.close();await fs.writeFile(path.join(__dirname,mode+'-results.json'),JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exit(1)});

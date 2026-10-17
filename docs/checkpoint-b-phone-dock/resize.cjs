const {chromium,webkit}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),mode='resize';
(async()=>{
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.join(root,name==='/'?'index.html':name);if(!file.startsWith(root+path.sep))throw Error('path');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/?qa`,results=[];
try{for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
const browser=await type.launch({headless:true,...(engine==='chromium'?{executablePath:chromium.executablePath(),args:['--enable-unsafe-swiftshader']}:{} )});
console.log(engine,'REAL BROWSER LAUNCHED',browser.version());
try{for(const width of [320,390,430]){
 const height=width===1280?720:width===320?667:844,page=await browser.newPage({viewport:{width,height},...(width<=620?{isMobile:true,hasTouch:true}:{}),reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.locator('canvas').waitFor();await page.waitForTimeout(800);
 const fallback=await page.locator('[data-fallback]').evaluate(n=>n.classList.contains('is-visible'));assert(!fallback,'WebGL initialized');
 const starter=await page.locator('.clay-amount').boundingBox();
 if(width<=620){const family=await page.locator('[data-starter]').evaluateAll(ns=>ns.map(n=>({y:n.getBoundingClientRect().y,width:n.clientWidth,content:n.scrollWidth})));assert(family.every(n=>Math.abs(n.y-family[0].y)<1&&n.content<=n.width+1),'All clay family names fit in one row');
  for(const size of ['10','15']){await page.locator(`[data-clay-amount="${size}"]`).click();await page.waitForTimeout(150);await page.screenshot({path:path.join(__dirname,`${engine}-${width}-${size}lb.png`)});}
  await page.locator('canvas').focus();await page.keyboard.press('ArrowUp');await page.locator('[data-tool="carve"]').click();await page.locator('.phone-settings').click();
  await page.setViewportSize({width:1280,height:800});await page.locator('.phone-dock').waitFor({state:'hidden'});assert(await page.locator('.phone-dock').isHidden());assert(await page.locator('.dock-drag').isVisible());
  await page.setViewportSize({width,height});await page.locator('.phone-dock').waitFor({state:'visible'});assert(await page.locator('.phone-dock').isVisible());assert(await page.locator('.dock-drag').isHidden());assert(await page.locator('.phone-dock').getAttribute('data-settings')==='false');
  await page.locator('.phone-settings').click();await page.locator('.phone-back').click();assert(await page.locator('[data-tool="carve"]').getAttribute('aria-pressed')==='true');
 }
 const tray=null,shelf=null,shots=[];
 results.push({engine,width,height,starter,tray,shelf,shots,errors});assert.deepEqual(errors,[]);await page.close();console.log(mode,engine,width,'done');
}}finally{await browser.close();}}
}finally{server.close();await fs.writeFile(path.join(__dirname,mode+'-results.json'),JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exit(1)});

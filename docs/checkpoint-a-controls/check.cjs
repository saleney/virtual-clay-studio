const {chromium,webkit}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),mode=process.argv[2]||'before';
(async()=>{
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.join(root,name==='/'?'index.html':name);if(!file.startsWith(root+path.sep))throw Error('path');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':'text/html');res.end(await fs.readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/?qa`,results=[];
try{for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
const browser=await type.launch({headless:true,...(engine==='chromium'?{executablePath:chromium.executablePath(),args:['--enable-unsafe-swiftshader']}:{} )});
console.log(engine,'REAL BROWSER LAUNCHED',browser.version());
try{for(const width of [320,390,430,1280]){
 const height=width===1280?720:width===320?667:844,page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.locator('canvas').waitFor();await page.waitForTimeout(800);
 const fallback=await page.locator('[data-fallback]').evaluate(n=>n.classList.contains('is-visible'));assert(!fallback,'WebGL initialized');
 const starter=await page.locator('.clay-amount').boundingBox();await page.screenshot({path:path.join(__dirname,`${mode}-${engine}-${width}-starter.png`)});
 if(mode==='after'){assert(starter.x>=0&&starter.x+starter.width<=width+1,'starter inside viewport');for(const selector of ['[data-starter]','[data-clay-amount]'])for(const el of await page.locator(selector).all()){const r=await el.boundingBox();assert(r.x>=0&&r.x+r.width<=width+1,'starter option visible');}}
 await page.locator('canvas').focus();await page.keyboard.press('ArrowUp');await page.locator('[data-fire]').click();await page.locator('.work-surface.is-glazing').waitFor({timeout:15000});
 await page.locator('.finish-effects summary').click();await page.screenshot({path:path.join(__dirname,`${mode}-${engine}-${width}-effects.png`)});
 const panel=await page.locator('.finish-effects-panel').boundingBox(),tray=await page.locator('.glaze-tray').boundingBox(),shelf=await page.locator('.shelf-link').boundingBox();
 const labels=await page.locator('.finish-effects-panel label').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,right:r.right,text:n.textContent.trim()};}));
 if(mode==='after'){assert(panel.x>=0&&panel.x+panel.width<=width+1,'effects horizontal clipping');assert(tray.x>=0&&tray.x+tray.width<=width+1,'tray horizontal clipping');assert(labels.every(r=>r.x>=0&&r.right<=width+1),'effect label clipping');assert(shelf&&shelf.x>=0&&shelf.x+shelf.width<=width+1,'shelf visible');for(const effect of await page.locator('[data-glaze-effect]').all()){await effect.check();assert(await effect.isChecked());}await page.locator('[data-piece-finish]').selectOption('gloss');await page.locator('.shelf-link').click();await page.waitForTimeout(250);assert(new URL(page.url()).hash==='#your-shelf');}
 results.push({engine,width,height,starter,panel,tray,shelf,errors});assert.deepEqual(errors,[]);await page.close();console.log(mode,engine,width,'done');
}}finally{await browser.close();}}
}finally{server.close();await fs.writeFile(path.join(__dirname,mode+'-results.json'),JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs/promises'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});try{
for(const [width,height] of [[320,667],[390,844],[430,932],[768,1024],[1280,900]]){
const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://clay.local/**',async route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';let body=await fs.readFile(require('node:path').resolve(__dirname,'..',name));if(name==='atelier.js')body=Buffer.from(body.toString().replace('renderer.render(scene,camera);requestAnimationFrame(render);','renderer.render(scene,camera);')+`\nwindow.qa={state,makeClay,showPhaseNote,render(){fitGrowingClay();renderer.render(scene,camera)},top(){wheelGroup.updateMatrixWorld(true);camera.updateMatrixWorld();const points=geometry.getAttribute('position'),v=new THREE.Vector3(),r=renderer.domElement.getBoundingClientRect();let top=Infinity;for(let i=0;i<points.count;i++){v.fromBufferAttribute(points,i);wheelGroup.localToWorld(v);v.project(camera);top=Math.min(top,r.top+(1-v.y)*r.height/2);}return top;}};`);await route.fulfill({body,contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});});
await page.goto('https://clay.local/?qa');await page.waitForFunction(()=>window.qa);
for(const amount of [5,10,15]){await page.evaluate(amount=>{qa.state.clayAmount=amount;qa.makeClay();qa.render();},amount);
for(const [kind,message] of [['is-firing','Firing…'],['is-glazing','Ready for glaze'],['is-final-firing','Firing the glaze…']]){
const bounds=await page.evaluate(({kind,message})=>{const surface=document.querySelector('[data-surface]');surface.classList.remove('is-firing','is-glazing','is-final-firing');surface.classList.add(kind);qa.showPhaseNote(message);const n=document.querySelector('[data-phase-note]').getBoundingClientRect();return{top:n.top,bottom:n.bottom,left:n.left,right:n.right,clayTop:qa.top()};},{kind,message});
assert(bounds.bottom+12<bounds.clayTop,`${width}px/${amount}lb/${kind}: message must be above clay with space (${JSON.stringify(bounds)})`);assert(bounds.left>=0&&bounds.right<=width);}
}
await page.screenshot({path:`/tmp/raised-note-${width}.png`});assert.deepEqual(errors,[]);console.log(`${width}x${height}: all three messages sit above 5/10/15 lb clay`);await page.close();}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

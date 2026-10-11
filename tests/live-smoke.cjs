const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');

// The optional file must be freshly downloaded from the deployed site's atelier.js.
// It avoids Playwright's direct HTTP fetch in cloud environments with a curl-only proxy.
(async()=>{
  const browser=await chromium.launch({
    executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,
    headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']
  });
  try{
    const page=await browser.newPage({
      ignoreHTTPSErrors:process.env.CLAY_IGNORE_HTTPS_ERRORS==='1',
      viewport:{width:390,height:844},reducedMotion:'reduce'
    });
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/atelier.js*',async route=>{
      const source=process.env.LIVE_ATELIER_FILE
        ?await fs.readFile(process.env.LIVE_ATELIER_FILE,'utf8')
        :await (await route.fetch()).text();
      // Render the first frame only to keep software-GPU CI practical.
      const body=source.replace('renderer.render(scene,camera);requestAnimationFrame(render);','renderer.render(scene,camera);')+'\nwindow.liveQA={state};';
      await route.fulfill({body,contentType:'text/javascript'});
    });
    await page.goto('https://saleney.github.io/virtual-clay-studio/');
    await page.waitForFunction(()=>window.liveQA?.state.profile.length);
    assert.equal(await page.locator('[data-quick-water]').count(),1);
    await page.locator('.three-stage canvas').focus();
    const before=await page.evaluate(()=>JSON.stringify(liveQA.state.profile));
    await page.keyboard.press('ArrowUp');
    await page.locator('[data-undo]').click();
    assert.equal(await page.evaluate(()=>JSON.stringify(liveQA.state.profile)),before);
    await page.locator('[data-tool="carve"]').click();
    assert(await page.locator('[data-carve-width]').isVisible());
    await page.locator('[data-trim-foot]').click();
    assert.notEqual(await page.evaluate(()=>JSON.stringify(liveQA.state.profile)),before);
    await page.locator('[data-undo]').click();
    assert.equal(await page.evaluate(()=>JSON.stringify(liveQA.state.profile)),before);
    assert.deepEqual(errors,[]);
    console.log('Live mobile studio: controls, shaping, undo, foot trimming and initialization passed');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});

// Run the unchanged legacy workflow independently at each requested width.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const original=path.resolve(__dirname,'../../tests/workflow-browser.cjs');
for(const width of [320,390,430,1280]){
 const code=`const fs=require('node:fs'),Module=require('node:module');const p=${JSON.stringify(original)};const m=new Module(p);m.filename=p;m.paths=Module._nodeModulePaths(require('node:path').dirname(p));m._compile(fs.readFileSync(p,'utf8').replace('for(const width of [320,390,430,1280])','for(const width of [${width}])'),p);`;
 const r=spawnSync(process.execPath,['-e',code],{env:{...process.env,CHROMIUM_EXECUTABLE:require('playwright').chromium.executablePath()},timeout:120000,encoding:'utf8'});
 fs.writeFileSync(path.join(__dirname,`workflow-${width}.txt`),(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.message:''));console.log(width,r.status===0?'PASS':r.error?'TIMEOUT/ERROR':'FAIL');
}

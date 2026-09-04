import {cp,mkdir,readFile,rm,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
const root=resolve(import.meta.dirname,".."),out=resolve(root,"www");
await rm(out,{recursive:true,force:true});await mkdir(resolve(out,"assets"),{recursive:true});await mkdir(resolve(out,"vendor"),{recursive:true});
const html=await readFile(resolve(root,"index.html"),"utf8");
await writeFile(resolve(out,"index.html"),html.replace('<a class="salene-home-link" href="https://saleney.github.io/">← Back to Salene’s Playground</a>','<span class="salene-home-link" aria-hidden="true">Virtual Clay Studio</span>'));
await cp(resolve(root,"assets"),resolve(out,"assets"),{recursive:true});await cp(resolve(root,"node_modules/three/build/three.module.js"),resolve(out,"vendor/three.module.js"));
const source=await readFile(resolve(root,"atelier.js"),"utf8");await writeFile(resolve(out,"atelier.js"),source.replace("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js","./vendor/three.module.js"));
console.log("Mobile web bundle created in www/");

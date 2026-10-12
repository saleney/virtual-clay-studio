import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../atelier.js',import.meta.url),'utf8');
function extract(name){let start=src.indexOf(`function ${name}(`),end=src.indexOf('{',start),depth=0;do{const c=src[end++];if(c==='{')depth++;if(c==='}')depth--;}while(depth);return src.slice(start,end);}
const marks=[],object={},state={phase:'glaze',glazeBrushSize:.1,glaze:{pointer:{}}};
const ctx={state,glazeCanvas:{width:512},paintGlaze:uv=>marks.push(uv)};vm.createContext(ctx);vm.runInContext(extract('glazeBrushRadius')+'\n'+extract('paintGlazeStroke'),ctx);
ctx.paintGlazeStroke({object,uv:{x:.98,y:.5}});ctx.paintGlazeStroke({object,uv:{x:.02,y:.5}});
assert(marks.length>20,'fine brush connects across seam');assert(marks.every(p=>p.x>.97||p.x<.03),'no long stripe around back');
marks.length=0;ctx.paintGlazeStroke(null);ctx.paintGlazeStroke({object,uv:{x:.15,y:.5}});assert.equal(marks.length,1,'missed contact breaks stroke');
marks.length=0;ctx.paintGlazeStroke({object:{},uv:{x:.16,y:.5}});assert.equal(marks.length,1,'interior jump breaks stroke');
assert(ctx.glazeBrushRadius()<3,'fine brush is actually fine');state.glazeBrushSize=2.2;assert(ctx.glazeBrushRadius()>40,'broad brush covers a band');
console.log('Continuous brush, wrap seam, missed contact, surface transition and fine/broad brush checks passed');

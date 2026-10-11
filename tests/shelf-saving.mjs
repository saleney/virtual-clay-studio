import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../atelier.js',import.meta.url),'utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);let end=source.indexOf('{',start),depth=0;do{const c=source[end++];if(c==='{')depth++;if(c==='}')depth--;}while(depth);return source.slice(start,end);}
let saved=null,fail=false,serial=0,event;
const ctx={finishedPieces:Array.from({length:6},(_,i)=>({id:String(i),image:'data:image/png;base64,old'})),currentShelfId:null,shelfStorageKey:'qa',captureFinishedPiece:()=> 'data:image/png;base64,new',localStorage:{setItem:(key,value)=>{if(fail)throw Error('Quota');saved=value;}},crypto:{randomUUID:()=>String(++serial+6)},window:{dispatchEvent:e=>event=e},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},renderFinishedShelves:()=>{}};
vm.createContext(ctx);vm.runInContext(extract('placeFinishedPiece'),ctx);
assert.equal(ctx.placeFinishedPiece(),true);assert.equal(JSON.parse(saved).length,7);assert.equal(ctx.finishedPieces[0].id,'0');assert.equal(event.detail.pieces.length,7);
ctx.placeFinishedPiece();assert.equal(ctx.finishedPieces.length,7,'Re-glazing updates same piece');
const priorSaved=saved;fail=true;ctx.currentShelfId=null;
assert.equal(ctx.placeFinishedPiece(),false);assert.equal(saved,priorSaved,'Failure never destroys persisted shelf');assert.equal(ctx.finishedPieces.length,8);assert.equal(event.detail.persisted,false);assert.equal(event.detail.pieces.length,8,'Unsaved piece remains available for download');
fail=false;ctx.placeFinishedPiece();assert.equal(JSON.parse(saved).length,8);assert.equal(event.detail.persisted,true,'Later successful save keeps pending pieces');
console.log('Seven-plus pieces retained, re-glaze identity stable, quota failure honest and recoverable');

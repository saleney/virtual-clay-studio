// Temporary QA entry appends this to atelier.js; no fixture enters production.
(async()=>{
 const report=document.createElement('pre');report.id='coverage-results';report.style.cssText='position:fixed;right:8px;top:8px;z-index:100;font:11px monospace;background:#fff;padding:8px;max-width:340px;max-height:180px;overflow:auto';document.body.append(report);
 const checks=[],check=(ok,text)=>{if(!ok)throw Error(text);checks.push(text);},wait=ms=>new Promise(r=>setTimeout(r,ms));
 try{
 makeClay();setWheelSpeed(0);openClay(.5);const shape=JSON.stringify(cloneProfile());
 coatWholePiece();check(state.glaze.history.length===0,'Coat guarded during throwing');
 fire();fire();await wait(3000);check(state.phase==='glaze','First firing advances once');
 const before=snapshotGlaze();coatWholePiece();const coated=snapshotGlaze();
 check(coated.data.every((v,i)=>v===[112,139,121,255][i%4]),'Every base-coat texel is opaque selected color');
 undo();check(snapshotGlaze().data.every((v,i)=>v===before.data[i]),'Undo restores prior coat exactly');redo();check(snapshotGlaze().data.every((v,i)=>v===coated.data[i]),'Redo restores coat exactly');
 selectGlazeColor('chalk');coatWholePiece();undo();check(snapshotGlaze().data.every((v,i)=>v===coated.data[i]),'Replacement base coat is reversible');
 state.glazeBrushSize=.1;selectGlazeColor('cobalt');state.glaze.before=snapshotGlaze();state.glaze.changed=false;state.glaze.pointer={id:123};
 const object=clay;paintGlazeStroke({object,uv:{x:.2,y:.5}});paintGlazeStroke({object,uv:{x:.4,y:.5}});onUp({pointerId:123});
 const painted=snapshotGlaze();let gaps=0;for(let x=104;x<203;x++){const i=(256*512+x)*4;if(painted.data[i]>60)gaps++;}check(gaps===0,'Fine fast stroke has no unpainted gaps');
 undo();check(snapshotGlaze().data.every((v,i)=>v===coated.data[i]),'Fine stroke Undo preserves base coat');
 check(JSON.stringify(cloneProfile())===shape,'Glazing preserves geometry');
 check(glazeMaterial.roughness>.9&&glazeMaterial.clearcoat===0,'Unfired coat remains matte');
 state.phase='final-firing';const history=state.glaze.history.length;coatWholePiece();check(history===state.glaze.history.length,'Coat guarded during final firing');state.phase='glaze';
 setGlazeFinish(true);check(glazeMaterial.clearcoat>.6,'Final finish reveals glassy surface');setGlazeFinish(false);
 finishPiece();finishPiece();await wait(3000);check(state.phase==='complete','Final fire completes once');
 check((await loadShelf(shelfStorageKey)).some(p=>p.id===currentShelfId),'Actual fired PNG survives a fresh database read');
 report.textContent='PASS\n'+checks.join('\n');report.dataset.passed='true';
 }catch(e){report.textContent='FAIL '+e+'\n'+checks.join('\n');report.dataset.passed='false';}
})();

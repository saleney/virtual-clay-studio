// Opt-in local review fixture; never appended to published source.
if(new URLSearchParams(location.search).has('review-scene')){
 (async()=>{const mode=new URLSearchParams(location.search).get('review-scene'),checks=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));const check=(v,n)=>{if(!v)throw Error(n);checks.push(n);};
 const saved=localStorage.getItem(shelfStorageKey);const capture=renderer.domElement.setPointerCapture;renderer.domElement.setPointerCapture=()=>{};
 try{finishedPieces.length=0;localStorage.removeItem(shelfStorageKey);await wait(200);makeClay();setWheelSpeed(0);
 state.profile=state.profile.map((r,i)=>{const t=i/(ringCount-1);return{y:r.y,r:1.02+.19*Math.sin(t*Math.PI*1.8)-.16*t};});rebuildMesh();setInterior(.38,.5);selectTool('rib');
 if(mode==='rib'){
 const before=JSON.stringify(cloneProfile());saveBeforeStroke();state.pointer={index:Math.floor(ringCount*.5)};
 for(let i=0;i<12;i++){const index=Math.floor(ringCount*(.32+i*.032));compressRib(index,i<5?-12:9,i%2?9:-9);}finishStroke();state.pointer=null;
 const after=JSON.stringify(cloneProfile());undo();check(JSON.stringify(cloneProfile())===before,'Rib Undo restores exact shape');redo();check(JSON.stringify(cloneProfile())===after,'Rib Redo restores directional contour');
 check(state.profile.every(r=>Number.isFinite(r.r)&&Number.isFinite(r.y)),'Rib shape finite');check(Math.abs(state.innerProfile.at(-1).y-state.profile.at(-1).y)<1e-8,'Inner rim attached');
 }else{
 fire();fire();check(state.phase==='firing','First firing guarded');await wait(2800);check(state.phase==='glaze','Automatic first fire to glaze');setWheelSpeed(0);selectGlazeColor('cobalt');state.glaze.before=snapshotGlaze();
 for(let pass=0;pass<3;pass++)for(let y=1;y<17;y++)for(let x=0;x<24;x++)paintGlaze({x:x/24,y:y/18},0);
 state.glaze.pointer={id:77};onUp({pointerId:77});const painted=snapshotGlaze().data.slice();undo();check(snapshotGlaze().data.every(v=>v===0),'Glaze Undo clears brush coat');redo();check(snapshotGlaze().data.every((v,i)=>v===painted[i]),'Glaze Redo restores exact colors/alpha');
 if(glazeMaterial.userData.finishUniform){check(glazeMaterial.roughness>.9&&glazeMaterial.clearcoat===0,'Unfired glaze chalky and matte');check(glazeMaterial.userData.finishUniform.value===0,'Unfired color transform active');}
 if(['fired','loop'].includes(mode)){
 finishPiece();finishPiece();check(state.phase==='final-firing','Final firing guarded');check(document.querySelector('[data-finish]').disabled,'Final button locked');await wait(2800);check(state.phase==='complete','Final firing completes');
 check(snapshotGlaze().data.every((v,i)=>v===painted[i]),'Firing never mutates canonical paint');
 if(glazeMaterial.userData.finishUniform)check(glazeMaterial.roughness<.3&&glazeMaterial.clearcoat>.6&&glazeMaterial.userData.finishUniform.value===1,'Fired color and gloss revealed');
 check(JSON.parse(localStorage.getItem(shelfStorageKey)).length===1,'Exactly one saved piece');
 }
 if(mode==='loop'){selectBrushMaterial('water');makeClay();check(state.tool==='hand','New clay returns to Hands');check(state.brushMaterial==='slip','New clay clears prior Water material');check(!state.undoActions.length&&!state.redoActions.length,'New clay resets history');check(state.phase==='form'&&!state.fired,'New clay returns to throwing');check(document.querySelector('.clay-amount').getBoundingClientRect().width>0,'Clay size chooser returns');}
 }
 document.body.dataset.reviewResult=JSON.stringify({ok:true,checks});
 }catch(e){document.body.dataset.reviewResult=JSON.stringify({ok:false,checks,error:String(e)});}finally{renderer.domElement.setPointerCapture=capture;if(saved===null)localStorage.removeItem(shelfStorageKey);else localStorage.setItem(shelfStorageKey,saved);}
 })();
}

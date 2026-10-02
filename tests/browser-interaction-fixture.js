// Temporary opt-in interaction audit, excluded from the release.
if(new URLSearchParams(location.search).has('interaction-qa')){
 const results=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const check=(condition,label)=>{if(!condition)throw Error(label);results.push(label);};
 const eventAt=(type,point,id=77)=>{
  renderer.domElement.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:'touch',isPrimary:id===77,clientX:point.x,clientY:point.y,buttons:type==='pointerup'?0:1}));
 };
 // Synthetic pointers cannot obtain browser capture; calls below use the same
 // handlers, and pointer-cancel is exercised explicitly.
 const press=p=>onDown({pointerId:77,clientX:p.x,clientY:p.y,cancelable:true,preventDefault(){}});
 const pointAt=(height=.5,side=.45)=>{
  wheelGroup.updateMatrixWorld(true);camera.updateMatrixWorld();
  const ring=state.profile[Math.floor((state.profile.length-1)*height)];
  const a=state.yaw+Math.PI/2;
  const local=new THREE.Vector3(Math.cos(a)*ring.r*side,ring.y,Math.sin(a)*ring.r*side);
  const projected=wheelGroup.localToWorld(local).project(camera),bounds=renderer.domElement.getBoundingClientRect();
  return {x:bounds.left+(projected.x+1)*bounds.width/2,y:bounds.top+(1-projected.y)*bounds.height/2};
 };
 (async()=>{
  // onDown normally captures a genuine pointer. Use a fixture-local adapter for
  // this synthetic event sequence, without changing shipped handling.
  const capture=renderer.domElement.setPointerCapture.bind(renderer.domElement);
  renderer.domElement.setPointerCapture=()=>{};
  try{
   for(const amount of [5,10,15]){
    state.clayAmount=amount;makeClay();await wait(100);
    const before=JSON.stringify(cloneProfile()),pan=scene.children.filter(o=>o!==wheelGroup).map(o=>o.position.toArray());
    selectTool('water');let p=pointAt();press(p);onMove({pointerId:77,clientX:p.x+80,clientY:p.y-90});onUp({pointerId:77});
    check(wetness>.9,`${amount} lb water applied`);check(before===JSON.stringify(cloneProfile()),`${amount} lb water preserves geometry`);
    check(JSON.stringify(pan)===JSON.stringify(scene.children.filter(o=>o!==wheelGroup).map(o=>o.position.toArray())),`${amount} lb stationary hardware`);
    selectTool('carve');p=pointAt(.8);press(p);
    for(let i=1;i<=15;i++){onMove({pointerId:77,clientX:p.x-i*2,clientY:p.y+i*4});await wait(20);}onUp({pointerId:77});
    check(state.localAlterations.length>0,`${amount} lb diagonal cut created`);
    for(const tool of ['sponge','rib']){
     selectTool(tool);p=pointAt(.7);press(p);await wait(1000);onUp({pointerId:77});
     check(state.profile.every(r=>Number.isFinite(r.r)&&Number.isFinite(r.y)),`${amount} lb ${tool} remains finite`);
    }
    selectTool('hand');p=pointAt(.5);press(p);
    // Second fingers are ignored; cancellation must free the first gesture.
    onDown({pointerId:88,clientX:p.x,clientY:p.y,cancelable:true,preventDefault(){}});
    check(state.pointer?.id===77,`${amount} lb competing touch ignored`);onUp({pointerId:77,type:'pointercancel'});
    check(!state.pointer,`${amount} lb cancellation clears gesture`);
    makeClay();check(wetness===0,`${amount} lb reset dries clay`);
   }
   // Rapid, oversized and repeatedly reversed drags, with frequent tool changes.
   state.clayAmount=15;makeClay();selectTool('hand');
   setInterior(.3,.4);
   for(let gesture=0;gesture<24;gesture++){
    selectTool(['hand','carve','sponge','rib','water'][gesture%5]);
    let p=pointAt(.3+(gesture%5)*.12);press(p);
    for(let step=1;step<=6;step++)onMove({pointerId:77,clientX:p.x+(step%2?160:-160),clientY:p.y+(gesture%2?240:-240)});
    onUp({pointerId:77});
    check(state.profile.every(r=>Number.isFinite(r.r)&&Number.isFinite(r.y)),`rapid gesture ${gesture} finite`);
    check(!state.innerProfile||Math.abs(state.innerProfile.at(-1).y-state.profile.at(-1).y)<1e-6,`rapid gesture ${gesture} attached rim`);
   }
   makeClay();check(!state.pointer&&!state.innerProfile&&wetness===0,'reset recovers from rapid tool sequence');
   // Slow stationary hold: carve a local mark exactly under the contact.
   for(const tool of ['sponge','rib']){
    state.clayAmount=5;makeClay();state.wheel.target=0;state.wheel.speed=0;state.wheel.paused=true;
    const p=pointAt(.6);const hit=getHitAt(p.x,p.y),local=wheelGroup.worldToLocal(hit.point.clone());
    state.localAlterations=[{y:local.y,angle:Math.atan2(local.z,local.x),radialDelta:-.045,heightRadius:.065,angleRadius:.09,strokeId:100}];rebuildMesh();
    selectTool(tool);press(p);await wait(4500);onUp({pointerId:77});
    check(state.localAlterations.length===0,`${tool} stationary hold removes groove`);
   }
   makeClay();selectTool('water');press(pointAt());fire();check(wetness===0,'firing clears water');await wait(2600);check(state.phase==='glaze','automatic firing to glazing');
   check(state.innerProfile===null,'firing does not invent a cavity');
   const snapshot=captureFinishedPiece();check(snapshot.startsWith('data:image/png;base64,')&&snapshot.length>10000,'saved-piece renderer produces a PNG');check(renderer.getRenderTarget()===null,'saved-piece renderer restores the live wheel');
   document.body.dataset.interactionQa=JSON.stringify({ok:true,checks:results});console.log('Interaction audit passed',results.length);
  }catch(error){document.body.dataset.interactionQa=JSON.stringify({ok:false,checks:results,error:String(error)});console.error(error);}
  finally{renderer.domElement.setPointerCapture=capture;}
 })();
}

// Local opt-in rendering audit. Excluded from released source.
if(new URLSearchParams(location.search).has('gentle-qa')){
 (async()=>{const checks=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));const check=(v,n)=>{if(!v)throw Error(n);checks.push(n);};
 const capture=renderer.domElement.setPointerCapture;renderer.domElement.setPointerCapture=()=>{};
 const point=()=>{wheelGroup.updateMatrixWorld(true);camera.updateMatrixWorld();const ring=state.profile[Math.floor(ringCount*.55)],a=state.yaw+Math.PI/2,v=wheelGroup.localToWorld(new THREE.Vector3(Math.cos(a)*ring.r*.45,ring.y,Math.sin(a)*ring.r*.45)).project(camera),r=renderer.domElement.getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};};
 try{await wait(250);for(const amount of [5,10,15]){state.clayAmount=amount;makeClay();state.wheel.speed=state.wheel.target=0;state.wheel.paused=true;selectTool('carve');await wait(100);const p=point();
 for(let pass=0;pass<25;pass++){onDown({pointerId:77,clientX:p.x,clientY:p.y,cancelable:true,preventDefault(){}});for(let i=1;i<=8;i++)onMove({pointerId:77,clientX:p.x+(i%2?1:-1),clientY:p.y+i*2});onUp({pointerId:77});}
 check(state.localAlterations.length>0,`${amount}lb actual vertical cuts created`);prepareAlterationAngles();
 check(state.localAlterations.every(m=>localAlterationAt(m.y,m.angle).radial>=-.031),`${amount}lb 25 retraces never stack depth`);
 check([...geometry.getAttribute('position').array].every(Number.isFinite),`${amount}lb rendered cut geometry finite`);
 selectTool('sponge');const hit=getHitAt(p.x,p.y),local=wheelGroup.worldToLocal(hit.point.clone());
 state.localAlterations=[{y:local.y,angle:Math.atan2(local.z,local.x),radialDelta:-.03,heightRadius:.08,angleRadius:.12,strokeId:200}];rebuildMesh();onDown({pointerId:77,clientX:p.x,clientY:p.y,cancelable:true,preventDefault(){}});await wait(4500);onUp({pointerId:77});check(state.localAlterations.length===0,`${amount}lb held sponge fully removes local cut`);
 }
 makeClay();document.body.dataset.gentleQa=JSON.stringify({ok:true,checks});
 }catch(e){document.body.dataset.gentleQa=JSON.stringify({ok:false,checks,error:String(e)});}finally{renderer.domElement.setPointerCapture=capture;}
 })();
}

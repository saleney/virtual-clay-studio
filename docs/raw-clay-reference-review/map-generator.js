// One seamless circumference, no repeated tiles. Generated once and shared by clay colors.
function makeRawClayMaps(){
 const size=1024,height=new Float32Array(size*size),cloud=new Float32Array(size*size);
 const hash=(x,y)=>{let n=Math.imul(x,374761393)^Math.imul(y,668265263)^1979;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
 const noise=(u,v,nx,ny)=>{const x=u*nx,y=v*ny,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);const a=hash((ix%nx+nx)%nx,iy),b=hash(((ix+1)%nx+nx)%nx,iy),c=hash((ix%nx+nx)%nx,iy+1),d=hash(((ix+1)%nx+nx)%nx,iy+1);return (a+(b-a)*sx)*(1-sy)+(c+(d-c)*sx)*sy;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/(size-1),i=y*size+x;
  const broad=noise(u,v,5,7)*.65+noise(u,v,13,17)*.35;
  const warp=noise(u,v,4,11),fade=.15+.85*noise(u,v,7,23);
  const phase=v*850+Math.sin(v*13)*12+Math.sin(v*37)*3+(warp-.5)*1.2;
  const rings=Math.sin(phase)*fade*fade*(.15+.85*noise(u,v,3,31));
  height[i]=rings*.12+(broad-.5)*.5+(noise(u,v,128,173)-.5)*.035+Math.max(0,hash(x,y)-.985)*-3;
  cloud[i]=broad;
 }
 const make=(kind)=>{const data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=y*size+x,j=i*4;
   if(kind==='normal'){
    const dx=(height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size])*.9;
    const dy=(height[Math.min(size-1,y+1)*size+x]-height[Math.max(0,y-1)*size+x])*.9;
    const length=Math.hypot(dx,dy,1);data[j]=Math.round(127.5-dx/length*127.5);data[j+1]=Math.round(127.5-dy/length*127.5);data[j+2]=Math.round(127.5+127.5/length);
   }else{const value=kind==='roughness'?232+cloud[i]*22+(hash(x,y)-.5)*6:246+(cloud[i]-.5)*8-Math.max(0,hash(x,y)-.985)*180;data[j]=data[j+1]=data[j+2]=Math.round(value);}
   data[j+3]=255;
  }
  const map=new THREE.DataTexture(data,size,size);map.wrapS=THREE.RepeatWrapping;map.wrapT=THREE.ClampToEdgeWrapping;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());if(kind==='color')map.colorSpace=THREE.SRGBColorSpace;map.needsUpdate=true;return map;
 };
 return {normal:make('normal'),roughness:make('roughness'),color:make('color')};
}


// PNG collections belong in IndexedDB; retain the original localStorage copy
// as a migration source and as a fallback when database access is unavailable.
const valid=pieces=>Array.isArray(pieces)?pieces.filter(p=>typeof p?.id==='string'&&typeof p.image==='string'&&p.image.startsWith('data:image/png;base64,')):[];
function merge(older,newer){const all=new Map();for(const p of [...valid(older),...valid(newer)]){const previous=all.get(p.id);if(!previous||(p.updatedAt||0)>=(previous.updatedAt||0))all.set(p.id,p);}return [...all.values()];}
function legacy(key){try{return valid(JSON.parse(localStorage.getItem(key)||'[]'));}catch{return [];}}
function openShelf(){
 return new Promise((resolve,reject)=>{
  let settled=false;
  const timer=setTimeout(()=>{settled=true;reject(Error('Shelf unavailable'));},3000);
  let request;try{request=indexedDB.open('virtual-clay-studio-collections',1);}catch(error){clearTimeout(timer);reject(error);return;}
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('shelves'))request.result.createObjectStore('shelves');};
  request.onsuccess=()=>{clearTimeout(timer);if(settled){request.result.close();return;}settled=true;resolve(request.result);};
  request.onerror=()=>{clearTimeout(timer);settled=true;reject(request.error);};
 });
}
export async function loadShelf(key){
 const old=legacy(key);let db;
 try{
  db=await openShelf();
  const saved=await new Promise((resolve,reject)=>{const request=db.transaction('shelves').objectStore('shelves').get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  const pieces=merge(old,saved);
  if(old.length&&!saved)await saveShelf(key,pieces);
  return pieces;
 }catch{return old;}finally{db?.close();}
}
export async function saveShelf(key,pieces){
 const copy=valid(pieces).map(p=>({...p,updatedAt:Date.now()}));let db;
 try{
  db=await openShelf();
  await new Promise((resolve,reject)=>{
   const transaction=db.transaction('shelves','readwrite'),store=transaction.objectStore('shelves'),request=store.get(key);
   request.onsuccess=()=>store.put(merge(request.result,copy),key);
   transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);
  });
  return true;
 }catch{
  try{localStorage.setItem(key,JSON.stringify(merge(legacy(key),copy)));return true;}catch{return false;}
 }finally{db?.close();}
}

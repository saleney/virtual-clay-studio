import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../atelier.js',import.meta.url),'utf8');
function extract(name){let start=source.indexOf(`function ${name}(`),end=source.indexOf('{',start),depth=0;do{const c=source[end++];if(c==='{')depth++;if(c==='}')depth--;}while(depth);return source.slice(start,end);}
const mat={userData:{},roughness:0,clearcoat:0},ctx={glazeMaterial:mat,state:{profile:[{y:-1.43}]}};vm.createContext(ctx);vm.runInContext(['setGlazeFinish','configureGlazeFinish'].map(extract).join('\n'),ctx);
ctx.configureGlazeFinish();assert.equal(mat.roughness,.94);assert.equal(mat.clearcoat,0);const shader={uniforms:{},fragmentShader:'#include <map_fragment>',vertexShader:'#include <begin_vertex>'};mat.onBeforeCompile(shader);assert.equal(shader.uniforms.glazeFired.value,0);assert(shader.fragmentShader.includes('chalkyGlaze'));
ctx.setGlazeFinish(true);assert.equal(shader.uniforms.glazeFired.value,1);assert.equal(mat.roughness,.24);assert.equal(mat.clearcoat,.65);
ctx.setGlazeFinish(false);assert.equal(shader.uniforms.glazeFired.value,0);assert.equal(mat.clearcoat,0);console.log('Glaze preview, fired finish, and re-glazing uniform transitions passed');

ctx.state.glazeFinish="cloud";ctx.configureGlazeFinish();mat.onBeforeCompile(shader);assert.equal(shader.uniforms.glazeCloud.value,1);assert.equal(shader.uniforms.glazeFired.value,0);ctx.setGlazeFinish(true);assert.equal(shader.uniforms.glazeFired.value,1);assert(shader.fragmentShader.includes("glazeCloud*glazeFired"));console.log("Cloud finish is optional and gated by final firing");

ctx.state.glazeEffects={pooling:true,speckles:true};ctx.state.glazeIntensity=.7;ctx.configureGlazeFinish();
const reactive={uniforms:{},fragmentShader:'#include <map_fragment>',vertexShader:'#include <begin_vertex>'};mat.onBeforeCompile(reactive);
assert.equal(reactive.uniforms.effect_pooling.value,1);assert.equal(reactive.uniforms.effect_speckles.value,1);assert.equal(reactive.uniforms.effect_runs.value,0);assert.equal(reactive.uniforms.effect_intensity.value,.7);
assert.equal(reactive.uniforms.glazeFired.value,0);ctx.setGlazeFinish(true);assert.equal(reactive.uniforms.glazeFired.value,1);
console.log('Independent reactive effect uniforms and intensity survive firing');

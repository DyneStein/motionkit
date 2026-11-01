// preview.mjs <project-dir> <t1,t2,...> [outdir]: fast frame preview + timing + console errors, without a full render
import puppeteer from 'puppeteer-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, film, ts, out='/tmp/x'] = process.argv; const root=path.resolve('..',film);
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.m4a':'audio/mp4','.jpg':'image/jpeg','.png':'image/png','.glb':'model/gltf-binary','.gltf':'application/json','.bin':'application/octet-stream','.ttf':'font/ttf','.hdr':'application/octet-stream'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/')p='/index.html'; const f=path.join(root,p); fs.readFile(f,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'}); r.end(d);});}).listen(0);
const port=srv.address().port;
const b=await puppeteer.launch({executablePath:process.env.CHROME||(await import('child_process')).execSync("find ~/.cache/hyperframes -type f -name chrome-headless-shell | head -1").toString().trim(),headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--enable-webgl','--use-gl=angle','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage(); await pg.setViewport({width:1080,height:1920});
pg.on('pageerror',e=>console.log('PAGEERROR',e.stack||e.message)); pg.on('console',m=>{const t=m.text(); if(m.type()==='error'||m.type()==='warning'||t.startsWith('[')) console.log(m.type(),t.slice(0,400));});
pg.on('requestfailed',r=>console.log('REQFAIL',r.url()));pg.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url())});
await pg.goto('http://localhost:'+port+'/index.html'+(process.env.Q?'?samples='+process.env.Q:''),{waitUntil:'load'});
const s0=Date.now(); await pg.evaluate(()=>window.__hf.buildReady.film); console.log('build ms',Date.now()-s0);
fs.mkdirSync(out,{recursive:true});
for(const t of ts.split(',').map(Number)){ const ms=await pg.evaluate(t=>{const a=performance.now(); window.__film.renderAt(t); const gl=window.__film.renderer.getContext(); const px=new Uint8Array(4); gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px); return performance.now()-a;},t); const f=path.join(out,'t'+t.toFixed(2).padStart(6,'0')+'.jpg'); const data=await pg.evaluate(()=>document.getElementById('gl').toDataURL('image/jpeg',.9)); fs.writeFileSync(f,Buffer.from(data.split(',')[1],'base64')); console.log('t',t,'render ms',Math.round(ms)); }
await b.close(); srv.close();

const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1000}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const nm=__dirname+'/node_modules/';
await p.route('**/cdn.jsdelivr.net/**',r=>r.abort());
await p.route('**/cdnjs.cloudflare.com/**',r=>{const u=r.request().url();const f=u.includes('pdf.worker')?nm+'pdfjs-dist/build/pdf.worker.min.js':u.includes('pdf.min')?nm+'pdfjs-dist/build/pdf.min.js':u.includes('jspdf')?nm+'jspdf/dist/jspdf.umd.min.js':u.includes('jszip')?nm+'jszip/dist/jszip.min.js':nm+'exceljs/dist/exceljs.min.js';r.fulfill({path:f,contentType:'application/javascript'})});
await p.route('**/fonts.g*/**',r=>r.abort());
await p.goto('http://127.0.0.1:8765/test.html#draw');await p.waitForTimeout(1500);
await p.evaluate(()=>{window.__READ={project:"Interior Park, Gaganpahad",client:null,items:[
{no:"1",text:"1450 x 400 (Length - 400mm - 1 No's)",kind:"straight",W:1450,H:400,L:400,qty:1,confidence:"high"},
{no:"2",text:"1450 x 400 (Length - 300mm - 1 No's)",kind:"straight",W:1450,H:400,L:300,qty:1,confidence:"high"},
{no:"3",text:"1500 x 500 (Length - 400mm - 2 No's)",kind:"straight",W:1500,H:500,L:400,qty:2,confidence:"high"},
{no:"4",text:"1500 x 500 (Length - 300mm - 2 No's)",kind:"straight",W:1500,H:500,L:300,qty:2,confidence:"high"},
{no:"5",text:"Sketch 650 top / 600 bottom, 200; 600 x 150 -> 3 Nos",kind:"shoe",W:650,W2:600,H:150,H2:150,L:200,qty:3,confidence:"high"}],notes:[]}});
await p.setInputFiles('#dwg-file','/tmp/claude-0/-home-claude/5190d74f-1896-5f7d-b42e-7d5799075e44/scratchpad/ip/client.pdf');
await p.waitForFunction(()=>T.res||T.error,null,{timeout:60000});
console.log('err',await p.evaluate(()=>T.error),'sent',JSON.stringify(await p.evaluate(()=>window.__SAMP)));
console.log(JSON.stringify(await p.evaluate(()=>({rows:T.rows.map(r=>[r.mark,r.type,r.gauge,r.conn,r.A,r.B,r.C,r.D,r.L,r.qty]),t:rowsCalc().sqft,w:T.res.warnings}))));
await p.waitForTimeout(800);await p.screenshot({path:__dirname+'/req.png',fullPage:false});
await p.click('[data-act="tag-xlsx"]');await p.waitForFunction(()=>window.__DL,null,{timeout:30000});
const dl=await p.evaluate(()=>({f:__DL.filename,b64:__DL.b64}));fs.writeFileSync(__dirname+'/req.xlsx',Buffer.from(dl.b64,'base64'));console.log('xlsx',dl.f);
console.log('ERR',errs.filter(e=>!/fonts|ERR_FAILED|jsdelivr|net::/.test(e)).join('\n'));await b.close()})();

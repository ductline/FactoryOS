const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [f,shot] of [[process.argv[2],'fab1'],[process.argv[3],'fab2']]){const p=await b.newPage({viewport:{width:1500,height:1400}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/cdn.jsdelivr.net/**',r=>r.abort());await p.route('**/fonts.g*/**',r=>r.abort());await p.route('**/cdnjs.cloudflare.com/**',r=>r.abort());
await p.goto('http://127.0.0.1:8765/test.html#draw');await p.waitForTimeout(1200);
await p.setInputFiles('#dwg-file',f);await p.waitForFunction(()=>T.res||T.error,null,{timeout:120000});
const r=await p.evaluate(()=>({fab:!!T.res.fab,boxes:T.res.boxes,warn:T.res.warnings,rows:T.rows.map(r=>[r.mark,r.type,r.A+'x'+r.B,r.kind==='elbow'?'r'+r.L+'/'+r.E+'°':'L'+r.L,'q'+r.qty,r.gauge+'G']),tot:rowsCalc().sqft}));
console.log('\n=== '+f.split('/').pop());console.log(JSON.stringify({fab:r.fab,boxes:r.boxes,warn:r.warn,sqft:r.tot}));r.rows.forEach(x=>console.log('  ',x.join('  ')));
await p.screenshot({path:__dirname+'/'+shot+'.png',fullPage:true});console.log('ERR',errs.join('|'));await p.close()}
await b.close()})();

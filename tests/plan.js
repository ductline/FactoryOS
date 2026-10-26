const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:2400}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/cdn*/**',r=>r.abort());await p.route('**/fonts.g*/**',r=>r.abort());
await p.goto('http://127.0.0.1:8765/test.html#plan');await p.waitForTimeout(1500);
const mats=JSON.parse(fs.readFileSync(__dirname+'/mats.json'));
await p.evaluate(m=>{for(const [k,v] of Object.entries(m))S.materials[k]={...v,code:v.code||k};render.force=true;render()},mats);await p.waitForTimeout(500);
console.log(await p.evaluate(()=>planRows().map(r=>PLAN_GROUPS[r.grp][0]+" "+r.m.code).join("\n")));
await p.screenshot({path:__dirname+'/plan.png'});console.log('ERR',errs.join('\n'));await b.close()})();

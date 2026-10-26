const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:950}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/test.html#floor');await p.waitForTimeout(1200);
await p.screenshot({path:__dirname+'/f0.png'});
// pick a card that has a part list (area>0)
const id=await p.evaluate(()=>S.wos.find(w=>w.stage==='planned'&&(w.items||[]).length).id);
const c=await p.$(`.card[data-wo="${id}"]`);const cb=await c.boundingBox();
const col=await p.$('.col[data-col="cutting"]');const kb=await col.boundingBox();
await p.mouse.move(cb.x+40,cb.y+30);await p.mouse.down();
for(let i=1;i<=15;i++){await p.mouse.move(cb.x+40+(kb.x+60-cb.x-40)*i/15,cb.y+30+(kb.y+80-cb.y-30)*i/15);await p.waitForTimeout(15)}
await p.screenshot({path:__dirname+'/f1-mid.png'});
await p.mouse.up();await p.waitForTimeout(400);
await p.screenshot({path:__dirname+'/f2.png'});
console.log(JSON.stringify(await p.evaluate(()=>window.__W)));
console.log(await p.evaluate(id=>{const w=S.wos.find(x=>x.id===id);return w.stage+' issued='+w.materialIssued+' rank='+w.rank},id));
// reorder within planned: drag the 3rd planned card to the top
const ids=await p.$$eval('.col[data-col="planned"] .card',els=>els.map(e=>e.dataset.wo));
const c3=await (await p.$(`.card[data-wo="${ids[2]}"]`)).boundingBox();const c1=await (await p.$(`.card[data-wo="${ids[0]}"]`)).boundingBox();
await p.mouse.move(c3.x+40,c3.y+20);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(c3.x+40,c3.y+20+(c1.y+5-c3.y-20)*i/10);await p.waitForTimeout(15)}await p.mouse.up();await p.waitForTimeout(300);
const ids2=await p.$$eval('.col[data-col="planned"] .card',els=>els.map(e=>e.dataset.wo));
console.log("reorder ok",ids2[0]===ids[2]);await p.waitForTimeout(400);
// click still opens detail
await p.click(`.card[data-wo="${ids2[1]}"] .cl`);await p.waitForTimeout(300);console.log('modal open',await p.evaluate(()=>!!$("#modal").innerHTML));
await p.evaluate(()=>closeM());
await p.click('[data-act="capacity"]');await p.waitForTimeout(200);await p.screenshot({path:__dirname+'/f3-cap.png'});
await p.evaluate(()=>closeM());await p.click('[data-act="meeting"]');await p.waitForTimeout(300);await p.screenshot({path:__dirname+'/f4-meet.png'});
console.log('ERR',errs.join('\n'));await b.close()})();

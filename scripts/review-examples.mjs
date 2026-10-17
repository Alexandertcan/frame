import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const output=[];
for(const [id,url] of [['landing','https://www.landing.love/sites/byotone/'],['awwwards','https://www.awwwards.com/'],['godly','https://godly.website/'],['minimal','https://minimal.gallery/'],['apple','https://www.apple.com/os/ios/'],['portrait','https://www.pexels.com/photo/man-wearing-blue-crew-neck-t-shirt-2379004/']]){
const p=await browser.newPage({viewport:{width:1440,height:1000}});
try{const response=await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000});await p.waitForTimeout(1500);await p.screenshot({path:`evidence/references/${id}-top.png`});const text=(await p.locator('body').innerText()).slice(0,7500);const links=await p.locator('a[href]').evaluateAll(xs=>xs.map(a=>({text:a.innerText.trim().slice(0,80),href:a.href})).filter(a=>a.text||/byotone/.test(a.href)).slice(0,90));await p.mouse.wheel(0,800);await p.waitForTimeout(600);await p.screenshot({path:`evidence/references/${id}-scroll.png`});output.push({id,url:p.url(),status:response.status(),text,links});console.log(id,response.status(),p.url());}catch(e){output.push({id,url,error:e.message});console.log(id,e.message)}await p.close();}
await fs.writeFile('evidence/references/observations.json',JSON.stringify(output,null,2));await browser.close();

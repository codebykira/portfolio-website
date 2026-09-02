const puppeteer=require("puppeteer-core");const fs=require("fs");
const CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const jobs=[
  {label:"Product Manager, ChatGPT and Codex App Ecosystem", theme:"openai", out:"Kira-Cheung-PM-ChatGPT-Codex-OpenAI.pdf"},
  {label:"Product Manager, Netflix", theme:"netflix", out:"Kira-Cheung-Product-Manager-Netflix.pdf"},
];
(async()=>{
  const rows=await (await fetch(`${process.env.SB_URL}/rest/v1/resumes?select=composed&title=neq.__canvas__`,{headers:{apikey:process.env.SB_KEY,Authorization:`Bearer ${process.env.SB_KEY}`}})).json();
  const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:["--no-sandbox"]});
  for(const j of jobs){
    const doc=rows.find(r=>r.composed&&r.composed.label===j.label);
    const p=await b.newPage();
    await p.evaluateOnNewDocument(x=>{window.__RESUME_DATA__=x;},{resume:doc.composed.resume,variant:"product"});
    await p.goto(`http://localhost:3100/resume/print?theme=${j.theme}`,{waitUntil:"networkidle0",timeout:45000});
    await new Promise(r=>setTimeout(r,1500));
    const info=await p.evaluate(()=>({bodyLen:document.body.innerText.length, mark:(document.querySelector('.name-mark')||{}).getAttribute?document.querySelector('.name-mark').getAttribute('src'):'none', dataTheme:document.documentElement.getAttribute('data-theme')}));
    await p.evaluate("document.querySelectorAll('nextjs-portal,[data-nextjs-toast],[data-next-badge-root]').forEach(e=>e.remove())");
    await p.emulateMediaType("print");
    const pdf=await p.pdf({printBackground:true,preferCSSPageSize:true});
    fs.writeFileSync(process.env.HOME+"/Downloads/"+j.out,pdf);
    console.log(j.theme,"bytes",pdf.length,JSON.stringify(info));
    await p.close();
  }
  await b.close();console.log("DONE");
})().catch(e=>{console.error("FAIL:",e.message);process.exit(1);});

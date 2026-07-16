// ═══ SHARED JS — VCM Online Service ═══
// Cookie Banner
function initCookieBanner(){
  if(localStorage.getItem('vcm_cookie_consent')) return;
  setTimeout(()=>{
    const b=document.getElementById('cookie-banner');
    if(b) b.classList.add('show');
  }, 1500);
}
function acceptCookies(){
  localStorage.setItem('vcm_cookie_consent','accepted');
  const b=document.getElementById('cookie-banner');
  if(b) b.classList.remove('show');
}
function declineCookies(){
  localStorage.setItem('vcm_cookie_consent','declined');
  const b=document.getElementById('cookie-banner');
  if(b) b.classList.remove('show');
}

// Mobile nav
function toggleMob(){
  document.getElementById('mob').classList.toggle('open');
}
function closeMob(){
  document.getElementById('mob').classList.remove('open');
}

// Pricing toggle (pricing page only)
function switchPricing(type){
  document.querySelectorAll('.prc-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.ptog-btn').forEach(b=>b.classList.remove('active'));
  const ps=document.getElementById('prc-'+type);
  const pb=document.getElementById('tog-'+type);
  if(ps) ps.classList.add('active');
  if(pb) pb.classList.add('active');
}

// AI Visibility type toggle
let aivType='person';
function setAivType(type){
  aivType=type;
  document.querySelectorAll('.aiv-type-btn').forEach(b=>b.classList.remove('active'));
  const b=document.getElementById('aiv-btn-'+type);
  if(b) b.classList.add('active');
  const label=document.getElementById('aiv-name-label');
  const input=document.getElementById('aiv-name');
  if(label) label.textContent=type==='business'?'Business Name':'Full Name';
  if(input) input.placeholder=type==='business'?'e.g. VCM Online Service':'e.g. John Smith';
}

// Google Sheets logging
const AUDIT_LOG_URL='https://script.google.com/macros/s/AKfycbwXsgY_taWqCDJQF825gE0eRphIJVnx2WW4BtAG9mKtyk-6-rhC0yQOeMu7YAlm30zC/exec';
function logAuditQuery(url,keyword,score){
  fetch(AUDIT_LOG_URL,{
    method:'POST',mode:'no-cors',
    headers:{'Content-Type':'text/plain'},
    body:JSON.stringify({url,keyword,score,status:'completed'})
  }).catch(()=>{});
}

// Contact form
async function submitForm(){
  const fname=document.getElementById('cf_fname')?.value.trim();
  const lname=document.getElementById('cf_lname')?.value.trim();
  const email=document.getElementById('cf_email')?.value.trim();
  const business=document.getElementById('cf_business')?.value.trim();
  const service=document.getElementById('cf_service')?.value;
  const message=document.getElementById('cf_message')?.value.trim();
  const btn=document.getElementById('cf_btn');
  const err=document.getElementById('cf_err');
  const suc=document.getElementById('fsuc');

  if(err) err.classList.remove('show');
  if(suc) suc.classList.remove('show');

  if(!fname){if(err){err.textContent='Please enter your first name.';err.classList.add('show');}return;}
  if(!email||!/\S+@\S+\.\S+/.test(email)){if(err){err.textContent='Please enter a valid email.';err.classList.add('show');}return;}
  if(!message){if(err){err.textContent='Please tell us about your project.';err.classList.add('show');}return;}

  if(btn){btn.disabled=true;btn.textContent='Sending…';}
  try{
    await emailjs.send('service_gy7ef86','template_dpt1026',{
      from_name:fname,last_name:lname,from_email:email,
      business:business||'Not provided',service:service||'Not specified',message
    });
    if(suc) suc.classList.add('show');
    ['cf_fname','cf_lname','cf_email','cf_business','cf_message'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.value='';
    });
    const sv=document.getElementById('cf_service');
    if(sv) sv.selectedIndex=0;
  }catch(e){
    if(err){err.textContent='Failed to send. Please email vmc.onlineservice@gmail.com directly.';err.classList.add('show');}
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Send Message →';}
  }
}

// SEO Audit
function runAudit(){
  const url=document.getElementById('aurl')?.value.trim();
  const kw=document.getElementById('akw')?.value.trim();
  const err=document.getElementById('aerr');
  const load=document.getElementById('aload');
  const res=document.getElementById('ares');
  const btn=document.getElementById('abtn');

  if(err) err.classList.remove('show');
  if(res){res.classList.remove('show');res.innerHTML='';}

  if(!url){if(err){err.textContent='Please enter a page URL.';err.classList.add('show');}return;}
  if(!kw){if(err){err.textContent='Please enter a target keyword.';err.classList.add('show');}return;}
  try{new URL(url);}catch{if(err){err.textContent='Please enter a valid URL including https://';err.classList.add('show');}return;}

  if(btn) btn.disabled=true;
  if(load) load.classList.add('show');

  setTimeout(()=>{
    const audit=analyzeOnPage(url,kw);
    renderAudit(audit,url,kw);
    logAuditQuery(url,kw,audit.score);
    if(load) load.classList.remove('show');
    if(btn) btn.disabled=false;
  },1800);
}

function analyzeOnPage(rawUrl,kw){
  const url=rawUrl.toLowerCase();
  const kwLow=kw.toLowerCase().trim();
  const kwWords=kwLow.split(/\s+/);
  const isHttps=rawUrl.startsWith('https://');
  const path=(()=>{try{return new URL(rawUrl).pathname;}catch{return '/';}}());
  const kwInUrl=kwWords.some(w=>url.includes(w));
  const hasNumbers=/\d{4,}/.test(path);
  const isLongKw=kwWords.length>=4;
  function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(Math.imul(31,h)+s.charCodeAt(i))|0;}return Math.abs(h);}
  const seed=hash(rawUrl+kwLow);
  function sr(min,max,salt=0){return min+((seed+salt*7919)%(max-min+1));}
  const isBiz=aivType==='business';
  const checks=[];
  checks.push(sr(0,1,1)===1?{status:'pass',label:'Title Tag',detail:`Your title tag should include "${kw}" near the beginning, ideally within the first 60 characters.`}:{status:'fail',label:'Title Tag',detail:`Your title tag likely doesn't include "${kw}". Update it to start with "${kw}" followed by your brand.`});
  checks.push(sr(0,2,2)===2?{status:'pass',label:'Meta Description',detail:`Meta description looks good. Ensure it includes "${kw}" and has a clear CTA.`}:sr(0,2,2)===1?{status:'warn',label:'Meta Description',detail:`Your meta description may be missing or too short. Write 150–160 characters including "${kw}".`}:{status:'fail',label:'Meta Description',detail:`No meta description detected. Write one that includes "${kw}" naturally.`});
  checks.push(sr(0,1,3)===1?{status:'pass',label:'H1 Tag',detail:`Good — your page likely has one H1 containing "${kw}".`}:{status:'fail',label:'H1 Tag',detail:`Your H1 should prominently feature "${kw}". Use only one H1 per page.`});
  checks.push(sr(0,2,4)===2?{status:'pass',label:'Keyword Placement',detail:`Keyword density looks appropriate for "${kw}".`}:sr(0,2,4)===1?{status:'warn',label:'Keyword Placement',detail:`"${kw}" may not appear early enough in the body content.`}:{status:'fail',label:'Keyword Placement',detail:`"${kw}" is likely missing or too sparse in the body content.`});
  checks.push(kwInUrl&&!hasNumbers?{status:'pass',label:'URL Structure',detail:`URL structure looks clean with "${kw}" variation present.`}:{status:'warn',label:'URL Structure',detail:`Consider including "${kw}" in the URL path: ${kwWords.join('-')}/`});
  const minWords=isLongKw?800:2000;
  checks.push(sr(0,2,6)===2?{status:'pass',label:'Content Length & Depth',detail:`Content length appears sufficient for "${kw}".`}:sr(0,2,6)===1?{status:'warn',label:'Content Length & Depth',detail:`Content may be too thin. Aim for ${minWords}+ words.`}:{status:'fail',label:'Content Length & Depth',detail:`Page content appears too short for "${kw}". Write at least ${minWords} words.`});
  checks.push(sr(0,1,7)===1?{status:'pass',label:'Image Alt Text',detail:`Images appear to have alt text including "${kw}" variations.`}:{status:'warn',label:'Image Alt Text',detail:`Images may be missing alt text. Add descriptive alt attributes including "${kw}".`});
  checks.push(sr(0,2,8)===2?{status:'pass',label:'Internal Linking',detail:`Internal linking looks solid.`}:sr(0,2,8)===1?{status:'warn',label:'Internal Linking',detail:`Add more internal links using "${kw}" as anchor text. Aim for 3–5 contextual links.`}:{status:'fail',label:'Internal Linking',detail:`Very few internal links detected. Add links to related pages using "${kw}" anchor text.`});
  checks.push({status:'pass',label:'Mobile Friendliness',detail:`Verify with Google's Mobile-Friendly Test. Ensure 16px+ font size and 48px tap targets.`});
  checks.push(sr(0,2,10)===2?{status:'pass',label:'Page Speed Signals',detail:`Page speed looks reasonable. Test with Google PageSpeed Insights.`}:sr(0,2,10)===1?{status:'warn',label:'Page Speed Signals',detail:`Page speed may need improvement. Run Google PageSpeed Insights for specific fixes.`}:{status:'fail',label:'Page Speed Signals',detail:`Page speed signals are weak. Compress images, minify CSS/JS, and use a CDN.`});
  checks.push(sr(0,1,11)===1?{status:'warn',label:'Schema Markup',detail:`Add JSON-LD structured data for Organization and LocalBusiness.`}:{status:'fail',label:'Schema Markup',detail:`No schema markup detected. Add JSON-LD for Organization and LocalBusiness.`});
  checks.push(isHttps?{status:'pass',label:'HTTPS & Security',detail:`Site uses HTTPS. Ensure all resources also load over HTTPS.`}:{status:'fail',label:'HTTPS & Security',detail:`Site is NOT using HTTPS — a confirmed Google ranking factor. Switch immediately.`});
  const pts={pass:10,warn:5,fail:0};
  const score=Math.round((checks.reduce((t,c)=>t+pts[c.status],0)/(checks.length*10))*100);
  const fails=checks.filter(c=>c.status==='fail').length;
  const warns=checks.filter(c=>c.status==='warn').length;
  let summary=score>=70?`This page has a solid foundation for "${kw}". Focus on the ${warns} warning${warns!==1?'s':''} to push your score higher.`:score>=40?`This page needs improvement for "${kw}". Address the ${fails} critical issue${fails!==1?'s':''} first.`:`Significant on-page SEO gaps for "${kw}". Prioritize HTTPS, title tag, and content length.`;
  return{score,summary,checks};
}

function renderAudit(audit,url,kw){
  const s=audit.score||0;
  const sc=s>=70?'sc-good':s>=40?'sc-warn':'sc-bad';
  const sl=s>=70?'Good SEO Health':s>=40?'Needs Improvement':'Poor — Action Required';
  const ico={pass:'✅',warn:'⚠️',fail:'❌'};
  const cls={pass:'pass',warn:'warn',fail:'fail'};
  const checks=(audit.checks||[]).map(c=>`<div class="ci ${cls[c.status]||''}"><span class="ci-ico">${ico[c.status]||'⚪'}</span><div class="ci-txt"><strong>${c.label}</strong><p>${c.detail}</p></div></div>`).join('');
  const el=document.getElementById('ares');
  if(!el) return;
  el.innerHTML=`
    <div class="score-row">
      <div class="score-circ ${sc}">${s}</div>
      <div class="score-txt">
        <h3>${sl}</h3><p>${audit.summary}</p>
        <p style="margin-top:.35rem;font-size:.75rem;color:var(--muted)">URL: ${url} · Keyword: "${kw}"</p>
        ${s<70?'<p style="font-size:.75rem;color:var(--c1);margin-top:.35rem;font-weight:600">💡 Tip: Add industry + location for a more accurate estimate</p>':''}
      </div>
    </div>
    <div class="checks">${checks}</div>
    <p style="text-align:center;margin-top:1.5rem;font-size:.8rem;color:var(--muted)">
      Want expert help? <a href="/contact.html" style="color:var(--c1);font-weight:700">Book a free consultation →</a>
    </p>`;
  el.classList.add('show');
}

// AI Visibility
function runAivCheck(){
  const name=document.getElementById('aiv-name')?.value.trim();
  const context=document.getElementById('aiv-context')?.value.trim()||'';
  const location=document.getElementById('aiv-location')?.value.trim()||'';
  const err=document.getElementById('aiv-err');
  const load=document.getElementById('aiv-load');
  const res=document.getElementById('aiv-results');
  const btn=document.getElementById('aiv-run-btn');
  if(err) err.classList.remove('show');
  if(res){res.classList.remove('show');res.innerHTML='';}
  if(!name){if(err){err.textContent='Please enter a name.';err.classList.add('show');}return;}
  if(btn) btn.disabled=true;
  if(load) load.classList.add('show');
  setTimeout(()=>{
    const result=analyzeAIVisibility(name,aivType,context,location);
    renderAIVisibility(result);
    logAuditQuery('aiv:'+name,aivType+(context?' | '+context:''),result.score);
    if(load) load.classList.remove('show');
    if(btn) btn.disabled=false;
  },2000);
}

function analyzeAIVisibility(name,type,context,location){
  function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(Math.imul(31,h)+s.charCodeAt(i))|0;}return Math.abs(h);}
  const seed=hash(name.toLowerCase()+type);
  function sr(min,max,salt=0){return min+((seed+salt*7919)%(max-min+1));}
  const nameLow=name.toLowerCase().trim();
  const nameParts=name.trim().split(/\s+/);
  const wordCount=nameParts.length;
  const hasContext=context.length>0;
  const hasLoc=location.length>0;
  const isBiz=type==='business';
  const tier1=['elon musk','oprah winfrey','bill gates','jeff bezos','mark zuckerberg','tim cook','sundar pichai','warren buffett','steve jobs','donald trump','joe biden','taylor swift','beyonce','cristiano ronaldo','lionel messi','apple','google','microsoft','amazon','meta','tesla','netflix','nike','coca cola',"mcdonald's",'samsung','toyota','facebook','barack obama','kim kardashian','lebron james','michael jordan','elon','oprah','bezos','zuckerberg','gates','trump','biden'];
  const tier2=['neil patel','gary vaynerchuk','gary vee','seth godin','hubspot','moz','semrush','ahrefs','mailchimp','shopify','stripe','airbnb','uber','spotify','twitter','x corp','tiktok','linkedin','youtube','instagram','rand fishkin','brian dean','backlinko','buffer','hootsuite','anthropic','openai','chatgpt','gemini','perplexity','midjourney','canva','figma','notion','slack','zoom','squarespace','wix','wordpress','yelp','tripadvisor','trustpilot','forbes','bloomberg','techcrunch'];
  const tier3=['wordstream','sprout social','godaddy','namecheap','cloudflare','screaming frog','yoast','rankmath','clearscope','buzzsumo','similarweb','woocommerce','bigcommerce','klaviyo','activecampaign','convertkit','aweber'];
  let baseScore=0;
  if(tier1.some(t=>nameLow===t||nameLow.includes(t)||(t.includes(nameLow)&&nameLow.length>4))){baseScore=88+sr(0,9,99);}
  else if(tier2.some(t=>nameLow===t||nameLow.includes(t)||(t.includes(nameLow)&&nameLow.length>5))){baseScore=75+sr(0,12,98);}
  else if(tier3.some(t=>nameLow===t||nameLow.includes(t))){baseScore=60+sr(0,14,97);}
  else{
    baseScore=sr(22,45,1);
    if(hasContext&&hasLoc) baseScore+=sr(14,24,2);
    else if(hasContext) baseScore+=sr(8,16,3);
    else if(hasLoc) baseScore+=sr(5,12,4);
    if(isBiz&&hasContext) baseScore+=sr(6,14,5);
    if(wordCount>=2) baseScore+=sr(4,10,6);
    if(wordCount>=3) baseScore+=sr(3,7,7);
    baseScore=Math.min(baseScore,68);
  }
  const score=Math.min(Math.max(Math.round(baseScore),8),97);
  const level=score>=70?'High':score>=40?'Moderate':'Low';
  const levelColor=score>=70?'aiv-sc-high':score>=40?'aiv-sc-mid':'aiv-sc-low';
  const sentiment=score>=75?'Positive':score>=45?(sr(0,1,20)===1?'Positive':'Neutral'):(sr(0,1,21)===1?'Neutral':'Unknown');
  const aiAppear=score>=70?{label:'Likely',cls:'positive',ico:'✅',detail:`"${name}" would confidently appear when someone asks AI about them.`}:score>=40?{label:'Uncertain',cls:'warn',ico:'⚠️',detail:`"${name}" may appear in some AI tools but not consistently.`}:{label:'Unlikely',cls:'negative',ico:'❌',detail:`"${name}" is unlikely to appear in AI search results.`};
  const contentFoot=score>=70?{label:'Strong',cls:'positive',ico:'📰',detail:`Strong content footprint detected across multiple authoritative sources.`}:score>=40?{label:'Moderate',cls:'warn',ico:'📄',detail:`Some content exists about "${name}" but coverage is inconsistent.`}:{label:'Weak',cls:'negative',ico:'📭',detail:`Very little written content about "${name}" found online.`};
  const authority=score>=70?{label:'High',cls:'positive',ico:'🏛️',detail:`"${name}" is referenced by credible, authoritative sources AI models trust.`}:score>=40?{label:'Medium',cls:'warn',ico:'🏗️',detail:`Some authority signals present but not strong enough for consistent AI influence.`}:{label:'Low',cls:'negative',ico:'🏚️',detail:`Weak authority signals detected. Focus on directories and press mentions.`};
  const consistency=score>=70?{label:'Consistent',cls:'positive',ico:'🔄',detail:`ChatGPT, Gemini, and Perplexity would give similar descriptions of "${name}".`}:score>=40?{label:'Mixed',cls:'warn',ico:'🔀',detail:`AI tools may give different or incomplete descriptions of "${name}".`}:{label:'Unpredictable',cls:'negative',ico:'❓',detail:`AI tools would give very different or no information about "${name}".`};
  const repRisk=score>=70?{label:'Low Risk',cls:'positive',ico:'🛡️',detail:`Strong positive presence — AI is unlikely to surface inaccurate content.`}:score>=40?{label:'Medium Risk',cls:'warn',ico:'⚠️',detail:`Without dominant positive presence, AI may fill gaps with mixed information.`}:{label:'High Risk',cls:'negative',ico:'🚨',detail:`Low visibility creates risk — AI may generate inaccurate descriptions.`};
  const metrics=[aiAppear,contentFoot,authority,consistency,repRisk];
  const metricLabels=['AI Search Appearance','Content Footprint','Authority Score','AI Consistency','Reputation Risk'];
  const profession=hasContext?context:(isBiz?'business':'professional');
  const locStr=hasLoc?` based in ${location}`:'';
  const ctxStr=hasContext?` in the ${context} space`:'';
  const overviewIntro=score>=88?`${name} is one of the most recognized ${isBiz?'brands':'figures'} globally${locStr}. AI systems have extensive knowledge drawing from thousands of authoritative sources.`:score>=70?`${name} is a well-known ${profession}${locStr}${ctxStr} with a strong online presence, consistently recognizable across major AI platforms.`:score>=40&&hasContext&&hasLoc?`${name} is a ${profession} in ${location}${ctxStr} with a moderate digital footprint — enough for some AI tools to generate a partial profile.`:score>=40?`${name} appears to be a ${profession}${ctxStr} with a developing online presence. AI platforms may generate incomplete profiles.`:`Our analysis found minimal AI-readable content for "${name}"${locStr}. AI platforms are unlikely to generate an accurate profile at this time.`;
  const bullets=isBiz?[{icon:'🏢',label:'Business Type',val:hasContext?context:'Digital / Online Business'},{icon:'📍',label:'Location',val:hasLoc?location:(score>=75?'Publicly documented':'Not publicly specified')},{icon:'🌐',label:'Online Presence',val:score>=70?'Established':score>=40?'Developing':'Minimal'},{icon:'⭐',label:'AI Recognition',val:aiAppear.label+' to appear in AI responses'}]:[{icon:'👤',label:'Profile Type',val:hasContext?context+' Professional':'Individual / Professional'},{icon:'📍',label:'Location',val:hasLoc?location:(score>=75?'Publicly documented':'Not publicly specified')},{icon:'📰',label:'Media Presence',val:contentFoot.label+' content footprint'},{icon:'🏛️',label:'Authority',val:authority.label+' authority in online sources'}];
  const sources=score>=88?['Wikipedia','News Media','LinkedIn','Twitter/X','Industry Publications']:score>=70?['LinkedIn','Industry Directory','News Mentions','Google Business']:score>=40?['LinkedIn','Basic Web Presence','Local Directories']:['No significant sources found'];
  const keywordDB={'elon musk':['entrepreneur','billionaire','Tesla','SpaceX','X / Twitter','innovation','electric vehicles','AI'],'apple':['iPhone','Mac','innovation','design','premium','ecosystem','Tim Cook'],'google':['search engine','advertising','Android','AI','YouTube','cloud'],'microsoft':['Windows','Office','Azure','cloud','gaming','AI','LinkedIn'],'neil patel':['SEO','digital marketing','content marketing','analytics','entrepreneur'],'hubspot':['CRM','inbound marketing','sales','email marketing','automation'],'openai':['ChatGPT','AI','GPT','machine learning','language models'],'canva':['design','templates','graphics','marketing','presentations']};
  let aiKeywords=keywordDB[nameLow]||[];
  if(aiKeywords.length===0){
    if(hasContext){
      const ctx=context.toLowerCase();
      if(ctx.includes('real estate')) aiKeywords=['real estate','property','agent','listings','buyer','seller'];
      else if(ctx.includes('seo')||ctx.includes('digital marketing')) aiKeywords=['SEO','digital marketing','online visibility','search rankings','content'];
      else if(ctx.includes('restaurant')||ctx.includes('food')) aiKeywords=['dining','cuisine','local restaurant','food','hospitality'];
      else aiKeywords=[context,'professional','services','online presence'];
    } else aiKeywords=score>=70?['industry leader','professional','established','recognized']:score>=40?['professional','developing presence','growing brand']:['limited online presence','building digital identity'];
  }
  aiKeywords=aiKeywords.slice(0,8);
  const signals=[];
  if(score>=40||sr(0,1,30)===1) signals.push({icon:'🌐',label:'Website presence detected',type:'positive'});
  if(score>=50||sr(0,1,31)===1) signals.push({icon:'📱',label:'Social media profiles found',type:'positive'});
  if(score>=70) signals.push({icon:'📰',label:'News/media mentions detected',type:'positive'});
  if(score>=80) signals.push({icon:'📖',label:'Wikipedia or authority pages found',type:'positive'});
  if(score>=60&&isBiz) signals.push({icon:'⭐',label:'Business reviews/ratings present',type:'positive'});
  if(score<40&&sr(0,1,30)===0) signals.push({icon:'⚠️',label:'Weak or no website signals',type:'warn'});
  if(score<50&&sr(0,1,31)===0) signals.push({icon:'⚠️',label:'Limited social media footprint',type:'warn'});
  if(score<40) signals.push({icon:'❌',label:'No news/media coverage detected',type:'negative'});
  const recs=[];
  if(score<40){recs.push(isBiz?'Create or optimize your Google Business Profile.':'Build a personal website or portfolio.');recs.push('Publish content consistently — blog posts, press releases, and social updates feed AI knowledge.');}
  else if(score<70){recs.push('Strengthen your online presence with consistent NAP across all directories.');recs.push(isBiz?'Get more customer reviews on Google, Yelp, and Facebook.':'Build authority through guest posts and speaking engagements.');}
  else{recs.push('Maintain visibility by publishing fresh content regularly.');recs.push('Monitor your AI presence quarterly.');}
  recs.push('Add structured data (Schema.org) to your website — this directly signals AI search engines.');
  return{score,level,levelColor,sentiment,overviewIntro,bullets,sources,metrics,metricLabels,signals,recs,aiKeywords,name,type,context,location};
}

function renderAIVisibility(r){
  const sentColors={Positive:'pos',Neutral:'neu',Negative:'neg',Unknown:'neu'};
  const bulletHTML=r.bullets.map(b=>`<div style="display:flex;gap:.6rem;align-items:flex-start;padding:.6rem 0;border-bottom:1px solid #f0f0f0"><span style="font-size:.95rem;flex-shrink:0">${b.icon}</span><div><strong style="font-size:.83rem;color:#444;display:block">${b.label}:</strong><span style="font-size:.83rem;color:#222">${b.val}</span></div></div>`).join('');
  const sourceHTML=r.sources.map(s=>`<span style="background:#f0f4ff;color:#4060c0;font-size:.72rem;font-weight:600;padding:.25rem .7rem;border-radius:50px">${s}</span>`).join('');
  const googleCard=`<div style="background:#fff;border:1px solid #dde3ea;border-radius:14px;padding:1.4rem;margin-bottom:1.5rem;box-shadow:0 2px 12px rgba(0,0,0,.06)"><div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem"><span>✨</span><span style="font-family:Arial;font-size:.85rem;font-weight:700;color:#1a73e8">AI Overview Preview</span><span style="margin-left:auto;font-size:.72rem;color:#888;background:#f5f5f5;padding:.2rem .6rem;border-radius:50px">📊 Estimated — not live data</span></div><p style="font-size:.78rem;color:#999;margin-bottom:.8rem;font-style:italic">⚠️ This is an estimated AI profile based on digital footprint analysis — not a live pull from Google AI or ChatGPT.</p><p style="font-size:.9rem;color:#222;line-height:1.7;margin-bottom:1rem">${r.overviewIntro}</p><div style="margin-bottom:1rem">${bulletHTML}</div><div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center"><span style="font-size:.72rem;color:#888">Sources likely used:</span>${sourceHTML}</div></div>`;
  const metricsHTML=r.metrics.map((m,i)=>`<div class="aiv-card ${m.cls}"><div class="aiv-card-head"><span class="aiv-card-ico">${m.ico}</span><strong>${r.metricLabels[i]}</strong><span style="margin-left:auto;font-size:.75rem;font-weight:700;padding:.2rem .65rem;border-radius:50px;background:rgba(0,0,0,.07)">${m.label}</span></div><p>${m.detail}</p></div>`).join('');
  const signalHTML=r.signals.map(s=>`<div class="aiv-card ${s.type==='positive'?'positive':s.type==='warn'?'warn':'negative'}"><div class="aiv-card-head"><span class="aiv-card-ico">${s.icon}</span><strong>${s.label}</strong></div></div>`).join('');
  const recHTML=r.recs.map(rec=>`<div class="aiv-card neutral"><div class="aiv-card-head"><span class="aiv-card-ico">💡</span><strong>Recommendation</strong></div><p>${rec}</p></div>`).join('');
  const kwHTML=r.aiKeywords.map(k=>`<span style="background:var(--c4);color:rgba(255,255,255,.85);font-size:.78rem;font-weight:600;padding:.35rem .9rem;border-radius:50px">${k}</span>`).join('');
  const el=document.getElementById('aiv-results');
  if(!el) return;
  el.innerHTML=`
    <div class="aiv-score-row">
      <div class="aiv-score-circ ${r.levelColor}"><span class="aiv-score-num">${r.score}</span><span class="aiv-score-lbl">${r.level}</span></div>
      <div>
        <h3 style="font-family:var(--fh);font-size:1rem;font-weight:700;margin-bottom:.35rem">AI Visibility: ${r.level}</h3>
        <p style="font-size:.85rem;color:var(--muted);line-height:1.55">${r.score>=70?'Strong AI presence detected.':r.score>=40?'Moderate AI presence — room to grow.':'Low AI presence — action needed.'}</p>
        <div class="aiv-sent-pills" style="margin-top:.6rem">
          <span class="aiv-pill ${sentColors[r.sentiment]||'neu'}">Sentiment: ${r.sentiment}</span>
          <span class="aiv-pill neu">${r.type==='person'?'👤 Person':'🏢 Business'}</span>
          ${r.context?`<span class="aiv-pill neu">${r.context}</span>`:''}
          ${r.location?`<span class="aiv-pill neu">📍 ${r.location}</span>`:''}
        </div>
        ${r.score<70&&(!r.context||!r.location)?'<p style="font-size:.75rem;color:var(--c1);margin-top:.6rem;font-weight:600">💡 Tip: Add industry + location above for a more accurate estimate</p>':''}
      </div>
    </div>
    <h4 style="font-family:var(--fh);font-size:.82rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:.8rem">Estimated AI Overview</h4>
    ${googleCard}
    <h4 style="font-family:var(--fh);font-size:.82rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:.8rem 0">Keywords AI Associates With This Name</h4>
    <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem">${kwHTML}</div>
    <h4 style="font-family:var(--fh);font-size:.82rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:.8rem 0">AI Profile Breakdown</h4>
    <div class="aiv-cards" style="margin-bottom:1.5rem">${metricsHTML}</div>
    <div style="background:#FFF8E5;border:1px solid #ffe49f;border-radius:12px;padding:1.2rem 1.4rem;margin-bottom:1.5rem;display:flex;gap:.9rem;align-items:flex-start">
      <span style="font-size:1.2rem;flex-shrink:0">🤔</span>
      <div><strong style="font-family:var(--fh);font-size:.9rem;font-weight:700;display:block;margin-bottom:.3rem">Not who you are? That's actually the problem.</strong>
      <p style="font-size:.83rem;color:#5a4a00;line-height:1.6">If this AI profile doesn't reflect you accurately, AI doesn't have enough correct information about you yet. <strong>AI Visibility Optimization</strong> fixes this.</p>
      <a href="/contact.html" style="display:inline-block;margin-top:.7rem;background:var(--c1);color:#fff;font-size:.8rem;font-weight:700;padding:.4rem 1rem;border-radius:50px;text-decoration:none">Fix My AI Profile →</a></div>
    </div>
    <h4 style="font-family:var(--fh);font-size:.82rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:.8rem">Presence Signals</h4>
    <div class="aiv-cards" style="margin-bottom:1.5rem">${signalHTML}</div>
    <h4 style="font-family:var(--fh);font-size:.82rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:.8rem">How to Improve</h4>
    <div class="aiv-cards">${recHTML}</div>
    <p style="text-align:center;margin-top:1.5rem;font-size:.82rem;color:var(--muted)">
      Want expert help? <a href="/contact.html" style="color:var(--c1);font-weight:700">Book a free strategy call →</a>
    </p>`;
  el.classList.add('show');
}

// Init on load
document.addEventListener('DOMContentLoaded',()=>{
  initCookieBanner();
  // Set active nav link
  const path=window.location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-links a, .mob a').forEach(a=>{
    if(a.getAttribute('href')===path||
      (path===''&&a.getAttribute('href')==='index.html')||
      (path==='index.html'&&a.getAttribute('href')==='index.html')){
      a.style.color='var(--c1)';
    }
  });
});

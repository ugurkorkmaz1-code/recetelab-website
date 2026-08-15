const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'}});
const safeId=v=>typeof v==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(v);
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const clean=(v,n=160)=>String(v||'').trim().slice(0,n);
const inc=async(kv,k)=>{const n=Number(await kv.get(k)||0)+1;await kv.put(k,String(n));return n};
const add=async(kv,k,v)=>{const a=JSON.parse(await kv.get(k)||'[]');if(!a.includes(v)){a.push(v);await kv.put(k,JSON.stringify(a.slice(-500)))}};
const botUA=ua=>/bot|crawler|spider|slurp|bingpreview|headless|phantom|selenium|puppeteer|playwright|curl|wget|python-requests|go-http-client|facebookexternalhit|twitterbot|linkedinbot|discordbot|whatsapp|googleother|googlebot|bingbot|yandex|baiduspider|ahrefs|semrush|mj12bot|dotbot|bytespider|gptbot|chatgpt-user|claudebot|anthropic|perplexitybot/i.test(ua);
const sourceOf=r=>{try{const h=new URL(r).hostname.toLowerCase();if(/google\./.test(h))return'Google';if(/bing\./.test(h))return'Bing';if(/facebook|instagram/.test(h))return'Meta';if(/linkedin/.test(h))return'LinkedIn';if(/x\.com|twitter/.test(h))return'X / Twitter';return h||'Direct'}catch{return r?'Other':'Direct'}};
export async function onRequestPost({request,env}){
 if(!env.VISITOR_STATS)return json({error:'VISITOR_STATS KV binding is missing.'},500);
 let b;try{b=await request.json()}catch{return json({error:'Invalid request.'},400)}
 if(!safeId(b?.visitorId))return json({error:'Invalid visitor ID.'},400);
 const d=day(), ua=clean(request.headers.get('user-agent'),300), country=clean(request.cf?.country||request.headers.get('cf-ipcountry')||'XX',8).toUpperCase(), city=clean(request.cf?.city||'Bilinmiyor',80)||'Bilinmiyor';
 const vh=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(b.visitorId)), hash=[...new Uint8Array(vh)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const automated=botUA(ua)||b.webdriver===true, kind=automated?'bot':'human', event=b.event==='engaged'?'engaged':'visit';
 if(event==='engaged'){
   if(automated)return json({ok:true,ignored:true});
   const k=`engaged:${d}:${hash}`;if(!(await env.VISITOR_STATS.get(k))){await env.VISITOR_STATS.put(k,'1',{expirationTtl:3888000});await inc(env.VISITOR_STATS,'quality:engaged:total');await inc(env.VISITOR_STATS,`quality:engaged:country:${country}`);await inc(env.VISITOR_STATS,`quality:engaged:day:${d}`)}
   return json({ok:true,engaged:true});
 }
 const cityKey=encodeURIComponent(`${country}|${city}`), source=sourceOf(clean(b.referrer,500)), path=clean(b.path||'/',180);
 await Promise.all([add(env.VISITOR_STATS,'geo:countries:index',country),add(env.VISITOR_STATS,'geo:cities:index',cityKey),add(env.VISITOR_STATS,'quality:sources:index',source),add(env.VISITOR_STATS,'quality:paths:index',path)]);
 await inc(env.VISITOR_STATS,'total:visits');await inc(env.VISITOR_STATS,`day:${d}:visits`);await inc(env.VISITOR_STATS,`quality:${kind}:visits`);await inc(env.VISITOR_STATS,`quality:${kind}:country:${country}`);await inc(env.VISITOR_STATS,`quality:source:${source}`);await inc(env.VISITOR_STATS,`quality:path:${encodeURIComponent(path)}`);
 if(!(await env.VISITOR_STATS.get(`unique:all:${hash}`))){await env.VISITOR_STATS.put(`unique:all:${hash}`,'1');await inc(env.VISITOR_STATS,'total:unique')}
 if(!(await env.VISITOR_STATS.get(`unique:${d}:${hash}`))){await env.VISITOR_STATS.put(`unique:${d}:${hash}`,'1',{expirationTtl:3888000});await inc(env.VISITOR_STATS,`day:${d}:unique`)}
 await Promise.all([inc(env.VISITOR_STATS,`geo:country:${country}:visits`),inc(env.VISITOR_STATS,`geo:country:${country}:day:${d}:visits`),inc(env.VISITOR_STATS,`geo:city:${cityKey}:visits`),inc(env.VISITOR_STATS,`geo:city:${cityKey}:day:${d}:visits`)]);
 if(!(await env.VISITOR_STATS.get(`geo:country:${country}:unique:${hash}`))){await env.VISITOR_STATS.put(`geo:country:${country}:unique:${hash}`,'1');await inc(env.VISITOR_STATS,`geo:country:${country}:unique`)}
 if(!(await env.VISITOR_STATS.get(`geo:city:${cityKey}:unique:${hash}`))){await env.VISITOR_STATS.put(`geo:city:${cityKey}:unique:${hash}`,'1');await inc(env.VISITOR_STATS,`geo:city:${cityKey}:unique`)}
 return json({ok:true,classification:kind});
}

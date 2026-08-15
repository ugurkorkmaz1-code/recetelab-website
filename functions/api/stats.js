const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const num=async(kv,k)=>Number(await kv.get(k)||0);
export async function onRequestGet({request,env}){
 if(!env.VISITOR_STATS)return json({error:'VISITOR_STATS KV binding is missing.'},500);
 const key=new URL(request.url).searchParams.get('key')||request.headers.get('x-admin-key');if(!env.STATS_ADMIN_KEY||key!==env.STATS_ADMIN_KEY)return json({error:'Yetkisiz erişim.'},401);
 const d=day(), countriesIndex=JSON.parse(await env.VISITOR_STATS.get('geo:countries:index')||'[]'), citiesIndex=JSON.parse(await env.VISITOR_STATS.get('geo:cities:index')||'[]');
 const countries=(await Promise.all(countriesIndex.map(async country=>({country,visits:await num(env.VISITOR_STATS,`geo:country:${country}:visits`),unique:await num(env.VISITOR_STATS,`geo:country:${country}:unique`),todayVisits:await num(env.VISITOR_STATS,`geo:country:${country}:day:${d}:visits`),human:await num(env.VISITOR_STATS,`quality:human:country:${country}`),bot:await num(env.VISITOR_STATS,`quality:bot:country:${country}`),engaged:await num(env.VISITOR_STATS,`quality:engaged:country:${country}`)})))).sort((a,b)=>b.visits-a.visits).slice(0,50);
 const cities=(await Promise.all(citiesIndex.map(async encoded=>{const x=decodeURIComponent(encoded),p=x.indexOf('|'),country=p>=0?x.slice(0,p):'XX',city=p>=0?x.slice(p+1):x;return{country,city,visits:await num(env.VISITOR_STATS,`geo:city:${encoded}:visits`),unique:await num(env.VISITOR_STATS,`geo:city:${encoded}:unique`),todayVisits:await num(env.VISITOR_STATS,`geo:city:${encoded}:day:${d}:visits`)}}))).sort((a,b)=>b.visits-a.visits).slice(0,100);
 const sourcesIndex=JSON.parse(await env.VISITOR_STATS.get('quality:sources:index')||'[]'), pathsIndex=JSON.parse(await env.VISITOR_STATS.get('quality:paths:index')||'[]');
 const sources=(await Promise.all(sourcesIndex.map(async name=>({name,visits:await num(env.VISITOR_STATS,`quality:source:${name}`)})))).sort((a,b)=>b.visits-a.visits).slice(0,20);
 const paths=(await Promise.all(pathsIndex.map(async path=>({path,visits:await num(env.VISITOR_STATS,`quality:path:${encodeURIComponent(path)}`)})))).sort((a,b)=>b.visits-a.visits).slice(0,20);
 const [totalVisits,totalUnique,todayVisits,todayUnique,humanVisits,botVisits,engaged]=await Promise.all(['total:visits','total:unique',`day:${d}:visits`,`day:${d}:unique`,'quality:human:visits','quality:bot:visits','quality:engaged:total'].map(k=>num(env.VISITOR_STATS,k)));
 return json({date:d,totalVisits,totalUnique,todayVisits,todayUnique,humanVisits,botVisits,engaged,countries,cities,sources,paths,qualityTrackingSince:'2026-08-15'});
}

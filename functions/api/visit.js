const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*'
  }
});

const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(value);
const todayInTurkey = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

const cleanGeo = value => String(value || '').trim().slice(0, 80);
const countryCode = request => cleanGeo(request.cf?.country || request.headers.get('cf-ipcountry') || 'XX').toUpperCase();
const cityName = request => cleanGeo(request.cf?.city || 'Bilinmiyor') || 'Bilinmiyor';

async function increment(kv, key) {
  const current = Number(await kv.get(key) || 0);
  const next = current + 1;
  await kv.put(key, String(next));
  return next;
}

async function addToIndex(kv, key, value) {
  const current = JSON.parse(await kv.get(key) || '[]');
  if (!current.includes(value)) {
    current.push(value);
    await kv.put(key, JSON.stringify(current.slice(-500)));
  }
}

export async function onRequestPost({request, env}) {
  if (!env.VISITOR_STATS) return json({error: 'VISITOR_STATS KV binding is missing.'}, 500);

  let body;
  try { body = await request.json(); } catch { return json({error: 'Invalid request.'}, 400); }
  if (!safeId(body?.visitorId)) return json({error: 'Invalid visitor ID.'}, 400);

  const day = todayInTurkey();
  const visitorHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.visitorId));
  const hash = [...new Uint8Array(visitorHash)].map(b => b.toString(16).padStart(2, '0')).join('');
  const country = countryCode(request);
  const city = cityName(request);
  const cityKey = encodeURIComponent(`${country}|${city}`);

  const totalVisits = await increment(env.VISITOR_STATS, 'total:visits');
  const todayVisits = await increment(env.VISITOR_STATS, `day:${day}:visits`);

  let totalUnique = Number(await env.VISITOR_STATS.get('total:unique') || 0);
  if (!(await env.VISITOR_STATS.get(`unique:all:${hash}`))) {
    await env.VISITOR_STATS.put(`unique:all:${hash}`, '1');
    totalUnique = await increment(env.VISITOR_STATS, 'total:unique');
  }

  let todayUnique = Number(await env.VISITOR_STATS.get(`day:${day}:unique`) || 0);
  if (!(await env.VISITOR_STATS.get(`unique:${day}:${hash}`))) {
    await env.VISITOR_STATS.put(`unique:${day}:${hash}`, '1', {expirationTtl: 60 * 60 * 24 * 45});
    todayUnique = await increment(env.VISITOR_STATS, `day:${day}:unique`);
  }

  await addToIndex(env.VISITOR_STATS, 'geo:countries:index', country);
  await addToIndex(env.VISITOR_STATS, 'geo:cities:index', cityKey);
  await Promise.all([
    increment(env.VISITOR_STATS, `geo:country:${country}:visits`),
    increment(env.VISITOR_STATS, `geo:country:${country}:day:${day}:visits`),
    increment(env.VISITOR_STATS, `geo:city:${cityKey}:visits`),
    increment(env.VISITOR_STATS, `geo:city:${cityKey}:day:${day}:visits`)
  ]);

  if (!(await env.VISITOR_STATS.get(`geo:country:${country}:unique:${hash}`))) {
    await env.VISITOR_STATS.put(`geo:country:${country}:unique:${hash}`, '1');
    await increment(env.VISITOR_STATS, `geo:country:${country}:unique`);
  }
  if (!(await env.VISITOR_STATS.get(`geo:city:${cityKey}:unique:${hash}`))) {
    await env.VISITOR_STATS.put(`geo:city:${cityKey}:unique:${hash}`, '1');
    await increment(env.VISITOR_STATS, `geo:city:${cityKey}:unique`);
  }

  return json({ok: true, totalVisits, totalUnique, todayVisits, todayUnique});
}

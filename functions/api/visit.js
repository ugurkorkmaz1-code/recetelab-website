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

async function increment(kv, key) {
  const current = Number(await kv.get(key) || 0);
  const next = current + 1;
  await kv.put(key, String(next));
  return next;
}

export async function onRequestPost({request, env}) {
  if (!env.VISITOR_STATS) return json({error: 'VISITOR_STATS KV binding is missing.'}, 500);

  let body;
  try { body = await request.json(); } catch { return json({error: 'Invalid request.'}, 400); }
  if (!safeId(body?.visitorId)) return json({error: 'Invalid visitor ID.'}, 400);

  const day = todayInTurkey();
  const visitorHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.visitorId));
  const hash = [...new Uint8Array(visitorHash)].map(b => b.toString(16).padStart(2, '0')).join('');

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

  return json({ok: true, totalVisits, totalUnique, todayVisits, todayUnique});
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}
});
const todayInTurkey = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

async function getNumber(kv, key) { return Number(await kv.get(key) || 0); }

export async function onRequestGet({request, env}) {
  if (!env.VISITOR_STATS) return json({error: 'VISITOR_STATS KV binding is missing.'}, 500);
  const key = new URL(request.url).searchParams.get('key') || request.headers.get('x-admin-key');
  if (!env.STATS_ADMIN_KEY || key !== env.STATS_ADMIN_KEY) return json({error: 'Yetkisiz erişim.'}, 401);

  const day = todayInTurkey();
  const [totalVisits, totalUnique, todayVisits, todayUnique] = await Promise.all([
    env.VISITOR_STATS.get('total:visits'), env.VISITOR_STATS.get('total:unique'),
    env.VISITOR_STATS.get(`day:${day}:visits`), env.VISITOR_STATS.get(`day:${day}:unique`)
  ]);

  const countriesIndex = JSON.parse(await env.VISITOR_STATS.get('geo:countries:index') || '[]');
  const citiesIndex = JSON.parse(await env.VISITOR_STATS.get('geo:cities:index') || '[]');

  const countries = (await Promise.all(countriesIndex.map(async country => ({
    country,
    visits: await getNumber(env.VISITOR_STATS, `geo:country:${country}:visits`),
    unique: await getNumber(env.VISITOR_STATS, `geo:country:${country}:unique`),
    todayVisits: await getNumber(env.VISITOR_STATS, `geo:country:${country}:day:${day}:visits`)
  })))).sort((a,b) => b.visits - a.visits).slice(0, 50);

  const cities = (await Promise.all(citiesIndex.map(async encoded => {
    const decoded = decodeURIComponent(encoded);
    const split = decoded.indexOf('|');
    const country = split >= 0 ? decoded.slice(0, split) : 'XX';
    const city = split >= 0 ? decoded.slice(split + 1) : decoded;
    return {
      country, city,
      visits: await getNumber(env.VISITOR_STATS, `geo:city:${encoded}:visits`),
      unique: await getNumber(env.VISITOR_STATS, `geo:city:${encoded}:unique`),
      todayVisits: await getNumber(env.VISITOR_STATS, `geo:city:${encoded}:day:${day}:visits`)
    };
  }))).sort((a,b) => b.visits - a.visits).slice(0, 100);

  return json({
    date: day,
    totalVisits: Number(totalVisits || 0), totalUnique: Number(totalUnique || 0),
    todayVisits: Number(todayVisits || 0), todayUnique: Number(todayUnique || 0),
    countries, cities
  });
}

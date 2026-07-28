const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}
});
const todayInTurkey = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

export async function onRequestGet({request, env}) {
  if (!env.VISITOR_STATS) return json({error: 'VISITOR_STATS KV binding is missing.'}, 500);
  const key = new URL(request.url).searchParams.get('key') || request.headers.get('x-admin-key');
  if (!env.STATS_ADMIN_KEY || key !== env.STATS_ADMIN_KEY) return json({error: 'Yetkisiz erişim.'}, 401);

  const day = todayInTurkey();
  const [totalVisits, totalUnique, todayVisits, todayUnique] = await Promise.all([
    env.VISITOR_STATS.get('total:visits'), env.VISITOR_STATS.get('total:unique'),
    env.VISITOR_STATS.get(`day:${day}:visits`), env.VISITOR_STATS.get(`day:${day}:unique`)
  ]);
  return json({
    date: day,
    totalVisits: Number(totalVisits || 0), totalUnique: Number(totalUnique || 0),
    todayVisits: Number(todayVisits || 0), todayUnique: Number(todayUnique || 0)
  });
}

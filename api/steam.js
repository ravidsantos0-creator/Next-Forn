export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  const raw = req.query?.url;
  if (!raw || typeof raw !== 'string') {
    return res.status(400).json({ error: 'Parâmetro url obrigatório.' });
  }
  let target;
  try { target = new URL(raw); } catch { return res.status(400).json({ error: 'URL inválida.' }); }
  if (target.protocol !== 'https:' || target.hostname !== 'store.steampowered.com' || !target.pathname.startsWith('/api/')) {
    return res.status(400).json({ error: 'Somente endpoints oficiais da API Steam são permitidos.' });
  }
  try {
    const upstream = await fetch(target.toString(), {
      headers: { 'User-Agent': 'NextFornStore/1.0' }
    });
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(body);
  } catch (e) {
    return res.status(502).json({ error: 'Não foi possível consultar a Steam agora.' });
  }
}

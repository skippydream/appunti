/**
 * Cloudflare Worker (static assets + API di persistenza).
 *
 * - /api/state  -> GET restituisce l'ultimo stato salvato; PUT lo salva (KV "STATE")
 * - tutto il resto -> servito come file statico dalla directory del progetto (binding ASSETS)
 *
 * Richiede in wrangler.toml: [assets] binding = "ASSETS" e [[kv_namespaces]] binding = "STATE".
 */
const KEY = 'progress';
const MAX_BYTES = 3_000_000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

async function handleState(request, env) {
  const kv = env.STATE;
  if (!kv) return json({ error: 'KV namespace "STATE" non configurato' }, 501);

  if (request.method === 'GET') {
    const stored = await kv.get(KEY);
    return new Response(stored || 'null', {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  if (request.method === 'PUT' || request.method === 'POST') {
    const body = await request.text();
    if (body.length > MAX_BYTES) return json({ error: 'payload troppo grande' }, 413);
    try { JSON.parse(body); } catch { return json({ error: 'JSON non valido' }, 400); }
    await kv.put(KEY, body);
    return json({ ok: true });
  }

  return json({ error: 'metodo non consentito' }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/state') {
      return handleState(request, env);
    }
    // Tutto il resto: file statici del sito
    return env.ASSETS.fetch(request);
  },
};

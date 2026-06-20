/**
 * Cloudflare Pages Function — persistenza del progresso di studio.
 *
 * Endpoint:  /api/state
 *   GET  -> restituisce l'ultimo stato salvato ({ updatedAt, data }) o null
 *   PUT  -> salva il body JSON ({ updatedAt, data })
 *
 * Richiede un binding KV chiamato STATE configurato nel progetto Pages
 * (Settings -> Functions -> KV namespace bindings -> Variable name: STATE).
 *
 * Nota sicurezza: l'endpoint è aperto (sito personale). Per proteggerlo si può
 * aggiungere Cloudflare Access davanti al progetto Pages, oppure impostare la
 * variabile d'ambiente SYNC_TOKEN e inviare l'header "x-sync-token".
 */
const KEY = 'progress';
const MAX_BYTES = 3_000_000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.STATE;

  if (!kv) {
    return json({ error: 'KV namespace "STATE" non configurato nel progetto Pages.' }, 501);
  }

  // Token opzionale: attivo solo se la variabile d'ambiente SYNC_TOKEN è impostata.
  if (env.SYNC_TOKEN && request.method !== 'GET') {
    if (request.headers.get('x-sync-token') !== env.SYNC_TOKEN) {
      return json({ error: 'non autorizzato' }, 401);
    }
  }

  if (request.method === 'GET') {
    const stored = await kv.get(KEY);
    return new Response(stored || 'null', {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  if (request.method === 'PUT' || request.method === 'POST') {
    const body = await request.text();
    if (body.length > MAX_BYTES) return json({ error: 'payload troppo grande' }, 413);
    try {
      JSON.parse(body); // valida
    } catch {
      return json({ error: 'JSON non valido' }, 400);
    }
    await kv.put(KEY, body);
    return json({ ok: true });
  }

  return json({ error: 'metodo non consentito' }, 405);
}

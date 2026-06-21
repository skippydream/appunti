/* ============================================================================
   Persistenza automatica del progresso sul server (Cloudflare Pages + KV).

   Principi (robustezza):
   - Ogni scrittura del progresso marca lo stato come "da inviare" (dirty):
     NESSUNA modifica viene persa, nemmeno se fatta prima che il primo pull
     sia finito (in quel caso viene inviata appena il sync è pronto).
   - Invio con debounce breve; in caso di errore si ritenta.
   - Alla chiusura/cambio scheda si fa un invio "best-effort" con sendBeacon,
     così le modifiche fatte all'ultimo momento non si perdono.
   - Se il KV non è configurato (501) si resta in "Solo locale".
   ========================================================================== */
(function () {
  'use strict';

  const API = '/api/state';
  const META = '__sync_meta_v1';
  const DEBOUNCE_MS = 800;
  const READY_FALLBACK_MS = 6000;   // se il primo pull è lentissimo, sblocca gli invii

  // Chiavi del SINGOLO dispositivo: NON vanno sincronizzate su KV.
  const DEVICE_LOCAL = new Set([META, 'typo_prefs_v1', 'typo_prefs_v2', 'theme']);

  let ready = false;          // true dopo il primo pull (o dopo il fallback)
  let serverEnabled = true;   // false se il KV non è configurato (501)
  let dirty = false;          // ci sono modifiche locali non ancora confermate dal server
  let pushing = false;        // un invio è in corso
  let pushTimer = null;
  let localMeta = +(localStorage.getItem(META) || 0);

  const origSet = localStorage.setItem.bind(localStorage);

  function setStatus(state) {
    const wrap = document.getElementById('syncStatus');
    if (!wrap) return;
    const lbl = document.getElementById('syncLabel');
    const map = {
      syncing: ['Sincronizzo…', 's-sync'],
      ok:      ['Sincronizzato', 's-ok'],
      saving:  ['Salvataggio…', 's-saving'],
      offline: ['Offline', 's-off'],
      local:   ['Solo locale', 's-off'],
    };
    const [text, cls] = map[state] || map.ok;
    if (lbl) lbl.textContent = text;
    wrap.className = 'sync-status ' + cls;
  }

  function snapshot() {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (DEVICE_LOCAL.has(k)) continue;
      o[k] = localStorage.getItem(k);
    }
    return o;
  }

  function applySnapshot(data) {
    Object.keys(data).forEach((k) => { if (!DEVICE_LOCAL.has(k)) origSet(k, data[k]); });
  }

  // Diventa "pronto": da qui in poi gli invii partono. Se nel frattempo c'erano
  // modifiche in coda (dirty), le manda subito.
  function markReady() {
    if (ready) return;
    ready = true;
    if (dirty && serverEnabled) schedulePush();
  }

  async function pull() {
    setStatus('syncing');
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (r.status === 501) { serverEnabled = false; markReady(); setStatus('local'); return; }
      if (!r.ok) { markReady(); setStatus('offline'); return; }
      const j = await r.json();
      // Il server è più recente: applica e ricarica — ma SOLO se non abbiamo
      // modifiche locali non ancora inviate (altrimenti le perderemmo).
      if (j && j.updatedAt && j.data && j.updatedAt > localMeta && !dirty) {
        applySnapshot(j.data);
        origSet(META, String(j.updatedAt));
        localMeta = j.updatedAt;
        try { document.documentElement.classList.add('booting'); } catch (e) {}
        location.reload();
        return;
      }
      markReady();
      // Se i dati locali differiscono da quelli sul server (server vuoto, server
      // indietro, o modifiche fatte offline non ancora inviate), caricali subito.
      // Così i progressi già presenti in questo browser arrivano sul server senza
      // dover fare per forza una nuova modifica.
      const localData = JSON.stringify(snapshot());
      const serverData = (j && j.data) ? JSON.stringify(j.data) : null;
      if (serverEnabled && localData !== '{}' && localData !== serverData) {
        setStatus('saving');
        schedulePush();
      } else {
        setStatus(dirty ? 'saving' : 'ok');
        if (dirty) schedulePush();
      }
    } catch (e) {
      markReady();
      setStatus('offline');
    }
  }

  async function push() {
    if (!serverEnabled || pushing) return;
    pushing = true;
    // Catturiamo lo stato ORA: se arrivano altre modifiche durante l'invio,
    // dirty tornerà true e ri-schiediamo un invio alla fine.
    dirty = false;
    const updatedAt = Date.now();
    const payload = JSON.stringify({ updatedAt, data: snapshot() });
    setStatus('saving');
    try {
      const r = await fetch(API, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: payload,
      });
      if (r.ok) {
        origSet(META, String(updatedAt));
        localMeta = updatedAt;
        setStatus(dirty ? 'saving' : 'ok');
      } else {
        dirty = true;            // non confermato: riprova
        setStatus('offline');
      }
    } catch (e) {
      dirty = true;
      setStatus('offline');
    } finally {
      pushing = false;
      if (dirty && ready && serverEnabled) schedulePush();
    }
  }

  function schedulePush() {
    dirty = true;
    if (!serverEnabled || !ready) return;   // se non pronto, verrà inviato da markReady
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, DEBOUNCE_MS);
  }

  // Invio "best-effort" alla chiusura/uscita: sendBeacon sopravvive all'unload.
  function flushBeacon() {
    if (!serverEnabled || !dirty || !navigator.sendBeacon) return;
    const updatedAt = Date.now();
    const payload = JSON.stringify({ updatedAt, data: snapshot() });
    try {
      const ok = navigator.sendBeacon(API, new Blob([payload], { type: 'application/json' }));
      if (ok) { origSet(META, String(updatedAt)); localMeta = updatedAt; dirty = false; }
    } catch (e) {}
  }

  // Intercetta ogni scrittura del progresso: la marca da inviare.
  localStorage.setItem = function (k, v) {
    origSet(k, v);
    if (!DEVICE_LOCAL.has(k)) schedulePush();
  };

  // Flush quando la pagina diventa nascosta o viene chiusa (mobile compreso).
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushBeacon();
  });
  window.addEventListener('pagehide', flushBeacon);

  // Avvio: scarica lo stato. Fallback di sicurezza per non bloccare gli invii
  // se la rete è lentissima.
  window.addEventListener('load', pull);
  setTimeout(markReady, READY_FALLBACK_MS);
})();

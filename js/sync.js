/* ============================================================================
   Persistenza automatica del progresso sul server (Cloudflare Pages + KV).
   - All'apertura scarica lo stato dal server; se è più recente del locale lo
     applica e ricarica la pagina.
   - Ad ogni modifica del progresso (qualsiasi scrittura su localStorage) invia
     in automatico lo stato al server, con debounce.
   - Se il server non è raggiungibile o il KV non è configurato, l'app continua
     a funzionare solo in locale ("Solo locale").
   ========================================================================== */
(function () {
  'use strict';

  const API = '/api/state';
  const META = '__sync_meta_v1';

  // Chiavi legate al SINGOLO dispositivo: NON vanno sincronizzate.
  // La tipografia (font/larghezza) dipende dalla dimensione del display: se la
  // si sincronizza, il telefono erediterebbe i valori del desktop e sforerebbe.
  const DEVICE_LOCAL = new Set([META, 'typo_prefs_v1', 'typo_prefs_v2']);

  let ready = false;          // true dopo il primo pull: evita push prematuri (race)
  let serverEnabled = true;   // false se il KV non è configurato (501)
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

  async function pull() {
    setStatus('syncing');
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (r.status === 501) { serverEnabled = false; ready = true; setStatus('local'); return; }
      if (!r.ok) { ready = true; setStatus('offline'); return; }
      const j = await r.json();
      if (j && j.updatedAt && j.data && j.updatedAt > localMeta) {
        applySnapshot(j.data);
        origSet(META, String(j.updatedAt));
        location.reload();   // riparte con i dati sincronizzati
        return;
      }
      ready = true;
      setStatus('ok');
    } catch (e) {
      ready = true;
      setStatus('offline');
    }
  }

  async function push() {
    if (!serverEnabled) return;
    const updatedAt = Date.now();
    const payload = JSON.stringify({ updatedAt, data: snapshot() });
    origSet(META, String(updatedAt));
    localMeta = updatedAt;
    setStatus('saving');
    try {
      const r = await fetch(API, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: payload,
      });
      setStatus(r.ok ? 'ok' : 'offline');
    } catch (e) {
      setStatus('offline');
    }
  }

  function schedulePush() {
    if (!ready || !serverEnabled) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 1200);
  }

  // Intercetta ogni scrittura del progresso per sincronizzare in automatico.
  localStorage.setItem = function (k, v) {
    origSet(k, v);
    if (!DEVICE_LOCAL.has(k)) schedulePush();
  };

  // Se l'utente lascia la pagina con modifiche in coda, prova a salvare subito.
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pushTimer) {
      clearTimeout(pushTimer);
      push();
    }
  });

  window.addEventListener('load', pull);
})();

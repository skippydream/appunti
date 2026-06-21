/* ============================================================================
   Salvataggio automatico del progresso sul server (Cloudflare Pages + KV).

   Economia delle scritture (free tier KV ~1.000 write/giorno):
   - Throttling: al massimo 1 invio ogni MIN_GAP_MS; una modifica isolata parte
     dopo un breve LEAD_MS (reattivo) ma le raffiche si accorpano.
   - Le chiavi "passive" (es. ultima card / posizione di scroll) NON fanno
     partire un invio: restano in locale e viaggiano in coda al prossimo invio
     vero o all'uscita (sendBeacon). Scrollare quindi non costa scritture.
   - Niente perdita di dati: ritento su errore; flush all'uscita.

   Indicatori:
   - CHIP in header (#syncStatus): stato STABILE — Sincronizzato/Solo locale/Offline.
   - FAB (#saveFab): flottante "always on top", compare SOLO durante un salvataggio.
   ========================================================================== */
(function () {
  'use strict';

  const API = '/api/state';
  const META = '__sync_meta_v1';
  const LEAD_MS = 1500;             // ritardo di un salvataggio "fresco"
  const MIN_GAP_MS = 12000;         // distanza minima tra due scritture su KV
  const READY_FALLBACK_MS = 6000;

  // Non sincronizzate su KV (preferenze del dispositivo).
  const DEVICE_LOCAL = new Set([META, 'typo_prefs_v1', 'typo_prefs_v2', 'theme']);
  // Sincronizzate ma SENZA far partire un invio dedicato (viaggiano in coda).
  const PASSIVE = new Set(['last_active_card_v1']);

  let ready = false;
  let serverEnabled = true;
  let dirty = false;          // modifiche di progresso da inviare (prioritarie)
  let softDirty = false;      // solo chiavi passive cambiate (bassa priorità)
  let pushing = false;
  let pushTimer = null;
  let lastPush = 0;
  let localMeta = +(localStorage.getItem(META) || 0);

  const origSet = localStorage.setItem.bind(localStorage);

  // ── CHIP (stato stabile) ─────────────────────────────────────────────
  function setChip(state) {
    const wrap = document.getElementById('syncStatus');
    if (!wrap) return;
    const lbl = document.getElementById('syncLabel');
    const map = {
      syncing: ['Sincronizzo…', 's-sync'],
      ok:      ['Sincronizzato', 's-ok'],
      offline: ['Offline (salvato qui)', 's-off'],
      local:   ['Solo locale', 's-off'],
    };
    const [text, cls] = map[state] || map.ok;
    if (lbl) lbl.textContent = text;
    wrap.className = 'sync-status ' + cls;
  }

  // ── FAB (attività transitoria, always-on-top) ────────────────────────
  let fabHideTimer = null;
  function fab(mode, text) {
    const el = document.getElementById('saveFab');
    if (!el) return;
    clearTimeout(fabHideTimer);
    if (mode === 'hidden') { el.classList.remove('is-visible'); return; }
    const txt = el.querySelector('.save-fab-text');
    if (txt) txt.textContent = text || '';
    el.classList.toggle('is-saved', mode === 'saved');
    el.classList.toggle('is-error', mode === 'error');
    el.classList.add('is-visible');
    if (mode === 'saved' || mode === 'error') {
      fabHideTimer = setTimeout(() => el.classList.remove('is-visible'), 1600);
    }
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

  function markReady() {
    if (ready) return;
    ready = true;
    if (dirty && serverEnabled) schedulePush();
  }

  async function pull() {
    setChip('syncing');
    fab('saving', 'Sincronizzo…');
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (r.status === 501) { serverEnabled = false; markReady(); setChip('local'); fab('hidden'); return; }
      if (!r.ok) { markReady(); setChip('offline'); fab('hidden'); return; }
      const j = await r.json();
      if (j && j.updatedAt && j.data && j.updatedAt > localMeta && !dirty) {
        applySnapshot(j.data);
        origSet(META, String(j.updatedAt));
        localMeta = j.updatedAt;
        try { document.documentElement.classList.add('booting'); } catch (e) {}
        location.reload();
        return;
      }
      markReady();
      // Carica i dati locali se differiscono dal server (server vuoto/indietro,
      // o modifiche offline): il progresso già presente qui arriva sul server.
      const localData = JSON.stringify(snapshot());
      const serverData = (j && j.data) ? JSON.stringify(j.data) : null;
      if (serverEnabled && localData !== '{}' && localData !== serverData) {
        schedulePush();
      } else {
        setChip('ok');
        fab('hidden');
      }
    } catch (e) {
      markReady();
      setChip('offline');
      fab('hidden');
    }
  }

  async function push() {
    if (!serverEnabled || pushing) return;
    pushing = true;
    lastPush = Date.now();
    dirty = false; softDirty = false;     // catturiamo lo stato ORA
    const updatedAt = lastPush;
    const payload = JSON.stringify({ updatedAt, data: snapshot() });
    fab('saving', 'Salvataggio automatico…');
    try {
      const r = await fetch(API, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: payload,
      });
      if (r.ok) {
        origSet(META, String(updatedAt));
        localMeta = updatedAt;
        setChip('ok');
        if (!dirty) fab('saved', 'Salvato ✓');
      } else {
        dirty = true;
        setChip('offline');
        fab('error', 'Salvataggio non riuscito');
      }
    } catch (e) {
      dirty = true;
      setChip('offline');
      fab('error', 'Offline — riprovo');
    } finally {
      pushing = false;
      if (dirty && ready && serverEnabled) schedulePush();
    }
  }

  // Programma un invio rispettando la distanza minima tra le scritture.
  function schedulePush() {
    dirty = true;
    if (!serverEnabled || !ready || pushTimer || pushing) return;
    const since = Date.now() - lastPush;
    const wait = since >= MIN_GAP_MS ? LEAD_MS : (MIN_GAP_MS - since);
    pushTimer = setTimeout(() => { pushTimer = null; push(); }, wait);
  }

  function flushBeacon() {
    if (!serverEnabled || (!dirty && !softDirty) || !navigator.sendBeacon) return;
    const updatedAt = Date.now();
    const payload = JSON.stringify({ updatedAt, data: snapshot() });
    try {
      const ok = navigator.sendBeacon(API, new Blob([payload], { type: 'application/json' }));
      if (ok) { origSet(META, String(updatedAt)); localMeta = updatedAt; dirty = false; softDirty = false; }
    } catch (e) {}
  }

  // Intercetta ogni scrittura: progresso -> invio (throttled); passive -> in coda.
  localStorage.setItem = function (k, v) {
    origSet(k, v);
    if (DEVICE_LOCAL.has(k)) return;
    if (PASSIVE.has(k)) { softDirty = true; return; }   // niente scrittura dedicata
    schedulePush();
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushBeacon();
  });
  window.addEventListener('pagehide', flushBeacon);

  window.addEventListener('load', pull);
  setTimeout(markReady, READY_FALLBACK_MS);
})();

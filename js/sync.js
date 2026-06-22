/* ============================================================================
   Sincronizzazione MANUALE col server (Cloudflare Pages + KV).

   - All'apertura: carica lo stato salvato su KV e lo applica (load()).
   - Salvataggio: SOLO manuale, tramite il FAB "Salva" (saveNow()). Nessun
     salvataggio automatico, nessun debounce, nessun beacon.
   - Quando ci sono modifiche non ancora salvate, il FAB lo segnala e si avvisa
     prima di chiudere la pagina.
   ========================================================================== */
(function () {
  'use strict';

  const API = '/api/state';
  const LAST_CARD = 'last_active_card_v1';
  // Chiavi locali al dispositivo: non salvate su KV.
  const DEVICE_LOCAL = new Set(['theme', 'typo_prefs_v1', 'typo_prefs_v2', '__sync_meta_v1']);
  function isDeviceLocal(k) { return DEVICE_LOCAL.has(k) || k.indexOf('bookmark_') === 0; }

  const origSet = localStorage.setItem.bind(localStorage);

  let unsaved = false;
  let saving = false;
  let serverOk = true;     // false se il KV non è configurato (501)

  function snapshot() {
    const o = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (isDeviceLocal(k)) continue;
      o[k] = localStorage.getItem(k);
    }
    return o;
  }

  function applySnapshot(data) {
    let changed = false;
    Object.keys(data).forEach((k) => {
      if (isDeviceLocal(k)) return;
      if (localStorage.getItem(k) !== data[k]) { origSet(k, data[k]); changed = true; }
    });
    return changed;
  }

  // ── FAB ───────────────────────────────────────────────────────────
  function fab(state) {
    const el = document.getElementById('saveFab');
    if (!el) return;
    el.classList.remove('is-saving', 'is-saved', 'is-error', 'is-unsaved', 'is-local');
    const labels = {
      idle:    'Salva',
      unsaved: 'Salva',
      saving:  'Salvataggio…',
      saved:   'Salvato',
      error:   'Riprova',
      local:   'Solo locale',
    };
    const txt = el.querySelector('.save-fab-text');
    if (txt) txt.textContent = labels[state] || 'Salva';
    if (state !== 'idle') el.classList.add('is-' + state);
    el.disabled = (state === 'saving' || state === 'local');
    el.title = state === 'local'
      ? 'Server non configurato: i progressi restano in questo browser.'
      : (state === 'unsaved' ? 'Hai modifiche non salvate. Clicca per salvare su cloud.'
                             : 'Salva i progressi su cloud');
  }

  // ── Caricamento all'apertura ──────────────────────────────────────
  // NB: solo lettura (GET). Non è un salvataggio e NON deve mostrare lo stato
  // "Salvataggio…" sul FAB (il salvataggio è solo manuale).
  async function load() {
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (r.status === 501) { serverOk = false; fab('local'); return; }
      if (!r.ok) { fab('idle'); return; }
      const j = await r.json();
      // Applica lo stato del server; se cambia qualcosa, ricarica così la UI
      // riflette i dati caricati.
      if (j && j.data && applySnapshot(j.data)) {
        try { document.documentElement.classList.add('booting'); } catch (e) {}
        location.reload();
        return;
      }
      fab('idle');
    } catch (e) {
      fab('idle');
    }
  }

  // ── Salvataggio MANUALE ───────────────────────────────────────────
  async function saveNow() {
    if (saving || !serverOk) return;
    saving = true;
    // Salva anche "la card attuale" (posizione corrente).
    if (typeof window.captureCurrentCard === 'function') {
      try { window.captureCurrentCard(); } catch (e) {}
    }
    fab('saving');
    const payload = JSON.stringify({ updatedAt: Date.now(), data: snapshot() });
    try {
      const r = await fetch(API, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: payload,
      });
      if (r.ok) {
        unsaved = false;
        fab('saved');
        setTimeout(() => { if (!unsaved && !saving) fab('idle'); }, 2000);
      } else {
        fab('error');
      }
    } catch (e) {
      fab('error');
    } finally {
      saving = false;
    }
  }
  window.saveProgressNow = saveNow;

  // ── Segnala "modifiche non salvate" (NESSUN salvataggio automatico) ──
  localStorage.setItem = function (k, v) {
    origSet(k, v);
    if (isDeviceLocal(k) || k === LAST_CARD) return;   // last card: gestita al salvataggio
    if (!saving) { unsaved = true; fab('unsaved'); }
  };

  // Avvisa se si chiude con modifiche non salvate.
  window.addEventListener('beforeunload', function (e) {
    if (unsaved) { e.preventDefault(); e.returnValue = ''; return ''; }
  });

  function wire() {
    const el = document.getElementById('saveFab');
    if (el) el.addEventListener('click', saveNow);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();

  window.addEventListener('load', load);
})();

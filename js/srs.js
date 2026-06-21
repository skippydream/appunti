/* ============================================================================
   Ripetizione spaziata (SM-2) — modulo autonomo.

   Integrazione col tracker esistente (universale su tutte le schede):
   - marcare una scheda con uno stato diverso da "todo" la inserisce nel ripasso
     (prima scadenza = oggi); marcarla "todo" la toglie.
   - all'avvio importa le schede già studiate (stato review/progress/done) così
     il ripasso parte dal progresso esistente.
   - durante il ripasso, l'esito aggiorna anche lo stato del tracker:
     sbagliata -> "da ripassare"; superata e consolidata -> "imparato".

   Dati in localStorage 'srs_v1' (sincronizzato: NON è una chiave device-local):
     { [cardId]: { ef, iv, reps, lapses, due:'YYYY-MM-DD', created, last } }
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'srs_v1';
  const SESSION_MAX = 40;     // schede per sessione (le altre restano in coda)

  // ── Date a granularità giornaliera ───────────────────────────────────
  function iso(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function todayStr() { const d = new Date(); d.setHours(0, 0, 0, 0); return iso(d); }
  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d);
  }
  function humanizeDays(n) {
    if (n < 1) return '<1g';
    if (n < 30) return n + 'g';
    if (n < 365) return Math.round(n / 30) + 'mes';
    return (Math.round(n / 36.5) / 10) + 'an';
  }
  function formatDateIt(dateStr) {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT',
        { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return dateStr; }
  }

  // ── Storage ──────────────────────────────────────────────────────────
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(srs)); } catch (e) {} }
  let srs = load();

  // ── Algoritmo SM-2 ───────────────────────────────────────────────────
  // quality: 2=Di nuovo, 3=Difficile, 4=Bene, 5=Facile
  function applySm2(entry, quality) {
    if (quality < 3) {
      entry.reps = 0;
      entry.iv = 1;
      entry.lapses = (entry.lapses || 0) + 1;
    } else {
      if (entry.reps === 0) entry.iv = 1;
      else if (entry.reps === 1) entry.iv = 6;
      else entry.iv = Math.max(1, Math.round(entry.iv * entry.ef));
      if (quality === 3) entry.iv = Math.max(1, Math.round(entry.iv * 0.7)); // "Difficile" accorcia
      entry.reps += 1;
    }
    const ef = entry.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    entry.ef = Math.max(1.3, Math.round(ef * 100) / 100);
    entry.due = addDays(todayStr(), entry.iv);
    entry.last = todayStr();
    return entry;
  }
  function newEntry() {
    return { ef: 2.5, iv: 0, reps: 0, lapses: 0, due: todayStr(), created: todayStr() };
  }
  function previewIv(entry, quality) {
    const clone = JSON.parse(JSON.stringify(entry || newEntry()));
    applySm2(clone, quality);
    return clone.iv;
  }

  // ── Pool ─────────────────────────────────────────────────────────────
  function ensureScheduled(id) {
    if (!srs[id]) { srs[id] = newEntry(); save(); updateBadge(); }
  }
  function removeCard(id) {
    if (srs[id]) { delete srs[id]; save(); updateBadge(); }
  }
  function dueIds() {
    const t = todayStr();
    return Object.keys(srs).filter(id => !srs[id].due || srs[id].due <= t);
  }
  function nextDueDate() {
    const dates = Object.keys(srs).map(id => srs[id].due).filter(Boolean).sort();
    return dates.length ? dates[0] : null;
  }

  // ── Schede dal DOM ───────────────────────────────────────────────────
  function cardById(id) {
    return document.getElementById('card_' + id) ||
      document.querySelector('.card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
  }
  function cardInfo(id) {
    const el = cardById(id);
    if (!el) return null;
    const titleEl = el.querySelector('.card-title');
    const bodyEl = el.querySelector('.card-body');
    return {
      id: id,
      title: titleEl ? titleEl.textContent.trim() : '(scheda)',
      category: el.getAttribute('data-category') || '',
      subject: el.getAttribute('data-subject') || 'agronomia',
      bodyHTML: bodyEl ? bodyEl.innerHTML : ''
    };
  }

  // ── Bootstrap: importa il progresso già esistente ────────────────────
  function bootstrapFromStudyStates() {
    let states = {};
    try { states = JSON.parse(localStorage.getItem('agronomia_study_states') || '{}'); } catch (e) {}
    let added = false;
    Object.keys(states).forEach(id => {
      const st = states[id];
      if (st && st !== 'todo' && !srs[id]) { srs[id] = newEntry(); added = true; }
    });
    if (added) save();
  }

  // ── Aggancio al tracker (universale su tutte le schede) ──────────────
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.tracker-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const status = btn.getAttribute('data-status');
    if (!id) return;
    // dopo l'handler dell'app
    setTimeout(function () {
      if (status === 'todo') removeCard(id);
      else ensureScheduled(id);
    }, 0);
  });

  // Riflette l'esito del ripasso nello stato del tracker (se disponibile).
  function syncTrackerStatus(id, quality, entry) {
    if (typeof window.setCardStatus !== 'function') return;
    if (quality < 3) window.setCardStatus(id, 'review');          // sbagliata
    else if (entry.reps >= 3) window.setCardStatus(id, 'done');   // consolidata
    else window.setCardStatus(id, 'progress');                    // in corso
  }

  // ── UI ───────────────────────────────────────────────────────────────
  let queue = [], qIndex = 0, revealed = false, reviewedCount = 0;

  function buildUI() {
    // Pulsante in header
    const openBtn = document.createElement('button');
    openBtn.className = 'header-btn srs-btn';
    openBtn.id = 'srsOpenBtn';
    openBtn.title = 'Ripasso a ripetizione spaziata';
    openBtn.innerHTML = 'Ripasso <span class="srs-badge" id="srsBadge">0</span>';
    const quizBtn = document.getElementById('quizBtn');
    if (quizBtn && quizBtn.parentElement) quizBtn.parentElement.insertBefore(openBtn, quizBtn);
    else { const ha = document.querySelector('.header-actions'); if (ha) ha.insertBefore(openBtn, ha.firstChild); }
    openBtn.addEventListener('click', openReview);

    // Overlay
    const ov = document.createElement('div');
    ov.className = 'srs-overlay';
    ov.id = 'srsOverlay';
    ov.innerHTML =
      '<div class="srs-modal" role="dialog" aria-modal="true" aria-label="Sessione di ripasso">' +
        '<button class="srs-close" id="srsClose" aria-label="Chiudi">&times;</button>' +
        '<div class="srs-progress"><div class="srs-progress-bar" id="srsProgressBar"></div></div>' +
        '<div class="srs-counter" id="srsCounter"></div>' +
        '<div class="srs-stage" id="srsStage"></div>' +
      '</div>';
    document.body.appendChild(ov);
    document.getElementById('srsClose').addEventListener('click', closeReview);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeReview(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ov.classList.contains('is-open')) closeReview();
    });
    updateBadge();
  }

  function updateBadge() {
    const b = document.getElementById('srsBadge');
    if (!b) return;
    const n = dueIds().length;
    b.textContent = n;
    b.classList.toggle('srs-badge-zero', n === 0);
  }

  function openReview() {
    const due = dueIds();
    // mescola e limita alla sessione
    for (let i = due.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = due[i]; due[i] = due[j]; due[j] = t; }
    queue = due.slice(0, SESSION_MAX).filter(id => cardById(id)); // solo schede presenti nel DOM
    qIndex = 0; revealed = false; reviewedCount = 0;
    document.getElementById('srsOverlay').classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (queue.length === 0) renderEmpty();
    else renderCurrent();
  }

  function closeReview() {
    document.getElementById('srsOverlay').classList.remove('is-open');
    document.body.style.overflow = '';
    updateBadge();
  }

  function renderEmpty() {
    setProgress(0);
    document.getElementById('srsCounter').textContent = '';
    const total = Object.keys(srs).length;
    const nd = nextDueDate();
    const stage = document.getElementById('srsStage');
    if (total === 0) {
      stage.innerHTML =
        '<div class="srs-empty">' +
          '<div class="srs-empty-emoji">🌱</div>' +
          '<h3>Nessuna scheda nel ripasso</h3>' +
          '<p>Marca le schede che studi (col tracker sotto ogni scheda) per aggiungerle automaticamente al ripasso a ripetizione spaziata.</p>' +
        '</div>';
    } else {
      stage.innerHTML =
        '<div class="srs-empty">' +
          '<div class="srs-empty-emoji">✅</div>' +
          '<h3>Tutto ripassato per oggi!</h3>' +
          '<p>' + total + ' schede nel ripasso.' +
            (nd ? ' Prossimo ripasso: <strong>' + formatDateIt(nd) + '</strong>.' : '') + '</p>' +
        '</div>';
    }
  }

  function setProgress(pct) {
    const bar = document.getElementById('srsProgressBar');
    if (bar) bar.style.width = pct + '%';
  }

  function renderCurrent() {
    revealed = false;
    const id = queue[qIndex];
    const info = cardInfo(id);
    if (!info) { next(); return; }
    setProgress(Math.round((qIndex / queue.length) * 100));
    document.getElementById('srsCounter').textContent = (qIndex + 1) + ' / ' + queue.length;
    const stage = document.getElementById('srsStage');
    stage.innerHTML =
      '<div class="srs-card">' +
        '<div class="srs-cat">' + escapeHtml(info.category) + '</div>' +
        '<h3 class="srs-question">' + escapeHtml(info.title) + '</h3>' +
        '<div class="srs-answer tex2jax_process" id="srsAnswer" hidden></div>' +
      '</div>' +
      '<div class="srs-actions" id="srsActions">' +
        '<button class="srs-show-btn" id="srsShowBtn">Mostra risposta</button>' +
      '</div>';
    document.getElementById('srsShowBtn').addEventListener('click', reveal);
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    const id = queue[qIndex];
    const info = cardInfo(id);
    const ans = document.getElementById('srsAnswer');
    ans.innerHTML = info.bodyHTML;
    ans.hidden = false;
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([ans]).catch(function () {});

    const entry = srs[id] || newEntry();
    const grades = [
      { q: 2, label: 'Di nuovo', cls: 'again' },
      { q: 3, label: 'Difficile', cls: 'hard' },
      { q: 4, label: 'Bene', cls: 'good' },
      { q: 5, label: 'Facile', cls: 'easy' }
    ];
    const actions = document.getElementById('srsActions');
    actions.innerHTML = '<div class="srs-grades">' + grades.map(function (g) {
      return '<button class="srs-grade srs-grade-' + g.cls + '" data-q="' + g.q + '">' +
        '<span class="srs-grade-label">' + g.label + '</span>' +
        '<span class="srs-grade-iv">' + humanizeDays(previewIv(entry, g.q)) + '</span>' +
      '</button>';
    }).join('') + '</div>';
    actions.querySelectorAll('.srs-grade').forEach(function (b) {
      b.addEventListener('click', function () { grade(parseInt(b.getAttribute('data-q'), 10)); });
    });
  }

  function grade(quality) {
    const id = queue[qIndex];
    const entry = srs[id] || newEntry();
    applySm2(entry, quality);
    srs[id] = entry;
    save();
    reviewedCount++;
    syncTrackerStatus(id, quality, entry);
    // "Di nuovo": la scheda torna in coda più avanti nella stessa sessione
    if (quality < 3 && queue.length > 1) queue.push(id);
    next();
  }

  function next() {
    qIndex++;
    if (qIndex >= queue.length) return finish();
    renderCurrent();
  }

  function finish() {
    setProgress(100);
    document.getElementById('srsCounter').textContent = '';
    const nd = nextDueDate();
    document.getElementById('srsStage').innerHTML =
      '<div class="srs-empty">' +
        '<div class="srs-empty-emoji">🎉</div>' +
        '<h3>Sessione completata</h3>' +
        '<p>Hai ripassato <strong>' + reviewedCount + '</strong> ' +
          (reviewedCount === 1 ? 'scheda' : 'schede') + '.' +
          (nd ? ' Prossimo ripasso: <strong>' + formatDateIt(nd) + '</strong>.' : '') + '</p>' +
        '<button class="srs-show-btn" id="srsDoneBtn">Chiudi</button>' +
      '</div>';
    const db = document.getElementById('srsDoneBtn');
    if (db) db.addEventListener('click', closeReview);
    updateBadge();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    bootstrapFromStudyStates();
    buildUI();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

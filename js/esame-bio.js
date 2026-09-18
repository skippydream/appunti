/* ============================================================================
   Esame di Biologia (botanica generale + sistematica) — modulo autonomo.

   Riproduce i formati del quiz Moodle del docente:
     mc     scelta singola              ("Scegli un'alternativa")
     multi  scelta multipla             ("Scegli una o più alternative")
     cloze  completa il testo trascinando parole nei riquadri
     label  trascina le etichette sui riquadri di un'immagine
     match  menu a tendina per ogni riga (spesso su immagine numerata)
     sort   sposta ogni elemento nella categoria giusta ("quiz visuale")

   Interazione: tocca una parola e poi il riquadro (oppure trascinala).
   Tocca un riquadro pieno per svuotarlo.

   Banca domande in js/esame-bio-data.js (window.ESAME_BIO_DATA).
   Dati in localStorage 'esame_bio_v1' (sincronizzato da sync.js):
     { wrong:{qid:n}, seen:{qid:n}, miss:{qid:n}, best:{score,total,at}, history:[…] }
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'esame_bio_v1';
  const EXAM_SIZE = 30;
  const PASS_RATIO = 0.6;
  const IMG_DIR = './images/esame_bio/';
  const SUBJECT = 'biologia';

  const BANK = (window.ESAME_BIO_DATA || []).slice();
  if (!BANK.length) return;

  const TOPICS = ['Generalità e molecole', 'Citologia', 'Istologia', 'Organografia',
    'Fiore e riproduzione', 'Sistematica'];

  const TYPES = {
    mc:    { name: 'Scelta singola',          hint: "Scegli un'alternativa:" },
    multi: { name: 'Scelta multipla',         hint: 'Scegli una o più alternative:' },
    cloze: { name: 'Completa il testo',       hint: 'Tocca una parola e poi il riquadro (o trascinala). Tocca un riquadro pieno per svuotarlo.' },
    label: { name: "Etichetta l'immagine",    hint: 'Tocca un’etichetta e poi il riquadro sull’immagine (o trascinala). Tocca un riquadro pieno per svuotarlo.' },
    match: { name: 'Menu a tendina',          hint: 'Scegli la risposta giusta in ogni menu.' },
    sort:  { name: 'Trascina nelle categorie', hint: 'Tocca un elemento e poi la categoria (o trascinalo). Tocca un elemento già collocato per rimetterlo in basso.' },
  };
  const TYPE_ORDER = ['mc', 'multi', 'cloze', 'label', 'match', 'sort'];

  // ── Sorgente (reali / generate) ──────────────────────────────────────
  let source = 'all';
  function inSource(q) { return source === 'all' ? true : (source === 'gen' ? !q.real : q.real); }
  function pool() { return BANK.filter(inSource); }

  // ── Storage ──────────────────────────────────────────────────────────
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || '{}');
      o.wrong = o.wrong || {}; o.seen = o.seen || {}; o.miss = o.miss || {}; o.history = o.history || [];
      return o;
    } catch (e) { return { wrong: {}, seen: {}, miss: {}, history: [] }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  let store = load();

  function recordAnswer(qid, ok) {
    store.seen[qid] = (store.seen[qid] || 0) + 1;
    if (ok) { if (store.wrong[qid]) delete store.wrong[qid]; }
    else { store.wrong[qid] = (store.wrong[qid] || 0) + 1; store.miss[qid] = (store.miss[qid] || 0) + 1; }
  }
  function wrongIds() { return Object.keys(store.wrong).map(Number); }

  function statsBy(keyFn, keys) {
    const m = {};
    keys.forEach(k => { m[k] = { seen: 0, miss: 0 }; });
    BANK.forEach(q => {
      const k = keyFn(q);
      if (!m[k]) return;
      m[k].seen += store.seen[q.id] || 0;
      m[k].miss += store.miss[q.id] || 0;
    });
    return m;
  }

  // ── Utility ──────────────────────────────────────────────────────────
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmtScore(x) { return (Math.round(x * 10) / 10).toString().replace('.', ','); }
  const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  function srcBadge(q) {
    return q.real
      ? '<span class="esame-src esame-src-real">Esame reale</span>'
      : '<span class="esame-src esame-src-gen">Stile esame</span>';
  }

  // ── Preparazione di una domanda giocabile ────────────────────────────
  // Ogni item ha: ref (domanda), stato di risposta (dipende dal tipo), done.
  function prep(q) {
    const it = { ref: q, touched: false };
    if (q.type === 'mc' || q.type === 'multi') {
      it.order = shuffle(q.opts.map((_, i) => i));      // posizione -> indice originale
      it.sel = [];                                       // indici originali scelti
    } else if (q.type === 'cloze' || q.type === 'label') {
      const n = q.type === 'cloze' ? q.answers.length : q.zones.length;
      const answers = q.type === 'cloze' ? q.answers : q.zones.map(z => z.ans);
      const groups = q.groups || answers.map(() => 0);
      let chips = answers.map((a, i) => ({ t: a, g: groups[i] }));
      const bank = q.bank || [];
      if (bank.length && Array.isArray(bank[0])) bank.forEach((arr, g) => arr.forEach(t => chips.push({ t: t, g: g })));
      else bank.forEach(t => chips.push({ t: t, g: 0 }));
      chips = shuffle(chips).map((c, i) => ({ id: i, t: c.t, g: c.g }));
      it.chips = chips;
      it.groups = groups;
      it.answers = answers;
      it.fill = new Array(n).fill(null);                 // slot -> chip id
    } else if (q.type === 'match') {
      it.opts = shuffle(q.options.slice());
      it.fill = q.rows.map(() => '');
    } else if (q.type === 'sort') {
      it.chips = shuffle(q.items.map((x, i) => ({ id: i, t: x.t, img: x.img, cat: x.cat })));
      it.fill = it.chips.map(() => null);                // chip index (in it.chips) -> categoria
    }
    return it;
  }

  // ── Valutazione (punteggio parziale come Moodle) ─────────────────────
  // Restituisce {frac: 0..1, slots: [bool] per le parti}.
  function grade(it) {
    const q = it.ref;
    if (q.type === 'mc') {
      return { frac: it.sel[0] === q.correct ? 1 : 0 };
    }
    if (q.type === 'multi') {
      const right = q.correct;
      const good = it.sel.filter(i => right.indexOf(i) >= 0).length;
      const bad = it.sel.length - good;
      return { frac: Math.max(0, (good - bad) / right.length) };
    }
    if (q.type === 'cloze' || q.type === 'label') {
      const placed = it.fill.map(id => id == null ? null : it.chips[id].t);
      const slots = placed.map((t, i) => t === it.answers[i]);
      // Gruppi di riquadri intercambiabili (es. "A, B e C"): conta il multiinsieme.
      (q.free || []).forEach(set => {
        const want = set.map(i => it.answers[i]);
        set.forEach(i => {
          const t = placed[i];
          const k = t == null ? -1 : want.indexOf(t);
          slots[i] = k >= 0;
          if (k >= 0) want.splice(k, 1);
        });
      });
      const ok = slots.filter(Boolean).length;
      return { frac: ok / slots.length, slots: slots };
    }
    if (q.type === 'match') {
      const slots = q.rows.map((r, i) => it.fill[i] === r.ans);
      return { frac: slots.filter(Boolean).length / slots.length, slots: slots };
    }
    if (q.type === 'sort') {
      const slots = it.chips.map((c, i) => it.fill[i] === c.cat);
      return { frac: slots.filter(Boolean).length / slots.length, slots: slots };
    }
    return { frac: 0 };
  }

  function isAnswered(it) {
    const q = it.ref;
    if (q.type === 'mc' || q.type === 'multi') return it.sel.length > 0;
    if (q.type === 'match') return it.fill.some(v => v);
    return it.fill.some(v => v != null);
  }

  // ── Stato sessione ───────────────────────────────────────────────────
  let queue = [], qIndex = 0, mode = 'exam', checked = false;
  let pick = null;   // selezione corrente per il tocco: {kind:'chip', id} | {kind:'slot', i}

  // ── UI: guscio ───────────────────────────────────────────────────────
  function buildUI() {
    const openBtn = document.createElement('button');
    openBtn.className = 'header-btn esame-btn';
    openBtn.id = 'esameBioOpenBtn';
    openBtn.title = "Simulazione d'esame di Biologia";
    openBtn.textContent = 'Esame';
    const anchor = document.getElementById('esameOpenBtn') || document.getElementById('graphOpenBtn');
    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(openBtn, anchor.nextSibling);
    else { const ha = document.querySelector('.header-actions'); if (ha) ha.insertBefore(openBtn, ha.firstChild); }
    openBtn.addEventListener('click', openHome);

    const ov = document.createElement('div');
    ov.className = 'esame-overlay eb-overlay';
    ov.id = 'ebOverlay';
    ov.innerHTML =
      '<div class="esame-modal eb-modal" role="dialog" aria-modal="true" aria-label="Esame di Biologia">' +
        '<button class="esame-close" id="ebClose" aria-label="Chiudi">&times;</button>' +
        '<div class="esame-progress"><div class="esame-progress-bar" id="ebProgressBar"></div></div>' +
        '<div class="esame-counter" id="ebCounter"></div>' +
        '<div class="esame-stage" id="ebStage"></div>' +
      '</div>';
    document.body.appendChild(ov);
    document.getElementById('ebClose').addEventListener('click', close);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && ov.classList.contains('is-open')) close();
    });
    syncVisibility();
    document.addEventListener('click', e => {
      if (e.target.closest && e.target.closest('.subj-tab')) setTimeout(syncVisibility, 0);
    });
  }

  function syncVisibility() {
    const btn = document.getElementById('esameBioOpenBtn');
    if (!btn) return;
    const active = document.querySelector('.subj-tab.active');
    const subj = active ? active.getAttribute('data-subject') : null;
    btn.style.display = subj === SUBJECT ? '' : 'none';
  }
  window.__esameBioSync = syncVisibility;

  function setProgress(p) { const b = document.getElementById('ebProgressBar'); if (b) b.style.width = p + '%'; }
  function stage() { return document.getElementById('ebStage'); }
  function counter(t) { document.getElementById('ebCounter').textContent = t || ''; }
  function scrollTop() { const m = document.querySelector('.eb-modal'); if (m) m.scrollTop = 0; }

  function openHome() {
    document.getElementById('ebOverlay').classList.add('is-open');
    document.documentElement.classList.add('modal-open');
    renderHome();
  }
  function close() {
    document.getElementById('ebOverlay').classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
  }

  // ── Home ─────────────────────────────────────────────────────────────
  function weakRows(stats, keys, attr) {
    const rows = keys.map(k => ({ k: k, s: stats[k] }))
      .filter(x => x.s.seen > 0)
      .map(x => ({ k: x.k, acc: 1 - x.s.miss / x.s.seen }))
      .sort((a, b) => a.acc - b.acc);
    return rows.map(w => {
      const pct = Math.round(w.acc * 100);
      const label = attr === 'type' ? TYPES[w.k].name : w.k;
      return '<button class="esame-weak-row" data-' + attr + '="' + esc(w.k) + '" title="Allenati su questo">' +
        '<span class="esame-weak-t">' + esc(label) + '</span>' +
        '<span class="esame-weak-bar"><span class="esame-weak-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="esame-weak-pct">' + pct + '%</span>' +
      '</button>';
    }).join('');
  }

  function renderHome() {
    setProgress(0); counter('');
    const p = pool();
    const nReal = BANK.filter(q => q.real).length;
    const nGen = BANK.length - nReal;
    const nWrong = wrongIds().length;
    const best = store.best;

    const seg = [
      { k: 'all', label: 'Tutte', n: BANK.length },
      { k: 'gen', label: "Simili all'esame", n: nGen },
      { k: 'real', label: 'Reali', n: nReal },
    ].map(s => '<button class="esame-seg-btn' + (source === s.k ? ' is-active' : '') +
      '" data-src="' + s.k + '">' + s.label + ' <span class="esame-seg-n">' + s.n + '</span></button>').join('');

    const wt = weakRows(statsBy(q => q.topic, TOPICS), TOPICS, 'topic');
    const wf = weakRows(statsBy(q => q.type, TYPE_ORDER), TYPE_ORDER, 'type');
    const weakHTML = (wt || wf) ? (
      '<div class="esame-weak">' +
        (wt ? '<div class="esame-weak-h">Punti deboli per argomento</div>' + wt : '') +
        (wf ? '<div class="esame-weak-h eb-weak-h2">Punti deboli per formato</div>' + wf : '') +
      '</div>') : '';

    const topicChips = TOPICS.map(t => {
      const n = p.filter(q => q.topic === t).length;
      return '<button class="esame-topic" data-topic="' + esc(t) + '"' + (n ? '' : ' disabled') + '>' +
        esc(t) + ' <span class="esame-topic-n">' + n + '</span></button>';
    }).join('');
    const typeChips = TYPE_ORDER.map(t => {
      const n = p.filter(q => q.type === t).length;
      return '<button class="esame-topic eb-type-chip" data-type="' + t + '"' + (n ? '' : ' disabled') + '>' +
        '<span class="eb-type-ico eb-ico-' + t + '"></span>' + esc(TYPES[t].name) +
        ' <span class="esame-topic-n">' + n + '</span></button>';
    }).join('');

    stage().innerHTML =
      '<div class="esame-home">' +
        '<h2 class="esame-h">Esame di Biologia</h2>' +
        '<p class="esame-sub">' + nReal + ' domande reali (citologia e anatomia vegetale) + ' + nGen +
          ' generate dalle schede, negli stessi formati del quiz Moodle.</p>' +
        (best ? '<div class="esame-best">Record simulazione: <strong>' + fmtScore(best.score) + '/' + best.total + '</strong></div>' : '') +
        weakHTML +
        '<div class="esame-seg-wrap">' +
          '<div class="esame-seg-label">Attingi da</div>' +
          '<div class="esame-seg">' + seg + '</div>' +
        '</div>' +
        '<div class="esame-modes">' +
          '<button class="esame-mode esame-mode-exam" id="ebStartExam">' +
            '<span class="esame-mode-t">Simulazione d\'esame</span>' +
            '<span class="esame-mode-d">' + Math.min(EXAM_SIZE, p.length) + ' domande a caso, tutti i formati mescolati. Nessun aiuto durante la prova, punteggio parziale come su Moodle, correzione finale.</span>' +
          '</button>' +
          (nWrong ? '<button class="esame-mode esame-mode-wrong" id="ebStartWrong">' +
            '<span class="esame-mode-t">Ripassa i tuoi errori <span class="esame-badge">' + nWrong + '</span></span>' +
            '<span class="esame-mode-d">Solo le domande che non hai fatto giuste al 100%.</span>' +
          '</button>' : '') +
          '<button class="esame-mode esame-mode-ref" id="ebGuideBtn">' +
            '<span class="esame-mode-t">Come sono fatte le domande</span>' +
            '<span class="esame-mode-d">I 6 formati del quiz, come si risponde e le trappole tipiche del docente.</span>' +
          '</button>' +
        '</div>' +
        '<div class="esame-train">' +
          '<div class="esame-train-t">Allenati per formato <span class="esame-train-d">(correzione dopo ogni domanda)</span></div>' +
          '<div class="esame-topics eb-types">' + typeChips + '</div>' +
        '</div>' +
        '<div class="esame-train eb-train2">' +
          '<div class="esame-train-t">Allenati per argomento</div>' +
          '<div class="esame-topics">' +
            '<button class="esame-topic esame-topic-all" data-topic="__all">Tutti <span class="esame-topic-n">' + p.length + '</span></button>' +
            topicChips +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('ebStartExam').addEventListener('click', startExam);
    const w = document.getElementById('ebStartWrong');
    if (w) w.addEventListener('click', startWrong);
    document.getElementById('ebGuideBtn').addEventListener('click', renderGuide);
    stage().querySelectorAll('.esame-seg-btn').forEach(b => b.addEventListener('click', () => { source = b.getAttribute('data-src'); renderHome(); }));
    stage().querySelectorAll('[data-topic]').forEach(b => b.addEventListener('click', () => {
      const t = b.getAttribute('data-topic'); startTrain(q => t === '__all' || q.topic === t);
    }));
    stage().querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => {
      const t = b.getAttribute('data-type'); startTrain(q => q.type === t);
    }));
  }

  // ── Guida ai formati ─────────────────────────────────────────────────
  function renderGuide() {
    setProgress(0); counter('');
    const g = [
      ['mc', "Scegli un'alternativa", [
        'Una sola risposta giusta. Spesso è una frase da completare ("Il ritidoma:", "I bulbi derivano dalla metamorfosi di:").',
        'Trappola tipica: un distrattore quasi vero con UN dettaglio sbagliato (es. "…del fusto primario" invece che secondario).',
      ]],
      ['multi', 'Scegli una o più alternative', [
        'Le giuste possono essere anche una sola: valuta ogni riga da sola, come un vero/falso.',
        'Ogni risposta sbagliata spuntata toglie punti: nel dubbio non spuntare.',
        'Attenzione alle descrizioni: "il cotone, formato da tricomi" è giusto; "la canapa, formata da brattee" no, anche se la canapa è una fibra vegetale.',
      ]],
      ['cloze', 'Completa il testo', [
        'Le parole in più sono trappole: di solito opposti (idrofila/idrofoba, vegetale/animale, grandi/piccoli).',
        'Se le parole hanno colori diversi, ogni riquadro accetta solo le parole del suo colore.',
        'Rileggi la frase finita: deve essere vera e grammaticalmente corretta.',
      ]],
      ['label', "Etichetta l'immagine", [
        'Segui la linea di ogni riquadro fino alla struttura indicata.',
        'Parti dalle strutture sicure (nucleo, epidermide, xilema…) e usa l’esclusione per le altre.',
        'Alcune etichette possono essere trappole che non vanno usate (es. "parete" nel cloroplasto, "sughero" nella foglia).',
      ]],
      ['match', 'Menu a tendina', [
        'Tipico su immagini con numeri e frecce: "Il numero 1 indica…".',
        'Tutti i menu hanno le stesse opzioni: escludi quelle già usate.',
      ]],
      ['sort', 'Trascina nelle categorie', [
        'Sono i "quiz visuali": ovario supero/infero, tipi di androceo e gineceo, sporofito/gametofito, riconosci l’organo (radice/fusto/foglia modificati).',
        'Chiediti da quale organo deriva la struttura, non a cosa assomiglia (il tubero di patata è un fusto, il cladodio è un fusto, il viticcio del pisello è una foglia).',
      ]],
    ];
    stage().innerHTML =
      '<div class="esame-numeri">' +
        '<h2 class="esame-h">Come sono fatte le domande</h2>' +
        '<p class="esame-sub">Il quiz reale mescola questi 6 formati. Allenati su ognuno finché i gesti diventano automatici e ti resta solo da pensare al contenuto.</p>' +
        g.map(x =>
          '<div class="esame-num-group">' +
            '<div class="esame-num-h"><span class="eb-type-ico eb-ico-' + x[0] + '"></span>' + esc(x[1]) + '</div>' +
            '<ul class="esame-num-list">' + x[2].map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
            '<button class="esame-secondary eb-guide-try" data-type="' + x[0] + '">Prova questo formato</button>' +
          '</div>').join('') +
        '<button class="esame-secondary" id="ebGuideBack">Torna al menu</button>' +
      '</div>';
    document.getElementById('ebGuideBack').addEventListener('click', renderHome);
    stage().querySelectorAll('.eb-guide-try').forEach(b => b.addEventListener('click', () => {
      const t = b.getAttribute('data-type'); startTrain(q => q.type === t);
    }));
    scrollTop();
  }

  // ── Avvii ────────────────────────────────────────────────────────────
  // Simulazione: estrazione bilanciata per argomento e con tutti i formati.
  function startExam() {
    mode = 'exam';
    const p = shuffle(pool());
    const byTopic = {};
    p.forEach(q => { (byTopic[q.topic] = byTopic[q.topic] || []).push(q); });
    const picked = [];
    const keys = Object.keys(byTopic);
    while (picked.length < Math.min(EXAM_SIZE, p.length)) {
      let added = false;
      keys.forEach(k => {
        if (picked.length < EXAM_SIZE && byTopic[k].length) { picked.push(byTopic[k].shift()); added = true; }
      });
      if (!added) break;
    }
    queue = shuffle(picked).map(prep);
    begin();
  }
  function startWrong() {
    mode = 'train';
    const ids = new Set(wrongIds());
    queue = shuffle(BANK.filter(q => ids.has(q.id))).map(prep);
    begin();
  }
  function startTrain(filter) {
    mode = 'train';
    queue = shuffle(pool().filter(filter)).map(prep);
    begin();
  }
  function begin() {
    qIndex = 0;
    if (!queue.length) { renderHome(); return; }
    renderQuestion();
  }

  // ── Rendering domanda ────────────────────────────────────────────────
  // view: 'answer' (interattiva) | 'check' (corretta, sola lettura)
  function renderQuestion() {
    const it = queue[qIndex];
    checked = false; pick = null;
    setProgress(Math.round((qIndex / queue.length) * 100));
    counter((qIndex + 1) + ' / ' + queue.length + (mode === 'exam' ? '  ·  Simulazione' : '  ·  Allenamento'));
    stage().innerHTML =
      '<div class="esame-q eb-q">' +
        questionHead(it.ref) +
        '<div class="eb-body" id="ebBody"></div>' +
        '<div class="esame-explain" id="ebExplain" hidden></div>' +
        '<div class="esame-nav" id="ebNav"></div>' +
      '</div>';
    drawBody(it, 'answer');
    renderNav();
    scrollTop();
  }

  function questionHead(q) {
    return '<div class="esame-q-head">' +
        '<span class="esame-q-topic">' + esc(q.topic) + '</span>' +
        '<span class="eb-q-type"><span class="eb-type-ico eb-ico-' + q.type + '"></span>' + esc(TYPES[q.type].name) + '</span>' +
        srcBadge(q) +
      '</div>' +
      '<h3 class="esame-q-text">' + esc(q.q) + '</h3>';
  }

  // dimensioni naturali (dal file dati) per riservare lo spazio prima del caricamento.
  function imgTag(src, cls) {
    const sz = (window.ESAME_BIO_IMG || {})[src];
    return '<img class="' + (cls || 'eb-img') + '" src="' + IMG_DIR + esc(src) + '" alt="" draggable="false"' +
      (sz ? ' width="' + sz[0] + '" height="' + sz[1] + '"' : '') + '>';
  }

  function drawBody(it, view) {
    const box = document.getElementById('ebBody');
    const q = it.ref;
    const ro = view !== 'answer';
    const g = ro ? grade(it) : null;
    let html = '<div class="eb-hint">' + esc(TYPES[q.type].hint) + '</div>';
    if (q.type === 'mc' || q.type === 'multi') html += drawChoice(it, ro);
    else if (q.type === 'cloze') html += drawCloze(it, ro, g);
    else if (q.type === 'label') html += drawLabel(it, ro, g);
    else if (q.type === 'match') html += drawMatch(it, ro, g);
    else if (q.type === 'sort') html += drawSort(it, ro, g);
    box.innerHTML = html;
    if (!ro) wire(it);
  }

  // Scelta singola / multipla
  function drawChoice(it, ro) {
    const q = it.ref;
    const multi = q.type === 'multi';
    const right = multi ? q.correct : [q.correct];
    return '<div class="esame-opts eb-opts' + (multi ? ' is-multi' : '') + '">' +
      it.order.map((oi, pos) => {
        const chosen = it.sel.indexOf(oi) >= 0;
        let cls = 'esame-opt eb-opt';
        if (chosen) cls += ' is-chosen';
        if (ro) {
          if (right.indexOf(oi) >= 0) cls += ' is-correct';
          else if (chosen) cls += ' is-wrong';
        }
        return '<button class="' + cls + '" data-oi="' + oi + '"' + (ro ? ' disabled' : '') + '>' +
          '<span class="eb-check' + (multi ? ' is-box' : '') + '"></span>' +
          '<span class="esame-opt-l">' + LETTERS[pos] + '.</span>' +
          '<span class="esame-opt-x">' + esc(q.opts[oi]) + '</span>' +
        '</button>';
      }).join('') + '</div>';
  }

  // Parola "chip"
  function chipHTML(it, c, extra) {
    const sel = pick && pick.kind === 'chip' && pick.id === c.id;
    return '<button class="eb-chip eb-g' + (c.g || 0) + (sel ? ' is-picked' : '') + (extra || '') +
      '" data-chip="' + c.id + '" draggable="true">' + esc(c.t) + '</button>';
  }

  function usedChips(it) { const s = new Set(); it.fill.forEach(v => { if (v != null) s.add(v); }); return s; }

  function bankHTML(it, ro) {
    if (ro) return '';
    const used = usedChips(it);
    const groups = Array.from(new Set(it.chips.map(c => c.g))).sort();
    return '<div class="eb-bank">' + groups.map(g =>
      '<div class="eb-bank-row">' +
        it.chips.filter(c => c.g === g && !used.has(c.id)).map(c => chipHTML(it, c)).join('') +
      '</div>').join('') + '</div>';
  }

  function slotHTML(it, i, ro, g, inline) {
    const id = it.fill[i];
    const grp = it.groups[i] || 0;
    const active = pick && pick.kind === 'slot' && pick.i === i;
    let cls = 'eb-slot eb-g' + grp + (id != null ? ' is-full' : '') + (active ? ' is-active' : '') + (inline ? ' is-inline' : '');
    let fix = '';
    if (ro) {
      cls += g.slots[i] ? ' is-ok' : ' is-no';
      if (!g.slots[i]) fix = '<span class="eb-fix">' + esc(it.answers[i]) + '</span>';
    }
    return '<span class="' + cls + '" data-slot="' + i + '"' + (ro ? '' : ' role="button" tabindex="0"') + '>' +
      (id != null ? '<span class="eb-slot-t">' + esc(it.chips[id].t) + '</span>' : '<span class="eb-slot-ph"></span>') +
      fix + '</span>';
  }

  function drawCloze(it, ro, g) {
    const q = it.ref;
    const parts = q.text.split(/\{(\d+)\}/);
    let txt = '';
    parts.forEach((p, k) => {
      if (k % 2 === 0) txt += esc(p);
      else txt += slotHTML(it, parseInt(p, 10), ro, g, true);
    });
    return (q.img ? '<div class="eb-img-wrap">' + imgTag(q.img) + '</div>' : '') +
      '<div class="eb-cloze">' + txt + '</div>' + bankHTML(it, ro);
  }

  function drawLabel(it, ro, g) {
    const q = it.ref;
    const zw = q.zw || 18;
    let lines = '';
    const zones = q.zones.map((z, i) => {
      const w = z.w || zw;
      if (z.px != null) {
        lines += '<line x1="' + z.x + '" y1="' + z.y + '" x2="' + z.px + '" y2="' + z.py + '"/>' +
          '<circle cx="' + z.px + '" cy="' + z.py + '" r="0.9"/>';
      }
      return '<div class="eb-zone" style="left:' + (z.x - w / 2) + '%;top:' + z.y + '%;width:' + w + '%">' +
        slotHTML(it, i, ro, g, false) + '</div>';
    }).join('');
    // Le immagini piccole non vanno ingrandite oltre ~1,6x (perdono nitidezza e proporzione).
    const sz = (window.ESAME_BIO_IMG || {})[q.img];
    const maxW = sz ? Math.round(sz[0] * 1.6) : 0;
    const st = maxW ? ' style="max-width:' + maxW + 'px;min-width:' + Math.min(560, maxW) + 'px"' : '';
    return '<div class="eb-label-scroll"><div class="eb-label-stage"' + st + '>' +
        imgTag(q.img, 'eb-label-img') +
        (lines ? '<svg class="eb-pins" viewBox="0 0 100 100" preserveAspectRatio="none">' + lines + '</svg>' : '') +
        zones +
      '</div></div>' + bankHTML(it, ro);
  }

  function drawMatch(it, ro, g) {
    const q = it.ref;
    return (q.img ? '<div class="eb-img-wrap">' + imgTag(q.img) + '</div>' : '') +
      '<div class="eb-match">' + q.rows.map((r, i) => {
        let cls = 'eb-match-row';
        let fix = '';
        if (ro) {
          cls += g.slots[i] ? ' is-ok' : ' is-no';
          if (!g.slots[i]) fix = '<div class="eb-fix eb-fix-block">' + esc(r.ans) + '</div>';
        }
        return '<div class="' + cls + '">' +
          '<label class="eb-match-l" for="ebSel' + i + '">' + esc(r.label) + '</label>' +
          '<div class="eb-match-c"><select class="eb-select" id="ebSel' + i + '" data-row="' + i + '"' + (ro ? ' disabled' : '') + '>' +
            '<option value="">Scegli…</option>' +
            it.opts.map(o => '<option' + (it.fill[i] === o ? ' selected' : '') + '>' + esc(o) + '</option>').join('') +
          '</select>' + fix + '</div>' +
        '</div>';
      }).join('') + '</div>';
  }

  function sortChipHTML(it, idx, ro, g) {
    const c = it.chips[idx];
    const sel = pick && pick.kind === 'chip' && pick.id === idx;
    let cls = 'eb-chip eb-sort-chip' + (sel ? ' is-picked' : '');
    let fix = '';
    if (ro) {
      cls += g.slots[idx] ? ' is-ok' : ' is-no';
      if (!g.slots[idx]) fix = '<span class="eb-fix">→ ' + esc(it.ref.cats[c.cat]) + '</span>';
    }
    return '<button class="' + cls + '" data-chip="' + idx + '"' + (ro ? ' disabled' : ' draggable="true"') + '>' +
      (c.img ? imgTag(c.img, 'eb-chip-img') : '') + '<span>' + esc(c.t) + '</span>' + fix + '</button>';
  }

  function drawSort(it, ro, g) {
    const q = it.ref;
    const cols = q.cats.map((cat, k) => {
      const active = pick && pick.kind === 'cat' && pick.i === k;
      return '<div class="eb-cat eb-cat-' + (k % 4) + (active ? ' is-active' : '') + '" data-cat="' + k + '">' +
        '<div class="eb-cat-h">' + esc(cat) + '</div>' +
        '<div class="eb-cat-body">' +
          it.chips.map((c, idx) => it.fill[idx] === k ? sortChipHTML(it, idx, ro, g) : '').join('') +
        '</div></div>';
    }).join('');
    const rest = it.chips.map((c, idx) => it.fill[idx] == null ? sortChipHTML(it, idx, ro, g) : '').join('');
    return '<div class="eb-cats" style="--eb-cols:' + q.cats.length + '">' + cols + '</div>' +
      (ro ? (rest ? '<div class="eb-bank eb-bank-ro">' + rest + '</div>' : '') : '<div class="eb-bank eb-sort-bank"><div class="eb-bank-row">' + rest + '</div></div>');
  }

  // ── Interazione ──────────────────────────────────────────────────────
  function redraw(it) { it.touched = true; drawBody(it, 'answer'); renderNav(); }

  function wire(it) {
    const q = it.ref;
    const box = document.getElementById('ebBody');

    if (q.type === 'mc' || q.type === 'multi') {
      box.querySelectorAll('.eb-opt').forEach(b => b.addEventListener('click', () => {
        const oi = parseInt(b.getAttribute('data-oi'), 10);
        if (q.type === 'mc') it.sel = [oi];
        else { const k = it.sel.indexOf(oi); if (k >= 0) it.sel.splice(k, 1); else it.sel.push(oi); }
        if (it.firstSel == null && q.type === 'mc') it.firstSel = oi;
        redraw(it);
        // Allenamento a scelta singola: correzione immediata, come nel modulo Agronomia.
        if (mode !== 'exam' && q.type === 'mc') check();
      }));
      return;
    }

    if (q.type === 'match') {
      box.querySelectorAll('.eb-select').forEach(s => s.addEventListener('change', () => {
        it.fill[parseInt(s.getAttribute('data-row'), 10)] = s.value;
        it.touched = true; renderNav();
      }));
      return;
    }

    if (q.type === 'cloze' || q.type === 'label') {
      const place = (chipId, slot) => {
        const c = it.chips[chipId];
        if ((it.groups[slot] || 0) !== c.g) { flash(slot); return; }
        const prev = it.fill.indexOf(chipId);
        if (prev >= 0) it.fill[prev] = null;
        it.fill[slot] = chipId;
        pick = null;
        redraw(it);
      };
      box.querySelectorAll('.eb-chip[data-chip]').forEach(b => {
        b.addEventListener('click', () => {
          const id = parseInt(b.getAttribute('data-chip'), 10);
          if (pick && pick.kind === 'slot') { place(id, pick.i); return; }
          pick = (pick && pick.kind === 'chip' && pick.id === id) ? null : { kind: 'chip', id: id };
          drawBody(it, 'answer');
        });
        b.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', 'c' + b.getAttribute('data-chip')); e.dataTransfer.effectAllowed = 'move'; });
      });
      box.querySelectorAll('.eb-slot[data-slot]').forEach(s => {
        const i = parseInt(s.getAttribute('data-slot'), 10);
        const act = () => {
          if (it.fill[i] != null) { it.fill[i] = null; pick = null; redraw(it); return; }
          if (pick && pick.kind === 'chip') { place(pick.id, i); return; }
          pick = (pick && pick.kind === 'slot' && pick.i === i) ? null : { kind: 'slot', i: i };
          drawBody(it, 'answer');
        };
        s.addEventListener('click', act);
        s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        s.addEventListener('dragover', e => { e.preventDefault(); s.classList.add('is-over'); });
        s.addEventListener('dragleave', () => s.classList.remove('is-over'));
        s.addEventListener('drop', e => {
          e.preventDefault(); s.classList.remove('is-over');
          const d = e.dataTransfer.getData('text/plain');
          if (d && d[0] === 'c') place(parseInt(d.slice(1), 10), i);
        });
      });
      return;
    }

    if (q.type === 'sort') {
      const move = (idx, cat) => { it.fill[idx] = cat; pick = null; redraw(it); };
      box.querySelectorAll('.eb-chip[data-chip]').forEach(b => {
        const idx = parseInt(b.getAttribute('data-chip'), 10);
        b.addEventListener('click', e => {
          e.stopPropagation();
          if (it.fill[idx] != null) { move(idx, null); return; }
          if (pick && pick.kind === 'cat') { move(idx, pick.i); return; }
          pick = (pick && pick.kind === 'chip' && pick.id === idx) ? null : { kind: 'chip', id: idx };
          drawBody(it, 'answer');
        });
        b.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', 'c' + idx); e.dataTransfer.effectAllowed = 'move'; });
      });
      box.querySelectorAll('.eb-cat').forEach(col => {
        const k = parseInt(col.getAttribute('data-cat'), 10);
        col.addEventListener('click', () => {
          if (pick && pick.kind === 'chip') { move(pick.id, k); return; }
          pick = (pick && pick.kind === 'cat' && pick.i === k) ? null : { kind: 'cat', i: k };
          drawBody(it, 'answer');
        });
        col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('is-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('is-over'));
        col.addEventListener('drop', e => {
          e.preventDefault(); col.classList.remove('is-over');
          const d = e.dataTransfer.getData('text/plain');
          if (d && d[0] === 'c') move(parseInt(d.slice(1), 10), k);
        });
      });
      const bank = box.querySelector('.eb-sort-bank');
      if (bank) {
        bank.addEventListener('dragover', e => e.preventDefault());
        bank.addEventListener('drop', e => {
          e.preventDefault();
          const d = e.dataTransfer.getData('text/plain');
          if (d && d[0] === 'c') move(parseInt(d.slice(1), 10), null);
        });
      }
    }
  }

  function flash(slot) {
    const s = document.querySelector('.eb-slot[data-slot="' + slot + '"]');
    if (!s) return;
    s.classList.remove('is-deny'); void s.offsetWidth; s.classList.add('is-deny');
  }

  // ── Navigazione / verifica ───────────────────────────────────────────
  function renderNav() {
    const nav = document.getElementById('ebNav');
    if (!nav) return;
    const it = queue[qIndex];
    const last = qIndex === queue.length - 1;
    if (mode === 'exam') {
      const canBack = qIndex > 0;
      nav.className = 'esame-nav' + (canBack ? ' is-row' : '');
      nav.innerHTML =
        (canBack ? '<button class="esame-secondary esame-back" id="ebPrev">Indietro</button>' : '') +
        '<button class="esame-next" id="ebNext">' + (last ? 'Termina e correggi' : 'Avanti') + '</button>';
      if (canBack) document.getElementById('ebPrev').addEventListener('click', () => { qIndex--; renderQuestion(); });
      document.getElementById('ebNext').addEventListener('click', () => {
        if (last) {
          const empty = queue.filter(x => !isAnswered(x)).length;
          if (empty && !confirm(empty + (empty === 1 ? ' domanda è senza risposta' : ' domande sono senza risposta') + '. Consegnare comunque?')) return;
          finish();
        } else { qIndex++; renderQuestion(); }
      });
      return;
    }
    // Allenamento
    nav.className = 'esame-nav';
    if (!checked) {
      const can = isAnswered(it);
      nav.innerHTML = '<button class="esame-next" id="ebCheck"' + (can ? '' : ' disabled') + '>Verifica</button>' +
        '<button class="esame-secondary eb-skip" id="ebSkip">Mostra soluzione</button>';
      document.getElementById('ebCheck').addEventListener('click', check);
      document.getElementById('ebSkip').addEventListener('click', check);
    } else {
      nav.innerHTML = '<button class="esame-next" id="ebNext">' + (last ? 'Vedi risultato' : 'Avanti') + '</button>';
      document.getElementById('ebNext').addEventListener('click', () => {
        if (last) finish(); else { qIndex++; renderQuestion(); }
      });
    }
  }

  function check() {
    if (checked) return;
    const it = queue[qIndex];
    checked = true; pick = null;
    const g = grade(it);
    it.result = g;
    recordAnswer(it.ref.id, g.frac === 1);
    save();
    drawBody(it, 'check');
    const ex = document.getElementById('ebExplain');
    ex.innerHTML = verdictHTML(g.frac) + '<div class="esame-why"><div class="esame-why-t">' + esc(it.ref.why) + '</div></div>';
    ex.hidden = false;
    renderNav();
  }

  function verdictHTML(frac) {
    const cls = frac === 1 ? 'ok' : (frac > 0 ? 'mid' : 'no');
    const txt = frac === 1 ? 'Corretto' : (frac > 0 ? 'Parzialmente corretto · ' + Math.round(frac * 100) + '%' : 'Sbagliato');
    return '<div class="esame-verdict ' + cls + '">' + txt + '</div>';
  }

  // ── Risultato ────────────────────────────────────────────────────────
  function finish() {
    setProgress(100); counter('');
    let score = 0;
    const total = queue.length;
    queue.forEach(it => {
      const g = it.result || grade(it);
      it.result = g;
      score += g.frac;
      if (mode === 'exam') recordAnswer(it.ref.id, g.frac === 1);
    });
    const ratio = total ? score / total : 0;
    const passed = ratio >= PASS_RATIO;
    store.history.push({ at: Date.now(), mode: mode, score: Math.round(score * 10) / 10, total: total });
    if (mode === 'exam' && (!store.best || score > store.best.score)) store.best = { score: Math.round(score * 10) / 10, total: total, at: Date.now() };
    save();

    const byType = {};
    queue.forEach(it => {
      const t = it.ref.type;
      byType[t] = byType[t] || { s: 0, n: 0 };
      byType[t].s += it.result.frac; byType[t].n++;
    });
    const typeHTML = '<div class="eb-bytype">' + TYPE_ORDER.filter(t => byType[t]).map(t => {
      const pct = Math.round(byType[t].s / byType[t].n * 100);
      return '<div class="eb-bytype-row"><span class="eb-type-ico eb-ico-' + t + '"></span>' +
        '<span class="eb-bytype-t">' + esc(TYPES[t].name) + '</span>' +
        '<span class="esame-weak-bar"><span class="esame-weak-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="esame-weak-pct">' + pct + '%</span></div>';
    }).join('') + '</div>';

    const wrong = queue.filter(it => it.result.frac < 1);
    stage().innerHTML =
      '<div class="esame-result">' +
        '<div class="esame-score-ring ' + (passed ? 'pass' : 'fail') + '">' +
          '<span class="esame-score-n">' + fmtScore(score) + '/' + total + '</span>' +
          '<span class="esame-score-pct">' + Math.round(ratio * 100) + '%</span>' +
        '</div>' +
        '<div class="esame-verdict-big ' + (passed ? 'ok' : 'no') + '">' +
          (passed ? 'Saresti promosso' : 'Non ancora sufficiente') +
          ' <span class="esame-thr">(soglia indicativa ~' + Math.ceil(total * PASS_RATIO) + '/' + total + ')</span>' +
        '</div>' +
        typeHTML +
        (wrong.length ? '<div class="esame-review"><div class="esame-review-h">Da rivedere (' + wrong.length + '): la correzione è già segnata, in verde le parti giuste.</div><div id="ebReview"></div></div>'
          : '<div class="esame-allright">Tutte corrette!</div>') +
        '<div class="esame-result-actions">' +
          (wrong.length ? '<button class="esame-next" id="ebRetry">Riprova le sbagliate</button>' : '') +
          '<button class="esame-secondary" id="ebHome">Torna al menu</button>' +
        '</div>' +
      '</div>';

    // Revisione: ogni domanda non perfetta viene ridisegnata in sola lettura con la correzione.
    const rv = document.getElementById('ebReview');
    if (rv) {
      const saveBody = document.getElementById('ebBody');
      wrong.forEach(it => {
        const card = document.createElement('div');
        card.className = 'esame-review-item eb-review-item';
        card.innerHTML = questionHead(it.ref) + '<div class="eb-body"></div>' +
          verdictHTML(it.result.frac) + '<div class="esame-review-why">' + esc(it.ref.why) + '</div>';
        rv.appendChild(card);
        const body = card.querySelector('.eb-body');
        body.id = 'ebBody';
        drawBody(it, 'check');
        body.removeAttribute('id');
      });
      if (saveBody) saveBody.id = 'ebBody';
    }
    const r = document.getElementById('ebRetry');
    if (r) r.addEventListener('click', () => { mode = 'train'; queue = shuffle(wrong.map(it => it.ref)).map(prep); begin(); });
    document.getElementById('ebHome').addEventListener('click', renderHome);
    scrollTop();
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() { buildUI(); setTimeout(syncVisibility, 300); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

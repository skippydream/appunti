/* ============================================================================
   Simulazione d'esame — modulo autonomo (come srs.js).

   Banca domande: le 40 domande REALI dell'appello "agronomia 24 giu 2026"
   (Codice Prova 0014-3001), con risposta corretta e spiegazione del perché.

   Tre modalità:
   - Simulazione: tutte le 40 (mescolate, opzioni mescolate), nessun feedback
     durante la prova, punteggio finale + revisione con spiegazioni.
   - Allenamento: filtrabile per argomento, feedback immediato dopo ogni
     risposta con la spiegazione.
   - Ripassa errori: solo le domande sbagliate nelle sessioni precedenti.

   Dati in localStorage 'esame_v1' (sincronizzato, NON device-local):
     { wrong: {qid: count}, seen: {qid: count}, best: {score, total, at},
       history: [{at, mode, score, total}] }
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'esame_v1';
  const PASS_RATIO = 0.6;   // soglia indicativa di superamento (24/40)

  // ── Banca domande ────────────────────────────────────────────────────
  // correct = indice (0-based) della risposta giusta nell'array opts.
  const BANK = [
    { id: 1, topic: 'Clima e acqua', q: '1 mm di precipitazione corrisponde a',
      opts: ['100 m³ ha⁻¹', '0,01 m³ ha⁻¹', '0,1 m³ ha⁻¹', '10 m³ ha⁻¹', '1 m³ ha⁻¹'], correct: 3,
      why: '1 mm equivale a 1 litro per m². Un ettaro sono 10.000 m², quindi 10.000 litri = 10 m³ per ettaro.' },

    { id: 2, topic: 'Clima e acqua', q: "Condizioni di inversione termica al suolo predispongono all'insorgenza di",
      opts: ['temporale', 'aridità', 'nebbia', 'pioggia leggera', 'ondate di calore'], correct: 2,
      why: "Nell'inversione l'aria fredda ristagna al suolo, si raffredda sotto il punto di rugiada e il vapore condensa: si forma nebbia. L'aria non si rimescola verso l'alto." },

    { id: 3, topic: 'Clima e acqua', q: 'I valori più bassi di umidità relativa si riscontrano solitamente',
      opts: ['a mezzogiorno', 'a mezzanotte', 'nel primo pomeriggio', 'quando piove', "prima dell'alba"], correct: 2,
      why: "Nel primo pomeriggio la temperatura è massima: l'aria calda può contenere più vapore, quindi a pari vapore assoluto l'umidità RELATIVA scende al minimo." },

    { id: 4, topic: 'Clima e acqua', q: "La distribuzione delle piogge nell'Italia settentrionale è caratterizzata da",
      opts: ['due picchi positivi in primavera e autunno e due picchi negativi in inverno ed estate',
             'un picco positivo in inverno che è la stagione più piovosa',
             'nel lungo periodo non ci sono differenze tra i mesi',
             'un picco negativo in inverno', 'un picco negativo in estate'], correct: 0,
      why: 'Regime continentale/sublitoraneo: massimi in primavera e autunno, minimi in inverno (freddo secco) ed estate (siccità).' },

    { id: 5, topic: 'Clima e acqua', q: "Cosa accade quando la temperatura dell'aria si abbassa fino alla temperatura del punto di rugiada?",
      opts: ['il vapore acqueo presente sublima', 'il vapore acqueo subisce un rapido innalzamento della temperatura',
             'il vapore acqueo presente condensa', 'il vapore acqueo presente non subisce variazioni',
             'il vapore acqueo si trasferisce agli strati alti'], correct: 2,
      why: 'Il punto di rugiada è la temperatura a cui l\'aria è satura (UR 100%). Raffreddando ancora, il vapore in eccesso condensa in acqua liquida.' },

    { id: 6, topic: 'Suolo: struttura e acqua', q: 'Cosa si intende con il termine struttura del terreno?',
      opts: ['la composizione minerale delle particelle strutturali',
             "l'attitudine di un terreno a produrre",
             'la posizione rispetto alla topografia',
             'la proprietà di un suolo di avere le particelle aggregate in modo non casuale e collegate da legami di diversa intensità',
             'la composizione della frazione minerale espressa in % in peso (per diametro)'], correct: 3,
      why: "Struttura = modo in cui le particelle elementari si aggregano. L'ultima opzione descrive la TESSITURA (granulometria), non la struttura." },

    { id: 7, topic: 'Suolo: struttura e acqua', q: 'I residui vegetali apportati al suolo:',
      opts: ['si mineralizzano totalmente in pochi mesi',
             "determinano immobilizzazione dell'N se hanno C/N basso",
             "favoriscono l'accumulo di sostanze umiche se hanno C/N elevato, superiore a 20",
             'necessitano sempre di azoto aggiuntivo', 'non contribuiscono mai alla formazione dell\'humus'], correct: 2,
      why: 'C/N alto (>20) → lenta decomposizione e umificazione (accumulo di humus). C/N basso → mineralizzazione rapida. L\'immobilizzazione dell\'N avviene con C/N ALTO, non basso.' },

    { id: 8, topic: 'Suolo: struttura e acqua', q: 'Il contenuto idrico alla saturazione',
      opts: ['corrisponde a un potenziale di -100 kPa', 'è mediamente del 20%',
             'corrisponde alla porosità totale e si può calcolare conoscendo densità apparente e reale',
             'è maggiore se misurato in campo', 'viene anche chiamato capacità di campo'], correct: 2,
      why: 'Alla saturazione tutti i pori sono pieni d\'acqua: il contenuto idrico eguaglia la porosità totale = 1 − (densità apparente / densità reale).' },

    { id: 9, topic: 'Suolo: struttura e acqua', q: 'La conducibilità idrica del terreno è massima',
      opts: ['con il suolo al punto di appassimento', 'con il suolo alla capacità idrica massima',
             'se il suolo è ricco di lombrichi', 'con il suolo alla capacità di campo',
             'durante una pioggia se il suolo è in pendio'], correct: 1,
      why: 'La conducibilità idrica è massima a saturazione (capacità idrica massima): tutti i pori sono pieni e continui, l\'acqua si muove con la minima resistenza.' },

    { id: 10, topic: 'Suolo: struttura e acqua', q: 'Le unità di misura del potenziale sono:',
      opts: ['kg, bar, l', 'Newton, l, Pa', 'Pa, bar, m', 'Pa, l, bar', 'joule, bar, Pa'], correct: 2,
      why: 'Il potenziale idrico si esprime come pressione (Pa, bar) o come altezza di colonna d\'acqua (m). Litri e kg non sono unità di potenziale.' },

    { id: 11, topic: 'Suolo: struttura e acqua', q: 'Lo strato di suolo agricolo lavorato viene definito:',
      opts: ['Ap', 'E', 'O', 'B', 'C'], correct: 0,
      why: 'Orizzonte "A" superficiale, con suffisso "p" (plowed = arato/lavorato). O = organico, E = eluviale, B = accumulo, C = substrato.' },

    { id: 12, topic: 'Suolo: struttura e acqua', q: 'Qual è il rapporto ottimale tra macro e microporosità in un suolo?',
      opts: ['20% macro e 80% micro', '70% micro e 30% macro', '60% macro e 40% micro',
             '40% macroporosità e 60% microporosità', '50% di ciascuna'], correct: 3,
      why: 'Ottimale ~40% macropori (aria e drenaggio) e ~60% micropori (ritenzione idrica): equilibrio tra ossigenazione e riserva d\'acqua.' },

    { id: 13, topic: 'Sistemazioni ed erosione', q: 'Indicare quale affermazione è FALSA:',
      opts: ['le prose sono sistemazioni temporanee di modesta dimensione',
             "la larghezza di un campo a cavino è di 35-50 m",
             'le sistemazioni di pianura sono integrate con l\'irrigazione',
             'le porche sono sistemazioni permanenti di pianura',
             "la pendenza degli appezzamenti deve essere ridotta per limitare l'erosione"], correct: 3,
      why: 'È la FALSA. Le porche sono sistemazioni superficiali/temporanee legate alla baulatura (colmate e solchi), non "sistemazioni permanenti di pianura".' },

    { id: 14, topic: 'Sistemazioni ed erosione', q: "L'eccesso di velocità del deflusso superficiale è causa di",
      opts: ['miglioramento della struttura', 'crosta superficiale', 'aumento della fotosintesi',
             'ristagno idrico', 'erosione idrica'], correct: 4,
      why: 'Acqua che scorre veloce ha alta energia: stacca e trasporta particelle di suolo → erosione idrica.' },

    { id: 15, topic: 'Sistemazioni ed erosione', q: 'La baulatura è',
      opts: ['una sistemazione per favorire il drenaggio profondo', 'una tecnica di concimazione',
             'la semina di una leguminosa tra le file di un cereale',
             'la forma leggermente concava della superficie', 'la forma leggermente convessa della superficie del suolo'], correct: 4,
      why: 'La baulatura dà al campo un profilo CONVESSO (a schiena d\'asino): l\'acqua scola dal centro verso le scoline laterali.' },

    { id: 16, topic: 'Sistemazioni ed erosione', q: 'Perché il terreno argilloso richiede distanze più ridotte tra le scoline?',
      opts: ['perché si saturano più rapidamente', "perché hanno maggiore capacità d'invaso",
             'perché trattengono più nutrienti', "perché aumentano l'infiltrazione",
             'perché drenano più lentamente'], correct: 4,
      why: 'L\'argilla è poco permeabile: drena lentamente. Servono scoline più vicine per smaltire l\'acqua su percorsi brevi ed evitare ristagni.' },

    { id: 17, topic: 'Sistemazioni ed erosione', q: 'Qual è un vantaggio dei terrazzamenti?',
      opts: ['eliminano completamente il deflusso', 'aumentano la salinità del suolo',
             'riducono la lunghezza del versante', 'favoriscono la fotosintesi',
             'consentono il passaggio delle macchine agricole'], correct: 2,
      why: 'I terrazzamenti spezzano il pendio in tratti brevi e pianeggianti: riducono la lunghezza del versante, quindi la velocità del deflusso e l\'erosione.' },

    { id: 18, topic: 'Sistemazioni ed erosione', q: "Quale tra i seguenti NON è un danno provocato dall'erosione idrica?",
      opts: ['dilavamento di nitrati', 'rimozione di terreno agrario', 'accumulo di sostanza organica',
             'perdita di fertilità dei suoli', 'frammentazione del suolo'], correct: 2,
      why: "L'erosione ASPORTA la sostanza organica (che sta in superficie), non la accumula. Tutti gli altri sono danni reali dell'erosione." },

    { id: 19, topic: 'Concimazione e fertilizzanti', q: "Che cos'è un concime organominerale?",
      opts: ['un concime minerale che stimola la crescita degli organi',
             'un formulato con almeno due elementi della fertilità',
             'un formulato con almeno due elementi principali della fertilità',
             'un formulato composto da una componente organica e una inorganica',
             'una componente meccanica dello spandiconcime'], correct: 3,
      why: 'Organo-minerale = miscela di una parte ORGANICA (es. torba, letame) e una parte MINERALE/inorganica (sali nutritivi).' },

    { id: 20, topic: 'Concimazione e fertilizzanti', q: "L'azoto in tessuti maturi di piante",
      opts: ['può superare il 20% nelle annate migliori', 'non è mai presente',
             'è presente tra il 10 e il 13%', "è presente per meno dell'1%", 'è presente tra 1 e 3%'], correct: 4,
      why: "Nei tessuti vegetali maturi l'azoto è tipicamente l'1-3% della sostanza secca." },

    { id: 21, topic: 'Concimazione e fertilizzanti', q: 'Le perdite di azoto durante lo stoccaggio dei liquami avvengono principalmente in forma di',
      opts: ['NH₃', 'Urea', 'N₂O', 'NH₄⁺', 'N₂'], correct: 0,
      why: 'Volatilizzazione ammoniacale: l\'azoto ammoniacale del liquame si perde in aria come ammoniaca (NH₃) gassosa.' },

    { id: 22, topic: 'Concimazione e fertilizzanti', q: 'I compost sono fertilizzanti organici prodotti a seguito di trattamento dei reflui per via',
      opts: ['anaerobica', 'termica', 'idrotermica', 'sistemica', 'aerobica'], correct: 4,
      why: 'Il compostaggio è un processo AEROBICO (in presenza di ossigeno). La via anaerobica dà invece il digestato.' },

    { id: 23, topic: 'Concimazione e fertilizzanti', q: 'La tecnica di distribuzione del fosforo più idonea è',
      opts: ['in copertura con interramento', 'frazionato', 'in post-raccolta',
             'prima della semina o alla semina con interramento', 'in copertura senza interramento'], correct: 3,
      why: 'Il fosforo è poco mobile nel suolo: va interrato in pre-semina/semina, vicino alle radici, dove verrà assorbito.' },

    { id: 24, topic: 'Concimazione e fertilizzanti', q: "Le dosi di impiego del letame si aggirano intorno a",
      opts: ['2 t ha⁻¹', '100 t ha⁻¹', '200 t ha⁻¹', '10 t ha⁻¹', '50 t ha⁻¹'], correct: 4,
      why: 'La dose tipica di letame è dell\'ordine di alcune decine di t/ha: ~50 t ha⁻¹ (spesso 30-50).' },

    { id: 25, topic: 'Concimazione e fertilizzanti', q: 'Quale concime azotato ha il titolo più basso?',
      opts: ['nitrato di calcio', 'ammoniaca anidra', 'nitrato ammonico', 'solfato ammonico', 'Urea'], correct: 0,
      why: 'Nitrato di calcio ~15% N: il più basso. Confronto: urea ~46%, ammoniaca anidra ~82%, nitrato ammonico ~26-34%, solfato ammonico ~21%.' },

    { id: 26, topic: 'Concimazione e fertilizzanti', q: 'I concimi sono',
      opts: ['sostanze che permettono la coltivazione fuori areale',
             'sostanze che migliorano la disponibilità di nutrienti già presenti',
             'sostanze impiegate solo per apportare sostanza organica',
             'sostanze in grado di apportare elementi nutritivi utili per le piante',
             'sostanze solo in grado di migliorare la struttura'], correct: 3,
      why: 'Concime = apporta elementi nutritivi. Chi migliora la STRUTTURA è l\'ammendante; chi corregge il pH è il correttivo.' },

    { id: 27, topic: 'Concimazione e fertilizzanti', q: 'I digestati sono fertilizzanti organici prodotti a seguito di trattamento dei reflui per via',
      opts: ['gravimetrica', 'idrolitica', 'anaerobica', 'termica', 'aerobica'], correct: 2,
      why: 'Il digestato è il residuo della digestione ANAEROBICA (produzione di biogas). Il compost invece è aerobico.' },

    { id: 28, topic: 'Concimazione e fertilizzanti', q: 'Il liquame è costituito da',
      opts: ['solamente dai residui di lettiera', 'deiezioni solide e liquide',
             'deiezioni solide e liquide e lettiera', 'solamente da deiezioni solide',
             'deiezioni solide e liquide e acque di lavaggio'], correct: 4,
      why: 'Liquame = deiezioni solide e liquide + acque di lavaggio (senza lettiera). Con la lettiera si ha invece il letame.' },

    { id: 29, topic: 'Concimazione e fertilizzanti', q: "Efficienza d'uso media dell'azoto minerale distribuito in copertura?",
      opts: ['0,45', '0,8', '0,2', '0,65', '1,2'], correct: 1,
      why: 'In copertura l\'azoto è dato quando la coltura ne ha bisogno: alta efficienza d\'uso, intorno a 0,8 (80%).' },

    { id: 30, topic: 'Concimazione e fertilizzanti', q: "«L'azoto è un elemento molto mobile nel terreno»",
      opts: ['dipende dalla radiazione incidente', 'dipende dalla coltura', 'vero',
             'dipende dal pH del terreno', 'falso'], correct: 2,
      why: 'Vero: l\'azoto nitrico (NO₃⁻) è molto mobile, si muove con l\'acqua ed è facilmente dilavabile (lisciviazione).' },

    { id: 31, topic: 'Concimazione e fertilizzanti', q: 'Quanto azoto si apporta complessivamente con una letamazione (valore di riferimento del corso)?',
      opts: ['400 kg ha⁻¹', '50 kg ha⁻¹', '200 kg ha⁻¹', '800 kg ha⁻¹', '22 kg ha⁻¹'], correct: 2,
      why: 'Apporto N = dose × titolo azotato del letame (~0,5%). Il valore di riferimento indicato è ~200 kg N ha⁻¹.' },

    { id: 32, topic: 'Concimazione e fertilizzanti', q: 'Il titolo dei concimi azotati è espresso in % di',
      opts: ['NH₃', 'contenuto di N moltiplicato per 2 (N₂)', 'solo azoto non volatilizzato', 'N', 'NO₃⁻'], correct: 3,
      why: 'L\'azoto si esprime come ELEMENTO (N). Fosforo e potassio invece come ossidi (P₂O₅, K₂O).' },

    { id: 33, topic: 'Agrotecnica e rotazioni', q: 'Che cosa favorisce la biodiversità in un sistema agricolo consociato?',
      opts: ['coltivazione di una sola specie', 'presenza di piante geneticamente differenti',
             'riduzione della diversità microbica', 'uso esclusivo di fertilizzanti minerali',
             'eliminazione delle piante infestanti'], correct: 1,
      why: 'La consociazione mette insieme specie/piante geneticamente diverse: più diversità sopra e sotto il suolo.' },

    { id: 34, topic: 'Agrotecnica e rotazioni', q: 'Che cosa si intende per consociazione agraria o policoltura?',
      opts: ['coltivazione alternata di piante nello stesso appezzamento',
             'metodo di rotazione delle colture', 'coltivazione intensiva di una sola specie',
             'uso esclusivo di fertilizzanti chimici',
             'coltivazione contemporanea di piante geneticamente differenti nello stesso appezzamento'], correct: 4,
      why: 'Consociazione = più specie CONTEMPORANEAMENTE sullo stesso appezzamento. La coltivazione "alternata nel tempo" è invece la rotazione.' },

    { id: 35, topic: 'Agrotecnica e rotazioni', q: 'Quale avvicendamento è una rotazione quadriennale?',
      opts: ['Frumento-soia-mais-mais', 'Prato (3 anni)-mais-frumento-mais',
             'Loiessa-mais-loiessa-mais', 'Loiessa-mais-frumento-barbabietola', 'Orzo-panico-loiessa-mais'], correct: 0,
      why: 'Quadriennale = ciclo che si ripete ogni 4 anni con 4 colture nelle 4 annate: Frumento-soia-mais-mais.' },

    { id: 36, topic: 'Difesa, diserbo e lavorazioni', q: 'A cosa servono gli antidoti agronomici (safener)?',
      opts: ['a rendere selettivo un erbicida nei confronti di una coltura',
             'a rendere una coltura resistente ai patogeni fungini',
             'a rallentare la mineralizzazione della sostanza organica',
             "a impedire un eccessivo assorbimento di azoto",
             'a rendere edibili frutti con alcaloidi'], correct: 0,
      why: 'Il safener protegge la coltura dall\'erbicida, rendendolo SELETTIVO: colpisce le infestanti ma non la coltura.' },

    { id: 37, topic: 'Difesa, diserbo e lavorazioni', q: 'Che cosa è la banca dei semi?',
      opts: ['semi di diverse cultivar coltivate presenti nel terreno', 'la dose 50% dei semi totali',
             'un sito web per acquistare semi di malerbe', 'la quantità di semi germinati ogni anno',
             'il contenuto nel terreno di semi di diverse piante infestanti'], correct: 4,
      why: 'La "seed bank" del suolo è la riserva di semi di INFESTANTI presenti nel terreno, pronti a germinare negli anni.' },

    { id: 38, topic: 'Difesa, diserbo e lavorazioni', q: 'Che cosa significa diserbo in post-emergenza?',
      opts: ["dopo l'emergenza della coltura, ad azione antigerminello",
             'trattamento preventivo prima della germinazione delle infestanti',
             'un diserbo eseguito su malerbe emerse', 'uso di erbicidi solo dopo la raccolta',
             'un diserbo tra le file delle colture'], correct: 2,
      why: 'Post-emergenza = si interviene quando le malerbe sono già EMERSE (visibili). Pre-emergenza = prima che spuntino.' },

    { id: 39, topic: 'Difesa, diserbo e lavorazioni', q: 'Le lavorazioni conservative favoriscono',
      opts: ['la respirazione del suolo', 'l\'aumento di sostanza organica in profondità',
             'l\'aumento di sostanza organica lungo tutto il profilo',
             'l\'aumento del contenuto di sostanza organica dei suoli in superficie',
             'la diminuzione della sostanza organica'], correct: 3,
      why: 'Con la minima lavorazione i residui restano in SUPERFICIE e vi si accumula sostanza organica (non rimescolata in profondità).' },

    { id: 40, topic: 'Difesa, diserbo e lavorazioni', q: "Con quale intervento meccanico si migliora l'uniformità di distribuzione dei residui in superficie?",
      opts: ['rincalzatura', 'irrigazione', 'sarchiatura', 'trinciatura', 'rullatura'], correct: 3,
      why: 'La trinciatura sminuzza i residui colturali e li distribuisce in modo uniforme sulla superficie.' },
  ];

  const TOPICS = ['Clima e acqua', 'Suolo: struttura e acqua', 'Sistemazioni ed erosione',
    'Concimazione e fertilizzanti', 'Agrotecnica e rotazioni', 'Difesa, diserbo e lavorazioni'];

  // ── Storage ──────────────────────────────────────────────────────────
  function load() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || '{}');
      o.wrong = o.wrong || {}; o.seen = o.seen || {}; o.history = o.history || [];
      return o;
    } catch (e) { return { wrong: {}, seen: {}, history: [] }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  let store = load();

  function recordAnswer(qid, ok) {
    store.seen[qid] = (store.seen[qid] || 0) + 1;
    if (ok) { if (store.wrong[qid]) delete store.wrong[qid]; }
    else store.wrong[qid] = (store.wrong[qid] || 0) + 1;
  }
  function wrongIds() { return Object.keys(store.wrong).map(Number); }

  // ── Utility ──────────────────────────────────────────────────────────
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Prepara una domanda "giocabile": opzioni mescolate, salvando dov'è la giusta.
  function prep(qorig) {
    const order = shuffle(qorig.opts.map((_, i) => i));
    return {
      ref: qorig,
      opts: order.map(i => qorig.opts[i]),
      correct: order.indexOf(qorig.correct),
    };
  }

  // ── Stato sessione ───────────────────────────────────────────────────
  let queue = [], qIndex = 0, mode = 'exam', answers = [], answered = false;

  // ── UI: costruzione ──────────────────────────────────────────────────
  function buildUI() {
    const openBtn = document.createElement('button');
    openBtn.className = 'header-btn esame-btn';
    openBtn.id = 'esameOpenBtn';
    openBtn.title = "Simulazione d'esame con le domande reali";
    openBtn.textContent = 'Esame';
    const anchor = document.getElementById('srsOpenBtn') || document.getElementById('graphOpenBtn');
    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(openBtn, anchor.nextSibling);
    else { const ha = document.querySelector('.header-actions'); if (ha) ha.insertBefore(openBtn, ha.firstChild); }
    openBtn.addEventListener('click', openHome);

    const ov = document.createElement('div');
    ov.className = 'esame-overlay';
    ov.id = 'esameOverlay';
    ov.innerHTML =
      '<div class="esame-modal" role="dialog" aria-modal="true" aria-label="Simulazione d\'esame">' +
        '<button class="esame-close" id="esameClose" aria-label="Chiudi">&times;</button>' +
        '<div class="esame-progress"><div class="esame-progress-bar" id="esameProgressBar"></div></div>' +
        '<div class="esame-counter" id="esameCounter"></div>' +
        '<div class="esame-stage" id="esameStage"></div>' +
      '</div>';
    document.body.appendChild(ov);
    document.getElementById('esameClose').addEventListener('click', close);
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && ov.classList.contains('is-open')) close();
    });
  }

  function setProgress(pct) {
    const bar = document.getElementById('esameProgressBar');
    if (bar) bar.style.width = pct + '%';
  }
  function stageEl() { return document.getElementById('esameStage'); }

  // ── Home (scelta modalità) ───────────────────────────────────────────
  function openHome() {
    document.getElementById('esameOverlay').classList.add('is-open');
    document.documentElement.classList.add('modal-open');
    renderHome();
  }
  function close() {
    document.getElementById('esameOverlay').classList.remove('is-open');
    document.documentElement.classList.remove('modal-open');
  }

  function renderHome() {
    setProgress(0);
    document.getElementById('esameCounter').textContent = '';
    const nWrong = wrongIds().length;
    const best = store.best;
    const topicChips = TOPICS.map(t => {
      const ids = BANK.filter(q => q.topic === t);
      return '<button class="esame-topic" data-topic="' + escapeHtml(t) + '">' +
        escapeHtml(t) + ' <span class="esame-topic-n">' + ids.length + '</span></button>';
    }).join('');

    stageEl().innerHTML =
      '<div class="esame-home">' +
        '<h2 class="esame-h">Preparazione all\'esame</h2>' +
        '<p class="esame-sub">' + BANK.length + ' domande reali dell\'appello del 24 giugno 2026.</p>' +
        (best ? '<div class="esame-best">Miglior punteggio: <strong>' + best.score + '/' + best.total + '</strong></div>' : '') +
        '<div class="esame-modes">' +
          '<button class="esame-mode esame-mode-exam" id="esameStartExam">' +
            '<span class="esame-mode-t">Simulazione d\'esame</span>' +
            '<span class="esame-mode-d">Tutte le ' + BANK.length + ' domande mescolate. Punteggio finale, come il vero esame.</span>' +
          '</button>' +
          (nWrong ? '<button class="esame-mode esame-mode-wrong" id="esameStartWrong">' +
            '<span class="esame-mode-t">Ripassa i tuoi errori <span class="esame-badge">' + nWrong + '</span></span>' +
            '<span class="esame-mode-d">Solo le domande che hai sbagliato nelle prove precedenti.</span>' +
          '</button>' : '') +
        '</div>' +
        '<div class="esame-train">' +
          '<div class="esame-train-t">Allenamento per argomento <span class="esame-train-d">(feedback subito dopo ogni risposta)</span></div>' +
          '<div class="esame-topics">' +
            '<button class="esame-topic esame-topic-all" data-topic="__all">Tutti gli argomenti <span class="esame-topic-n">' + BANK.length + '</span></button>' +
            topicChips +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('esameStartExam').addEventListener('click', () => startExam());
    const w = document.getElementById('esameStartWrong');
    if (w) w.addEventListener('click', () => startWrong());
    stageEl().querySelectorAll('.esame-topic').forEach(b => {
      b.addEventListener('click', () => {
        const t = b.getAttribute('data-topic');
        startTrain(t === '__all' ? null : t);
      });
    });
  }

  // ── Avvii ────────────────────────────────────────────────────────────
  function startExam() {
    mode = 'exam';
    queue = shuffle(BANK).map(prep);
    beginSession();
  }
  function startWrong() {
    mode = 'train';
    const ids = new Set(wrongIds());
    queue = shuffle(BANK.filter(q => ids.has(q.id))).map(prep);
    beginSession();
  }
  function startTrain(topic) {
    mode = 'train';
    const pool = topic ? BANK.filter(q => q.topic === topic) : BANK;
    queue = shuffle(pool).map(prep);
    beginSession();
  }
  function beginSession() {
    qIndex = 0; answers = []; answered = false;
    if (!queue.length) { renderHome(); return; }
    renderQuestion();
  }

  // ── Rendering domanda ────────────────────────────────────────────────
  function renderQuestion() {
    answered = false;
    const item = queue[qIndex];
    setProgress(Math.round((qIndex / queue.length) * 100));
    document.getElementById('esameCounter').textContent =
      (qIndex + 1) + ' / ' + queue.length + (mode === 'exam' ? '  ·  Simulazione' : '  ·  Allenamento');

    const opts = item.opts.map((o, i) =>
      '<button class="esame-opt" data-i="' + i + '">' +
        '<span class="esame-opt-l">' + LETTERS[i] + '</span>' +
        '<span class="esame-opt-x">' + escapeHtml(o) + '</span>' +
      '</button>').join('');

    stageEl().innerHTML =
      '<div class="esame-q">' +
        '<div class="esame-q-topic">' + escapeHtml(item.ref.topic) + '</div>' +
        '<h3 class="esame-q-text">' + escapeHtml(item.ref.q) + '</h3>' +
        '<div class="esame-opts" id="esameOpts">' + opts + '</div>' +
        '<div class="esame-explain" id="esameExplain" hidden></div>' +
        '<div class="esame-nav" id="esameNav"></div>' +
      '</div>';

    stageEl().querySelectorAll('.esame-opt').forEach(b => {
      b.addEventListener('click', () => choose(parseInt(b.getAttribute('data-i'), 10)));
    });
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    const item = queue[qIndex];
    const ok = (i === item.correct);
    answers.push({ item: item, chosen: i, ok: ok });
    recordAnswer(item.ref.id, ok);
    save();

    const optBtns = stageEl().querySelectorAll('.esame-opt');

    if (mode === 'exam') {
      // Nessun feedback: segna solo la scelta e vai avanti.
      optBtns.forEach((b, idx) => {
        b.disabled = true;
        if (idx === i) b.classList.add('is-chosen');
      });
      renderNav();
      return;
    }

    // Allenamento: feedback immediato + spiegazione.
    optBtns.forEach((b, idx) => {
      b.disabled = true;
      if (idx === item.correct) b.classList.add('is-correct');
      if (idx === i && !ok) b.classList.add('is-wrong');
    });
    const ex = document.getElementById('esameExplain');
    ex.innerHTML =
      '<div class="esame-verdict ' + (ok ? 'ok' : 'no') + '">' + (ok ? 'Corretto' : 'Sbagliato') + '</div>' +
      '<div class="esame-why"><strong>' + LETTERS[item.correct] + '.</strong> ' + escapeHtml(item.opts[item.correct]) +
        '<div class="esame-why-t">' + escapeHtml(item.ref.why) + '</div></div>';
    ex.hidden = false;
    renderNav();
  }

  function renderNav() {
    const nav = document.getElementById('esameNav');
    const last = (qIndex === queue.length - 1);
    nav.innerHTML = '<button class="esame-next" id="esameNext">' +
      (last ? 'Vedi risultato' : 'Avanti') + '</button>';
    document.getElementById('esameNext').addEventListener('click', next);
  }

  function next() {
    qIndex++;
    if (qIndex >= queue.length) return finish();
    renderQuestion();
  }

  // ── Risultato ────────────────────────────────────────────────────────
  function finish() {
    setProgress(100);
    document.getElementById('esameCounter').textContent = '';
    const total = answers.length;
    const score = answers.filter(a => a.ok).length;
    const ratio = total ? score / total : 0;
    const passed = ratio >= PASS_RATIO;

    store.history.push({ at: Date.now(), mode: mode, score: score, total: total });
    if (mode === 'exam' && (!store.best || score > store.best.score ||
        (score === store.best.score && total > store.best.total))) {
      store.best = { score: score, total: total, at: Date.now() };
    }
    save();

    const wrong = answers.filter(a => !a.ok);
    const reviewHTML = wrong.length ? (
      '<div class="esame-review">' +
        '<div class="esame-review-h">Da rivedere (' + wrong.length + '):</div>' +
        wrong.map(a =>
          '<div class="esame-review-item">' +
            '<div class="esame-review-q">' + escapeHtml(a.item.ref.q) + '</div>' +
            '<div class="esame-review-a esame-review-yours">La tua: ' +
              escapeHtml(a.item.opts[a.chosen]) + '</div>' +
            '<div class="esame-review-a esame-review-right">Giusta: ' +
              escapeHtml(a.item.opts[a.item.correct]) + '</div>' +
            '<div class="esame-review-why">' + escapeHtml(a.item.ref.why) + '</div>' +
          '</div>').join('') +
      '</div>'
    ) : '<div class="esame-allright">Tutte corrette! 🎉</div>';

    stageEl().innerHTML =
      '<div class="esame-result">' +
        '<div class="esame-score-ring ' + (passed ? 'pass' : 'fail') + '">' +
          '<span class="esame-score-n">' + score + '/' + total + '</span>' +
          '<span class="esame-score-pct">' + Math.round(ratio * 100) + '%</span>' +
        '</div>' +
        '<div class="esame-verdict-big ' + (passed ? 'ok' : 'no') + '">' +
          (passed ? 'Saresti promosso' : 'Non ancora sufficiente') +
          (mode === 'exam' ? ' <span class="esame-thr">(soglia ~' + Math.ceil(total * PASS_RATIO) + '/' + total + ')</span>' : '') +
        '</div>' +
        reviewHTML +
        '<div class="esame-result-actions">' +
          (wrong.length ? '<button class="esame-next" id="esameRetryWrong">Riprova le sbagliate</button>' : '') +
          '<button class="esame-secondary" id="esameHomeBtn">Torna al menu</button>' +
        '</div>' +
      '</div>';

    const rw = document.getElementById('esameRetryWrong');
    if (rw) rw.addEventListener('click', () => {
      mode = 'train';
      queue = shuffle(wrong.map(a => a.item.ref)).map(prep);
      beginSession();
    });
    document.getElementById('esameHomeBtn').addEventListener('click', renderHome);
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() { buildUI(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

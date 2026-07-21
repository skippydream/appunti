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
  const EXAM_SIZE = 40;     // domande per simulazione (come l'esame reale)

  // ── Banca domande ────────────────────────────────────────────────────
  // correct = indice (0-based) della risposta giusta nell'array opts.
  // REAL = le 40 domande REALI dell'appello (real:true).
  // GEN  = domande generate sullo stesso modello (real:false).
  const REAL = [
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

  // ── Domande generate sullo stesso modello (id 1001+) ──────────────────
  const GEN = [
    // Clima e acqua
    { id: 1001, topic: 'Clima e acqua', q: '5 mm di pioggia caduti su 1 ettaro corrispondono a',
      opts: ['50 m³', '5 m³', '500 m³', '0,5 m³'], correct: 0,
      why: '1 mm = 1 L/m² = 10 m³/ha. Quindi 5 mm = 50 m³ per ettaro (50.000 litri).' },
    { id: 1002, topic: 'Clima e acqua', q: '10 mm di pioggia su 3 ettari corrispondono a',
      opts: ['300 m³', '30 m³', '3.000 m³', '100 m³'], correct: 0,
      why: '10 mm = 100 m³/ha. Su 3 ettari: 100 × 3 = 300 m³.' },
    { id: 1003, topic: 'Clima e acqua', q: 'Le gelate per irraggiamento sono favorite da',
      opts: ['notti serene, calme e con aria secca', 'cielo coperto e vento forte', 'giornate afose e umide', 'pioggia battente'], correct: 0,
      why: 'Con cielo limpido e assenza di vento il suolo perde calore per irraggiamento e si raffredda sotto zero. Nuvole e vento lo impediscono.' },
    { id: 1004, topic: 'Clima e acqua', q: "L'inversione termica al suolo si verifica tipicamente",
      opts: ['di notte con cielo sereno', 'di giorno con forte sole', 'durante i temporali estivi', "quando c'è vento forte"], correct: 0,
      why: "Di notte, con cielo sereno, l'aria a contatto col suolo freddo diventa più fredda di quella sovrastante: la temperatura cresce con la quota." },
    { id: 1005, topic: 'Clima e acqua', q: "L'umidità relativa dell'aria è generalmente MASSIMA",
      opts: ["prima dell'alba", 'nel primo pomeriggio', 'a mezzogiorno', 'nel tardo pomeriggio'], correct: 0,
      why: "Alla temperatura minima (prima dell'alba) l'aria è più vicina alla saturazione: umidità relativa massima." },
    { id: 1006, topic: 'Clima e acqua', q: "A parità di vapore acqueo, se la temperatura aumenta, l'umidità relativa",
      opts: ['diminuisce', 'aumenta', 'resta invariata', 'diventa 100%'], correct: 0,
      why: "L'aria calda può contenere più vapore: a pari vapore assoluto è meno satura, quindi l'umidità relativa cala." },
    { id: 1007, topic: 'Clima e acqua', q: 'Nel clima mediterraneo le precipitazioni si concentrano',
      opts: ['in autunno-inverno', 'in piena estate', "in modo uniforme tutto l'anno", 'solo in primavera'], correct: 0,
      why: 'Estate calda e siccitosa, piogge nella stagione fredda: è il tratto tipico del clima mediterraneo.' },
    { id: 1008, topic: 'Clima e acqua', q: "L'evapotraspirazione potenziale (ETP) dipende soprattutto da",
      opts: ["radiazione, temperatura, vento e umidità dell'aria", 'tessitura del suolo', 'profondità delle radici', 'contenuto di humus'], correct: 0,
      why: "L'ETP misura la domanda evaporativa dell'atmosfera. L'evapotraspirazione reale dipende anche dall'acqua disponibile e dalla coltura." },
    { id: 1009, topic: 'Clima e acqua', q: 'Il bilancio idrico di un terreno è in deficit quando',
      opts: ["l'evapotraspirazione supera le precipitazioni", "le piogge superano l'evapotraspirazione", "il suolo è saturo d'acqua", 'non evapora acqua'], correct: 0,
      why: 'Se ET > P il suolo perde più acqua di quanta ne riceve: serve irrigazione per colmare il deficit.' },
    { id: 1010, topic: 'Clima e acqua', q: 'La brina si forma quando il vapore acqueo',
      opts: ['sublima passando direttamente a ghiaccio su superfici sotto 0 °C', 'condensa in rugiada liquida', 'evapora rapidamente', 'si scioglie'], correct: 0,
      why: 'Sotto lo zero il vapore passa direttamente allo stato solido (brina) sulle superfici fredde.' },
    { id: 1011, topic: 'Clima e acqua', q: 'Un ettaro corrisponde a',
      opts: ['10.000 m²', '1.000 m²', '100.000 m²', '100 m²'], correct: 0,
      why: '1 ha = 100 m × 100 m = 10.000 m². È la base delle conversioni pioggia→volume.' },
    { id: 1012, topic: 'Clima e acqua', q: 'La radiazione utile alla fotosintesi (PAR) corrisponde',
      opts: ['alla luce visibile (~400-700 nm)', 'agli infrarossi', 'agli ultravioletti', 'alle onde radio'], correct: 0,
      why: 'La PAR (radiazione fotosinteticamente attiva) è la frazione visibile dello spettro solare.' },

    // Suolo: struttura e acqua
    { id: 1013, topic: 'Suolo: struttura e acqua', q: 'La tessitura di un terreno è definita da',
      opts: ['le percentuali di sabbia, limo e argilla', 'il modo in cui le particelle si aggregano', 'il contenuto di sostanza organica', 'la porosità totale'], correct: 0,
      why: "Tessitura = granulometria (sabbia/limo/argilla). L'aggregazione delle particelle è invece la struttura." },
    { id: 1014, topic: 'Suolo: struttura e acqua', q: 'La capacità di campo corrisponde a un potenziale idrico di circa',
      opts: ['−0,33 bar (−33 kPa)', '−15 bar', '−100 bar', '0 bar'], correct: 0,
      why: "È l'acqua trattenuta dopo che è drenata quella gravitazionale: circa −0,33 bar." },
    { id: 1015, topic: 'Suolo: struttura e acqua', q: 'Il punto di appassimento permanente corrisponde a circa',
      opts: ['−15 bar (−1500 kPa)', '−0,33 bar', '−1 bar', '0 bar'], correct: 0,
      why: "Oltre questa tensione le piante non riescono più ad assorbire l'acqua residua." },
    { id: 1016, topic: 'Suolo: struttura e acqua', q: "L'acqua disponibile per le piante è quella compresa tra",
      opts: ['capacità di campo e punto di appassimento', 'saturazione e capacità di campo', 'zero e saturazione', 'punto di appassimento e secco assoluto'], correct: 0,
      why: "Tra capacità di campo e punto di appassimento l'acqua è trattenuta ma ancora assorbibile dalle radici." },
    { id: 1017, topic: 'Suolo: struttura e acqua', q: 'La densità apparente di un tipico suolo agrario è circa',
      opts: ['1,3 g/cm³', '2,65 g/cm³', '0,5 g/cm³', '5 g/cm³'], correct: 0,
      why: 'La densità apparente (suolo + pori) è ~1,2-1,4. La densità reale delle sole particelle è ~2,65.' },
    { id: 1018, topic: 'Suolo: struttura e acqua', q: 'La densità reale delle particelle minerali del suolo è circa',
      opts: ['2,65 g/cm³', '1,3 g/cm³', '1,0 g/cm³', '0,8 g/cm³'], correct: 0,
      why: 'Valore medio dei minerali del suolo (quarzo, silicati). Serve a calcolare la porosità.' },
    { id: 1019, topic: 'Suolo: struttura e acqua', q: 'Un suolo con densità apparente 1,3 e densità reale 2,6 ha porosità totale',
      opts: ['50%', '20%', '80%', '13%'], correct: 0,
      why: 'Porosità = 1 − (Da/Dr) = 1 − 1,3/2,6 = 0,5 = 50%.' },
    { id: 1020, topic: 'Suolo: struttura e acqua', q: 'Un residuo con rapporto C/N basso (leguminose giovani) va incontro a',
      opts: ['mineralizzazione rapida con rilascio di azoto', "immobilizzazione dell'azoto", 'nessuna trasformazione', 'accumulo di humus stabile'], correct: 0,
      why: "Poco carbonio rispetto all'azoto: i microbi decompongono in fretta e liberano azoto minerale." },
    { id: 1021, topic: 'Suolo: struttura e acqua', q: "L'immobilizzazione dell'azoto avviene con residui a rapporto C/N",
      opts: ['elevato (es. paglia di cereali)', 'molto basso', 'nullo', 'pari a 1'], correct: 0,
      why: "Con molto carbonio i microbi consumano l'azoto minerale del suolo per decomporlo: l'N resta temporaneamente indisponibile." },
    { id: 1022, topic: 'Suolo: struttura e acqua', q: "L'orizzonte superficiale costituito da sostanza organica è indicato con",
      opts: ['O', 'C', 'B', 'R'], correct: 0,
      why: 'O = orizzonte organico. A = minerale-organico (Ap se lavorato), B = accumulo, C = substrato, R = roccia.' },
    { id: 1023, topic: 'Suolo: struttura e acqua', q: "L'orizzonte C di un profilo di suolo è",
      opts: ['il substrato minerale poco alterato', 'lo strato lavorato in superficie', "l'orizzonte organico", "l'orizzonte di massimo accumulo"], correct: 0,
      why: 'Il C è il materiale parentale che sta sotto gli orizzonti pedogenizzati (A, E, B).' },
    { id: 1024, topic: 'Suolo: struttura e acqua', q: 'I macropori del suolo servono soprattutto per',
      opts: ["la circolazione dell'aria e il drenaggio", "la ritenzione dell'acqua", 'lo scambio cationico', 'la fotosintesi'], correct: 0,
      why: "I macropori danno aria e drenaggio; sono i micropori a trattenere l'acqua utile." },
    { id: 1025, topic: 'Suolo: struttura e acqua', q: "L'humus è",
      opts: ['sostanza organica stabile, colloidale e scura', 'residui vegetali freschi', 'la frazione sabbiosa', 'un sale minerale'], correct: 0,
      why: "Prodotto finale dell'umificazione: migliora struttura, ritenzione idrica e capacità di scambio." },
    { id: 1026, topic: 'Suolo: struttura e acqua', q: 'Un eccesso di sodio scambiabile sulla struttura del terreno',
      opts: ['la degrada, disperdendo gli aggregati', 'la migliora', 'non ha alcun effetto', 'aumenta i macropori'], correct: 0,
      why: 'Il sodio disperde i colloidi: suoli sodici compatti, asfittici e poco strutturati.' },
    { id: 1027, topic: 'Suolo: struttura e acqua', q: 'Il calcio favorisce la struttura del terreno perché',
      opts: ['flocculca i colloidi in aggregati stabili', 'disperde le argille', 'acidifica il suolo', "scioglie l'humus"], correct: 0,
      why: 'Il Ca fa da ponte tra i colloidi (flocculazione) → struttura grumosa stabile.' },
    { id: 1028, topic: 'Suolo: struttura e acqua', q: 'A parità di condizioni trattiene più acqua un terreno',
      opts: ['argilloso', 'sabbioso', 'ghiaioso', 'roccioso'], correct: 0,
      why: "L'argilla ha tanti micropori e altissima superficie specifica: trattiene molta più acqua della sabbia." },
    { id: 1029, topic: 'Suolo: struttura e acqua', q: 'La capacità di scambio cationico (CSC) è più alta nei terreni',
      opts: ['ricchi di argilla e sostanza organica', 'sabbiosi', 'poveri di humus', 'ghiaiosi'], correct: 0,
      why: 'I colloidi (argilla e humus) sono carichi negativamente e trattengono i cationi nutritivi.' },
    { id: 1030, topic: 'Suolo: struttura e acqua', q: 'La sostanza organica del suolo, mineralizzandosi,',
      opts: ['libera elementi nutritivi (N, P, S) in forma minerale', 'li immobilizza per sempre', 'non rilascia nulla', 'produce solo argilla'], correct: 0,
      why: "La mineralizzazione trasforma l'organico in forme minerali assorbibili dalle piante." },

    // Sistemazioni ed erosione
    { id: 1031, topic: 'Sistemazioni ed erosione', q: 'La baulatura del campo serve a',
      opts: ["allontanare l'acqua in eccesso verso le scoline laterali", "trattenere l'acqua al centro del campo", 'concimare il terreno', 'aumentare la pendenza'], correct: 0,
      why: "La superficie convessa (a schiena d'asino) fa scolare l'acqua dal centro ai lati." },
    { id: 1032, topic: 'Sistemazioni ed erosione', q: 'In un terreno sabbioso e molto permeabile le scoline possono essere',
      opts: ['più distanti tra loro', 'molto più ravvicinate', 'del tutto assenti per legge', "sostituite dall'aratura"], correct: 0,
      why: 'Il sabbioso drena in fretta: serve meno rete scolante rispetto all\'argilloso, che drena lento.' },
    { id: 1033, topic: 'Sistemazioni ed erosione', q: "L'erosione idrica aumenta all'aumentare",
      opts: ['della pendenza del versante', 'della copertura vegetale', 'della sostanza organica', 'della rugosità del suolo'], correct: 0,
      why: 'Più pendenza → deflusso più veloce e più energia erosiva.' },
    { id: 1034, topic: 'Sistemazioni ed erosione', q: "La copertura vegetale del suolo, rispetto all'erosione,",
      opts: ["la riduce, proteggendo dall'impatto della pioggia", 'la aumenta', 'è del tutto indifferente', 'la rende incanalata'], correct: 0,
      why: 'La vegetazione intercetta le gocce e le radici trattengono il terreno: meno erosione.' },
    { id: 1035, topic: 'Sistemazioni ed erosione', q: 'La sistemazione «a rittochino» dispone i filari',
      opts: ['secondo la linea di massima pendenza', 'lungo le curve di livello', 'in cerchi concentrici', 'a caso'], correct: 0,
      why: 'Comoda per la meccanizzazione ma più erosiva del girapoggio (che segue le curve di livello).' },
    { id: 1036, topic: 'Sistemazioni ed erosione', q: 'Il «girapoggio» dispone i filari',
      opts: ['lungo le curve di livello', 'a massima pendenza', 'in verticale', 'senza criterio'], correct: 0,
      why: 'Seguendo le curve di livello rallenta il deflusso e riduce l\'erosione.' },
    { id: 1037, topic: 'Sistemazioni ed erosione', q: 'Le colture di copertura (cover crop) tra due cicli',
      opts: ['proteggono il suolo e riducono il dilavamento dei nitrati', "aumentano l'erosione", 'impoveriscono sempre il terreno', 'compattano il suolo'], correct: 0,
      why: 'Coprono il suolo nudo, lo proteggono dalla pioggia e assorbono i nutrienti residui.' },
    { id: 1038, topic: 'Sistemazioni ed erosione', q: "L'energia erosiva della pioggia dipende soprattutto da",
      opts: ['intensità della pioggia e dimensione delle gocce', "temperatura dell'aria", 'umidità relativa', 'ora del giorno'], correct: 0,
      why: 'Piogge intense e a gocce grosse (battenti) staccano più particelle di suolo.' },
    { id: 1039, topic: 'Sistemazioni ed erosione', q: 'I terrazzamenti sono una sistemazione adatta a versanti',
      opts: ['molto acclivi (forte pendenza)', 'pianeggianti', 'paludosi', 'sabbiosi pianeggianti'], correct: 0,
      why: 'Trasformano pendii ripidi in ripiani coltivabili, riducendo la lunghezza del versante.' },
    { id: 1040, topic: 'Sistemazioni ed erosione', q: "L'erosione incanalata (solchi e fossi) si genera quando",
      opts: ['il deflusso superficiale si concentra in canali', 'la pioggia è leggera e uniforme', 'il suolo è ben coperto', 'il terreno è pianeggiante'], correct: 0,
      why: "L'acqua che si concentra scava rills (solchi) e gully (fossi)." },
    { id: 1041, topic: 'Sistemazioni ed erosione', q: 'Le scoline in un appezzamento servono a',
      opts: ['raccogliere e allontanare le acque superficiali in eccesso', 'irrigare le colture', 'concimare', 'delimitare la proprietà'], correct: 0,
      why: 'Sono la rete di drenaggio superficiale che evita ristagni.' },
    { id: 1042, topic: 'Sistemazioni ed erosione', q: "Lavorare il terreno lungo le curve di livello, rispetto all'erosione,",
      opts: ['la riduce', 'la aumenta', 'non cambia nulla', 'la incanala'], correct: 0,
      why: 'I solchi trasversali alla pendenza rallentano e frenano il deflusso.' },

    // Concimazione e fertilizzanti
    { id: 1043, topic: 'Concimazione e fertilizzanti', q: "L'urea ha un titolo di azoto di circa",
      opts: ['46%', '21%', '15%', '82%'], correct: 0,
      why: 'È il concime azotato solido a titolo più alto (~46% N).' },
    { id: 1044, topic: 'Concimazione e fertilizzanti', q: 'Tra i concimi azotati ha il titolo PIÙ ALTO',
      opts: ["l'ammoniaca anidra (~82%)", 'il nitrato di calcio', 'il solfato ammonico', 'il nitrato di sodio'], correct: 0,
      why: "L'ammoniaca anidra è azoto quasi puro (NH₃): titolo altissimo, ~82%." },
    { id: 1045, topic: 'Concimazione e fertilizzanti', q: 'Il titolo in fosforo dei concimi si esprime come',
      opts: ['P₂O₅', 'P elementare', 'H₃PO₄', 'PO₄³⁻'], correct: 0,
      why: 'Per convenzione il fosforo si esprime come anidride fosforica (P₂O₅).' },
    { id: 1046, topic: 'Concimazione e fertilizzanti', q: 'Il titolo in potassio dei concimi si esprime come',
      opts: ['K₂O', 'K elementare', 'KCl', 'K₂SO₄'], correct: 0,
      why: 'Per convenzione il potassio si esprime come ossido (K₂O).' },
    { id: 1047, topic: 'Concimazione e fertilizzanti', q: "L'azoto nitrico (NO₃⁻) nel terreno è",
      opts: ['molto mobile e facilmente dilavabile', 'trattenuto dai colloidi', 'immobile', 'gassoso'], correct: 0,
      why: 'Ha carica negativa: non è trattenuto dai colloidi, si muove con l\'acqua e si lisciva.' },
    { id: 1048, topic: 'Concimazione e fertilizzanti', q: "L'azoto ammoniacale (NH₄⁺) nel terreno è",
      opts: ['trattenuto dai colloidi per scambio cationico', 'molto dilavato', 'sempre gassoso', 'inutile alle piante'], correct: 0,
      why: 'Ha carica positiva: viene adsorbito sui colloidi ed è meno soggetto a lisciviazione.' },
    { id: 1049, topic: 'Concimazione e fertilizzanti', q: 'La nitrificazione trasforma',
      opts: ["l'ammonio (NH₄⁺) in nitrato (NO₃⁻)", "il nitrato in azoto gassoso", "l'azoto organico in humus", 'il nitrato in ammonio'], correct: 0,
      why: 'Processo microbico aerobico (Nitrosomonas → Nitrobacter): NH₄⁺ → NO₂⁻ → NO₃⁻.' },
    { id: 1050, topic: 'Concimazione e fertilizzanti', q: 'La denitrificazione avviene in condizioni',
      opts: ["anaerobiche (suolo saturo d'acqua)", 'aerobiche', 'di siccità', 'di gelo'], correct: 0,
      why: "In assenza di ossigeno i nitrati sono ridotti ad azoto gassoso (N₂) e persi in atmosfera." },
    { id: 1051, topic: 'Concimazione e fertilizzanti', q: 'Un ammendante è una sostanza che',
      opts: ['migliora le proprietà fisiche e la struttura del suolo', 'apporta principalmente azoto', 'corregge il pH', 'diserba'], correct: 0,
      why: 'Es. letame, torba, compost: agiscono sulla struttura. Chi corregge il pH è il correttivo.' },
    { id: 1052, topic: 'Concimazione e fertilizzanti', q: 'Un correttivo serve principalmente a',
      opts: ['modificare il pH del terreno (es. calcitazione)', 'apportare azoto', 'migliorare il drenaggio', 'nutrire i microbi'], correct: 0,
      why: 'Calce per suoli acidi, gesso/zolfo per suoli alcalini.' },
    { id: 1053, topic: 'Concimazione e fertilizzanti', q: 'Il compostaggio è un processo',
      opts: ['aerobico (con ossigeno)', 'anaerobico', 'puramente chimico', 'di essiccazione'], correct: 0,
      why: 'Ossidazione microbica aerobica della sostanza organica. La via anaerobica dà il digestato.' },
    { id: 1054, topic: 'Concimazione e fertilizzanti', q: 'La digestione anaerobica dei reflui produce, oltre al digestato,',
      opts: ['biogas (metano)', 'compost', 'cenere', 'ammoniaca pura'], correct: 0,
      why: 'La fermentazione in assenza di ossigeno genera biogas ricco di metano.' },
    { id: 1055, topic: 'Concimazione e fertilizzanti', q: 'Rispetto al letame, la pollina (deiezioni avicole) è',
      opts: ['più concentrata in azoto', 'molto più povera di nutrienti', 'priva di azoto', 'un concime minerale'], correct: 0,
      why: 'Titolo azotato più elevato: va dosata con attenzione per non eccedere.' },
    { id: 1056, topic: 'Concimazione e fertilizzanti', q: 'Il fosforo nel terreno è',
      opts: ['poco mobile e tende a fissarsi', 'molto mobile come i nitrati', 'gassoso', 'sempre dilavato'], correct: 0,
      why: 'Si lega a calcio, ferro e alluminio: resta vicino a dove è distribuito.' },
    { id: 1057, topic: 'Concimazione e fertilizzanti', q: 'La distribuzione del fosforo più efficace è',
      opts: ['localizzata e interrata in pre-semina', 'in copertura sulla superficie', 'dopo la raccolta', 'sciolta in acqua di pioggia'], correct: 0,
      why: 'Data la scarsa mobilità va portato in profondità, vicino alle radici.' },
    { id: 1058, topic: 'Concimazione e fertilizzanti', q: "L'azoto distribuito «in copertura» viene dato",
      opts: ['durante il ciclo, quando la coltura ne ha più bisogno', 'solo prima della semina', 'dopo la raccolta', 'un anno prima'], correct: 0,
      why: "Sincronizzare l'apporto con l'assorbimento aumenta l'efficienza e riduce le perdite." },
    { id: 1059, topic: 'Concimazione e fertilizzanti', q: 'Il frazionamento della concimazione azotata serve a',
      opts: ['ridurre le perdite per lisciviazione e seguire il fabbisogno', 'aumentare la dose totale', 'risparmiare un passaggio', 'acidificare il suolo'], correct: 0,
      why: 'Più somministrazioni piccole al posto di una grande: meno nitrati persi, più efficienza.' },
    { id: 1060, topic: 'Concimazione e fertilizzanti', q: 'La perdita di azoto per lisciviazione riguarda soprattutto',
      opts: ['i nitrati', "l'ammonio adsorbito", "l'azoto organico", "l'azoto dei residui"], correct: 0,
      why: "I nitrati sono mobili: se non assorbiti scendono con l'acqua verso la falda." },
    { id: 1061, topic: 'Concimazione e fertilizzanti', q: 'La volatilizzazione ammoniacale (perdita di NH₃) è massima quando',
      opts: ['urea o liquami restano in superficie senza interramento', 'si interra subito il concime', 'fa freddo e piove', 'il suolo è acido'], correct: 0,
      why: 'Interrare o irrigare dopo la distribuzione riduce molto le perdite di ammoniaca.' },
    { id: 1062, topic: 'Concimazione e fertilizzanti', q: 'Il liquame differisce dal letame perché',
      opts: ['è privo di lettiera (non palabile)', 'contiene più paglia', 'è sempre solido', 'non contiene azoto'], correct: 0,
      why: 'Letame = deiezioni + lettiera (palabile); liquame = deiezioni + acque di lavaggio (fluido).' },
    { id: 1063, topic: 'Concimazione e fertilizzanti', q: 'Le leguminose arricchiscono il terreno di azoto grazie a',
      opts: ["la fissazione simbiotica dell'azoto atmosferico (rizobi)", 'la concimazione minerale', 'la sola fotosintesi', "l'assorbimento dei nitrati"], correct: 0,
      why: "I noduli radicali con Rhizobium fissano l'N₂ dell'aria rendendolo disponibile." },
    { id: 1064, topic: 'Concimazione e fertilizzanti', q: 'Il perfosfato è un concime',
      opts: ['fosfatico', 'azotato', 'potassico', 'organico'], correct: 0,
      why: 'Si ottiene trattando la roccia fosfatica con acido: apporta fosforo (P₂O₅).' },
    { id: 1065, topic: 'Concimazione e fertilizzanti', q: 'La calcitazione (apporto di calcare) serve a',
      opts: ["correggere l'acidità alzando il pH di suoli acidi", 'acidificare il terreno', 'apportare azoto', 'aumentare la salinità'], correct: 0,
      why: "Il carbonato di calcio neutralizza l'acidità e migliora la struttura." },
    { id: 1066, topic: 'Concimazione e fertilizzanti', q: 'Un concime complesso con titolo 15-15-15 apporta',
      opts: ['15% di N, 15% di P₂O₅ e 15% di K₂O', '15 kg totali di nutrienti', '45% di azoto', '15% di sola sostanza organica'], correct: 0,
      why: "L'ordine dei numeri è sempre N - P₂O₅ - K₂O." },
    { id: 1067, topic: 'Concimazione e fertilizzanti', q: 'I concimi si distinguono dagli ammendanti perché',
      opts: ['apportano elementi nutritivi alle piante', 'migliorano solo la struttura', 'correggono solo il pH', 'servono solo a drenare'], correct: 0,
      why: 'Concime = apporta nutrienti; ammendante = migliora la struttura; correttivo = regola il pH.' },
    { id: 1068, topic: 'Concimazione e fertilizzanti', q: 'La sostanza organica apportata col letame, oltre ai nutrienti,',
      opts: ['migliora la struttura e la ritenzione idrica', 'peggiora sempre il drenaggio', 'acidifica sempre il suolo', 'è priva di effetti'], correct: 0,
      why: 'Il letame ha un doppio ruolo: nutritivo (concime) e di miglioramento fisico (ammendante).' },

    // Agrotecnica e rotazioni
    { id: 1069, topic: 'Agrotecnica e rotazioni', q: 'La monosuccessione (stessa coltura ripetuta) tende a',
      opts: ['favorire parassiti/patogeni specifici e la «stanchezza del terreno»', 'aumentare la fertilità', 'eliminare le malerbe', 'migliorare la struttura'], correct: 0,
      why: 'Ripetere la stessa coltura concentra i suoi nemici; la rotazione li spezza.' },
    { id: 1070, topic: 'Agrotecnica e rotazioni', q: 'Un vantaggio della rotazione colturale è',
      opts: ['interrompere i cicli di parassiti e infestanti', 'concentrare i patogeni', 'impoverire il suolo', 'aumentare la monocoltura'], correct: 0,
      why: 'Alternare colture diverse spezza i cicli biologici di parassiti e malerbe.' },
    { id: 1071, topic: 'Agrotecnica e rotazioni', q: 'In rotazione, le leguminose sono considerate colture',
      opts: ['miglioratrici (arricchiscono di azoto)', 'depauperanti', 'neutre', 'sterili'], correct: 0,
      why: 'Fissano azoto e ne lasciano per la coltura successiva.' },
    { id: 1072, topic: 'Agrotecnica e rotazioni', q: 'Il sovescio consiste nel',
      opts: ['interrare una coltura (spesso leguminosa) per arricchire il suolo', 'raccogliere il seme di una coltura', 'bruciare i residui', 'irrigare a scorrimento'], correct: 0,
      why: 'Apporta sostanza organica e azoto interrando la biomassa verde.' },
    { id: 1073, topic: 'Agrotecnica e rotazioni', q: 'Una «coltura da rinnovo» è tipicamente',
      opts: ['una sarchiata ben concimata che lascia il terreno migliorato (mais, bietola)', 'un cereale vernino fitto', 'un prato stabile', 'un maggese'], correct: 0,
      why: 'Apre la rotazione: lavorazioni, concimazioni e sarchiature lasciano il campo in ordine.' },
    { id: 1074, topic: 'Agrotecnica e rotazioni', q: 'Il maggese è',
      opts: ['il terreno lasciato a riposo, senza coltura', 'una coltura da sovescio', 'una consociazione', 'una tecnica di irrigazione'], correct: 0,
      why: 'Riposo del terreno per ricostituire fertilità e riserva idrica (tecnica tradizionale).' },
    { id: 1075, topic: 'Agrotecnica e rotazioni', q: 'Una rotazione triennale prevede',
      opts: ['3 colture che si succedono in 3 anni', '3 colture contemporanee', '3 lavorazioni annuali', '3 concimazioni'], correct: 0,
      why: 'Il ciclo colturale si ripete ogni 3 anni con 3 colture nelle 3 annate.' },
    { id: 1076, topic: 'Agrotecnica e rotazioni', q: 'La consociazione si distingue dalla rotazione perché',
      opts: ['le colture crescono contemporaneamente sullo stesso campo', 'le colture si susseguono nel tempo', 'usa più concime', 'non prevede semina'], correct: 0,
      why: 'Rotazione = successione nel tempo; consociazione = più colture insieme nello spazio.' },
    { id: 1077, topic: 'Agrotecnica e rotazioni', q: 'Dopo una leguminosa, in rotazione, conviene collocare una coltura',
      opts: ['esigente in azoto (es. un cereale)', "un'altra leguminosa", 'un maggese', 'la stessa leguminosa'], correct: 0,
      why: "Sfrutta l'azoto lasciato nel terreno dalla leguminosa." },
    { id: 1078, topic: 'Agrotecnica e rotazioni', q: 'La rotazione, rispetto alla monosuccessione, su struttura e sostanza organica',
      opts: ['le migliora', 'le peggiora', 'non le cambia', 'le azzera'], correct: 0,
      why: 'La diversità di apparati radicali e residui mantiene struttura e fertilità.' },
    { id: 1079, topic: 'Agrotecnica e rotazioni', q: 'La biodiversità in un agroecosistema',
      opts: ['aumenta stabilità e resilienza del sistema', 'favorisce sempre le epidemie', 'riduce la fertilità', 'è ininfluente'], correct: 0,
      why: 'Più specie e più diversità genetica = maggiore equilibrio biologico.' },
    { id: 1080, topic: 'Agrotecnica e rotazioni', q: 'In una consociazione cereale-leguminosa, la leguminosa',
      opts: ['apporta azoto utile anche al cereale', 'sottrae azoto al cereale', 'non interagisce', 'soffoca il cereale'], correct: 0,
      why: "È il vantaggio classico: l'azoto fissato avvantaggia anche il cereale associato." },

    // Difesa, diserbo e lavorazioni
    { id: 1081, topic: 'Difesa, diserbo e lavorazioni', q: 'Il diserbo in pre-emergenza agisce',
      opts: ['prima che coltura e infestanti emergano (antigerminello)', 'su malerbe già sviluppate', 'solo dopo la raccolta', 'tra le file a coltura adulta'], correct: 0,
      why: 'Erbicidi ad azione antigerminello, applicati sul terreno prima della nascita delle piante.' },
    { id: 1082, topic: 'Difesa, diserbo e lavorazioni', q: 'Un erbicida «totale» (non selettivo)',
      opts: ['elimina qualunque vegetazione', 'colpisce solo alcune specie', 'agisce solo sui semi', 'nutre la coltura'], correct: 0,
      why: 'Es. glifosate: usato fuori coltura o in pre-semina perché distrugge tutte le piante.' },
    { id: 1083, topic: 'Difesa, diserbo e lavorazioni', q: 'Un erbicida sistemico',
      opts: ['viene assorbito e traslocato in tutta la pianta', 'agisce solo dove tocca', 'evapora subito', 'agisce solo sui semi'], correct: 0,
      why: 'Raggiunge anche radici e rizomi: efficace sulle perenni.' },
    { id: 1084, topic: 'Difesa, diserbo e lavorazioni', q: 'Un erbicida di contatto',
      opts: ['agisce solo sulle parti della pianta che colpisce', 'trasloca fino alle radici', 'è antigerminello', 'agisce dopo mesi'], correct: 0,
      why: 'Non si muove dentro la pianta: colpisce solo il tessuto bagnato.' },
    { id: 1085, topic: 'Difesa, diserbo e lavorazioni', q: "L'aratura è una lavorazione",
      opts: ['principale (rovescia la fetta in profondità)', 'secondaria di affinamento', 'complementare', 'di raccolta'], correct: 0,
      why: "È la lavorazione profonda di base; segue poi l'affinamento con erpici e frese." },
    { id: 1086, topic: 'Difesa, diserbo e lavorazioni', q: "L'erpicatura è una lavorazione",
      opts: ['secondaria, di affinamento del letto di semina', 'principale e profonda', 'di semina', 'di concimazione'], correct: 0,
      why: "Sminuzza le zolle dopo l'aratura per preparare il letto di semina." },
    { id: 1087, topic: 'Difesa, diserbo e lavorazioni', q: "La minima lavorazione (minimum tillage), rispetto all'aratura,",
      opts: ['riduce le lavorazioni e lascia più residui in superficie', 'rovescia e interra tutto', "aumenta l'erosione", 'elimina la sostanza organica'], correct: 0,
      why: 'Tecnica conservativa: meno disturbo del suolo, residui in superficie.' },
    { id: 1088, topic: 'Difesa, diserbo e lavorazioni', q: 'La semina su sodo (no-tillage) consiste nel',
      opts: ['seminare senza lavorare il terreno', 'arare in profondità prima di seminare', 'bruciare i residui', 'irrigare prima di seminare'], correct: 0,
      why: 'Massima conservazione: si semina nel terreno indisturbato coperto dai residui.' },
    { id: 1089, topic: 'Difesa, diserbo e lavorazioni', q: "Le lavorazioni conservative, rispetto all'aratura convenzionale,",
      opts: ["riducono l'erosione e accumulano sostanza organica in superficie", "aumentano l'erosione", 'mineralizzano più in fretta la sostanza organica', 'compattano la profondità'], correct: 0,
      why: 'Meno rimescolamento → residui e humus si concentrano in superficie e il suolo è più protetto.' },
    { id: 1090, topic: 'Difesa, diserbo e lavorazioni', q: 'La sarchiatura serve a',
      opts: ['controllare le malerbe tra le file e arieggiare il terreno', 'rovesciare la fetta di terreno', 'distribuire i residui', 'compattare il letto di semina'], correct: 0,
      why: 'Lavorazione superficiale tra le file delle colture «sarchiate» (mais, bietola, ortive).' },
    { id: 1091, topic: 'Difesa, diserbo e lavorazioni', q: 'La rullatura serve a',
      opts: ['compattare e rassodare il letto di semina', 'rovesciare la fetta', 'trinciare i residui', 'diserbare'], correct: 0,
      why: 'Il rullo comprime il terreno superficiale migliorando il contatto seme-suolo.' },
    { id: 1092, topic: 'Difesa, diserbo e lavorazioni', q: 'Un principio della lotta integrata è',
      opts: ['intervenire in base alla soglia di danno, combinando più metodi', 'trattare sempre a calendario', 'usare solo prodotti chimici', 'non intervenire mai'], correct: 0,
      why: 'Si tratta solo oltre la soglia economica, unendo mezzi agronomici, biologici e chimici.' },
    { id: 1093, topic: 'Difesa, diserbo e lavorazioni', q: 'La banca dei semi del suolo è costituita da',
      opts: ['semi di infestanti in dormienza, pronti a germinare', 'semi delle colture seminate', 'semi certificati in magazzino', 'semi germinati ogni anno'], correct: 0,
      why: 'È la riserva di semi di malerbe presenti nel terreno, che germinano negli anni.' },
    { id: 1094, topic: 'Difesa, diserbo e lavorazioni', q: 'Il safener (antidoto agronomico) serve a',
      opts: ["proteggere la coltura dall'erbicida, rendendolo selettivo", 'rinforzare le malerbe', 'nutrire la coltura', 'aumentare la dose di erbicida'], correct: 0,
      why: "Permette all'erbicida di colpire le infestanti risparmiando la coltura." },
    { id: 1095, topic: 'Difesa, diserbo e lavorazioni', q: 'Il diserbo in post-emergenza si esegue',
      opts: ['quando le malerbe sono già emerse e visibili', 'prima che le infestanti germinino', 'solo dopo la raccolta', 'un anno prima della semina'], correct: 0,
      why: 'Si interviene a bersaglio visibile, sulle malerbe già nate.' },
    { id: 1096, topic: 'Difesa, diserbo e lavorazioni', q: 'La trinciatura dei residui colturali serve a',
      opts: ['sminuzzarli e distribuirli uniformemente, facilitandone la degradazione', 'compattare il terreno', 'irrigare', 'seminare'], correct: 0,
      why: 'Residui sminuzzati e ben distribuiti si interrano e si decompongono meglio.' },

    // ── Batch aggiuntivo (5 opzioni, stile esame reale) ──────────────────
    // Clima e acqua
    { id: 1097, topic: "Clima e acqua", q: "Durante un temporale il pluviometro registra 40 mm di pioggia. Quanti litri d'acqua sono caduti in totale su una serra di 1.500 m²?",
      opts: ["6.000 L", "1.500 L", "600.000 L", "40.000 L", "60.000 L"], correct: 4,
      why: "1 mm di pioggia equivale a 1 litro per m²; quindi 40 mm × 1.500 m² = 60.000 litri (pari a 60 m³)." },
    { id: 1098, topic: "Clima e acqua", q: "In giornate parzialmente nuvolose l'aumento della quota di PAR diffusa rende più efficiente la fotosintesi della chioma perché:",
      opts: ["aumenta la temperatura delle foglie accelerando le reazioni enzimatiche", "la luce diffusa proviene da tutta la volta celeste e penetra più uniformemente, raggiungendo anche le foglie interne e ombreggiate", "induce la chiusura degli stomi riducendo le perdite d'acqua", "incrementa la componente ultravioletta assorbita dalla clorofilla", "concentra la radiazione solo sulle foglie apicali della chioma"], correct: 1,
      why: "La radiazione diffusa proviene dall'intera volta celeste e penetra meglio all'interno della canopy, illuminando anche le foglie più interne e ombreggiate: così cresce la fotosintesi complessiva dell'appezzamento (Scheda #40)." },
    { id: 1099, topic: "Clima e acqua", q: "L'evapotraspirazione di riferimento (ET0) è definita come l'evapotraspirazione da:",
      opts: ["una coltura in condizioni di stress idrico moderato", "un suolo nudo e asciutto privo di vegetazione", "una superficie estesa e uniforme di erba verde (alta 8-15 cm), in attiva crescita e ben rifornita d'acqua, dipendente solo dai fattori meteorologici", "uno specchio d'acqua libera in evaporazione", "una coltura arborea in piena fruttificazione"], correct: 2,
      why: "Per definizione ET0 è l'ET di un prato di erba verde (8-15 cm) in attiva crescita, che copre completamente il suolo ed è ben rifornito d'acqua; in tali condizioni dipende solo dai fattori meteorologici (Scheda #1017)." },
    { id: 1100, topic: "Clima e acqua", q: "Nel calcolo del bilancio idrico, con manto vegetale asciutto, la 'pioggia utile' (Pu) si stima come:",
      opts: ["Pu = P + 2 mm", "Pu = P × 2", "Pu = P − 20 mm", "Pu = P − 2 mm", "Pu = ET − P"], correct: 3,
      why: "Con manto vegetale asciutto i primi ~2 mm di pioggia bagnano la vegetazione e non raggiungono il suolo, quindi la pioggia utile è Pu = P − 2 mm (Scheda #69)." },
    { id: 1101, topic: "Clima e acqua", q: "Quando l'umidità del terreno scende al di sotto del limite di intervento irriguo (Li), la coltura:",
      opts: ["entra in stress idrico e la sua ET effettiva scende sotto quella potenziale (Ks < 1)", "assorbe acqua liberamente, senza alcuno stress", "raggiunge la capacità idrica massima del suolo", "interrompe in modo completo e definitivo la traspirazione", "aumenta la propria ET al di sopra di ET0"], correct: 0,
      why: "Sotto il limite di intervento la pianta estrae acqua a fatica ed entra in stress: il coefficiente Ks scende sotto 1, quindi l'ET effettiva (ETe = Ks·ETc) è inferiore a quella potenziale (Schede #1019 e #1041)." },
    { id: 1102, topic: "Clima e acqua", q: "L'umidità relativa (UR) dell'aria è definita come:",
      opts: ["la massa di vapore acqueo contenuta in un metro cubo di aria, espressa in g/m³", "la massima quantità di vapore che l'aria può contenere a una data temperatura", "il rapporto percentuale tra la pressione parziale del vapore e la pressione di vapore a saturazione", "la differenza tra la pressione di saturazione e la pressione parziale effettiva del vapore", "la temperatura alla quale l'aria raggiunge la saturazione senza variare il contenuto di vapore"], correct: 2,
      why: "L'UR è il rapporto percentuale tra la pressione parziale del vapore e la pressione di saturazione. L'opzione a descrive l'umidità assoluta, la b l'umidità di saturazione, la d il deficit di pressione di vapore (VPD) e la e il punto di rugiada." },
    { id: 1103, topic: "Clima e acqua", q: "La massima quantità di vapore acqueo che una massa d'aria può contenere (umidità di saturazione), al crescere della temperatura:",
      opts: ["diminuisce linearmente all'aumentare della temperatura", "rimane costante perché dipende solo dalla pressione atmosferica", "diminuisce in modo esponenziale", "aumenta linearmente in proporzione diretta alla temperatura", "aumenta in modo esponenziale"], correct: 4,
      why: "L'umidità di saturazione cresce esponenzialmente con la temperatura. Proprio per questo, a parità di vapore effettivamente presente, un'aria più calda ha un'umidità relativa più bassa." },
    { id: 1104, topic: "Clima e acqua", q: "L'umidità assoluta dell'aria esprime:",
      opts: ["il rapporto percentuale tra vapore presente e vapore a saturazione", "la massa di vapore acqueo per unità di volume d'aria, in g/m³", "la reale forza trainante dell'evapotraspirazione, espressa in kPa", "la temperatura a cui l'aria, raffreddandosi, raggiunge la saturazione", "la quantità di pioggia caduta per unità di superficie, in mm"], correct: 1,
      why: "L'umidità assoluta è la massa di vapore acqueo per unità di volume d'aria (g/m³). L'opzione a è l'UR, la c il VPD, la d il punto di rugiada e la e la precipitazione misurata al pluviometro." },
    { id: 1105, topic: "Clima e acqua", q: "Il deficit di pressione di vapore (VPD) dell'aria:",
      opts: ["coincide con l'umidità relativa espressa in percentuale", "è nullo quando l'aria è molto secca e calda", "misura la massa di vapore acqueo per metro cubo d'aria", "è la differenza tra pressione di saturazione e pressione effettiva del vapore ed è la reale forza trainante dell'evapotraspirazione", "aumenta all'aumentare dell'umidità relativa, a parità di temperatura"], correct: 3,
      why: "Il VPD è la differenza tra pressione di saturazione ed effettiva del vapore (es − ea) ed è la reale forza motrice dell'evapotraspirazione. È massimo (non nullo, come dice la b) con aria secca e calda e diminuisce al crescere dell'UR, contrariamente a quanto afferma la e." },
    { id: 1106, topic: "Clima e acqua", q: "Nella troposfera, in condizioni normali e con aria secca, il gradiente termico verticale medio è pari a circa:",
      opts: ["0,65 °C di diminuzione ogni 100 m di aumento di quota", "6,5 °C di diminuzione ogni 100 m di aumento di quota", "0,065 °C di diminuzione ogni 100 m di aumento di quota", "1 °C di aumento ogni 1000 m di aumento di quota", "0,65 °C di diminuzione ogni 1000 m di aumento di quota"], correct: 0,
      why: "Il gradiente termico verticale medio è di 0,65 °C ogni 100 m: la temperatura cala con la quota. Si ha inversione termica quando, al contrario, la temperatura aumenta con la quota. Le altre opzioni sbagliano di un fattore 10 o 100 o invertono il segno." },
    { id: 1107, topic: "Clima e acqua", q: "Su quale principio fisico si basa la protezione dalle gelate mediante irrigazione antibrina?",
      opts: ["sull'acqua che, evaporando dalla vegetazione, cede calore e la riscalda", "sull'aumento dell'umidità relativa che impedisce il raggiungimento del punto di rugiada", "sull'effetto isolante di uno strato d'aria secca creato dagli irrigatori", "sul raffreddamento dell'acqua da 20 a 0 °C, che libera circa 2272 kJ per kg", "sul calore latente di fusione (circa 333 kJ/kg) ceduto dall'acqua quando congela, che mantiene la vegetazione intorno a 0 °C"], correct: 4,
      why: "Finché l'acqua che bagna la coltura continua a congelare, cede il calore latente di fusione (333,5 kJ/kg) mantenendo i tessuti attorno a 0 °C, al riparo da temperature inferiori. Il valore 2272 kJ/kg è invece il calore che l'evaporazione a 0 °C sottrae, non quello del raffreddamento 20→0 °C (che libera solo 84 kJ/kg)." },
    { id: 1108, topic: "Clima e acqua", q: "L'escursione termica giornaliera (differenza tra temperatura massima e minima) risulta MINIMA in presenza di:",
      opts: ["cielo sereno, aria secca e suolo asciutto", "forte vento notturno associato a bassa umidità", "cielo coperto, elevata umidità dell'aria e vegetazione fitta", "clima arido con notti serene e limpide", "suolo nudo e asciutto sotto cielo limpido"], correct: 2,
      why: "Nubi, elevata umidità dell'aria e vegetazione fitta riducono la perdita radiativa notturna e quindi l'escursione termica. Al contrario cielo sereno, aria secca e suolo asciutto (a, d, e) la massimizzano e favoriscono le gelate per irraggiamento." },
    // Suolo: struttura e acqua
    { id: 1109, topic: "Suolo: struttura e acqua", q: "Secondo la classificazione USDA, la frazione limo è compresa nell'intervallo di diametri:",
      opts: ["2,0-0,05 mm", "inferiore a 0,002 mm", "0,02-0,002 mm", "0,05-0,002 mm", "20-2 mm"], correct: 3,
      why: "In USDA il limo va da 0,05 a 0,002 mm; l'intervallo 0,02-0,002 mm è il limo ISSS, 2,0-0,05 mm è la sabbia, <0,002 mm l'argilla e 20-2 mm la ghiaia." },
    { id: 1110, topic: "Suolo: struttura e acqua", q: "Qual è il limite dimensionale che separa la terra fine dallo scheletro?",
      opts: ["0,05 mm", "20 mm", "2 mm", "0,002 mm", "0,25 mm"], correct: 2,
      why: "La terra fine è la frazione <2 mm; lo scheletro comprende ghiaia (20-2 mm) e pietre (>20 mm). Il valore 20 mm separa invece ghiaia e pietre, non terra fine e scheletro." },
    { id: 1111, topic: "Suolo: struttura e acqua", q: "La composizione granulometrica (tessitura) di un suolo è sempre espressa come:",
      opts: ["percentuale in volume delle tre fasi", "percentuale in peso (sul secco) delle frazioni della terra fine", "superficie massica in m²/g", "percentuale in peso sul campione umido", "massa per unità di volume in t/m³"], correct: 1,
      why: "La tessitura è la distribuzione percentuale, in peso del secco, di sabbia, limo e argilla nella terra fine; non si esprime in volume, sull'umido né in t/m³ (che è la densità)." },
    { id: 1112, topic: "Suolo: struttura e acqua", q: "Nel triangolo tessiturale USDA quale contenuto è già sufficiente a classificare un suolo come 'argilloso'?",
      opts: ["oltre il 40% di argilla", "oltre l'85% di argilla", "oltre il 60% di argilla", "oltre il 25% di argilla", "oltre il 50% di argilla"], correct: 0,
      why: "L'effetto dell'argilla è dominante: basta circa il 40% di argilla per un suolo 'argilloso', mentre servono >85% di limo o >60% di sabbia per definire i rispettivi 'puri'." },
    { id: 1113, topic: "Suolo: struttura e acqua", q: "Un suolo franco (di medio impasto) 'ideale' ha indicativamente una composizione di:",
      opts: ["80% sabbia, 15% limo, 5% argilla", "20% sabbia, 20% limo, 60% argilla", "10% sabbia, 85% limo, 5% argilla", "70% sabbia, 25% limo, 5% argilla", "40% sabbia, 40% limo, 20% argilla"], correct: 4,
      why: "Nel franco le tre frazioni si equilibrano (es. 40% sabbia, 40% limo, 20% argilla); le altre combinazioni ricadono rispettivamente in sabbioso, argilloso o limoso." },
    { id: 1114, topic: "Suolo: struttura e acqua", q: "La densità reale (Dr) di un suolo organico/torboso è circa:",
      opts: ["1,3 t/m³", "2,65 t/m³", "2,0 t/m³", "2,3 t/m³", "1,0 t/m³"], correct: 2,
      why: "La Dr dei suoli organici è ~2,0 t/m³ (bassa per l'abbondanza di sostanza organica, ma resta una costante del materiale); 2,65 è quella dei suoli minerali e 2,3 del calcare. Errore tipico è attribuirle 1,3, che è invece una densità apparente." },
    { id: 1115, topic: "Suolo: struttura e acqua", q: "Quando un suolo viene costipato dal passaggio delle macchine, quale grandezza rimane praticamente costante?",
      opts: ["la massa secca e il volume della fase solida", "la densità apparente", "la porosità totale", "il volume totale apparente", "il volume dei vuoti"], correct: 0,
      why: "I granuli minerali non si comprimono, quindi massa secca e volume dei solidi restano costanti. Il costipamento riduce il volume dei vuoti e quello totale: perciò la densità apparente aumenta e la porosità diminuisce." },
    { id: 1116, topic: "Suolo: struttura e acqua", q: "Subito dopo un'aratura, rispetto alla condizione iniziale, densità apparente e porosità totale del suolo:",
      opts: ["aumentano entrambe", "la densità apparente diminuisce e la porosità aumenta", "diminuiscono entrambe", "la densità apparente aumenta e la porosità diminuisce", "restano invariate"], correct: 1,
      why: "La lavorazione distanzia gli aggregati ('gonfiamento'): la densità apparente cala (es. da 1,4 a 0,8 t/m³) e la porosità sale. È però un aumento instabile che si riassesta con le prime piogge." },
    { id: 1117, topic: "Suolo: struttura e acqua", q: "Negli aggregati del suolo, la soglia dimensionale di 250 µm (0,25 mm) separa:",
      opts: ["i macropori dai micropori", "la sabbia dal limo", "le zolle dalle zollette", "l'argilla dal limo", "gli aggregati primari (<250 µm) dai secondari o grumi (>250 µm)"], correct: 4,
      why: "A 250 µm si distinguono gli aggregati primari (<250 µm) dai secondari/grumi (>250 µm), soglia che coincide col limite degli astrutturali. La soglia macro/micropori è invece 10 µm e quella delle zolle 150 mm." },
    { id: 1118, topic: "Suolo: struttura e acqua", q: "Fra i seguenti cationi scambiabili, quale possiede il maggior potere flocculante sulle argille?",
      opts: ["Na⁺", "K⁺", "Ca²⁺", "Al³⁺", "Mg²⁺"], correct: 3,
      why: "Nella serie liotropica il potere flocculante cresce con la valenza: i trivalenti (Al³⁺, Fe³⁺) sono i migliori, seguiti dai bivalenti (Ca²⁺, Mg²⁺); il sodio è deflocculante e il potassio, pur nutriente, tende a disperdere le argille." },
    { id: 1119, topic: "Suolo: struttura e acqua", q: "L'acqua gravitazionale nel suolo è quella che:",
      opts: ["occupa i macropori e viene drenata rapidamente per gravità", "è trattenuta nei micropori e costituisce la riserva idrica per le piante", "resta fortemente adesa alle particelle solide e non è assorbibile dalle radici", "è contenuta nei criptopori, sede di interazioni chimiche", "satura in modo permanente l'intera porosità del suolo"], correct: 0,
      why: "Il programma colloca l'acqua gravitazionale nei macropori (>10 µm), dove non è trattenuta ma sgronda rapidamente per gravità assicurando il drenaggio; l'acqua della riserva sta invece nei micropori e quella non disponibile nei criptopori." },
    { id: 1120, topic: "Suolo: struttura e acqua", q: "L'acqua contenuta nei criptopori del suolo:",
      opts: ["è la principale riserva idrica utilizzabile dalle colture", "corrisponde all'acqua gravitazionale che drena per gravità", "è trattenuta così debolmente da drenare immediatamente", "non è disponibile per le piante ed è sede di interazioni chimiche", "rappresenta il contenuto idrico del suolo alla saturazione"], correct: 3,
      why: "Il programma indica esplicitamente che nei criptopori l'acqua è 'non disponibile' e vi avvengono le interazioni chimiche; è trattenuta con forze elevatissime e non è assorbibile dalle radici, a differenza dell'acqua dei micropori (riserva) e dei macropori (gravitazionale)." },
    { id: 1121, topic: "Suolo: struttura e acqua", q: "Per saturare completamente 1000 cm³ di un suolo non rigonfiabile occorrono 0,35 L d'acqua. La capacità idrica massima (contenuto idrico alla saturazione) è pari a circa:",
      opts: ["3,5%", "15%", "35%", "65%", "350%"], correct: 2,
      why: "Alla saturazione l'acqua riempie l'intera porosità: 350 cm³ su 1000 cm³ = 35% (esercizio svolto nel programma). La capacità idrica massima (CIM) coincide con la porosità totale del suolo." },
    { id: 1122, topic: "Suolo: struttura e acqua", q: "La maggiore ritenzione idrica di un suolo argilloso rispetto a uno sabbioso è dovuta soprattutto:",
      opts: ["alla maggiore densità apparente dell'argilla", "all'elevata superficie massica e microporosità delle particelle di argilla", "alla prevalenza di macropori negli orizzonti argillosi", "alla scarsa capacità di scambio cationico dell'argilla", "alla maggiore presenza di scheletro"], correct: 1,
      why: "Nel programma l'argilla ha superficie massica elevatissima (150-250 m²/g) e genera abbondante microporosità (<10 µm), la classe di pori che trattiene l'acqua; per questo gli argillosi immagazzinano molta più acqua dei sabbiosi. La loro densità apparente è invece più bassa, non più alta." },
    { id: 1123, topic: "Suolo: struttura e acqua", q: "Quando l'acqua arriva a occupare l'intera porosità del suolo (saturazione):",
      opts: ["l'acqua occupa soltanto i micropori del suolo", "l'acqua diventa indisponibile per le radici", "la conducibilità idrica del suolo si annulla", "si raggiunge la condizione ottimale per la respirazione radicale", "la fase gassosa viene espulsa e si verifica asfissia radicale"], correct: 4,
      why: "Il programma afferma che se l'acqua occupa l'intera porosità si ha saturazione e asfissia radicale: tutti i pori sono pieni d'acqua e la fase gassosa (ossigeno) viene espulsa. La conducibilità idrica, al contrario, è massima a saturazione." },
    { id: 1124, topic: "Suolo: struttura e acqua", q: "Nel sistema trifasico del suolo, all'aumentare del contenuto idrico:",
      opts: ["diminuisce in modo corrispondente (lineare) il volume occupato dall'aria", "aumenta corrispondentemente il volume della fase gassosa", "aumenta il volume della fase solida", "aumenta la porosità totale del suolo", "diminuisce la densità reale delle particelle"], correct: 0,
      why: "Il programma afferma che all'aumentare del contenuto d'acqua (fase liquida) diminuisce linearmente il volume occupato dall'aria (fase gassosa): il volume dei vuoti è fisso e si ripartisce tra acqua e aria. Fase solida, porosità totale e densità reale non variano." },
    // Sistemazioni ed erosione
    { id: 1125, topic: "Sistemazioni ed erosione", q: "L'erosione laminare (sheet o interill erosion) è caratterizzata da:",
      opts: ["la formazione di solchi paralleli a reticolo favorita dalle lavorazioni", "il distacco delle particelle dovuto al solo impatto delle gocce di pioggia", "l'asportazione lenta e diffusa di un sottile velo di suolo parallelo alla superficie", "l'incisione di burroncelli profondi che ostacolano la meccanizzazione", "lo smottamento di masse profonde con formazione di canali sotterranei"], correct: 2,
      why: "L'erosione laminare è un logorio uniforme che asporta un velo di suolo parallelo alla superficie; i solchi caratterizzano invece la rill erosion e i burroncelli la gully erosion." },
    { id: 1126, topic: "Sistemazioni ed erosione", q: "Quale sequenza dispone correttamente i tipi di erosione idrica in ordine di gravità crescente?",
      opts: ["da impatto → laminare → per solchi → per fossi → di massa profonda", "laminare → da impatto → per fossi → per solchi → di massa profonda", "per solchi → per fossi → laminare → da impatto → di massa profonda", "di massa profonda → per fossi → per solchi → laminare → da impatto", "da impatto → per solchi → laminare → di massa profonda → per fossi"], correct: 0,
      why: "La gravità cresce dal semplice impatto delle gocce (splash) all'erosione laminare, poi ai solchi (rill), ai fossi/burroncelli (gully) fino ai movimenti di massa profondi." },
    { id: 1127, topic: "Sistemazioni ed erosione", q: "L'erosione da impatto (rain drop / splash erosion) consiste essenzialmente in:",
      opts: ["l'asportazione di un velo diffuso di suolo per scorrimento laminare", "l'incisione a reticolo di solchi lungo le linee di massima pendenza", "il trasporto del suolo in canali profondi tipici dei suoli permeabili", "il distacco delle particelle di terreno provocato dall'impatto delle gocce di pioggia", "la formazione di calanchi tipici delle argille plioceniche"], correct: 3,
      why: "Lo splash è la fase iniziale del processo erosivo: l'energia cinetica delle gocce che colpiscono il suolo nudo stacca le particelle, che possono poi essere trasportate dal deflusso superficiale." },
    { id: 1128, topic: "Sistemazioni ed erosione", q: "I calanchi sono forme erosive accentuate tipiche di:",
      opts: ["suoli sabbiosi molto permeabili e profondi", "argille plioceniche", "suoli torbosi di pianura", "versanti boscati a debole pendenza", "terreni ciottolosi di conoide alluvionale"], correct: 1,
      why: "I calanchi sono forme di erosione spinta che si sviluppano tipicamente sulle argille plioceniche, poco permeabili e facilmente incise dal ruscellamento." },
    { id: 1129, topic: "Sistemazioni ed erosione", q: "Nell'equazione RUSLE (A = R·K·L·S·C·P), il fattore colturale C:",
      opts: ["esprime l'aggressività della pioggia in funzione della sua energia cinetica", "rappresenta l'erodibilità intrinseca del suolo", "tiene conto della lunghezza e della pendenza del versante", "quantifica l'effetto delle pratiche protettive come le fasce inerbite", "è prossimo a 0 sotto prati e boschi ed elevato sotto colture sarchiate"], correct: 4,
      why: "Il fattore C misura l'effetto della copertura colturale: prati e boschi proteggono il suolo (C ≈ 0), le sarchiate lo lasciano scoperto (C elevato). L'aggressività della pioggia è R, l'erodibilità K, la topografia L·S e le pratiche protettive P." },
    { id: 1130, topic: "Sistemazioni ed erosione", q: "L'entità del terreno asportato dall'erosione idrica è dell'ordine di grandezza di:",
      opts: ["0,2 - 5 - 80 kg/ha/anno", "20 - 50 - 800 t/ha/anno", "0,2 - 5 - 80 t/ha/anno", "200 - 500 - 800 t/ha/anno", "0,002 - 0,05 - 0,8 t/ha/anno"], correct: 2,
      why: "Il programma indica un ordine di grandezza dell'erosione di circa 0,2 - 5 - 80 t/ha/anno; l'errore tipico è confondere l'unità (kg invece di t) o l'ordine di grandezza." },
    { id: 1131, topic: "Sistemazioni ed erosione", q: "Rispetto all'erosione per solchi (rill), l'erosione per fossi o burroncelli (gully) si distingue perché:",
      opts: ["le incisioni si approfondiscono al punto da ostacolare la meccanizzazione e non sono più eliminabili con le normali lavorazioni", "asporta soltanto un velo superficiale di suolo in modo diffuso", "è dovuta al solo impatto delle gocce di pioggia sul suolo nudo", "interessa esclusivamente i suoli sabbiosi molto permeabili", "non è influenzata dalla declività del versante"], correct: 0,
      why: "La gully erosion è l'aggravamento dei solchi in incisioni profonde (burroncelli) che ostacolano la meccanizzazione; i solchi (rill), più superficiali, possono ancora essere cancellati dalle lavorazioni." },
    { id: 1132, topic: "Sistemazioni ed erosione", q: "La sistemazione a rittochino, pur provocando una forte erosione, viene adottata soprattutto perché:",
      opts: ["rallenta il ruscellamento favorendo l'infiltrazione dell'acqua", "dispone i filari paralleli alle curve di livello", "è indicata per i suoli pianeggianti con pendenza inferiore al 5%", "smaltisce rapidamente le acque in eccesso evitando frane e falde sospese e consente di gestire pendici molto acclivi", "annulla la necessità di scoline e fossi collettori"], correct: 3,
      why: "Il rittochino, con lavorazioni lungo la massima pendenza, allontana rapidamente l'acqua evitando ristagni, frane e falde sospese e permette di coltivare pendici molto ripide (filari Nord-Sud); lo svantaggio è la forte erosione. È il girapoggio, non il rittochino, a disporre i filari lungo le curve di livello." },
    { id: 1133, topic: "Sistemazioni ed erosione", q: "Il deflusso superficiale all'origine dell'erosione idrica si instaura quando:",
      opts: ["l'acqua di pioggia infiltra completamente in un suolo molto permeabile", "l'intensità della pioggia è inferiore alla capacità di infiltrazione del suolo", "il suolo è protetto da una fitta copertura vegetale permanente", "la falda freatica è molto profonda", "l'acqua di pioggia non riesce a infiltrare e scorre in superficie"], correct: 4,
      why: "L'erosione idrica nasce dal ruscellamento, che si verifica quando l'acqua di pioggia non infiltra (per bassa permeabilità o intensità di pioggia eccessiva) e scorre in superficie trasportando le particelle di suolo." },
    { id: 1134, topic: "Sistemazioni ed erosione", q: "Il franco di coltivazione è definito come:",
      opts: ["la larghezza minima di una porca destinata alle colture orticole e sarchiate", "l'altezza dello strato di suolo asciutto e aerato al di sopra della frangia capillare", "la distanza tra due scoline consecutive in un suolo di medio impasto", "la profondità di posa dei dreni tubolari rispetto al piano di campagna", "la pendenza trasversale impressa al terreno con la baulatura"], correct: 1,
      why: "Il franco di coltivazione è lo spessore di suolo asciutto e aerato sopra la frangia capillare (scheda 65): garantirlo assicura ossigenazione radicale e stabilità strutturale. Gli altri termini descrivono grandezze diverse (larghezza porche, interasse scoline, profondità dreni, pendenza baulatura)." },
    { id: 1135, topic: "Sistemazioni ed erosione", q: "Nei suoli argillosi la frangia capillare (che riduce il franco di coltivazione disponibile) si estende indicativamente per:",
      opts: ["pochi millimetri", "1-3 cm", "5-10 cm", "30-50 cm", "oltre 1 metro"], correct: 3,
      why: "Nei suoli argillosi la frangia capillare raggiunge 30-50 cm, contro pochi cm nei sabbiosi (scheda 65): più è spessa, più si riduce il franco di coltivazione utile sopra di essa." },
    { id: 1136, topic: "Sistemazioni ed erosione", q: "Il drenaggio tubolare sotterraneo, rispetto alle sistemazioni superficiali di rimodellamento, è preferibile quando:",
      opts: ["il ristagno idrico è prevalentemente superficiale su suoli impermeabili", "si vuole soltanto accelerare il deflusso superficiale verso le scoline", "l'acqua in eccesso può essere emunta in profondità grazie a un'infiltrazione sufficiente", "la pendenza del versante supera il 40%", "il suolo è del tutto privo di conducibilità idraulica"], correct: 2,
      why: "Il drenaggio sotterraneo raccoglie l'acqua in profondità e richiede un'infiltrazione sufficiente (scheda 1038); se invece il ristagno è soprattutto superficiale sono preferibili le sistemazioni di rimodellazione delle superfici." },
    { id: 1137, topic: "Sistemazioni ed erosione", q: "Riguardo ai parametri di posa del drenaggio tubolare, quale affermazione è FALSA?",
      opts: ["il diametro dei tubi corrugati e fessurati è tipicamente 50-80 mm", "la profondità di posa è di circa 80-100 cm", "la pendenza ottimale dei dreni è 2-3 ‰", "la lunghezza dei dreni è dell'ordine di 150-300 m", "il rivestimento filtrante è superfluo perché i tubi sono già fessurati"], correct: 4,
      why: "Il rivestimento filtrante (geotessuto, cocco, TNT) è indispensabile per impedire l'intasamento fisico dei tubi da parte di limo e sabbia fine (scheda 68); tutti gli altri valori numerici riportati sono corretti." },
    { id: 1138, topic: "Sistemazioni ed erosione", q: "L'aratro talpa (mole drainage) è una tecnica di drenaggio che:",
      opts: ["crea gallerie non rivestite in suoli argillosi coerenti, con effetto che dura solo 2-3 anni", "posa tubi in PVC fessurati a 80-100 cm con rivestimento filtrante geotessile", "è indicata soprattutto per suoli sabbiosi e molto permeabili", "richiede suolo saturo d'acqua sia in superficie sia in profondità", "produce gallerie stabili e permanenti di grande diametro"], correct: 0,
      why: "L'aratro talpa traina un siluro che forma gallerie non rivestite (10-12 cm) in argille coerenti; è economico ma di breve durata (2-3 anni) e richiede suolo asciutto in superficie e umido in profondità (scheda 68). Le altre opzioni confondono con il drenaggio tubolare o invertono le condizioni di esecuzione." },
    { id: 1139, topic: "Sistemazioni ed erosione", q: "Secondo il dimensionamento dell'affossatura di pianura, un suolo pesante (argilloso) richiede un volume di invaso indicativo di:",
      opts: ["80-100 m³/ha", "150-200 m³/ha", "meno di 50 m³/ha", "oltre 250 m³/ha", "circa 728 m³/ha"], correct: 3,
      why: "I suoli pesanti drenano male e richiedono un invaso >250 m³/ha (contro 80-100 dei sciolti e 150-200 del medio impasto, scheda 1035). Il valore 728 m³/ha è un volume di adacquamento irriguo, non di invaso dell'affossatura." },
    { id: 1140, topic: "Sistemazioni ed erosione", q: "La differenza tra terrazzamento e ciglionamento consiste nel fatto che:",
      opts: ["il terrazzamento è sostenuto da un muretto a secco, il ciglionamento da una scarpata erbosa", "il ciglionamento dispone filari e lavorazioni lungo la massima pendenza", "il terrazzamento è privo di sostegno mentre il ciglionamento è dotato di muro", "il ciglionamento è tipico dei suoli pianeggianti con pendenza inferiore al 5%", "il terrazzamento consiste in piccole conche isolate protette attorno all'albero"], correct: 0,
      why: "Nel terrazzamento i ripiani orizzontali sono sostenuti da muretti a secco, nel ciglionamento da una scarpata inerbita/erbosa (scheda 67). L'opzione c inverte i due sistemi, mentre l'opzione e descrive le lunette." },
    { id: 1141, topic: "Sistemazioni ed erosione", q: "Nella classificazione dei suoli declivi in base alla pendenza, un versante con inclinazione del 30% rientra nella classe:",
      opts: ["suoli pianeggianti (inferiore al 5%)", "inclinazione bassa (5-10%)", "terreni ripidi (20-40%)", "inclinazione alta (10-20%)", "terreni molto ripidi (superiore al 40%)"], correct: 2,
      why: "Il 30% cade nell'intervallo 20-40% dei terreni ripidi (schede 67/1037); solo oltre il 40% si parla di versanti molto ripidi." },
    { id: 1142, topic: "Sistemazioni ed erosione", q: "Le fasce tampone (buffer zones) disposte lungo i fossi hanno la funzione principale di:",
      opts: ["aumentare la velocità di ruscellamento verso i collettori di ordine superiore", "sostituire completamente le scoline nella rete di affossatura di pianura", "impermeabilizzare il fondo dei fossi per impedire ogni infiltrazione", "fornire il corpo d'acqua necessario all'irrigazione per scorrimento", "trattenere le perdite di fosforo, suolo e agrofarmaci prima che raggiungano l'acqua"], correct: 4,
      why: "Le fasce tampone proteggono le acque raccolte nei fossi intercettando fosforo, sedimenti e agrofarmaci (scheda 1035): sono un presidio ambientale, non un acceleratore del deflusso né un sostituto delle scoline." },
    // Concimazione e fertilizzanti
    { id: 1143, topic: "Concimazione e fertilizzanti", q: "Secondo la legge del minimo di Liebig, la resa di una coltura è determinata:",
      opts: ["dalla somma di tutti i fattori nutritivi disponibili nel suolo", "dal fattore nutritivo presente nella concentrazione più elevata", "dal fattore nutritivo presente nella concentrazione minima rispetto al fabbisogno", "dalla media dei fattori nutritivi apportati con la concimazione", "esclusivamente dalla disponibilità idrica del suolo"], correct: 2,
      why: "Per Liebig la resa è limitata dal fattore nutritivo più carente rispetto al fabbisogno: aumentare gli altri elementi non incrementa la resa finché non si colma la carenza del fattore minimo." },
    { id: 1144, topic: "Concimazione e fertilizzanti", q: "L'idrolisi dell'urea nel suolo, mediata dall'enzima ureasi, porta alla formazione di:",
      opts: ["ammonio (NH4+)", "nitrato (NO3-)", "nitrito (NO2-)", "azoto molecolare (N2)", "protossido di azoto (N2O)"], correct: 0,
      why: "L'ureasi catalizza l'idrolisi dell'urea trasformandola in ammonio; solo successivamente la nitrificazione ossida l'ammonio a nitrato passando per il nitrito." },
    { id: 1145, topic: "Concimazione e fertilizzanti", q: "In condizioni di anaerobiosi/ristagno idrico, la denitrificazione comporta la perdita di azoto sotto forma di:",
      opts: ["ammonio (NH4+) adsorbito sui colloidi", "nitrato (NO3-) dilavato in profondità", "urea non idrolizzata", "azoto gassoso (N2 e N2O)", "nitrito (NO2-) solubile"], correct: 3,
      why: "La denitrificazione riduce il nitrato liberando azoto in forma gassosa (N2 e N2O) in condizioni anaerobiche/ristagno; il dilavamento del nitrato è invece una perdita per percolazione, non gassosa." },
    { id: 1146, topic: "Concimazione e fertilizzanti", q: "La volatilizzazione ammoniacale comporta la perdita di azoto dal suolo sotto forma di:",
      opts: ["protossido di azoto (N2O)", "ammoniaca gassosa (NH3)", "azoto molecolare (N2)", "nitrato (NO3-) dilavato", "nitrito (NO2-)"], correct: 1,
      why: "La volatilizzazione è la perdita di ammoniaca gassosa (NH3), favorita da pH sub-alcalini e da concimi ureici distribuiti in superficie; N2 e N2O sono invece prodotti della denitrificazione e il nitrato si perde per dilavamento." },
    { id: 1147, topic: "Concimazione e fertilizzanti", q: "L'interramento di un residuo ad alto rapporto C/N (es. paglia di frumento) provoca sull'azoto minerale del suolo:",
      opts: ["una immediata mineralizzazione netta con rilascio di nitrato", "un aumento della volatilizzazione ammoniacale", "un incremento diretto della fissazione simbiotica", "nessun effetto sulla disponibilità di azoto", "una immobilizzazione microbica con 'fame d'azoto' temporanea"], correct: 4,
      why: "Con alto C/N i microrganismi immobilizzano l'azoto minerale per decomporre il carbonio, sottraendolo temporaneamente alla coltura (fame d'azoto); la mineralizzazione netta è tipica dei bassi C/N." },
    { id: 1148, topic: "Concimazione e fertilizzanti", q: "Secondo la regola pratica del corso, l'immobilizzazione dell'azoto provocata dall'interramento della paglia è dell'ordine di circa:",
      opts: ["0,1 kg di N per quintale di paglia", "10 kg di N per quintale di paglia", "1 kg di N per quintale di paglia", "5 kg di N per quintale di paglia", "100 kg di N per quintale di paglia"], correct: 2,
      why: "La regola del corso indica un'immobilizzazione di circa 1 kg di N per quintale di paglia interrata, da compensare con un apporto azotato aggiuntivo per evitare la fame d'azoto." },
    { id: 1149, topic: "Concimazione e fertilizzanti", q: "In presenza di materiali a basso rapporto C/N (letame maturo, leguminose) prevale:",
      opts: ["l'immobilizzazione dell'azoto e la fame d'azoto", "la mineralizzazione netta con rilascio di azoto disponibile", "la volatilizzazione dell'ammoniaca", "la retrogradazione del fosforo", "la denitrificazione del nitrato"], correct: 1,
      why: "Con basso C/N la decomposizione libera più azoto di quanto i microrganismi ne consumino: prevale la mineralizzazione netta con disponibilità immediata di azoto per la coltura." },
    { id: 1150, topic: "Concimazione e fertilizzanti", q: "Nella pianta, il fosforo (P) svolge principalmente la funzione di:",
      opts: ["regolare l'equilibrio osmotico e aumentare la resistenza a siccità e gelo", "favorire la radicazione e la fioritura", "neutralizzare l'acidità dei tessuti", "costituire l'elemento chiave della crescita vegetativa e della biomassa", "aumentare la resistenza ai patogeni fungini"], correct: 1,
      why: "Il programma attribuisce al fosforo il ruolo di favorire radicazione e fioritura; la regolazione osmotica e la resistenza agli stress sono proprie del potassio, la crescita vegetativa è dell'azoto." },
    { id: 1151, topic: "Concimazione e fertilizzanti", q: "Il potassio (K) nella pianta agisce soprattutto come:",
      opts: ["regolatore osmotico, aumentando la resistenza a siccità, gelo e patogeni", "elemento chiave della crescita vegetativa", "promotore specifico della radicazione e della fioritura", "costituente insolubile soggetto a retrogradazione", "elemento facilmente lisciviato perché non trattenuto dal suolo"], correct: 0,
      why: "Il potassio è un regolatore osmotico che aumenta la resistenza a siccità, gelo e patogeni ed è ben trattenuto dalla CSC (quindi non facilmente lisciviato); radicazione e fioritura competono al fosforo." },
    { id: 1152, topic: "Concimazione e fertilizzanti", q: "La fissazione (retrogradazione) del fosforo nel suolo avviene:",
      opts: ["con il potassio a pH neutri", "con l'azoto ammoniacale in condizioni anaerobiche", "solo in suoli sabbiosi a bassa CSC", "con il calcio a pH acidi e con Fe/Al a pH basici", "con Fe e Al a pH acidi e con il calcio a pH basici (calcarei)"], correct: 4,
      why: "Il fosforo retrograda formando composti insolubili con ferro e alluminio nei suoli acidi e con il calcio nei suoli basici/calcarei; l'inversione dei due meccanismi rispetto al pH è errata." },
    { id: 1153, topic: "Concimazione e fertilizzanti", q: "Quale delle seguenti affermazioni sulle dinamiche dell'azoto nel suolo è FALSA?",
      opts: ["Il nitrato (NO3-) è mobile e soggetto a dilavamento", "L'ammonio (NH4+) è trattenuto sui siti di scambio cationico", "La denitrificazione avviene in condizioni anaerobiche/ristagno", "La volatilizzazione ammoniacale è favorita dall'incorporazione profonda dell'urea", "L'urea richiede l'idrolisi enzimatica per trasformarsi in ammonio"], correct: 3,
      why: "È falsa: l'incorporazione profonda dell'urea riduce la volatilizzazione, che è invece favorita dalla distribuzione superficiale del concime ureico; tutte le altre affermazioni sono corrette." },
    { id: 1154, topic: "Concimazione e fertilizzanti", q: "Il nitrato d'ammonio è definito concime 'bifasico' perché:",
      opts: ["contiene azoto sia in forma minerale sia in forma organica", "va distribuito in due epoche obbligatorie durante il ciclo", "contiene metà azoto nitrico a effetto immediato e metà ammoniacale a effetto più prolungato", "apporta contemporaneamente azoto e fosforo", "si trasforma in urea per poi essere idrolizzato"], correct: 2,
      why: "Nel nitrato d'ammonio metà dell'azoto è nitrico (pronto effetto, subito assorbibile) e metà ammoniacale (trattenuto sui colloidi, effetto più prolungato dopo nitrificazione): da qui il comportamento bifasico." },
    { id: 1155, topic: "Concimazione e fertilizzanti", q: "Il solfato ammonico (21% N, 24% S) è particolarmente indicato:",
      opts: ["sui terreni acidi, per il suo effetto alcalinizzante", "come unico concime azotato a pronto effetto nitrico", "esclusivamente in fertirrigazione", "sulle colture sensibili al cloro come la vite", "sui terreni calcarei o per colture esigenti in zolfo, avendo reazione fisiologicamente acidificante"], correct: 4,
      why: "Il solfato ammonico ha reazione fisiologicamente acidificante e apporta zolfo, quindi è adatto a terreni calcarei e colture esigenti in S. Il suo azoto è ammoniacale, non nitrico." },
    { id: 1156, topic: "Concimazione e fertilizzanti", q: "Il cloruro di potassio (60% K2O) è sconsigliato su colture come tabacco, vite e patata perché:",
      opts: ["ha un titolo in K2O troppo basso", "è molto più costoso del solfato di potassio", "ha reazione costituzionale fortemente basica", "apporta cloro, a cui queste colture sono sensibili", "libera azoto in eccesso danneggiando le radici"], correct: 3,
      why: "Il KCl è economico ma ricco di cloro: è sconsigliato su specie sensibili al cloro come tabacco, vite e patata." },
    { id: 1157, topic: "Concimazione e fertilizzanti", q: "Il solfato di potassio, rispetto al cloruro di potassio, presenta titolo in K2O:",
      opts: ["60%, pur essendo più economico", "50%, ed è di elezione per qualità e colture ortofrutticole", "34%, adatto solo alla fertirrigazione", "24%, con apporto anche di azoto", "46%, come l'urea"], correct: 1,
      why: "Il solfato di potassio ha titolo 50% K2O (contro il 60% del cloruro) ed è preferito per qualità e per colture ortofrutticole ed esigenti in zolfo." },
    { id: 1158, topic: "Concimazione e fertilizzanti", q: "Un concime minerale composto con titolo 0-11-23 è classificato come:",
      opts: ["concime semplice fosfatico", "concime ternario NPK", "concime binario PK", "ammendante organo-minerale", "correttivo calcareo"], correct: 2,
      why: "Con azoto nullo e P2O5 e K2O presenti (0-11-23) si tratta di un binario PK; i ternari (NPK) contengono tutti e tre gli elementi principali." },
    { id: 1159, topic: "Concimazione e fertilizzanti", q: "La reazione 'costituzionale' di un concime dipende:",
      opts: ["dall'assorbimento differenziale degli ioni da parte della pianta", "dalla natura chimica del fertilizzante stesso", "dal pH iniziale del suolo prima della concimazione", "dalla dose di concime applicata", "dalla temperatura del terreno al momento della distribuzione"], correct: 1,
      why: "La reazione costituzionale dipende dalla natura del fertilizzante (es. perfosfato minerale acido, nitrato di Ca basico); la reazione fisiologica dipende invece dall'assorbimento differenziale della pianta." },
    { id: 1160, topic: "Concimazione e fertilizzanti", q: "Quale dei seguenti concimi ha reazione costituzionale basica?",
      opts: ["perfosfato minerale", "solfato ammonico", "urea", "cloruro di potassio", "nitrato di calcio"], correct: 4,
      why: "Il nitrato di calcio (come il nitrato ammonico calcareo, CAN) ha reazione costituzionale basica; il perfosfato minerale, prodotto con acido fosforico, ha invece reazione acida." },
    { id: 1161, topic: "Concimazione e fertilizzanti", q: "Per apportare 180 kg N/ha con nitrato ammonico (titolo 26% N), la quantità di concime da distribuire è circa:",
      opts: ["47 kg/ha", "180 kg/ha", "468 kg/ha", "692 kg/ha", "1800 kg/ha"], correct: 3,
      why: "Si divide l'azoto voluto per il titolo: 180 / 0,26 ≈ 692 kg/ha di concime. Moltiplicare invece di dividere (180 × 0,26 ≈ 47) è l'errore tipico." },
    { id: 1162, topic: "Concimazione e fertilizzanti", q: "Il superfosfato (perfosfato) semplice, titolo 16-20% P2O5, è caratterizzato dall'essere:",
      opts: ["solubile in acqua e in citrato ammonico neutro", "del tutto insolubile e a lentissima cessione", "solubile soltanto in acidi minerali forti", "di reazione costituzionale basica", "privo di zolfo"], correct: 0,
      why: "Il superfosfato semplice è solubile in acqua e in citrato ammonico neutro, con titolo 16-20% P2O5." },
    { id: 1163, topic: "Concimazione e fertilizzanti", q: "Rispetto al superfosfato semplice, il perfosfato triplo ha un titolo in P2O5 pari a circa:",
      opts: ["16-20%", "26%", "46%", "50%", "60%"], correct: 2,
      why: "Il perfosfato triplo ha titolo circa 46% P2O5, molto più concentrato del semplice (16-20% P2O5)." },
    { id: 1164, topic: "Concimazione e fertilizzanti", q: "I fertilizzanti 'a base di elementi secondari' contengono:",
      opts: ["esclusivamente azoto, fosforo e potassio", "microelementi chelati o complessati", "solo sostanza organica di origine animale", "inibitori della nitrificazione o dell'ureasi", "Ca, Mg o S, ma non elementi nutritivi principali"], correct: 4,
      why: "I concimi a base di elementi secondari apportano Ca, Mg o S senza contenere gli elementi principali (N, P, K); i microelementi definiscono invece un'altra categoria." },
    { id: 1165, topic: "Concimazione e fertilizzanti", q: "Il titolo totale di un concime complesso NPK 8-6-14 è pari a:",
      opts: ["14", "22", "28", "8", "34"], correct: 2,
      why: "Il titolo totale di un concime composto è la somma N+P2O5+K2O: 8+6+14 = 28." },
    { id: 1166, topic: "Concimazione e fertilizzanti", q: "Nel suolo l'urea (46% N), prima di rendere l'azoto assimilabile come ammonio, deve:",
      opts: ["essere nitrificata direttamente a nitrato senza passaggi intermedi", "subire idrolisi mediata dall'enzima ureasi", "essere denitrificata ad azoto gassoso", "reagire con il fosforo del terreno", "volatilizzare completamente come ammoniaca"], correct: 1,
      why: "L'urea richiede idrolisi mediata dall'enzima ureasi, che la trasforma in ammonio; da ciò deriva l'elevato rischio di volatilizzazione ammoniacale se non viene incorporata rapidamente." },
    { id: 1167, topic: "Concimazione e fertilizzanti", q: "Nei concimi azotati a lento rilascio ottenuti per condensazione dell'urea (urea-formaldeide, isobutilidendiurea, ecc.), la normativa prevede una presenza minima di azoto 'protetto' pari almeno a:",
      opts: ["1/10 del totale", "1/5 del totale", "metà del totale", "1/3 del totale", "2/3 del totale"], correct: 3,
      why: "Essendo commercializzati come miscele di varie forme di azoto, è prevista una presenza minima di azoto protetto pari ad almeno 1/3 del totale." },
    { id: 1168, topic: "Concimazione e fertilizzanti", q: "L'interramento di abbondante paglia di frumento (elevato rapporto C/N) determina temporaneamente nel terreno:",
      opts: ["una mineralizzazione netta con pronto rilascio di azoto disponibile", "un'immobilizzazione dell'azoto minerale («fame d'azoto») pari a circa 1 kg di N per quintale di paglia", "un aumento immediato del pH per liberazione di ammoniaca", "un accumulo di fosforo assimilabile per solubilizzazione microbica", "una perdita di azoto per denitrificazione pari a circa 10 kg N/q"], correct: 1,
      why: "Con alto C/N i microrganismi immobilizzano l'N minerale del suolo per decomporre il carbonio (fame d'azoto), quantificata dal corso in circa 1 kg N per quintale di paglia; la mineralizzazione netta prevale invece con basso C/N." },
    { id: 1169, topic: "Concimazione e fertilizzanti", q: "Un materiale a basso rapporto C/N (es. letame maturo o leguminose) interrato nel suolo determina prevalentemente:",
      opts: ["mineralizzazione netta, con rilascio immediato di azoto disponibile", "immobilizzazione dell'azoto minerale e fame d'azoto per la coltura", "volatilizzazione ammoniacale accelerata", "retrogradazione del fosforo con ferro e alluminio", "denitrificazione con perdita di N2O"], correct: 0,
      why: "Con basso C/N prevale la mineralizzazione netta e l'azoto viene reso subito disponibile; l'immobilizzazione (fame d'azoto) riguarda invece i materiali ad alto C/N come la paglia." },
    { id: 1170, topic: "Concimazione e fertilizzanti", q: "Riguardo alla velocità di rilascio dell'azoto, il programma classifica letame e compost come:",
      opts: ["entrambi a pronto effetto, come i concimi minerali", "il compost a lento rilascio e il letame a lentissimo rilascio", "il letame a lento rilascio e il compost a lentissimo rilascio", "entrambi a rilascio immediato per l'elevato contenuto di nitrati", "il letame a lentissimo rilascio e il compost a pronto effetto"], correct: 2,
      why: "Il programma indica il letame come concime a lento rilascio e il compost a lentissimo rilascio; entrambi cedono l'azoto gradualmente man mano che la frazione organica si mineralizza." },
    { id: 1171, topic: "Concimazione e fertilizzanti", q: "Nella fase biossidativa del compostaggio, la fase termofila raggiunge temperature dell'ordine di:",
      opts: ["5-15 °C", "20-30 °C", "70-90 °C", "40-65 °C", "oltre 100 °C"], correct: 3,
      why: "Il compostaggio prevede una fase biossidativa (mesofila iniziale 1-3 giorni, termofila 40-65 °C, raffreddamento) seguita dalla maturazione: la fase termofila si colloca tra 40 e 65 °C." },
    { id: 1172, topic: "Concimazione e fertilizzanti", q: "Il letame essiccato è classificato tra gli ammendanti quando rispetta:",
      opts: ["umidità massima 50% e C organico minimo 20% sul secco", "umidità massima 70% e C organico minimo 10% sul secco", "umidità massima 30% e C organico minimo 50% sul secco", "nessun limite di umidità purché il titolo in N superi il 4%", "umidità massima 30% e C organico minimo 30% sul secco"], correct: 4,
      why: "Il letame essiccato rientra tra gli ammendanti se commercializzato a umidità massima 30% e con contenuto minimo di carbonio organico sul secco pari al 30%." },
    { id: 1173, topic: "Concimazione e fertilizzanti", q: "Il compostato misto si distingue dal compostato verde perché:",
      opts: ["è ottenuto esclusivamente da residui di potatura del verde ornamentale", "non richiede la fase di maturazione", "include anche la frazione organica dei rifiuti solidi urbani (RSU)", "deriva unicamente da deiezioni zootecniche palabili", "ha un rapporto C/N più basso e agisce a pronto effetto"], correct: 2,
      why: "Il compostato verde deriva da scarti del verde ornamentale e residui vegetali, mentre il compostato misto include in più la frazione organica dei rifiuti solidi urbani (RSU)." },
    { id: 1174, topic: "Concimazione e fertilizzanti", q: "Le matrici organiche di un ammendante presentano sempre un elevato rapporto C/N perché lo scopo prevalente è:",
      opts: ["esercitare un effetto positivo sulla fisica e sulla biologia del suolo grazie all'apporto di carbonio", "fornire azoto a pronto effetto alla coltura", "correggere il pH del terreno abbassandolo", "apportare elevate quantità di potassio assimilabile", "sostituire integralmente la concimazione fosfatica"], correct: 0,
      why: "Nell'ammendante prevale l'apporto di carbonio e l'effetto sulla fisica/biologia del suolo; per questo le matrici organiche hanno sempre C/N elevato, a differenza dei concimi il cui scopo è nutritivo." },
    { id: 1175, topic: "Concimazione e fertilizzanti", q: "Nel piano di concimazione del mais, l'efficienza agronomica attribuita all'azoto del letame è:",
      opts: ["0,80, uguale a quella dell'urea", "0,60, inferiore a quella dei concimi minerali azotati (≈0,80)", "0,20, come il P2O5 del letame", "1,00, essendo l'azoto totalmente disponibile", "0,50, pari a quella del K2O"], correct: 1,
      why: "Nell'esempio di calcolo l'azoto del letame ha efficienza 0,6, inferiore all'urea e al nitrato ammonico (0,80), perché parte dell'N organico non si rende disponibile nell'annata." },
    { id: 1176, topic: "Concimazione e fertilizzanti", q: "Nel piano per il mais il K2O apportato dal letame risulta in eccesso rispetto al fabbisogno (150 vs 84 kg/ha) perché:",
      opts: ["il letame ha un titolo dichiarato in K2O del 60% come il cloruro di potassio", "il potassio del letame è totalmente lisciviato e va sovradosato", "il fabbisogno di potassio del mais è trascurabile", "non è possibile controllare il rapporto N/K2O del letame, i cui titoli sono praticamente fissi", "l'efficienza del K2O del letame è pari a 1,0"], correct: 3,
      why: "Nei fertilizzanti organici i rapporti tra gli elementi sono sostanzialmente fissi: dosando il letame sull'azoto si apporta un K2O non regolabile, che risulta in eccesso rispetto al fabbisogno." },
    { id: 1177, topic: "Concimazione e fertilizzanti", q: "I concimi organici rendono disponibili azoto e fosforo in modo graduale (non a pronto effetto) perché:",
      opts: ["contengono i nutrienti già in forma nitrica e fosfatica solubile", "hanno un titolo molto elevato che ne rallenta lo scioglimento", "sono sempre rivestiti da membrane di zolfo o resine", "vengono distribuiti esclusivamente in copertura", "la frazione organica deve prima essere mineralizzata nel suolo per risultare disponibile"], correct: 4,
      why: "La gradualità dei concimi organici dipende dal fatto che la frazione organica va mineralizzata dal suolo prima di essere assimilabile; per questo non sono a pronto effetto." },
    { id: 1178, topic: "Concimazione e fertilizzanti", q: "Il compostaggio, come descritto nel programma, si articola in:",
      opts: ["una fase biossidativa (mesofila, termofila, raffreddamento) seguita da una fase di maturazione", "un'unica fase anaerobica con produzione di biogas", "una fase di essiccazione seguita da pellettizzazione", "una fase di idrolisi dell'urea seguita dalla nitrificazione", "una fermentazione alcolica seguita da distillazione"], correct: 0,
      why: "Il compostaggio è un processo aerobico articolato in una fase biossidativa (mesofila, termofila, raffreddamento) e in una successiva fase di maturazione; la produzione di biogas caratterizza invece la digestione anaerobica." },
    { id: 1179, topic: "Concimazione e fertilizzanti", q: "Per una coltura con lunga stagione di crescita, la distribuzione degli azotati va effettuata preferibilmente:",
      opts: ["in un'unica soluzione pre-semina, per semplicità operativa", "tutta in copertura a fine ciclo", "frazionata in 2-3 apporti oppure mediante fertirrigazione", "esclusivamente con letame in autunno", "in un'unica dose localizzata alla semina"], correct: 2,
      why: "Con stagione di crescita lunga il programma suggerisce 2 o 3 apporti frazionati oppure la fertirrigazione, per seguire meglio le curve di assorbimento e ridurre le perdite dell'azoto minerale." },
    { id: 1180, topic: "Concimazione e fertilizzanti", q: "In autunno-inverno o in climi piovosi (rischio di drenaggio), per ridurre le perdite di azoto conviene impiegare l'azoto in forma:",
      opts: ["nitrica, perché non è trattenuta dal terreno", "ammoniacale, perché trattenuta sui siti di scambio cationico e quindi meno lisciviabile", "ureica non incorporata, per favorire la volatilizzazione", "gassosa, per ridurre la denitrificazione", "organica a lentissimo rilascio, indipendentemente dal clima"], correct: 1,
      why: "Con rischio di drenaggio conviene l'azoto ammoniacale, trattenuto sullo scambio cationico e poco lisciviabile; il nitrato, non trattenuto dal terreno, sarebbe invece esposto al dilavamento." },
    // Agrotecnica e rotazioni
    { id: 1181, topic: "Agrotecnica e rotazioni", q: "Su quali tre pilastri FAO si fonda l'agricoltura conservativa?",
      opts: ["Aratura profonda annuale, concimazione minerale intensiva e monosuccessione cerealicola", "Uso di sole tecniche biologiche, divieto di OGM e concimazione con solo letame", "Disturbo meccanico minimo o nullo, copertura permanente del suolo e rotazioni colturali diversificate", "Massimizzazione delle rese con input chimici di sintesi e lavorazioni energetiche profonde", "Impiego di soglie di intervento per limitare gli agrofarmaci solo quando strettamente necessario"], correct: 2,
      why: "I tre pilastri FAO della conservativa sono disturbo meccanico minimo/nullo (semina su sodo o minima lavorazione), copertura permanente del suolo e rotazioni diversificate. Il distrattore (d) descrive la convenzionale, (e) l'integrata (soglie di intervento) e (b) la biologica." },
    { id: 1182, topic: "Agrotecnica e rotazioni", q: "Quale affermazione descrive correttamente l'agricoltura biologica (organic farming)?",
      opts: ["È regolata solo a livello aziendale, senza normativa europea, e ammette gli OGM se certificati", "È regolata dal Reg. CE 834/2007 (e successivi) e dalle linee guida IFOAM, vieta gli OGM e si basa su rotazione, concimazione organica e lotta biologica", "Coincide con l'agricoltura conservativa, fondata sui tre pilastri FAO", "Prevede l'uso combinato e razionale di input chimici entro soglie di intervento", "Rinuncia alle rotazioni, puntando sulla monosuccessione sostenuta dal solo sovescio"], correct: 1,
      why: "Il biologico è normato dal Reg. CE 834/2007 e dalle linee guida IFOAM, vieta gli OGM e si regge su rotazione, concimazione organica (letame, sovescio) e lotta biologica. Il distrattore (d) è l'integrata e (c) confonde biologico e conservativa." },
    { id: 1183, topic: "Agrotecnica e rotazioni", q: "Quale delle seguenti successioni è una rotazione (avvicendamento) biennale tipica?",
      opts: ["mais – frumento – trifoglio pratense", "mais – frumento – bietola – mais", "mais – frumento – prato – prato – prato", "mais – soia", "rapa – orzo – trifoglio – frumento"], correct: 3,
      why: "Una rotazione biennale è formata da due sole colture che si ripetono (es. mais–soia, mais–frumento, mais–girasole). Il distrattore (a) è triennale, (b) quadriennale, (c) quinquennale ed (e) è la rotazione di Norfolk (quadriennale)." },
    { id: 1184, topic: "Agrotecnica e rotazioni", q: "La classica rotazione di Norfolk (fine 1700), quadriennale, prevede nell'ordine:",
      opts: ["rapa → orzo (con bulatura del trifoglio) → trifoglio → frumento", "frumento → mais → soia → bietola", "trifoglio → rapa → frumento → orzo", "mais → frumento → prato → prato", "orzo → frumento → rapa → trifoglio"], correct: 0,
      why: "La rotazione di Norfolk segue l'ordine rapa → orzo (con trifoglio bulato) → trifoglio → frumento, alternando una coltura da rinnovo, un cereale, una miglioratrice azotofissatrice e una depauperante. I distrattori (c) ed (e) presentano lo stesso insieme ma in ordine errato." },
    { id: 1185, topic: "Agrotecnica e rotazioni", q: "Nella classificazione agronomica delle colture da avvicendamento, la soia è considerata:",
      opts: ["una coltura miglioratrice pratense", "una coltura depauperante (liquidatrice)", "una coltura rinettante", "una miglioratrice propriamente detta, grazie all'azotofissazione", "una coltura da rinnovo (preparatrice)"], correct: 4,
      why: "Pur essendo una leguminosa, la soia è classificata come coltura da rinnovo (preparatrice), non come miglioratrice: è questo il punto insidioso. Il distrattore (d) sfrutta proprio l'aspettativa \"leguminosa = miglioratrice azotofissatrice\", ma nella classificazione del programma la soia sta tra le colture da rinnovo." },
    { id: 1186, topic: "Agrotecnica e rotazioni", q: "La canapa è l'esempio tipico di quale categoria di coltura nell'avvicendamento?",
      opts: ["depauperante", "da rinnovo", "rinettante", "miglioratrice pratense", "intercalare da secondo raccolto"], correct: 2,
      why: "La canapa è l'esempio classico di coltura rinettante, che \"ripulisce\" il terreno soffocando e riducendo le infestanti. Da rinnovo sono invece mais, girasole, tabacco e pomodoro; depauperanti i cereali autunno-vernini e il lino." },
    { id: 1187, topic: "Agrotecnica e rotazioni", q: "Il mais in omosuccessione, aumentando la concimazione azotata, raggiunge rese vicine a quelle del mais coltivato dopo un prato. Questo dimostra che:",
      opts: ["la concimazione azotata surroga, cioè sostituisce solo in parte, l'effetto positivo della rotazione", "l'omosuccessione è sempre più produttiva della rotazione", "il prato è una coltura depauperante che impoverisce di azoto il suolo", "la rotazione non ha alcun effetto sulla resa del mais", "l'azoto è un fattore produttivo non gestibile, come CO2 e radiazione"], correct: 0,
      why: "È l'effetto surrogante dell'agrotecnica: la concimazione azotata compensa in parte l'azoto residuo che il prato (leguminosa) lasciava, ma \"surroga\" senza sostituire del tutto i benefici sanitari e fisici della rotazione. Il prato è miglioratrice (non depaupera l'azoto) e l'azoto è un fattore limitante gestibile, non un fattore produttivo non gestibile." },
    { id: 1188, topic: "Agrotecnica e rotazioni", q: "Quale delle seguenti colture tollera bene l'omosuccessione (ripetizione sullo stesso terreno)?",
      opts: ["bietola", "girasole", "medica", "riso", "pomodoro"], correct: 3,
      why: "Tra le colture adatte all'omosuccessione il programma cita frumento, mais, riso, graminacee foraggere e molte arboree. Bietola, girasole, medica, aglio, asparago e pomodoro rientrano invece tra quelle che necessitano di rotazione." },
    { id: 1189, topic: "Agrotecnica e rotazioni", q: "Tra i vantaggi tradizionali del maggese, quale è considerato l'unico ancora valido con l'agrotecnica moderna?",
      opts: ["il ripristino della sostanza organica", "l'accumulo di acqua per la coltura successiva", "la riduzione della virulenza dei parassiti", "il contenimento delle infestanti", "l'aumento diretto della resa della coltura in atto sul maggese"], correct: 1,
      why: "Secondo il programma l'accumulo di acqua per la coltura successiva è l'unico vantaggio del maggese ancora attuale; ripristino della sostanza organica, riduzione dei parassiti e contenimento delle infestanti sono ormai superati dall'agrotecnica. Il distrattore (e) è privo di senso, perché sul maggese il terreno resta a riposo, senza coltura da produrre." },
    // Difesa, diserbo e lavorazioni
    { id: 1190, topic: "Difesa, diserbo e lavorazioni", q: "Nell'aratro, quale organo lavorante riceve la fetta tagliata dal vomere, la solleva, la frantuma per flessione e la ribalta lateralmente?",
      opts: ["Il coltello (o disco)", "Il vomere", "Il versoio (o barella)", "L'avanvomere", "Il coltro assolcatore"], correct: 2,
      why: "Il versoio (o barella) è la superficie curva che riceve la fetta tagliata dal vomere, la solleva, la frantuma per flessione e la ribalta lateralmente; il coltello esegue il taglio verticale, il vomere quello orizzontale sul fondo del solco e l'avanvomere interra la vegetazione superficiale (SCHEDA #54)." },
    { id: 1191, topic: "Difesa, diserbo e lavorazioni", q: "Durante l'aratura la fetta di terreno viene sollevata e sottoposta a una rotazione parziale di circa:",
      opts: ["45°", "90°", "180°", "360°", "135°"], correct: 4,
      why: "L'aratura consiste in taglio, sollevamento, parziale rotazione (circa 135°) e ribaltamento della fetta nel solco aperto in precedenza; 180° corrisponderebbe a un capovolgimento completo, non tipico dell'aratura ordinaria (SCHEDA #54)." },
    { id: 1192, topic: "Difesa, diserbo e lavorazioni", q: "Secondo la classificazione per profondità, l'aratura definita \"media\" (standard per la maggior parte delle colture da rinnovo) si esegue a:",
      opts: ["15-25 cm", "25-40 cm", "40-60 cm", "60-80 cm", "oltre 80 cm"], correct: 1,
      why: "La classificazione distingue aratura superficiale (15-25 cm), media (25-40 cm, standard per la maggior parte delle colture da rinnovo) e profonda (>40 cm); profondità di 80-100 cm sono proprie dello scasso, non dell'aratura ordinaria (SCHEDA #54)." },
    { id: 1193, topic: "Difesa, diserbo e lavorazioni", q: "Quale attrezzo è indicato per rompere la \"suola di lavorazione\" agendo in profondità senza rovesciare gli strati e mantenendo invariata la stratigrafia del profilo?",
      opts: ["L'aratro a versoio semplice", "L'erpice a dischi", "La zappatrice rotativa (fresa)", "Il ripuntatore (discissore)", "Il rullo Cambridge"], correct: 3,
      why: "I discissori (ripuntatori) effettuano tagli verticali in profondità senza rovesciamento né alterazione della stratigrafia, rompendo la suola di lavorazione e ripristinando il drenaggio; l'uso ripetuto dell'aratro a versoio alla stessa profondità è invece la causa della suola compatta (SCHEDA #50)." },
    { id: 1194, topic: "Difesa, diserbo e lavorazioni", q: "La lavorazione con zappatrice rotativa (fresa) garantisce un elevatissimo grado di affinamento in un unico passaggio, ma comporta il rischio di:",
      opts: ["polverizzazione del suolo e formazione di una suola di fresatura", "rovesciamento eccessivo della fetta e interramento profondo dei residui", "totale assenza di controllo delle infestanti annuali", "produzione di zolle di grosse dimensioni non affinabili", "impossibilità di preparare un letto di semina soffice"], correct: 0,
      why: "La fresa, organo rimescolatore ad asse orizzontale, può polverizzare il terreno e creare una suola di fresatura; rimescola e affina (non rovescia la fetta né lascia grosse zolle), e l'eccessivo affinamento favorisce poi la crosta superficiale battente (SCHEDA #56)." },
    { id: 1195, topic: "Difesa, diserbo e lavorazioni", q: "Rispetto all'aratura convenzionale, la semina su sodo (no-tillage) presenta, tra i suoi svantaggi principali:",
      opts: ["elevati consumi di carburante fino a 80-100 L/ha", "massima esposizione del suolo nudo all'erosione idrica ed eolica", "scarsa formazione di macropori e lenta infiltrazione dell'acqua", "accelerazione della mineralizzazione della sostanza organica", "formazione della suola di lavorazione da aratura ripetuta"], correct: 2,
      why: "Nel sodo mancano le lavorazioni che creano macroporosità, perciò l'infiltrazione è lenta e aumenta la resistenza alla penetrazione radicale. Elevati consumi, erosione del suolo nudo e suola di lavorazione sono invece tipici del convenzionale, mentre il sodo riduce (non accelera) la mineralizzazione (SCHEDA #61)." },
    { id: 1196, topic: "Difesa, diserbo e lavorazioni", q: "Nell'ambito della minima lavorazione, la tecnica basata su \"porche permanenti\", con la cresta rimossa ogni anno in primavera e poi ricreata con la rincalzatura, è denominata:",
      opts: ["Minimum tillage", "Strip tillage (zone tillage)", "No-tillage (sodo)", "Ridge tillage", "Clean tillage"], correct: 3,
      why: "Il ridge tillage prevede la coltivazione in «porche permanenti», con la cresta rimossa ogni anno in primavera e ricreata con la rincalzatura. Lo strip tillage lavora solo una striscia, il minimum tillage lavora tutta la superficie a ~5-15 cm, il no-tillage non prevede lavorazioni e il clean tillage è il sistema convenzionale basato sull'aratura (SCHEDA #62)." },
    { id: 1197, topic: "Difesa, diserbo e lavorazioni", q: "La sarchiatura tra le file è praticabile soltanto su colture con interfila di almeno:",
      opts: ["30 cm", "5 cm", "10 cm", "15 cm", "20 cm"], correct: 0,
      why: "La sarchiatura è una lavorazione superficiale eseguita nello spazio tra le file di colture con file distanziate di almeno 30 cm (mais, sorgo, barbabietola, girasole, soia, tabacco); interfile più strette non consentono il passaggio degli organi lavoranti tra le file (SCHEDA #57)." },
    { id: 1198, topic: "Difesa, diserbo e lavorazioni", q: "Nello strato di suolo 0-40 cm, la consistenza media della banca dei semi (flora potenziale) di un terreno agrario è stimabile nell'ordine di:",
      opts: ["circa 10.000 semi/ha", "circa 1 milione di semi/ha", "circa 100 milioni di semi/ha", "circa 1 miliardo di semi/ha", "circa 100 semi/ha"], correct: 2,
      why: "Il programma stima la banca semi in circa 100 milioni di semi/ha nello strato 0-40 cm (range da 50-60 milioni fino a 200-400 milioni). Valori dell'ordine del migliaio o del milione sono troppo bassi, il miliardo troppo alto." },
    { id: 1199, topic: "Difesa, diserbo e lavorazioni", q: "Che cosa caratterizza un erbicida ad azione residuale (o di suolo)?",
      opts: ["Agisce dal terreno colpendo i semi e le plantule in germinazione e, per intercettare le emergenze scalari nel tempo, deve essere persistente", "Devitalizza soltanto i tessuti verdi con cui viene a diretto contatto, senza traslocare nella pianta", "Viene assorbito dalle foglie e traslocato fino agli organi sotterranei delle infestanti perenni", "Può essere poco persistente, perché colpisce esclusivamente le infestanti già emerse", "È attivo unicamente se distribuito in post-emergenza tardiva su piante adulte"], correct: 0,
      why: "I residuali agiscono dal suolo sulle plantule in germinazione e, usati in pre-emergenza, devono essere persistenti per intercettare le emergenze nel tempo. La descrizione di contatto (b) e sistemico (c) individua altre modalità d'azione; i prodotti poco persistenti (d) sono tipici del post-emergenza." },
    { id: 1200, topic: "Difesa, diserbo e lavorazioni", q: "L'attivazione di un erbicida distribuito in pre-emergenza richiede tipicamente:",
      opts: ["una pioggia di 50-60 mm nelle 24 ore successive al trattamento", "una pioggia di 10-15 mm entro 2-3 settimane dal trattamento, che lo trasloca nei primi centimetri di suolo", "l'assenza totale di precipitazioni per almeno un mese dopo il trattamento", "una pioggia di 1-2 mm immediatamente dopo l'applicazione", "l'esposizione diretta alla luce solare, che ne innesca la fotoattivazione"], correct: 1,
      why: "Il programma indica che il pre-emergenza si attiva con una pioggia di 10-15 mm entro 2-3 settimane, che porta la sostanza attiva nei primi centimetri di suolo; nelle stagioni molto asciutte l'efficacia risulta scarsa (rischio di mancata attivazione ~1 anno su 4)." },
    { id: 1201, topic: "Difesa, diserbo e lavorazioni", q: "Riferita a un erbicida, l'espressione \"ampio spettro d'azione\" indica:",
      opts: ["l'assenza di danni alla coltura in cui viene distribuito", "la capacità di traslocare fino agli organi sotterranei delle infestanti perenni", "la prolungata persistenza dell'azione residuale nel suolo", "l'elevato numero di specie infestanti che il prodotto è in grado di controllare", "la doppia modalità di assorbimento, sia fogliare sia radicale"], correct: 3,
      why: "Ampio spettro si riferisce al numero di specie controllate, ed è concetto distinto dalla non selettività (che riguarda il danno anche alla coltura): il glifosate è insieme ampio spettro e non selettivo. L'opzione a descrive invece la selettività." },
    { id: 1202, topic: "Difesa, diserbo e lavorazioni", q: "Per il controllo chimico di infestanti perenni geofite come Sorghum halepense e Cynodon dactylon, dotate di vigorosi organi sotterranei (rizomi, stoloni), occorre impiegare erbicidi:",
      opts: ["di contatto, che devitalizzano solo la parte aerea con cui vengono a contatto", "residuali, attivi unicamente sui semi in germinazione nel suolo", "selettivi non sistemici, distribuiti con irroratrici schermate", "poco persistenti, perché colpiscono le sole plantule già emerse in superficie", "sistemici (di traslocazione), capaci di raggiungere e devitalizzare le gemme degli organi sotterranei"], correct: 4,
      why: "Le perenni geofite ricacciano dagli organi sotterranei, quindi solo un erbicida sistemico traslocato (es. glifosate) può devitalizzarne le gemme di rizomi e stoloni. Un prodotto di contatto colpirebbe la sola parte aerea, lasciando intatti gli organi ipogei che ricacciano." },
    { id: 1203, topic: "Difesa, diserbo e lavorazioni", q: "L'uso ripetuto e continuo nel tempo dello stesso principio attivo o dello stesso meccanismo d'azione (MoA) comporta:",
      opts: ["un progressivo aumento della selettività del prodotto sulla coltura", "l'azzeramento definitivo della banca semi delle specie bersaglio", "la selezione di biotipi resistenti, che impone la rotazione dei meccanismi d'azione", "una riduzione garantita dei costi di diserbo nel lungo periodo", "la conversione dell'erbicida da sistemico a residuale"], correct: 2,
      why: "La pressione selettiva dello stesso MoA seleziona biotipi resistenti (es. giavone resistente agli inibitori dell'ALS); per questo la classificazione HRAC serve a ruotare i meccanismi d'azione. La resistenza non azzera la banca semi né aumenta la selettività." },
    { id: 1204, topic: "Difesa, diserbo e lavorazioni", q: "Nel controllo delle infestanti, il \"periodo critico di competizione\" è definito come:",
      opts: ["il periodo successivo alla raccolta in cui la banca semi raggiunge la massima consistenza", "l'intervallo di tempo compreso tra la curva del PRAM e quella della DCT, entro cui la coltura va mantenuta pulita per contenere la perdita entro il livello accettato", "l'intero ciclo colturale, dall'emergenza fino alla maturazione della coltura", "il momento di massima emergenza delle infestanti nel calendario delle emergenze", "la fase in cui l'erbicida residuale esaurisce la propria persistenza nel suolo"], correct: 1,
      why: "Il periodo critico è l'intervallo compreso tra le due curve complementari PRAM (periodo richiesto di assenza malerbe) e DCT (durata della competizione tollerata), fissato in base alla perdita produttiva accettata (es. -5%). Non coincide con l'intero ciclo colturale." },
  ];

  REAL.forEach(function (q) { q.real = true; });
  GEN.forEach(function (q) { q.real = false; });
  const BANK = REAL.concat(GEN);

  const TOPICS = ['Clima e acqua', 'Suolo: struttura e acqua', 'Sistemazioni ed erosione',
    'Concimazione e fertilizzanti', 'Agrotecnica e rotazioni', 'Difesa, diserbo e lavorazioni'];

  // Sorgente attiva per simulazione/allenamento: 'all' | 'gen' | 'real'.
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

  // seen = volte che una domanda è stata affrontata (cumulativo)
  // miss = volte che è stata sbagliata (cumulativo, per statistiche punti deboli)
  // wrong = domande attualmente "da ripassare" (si azzera quando la indovini)
  function recordAnswer(qid, ok) {
    store.seen[qid] = (store.seen[qid] || 0) + 1;
    if (ok) { if (store.wrong[qid]) delete store.wrong[qid]; }
    else { store.wrong[qid] = (store.wrong[qid] || 0) + 1; store.miss[qid] = (store.miss[qid] || 0) + 1; }
  }
  function wrongIds() { return Object.keys(store.wrong).map(Number); }

  // Accuratezza per argomento (per i "punti deboli"): {topic:{seen,miss}}.
  function topicStats() {
    const m = {};
    TOPICS.forEach(function (t) { m[t] = { seen: 0, miss: 0 }; });
    BANK.forEach(function (q) {
      if (!m[q.topic]) return;
      m[q.topic].seen += store.seen[q.id] || 0;
      m[q.topic].miss += store.miss[q.id] || 0;
    });
    return m;
  }

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

  // Badge che distingue le domande reali da quelle generate.
  function srcBadge(q) {
    return q.real
      ? '<span class="esame-src esame-src-real">Esame reale</span>'
      : '<span class="esame-src esame-src-gen">Stile esame</span>';
  }

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
    const p = pool();
    const nReal = BANK.filter(q => q.real).length;
    const nGen = BANK.filter(q => !q.real).length;

    // Selettore sorgente
    const seg = [
      { k: 'all', label: 'Tutte', n: BANK.length },
      { k: 'gen', label: "Simili all'esame", n: nGen },
      { k: 'real', label: 'Reali', n: nReal },
    ].map(s => '<button class="esame-seg-btn' + (source === s.k ? ' is-active' : '') +
      '" data-src="' + s.k + '">' + s.label + ' <span class="esame-seg-n">' + s.n + '</span></button>').join('');

    // Punti deboli (accuratezza per argomento, dai tuoi errori)
    const ts = topicStats();
    const weak = TOPICS.map(t => ({ t: t, s: ts[t] }))
      .filter(x => x.s.seen > 0)
      .map(x => ({ t: x.t, acc: 1 - x.s.miss / x.s.seen }))
      .sort((a, b) => a.acc - b.acc);
    const weakHTML = weak.length ? (
      '<div class="esame-weak">' +
        '<div class="esame-weak-h">I tuoi punti deboli</div>' +
        weak.map(w => {
          const pct = Math.round(w.acc * 100);
          return '<button class="esame-weak-row" data-topic="' + escapeHtml(w.t) + '" title="Allenati su questo argomento">' +
            '<span class="esame-weak-t">' + escapeHtml(w.t) + '</span>' +
            '<span class="esame-weak-bar"><span class="esame-weak-fill" style="width:' + pct + '%"></span></span>' +
            '<span class="esame-weak-pct">' + pct + '%</span>' +
          '</button>';
        }).join('') +
      '</div>'
    ) : '';

    // Argomenti dal pool corrente
    const topicChips = TOPICS.map(t => {
      const n = p.filter(q => q.topic === t).length;
      return '<button class="esame-topic" data-topic="' + escapeHtml(t) + '"' + (n ? '' : ' disabled') + '>' +
        escapeHtml(t) + ' <span class="esame-topic-n">' + n + '</span></button>';
    }).join('');

    stageEl().innerHTML =
      '<div class="esame-home">' +
        '<h2 class="esame-h">Preparazione all\'esame</h2>' +
        '<p class="esame-sub">' + nReal + ' domande reali dell\'appello + ' + nGen + ' generate sullo stesso modello.</p>' +
        (best ? '<div class="esame-best">Record simulazione: <strong>' + best.score + '/' + best.total + '</strong></div>' : '') +
        weakHTML +
        '<div class="esame-seg-wrap">' +
          '<div class="esame-seg-label">Attingi da</div>' +
          '<div class="esame-seg">' + seg + '</div>' +
        '</div>' +
        '<div class="esame-modes">' +
          '<button class="esame-mode esame-mode-exam" id="esameStartExam">' +
            '<span class="esame-mode-t">Simulazione d\'esame</span>' +
            '<span class="esame-mode-d">' + Math.min(EXAM_SIZE, p.length) + ' domande estratte a caso, sempre diverse. Punteggio finale con soglia ~' + Math.ceil(EXAM_SIZE * PASS_RATIO) + '/' + EXAM_SIZE + '.</span>' +
          '</button>' +
          (nWrong ? '<button class="esame-mode esame-mode-wrong" id="esameStartWrong">' +
            '<span class="esame-mode-t">Ripassa i tuoi errori <span class="esame-badge">' + nWrong + '</span></span>' +
            '<span class="esame-mode-d">Solo le domande che hai sbagliato nelle prove precedenti.</span>' +
          '</button>' : '') +
          '<button class="esame-mode esame-mode-ref" id="esameNumeriBtn">' +
            '<span class="esame-mode-t">Numeri chiave da ricordare</span>' +
            '<span class="esame-mode-d">Il formulario essenziale: conversioni, titoli dei concimi, dosi, potenziali…</span>' +
          '</button>' +
        '</div>' +
        '<div class="esame-train">' +
          '<div class="esame-train-t">Allenamento per argomento <span class="esame-train-d">(feedback subito dopo ogni risposta)</span></div>' +
          '<div class="esame-topics">' +
            '<button class="esame-topic esame-topic-all" data-topic="__all">Tutti <span class="esame-topic-n">' + p.length + '</span></button>' +
            topicChips +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('esameStartExam').addEventListener('click', () => startExam());
    const w = document.getElementById('esameStartWrong');
    if (w) w.addEventListener('click', () => startWrong());
    document.getElementById('esameNumeriBtn').addEventListener('click', renderNumeri);
    stageEl().querySelectorAll('.esame-seg-btn').forEach(b => {
      b.addEventListener('click', () => { source = b.getAttribute('data-src'); renderHome(); });
    });
    stageEl().querySelectorAll('.esame-weak-row').forEach(b => {
      b.addEventListener('click', () => startTrain(b.getAttribute('data-topic')));
    });
    stageEl().querySelectorAll('.esame-topic').forEach(b => {
      b.addEventListener('click', () => {
        const t = b.getAttribute('data-topic');
        startTrain(t === '__all' ? null : t);
      });
    });
  }

  // ── Numeri chiave (formulario) ───────────────────────────────────────
  function renderNumeri() {
    setProgress(0);
    document.getElementById('esameCounter').textContent = '';
    const groups = [
      ['Acqua e pioggia', [
        '1 mm di pioggia = 1 L/m² = 10 m³/ha (10.000 L/ha)',
        '1 ettaro = 10.000 m²',
        "Umidità relativa: minima nel primo pomeriggio, massima prima dell'alba",
        'Inversione termica al suolo → nebbia e gelate per irraggiamento',
      ]],
      ['Suolo: acqua e densità', [
        'Densità apparente ≈ 1,2-1,4 g/cm³ · densità reale ≈ 2,65 g/cm³',
        'Porosità totale = 1 − (densità apparente / densità reale)',
        'Contenuto idrico alla saturazione = porosità totale',
        'Capacità di campo ≈ −0,33 bar · Punto di appassimento ≈ −15 bar',
        'Acqua disponibile = tra capacità di campo e punto di appassimento',
        'Porosità ottimale ≈ 40% macropori / 60% micropori',
        "Potenziale idrico: Pa, bar, m (altezza colonna d'acqua)",
      ]],
      ['Sostanza organica', [
        "C/N alto (>20) → umificazione e immobilizzazione dell'azoto",
        'C/N basso → mineralizzazione rapida e rilascio di azoto',
        'Azoto nei tessuti maturi ≈ 1-3%',
        'Strato lavorato = orizzonte Ap',
      ]],
      ['Concimi e azoto', [
        'Titolo espresso come: N (azoto), P₂O₅ (fosforo), K₂O (potassio)',
        'Titoli azotati: ammoniaca anidra ≈ 82% · urea ≈ 46% · nitrato ammonico ≈ 26-34% · solfato ammonico ≈ 21% · nitrato di calcio ≈ 15%',
        "Efficienza d'uso dell'azoto in copertura ≈ 0,8",
        'Nitrati = mobili e dilavabili · Ammonio = trattenuto dai colloidi',
        'Perdite di N: NH₃ (volatilizzazione), nitrati (lisciviazione), N₂ (denitrificazione in anaerobiosi)',
        'Fosforo poco mobile → interrato in pre-semina',
      ]],
      ['Fertilizzanti organici', [
        'Letame = deiezioni + lettiera · dose ≈ 30-50 t/ha',
        'Liquame = deiezioni + acque di lavaggio (senza lettiera)',
        'Compost = via aerobica · Digestato = via anaerobica (biogas)',
      ]],
      ['Sistemazioni ed erosione', [
        'Baulatura = superficie convessa (scola ai lati)',
        'Terreno argilloso → scoline più ravvicinate (drena lento)',
        'Terrazzamenti → riducono la lunghezza del versante',
        'Erosione ↑ con la pendenza · ↓ con la copertura vegetale',
      ]],
      ['Agrotecnica e difesa', [
        'Rotazione = colture nel tempo · Consociazione = colture insieme nello spazio',
        'Leguminose = miglioratrici (fissano azoto coi rizobi)',
        'Diserbo: pre-emergenza (antigerminello) / post-emergenza (malerbe emerse)',
        "Safener = rende selettivo l'erbicida (protegge la coltura)",
        'Lavorazioni conservative → più sostanza organica in superficie',
      ]],
    ];
    stageEl().innerHTML =
      '<div class="esame-numeri">' +
        '<h2 class="esame-h">Numeri chiave da ricordare</h2>' +
        '<p class="esame-sub">I dati che tornano più spesso all\'esame. Rileggili prima di ogni simulazione.</p>' +
        groups.map(g =>
          '<div class="esame-num-group">' +
            '<div class="esame-num-h">' + escapeHtml(g[0]) + '</div>' +
            '<ul class="esame-num-list">' +
              g[1].map(x => '<li>' + escapeHtml(x) + '</li>').join('') +
            '</ul>' +
          '</div>').join('') +
        '<button class="esame-secondary" id="esameNumBack">Torna al menu</button>' +
      '</div>';
    document.getElementById('esameNumBack').addEventListener('click', renderHome);
  }

  // ── Avvii ────────────────────────────────────────────────────────────
  function startExam() {
    mode = 'exam';
    queue = shuffle(pool()).slice(0, EXAM_SIZE).map(prep);
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
    const list = topic ? pool().filter(q => q.topic === topic) : pool();
    queue = shuffle(list).map(prep);
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
        '<div class="esame-q-head">' +
          '<span class="esame-q-topic">' + escapeHtml(item.ref.topic) + '</span>' +
          srcBadge(item.ref) +
        '</div>' +
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
            '<div class="esame-review-q">' + srcBadge(a.item.ref) + ' ' + escapeHtml(a.item.ref.q) + '</div>' +
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

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

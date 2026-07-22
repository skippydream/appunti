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

    // ── Secondo lotto (5 opzioni, proporzionato all'ampiezza del programma) ──
    // Clima e acqua
    { id: 1205, topic: "Clima e acqua", q: "La costante solare, cioè la densità di flusso della radiazione solare che arriva al limite superiore dell'atmosfera, vale circa:",
      opts: ["342 W/m²", "100 W/m²", "1367 kW/m²", "2,45 MJ/m²", "1367 W/m²"], correct: 4,
      why: "La scheda sulla radiazione solare fissa la costante solare a 1367 W/m². Le altre cifre confondono l'unità (kW), la radiazione media incidente al suolo o il calore latente di vaporizzazione." },
    { id: 1206, topic: "Clima e acqua", q: "Nell'equazione del bilancio radiativo superficiale Rn = Rs·(1 − α) + Rld − Rlu, il termine α (albedo) rappresenta:",
      opts: ["la frazione di radiazione solare incidente riflessa dalla superficie", "la radiazione a onda lunga riemessa dal terreno", "la frazione di radiazione a onda corta assorbita dal suolo", "la radiazione netta disponibile alla superficie", "la radiazione a onda lunga proveniente dall'atmosfera"], correct: 0,
      why: "L'albedo è la riflettività superficiale (frazione di radiazione solare incidente riflessa); perciò Rs·(1 − α) è la quota di onda corta effettivamente assorbita. Rlu è l'onda lunga riemessa e Rld quella atmosferica in ingresso." },
    { id: 1207, topic: "Clima e acqua", q: "Fra le seguenti superfici, quale presenta il valore di albedo (α) più elevato?",
      opts: ["Terreno umido (α ≈ 0,10)", "Coltura erbacea verde in pieno sviluppo (α ≈ 0,20-0,25)", "Suolo scuro e umido (α ≈ 0,05-0,15)", "Neve fresca (α ≈ 0,80-0,90)", "Suolo chiaro e secco (α ≈ 0,25-0,35)"], correct: 3,
      why: "La neve fresca riflette gran parte della radiazione solare e ha l'albedo più alto (0,80-0,90), nettamente superiore a suoli e colture verdi." },
    { id: 1208, topic: "Clima e acqua", q: "I gradi-giorno di sviluppo (GDD) accumulati in un giorno si calcolano come:",
      opts: ["(Tmax − Tmin) − Tbase", "(Tmax + Tmin)/2 − Tbase", "(Tmax + Tmin)/2 + Tbase", "Tbase − (Tmax + Tmin)/2", "(Tmax + Tmin + Tbase)/3"], correct: 1,
      why: "I GDD si ottengono sottraendo la temperatura base alla temperatura media giornaliera [(Tmax+Tmin)/2]; per convenzione, se la media è inferiore a Tbase il contributo del giorno è posto pari a 0." },
    { id: 1209, topic: "Clima e acqua", q: "La 'temperatura base' o zero di vegetazione (Tbase) di una specie è:",
      opts: ["la temperatura oltre la quale lo sviluppo cessa e iniziano i danni cellulari", "la temperatura alla quale la velocità di sviluppo è massima", "la temperatura al di sotto della quale lo sviluppo si arresta", "la temperatura media annua della località di coltivazione", "la temperatura critica letale che provoca danni irreparabili"], correct: 2,
      why: "La temperatura base (o zero di vegetazione) è la soglia minima sotto la quale lo sviluppo si arresta (es. 0-4°C per il frumento, 10°C per il mais); è il valore sottratto nel calcolo dei GDD." },
    { id: 1210, topic: "Clima e acqua", q: "In una giornata serena, la temperatura minima dell'aria si registra tipicamente:",
      opts: ["all'alba", "1-2 ore dopo il mezzogiorno solare", "a mezzanotte", "subito dopo il tramonto", "a mezzogiorno solare"], correct: 0,
      why: "La minima giornaliera si ha all'alba, al termine del raffreddamento notturno per irraggiamento; la massima si registra invece 1-2 ore dopo il mezzogiorno solare. La loro differenza è l'escursione termica giornaliera." },
    { id: 1211, topic: "Clima e acqua", q: "La traspirazione, componente dell'evapotraspirazione, consiste nell'acqua convertita in vapore e rilasciata dalla pianta:",
      opts: ["dalla superficie del suolo per effetto della radiazione solare", "soprattutto attraverso gli stomi delle foglie", "attraverso il floema in direzione delle radici", "per risalita capillare dagli strati profondi del suolo", "esclusivamente attraverso la cuticola del fusto"], correct: 1,
      why: "La traspirazione è l'acqua vaporizzata negli spazi intercellulari delle foglie e rilasciata soprattutto attraverso gli stomi; la vaporizzazione dalla superficie del suolo è invece l'evaporazione. Le due avvengono simultaneamente e non sono distinguibili." },
    { id: 1212, topic: "Clima e acqua", q: "L'evapotraspirazione dissipa la radiazione netta sotto forma di calore latente (LE): per evaporare 1 kg di acqua a 20°C occorrono circa:",
      opts: ["0,408 MJ", "333 kJ", "2,45 MJ", "1367 J", "84 kJ"], correct: 2,
      why: "Il calore latente di vaporizzazione dell'acqua è circa 2,45 MJ per kg a 20°C, l'energia sottratta come flusso LE nell'evapotraspirazione. I 333 kJ/kg sono invece il calore latente di fusione (congelamento)." },
    { id: 1213, topic: "Clima e acqua", q: "Nel bilancio idrico I = ET − N + Pr ± D, il termine N (apporti naturali) comprende:",
      opts: ["il drenaggio profondo e il ruscellamento superficiale", "l'evapotraspirazione della coltura", "la variazione di umidità immagazzinata nel suolo", "la pioggia utile, la rugiada e le risalite capillari o di falda", "il volume di acqua irrigua da somministrare"], correct: 3,
      why: "N raccoglie gli apporti naturali di acqua (pioggia utile, neve, grandine, rugiada, risalite capillari o di falda, ruscellamento sottosuperficiale); entra con segno negativo perché riduce il fabbisogno irriguo I." },
    { id: 1214, topic: "Clima e acqua", q: "Sempre nel bilancio idrico I = ET − N + Pr ± D, il termine Pr (perdite) è costituito principalmente da:",
      opts: ["pioggia utile e rugiada", "risalita capillare dalla falda", "evapotraspirazione effettiva della coltura", "variazione del contenuto idrico del suolo", "drenaggio profondo e ruscellamento superficiale o sottosuperficiale"], correct: 4,
      why: "Pr rappresenta le perdite di acqua dal sistema (drenaggio profondo, ruscellamento superficiale o sottosuperficiale) ed entra con segno positivo perché aumenta il fabbisogno irriguo I." },
    { id: 1215, topic: "Clima e acqua", q: "Uno scroscio temporalesco con intensita di 30-50 mm/h ha come effetto agronomico prevalente:",
      opts: ["una ricarica efficiente e profonda delle riserve idriche del suolo", "ruscellamento superficiale ed erosione, con scarsa ricarica degli strati profondi", "un immediato aumento dell'umidita di saturazione dell'aria sovrastante", "la formazione di abbondante rugiada sulla vegetazione", "un forte incremento dell'albedo del terreno bagnato"], correct: 1,
      why: "Le piogge molto intense (30-50 mm/h) superano la capacita di infiltrazione del suolo: l'acqua scorre in superficie provocando erosione e non ricarica le riserve idriche profonde (Scheda #42)." },
    { id: 1216, topic: "Clima e acqua", q: "Quale strumento fornisce esclusivamente il totale di pioggia caduta tra un'osservazione e la successiva, senza informazioni sull'andamento temporale?",
      opts: ["Il pluviografo", "L'evaporimetro di classe A", "Il piranometro", "Il tensiometro", "Il pluviometro"], correct: 4,
      why: "Il pluviometro fornisce solo il totale accumulato fra due letture; per conoscere l'andamento nel tempo e quindi l'intensita serve il pluviografo, che registra in continuo (Scheda #1025)." },
    { id: 1217, topic: "Clima e acqua", q: "Rispetto al pluviometro, il pluviografo consente in piu di:",
      opts: ["misurare la radiazione globale incidente sulla stazione", "determinare l'intensita della pioggia (mm/h) perche registra in continuo il momento in cui l'acqua si cumula", "misurare l'umidita relativa dell'aria", "stimare direttamente l'evapotraspirazione di riferimento ET0", "misurare la tensione matriciale del suolo"], correct: 1,
      why: "Il pluviografo registra in continuo segnando l'istante in cui la pioggia si accumula; da questa registrazione si ricava l'intensita (mm/h), impossibile da ottenere con il solo pluviometro (Scheda #1025)." },
    { id: 1218, topic: "Clima e acqua", q: "Un pluviografo registra 12 mm di pioggia in 20 minuti. L'intensita media della precipitazione e pari a:",
      opts: ["12 mm/h", "24 mm/h", "36 mm/h", "6 mm/h", "40 mm/h"], correct: 2,
      why: "L'intensita e l'altezza di pioggia rapportata al tempo: 12 mm in 20 min = 12 x (60/20) = 36 mm/h, valore che rientra nell'intervallo delle piogge intense (30-50 mm/h)." },
    { id: 1219, topic: "Clima e acqua", q: "Nel bilancio idrico agronomico, come vengono classificati rispettivamente il ruscellamento superficiale e quello sottosuperficiale in ingresso all'appezzamento?",
      opts: ["Entrambi come apporti naturali (N)", "Entrambi come perdite (Pr)", "Il superficiale come apporto (N), il sottosuperficiale come perdita (Pr)", "Il superficiale come perdita (Pr), il sottosuperficiale in ingresso come apporto naturale (N)", "Entrambi come variazione di umidita immagazzinata (D)"], correct: 3,
      why: "Il ruscellamento superficiale allontana acqua dall'appezzamento ed e una perdita (Pr); il ruscellamento sottosuperficiale in ingresso apporta acqua ed e conteggiato tra gli apporti naturali (N) (Scheda #69)." },
    { id: 1220, topic: "Clima e acqua", q: "Nell'equazione del fabbisogno irriguo I = ET - N + Pr +/- D, il termine D rappresenta:",
      opts: ["la variazione dell'umidita immagazzinata nel suolo (e nella vegetazione)", "il drenaggio profondo oltre la zona radicale", "la densita apparente del terreno", "la durata del ciclo colturale", "il deficit di pressione di vapore dell'aria"], correct: 0,
      why: "D e la variazione dell'acqua immagazzinata nel suolo e nella vegetazione tra inizio e fine del periodo; entra nel bilancio con segno +/- a seconda che la riserva aumenti o diminuisca (Scheda #69)." },
    { id: 1221, topic: "Clima e acqua", q: "La Riserva Facilmente Utilizzabile (RFU), quota di riserva idrica estraibile dalla coltura senza stress, si assume convenzionalmente pari a:",
      opts: ["il 100% della riserva utile per tutte le colture", "sempre il 50% della RU indipendentemente dalla coltura", "il 60-70% della RU per le colture esigenti e il 30-40% per quelle poco esigenti", "il 30-40% della RU per le colture esigenti e il 60-70% per quelle poco esigenti", "la frazione di acqua trattenuta oltre la capacita idrica massima (CIM)"], correct: 3,
      why: "La RFU e la parte di riserva utile asportabile senza stress: si assume il 30-40% della RU per le colture esigenti (piu sensibili) e il 60-70% per quelle poco esigenti (Scheda #69/#70)." },
    { id: 1222, topic: "Clima e acqua", q: "L'indice di continentalita di Rivas-Martinez e basato su:",
      opts: ["il rapporto tra precipitazioni annue ed evapotraspirazione potenziale", "la somma delle temperature medie mensili ridotte di 5 gradi C", "l'escursione termica annua, cioe la differenza tra la Tmax media del mese piu caldo e la Tmin media del mese piu freddo", "la sola media annua delle temperature minime del mese piu freddo", "il numero annuo di giorni con temperatura media inferiore a 0 gradi C"], correct: 2,
      why: "La continentalita di Rivas-Martinez misura l'escursione termica annua (Tmax media del mese piu caldo meno Tmin media del mese piu freddo): valori elevati indicano un clima marcatamente continentale (Scheda #1026)." },
    { id: 1223, topic: "Clima e acqua", q: "L'indice di termicita di Kira (Warmth Index, WI) si calcola come:",
      opts: ["somma delle temperature medie mensili ridotte di 5 gradi C, limitatamente ai mesi con temperatura media superiore a 5 gradi C", "escursione termica annua tra il mese piu caldo e il piu freddo", "media annua delle temperature massime del mese piu caldo", "somma delle precipitazioni dei soli mesi con temperatura media superiore a 5 gradi C", "prodotto tra la temperatura media annua e la piovosita totale annua"], correct: 0,
      why: "Il Warmth Index di Kira e WI = somma di (Ti - 5) calcolata sommando le temperature medie mensili diminuite di 5 gradi C solo per i mesi con temperatura media superiore a 5 gradi C; e correlato con la distribuzione della vegetazione (Scheda #1026)." },
    // Suolo: struttura e acqua
    { id: 1224, topic: "Suolo: struttura e acqua", q: "Le classificazioni ISSS e USDA concordano sul limite superiore dell'argilla (< 0,002 mm) ma differiscono sul confine dimensionale tra sabbia e limo. Quali sono i due valori?",
      opts: ["ISSS 0,05 mm — USDA 0,02 mm", "ISSS 0,002 mm — USDA 0,05 mm", "ISSS 0,2 mm — USDA 0,1 mm", "ISSS 0,02 mm — USDA 0,05 mm", "ISSS 0,05 mm — USDA 0,1 mm"], correct: 3,
      why: "Il confine sabbia/limo è fissato a 0,02 mm dall'ISSS e a 0,05 mm dall'USDA; entrambe le classificazioni concordano invece sul limite dell'argilla (< 0,002 mm)." },
    { id: 1225, topic: "Suolo: struttura e acqua", q: "Rispetto all'ISSS, che distingue solo sabbia grossa e sabbia fine, la classificazione granulometrica USDA suddivide la frazione sabbia in:",
      opts: ["2 sottoclassi", "3 sottoclassi", "4 sottoclassi", "6 sottoclassi", "5 sottoclassi (molto grossa, grossa, media, fine, molto fine)"], correct: 4,
      why: "L'USDA articola la sabbia in 5 sottoclassi, da molto grossa (2,0-1,0 mm) a molto fine (0,10-0,05 mm), mentre l'ISSS ne prevede solo 2 (grossa e fine)." },
    { id: 1226, topic: "Suolo: struttura e acqua", q: "Nel raggruppamento in 3 sole classi delle 12 classi tessiturali (Linee Guida per la Fertilizzazione, triangolo USDA), la classe Limoso (L) rientra nel macro-raggruppamento:",
      opts: ["Tendenzialmente Sabbioso", "Franco", "Tendenzialmente Argilloso", "Limoso (raggruppamento a sé stante)", "Franco Limoso Argilloso"], correct: 1,
      why: "Il Limoso (L) non costituisce un raggruppamento autonomo: ricade nel gruppo Franco insieme a F, FL, FSA e FA." },
    { id: 1227, topic: "Suolo: struttura e acqua", q: "Quale contenuto della frazione fine è necessario per classificare un suolo come 'limoso' (silty soil)?",
      opts: ["limo > 85%", "limo > 60%", "limo > 50%", "limo > 40%", "limo > 25%"], correct: 0,
      why: "Serve oltre l'85% di limo per definire un suolo 'limoso', mentre bastano il 40% di argilla per dirlo 'argilloso' e oltre il 60% di sabbia per dirlo 'sabbioso'." },
    { id: 1228, topic: "Suolo: struttura e acqua", q: "Un suolo è classificato come 'pietroso/ciottoloso' (scheletro prevalente) quando il volume di scheletro supera:",
      opts: ["5% del volume", "20% del volume", "40% del volume", "60% del volume", "75% del volume"], correct: 2,
      why: "Lo scheletro è 'prevalente' (suolo ciottoloso) oltre il 40% del volume; è comunque considerato 'importante' già oltre il 20% ed 'evidente' oltre il 5%." },
    { id: 1229, topic: "Suolo: struttura e acqua", q: "La struttura colonnare si differenzia da quella prismatica per il fatto che i suoi aggregati:",
      opts: ["sono orientati orizzontalmente a foglietti sovrapposti", "hanno forma di piccole sfere", "presentano spigoli vivi e facce ben identificate", "hanno la parte superiore arrotondata", "sono privi di qualsiasi orientamento definito"], correct: 3,
      why: "Colonnare e prismatica hanno entrambe aggregati a sviluppo verticale, tipici degli orizzonti profondi, ma nella colonnare la sommità degli aggregati è arrotondata." },
    { id: 1230, topic: "Suolo: struttura e acqua", q: "Una struttura in cui gli aggregati ricordano foglietti sovrapposti, generata spesso per schiacciamento/compattamento, è detta:",
      opts: ["lamellare", "prismatica", "granulare", "poliedrica subangolare", "colonnare"], correct: 0,
      why: "La struttura lamellare è costituita da aggregati appiattiti disposti a foglietti sovrapposti, tipicamente per effetto di schiacciamento e compattamento." },
    { id: 1231, topic: "Suolo: struttura e acqua", q: "Nella classificazione dimensionale degli aggregati, le 'zolle' sono definite come aggregati di dimensione:",
      opts: ["1-0,25 mm (microaggregati)", "50-5 mm (macroaggregati)", "inferiore a 0,25 mm (astrutturali)", "150-50 mm (zollette)", "superiore a 150 mm"], correct: 4,
      why: "Le zolle superano i 150 mm; seguono le zollette (150-50 mm), i macroaggregati (50-5 mm), i microaggregati (1-0,25 mm) e gli astrutturali (< 0,25 mm)." },
    { id: 1232, topic: "Suolo: struttura e acqua", q: "Nel metodo di Tiulin-Mayer, un indice di stabilità della struttura I% superiore al 70% indica:",
      opts: ["una struttura molto instabile, soggetta a sfaldamento in acqua", "una struttura estremamente stabile e resistente a erosione e costipamento", "un eccesso di sodio scambiabile sul complesso", "una tessitura prevalentemente sabbiosa", "una porosità totale superiore al 70%"], correct: 1,
      why: "Il metodo Tiulin-Mayer misura la resistenza degli aggregati all'azione disgregante dell'acqua: un I% > 70% denota una struttura molto stabile e resistente all'erosione e al costipamento." },
    { id: 1233, topic: "Suolo: struttura e acqua", q: "La glomalina, glicoproteina idrofoba che cementa i macroaggregati del suolo, è secreta da:",
      opts: ["batteri azotofissatori simbionti", "radici delle graminacee", "funghi micorrizici", "lombrichi e mesofauna", "alghe azzurre del suolo"], correct: 2,
      why: "La glomalina è prodotta dai funghi micorrizici e cementa i macroaggregati; le radici delle graminacee agiscono invece per pressione fisica, con effetto bio-strutturante." },
    { id: 1234, topic: "Suolo: struttura e acqua", q: "Nella serie liotropica dei cationi, il potassio (K⁺) si comporta come segue:",
      opts: ["è il miglior flocculante delle argille", "è flocculante esattamente quanto il calcio (Ca²⁺)", "è chimicamente inerte verso i colloidi", "pur essendo un nutriente, tende a deflocculare le argille", "è un catione trivalente ad altissimo potere flocculante"], correct: 3,
      why: "Il potere flocculante cresce con la valenza del catione: il K⁺, monovalente, tende a deflocculare (come il Na⁺) pur essendo un importante nutriente; i migliori flocculanti sono i cationi bi- e trivalenti." },
    { id: 1235, topic: "Suolo: struttura e acqua", q: "Quali costituenti del suolo sono i colloidi responsabili della capacità di scambio cationico (CSC)?",
      opts: ["l'argilla e la sostanza organica (humus)", "la sabbia e il limo", "lo scheletro e la ghiaia", "il calcare e i carbonati grossolani", "l'aria del suolo e la soluzione circolante"], correct: 0,
      why: "La CSC è dovuta ai colloidi a carica elettrica negativa, cioè le argille e la sostanza organica (humus); sabbia e limo, poco attivi chimicamente, non vi contribuiscono in modo significativo." },
    { id: 1236, topic: "Suolo: struttura e acqua", q: "Il potenziale idrico totale del suolo (Ψt) risulta dalla somma di quali componenti?",
      opts: ["Ψm (matriciale) + Ψg (gravitazionale) + Ψo (osmotico) + Ψs (di sommersione)", "solo Ψm (matriciale) + Ψg (gravitazionale)", "Ψm (matriciale) + Ψo (osmotico), escludendo la quota", "Ψg (gravitazionale) + Ψs (di sommersione) soltanto", "il prodotto Ψm × Ψg × Ψo delle tre componenti principali"], correct: 0,
      why: "Il potenziale idrico totale è la somma algebrica delle componenti matriciale, gravitazionale, osmotica e di sommersione, ciascuna con il proprio segno." },
    { id: 1237, topic: "Suolo: struttura e acqua", q: "In un suolo non saturo, il potenziale matriciale (Ψm) ha segno:",
      opts: ["positivo, perché l'acqua tende a salire per capillarità", "negativo, perché adsorbimento e capillarità trattengono l'acqua abbassandone l'energia potenziale", "sempre nullo, indipendentemente dal contenuto idrico", "positivo nei suoli argillosi e negativo in quelli sabbiosi", "positivo, e tende a zero verso il punto di appassimento"], correct: 1,
      why: "Le forze matriciali (adsorbimento e capillarità) trattengono l'acqua abbassandone l'energia: Ψm è negativo, tanto più quanto più il suolo è asciutto." },
    { id: 1238, topic: "Suolo: struttura e acqua", q: "Il potenziale osmotico (Ψo) della soluzione circolante del suolo:",
      opts: ["è positivo e aumenta con la concentrazione salina", "dipende unicamente dalla quota rispetto al piano di riferimento", "è negativo e diventa tanto più negativo quanto maggiore è la concentrazione di sali disciolti", "è generato dalle forze di adsorbimento delle argille", "è sempre trascurabile, anche nei suoli salini"], correct: 2,
      why: "I soluti abbassano l'energia potenziale dell'acqua: più alta è la salinità più Ψo è negativo, ostacolando l'assorbimento radicale nei suoli salini." },
    { id: 1239, topic: "Suolo: struttura e acqua", q: "Il potenziale di sommersione (Ψs) assume valore positivo e diventa significativo:",
      opts: ["in un suolo asciutto, prossimo al punto di appassimento", "quando prevale l'acqua igroscopica adsorbita alle particelle", "solo nei suoli sabbiosi a rapido drenaggio", "in un suolo saturo o sommerso, per la pressione della colonna d'acqua sovrastante", "in presenza di elevata concentrazione salina della soluzione"], correct: 3,
      why: "In condizioni di saturazione/sommersione (es. risaia) la colonna d'acqua sovrastante esercita una pressione positiva, per cui Ψs è positivo." },
    { id: 1240, topic: "Suolo: struttura e acqua", q: "La riserva facilmente utilizzabile (RFU) di un suolo rappresenta:",
      opts: ["l'intera acqua presente nel suolo alla saturazione", "la sola acqua gravitazionale che sgronda dai macropori", "l'acqua igroscopica adsorbita, non prelevabile dalle radici", "l'acqua eccedente la capacità di campo", "la frazione della riserva utile che la coltura preleva senza subire stress idrico"], correct: 4,
      why: "La RFU è la parte della riserva utile assorbibile senza che la coltura entri in stress; su di essa si fissa la soglia di intervento irriguo." },
    { id: 1241, topic: "Suolo: struttura e acqua", q: "L'acqua igroscopica del suolo è:",
      opts: ["un film sottile fortemente adsorbito alle particelle, trattenuto con altissima tensione e non disponibile per le piante", "l'acqua libera che drena per gravità nei macropori", "la principale frazione della riserva idrica utile", "l'acqua che risale per capillarità dai micropori fino alla superficie", "l'acqua che satura temporaneamente l'intera porosità dopo la pioggia"], correct: 0,
      why: "L'acqua igroscopica è adsorbita come film sottile con tensione elevatissima: resta indisponibile perché le radici non vincono le forze di ritenzione." },
    { id: 1242, topic: "Suolo: struttura e acqua", q: "A parità di altre condizioni, l'ascesa capillare dell'acqua nel suolo è tanto maggiore quanto:",
      opts: ["più grossolani e ampi sono i pori (suoli sabbiosi)", "più fini sono i pori, come nei suoli a tessitura fine ricchi di micropori", "maggiore è la quota di macroporosità di sgrondo", "minore è il contenuto di limo e argilla", "più elevata è la densità apparente per costipamento"], correct: 1,
      why: "La risalita capillare aumenta al diminuire del diametro dei pori: i micropori dei suoli fini sviluppano tensioni capillari maggiori e quindi una risalita più alta." },
    { id: 1243, topic: "Suolo: struttura e acqua", q: "Rispetto all'aria atmosferica, l'aria che riempie i pori del suolo è tipicamente:",
      opts: ["identica nella composizione", "molto più ricca di O2 e completamente priva di CO2", "più ricca di CO2 (fino all'1-5%) e leggermente più povera di O2, per la respirazione di radici e microrganismi", "costituita prevalentemente da metano e azoto", "del tutto priva di vapore acqueo"], correct: 2,
      why: "La respirazione radicale e microbica consuma O2 e libera CO2: l'aria del suolo è più ricca di CO2 (fino all'1-5%) e leggermente più povera di O2 rispetto all'atmosfera." },
    { id: 1244, topic: "Suolo: struttura e acqua", q: "Qual è la corretta successione degli orizzonti di un profilo di suolo, dalla superficie verso il basso?",
      opts: ["A, O, B, E, C, R", "R, C, B, E, A, O", "O, E, A, B, R, C", "O, A, E, B, C, R", "A, E, O, C, B, R"], correct: 3,
      why: "Dall'alto verso il basso: O (organico), A (minerale ricco di sostanza organica), E (eluviale/impoverito), B (accumulo/illuviale), C (materiale d'alterazione), R (roccia madre)." },
    { id: 1245, topic: "Suolo: struttura e acqua", q: "Il colore scuro (nerastro) di un orizzonte superficiale di suolo è dovuto principalmente:",
      opts: ["all'abbondanza di ossidi di ferro ossidati", "a condizioni di asfissia e ristagno idrico prolungato", "alla prevalenza di sabbia quarzosa", "all'accumulo di carbonati di calcio", "all'elevato contenuto di sostanza organica (humus)"], correct: 4,
      why: "Il colore scuro degli orizzonti superficiali riflette il tenore di sostanza organica; gli ossidi di ferro danno tinte rosse/gialle e il ristagno tinte grigio-bluastre (gleyzzazione)." },
    // Sistemazioni ed erosione
    { id: 1246, topic: "Sistemazioni ed erosione", q: "Secondo la tabella delle efficienze irrigue (Reg. Piemonte DD 380/2023), quale abbinamento metodo-efficienza è corretto?",
      opts: ["Sommersione per gravità - 40%", "Aspersione ad alta pressione (>3,5 bar) - 80%", "Microirrigazione a goccia con CV < 5% - 90%", "Scorrimento per gravità - 60%", "Infiltrazione laterale a solchi - 70%"], correct: 2,
      why: "I metodi gravitazionali (sommersione, scorrimento, infiltrazione laterale) hanno efficienza bassa (~10%) e l'aspersione ad alta pressione ~40%; solo la microirrigazione a goccia ben gestita (CV < 5%) raggiunge il 90%." },
    { id: 1247, topic: "Sistemazioni ed erosione", q: "Nella microirrigazione a goccia la portata tipica dei singoli gocciolatori è dell'ordine di:",
      opts: ["2-7 l/h", "2-7 l/s", "20-70 l/h", "50-200 l/h", "0,2-0,7 l/h"], correct: 0,
      why: "I gocciolatori erogano microportate di 2-7 l/h a bassa pressione (0,5-3 bar), con intensità di erogazione modestissima (~1 mm/h) e adacquate di lunga durata a turni brevi." },
    { id: 1248, topic: "Sistemazioni ed erosione", q: "Un volume specifico di adacquamento piccolo (~20 mm), somministrato con turni frequenti, è tipico di:",
      opts: ["suoli argillosi pesanti con apparati radicali profondi", "risaie gestite a sommersione continua", "suoli di medio impasto irrigati con turni molto distanziati", "suoli sabbiosi con apparati radicali superficiali", "colture arboree in asciutta su suoli profondi"], correct: 3,
      why: "Nei suoli sabbiosi, a bassa ritenzione idrica e con radici superficiali, si somministrano volumi piccoli (~20 mm) ad alta frequenza; i suoli pesanti con radici profonde impiegano volumi grandi (~60 mm) e turni distanziati." },
    { id: 1249, topic: "Sistemazioni ed erosione", q: "Nel drenaggio tubolare, il rivestimento filtrante (geotessuto, fibra di cocco, tessuto non tessuto) che avvolge i tubi ha lo scopo di:",
      opts: ["aumentare la pendenza idraulica lungo i dreni", "impedire l'intasamento fisico dei tubi da parte di limo e sabbia fine", "ridurre il diametro utile del tubo per aumentarne la velocità", "isolare termicamente i dreni contro il gelo invernale", "sostituire la funzione delle fessure di captazione praticate sul tubo"], correct: 1,
      why: "Il rivestimento filtrante è indispensabile per evitare che limo e sabbia fine occludano le fessure (0,5-1 mm) e l'interno dei tubi (diametro 50-80 mm), mantenendo la captazione efficiente nel tempo." },
    { id: 1250, topic: "Sistemazioni ed erosione", q: "L'esecuzione dell'aratro talpa (mole drainage), che forma gallerie drenanti non rivestite in suoli argillosi coerenti, richiede che il terreno sia:",
      opts: ["completamente saturo d'acqua lungo tutto il profilo", "sabbioso e privo di argilla per non collassare", "gelato in profondità per conservare la forma della galleria", "uniformemente asciutto dalla superficie al fondo", "asciutto in superficie e umido (plastico) in profondità"], correct: 4,
      why: "La talpatura si esegue con suolo asciutto in superficie (per transito e trazione) e umido/plastico in profondità, così l'ogiva modella una galleria coerente (10-12 cm a 70-80 cm); nelle argille la sua azione dura solo 2-3 anni." },
    { id: 1251, topic: "Sistemazioni ed erosione", q: "Il parametro SAR (Sodium Adsorption Ratio) dell'acqua irrigua quantifica il rischio di:",
      opts: ["salinità totale dell'acqua e stress osmotico sulle radici", "tossicità specifica da cloro e boro", "alcalinizzazione e destrutturazione del suolo per eccesso di Na+", "acidificazione del suolo per eccesso di ioni H+", "occlusione dei gocciolatori per precipitazione di carbonati"], correct: 2,
      why: "Il SAR = [Na+]/radice(([Ca2+]+[Mg2+])/2) misura la prevalenza del sodio: valori elevati indicano rischio di alcalinizzazione e destrutturazione (dispersione dei colloidi). La salinità totale è invece stimata dall'ECw e la tossicità dagli ioni Cl e B." },
    { id: 1252, topic: "Sistemazioni ed erosione", q: "Nelle sistemazioni temporanee di pianura, le «porche» — fasce baulate impiegate per colture orticole e sarchiate — hanno una larghezza indicativa di:",
      opts: ["3-6 m, come tipicamente le «prose»", "oltre 6 m, come i «prosoni»", "0,8-2 m", "8-12 m", "0,2-0,4 m"], correct: 2,
      why: "Le porche sono fasce strette (0,8-2 m) e baulate per orticole/sarchiate; le fasce rialzate di 3-6 m sono le prose e quelle oltre 6 m i prosoni." },
    { id: 1253, topic: "Sistemazioni ed erosione", q: "Nella rete di affossatura di pianura, organizzata su una raccolta a due livelli, la cosiddetta «seconda raccolta» è costituita da:",
      opts: ["le scoline e le fosse camperecce che raccolgono l'acqua di ruscellamento direttamente dall'appezzamento", "i tubi drenanti corrugati posati a 80-100 cm di profondità", "la baulatura che avvia l'acqua superficiale verso le scoline", "le conche scavate attorno ai singoli alberi", "i collettori secondari e i capifosso che convogliano l'acqua verso i recapiti di ordine superiore"], correct: 4,
      why: "La prima raccolta è affidata a scoline e fosse camperecce (acqua raccolta direttamente dall'appezzamento); la seconda raccolta ai collettori secondari e capifosso che portano l'acqua ai recapiti di ordine superiore." },
    { id: 1254, topic: "Sistemazioni ed erosione", q: "Sul piano della regimazione idrica, la differenza sostanziale tra girapoggio e rittochino è che:",
      opts: ["in entrambi le acque vengono convogliate lungo la linea di massima pendenza", "nel girapoggio i fossi livellari, quasi paralleli alle curve di livello e a pendenza minima, rallentano il deflusso, mentre nel rittochino le acque scorrono lungo la massima pendenza", "nel rittochino i fossi livellari rallentano il deflusso, mentre nel girapoggio l'acqua scorre lungo la massima pendenza", "nel girapoggio l'acqua ristagna senza alcun deflusso superficiale, nel rittochino infiltra completamente", "nessuno dei due prevede una regimazione delle acque superficiali"], correct: 1,
      why: "Il girapoggio dispone fossi livellari quasi paralleli alle curve di livello con pendenza minima, così da convogliare lentamente le acque riducendo l'erosione; il rittochino, con lavorazioni e deflusso lungo la massima pendenza, accelera lo scolo ma provoca forte erosione." },
    { id: 1255, topic: "Sistemazioni ed erosione", q: "Girapoggio, cavalcapoggio e rittochino rientrano nelle sistemazioni di collina «unite». Ciò significa che:",
      opts: ["il profilo del versante viene profondamente rimodellato in ripiani sostenuti da muretti o scarpate", "sono adatte esclusivamente a colture arboree specializzate", "comportano l'abbandono definitivo della meccanizzazione", "la morfologia del versante non è sostanzialmente alterata e resta possibile il transito delle macchine", "sono di fatto sinonimo di terrazzamenti e ciglionamenti"], correct: 3,
      why: "Nelle sistemazioni «unite» la morfologia non è alterata in modo rilevante e il transito meccanico è consentito; l'alterazione sostanziale del profilo con ripiani, muretti o scarpate caratterizza invece le sistemazioni «divise» (terrazzamento, ciglionamento, gradonamento, lunette)." },
    { id: 1256, topic: "Sistemazioni ed erosione", q: "Nelle sistemazioni di collina per colture arboree, le «lunette» consistono in:",
      opts: ["singole conche protette realizzate attorno al singolo albero", "ripiani orizzontali sostenuti da muretti a secco", "ripiani sostenuti da una scarpata erbosa anziché da un muro", "piccoli gradini destinati a colture arboree estensive", "la convessità trasversale del terreno che avvia l'acqua verso le scoline"], correct: 0,
      why: "Le lunette sono conche singole protette costruite attorno al singolo albero; i ripiani con muretto a secco sono il terrazzamento, quelli con scarpata erbosa il ciglionamento e i piccoli gradini per arboree estensive il gradonamento." },
    // Concimazione e fertilizzanti
    { id: 1257, topic: "Concimazione e fertilizzanti", q: "La cosiddetta 'Direttiva Nitrati', recepita anche in Italia, corrisponde alla direttiva comunitaria e ha lo scopo di:",
      opts: ["91/676/CEE, prevenire l'inquinamento delle acque causato dai nitrati di origine agricola", "91/414/CEE, disciplinare l'immissione in commercio dei prodotti fitosanitari", "91/676/CEE, fissare il titolo minimo di azoto dei concimi minerali", "96/61/CE, ridurre le emissioni di ammoniaca degli allevamenti", "91/676/CEE, incentivare l'impiego dei reflui zootecnici in agricoltura"], correct: 0,
      why: "Il programma (scheda 80) definisce la Direttiva Nitrati come la 91/676/CEE, normativa comunitaria del 1991 volta a prevenire l'inquinamento delle acque causato dai nitrati di origine agricola per lisciviazione/percolazione profonda." },
    { id: 1258, topic: "Concimazione e fertilizzanti", q: "Nelle Zone Vulnerabili ai Nitrati (ZVN) individuate dalla Direttiva, il limite massimo di apporto di azoto zootecnico (organico) è:",
      opts: ["340 kg N/ha/anno", "170 kg N/ha/anno", "170 kg P2O5/ha/anno", "210 kg N/ha/anno", "500 kg N/ha/anno"], correct: 1,
      why: "Nelle ZVN il vincolo da ricordare è 170 kg N/ha/anno di azoto zootecnico (organico), come indica la scheda 80. Il valore di 340 kg N/ha riguarda le zone non vulnerabili e, come precisa il focus d'esame, non rientra tra i dati da memorizzare." },
    { id: 1259, topic: "Concimazione e fertilizzanti", q: "Nel piano di concimazione, l'apporto 'efficiente' di un elemento fornito da un concime si calcola come:",
      opts: ["produzione × asporto unitario", "apporto (kg) × titolo dell'elemento", "apporto (kg) × titolo × efficienza agronomica", "asporto unitario × efficienza agronomica", "produzione × titolo del concime"], correct: 2,
      why: "Secondo la scheda 1045 gli apporti efficienti si ottengono da apporto × titolo × efficienza agronomica, mentre gli asporti della coltura si calcolano come produzione × asporto unitario; il confronto tra i due termini definisce il bilancio." },
    { id: 1260, topic: "Concimazione e fertilizzanti", q: "Nell'esempio del programma, per il mais da granella (resa 12 t/ha, con stocchi e foglie interrati) il fabbisogno stimato della coltura in N - P2O5 - K2O è di circa:",
      opts: ["196 - 84 - 154 kg/ha", "99 - 60 - 150 kg/ha", "170 - 100 - 100 kg/ha", "204 - 96 - 84 kg/ha", "84 - 96 - 204 kg/ha"], correct: 3,
      why: "La scheda 1045 riporta per il mais un fabbisogno di N 204 - P2O5 96 - K2O 84 kg/ha. I valori 196-84-154 sono il fabbisogno del frumento e 99-60-150 sono gli apporti efficienti del letame, non il fabbisogno colturale." },
    { id: 1261, topic: "Concimazione e fertilizzanti", q: "Per apportare 40 kg di P per ettaro impiegando perfosfato triplo (46% P2O5), la quantità di concime da distribuire è di circa (fattore di conversione P → P2O5 = 0,436):",
      opts: ["92 kg/ha", "87 kg/ha", "130 kg/ha", "460 kg/ha", "200 kg/ha"], correct: 4,
      why: "Come nella scheda 1048: 40 kg P/ha si convertono in 40/0,436 ≈ 92 kg P2O5/ha, che divisi per il titolo 0,46 danno ≈ 200 kg/ha di perfosfato triplo. Fermarsi a 92 kg significa dimenticare la divisione per il titolo del concime." },
    { id: 1262, topic: "Concimazione e fertilizzanti", q: "Secondo la classificazione di legge dei fertilizzanti, i concimi 'a base di microelementi':",
      opts: ["contengono Ca, Mg o S ma non elementi principali", "contengono uno o più microelementi, anche chelati o complessati, ma non elementi principali", "contengono sempre azoto insieme ai microelementi", "contengono almeno due elementi principali della serie NPK", "sono ammendanti a elevato rapporto C/N"], correct: 1,
      why: "La scheda 1046 definisce i concimi a base di microelementi come prodotti contenenti uno o più microelementi, anche chelati o complessati, ma privi di elementi principali. La presenza di Ca, Mg o S caratterizza invece i fertilizzanti a base di elementi secondari." },
    { id: 1263, topic: "Concimazione e fertilizzanti", q: "In un suolo a pH acido, per la concimazione fosfatica il programma consiglia di preferire un fosfato:",
      opts: ["solubile solo in acqua", "sotto forma di cloruro", "a esclusivo rilascio in ambiente calcareo", "chelato con sostanza organica", "solubile in acidi minerali o in acido formico al 2%"], correct: 4,
      why: "La scheda 1048 indica che nei suoli acidi conviene un P solubile in acidi minerali o in acido formico al 2%, mentre nei suoli calcarei va bene il P solubile in acqua; in entrambi gli estremi di pH resta comunque prevedibile un parziale blocco (retrogradazione)." },
    { id: 1264, topic: "Concimazione e fertilizzanti", q: "Nel piano di concimazione del mais, il letame (30 t/ha) è collocato preferibilmente:",
      opts: ["in copertura, durante la sarchiatura", "localizzato alla semina come starter", "a spaglio in autunno, con largo anticipo sulla semina", "esclusivamente in fertirrigazione estiva", "frazionato in tre apporti primaverili"], correct: 2,
      why: "La scheda 1045 colloca il letame in autunno: essendo un concime organico a lento rilascio, va distribuito con largo anticipo perché la frazione organica deve mineralizzarsi prima di rendere disponibili gli elementi nutritivi. La copertura in sarchiatura è invece propria del nitrato ammonico." },
    // Agrotecnica e rotazioni
    { id: 1265, topic: "Agrotecnica e rotazioni", q: "Le colture intercalari occupano il terreno durante l'intercoltura. Che cosa si intende esattamente per 'intercoltura'?",
      opts: ["La coltivazione contemporanea di due specie sullo stesso appezzamento per gran parte del ciclo vegetativo", "Il periodo di riposo del terreno lasciato a maggese nudo per un'intera annata", "Lo spazio di tempo tra una coltura principale e la successiva, sfruttabile senza ridurre il numero delle colture da reddito principali", "La fase pluriennale di prato inserita in una rotazione quinquennale", "La sovrapposizione degli apparati radicali di due colture arboree consociate a strati"], correct: 2,
      why: "Programma scheda #1063: l'intercoltura e' la finestra temporale 'vuota' tra una coltura principale e la successiva; le intercalari (dette anche secondarie, furtive o di secondo raccolto) la occupano senza togliere spazio alle colture da reddito principali." },
    { id: 1266, topic: "Agrotecnica e rotazioni", q: "Nella classificazione delle colture da avvicendamento, quali sono i sinonimi delle colture 'depauperanti' e un loro esempio tipico?",
      opts: ["Preparatrici e da rinnovo; esempio il mais", "Rinettanti e liquidatrici; esempio la canapa", "Miglioratrici e pratensi; esempio il trifoglio", "Furtive e secondarie; esempio la loiessa", "Liquidatrici e sfruttatrici; esempio i cereali autunno-vernini come frumento e orzo"], correct: 4,
      why: "Programma schede #82 e #1061: le depauperanti (sinonimi liquidatrici, sfruttatrici) impoveriscono il suolo; sono i cereali autunno-vernini come frumento e orzo, oltre al lino." },
    { id: 1267, topic: "Agrotecnica e rotazioni", q: "Nello schema-tipo di rotazione, perche' conviene collocare un cereale depauperante (es. frumento) subito dopo una coltura da rinnovo (es. mais)?",
      opts: ["Perche' la coltura da rinnovo, con lavorazioni profonde e buona fertilizzazione, lascia il terreno in ottime condizioni che il cereale successivo sfrutta", "Perche' il cereale e' azotofissatore e restituisce l'azoto consumato dalla coltura da rinnovo", "Perche' due colture depauperanti consecutive massimizzano l'accumulo di sostanza organica", "Perche' il cereale funge da coltura rinettante nei confronti del mais", "Perche' la successione di due colture della stessa famiglia botanica riduce la stanchezza del suolo"], correct: 0,
      why: "Programma schede #82 e #1062: la coltura da rinnovo (preparatrice) richiede lavorazioni profonde e buona fertilizzazione e lascia il terreno in ottime condizioni; il cereale depauperante che segue ne sfrutta la fertilita' residua e la buona struttura." },
    { id: 1268, topic: "Agrotecnica e rotazioni", q: "Oltre a sfruttare il periodo altrimenti 'vuoto', le colture intercalari fungono da cover crop. In che modo svolgono questa funzione?",
      opts: ["Aumentando l'investimento della coltura principale oltre l'investimento ottimale", "Sostituendo definitivamente la coltura principale da reddito", "Fornendo un secondo raccolto arboreo organizzato a strati multipiano", "Coprendo il suolo e proteggendolo da erosione e lisciviazione, con apporto di sostanza organica", "Riducendo la biodiversita' microbica del suolo per accelerarne la mineralizzazione"], correct: 3,
      why: "Programma scheda #1063: come cover crop l'intercalare copre il suolo durante l'intercoltura, proteggendolo dall'erosione e dalla lisciviazione dei nutrienti e apportando sostanza organica." },
    { id: 1269, topic: "Agrotecnica e rotazioni", q: "Nel confronto pluriennale tra rotazione e monosuccessione, i termini tradizionali 'forza vecchia' e 'caloria' indicano:",
      opts: ["La stanchezza del terreno accumulata dall'omosuccessione prolungata", "L'effetto residuo di fertilita' lasciato dalla coltura precedente, in particolare da una miglioratrice", "Il fabbisogno energetico delle lavorazioni profonde richieste dalle colture da rinnovo", "La quota di azoto minerale apportata con la concimazione di sintesi", "La competizione interspecifica che si instaura tra le specie consociate"], correct: 1,
      why: "Programma scheda #1059: 'forza vecchia' e 'caloria' sono i termini tradizionali per l'eredita' positiva (effetto residuo di fertilita') lasciata dalla coltura precedente, soprattutto se miglioratrice, e spiegano perche' la rotazione mantiene rese piu' alte della monosuccessione." },
    { id: 1270, topic: "Agrotecnica e rotazioni", q: "Tra le impostazioni della successione colturale, l'avvicendamento 'indefinito, libero o dinamico' e' quello in cui:",
      opts: ["La stessa coltura viene ripetuta identica ogni anno sullo stesso terreno", "Una sequenza predefinita e ciclica di colture si ripete sempre uguale nel tempo", "La successione non e' rigidamente prefissata ma viene adattata anno per anno alle condizioni", "Due o piu' colture crescono contemporaneamente sullo stesso appezzamento", "Il terreno viene lasciato a riposo secondo un turno fisso di maggese"], correct: 2,
      why: "Programma scheda #1058: l'avvicendamento libero/dinamico non segue uno schema chiuso ed e' adattato di anno in anno; si distingue dalla rotazione (schema fisso/chiuso, ciclico) e dalla mono/omosuccessione (assenza di avvicendamento)." },
    { id: 1271, topic: "Agrotecnica e rotazioni", q: "Tra i criteri per combinare le colture in avvicendamento rientra l'alternanza dell'architettura radicale. In che cosa consiste?",
      opts: ["Nel far seguire sempre colture con lo stesso tipo di apparato radicale per uniformita' di sfruttamento", "Nell'alternare esclusivamente due colture C4 molto esigenti in acqua", "Nel ripetere colture della stessa famiglia botanica per sfruttare i medesimi strati del profilo", "Nell'alternare colture a elevata e a bassa restituzione di residui epigei", "Nell'alternare radici profonde fittonanti e radici superficiali fascicolate, per sfruttare strati diversi del profilo"], correct: 4,
      why: "Programma scheda #1057: il criterio 'profondita' e tipologia delle radici' prevede di alternare specie fittonanti a radice profonda e specie fascicolate a radice superficiale, cosi' da sfruttare in modo equilibrato i diversi strati del profilo del suolo." },
    { id: 1272, topic: "Agrotecnica e rotazioni", q: "Nella classificazione agronomica, la macrocategoria delle 'colture miglioratrici' comprende come sottocategorie:",
      opts: ["Miglioratrici propriamente dette, colture da rinnovo/preparatrici, pratensi e rinettanti", "Soltanto le leguminose foraggere azotofissatrici", "Depauperanti, liquidatrici e sfruttatrici", "Intercalari, secondarie e furtive", "Consociate, promiscue e a strati multipiano"], correct: 0,
      why: "Programma scheda #1061: le miglioratrici sono una macrocategoria che ingloba le propriamente dette, le colture da rinnovo (preparatrici), le pratensi e le rinettanti; le depauperanti (liquidatrici/sfruttatrici) costituiscono invece la categoria opposta." },
    { id: 1273, topic: "Agrotecnica e rotazioni", q: "Nella disposizione in campo delle consociazioni, la coltivazione di mais e soia in bande larghe affiancate è un esempio tipico di consociazione:",
      opts: ["a miscuglio (specie mescolate)", "a strati o multipiano", "a file alternate o binate", "a strisce", "permanente di sole specie arboree"], correct: 3,
      why: "Secondo il programma la consociazione 'a strisce' è quella in bande larghe di coltura, e mais e soia ne è l'esempio ricorrente (strip cropping); il miscuglio mescola le specie, mentre 'a strati' organizza piani verticali diversi." },
    { id: 1274, topic: "Agrotecnica e rotazioni", q: "In una consociazione, all'aumentare dell'investimento (densità di semina o d'impianto), che cosa accade alla produzione?",
      opts: ["Sia la produzione per pianta sia quella areica crescono indefinitamente", "La produzione per pianta cresce, mentre quella areica diminuisce fin da subito", "La produzione per pianta diminuisce, mentre quella areica cresce fino a un investimento ottimale oltre il quale non aumenta più", "La produzione areica resta costante mentre quella per pianta aumenta", "La produzione areica cresce solo se si annulla la competizione intraspecifica"], correct: 2,
      why: "Il programma descrive la curva investimento-produzione: al crescere della densità la produzione per pianta cala, mentre quella areica sale fino all''investimento ottimale', oltre il quale la competizione impedisce ulteriori incrementi di resa per unità di superficie." },
    { id: 1275, topic: "Agrotecnica e rotazioni", q: "La consociazione di una graminacea con una leguminosa azotofissatrice sfrutta principalmente quale base ecologica?",
      opts: ["Competizione interspecifica", "Complementarità spaziale (radici a profondità diverse)", "Complementarità temporale (cicli sfalsati)", "Allelopatia reciproca", "Facilitazione nutrizionale"], correct: 4,
      why: "Tra le basi ecologiche della consociazione, l'abbinamento graminacea + leguminosa azotofissatrice è l'esempio-tipo di facilitazione nutrizionale; la complementarità spaziale riguarda invece radici profonde e superficiali, quella temporale i cicli sfalsati." },
    { id: 1276, topic: "Agrotecnica e rotazioni", q: "La formazione del suolo, il ciclo dei nutrienti e il mantenimento della biodiversità edafica rientrano tra i servizi ecosistemici di tipo:",
      opts: ["Supporting (supporto)", "Provisioning (approvvigionamento)", "Regulating (regolazione)", "Cultural (culturali)", "Nessuna delle categorie precedenti"], correct: 0,
      why: "Nel programma i servizi di supporto (Supporting) comprendono formazione del suolo, ciclo dei nutrienti e biodiversità edafica; il Provisioning riguarda food/feed/fibre/energia, il Regulating il ciclo idrologico, il carbonio e l'impollinazione, il Cultural il paesaggio e il turismo rurale." },
    { id: 1277, topic: "Agrotecnica e rotazioni", q: "L'agricoltura integrata, regolata a livello nazionale ed europeo, si caratterizza per:",
      opts: ["La massimizzazione delle rese tramite uso massiccio di input chimici di sintesi e lavorazioni profonde", "L'uso razionale e combinato di tecniche chimiche, biologiche e agronomiche, con input chimici limitati al superamento di soglie di intervento", "Il divieto quasi totale di input chimici di sintesi e degli OGM", "L'adozione dei tre pilastri FAO (minimo disturbo, copertura permanente, rotazioni diversificate)", "L'assenza di qualsiasi regolamentazione specifica"], correct: 1,
      why: "L'integrata combina razionalmente tecniche chimiche, biologiche e agronomiche, ricorrendo agli input chimici solo se strettamente necessario (soglie di intervento); la massima riduzione degli input chimici e il divieto OGM sono propri della biologica, i tre pilastri FAO della conservativa." },
    { id: 1278, topic: "Agrotecnica e rotazioni", q: "Nella classificazione delle consociazioni per specie consociate, l'associazione di mais e pioppo (o di viti e colture orticole) rientra tra le consociazioni:",
      opts: ["Miste o promiscue (seminativo arborato)", "A strati o multipiano", "Di sole specie arboree", "Di sole specie erbacee", "A file binate"], correct: 0,
      why: "Le consociazioni miste o promiscue (seminativo arborato) mescolano specie erbacee e arboree sullo stesso appezzamento, con esempi come viti e orticole, mais e pioppo, mais e noce; quelle a strati/multipiano sono invece organizzate per piani verticali distinti." },
    { id: 1279, topic: "Agrotecnica e rotazioni", q: "Rispetto alle altre forme di agricoltura, gli approcci agroecologici e rigenerativi si distinguono perché:",
      opts: ["Sono regolati dal Reg. CE 834/2007 e dalle linee guida IFOAM", "Impongono la semina su sodo come unica tecnica ammessa", "Mirano a massimizzare la resa con input chimici di sintesi", "Sono definiti da soglie di intervento fissate per legge", "Sono approcci sistemici, senza legislazione specifica, volti a ripristinare salute del suolo, biodiversità, cicli dei nutrienti e resilienza del sistema"], correct: 4,
      why: "Il programma colloca agroecologia e rigenerativa come approcci sistemici tra biologico e sostenibile, privi di legislazione dedicata, orientati a ripristinare salute del suolo, biodiversità, cicli dei nutrienti e resilienza; il Reg. CE 834/2007 e l'IFOAM regolano invece la biologica." },
    // Difesa, diserbo e lavorazioni
    { id: 1280, topic: "Difesa, diserbo e lavorazioni", q: "Nell'aratro, quale organo effettua il taglio verticale della fetta di terreno?",
      opts: ["Il vomere", "L'avanvomere", "Il coltello (o disco)", "Il versoio (o barella)", "La bure di sostegno"], correct: 2,
      why: "Il coltello (o disco) esegue il taglio verticale della fetta; il vomere provvede al taglio orizzontale sul fondo del solco e il versoio solleva e ribalta la fetta." },
    { id: 1281, topic: "Difesa, diserbo e lavorazioni", q: "Nell'aratro, il taglio orizzontale sul fondo del solco è compito:",
      opts: ["del vomere", "del coltello (o disco)", "del versoio (o barella)", "dell'avanvomere", "dell'ala di rincalzo"], correct: 0,
      why: "Il vomere effettua il taglio orizzontale sul fondo del solco, distaccando la fetta che il versoio provvede poi a sollevare e ribaltare lateralmente." },
    { id: 1282, topic: "Difesa, diserbo e lavorazioni", q: "Qual è la funzione dell'avanvomere, piccolo corpo arante posto davanti al vomere principale?",
      opts: ["Compiere il taglio verticale al posto del coltello", "Sollevare e frantumare per flessione la fetta principale", "Regolare la profondità di lavoro scaricando il peso sulle ruote", "Ridurre gli sforzi di trazione allargando il solco", "Tagliare e depositare sul fondo del solco la vegetazione superficiale per garantirne il perfetto interramento"], correct: 4,
      why: "L'avanvomere taglia lo strato superficiale con la vegetazione e lo deposita sul fondo del solco, così che il rovesciamento della fetta principale lo interri completamente." },
    { id: 1283, topic: "Difesa, diserbo e lavorazioni", q: "La cosiddetta «suola di lavorazione» si forma tipicamente a causa:",
      opts: ["dell'impiego di attrezzi discissori (ripuntatori) in profondità", "dell'uso ripetuto di attrezzi rovesciatori sempre alla stessa profondità", "della semina diretta su terreno non lavorato (no-tillage)", "della rullatura consecutiva eseguita subito dopo la semina", "dell'eccessiva esposizione delle zolle agli agenti atmosferici"], correct: 1,
      why: "Lavorando ripetutamente alla stessa quota con attrezzi rovesciatori si compatta il fondo del solco, formando un crostone impermeabile (suola di lavorazione); i discissori, al contrario, la rompono ripristinando il drenaggio profondo." },
    { id: 1284, topic: "Difesa, diserbo e lavorazioni", q: "Rispetto alle arature meno profonde, l'aratura profonda (>40 cm):",
      opts: ["è la pratica ordinaria per le colture depauperanti su terreni leggeri", "evita in ogni caso la formazione della suola di lavorazione", "riduce la mineralizzazione della sostanza organica", "accelera la degradazione della sostanza organica umificata per l'eccesso di ossigeno indotto ed è eseguita raramente", "non modifica la porosità del profilo lavorato"], correct: 3,
      why: "L'aratura profonda (>40 cm) è eseguita raramente (per rompere strati duri o interrare ammendanti) e, immettendo molto ossigeno in profondità, accelera la degradazione della S.O. umificata, impoverendo a lungo termine la fertilità biologica." },
    { id: 1285, topic: "Difesa, diserbo e lavorazioni", q: "Che cosa caratterizza la discissura (ripuntatura) rispetto all'aratura?",
      opts: ["Rompe e fessura la massa terrosa anche in profondità senza rovesciare gli strati, mantenendo invariata la stratigrafia", "Ribalta la fetta con una rotazione parziale di circa 135°", "Garantisce il perfetto interramento di residui, concimi e ammendanti", "Determina un forte controllo della flora infestante perenne per seppellimento dei semi", "Comporta consumi energetici maggiori dell'aratura eseguita a pari profondità"], correct: 0,
      why: "I discissori (ripuntatori) rompono il terreno in profondità senza rovesciamento, lasciando invariata la stratigrafia; ciò aumenta permeabilità e porosità con minori consumi rispetto all'aratura a pari profondità." },
    { id: 1286, topic: "Difesa, diserbo e lavorazioni", q: "I ripuntatori sono spesso provvisti di ogive: a quale scopo?",
      opts: ["Per rovesciare completamente la fetta come farebbe un versoio", "Per affinare le zolle superficiali e livellare il letto di semina", "Per creare canali di drenaggio sotterranei temporanei (funzione «aratro-talpa»)", "Per aumentare l'adesività del terreno agli organi lavoranti", "Per interrare in profondità i semi delle infestanti"], correct: 2,
      why: "Le ogive montate sulle ancore dei ripuntatori formano canali di drenaggio sotterranei temporanei (aratro-talpa), favorendo lo sgrondo dell'acqua negli strati profondi." },
    { id: 1287, topic: "Difesa, diserbo e lavorazioni", q: "Tra i difetti dell'aratura estiva (eseguita dopo la raccolta delle colture autunno-vernine) rientra:",
      opts: ["l'elevato rischio di compattamento del terreno", "la forte lisciviazione dei nutrienti degli ammendanti", "la ridotta esposizione della massa terrosa agli agenti atmosferici", "la minore mineralizzazione della sostanza organica", "la formazione di zolle grossolane e i maggiori fabbisogni energetici, poiché il terreno secco è più coesivo"], correct: 4,
      why: "Arando d'estate il terreno è secco e quindi più coesivo, per cui servono più energia e si formano zolle grosse; i pregi sono invece lo scarso compattamento e l'immagazzinamento delle piogge autunnali." },
    { id: 1288, topic: "Difesa, diserbo e lavorazioni", q: "Lo scasso è una lavorazione profonda (80-100 cm) che:",
      opts: ["si esegue ogni anno per la preparazione ordinaria del letto di semina", "precede l'impianto delle colture arboree poliennali (vite, frutteti), dissodando il volume destinato alle radici profonde", "coincide con la ripuntatura, essendo eseguita senza rovesciamento", "è tipica delle sole colture erbacee da rinnovo annuali", "interessa unicamente i primi 15-25 cm del profilo"], correct: 1,
      why: "Lo scasso (80-100 cm), eseguito con aratro da scasso monovomere, è una lavorazione straordinaria una tantum che dissoda in profondità prima dell'impianto delle arboree poliennali; il dissodamento (40-60 cm) è invece tipico delle erbacee." },
    { id: 1289, topic: "Difesa, diserbo e lavorazioni", q: "L'effetto positivo delle lavorazioni sulla porosità del suolo è:",
      opts: ["permanente e via via crescente nel tempo", "nullo, perché le lavorazioni riducono sempre la macroporosità", "limitato alla sola microporosità di ritenzione idrica", "temporaneo, perché l'azione battente delle piogge e il passaggio delle macchine tendono a riconsolidare il suolo", "apprezzabile soltanto nei sistemi di non lavorazione"], correct: 3,
      why: "Le lavorazioni aumentano istantaneamente la macroporosità riducendo la densità apparente, ma è un effetto transitorio: piogge battenti e transito delle macchine riconsolidano il suolo, degradando la struttura creata artificialmente." },
    { id: 1290, topic: "Difesa, diserbo e lavorazioni", q: "Tra i tipi di versoio, quello che opera una disgregazione energica con forte rimescolamento (ma rivoltamento meno marcato) è il versoio:",
      opts: ["elicoidale", "a losanga", "cilindrico", "fenestrato", "composito (universale)"], correct: 2,
      why: "Il versoio cilindrico disgrega energicamente e rimescola molto la fetta, con rivoltamento meno marcato; l'elicoidale è invece poco aggressivo ma assicura un rivoltamento efficace." },
    { id: 1291, topic: "Difesa, diserbo e lavorazioni", q: "Nella classificazione della banca semi in base al Tasso Annuo di Decremento (TAD), uno stock definito 'effimero' (es. Tussilago farfara, Bromus sterilis) presenta un TAD pari a circa:",
      opts: ["50% (stock mediamente persistente)", "70-85% (stock transitorio)", "100%", "25%", "0% (stock perfettamente persistente)"], correct: 2,
      why: "Lo stock effimero ha TAD ~100%: quasi tutti i semi spariscono dalla banca nell'arco di un anno (es. Tussilago farfara, Bromus sterilis). Il ~50% indica lo stock mediamente persistente e il 70-85% quello transitorio." },
    { id: 1292, topic: "Difesa, diserbo e lavorazioni", q: "L'equazione di sparizione annua della banca semi è: sparizione = emergenze + germinazioni suicide + predazione + parassitismo + senescenza. Quale voce corrisponde ai semi devitalizzati da funghi e altri parassiti nel suolo?",
      opts: ["Emergenze", "Germinazioni suicide", "Predazione", "Senescenza", "Parassitismo"], correct: 4,
      why: "Il parassitismo è la quota di semi devitalizzati da parassiti (es. funghi). La predazione riguarda invece gli animali (uccelli, mammiferi, artropodi) e la senescenza la perdita di vitalità per invecchiamento." },
    { id: 1293, topic: "Difesa, diserbo e lavorazioni", q: "Nella dinamica della banca semi, cosa si intende per 'germinazioni suicide'?",
      opts: ["Semi che germinano ma le cui plantule non riescono a emergere, oppure emergono e vengono poi devitalizzate da successive basse temperature", "Semi predati e asportati da uccelli e piccoli mammiferi", "Semi che perdono progressivamente vitalità per invecchiamento", "Semi fatti germinare con la falsa semina e poi distrutti meccanicamente", "Semi devitalizzati da funghi parassiti nel terreno"], correct: 0,
      why: "Le germinazioni suicide sono semi che germinano ma le plantule non emergono, o emergono e vengono uccise da basse temperature successive: un'uscita 'a vuoto' dalla banca semi. Le altre risposte descrivono predazione, senescenza, parassitismo o la tecnica agronomica della falsa semina." },
    { id: 1294, topic: "Difesa, diserbo e lavorazioni", q: "Nella malerbologia si distingue tra flora reale e flora potenziale. La flora reale è:",
      opts: ["L'insieme dei propaguli (semi e organi di moltiplicazione vegetativa) presenti nel suolo, cioè la banca semi", "L'insieme delle piante di malerba effettivamente emerse e visibili sul campo", "L'insieme delle specie potenzialmente presenti in base al clima regionale", "La sola quota di semi in dormienza profonda nel suolo", "L'insieme delle sole infestanti già controllate dal diserbo"], correct: 1,
      why: "La flora reale è costituita dalle piante di malerba effettivamente emerse e visibili in campo; i propaguli presenti nel suolo (banca semi) costituiscono invece la flora potenziale." },
    { id: 1295, topic: "Difesa, diserbo e lavorazioni", q: "Riguardo alla persistenza richiesta agli erbicidi in funzione dell'epoca d'impiego, quale affermazione è corretta?",
      opts: ["Sia i trattamenti di pre- sia quelli di post-emergenza richiedono erbicidi poco persistenti", "Gli erbicidi di post-emergenza devono essere molto persistenti, quelli di pre-emergenza poco persistenti", "La persistenza nel suolo è indifferente rispetto all'epoca d'impiego", "Gli erbicidi di pre-emergenza devono essere persistenti per intercettare nel tempo le emergenze, mentre quelli di post-emergenza possono essere poco persistenti", "Solo gli erbicidi di contatto devono essere persistenti nel suolo"], correct: 3,
      why: "In pre-emergenza l'erbicida deve restare attivo nel suolo per colpire le emergenze che si susseguono nel tempo (persistente); in post-emergenza colpisce infestanti già emerse e può quindi essere poco persistente." },
    { id: 1296, topic: "Difesa, diserbo e lavorazioni", q: "L'acido pelargonico è riportato come esempio tipico di erbicida:",
      opts: ["Di contatto, non sistemico: devitalizza solo i tessuti che raggiunge, senza traslocare", "Sistemico, assorbito e traslocato fino agli organi sotterranei", "Residuale, che agisce dal suolo sulle plantule in germinazione", "Ad ampio spettro sistemico, indispensabile contro i rizomi delle perenni", "Selettivo per traslocazione sui cereali autunno-vernini"], correct: 0,
      why: "L'acido pelargonico agisce per contatto: devitalizza i soli tessuti colpiti e non trasloca, a differenza dei sistemici (es. glifosate) che raggiungono anche gli organi sotterranei." },
    { id: 1297, topic: "Difesa, diserbo e lavorazioni", q: "Il glifosate è un erbicida ad ampio spettro non selettivo. La sua applicazione in modo selettivo in post-emergenza è resa possibile:",
      opts: ["Dalla sua scarsa persistenza nel suolo", "Dall'impiego di irroratrici schermate lungo la fila", "Dall'uso di varietà rese resistenti con ingegneria genetica (tecnologia Roundup Ready, RR)", "Dall'aggiunta di un antidoto agronomico (safener) alla coltura", "Dalla sua incapacità di traslocare negli organi sotterranei"], correct: 2,
      why: "Essendo non selettivo, il glifosate colpirebbe anche la coltura; l'applicazione selettiva in post-emergenza è possibile solo su varietà OGM rese resistenti (Roundup Ready), che tollerano il glifosate mentre le infestanti convenzionali vengono devitalizzate." },
    { id: 1298, topic: "Difesa, diserbo e lavorazioni", q: "Perché nella pratica del diserbo si ricorre spesso a miscele di due o più erbicidi?",
      opts: ["Per ridurre la persistenza dei singoli principi attivi nel suolo", "Perché nessun erbicida copre da solo l'intero spettro d'azione, per cui si combinano principi complementari (es. un graminicida + un dicotiledonicida)", "Per aumentare la selettività di ciascun erbicida verso la coltura", "Per attivare l'erbicida di pre-emergenza anche in assenza di pioggia", "Per rispettare l'obbligo di rotazione dei meccanismi d'azione in un solo trattamento"], correct: 1,
      why: "Poiché nessun singolo erbicida controlla tutte le specie, si miscelano principi attivi con spettri complementari (tipicamente un graminicida più un dicotiledonicida) per ampliare la copertura dell'infestazione." },
    { id: 1299, topic: "Difesa, diserbo e lavorazioni", q: "In una prova sperimentale, passando dalla monosuccessione di mais alla rotazione mais-frumento-medica, la densità di plantule di infestanti è passata:",
      opts: ["Da 4,5 a 260 milioni/ha (forte aumento)", "Restando pressoché invariata attorno a 100 milioni/ha", "Da 260 a 130 milioni/ha (dimezzamento)", "Da 260 a 4,5 milioni/ha (crollo netto)", "Da 60 a 200 milioni/ha (aumento)"], correct: 3,
      why: "La rotazione mais-frumento-medica ha ridotto drasticamente la densità di plantule (da ~260 a ~4,5 milioni/ha) e ne ha modificato la composizione, dimostrando l'efficacia della diversificazione colturale come mezzo indiretto." },
    { id: 1300, topic: "Difesa, diserbo e lavorazioni", q: "Riguardo agli effluenti zootecnici (letame) in relazione alle infestanti, quale affermazione è corretta?",
      opts: ["Il letame è sempre privo di semi vitali di infestanti", "La digestione ruminale aumenta la vitalità dei semi ingeriti", "Il compostaggio del letame ne accresce la carica di semi germinabili", "Solo i fertilizzanti minerali possono veicolare semi vitali", "Il letame può veicolare semi vitali, ma la digestione ruminale e soprattutto la maturazione/compostaggio ne riducono la vitalità"], correct: 4,
      why: "Gli effluenti zootecnici possono diffondere semi vitali di infestanti; la digestione ruminale e in particolare la maturazione/compostaggio del letame ne abbattono però la vitalità, riducendo l'apporto alla banca semi." },
    { id: 1301, topic: "Difesa, diserbo e lavorazioni", q: "La semina anticipata del mais (prima del 15-20 marzo), impiegata come mezzo indiretto, agisce sulla flora infestante:",
      opts: ["Modificandone la composizione, con aumento della frequenza di poligonacee, CHEAL, ECHCG e SOLNI", "Eliminando completamente tutte le graminacee estive", "Senza produrre alcun effetto sulla composizione dell'infestazione", "Riducendo esclusivamente le dicotiledoni autunno-vernine", "Favorendo unicamente le infestanti tipiche della risaia"], correct: 0,
      why: "L'epoca di semina modifica la composizione dell'infestazione: la semina anticipata del mais (prima del 15-20 marzo) aumenta la frequenza di poligonacee, Chenopodium album (CHEAL), Echinochloa crus-galli (ECHCG) e Solanum nigrum (SOLNI)." },
    { id: 1302, topic: "Difesa, diserbo e lavorazioni", q: "Il pirodiserbo, basato su uno shock termico da fiamma, è caratterizzato da:",
      opts: ["Elevata efficacia sulle graminacee e scarsa sulle dicotiledoni", "Rilascio di residui persistenti nel suolo e nell'acqua", "Elevata efficacia sulle dicotiledoni giovani ma scarsa efficacia sulle graminacee", "Azione dal suolo sui semi in germinazione (residuale)", "Efficacia esclusiva sulle infestanti perenni geofite"], correct: 2,
      why: "Il pirodiserbo (alta temperatura/breve durata) non lascia residui ed è molto efficace sulle dicotiledoni se giovani, mentre risulta poco efficace sulle graminacee; presenta però costi elevati, emissione di CO2 e rischio d'incendio con vegetazione secca." },
    { id: 1303, topic: "Difesa, diserbo e lavorazioni", q: "In che cosa consiste la solarizzazione come mezzo fisico di controllo delle infestanti?",
      opts: ["Nell'applicazione di fiamma diretta con shock termico breve e intenso", "Nella copertura del suolo umido con film plastico trasparente che ne innalza la temperatura per un lungo periodo (30-60 gg), riducendo anche la banca semi", "Nella copertura del suolo con film plastico nero per impedire l'emergenza delle malerbe", "Nella distribuzione di vapore in profondità solo all'impianto della coltura", "Nell'iniezione di schiuma calda lungo la fila della coltura"], correct: 1,
      why: "La solarizzazione (bassa temperatura/lunga durata) copre il suolo umido con film plastico trasparente per 30-60 giorni, innalzando a lungo la temperatura e riducendo la banca semi; il film nero che impedisce l'emergenza è invece la pacciamatura, mentre fiamma, vapore e schiuma calda sono metodi ad alta temperatura e breve durata." },
    { id: 1304, topic: "Difesa, diserbo e lavorazioni", q: "Quale carattere morfologico di Chenopodium album (CHEAL, farinello comune) ostacola in modo particolare la bagnatura fogliare e riduce l'efficacia dei trattamenti erbicidi?",
      opts: ["La fitta peluria vellutata che ricopre le foglie cuoriformi", "Le foglie carnose e succulente rivestite di una spessa cera", "Una polverina farinoso-cerosa biancastra sulla pagina inferiore delle foglie", "L'ocrea membranacea che avvolge il fusto ai nodi", "La spiga densa e pungente dell'infiorescenza"], correct: 2,
      why: "In CHEAL la pagina inferiore delle foglie porta una caratteristica polverina farinoso-cerosa biancastra che rende difficile la bagnatura, riducendo l'efficacia dei diserbanti fogliari. Gli altri caratteri appartengono ad altre specie (ABUTH, Portulaca, poligonacee, AMARE)." },
    { id: 1305, topic: "Difesa, diserbo e lavorazioni", q: "Rispetto a Chenopodium album (CHEAL), il farinello polisperma Chenopodium polyspermum (CHEPO) si distingue soprattutto perché:",
      opts: ["ha foglie generalmente prive della tipica polverina farinosa e fusto spesso rossastro e ramificato", "è una monocotiledone a ciclo autunno-vernino tipica dei cereali", "appartiene alle Malvaceae ed ha grandi foglie cuoriformi vellutate", "produce bacche sferiche nere contenenti solanina", "ha portamento prostrato con ocrea membranacea ai nodi"], correct: 0,
      why: "CHEPO condivide con CHEAL famiglia (Chenopodiaceae), ciclo primaverile-estivo e colture-bersaglio, ma ha foglie meno farinose/piu verdi e fusto spesso rossastro e ramificato; il nome ('polyspermum') richiama l'abbondante produzione di semi." },
    { id: 1306, topic: "Difesa, diserbo e lavorazioni", q: "Amaranthus retroflexus (AMARE, amaranto comune) e correttamente descritto come una dicotiledone che:",
      opts: ["e una C3 a ciclo autunno-vernino tipica dei cereali vernini", "ha fusti carnosi striscianti e spiccata resistenza alla siccita", "produce grosse bacche rosse contenenti solanina", "possiede vigorosi rizomi sotterranei che impongono erbicidi sistemici", "e una C4 termofila, con fusto eretto e infiorescenza a spiga densa, che predilige terreni ricchi di azoto"], correct: 4,
      why: "AMARE e una C4 che predilige alte temperature e suoli azotati; ha fusto eretto (erugoso) e spiga densa e pungente, con enorme produzione di semi neri lucidi (fino a ~100.000/pianta) a germinazione scalare." },
    { id: 1307, topic: "Difesa, diserbo e lavorazioni", q: "Abutilon theophrasti (ABUTH, cencio molle) e correttamente inquadrato come:",
      opts: ["poligonacea prostrata con ocrea ai nodi e banca semi effimera (TAD ~100%)", "malvacea eretta con grandi foglie cuoriformi e vellutate e banca semi mediamente persistente (TAD ~50%)", "chenopodiacea con foglie farinose e banca semi transitoria (TAD 70-85%)", "solanacea con bacche nere e semi poco longevi", "asteracea con capolini e acheni provvisti di reste uncinate"], correct: 1,
      why: "ABUTH e una Malvaceae robusta ed eretta, con foglie cordate e vellutate per la fitta peluria; la banca semi e mediamente persistente (TAD ~50%), il che impone una gestione pluriennale per esaurirla." },
    { id: 1308, topic: "Difesa, diserbo e lavorazioni", q: "Per quale motivo Solanum nigrum (SOLNI, erba morella) provoca uno specifico danno qualitativo nella coltura della soia?",
      opts: ["perche i suoi rizomi competono con le radici della soia sottraendo azoto", "perche la polverina farinosa delle foglie contamina i baccelli", "perche rilascia composti allelopatici che bloccano la germinazione della soia", "perche le sue bacche nere e succose macchiano la granella durante la trebbiatura, deprezzandola", "perche le reste uncinate dei suoi frutti si mescolano ai semi di soia"], correct: 3,
      why: "I frutti succosi di SOLNI (bacche sferiche nere, contenenti solanina) macchiano la granella di soia o pisello durante la trebbiatura, deprezzandone il valore commerciale: si tratta di un danno primario indiretto sulla qualita." },
    { id: 1309, topic: "Difesa, diserbo e lavorazioni", q: "Secondo i dati sulla produzione di semi per pianta, Solanum nigrum (erba morella) produce nell'ordine di:",
      opts: ["60.000-150.000 semi/pianta", "200-900 semi/pianta", "50-500 semi/pianta", "circa 1.100 semi/pianta", "10-50 semi/pianta"], correct: 0,
      why: "La banca semi e alimentata in modo specie-specifico: Solanum nigrum produce 60.000-150.000 semi/pianta, tra i valori piu elevati fra le dicotiledoni sarchiate (i valori piu bassi indicati appartengono a POLPE, VERPE, GALAP)." },
    { id: 1310, topic: "Difesa, diserbo e lavorazioni", q: "Durante la sarchiatura meccanica, quale caratteristica di Portulaca oleracea (porcellana comune) ne favorisce la sopravvivenza e il reinsediamento?",
      opts: ["l'ocrea membranacea che protegge le gemme ai nodi", "la banca semi effimera che germina immediatamente e in blocco", "la presenza di rizomi profondi ricchi di sostanze di riserva", "la spiga pungente che ostacola l'azione degli organi lavoranti", "i frammenti di fusto carnoso tagliati, capaci di riemettere radici avventizie e riattecchire"], correct: 4,
      why: "POROL e una C4 con fusti e foglie carnosi e succulenti, molto resistente agli stress idrici; i frammenti recisi durante la sarchiatura possono facilmente emettere radici avventizie e riattecchire, vanificando l'intervento meccanico." },
    { id: 1311, topic: "Difesa, diserbo e lavorazioni", q: "In campo, Persicaria maculosa / Polygonum persicaria (POLPE, persicaria) si riconosce per:",
      opts: ["le foglie farinose biancastre e il fusto eretto senza ocrea", "la caratteristica macchia scura a mezzaluna sulla pagina superiore delle foglie lanceolate e l'ocrea ciliata ai nodi", "le grandi foglie cuoriformi vellutate e l'odore sgradevole", "il portamento strettamente prostrato con fusti sottili e nodosi (centinodia)", "le bacche nere riunite in grappoli all'ascella delle foglie"], correct: 1,
      why: "POLPE (poligonacea) presenta foglie lanceolate con macchia scura a mezzaluna sulla pagina superiore e ocrea membranosa ciliata ai nodi; produce 200-900 semi/pianta con banca semi mediamente persistente (TAD ~50%)." },
    { id: 1312, topic: "Difesa, diserbo e lavorazioni", q: "Polygonum aviculare (POLAV, correggiola o centinodia) e una poligonacea primaverile-estiva caratterizzata da:",
      opts: ["fusto eretto-ascendente con macchia fogliare a mezzaluna", "foglie farinose e abbondanti semi neri lucidi", "portamento prostrato-strisciante, con fusti sottili molto ramificati e nodosi e ocrea ai nodi", "grandi foglie cuoriformi e vellutate riunite in rosetta", "bacche nere contenenti solanina"], correct: 2,
      why: "POLAV ha portamento prostrato-strisciante e fusti sottili molto ramificati e nodosi (da cui 'centinodia'), con l'ocrea membranacea ai nodi tipica delle poligonacee; forma tappeti densi al suolo ed e favorita dalle semine anticipate del mais." },
    { id: 1313, topic: "Difesa, diserbo e lavorazioni", q: "Nel confronto tra le due poligonacee sarchiate primaverili-estive, quale affermazione e corretta?",
      opts: ["entrambe hanno portamento prostrato e sono prive di ocrea ai nodi", "POLPE e prostrata e POLAV eretta, ed entrambe portano la macchia a mezzaluna", "POLAV porta la macchia scura a mezzaluna sulle foglie, mentre POLPE no", "POLPE ha fusto eretto-ascendente con macchia fogliare a mezzaluna, mentre POLAV e prostrata e nodosa senza macchia", "appartengono a famiglie diverse: POLPE alle Malvaceae e POLAV alle Chenopodiaceae"], correct: 3,
      why: "POLPE ha fusto eretto-ascendente e la macchia scura a mezzaluna sulle foglie; POLAV e prostrata-strisciante e nodosa (centinodia) e non presenta la macchia. Entrambe restano poligonacee con ocrea membranacea ai nodi." },
    { id: 1314, topic: "Difesa, diserbo e lavorazioni", q: "L'ocrea, guaina membranacea che avvolge il fusto ai nodi, e il carattere diagnostico che in campo accomuna:",
      opts: ["Polygonum aviculare e Persicaria maculosa (Polygonaceae)", "Chenopodium album e Amaranthus retroflexus", "Abutilon theophrasti e Solanum nigrum", "Portulaca oleracea e Veronica persica", "Setaria viridis e Digitaria sanguinalis"], correct: 0,
      why: "L'ocrea (guaina membranacea ai nodi) e il carattere diagnostico delle Polygonaceae: e presente sia in POLAV sia in POLPE e permette di riconoscere il gruppo gia allo stadio giovanile." },
    { id: 1315, topic: "Difesa, diserbo e lavorazioni", q: "Quale abbinamento specie-famiglia tra le dicotiledoni sarchiate primaverili-estive e corretto?",
      opts: ["Amaranthus retroflexus - Malvaceae", "Abutilon theophrasti - Solanaceae", "Chenopodium album - Polygonaceae", "Solanum nigrum - Chenopodiaceae", "Abutilon theophrasti - Malvaceae"], correct: 4,
      why: "Abutilon theophrasti appartiene alle Malvaceae (foglie cuoriformi vellutate). Gli altri abbinamenti sono errati: Amaranthus e Amaranthaceae, Chenopodium album e Chenopodiaceae (Amaranthaceae s.l.), Solanum nigrum e Solanaceae." },
    { id: 1316, topic: "Difesa, diserbo e lavorazioni", q: "Setaria viridis (SETVI, pabbio verde), graminacea annuale a ciclo primaverile-estivo, si riconosce in particolare per:",
      opts: ["l'infiorescenza a spiga cilindrica compatta e setolosa 'a coda di volpe', con setole verdi alla base delle spighette", "l'assenza assoluta di ligula e di padiglioni auricolari alla giunzione lamina-guaina", "l'infiorescenza a piu' spighe digitate inserite all'apice del culmo", "il fusto a sezione nettamente triangolare con spigoli vivi", "le bacche sferiche nere contenenti solanina che macchiano la granella"], correct: 0,
      why: "Il carattere diagnostico di Setaria viridis (Poaceae) e' la spiga cilindrica compatta e piumosa 'a coda di volpe', con setole (ariste) verdi alla base delle spighette (scheda SETVI); l'assenza di ligula/auricole e' invece di Echinochloa, le spighe digitate di Digitaria/Cynodon, il fusto triangolare delle Cyperaceae e le bacche nere di Solanum nigrum." },
    { id: 1317, topic: "Difesa, diserbo e lavorazioni", q: "Tra le specie infestanti illustrate nel programma, quella con la piu' elevata produzione di semi per pianta (fino a circa 180.000) e':",
      opts: ["Papaver rhoeas", "Chenopodium album", "Setaria viridis", "Portulaca oleracea", "Solanum nigrum"], correct: 2,
      why: "Setaria viridis puo' produrre fino a circa 180.000 semi/pianta, il valore massimo tra le specie considerate (Solanum nigrum 60.000-150.000; Chenopodium album 2.500-100.000; Papaver spp. 10.000-30.000; Portulaca 6.000-30.000), alimentando fortemente la banca semi." },
    { id: 1318, topic: "Difesa, diserbo e lavorazioni", q: "Nelle prime fasi di sviluppo, quale carattere morfologico consente di distinguere le plantule di Echinochloa crus-galli (ECHCG, giavone comune) da quelle di riso e mais?",
      opts: ["la presenza di una ligula membranosa molto sviluppata", "la presenza di auricole (padiglioni auricolari) avvolgenti il culmo", "le foglie ricoperte da una polverina farinosa biancastra sulla pagina inferiore", "l'assenza assoluta di ligula e di padiglioni auricolari", "il fusto a sezione quadrangolare tipico delle lamiacee"], correct: 3,
      why: "Echinochloa crus-galli e' priva sia di ligula sia di auricole: questa assenza e' il carattere chiave che ne permette il riconoscimento precoce rispetto alle plantule di riso e mais (scheda ECHCG, Focus d'esame)." },
    { id: 1319, topic: "Difesa, diserbo e lavorazioni", q: "Sorghum halepense (SORHA, sorghetta), classificata secondo Raunkiaer come geofita, e' un'infestante perenne che supera la stagione avversa e si moltiplica per via vegetativa principalmente grazie a:",
      opts: ["stoloni epigei striscianti e radicanti ai nodi", "tuberi ipogei, come Cyperus rotundus", "radici gemmifere capaci di emettere nuove piante", "bulbi sotterranei di riserva", "un vigoroso apparato di rizomi sotterranei ramificati e ricchi di riserve"], correct: 4,
      why: "Sorghum halepense e' una geofita perenne dotata di rizomi ramificati profondi e ricchi di riserve (oltre alla riproduzione da seme); il rizoma e' il suo principale organo di moltiplicazione vegetativa (schede SORHA e classificazione di Raunkiaer)." },
    { id: 1320, topic: "Difesa, diserbo e lavorazioni", q: "Papaver rhoeas (PAPRH, rosolaccio), tipica infestante a ciclo autunno-vernino del frumento, e' spesso citata nel programma come esempio di:",
      opts: ["infestante a comportamento esclusivo, sempre e ovunque dannosa", "carattere 'relativo' del concetto di pianta infestante", "infestante perenne geofita, difficile da eradicare per gli organi sotterranei", "specie affine (congenere) del frumento, non diserbabile selettivamente", "graminacea a ciclo primaverile-estivo delle colture sarchiate"], correct: 1,
      why: "Il papavero sul frumento e' l'esempio classico del carattere relativo del concetto di infestante (una pianta e' 'malerba' solo dove non e' desiderata); e' una dicotiledone annuale autunno-vernina, non una perenne ne' una graminacea affine al frumento (schede malerbologia e PAPRH)." },
    { id: 1321, topic: "Difesa, diserbo e lavorazioni", q: "Il riso crodo e' impossibile da controllare con il diserbo chimico selettivo convenzionale perche':",
      opts: ["possiede una spessa cuticola cerosa che impedisce l'assorbimento degli erbicidi", "e' una perenne rizomatosa con gemme protette in profondita' nel suolo", "ha sviluppato resistenza a tutti i meccanismi d'azione (MoA) noti", "appartiene alla stessa specie botanica (Oryza sativa) del riso coltivato", "germina esclusivamente in condizioni di sommersione permanente"], correct: 3,
      why: "Il riso crodo e' Oryza sativa, la stessa specie del riso coltivato: un erbicida efficace contro di esso danneggerebbe anche la coltura, per cui si ricorre a mezzi indiretti (falsa semina con glifosate, coltivazione in asciutta, rotazione)." },
    { id: 1322, topic: "Difesa, diserbo e lavorazioni", q: "Nella rotazione si cerca di evitare la diffusione di specie affini alla coltura, difficili da diserbare selettivamente. Quale abbinamento coltura -> infestante affine e' corretto?",
      opts: ["frumento -> Papaver rhoeas", "barbabietola -> Echinochloa crus-galli", "mais -> Sorghum halepense", "soia -> Setaria viridis", "girasole -> Cyperus difformis"], correct: 2,
      why: "Le specie affini appartengono alla stessa famiglia/genere della coltura e sono difficili da diserbare selettivamente: Sorghum halepense (Poaceae) nel mais (Poaceae), analogamente a Solanum nigrum nelle solanacee e al riso crodo nel riso; gli altri abbinamenti coppiano famiglie diverse (non affini)." },
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
      // changes = statistiche sui ripensamenti in simulazione (efficacia del cambio risposta).
      o.changes = o.changes || { improved: 0, worsened: 0, neutral: 0 };
      return o;
    } catch (e) { return { wrong: {}, seen: {}, miss: {}, history: [], changes: { improved: 0, worsened: 0, neutral: 0 } }; }
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

  // Registra un ripensamento: confronta la prima scelta con quella finale.
  // improved = da sbagliata a giusta · worsened = da giusta a sbagliata · neutral = sbagliata→sbagliata.
  function recordChange(firstOk, finalOk) {
    const c = store.changes || (store.changes = { improved: 0, worsened: 0, neutral: 0 });
    if (!firstOk && finalOk) c.improved++;
    else if (firstOk && !finalOk) c.worsened++;
    else c.neutral++;
  }

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

    // Efficacia del cambio risposta (ripensamenti in simulazione)
    const ch = store.changes || { improved: 0, worsened: 0, neutral: 0 };
    const decisive = ch.improved + ch.worsened;      // cambi che hanno spostato l'esito
    const totalCh = decisive + ch.neutral;           // tutti i ripensamenti
    let changeHTML = '';
    if (totalCh > 0) {
      const eff = decisive ? Math.round((ch.improved / decisive) * 100) : null;
      let verdict, cls;
      if (eff === null) {
        verdict = 'Hai cambiato idea ' + totalCh + ' ' + (totalCh === 1 ? 'volta' : 'volte') +
          ', ma senza mai spostare l\'esito: restavi comunque sulla risposta sbagliata.';
        cls = 'neutral';
      } else if (eff > 50) {
        verdict = 'Cambiare idea ti conviene: quando ci ripensi, ci guadagni più spesso di quanto ci perdi. Fidati del ripensamento.';
        cls = 'good';
      } else if (eff < 50) {
        verdict = 'Meglio la prima idea: il cambio risposta non è una strategia vincente per te. Nel dubbio, tieni l\'istinto.';
        cls = 'bad';
      } else {
        verdict = 'In equilibrio: cambiare o restare, per te finora è indifferente.';
        cls = 'neutral';
      }
      const pctLabel = eff === null ? '—' : eff + '%';
      changeHTML =
        '<div class="esame-change esame-change-' + cls + '">' +
          '<div class="esame-change-top">' +
            '<div class="esame-change-h">Efficacia del cambio risposta</div>' +
            '<div class="esame-change-pct">' + pctLabel + '</div>' +
          '</div>' +
          (eff !== null ? '<div class="esame-change-bar"><span class="esame-change-fill" style="width:' + eff + '%"></span></div>' : '') +
          '<div class="esame-change-msg">' + verdict + '</div>' +
          '<div class="esame-change-stats">' +
            'Su ' + totalCh + ' ' + (totalCh === 1 ? 'ripensamento' : 'ripensamenti') + ': ' +
            '<span class="esame-change-good">+' + ch.improved + ' recuperate</span> · ' +
            '<span class="esame-change-bad">−' + ch.worsened + ' perse</span> · ' +
            '<span class="esame-change-neu">=' + ch.neutral + ' invariate</span>' +
          '</div>' +
        '</div>';
    }

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
        changeHTML +
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
      '<button class="esame-opt' + (mode === 'exam' && item.sel === i ? ' is-chosen' : '') + '" data-i="' + i + '">' +
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
        (mode === 'exam' ? '<div class="esame-q-hint">Puoi cambiare risposta finché non passi alla prossima.</div>' : '') +
        '<div class="esame-opts" id="esameOpts">' + opts + '</div>' +
        '<div class="esame-explain" id="esameExplain" hidden></div>' +
        '<div class="esame-nav" id="esameNav"></div>' +
      '</div>';

    stageEl().querySelectorAll('.esame-opt').forEach(b => {
      b.addEventListener('click', () => choose(parseInt(b.getAttribute('data-i'), 10)));
    });

    // In simulazione la barra di navigazione è sempre presente (Indietro + Avanti);
    // Avanti si attiva solo dopo aver scelto un'opzione.
    if (mode === 'exam') renderNav();
  }

  function choose(i) {
    const item = queue[qIndex];

    if (mode === 'exam') {
      // Nessun feedback e nessun commit: la scelta resta modificabile finché non si va avanti.
      item.sel = i;
      if (item.firstSel == null) item.firstSel = i;
      stageEl().querySelectorAll('.esame-opt').forEach((b, idx) => {
        b.classList.toggle('is-chosen', idx === i);
      });
      renderNav();
      return;
    }

    if (answered) return;
    answered = true;
    const ok = (i === item.correct);
    answers.push({ item: item, chosen: i, ok: ok });
    recordAnswer(item.ref.id, ok);
    save();

    const optBtns = stageEl().querySelectorAll('.esame-opt');

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
    const item = queue[qIndex];
    // In simulazione si può tornare indietro; Avanti resta bloccato finché non hai scelto.
    const canBack = (mode === 'exam' && qIndex > 0);
    const canNext = (mode !== 'exam') || (item.sel != null);
    nav.className = 'esame-nav' + (canBack ? ' is-row' : '');
    nav.innerHTML =
      (canBack ? '<button class="esame-secondary esame-back" id="esamePrev">Indietro</button>' : '') +
      '<button class="esame-next" id="esameNext"' + (canNext ? '' : ' disabled') + '>' +
        (last ? 'Vedi risultato' : 'Avanti') + '</button>';
    document.getElementById('esameNext').addEventListener('click', next);
    if (canBack) document.getElementById('esamePrev').addEventListener('click', prev);
  }

  function prev() {
    if (qIndex === 0) return;
    qIndex--;
    renderQuestion();
  }

  function next() {
    // In simulazione non si avanza senza aver scelto.
    if (mode === 'exam' && queue[qIndex].sel == null) return;
    qIndex++;
    if (qIndex >= queue.length) return finish();
    renderQuestion();
  }

  // In simulazione le risposte non vengono registrate al momento della scelta
  // (per permettere i ripensamenti): si consolidano tutte qui, alla fine.
  function commitExam() {
    answers = [];
    queue.forEach(function (item) {
      if (item.sel == null) return; // domanda non risposta: la saltiamo
      const ok = (item.sel === item.correct);
      answers.push({ item: item, chosen: item.sel, ok: ok });
      recordAnswer(item.ref.id, ok);
      if (item.firstSel != null && item.firstSel !== item.sel) {
        recordChange(item.firstSel === item.correct, ok);
      }
    });
    save();
  }

  // ── Risultato ────────────────────────────────────────────────────────
  function finish() {
    if (mode === 'exam') commitExam();
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

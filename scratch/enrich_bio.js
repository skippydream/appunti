const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../js/app.js');

if (!fs.existsSync(targetFile)) {
    console.error('Target file js/app.js not found at:', targetFile);
    process.exit(1);
}

const jsContent = fs.readFileSync(targetFile, 'utf8');

const cellLabData = {
  "origine_vita": {
    "title": "🧬 Origine della Vita & Evoluzione Chimica",
    "group": "biologia_generale",
    "content": `
            <p>La storia della vita sulla Terra affonda le sue radici in processi fisico-chimici prebiotici svoltisi in un'atmosfera primordiale radicalmente diversa da quella odierna:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/endosimbiosi_img1_p2.jpg" alt="Evoluzione cellulare e Procarioti" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Evoluzione cellulare e Procarioti', 'Immagine da Dispensa Biologia a pag. 2')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 2</strong> - Evoluzione delle prime forme cellulari e procarioti ancestrali</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Sintesi Abiotica & Brodo Primordiale (Oparin-Haldane) 🌋</div>
                <div class="recall-hidden">
                    La Terra primordiale (circa 4.6 miliardi di anni fa) presentava un'atmosfera priva di ossigeno libero ($O_2$), a carattere fortemente riducente, satura di composti inorganici gassosi: <strong>metano ($CH_4$), ammoniaca ($NH_3$), idrogeno molecolare ($H_2$), anidride carbonica ($CO_2$), azoto ($N_2$) ed acqua ($H_2O$)</strong>.
                    <br>L'assenza di ozono ($O_3$) permetteva il libero passaggio delle radiazioni UV solari ad alta energia, le quali, sommate a frequenti scariche elettriche (fulmini) e all'intensa attività geotermica (vulcani e sorgenti idrotermali sottomarine), fornirono l'energia libera per la <strong>sintesi abiotica</strong> di composti organici monomerici a partire da precursori inorganici gassosi. Questi composti si accumularono negli antichi oceani primordiali originando il celebre <strong>"brodo primordiale"</strong>.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. L'Esperimento di Miller-Urey (1953) 🧪</div>
                <div class="recall-hidden">
                    Stanley Miller e Harold Urey progettarono un dispositivo in vetro sigillato che simulava le condizioni primitive terrestri. Riscaldarono acqua liquida (rappresentante gli oceani) immettendone i vapori in una miscela gassosa di $CH_4$, $NH_3$ e $H_2$. Sottoposero i gas a continue scariche di elettrodi (simulando i fulmini) e raffreddarono la miscela tramite un condensatore per far condensare l'acqua in pioggia.
                    <br>Dopo una settimana di funzionamento continuo, scoprirono che circa il $15\\%$ del carbonio inorganico era stato convertito in composti organici solubili, tra cui ben <strong>4 amminoacidi essenziali (glicina, alanina, acido aspartico e acido glutammico)</strong>, acido lattico ed urea. Recenti ri-analisi dei campioni originali conservati hanno rivelato la presenza di oltre 20 amminoacidi differenti, confermando sperimentalmente la solidità dell'ipotesi della sintesi abiotica.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Evoluzione Chimica & Mondo a RNA (Ribozimi) 🧬</div>
                <div class="recall-hidden">
                    Nel corso di milioni di anni, i monomeri organici si sono condensati (probabilmente favoriti dal potere catalitico delle argille nei fondali o in pozze evaporative) originando biopolimeri: <strong>polipeptidi (proteine), polinucleotidi (acidi nucleici), polisaccaridi e lipidi</strong>. 
                    <br>Questi si sono auto-aggregati in goccioline colloidali delimitate da un primitivo doppio strato lipidico, i <strong>coacervati o protobionti</strong>, in grado di compiere scambi metabolici rudimentali con l'esterno.
                    <br><strong>L'Ipotesi del Mondo a RNA:</strong> Si ritiene che le prime forme di materiale genetico non fossero DNA, bensì molecole di <strong>RNA a singolo filamento</strong>. L'RNA possiede la straordinaria proprietà di poter sia conservare l'informazione genetica sia fungere da catalizzatore biologico (<strong>ribozimi</strong>, capaci di auto-replicazione e giunzione nucleotidica in assenza di proteine enzimatiche). Solo successivamente il DNA, chimicamente più stabile e meno prono a mutazioni, ha sostituito l'RNA come archivio genomico stabile.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Comparsa della Fotosintesi & Catastrofe dell'Ossigeno 🍃</div>
                <div class="recall-hidden">
                    I primi organismi cellulari (circa 3.5 miliardi di anni fa) erano <strong>procarioti eterotrofi anaerobi</strong>, che ricavavano energia fermentando le sostanze organiche del brodo primordiale in assenza di ossigeno.
                    <br>L'esaurimento dei nutrienti organici abiotici selezionò i primi organismi <strong>auto-fotosintetici</strong> (tra 2.7 e 2.5 miliardi di anni fa). I primi fotosintetizzatori utilizzavano il solfuro di idrogeno ($H_2S$) come donatore di elettroni (fotosintesi anossigenica).
                    <br>Successivamente comparvero i <strong>Cianobatteri</strong> ancestrali che iniziarono a scindere l'acqua (<strong>fotolisi dell'H₂O</strong>), liberando ossigeno molecolare ($O_2$) nell'atmosfera come sottoprodotto di scarto. Questo evento, noto come <i>"Catastrofe dell'Ossigeno"</i> o <i>Grande Evento di Ossidazione</i>, provocò l'estinzione di massa di gran parte dei procarioti anaerobi obbligati, determinando al contempo la formazione dello <strong>scudo di ozono ($O_3$)</strong> stratosferico (protezione dai raggi UV letali) e spianando la strada alla comparsa dei primi organismi aerobi dotati di catena respiratoria.
                </div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">5. Caratteristiche Fondamentali dei Viventi 🧬</div>
                <div class="recall-hidden">
                    Tutti gli organismi viventi condividono alcune proprietà biologiche fondamentali:
                    <ul>
                        <li><strong>Organizzazione cellulare:</strong> Consistono in una o più cellule (unità strutturale e funzionale elementare).</li>
                        <li><strong>Materiale genetico:</strong> Contengono informazioni codificate nel DNA per regolare le funzioni cellulari e la riproduzione.</li>
                        <li><strong>Parentela genetica:</strong> Condividono un antenato comune e sono correlati evolutivamente.</li>
                        <li><strong>Metabolismo attivo:</strong> Estraggono energia e molecole dall'ambiente esterno per sintetizzare nuovi componenti cellulari.</li>
                        <li><strong>Omeostasi:</strong> Regolano e mantengono stabile il proprio ambiente chimico-fisico interno (es. pH, concentrazioni ioniche).</li>
                    </ul>
                    <strong>Caso dei Virus e Viroidi:</strong> Non sono classificati come esseri viventi. Sono privi di struttura cellulare e metabolismo proprio; si riproducono esclusivamente infettando e sfruttando i macchinari molecolari di una cellula ospite. I <strong>viroidi</strong>, in particolare, sono costituiti da una corta molecola di RNA circolare a singolo filamento priva di rivestimento proteico (capside) e sono patogeni specifici dei vegetali.
                </div>
            </div>
`
  },
  "procarioti_regni": {
    "title": "🦠 Procarioti, Cianobatteri & Classificazione dei Viventi",
    "group": "biologia_generale",
    "content": `
            <p>La distinzione sistematica e morfo-funzionale dei viventi si basa sulle distanze filogenetiche e sulle modalità di nutrizione cellulare:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. I Tre Domini della Vita (Bacteria, Archaea, Eucarya) 🧬</div>
                <div class="recall-hidden">
                    Proposto da Carl Woese sulla base del sequenziamento dell'RNA ribosomiale 16S/18S:
                    <ul>
                        <li><strong>Bacteria (Eubatteri):</strong> Procarioti classici unicellulari. Parete cellulare contenente <strong>peptidoglicano (mureina)</strong>, geni privi di introni, e membrane cellulari costituite da fosfolipidi con legami estere tra acidi grassi lineari e glicerolo.</li>
                        <li><strong>Archaea (Archeobatteri):</strong> Procarioti arcaici filogeneticamente più vicini agli Eucarioti. <strong>Privi di peptidoglicano</strong> nella parete (spesso costituita da pseudomureina o proteine S-layer). Le membrane cellulari contengono catene idrocarburiche eteree ramificate (fitanile) legate al glicerolo (legami etere resistenti all'idrolisi acida e termica), talvolta formanti un monostrato lipidico rigido. Vivono spesso in ambienti estremi: <i>termofili</i> (sorgenti calde), <i>alofili</i> (salinità estrema) e <i>metanogeni</i> (anaerobi produttori di $CH_4$).</li>
                        <li><strong>Eucarya (Eucarioti):</strong> Cellule caratterizzate da vera compartimentazione interna con nucleo e organelli delimitati da endomembrane.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Struttura dei Cianobatteri & Differenziamento Cellulare 🌾</div>
                <div class="recall-hidden">
                    Procarioti fotosintetici di fondamentale importanza biogeochimica, contenenti <strong>clorofilla A</strong> e pigmenti accessori chiamati <strong>ficobiline (ficocianina azzurra e ficoeritrina rossa)</strong> organizzati in ficobilisomi sulle membrane tilacoidali disperse nel citoplasma (privi di cloroplasti). Possiedono il fotosistema II e compiono fotosintesi ossigenica.
                    <br>Molte specie formano colonie filamentose tricomatose avvolte da una guaina mucillaginosa protettiva e presentano uno straordinario differenziamento cellulare in risposta a stress nutrizionali:
                    <ul>
                        <li><strong>Cellule Vegetative:</strong> Cellule verdi normali deputate alla fotosintesi attiva.</li>
                        <li><strong>Acineti:</strong> Cellule giganti ricche di riserve (amido dei cianobatteri), con pareti ispessite, prodotte in condizioni avverse come spore di resistenza quiescenti.</li>
                        <li><strong>Eterocisti:</strong> Cellule a parete spessa impermeabile all'ossigeno. Poiché l'enzima <strong>nitrogenasi</strong> (responsabile della fissazione dell'azoto gassoso $N_2$ in ammonio $NH_4^+$) viene irreversibilmente inattivato dall' $O_2$ prodotto dalla fotosintesi, le eterocisti spengono il fotosistema II (non producono $O_2$) e si specializzano nell'<strong>azotofissazione</strong>, scambiando composti azotati (amminoacidi) con le cellule vegetative in cambio di carboidrati.</li>
                    </ul>
                    I cianobatteri vivono spesso in simbiosi mutualistica con piante, come la felce acquatica <i>Azolla</i> (fondamentale per la fertilizzazione azotata naturale delle risaie piemontesi).
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. La Classificazione in Regni Eucarioti & I Protisti 👑</div>
                <div class="recall-hidden">
                    Il dominio degli Eucarioti è classicamente suddiviso in 4 Regni principali in base a differenze metaboliche e trofiche:
                    <ul>
                        <li><strong>Regno Protisti:</strong> Gruppo parafiletico artificiale che include tutti gli eucarioti unicellulari o pluricellulari semplici che non si sviluppano da un embrione e non hanno veri tessuti. Si dividono in: <i>Protozoi</i> (eterotrofi simili ad animali), <i>Alghe</i> unicellulari o pluricellulari (fotoautotrofi dotati di plastidi, progenitori delle piante terrestri, es. alghe verdi caroficee come il genere <i>Chara</i>), e <i>Funghi mucillaginosi</i> (mixomiceti eterotrofi per assorbimento).</li>
                        <li><strong>Regno Funghi:</strong> Organismi eterotrofi per assorbimento extracellulare (secernono enzimi idrolitici nell'ambiente e assorbono i monomeri digeriti). Parete cellulare composta da <strong>chitina</strong> (polimero di N-acetilglucosammina).</li>
                        <li><strong>Regno Animali:</strong> Pluricellulari eterotrofi per ingestione interna. Privi di parete cellulare, a crescita definita.</li>
                        <li><strong>Regno Piante:</strong> Pluricellulari fotoautotrofi fotosintetici che si sviluppano a partire da un <strong>embrione protetto</strong> da tessuti materni sporofitici.</li>
                    </ul>
                </div>
            </div>
`
  },
  "membrana_trasporto": {
    "title": "🔌 Membrana Cellulare & Sistemi di Trasporto",
    "group": "biologia_generale",
    "content": `
            <p>La membrana plasmatica (plasmalemma) è una barriera selettivamente permeabile essenziale per il mantenimento dell'omeostasi cellulare e la percezione dei segnali:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Struttura del Plasmalemma & Mosaico Fluido 🧼</div>
                <div class="recall-hidden">
                    Costituita da un doppio strato di <strong>fosfolipidi anfipatici</strong> (teste polari idrofile orientate verso l'esterno acquoso citosolico ed extracellulare, code idrocarburiche apolari idrofobe orientate faccia a faccia all'interno).
                    <br><strong>Fluidità di Membrana:</strong> Le molecole lipidiche compiono rapidi movimenti di diffusione laterale, rotazione e più raramente flip-flop (passaggio da uno strato all'altro operato da enzimi flippasi). La fluidità dipende da:
                    <ul>
                        <li><i>Temperatura:</i> Temperature basse inducono transizione a stato gelificato rigido.</li>
                        <li><i>Acidi grassi insaturi:</i> La presenza di doppi legami <i>cis</i> piega le code idrocarburiche impedendo il compattamento e aumentando la fluidità a basse temperature.</li>
                        <li><i>Lunghezza delle catene:</i> Catene corte riducono le interazioni di Van der Waals aumentando la fluidità.</li>
                        <li><i>Steroli:</i> I fitosteroli (es. sitosterolo, stigmasterolo nei vegetali) fungono da tamponi termici stabilizzando la fluidità.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Proteine di Membrana, Glicoproteine & Acquaporine ⛓️</div>
                <div class="recall-hidden">
                    Le proteine sono immerse asimmetricamente nel doppio strato fosfolipidico:
                    <ul>
                        <li><strong>Proteine Intrinseche (Transmembrana):</strong> Attraversano completamente il doppio strato, possedendo domini ad alfa-elica idrofobi interni e domini idrofili sporgenti nei compartimenti acquosi.</li>
                        <li><strong>Proteine Estrinseche:</strong> Idrofile, legate debolmente alle teste polari dei lipidi o a proteine intrinseche tramite legami elettrostatici.</li>
                        <li><strong>Glicocalice:</strong> Catene oligosaccaridiche legate covalentemente a proteine (glicoproteine) o lipidi (glicolipidi), localizzate <strong>esclusivamente sulla faccia extracellulare</strong>, deputate al riconoscimento cellulare e alla ricezione di segnali chimici.</li>
                        <li><strong>Acquaporine:</strong> Canali proteici transmembrana altamente selettivi che consentono il flusso ultra-rapido di acqua per osmosi (senza consumo energetico) escludendo gli ioni idrogeno (protoni) per prevenire la scarica del potenziale elettrico di membrana.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Trasporto Passivo: Diffusione e Canali 💧</div>
                <div class="recall-hidden">
                    Sposta sostanze <strong>secondo gradiente</strong> di concentrazione o elettrochimico (da alta a bassa concentrazione), senza alcun dispendio di energia metabolica (ATP):
                    <ul>
                        <li><strong>Diffusione Semplice:</strong> Transito diretto attraverso il doppio strato fosfolipidico. Esclusivo per piccole molecole non polari e gas ($O_2, CO_2, N_2$). Le membrane sono impermeabili a ioni carichi e grandi molecole idrofile.</li>
                        <li><strong>Diffusione Facilitata:</strong> Richiede l'intervento di proteine transmembrana specifiche:
                            <ul>
                                <li><i>Canali Proteici:</i> Pori idrofili altamente selettivi regolati elettricamente (voltaggio-dipendenti) o chimicamente (ligando-dipendenti), che consentono il transito ultra-rapido di ioni specifici (es. canali per il $K^+, Cl^-$).</li>
                                <li><i>Proteine Carrier (Trasportatori):</i> Si legano specificamente al soluto subendo un cambiamento conformazionale che lo rilascia sull'altro lato della membrana (es. trasportatori del glucosio). Il trasporto è specifico, saturabile e soggetto a inibizione.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Trasporto Attivo Primario, Secondario & Vescicolare 🔋</div>
                <div class="recall-hidden">
                    Sposta soluti <strong>contro gradiente</strong> di concentrazione o potenziale elettrochimico, richiedendo consumo di energia metabolica:
                    <ul>
                        <li><strong>Trasporto Attivo Primario:</strong> Consuma direttamente ATP (idrolisi dell'ATP in ADP + Pi) per pompare ioni.
                            <br>Nelle piante l'enzima chiave è la <strong>$H^+$-ATPasi di membrana (pompa protonica)</strong>, che estrude protoni nel compartimento extracellulare (parete) creando un forte gradiente di pH e un potenziale elettrico negativo all'interno della cellula (forza proton-motrice). Negli animali, l'esempio classico è la pompa $Na^+/K^+$-ATPasi (antiporto che estrude $3 Na^+$ ed immette $2 K^+$).</li>
                        <li><strong>Trasporto Attivo Secondario (Cotransporto):</strong> Non consuma ATP direttamente. Sfrutta il gradiente elettrochimico precostituito da una pompa primaria (es. la forza proton-motrice del gradiente di $H^+$) per guidare il trasporto di un secondo soluto contro il suo gradiente:
                            <ul>
                                <li><i>Symporto:</i> Entrambi i soluti si muovono nella stessa direzione (es. symporto Saccarosio/$H^+$ che carica gli zuccheri nel floema per la traslocazione).</li>
                                <li><i>Antiporto:</i> I due soluti si muovono in direzioni opposte (es. antiporto $Na^+/H^+$ per la detossificazione salina, accumulando $Na^+$ nel vacuolo).</li>
                            </ul>
                        </li>
                        <li><strong>Trasporto Vescicolare:</strong> Per macromolecole e particelle. Richiede deformazione della membrana e consumo di ATP. Si divide in <strong>endocitosi</strong> (ingresso nella cellula tramite invaginazione e distacco di vescicole) ed <strong>esocitosi</strong> (fusione di vescicole interne con il plasmalemma per secernere sostanze all'esterno).</li>
                    </ul>
                </div>
            </div>
`
  },
  "endomembrane_organelli": {
    "title": "🔋 Organelli Citoplasmatici & Sistema Endomembrane",
    "group": "biologia_generale",
    "content": `
            <p>La compartimentazione cellulare garantisce l'efficienza metabolica isolando reazioni chimiche incompatibili in organelli specializzati:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Il Reticolo Endoplasmatico (RE) 🕸️</div>
                <div class="recall-hidden">
                    Un complesso sistema tridimensionale continuo di membrane che delimita uno spazio interno detto lume. Nelle cellule vegetali è estremamente dinamico e ramificato. Si divide in:
                    <ul>
                        <li><strong>RE Rugoso (RER):</strong> Rivestito sulla faccia citosolica da ribosomi. È il sito primario di sintesi, ripiegamento e modificazione biochimica (es. glicosilazione iniziale) di proteine destinate alla membrana, al vacuolo o all'escrezione.</li>
                        <li><strong>RE Liscio (REL):</strong> Privo di ribosomi, organizzato in tubuli. È specializzato nella sintesi dei lipidi, nel metabolismo dei carboidrati e nell'accumulo di ioni calcio ($Ca^{2+}$).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. I Ribosomi & La Sintesi Proteica ⛓️</div>
                <div class="recall-hidden">
                    Complessi ribonucleoproteici privi di membrana, formati da una subunità maggiore e una minore. Nei eucarioti sono di tipo 80S, mentre nei procarioti, nei mitocondri e nei plastidi sono 70S.
                    <br><strong>Sintesi proteica:</strong> La catena di mRNA si lega alla subunità minore, i tRNA portano gli amminoacidi corretti per complementarietà codone-anticodone e la subunità maggiore catalizza il legame peptidico. Più ribosomi possono leggere contemporaneamente lo stesso filamento di mRNA formando un <strong>poliribosoma (o polisoma)</strong>.
                    <br>I ribosomi liberi nel citosol producono proteine destinate a rimanere nel citosol, nel nucleo, nei mitocondri o nei cloroplasti. I ribosomi legati al RER vi immettono le proteine grazie a una specifica <strong>sequenza segnale</strong> amminoacidica iniziale riconosciuta da una particella SRP.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Il Dittiosoma (Apparato di Golgi) 📦</div>
                <div class="recall-hidden">
                    Costituito da una serie di cisterne appiattite e discoidali impilate. Presenta una polarità morfo-funzionale:
                    <ul>
                        <li><strong>Lato Cis (faccia d'ingresso):</strong> Rivolto verso il RE, accetta le vescicole di transizione contenenti proteine neosintetizzate.</li>
                        <li><strong>Lato Trans (faccia d'uscita):</strong> Rivolto verso il plasmalemma, da cui si distaccano le vescicole di secrezione destinate al vacuolo o alla membrana.</li>
                    </ul>
                    L'apparato di Golgi ha il compito di raffinare le proteine (glicosilazione complessa, aggiunta di gruppi fosfato/solfato) ed "etichettarle" chimicamente per la destinazione finale. <strong>Funzione vegetale cruciale:</strong> Nei dittiosomi delle piante avviene la sintesi dei polisaccaridi non cellulosici della matrice della parete cellulare (pectine ed emicellulose).
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Micro-corpi: Perossisomi & Gliossisomi 🔬</div>
                <div class="recall-hidden">
                    Organelli sferici monomembranosi contenenti enzimi ossidativi:
                    <ul>
                        <li><strong>Perossisomi:</strong> Contengono enzimi che rimuovono idrogeno da substrati organici producendo acqua ossigenata ($H_2O_2$), tossica per la cellula. L'enzima <strong>catalasi</strong> la degrada immediatamente in acqua ed ossigeno. Nei vegetali partecipano alla fotorespirazione.</li>
                        <li><strong>Gliossisomi (o ossisomi):</strong> Presenti esclusivamente nei semi oleosi in germinazione. Contengono gli enzimi del ciclo del gliossilato, una via metabolica che converte i lipidi di riserva (acidi grassi via beta-ossidazione) in zuccheri (glucosio), fornendo energia per lo sviluppo della plantula prima che diventi fotosintetica.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">5. I Mitocondri & La Respirazione Aerobia 🔋</div>
                <div class="recall-hidden">
                    Sito della respirazione cellulare aerobia. Delimitati da due membrane: la esterna è liscia e permeabile, la interna è ripiegata in <strong>creste mitocondriali</strong> per aumentare la superficie e ospita i complessi della catena di trasporto degli elettroni e l'ATP sintasi per produrre ATP. Lo spazio interno è la matrice (sede del ciclo di Krebs).
                    <br><strong>Prove della teoria endosimbiontica:</strong> Possiedono un proprio genoma costituito da <strong>DNA circolare a doppio filamento</strong> (che muta circa 10 volte più velocemente del genoma nucleare a causa dello stress ossidativo dei radicali liberi) e propri <strong>ribosomi 70S</strong>. Sono in grado di compiere una propria sintesi proteica parziale e si riproducono autonomamente per scissione binaria.
                </div>
            </div>
`
  },
  "citoscheletro_nucleo": {
    "title": "🕸️ Citoscheletro, Nucleo & Organizzazione Genomica",
    "group": "biologia_generale",
    "content": `
            <p>La stabilità meccanica della cellula eucariote, i suoi movimenti interni e la protezione del prezioso genoma nucleare dipendono da sistemi proteici altamente organizzati:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Il Citoscheletro: Microtubuli, Microfilamenti & Filamenti Intermedi 🕸️</div>
                <div class="recall-hidden">
                    Una rete dinamica tridimensionale di filamenti proteici citosolici:
                    <ul>
                        <li><strong>Microtubuli (diametro $25\\text{ nm}$):</strong> Cilindri cavi formati da eterodimeri di <strong>$\alpha$-tubulina e $\beta$-tubulina</strong> polimerizzati in 13 protofilamenti paralleli. Sono polari (estremità "+" a rapida crescita e "-" a lenta crescita) e instabili (assemblaggio/disassemblaggio continuo, come LEGO). Le proteine motrici associate sono le <strong>chinesine</strong> (muovono carichi verso "+") e le <strong>dinesine</strong> (verso "-"). Coordinano lo spostamento dei cromosomi durante la mitosi e guidano le vescicole golgiane.</li>
                        <li><strong>Microfilamenti o Filamenti di Actina ($7-8\\text{ nm}$):</strong> Formati da due catene elicoidali di actina globulare. Insieme alle miosine, sono responsabili dei movimenti citoplasmatici attivi, noti come <strong>ciclosi citoplasmatiche</strong>, che rimescolano il citoplasma accelerando la distribuzione di nutrienti, acqua ed organelli (come i cloroplasti che si orientano rispetto alla luce).</li>
                        <li><strong>Filamenti Intermedi ($8-10\\text{ nm}$):</strong> Costituiti da diverse proteine fibrose (es. cheratine). Forniscono resistenza alla trazione meccanica e stabilità strutturale.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Struttura del Nucleo & Pori Nucleari 🧬</div>
                <div class="recall-hidden">
                    L'organello più evidente al microscopio ottico, sede dell'informazione genetica. Delimitato dall'<strong>involucro nucleare</strong> formato da due membrane parallele a doppio strato fosfolipidico; la membrana esterna è in continuità strutturale con il reticolo endoplasmatico e presenta ribosomi.
                    <br>L'involucro è interrotto da numerosi <strong>pori nucleari</strong>, complessi multiproteici (NPC) che regolano il traffico bidirezionale selettivo: consentono l'ingresso controllato di proteine (es. istoni, polimerasi) e l'uscita verso il citosol di RNA e subunità ribosomiali neosintetizzate.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Compattazione della Cromatina & Istoni 🧬</div>
                <div class="recall-hidden">
                    All'interno del nucleo, il DNA si associa a proteine basiche chiamate <strong>istoni</strong> per formare la <strong>cromatina</strong>. Ci sono 5 classi principali di istoni: $H2A, H2B, H3, H4$ (che formano un ottamero attorno a cui si avvolge il filamento di DNA di 147 coppie di basi, costituendo l'unità base detta <strong>nucleosoma</strong>) e l'istone <strong>H1</strong>, che agisce da clip esterna compattando i nucleosomi in fibre di cromatina da $30\\text{ nm}$.
                    <br>La cromatina si distingue in:
                    <ul>
                        <li><strong>Eucromatina:</strong> Meno condensata, trascritta attivamente dalla cellula.</li>
                        <li><strong>Eterocromatina:</strong> Altamente condensata, trascrizionalmente inattiva.</li>
                    </ul>
                    Il <strong>nucleolo</strong> è una regione densa e non membranosa del nucleo in cui avviene la trascrizione dei geni per l'RNA ribosomiale (rRNA) e l'assemblaggio iniziale delle subunità dei ribosomi.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Numero di Nuclei & Poliploidia Vegetale 👑</div>
                <div class="recall-hidden">
                    La maggior parte delle cellule vegetali è mononucleata, ma esistono importanti eccezioni:
                    <ul>
                        <li><strong>Cellule plurinucleate (cenociti):</strong> Derivano da divisioni nucleari (cariocinesi) ripetute non seguite da divisione cellulare (citocinesi).</li>
                        <li><strong>Cellule anucleate:</strong> Prive di nucleo a maturità (es. gli elementi dei tubi cribrosi del floema conduttore, che sopravvivono grazie al supporto metabolico delle cellule compagne adiacenti nucleate).</li>
                    </ul>
                    <strong>Poliploidia:</strong> La condizione in cui una cellula possiede più di due set completi di cromosomi ($3n, 4n, 6n$, etc.). Molto frequente nel regno vegetale (es. il frumento tenero è esaploide $6n$, la patata è tetraploide $4n$). Può originarsi per duplicazione cromosomica non seguita da mitosi (endoreplicazione). La poliploidia aumenta il volume cellulare, la grandezza degli organi (gigantismo) e spesso conferisce maggiore tolleranza a stress ambientali.
                </div>
            </div>
`
  },
  "ciclo_riproduzione": {
    "title": "🔄 Ciclo Cellulare, Mitosi & Meiosi",
    "group": "biologia_generale",
    "content": `
            <p>La trasmissione fedele dell'informazione genetica e la generazione di variabilità biologica avvengono tramite divisioni cellulari finemente regolate:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Il Ciclo Cellulare & Duplicazione del DNA 🔄</div>
                <div class="recall-hidden">
                    Il ciclo cellulare è la sequenza ordinata di eventi che porta alla divisione di una cellula madre in due cellule figlie. Si divide in:
                    <ul>
                        <li><strong>Interfase:</strong> Periodo di accrescimento e preparazione metabolica, suddiviso in sottofasi:
                            <ul>
                                <li><i>G1:</i> Intensa attività di sintesi proteica e accrescimento volumetrico.</li>
                                <li><i>S (Sintesi):</i> Avviene la <strong>replicazione semiconservativa del DNA</strong> nucleare, duplicando i cromosomi in coppie di cromatidi fratelli uniti al centromero.</li>
                                <li><i>G2:</i> Completamento dei preparativi per la divisione, sintesi di tubulina e proteine del fuso.</li>
                            </ul>
                        </li>
                        <li><strong>Fase M:</strong> Comprende la divisione nucleare (Mitosi) e la divisione citoplasmatica (Citocinesi).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. La Mitosi (Cariocinesi Clonale) ⚡</div>
                <div class="recall-hidden">
                    Processo di divisione nucleare che genera due nuclei geneticamente identici a quello di partenza. Si articola in 4 fasi:
                    <ol>
                        <li><strong>Profase:</strong> Condensazione della cromatina in cromosomi visibili. Scomparsa del nucleolo ed inizio della formazione del fuso mitotico costituito da microtubuli. Nelle piante, mancando i centrioli, il fuso si organizza a partire da zone addensate citoplasmatiche (mitosi anastrale).</li>
                        <li><strong>Metafase:</strong> Frammentazione dell'involucro nucleare. I microtubuli del fuso si legano ai cinetocori dei centromeri dei cromosomi, allineandoli lungo la piastra equatoriale (metafasica).</li>
                        <li><strong>Anafase:</strong> Separazione dei cromatidi fratelli, che vengono trascinati dai microtubuli del fuso verso i poli opposti della cellula, diventando cromosomi indipendenti.</li>
                        <li><strong>Telofase:</strong> I cromosomi raggiungono i poli e si decondensano in cromatina. Si ricostituisce l'involucro nucleare intorno a ciascun set cromosomico e ricompaiono i nucleoli.</li>
                    </ol>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Citocinesi Vegetale & Fragmoplasto 🧱</div>
                <div class="recall-hidden">
                    Nelle cellule animali la citocinesi avviene per strozzamento tramite un anello contrattile di actina. Nelle cellule vegetali questo non è possibile a causa della parete cellulare rigida.
                    <br><strong>Meccanismo del Fragmoplasto:</strong> Durante la tarda anafase/telofase, si organizza all'equatore una struttura cilindrica di microtubuli paralleli detta <strong>fragmoplasto</strong>. Questi microtubuli guidano e allineano le vescicole prodotte dall'apparato di Golgi cariche di pectine. Le vescicole si fondono centripetamente (dal centro verso la periferia) formando la <strong>piastra cellulare (cell plate)</strong>.
                    <br>La piastra si espande lateralmente fino a fondersi con la parete cellulare della cellula madre. Lo spazio interno delle vescicole fuse forma la nuova <strong>lamella mediana pectinica</strong>, mentre le membrane delle vescicole costituiscono il nuovo plasmalemma delle due cellule figlie. Alcuni canali di comunicazione citoplasmatica rimangono aperti attraverso la piastra in formazione, originando i <strong>plasmodesmi</strong>.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Meiosi & Ricombinazione Genetica 🧬</div>
                <div class="recall-hidden">
                    Processo di divisione riduzionale in cui una cellula diploide ($2n$) dà origine a 4 cellule haploidi ($1n$) geneticamente diverse. Consiste in una sola duplicazione del DNA seguita da due divisioni consecutive:
                    <ul>
                        <li><strong>Meiosi I (Riduzionale):</strong> I cromosomi omologhi si accoppiano (sinapsi) formando le tetradi. Durante la profase I avviene il <strong>crossing-over</strong> (scambio fisico di segmenti di DNA tra cromatidi non fratelli), sorgente di variabilità genetica. In anafase I si separano i cromosomi omologhi (non i cromatidi), migrando ai poli opposti.</li>
                        <li><strong>Meiosi II (Equazionale):</strong> Simile a una normale mitosi. Si separano i cromatidi fratelli di ciascun cromosoma. Si ottengono così 4 cellule haploidi con cromosomi a singolo cromatidio. Nelle piante la meiosi non produce direttamente gameti, bensì spore haploidi (meiosi sporica).</li>
                    </ul>
                </div>
            </div>
`
  },
  "macromolecole": {
    "title": "🧪 Le Macromolecole Biologiche",
    "group": "biologia_generale",
    "content": `
            <p>I costituenti molecolari della materia vivente si dividono in quattro grandi classi polimeriche strutturali e funzionali, affiancate da metaboliti secondari:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Carboidrati (Glucidi) 🍞</div>
                <div class="recall-hidden">
                    Composti da Carbonio, Idrogeno ed Ossigeno ($C_n H_{2n} O_n$). Hanno funzione energetica e strutturale:
                    <ul>
                        <li><strong>Monosaccaridi:</strong> Zuccheri semplici. Pentosi (es. ribosio e desossiribosio negli acidi nucleici) ed esosi (es. glucosio e fruttosio, metaboliti respiratori primari).</li>
                        <li><strong>Disaccaridi:</strong> Unione di due monosaccaridi con legame glicosidico. Il <strong>saccarosio</strong> (glucosio + fruttosio) è il principale zucchero solubile traslocato nel floema dei vegetali, poiché chimicamente non riducente e stabile.</li>
                        <li><strong>Polisaccaridi:</strong> Polimeri complessi.
                            <ul>
                                <li><i>Amido:</i> Riserva energetica dei vegetali, accumulato nei plastidi (amiloplasti). Polimero di $\alpha$-D-glucosio composto da <strong>amilosio</strong> (lineare, legami $\alpha$-1,4) ed <strong>amilopectina</strong> (altamente ramificata, legami $\alpha$-1,4 ed $\alpha$-1,6).</li>
                                <li><i>Cellulosa:</i> Principale costituente strutturale della parete cellulare. Polimero lineare di $\beta$-D-glucosio unito da legami <strong>$\beta$-1,4-glicosidici</strong>. L'orientamento alternato dei residui consente la formazione di legami a idrogeno intercatena estremamente stabili, unendo le catene in microfibrille insolubili ad altissima resistenza meccanica.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Lipidi 🥑</div>
                <div class="recall-hidden">
                    Molecole idrofobe o anfipatiche. Comprendono:
                    <ul>
                        <li><strong>Trigliceridi (Grassi e oli):</strong> Riserva energetica concentrata (specialmente nei semi oleosi, es. girasole, colza). Formati da glicerolo esterificato con tre acidi grassi. Gli acidi grassi possono essere saturi (privi di doppi legami, solidi a temperatura ambiente) o insaturi (con doppi legami <i>cis</i>, liquidi/oli).</li>
                        <li><strong>Fosfolipidi:</strong> Costituenti delle membrane biologiche. Un glicerolo legato a due code di acidi grassi idrofobe e ad una testa polare contenente un gruppo fosfato idrofilo.</li>
                        <li><strong>Lipidi di rivestimento:</strong> La <strong>cutina</strong> (poliestere di acidi grassi idrossilati) e la <strong>suberina</strong> (composta da acidi grassi e fenoli) impermeabilizzano le pareti cellulari rispettivamente delle parti aeree (cuticola) e del sughero/endoderma. Le <strong>cere</strong> (esteri di acidi grassi a catena lunghissima con alcoli) rivestono esternamente la cuticola riducendo la traspirazione.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Proteine & Acidi Nucleici 🧬</div>
                <div class="recall-hidden">
                    <ul>
                        <li><strong>Proteine:</strong> Polimeri di amminoacidi legati da legami peptidi. Svolgono ruoli strutturali, di trasporto e catalitici (enzimi). Presentano 4 livelli strutturali:
                            <ul>
                                <li><i>Primaria:</i> Sequenza lineare degli amminoacidi.</li>
                                <li><i>Secondaria:</i> Ripiegamenti locali dovuti a ponti idrogeno (alfa-eliche o foglietti beta).</li>
                                <li><i>Terziaria:</i> Struttura tridimensionale globale dovuta a interazioni tra le catene laterali "R" (ponti disolfuro, interazioni idrofobe).</li>
                                <li><i>Quaternaria:</i> Associazione di più subunità polipeptidiche (es. la Rubisco).</li>
                            </ul>
                        </li>
                        <li><strong>Acidi Nucleici (DNA ed RNA):</strong> Polimeri di nucleotidi (costituiti da un gruppo fosfato, uno zucchero pentoso ed una base azotata). Il DNA (acido desossiribonucleico) conserva l'informazione genetica. L'RNA (acido ribonucleico) partecipa alla sintesi proteica e alla regolazione genica. L'ATP (adenosina trifosfato) è un nucleotide modificato che funge da principale moneta energetica cellulare.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. I Metaboliti Secondari delle Piante 🍁</div>
                <div class="recall-hidden">
                    Composti non essenziali per le funzioni vitali primarie della cellula, ma fondamentali per le interazioni ecologiche (difesa contro erbivori e patogeni, attrazione di impollinatori, allelopatia). Si dividono in tre grandi classi chimiche:
                    <ul>
                        <li><strong>Terpeni (Isoprenoidi):</strong> Sintetizzati a partire dall'isoprene. Includono oli essenziali volatili profumati (monoterpeni), pigmenti carotenoidi (tetraterpeni), fitosteroli di membrana e la gomma naturale (politerpene). Svolgono funzioni di attrazione o repulsione.</li>
                        <li><strong>Composti Fenolici (Aromatici):</strong> Caratterizzati da anelli benzenici con gruppi idrossilici. Comprendono: i <i>flavonoidi</i> (pigmenti dei fiori, es. antociani rossi/blu, e filtri UV naturali); i <i>tannini</i> (composti astringenti tossici per gli erbivori poiché denaturano le loro proteine digestive); la <strong>lignina</strong> (polimero tridimensionale idrofobo fondamentale per la rigidità della parete legnosa).</li>
                        <li><strong>Alcaloidi:</strong> Composti azotati basici a forte attività farmacologica e tossicologica sugli animali. Esempi: <i>caffeina, nicotina, morfina, cocaina</i>, l'<i>efedrina</i> (simpaticomimetico), il <i>taxolo</i> (o tassina, bloccante dei canali del calcio nel miocardio presente nel tasso) e la <i>solanina</i> (glicoalcaloide tossico accumulato nelle parti verdi delle Solanaceae).</li>
                    </ul>
                </div>
            </div>
`
  },
  "cellula": {
    "title": "🧪 La Cellula Vegetale & Compartimentazione",
    "group": "biologia_generale",
    "content": `
            <p>La cellula vegetale si differenzia da quella eucariotica animale per la presenza di tre elementi strutturali fondamentali indispensabili all'autotrofia, al turgore e alla stabilità meccanica:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/cloroplasto_img1_p23.jpg" alt="Organizzazione del Cloroplasto" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Organizzazione del Cloroplasto', 'Immagine da Dispensa Biologia a pag. 23')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 23</strong> - Struttura interna e compartimentazione del cloroplasto fotosintetico</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. La Triade Strutturale Vegetale 🌾</div>
                <div class="recall-hidden">
                    La cellula vegetale possiede tre strutture peculiari assenti nella cellula animale:
                    <ol>
                        <li><strong>La Parete Cellulare:</strong> Involucro rigido esterno al plasmalemma composto da cellulosa, emicellulose e pectine. Sostiene la cellula, ne limita l'espansione prevenendo la lisi osmotica ed è responsabile della forma cellulare.</li>
                        <li><strong>Il Vacuolo:</strong> Un grande compartimento acquoso centrale delimitato da una membrana detta <strong>tonoplasto</strong>. Svolge funzioni osmotiche (genera la pressione di turgore), di riserva e di degradazione.</li>
                        <li><strong>I Plastidi:</strong> Famiglia di organelli a doppia membrana coinvolti nella fotosintesi e nella sintesi di carboidrati, lipidi ed amminoacidi.</li>
                    </ol>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. I Plastidi: Dai Proplastidi ai Cloroplasti 🍃</div>
                <div class="recall-hidden">
                    Tutti i plastidi derivano da <strong>proplastidi</strong> ancestrali, piccoli organelli indifferenziati presenti nelle cellule meristematiche. In base alla luce e al tipo cellulare, i proplastidi si differenziano in:
                    <ul>
                        <li><strong>Cloroplasti:</strong> Plastidi verdi contenenti clorofilla, deputati alla fotosintesi clorofilliana. Se una plantula cresce al buio (eziolamento), i proplastidi si trasformano in <i>etioplasti</i>, caratterizzati da un corpo prolamellare paracristallino. All'esposizione alla luce, gli etioplasti convertono rapidamente le membrane in tilacoidi fotosintetici attivi.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Cromoplasti, Leucoplasti & Amiloplasti 🥕</div>
                <div class="recall-hidden">
                    I plastidi non fotosintetici svolgono ruoli metabolici e di accumulo essenziali:
                    <ul>
                        <li><strong>Cromoplasti:</strong> Plastidi privi di clorofilla ma ricchi di carotenoidi e xantofille (pigmenti lipofili gialli, arancioni e rossi). Danno colore a fiori (petali) e frutti maturi (es. pomodoro), svolgendo un ruolo ecologico nell'attrazione di insetti pronubi e animali disseminatori. Possono derivare direttamente dai cloroplasti tramite la degradazione della clorofilla e la sintesi di carotenoidi.</li>
                        <li><strong>Leucoplasti:</strong> Plastidi incolori, privi di pigmenti e tilacoidi. Sono specializzati nell'accumulo di sostanze di riserva:
                            <ul>
                                <li><i>Amiloplasti:</i> Accumulano amido secondario sotto forma di granuli. Sono abbondanti nei tuberi (es. patata) e nei semi. Nelle cellule della columella della caliptra radicale fungono da <strong>statoliti</strong>: grazie alla loro elevata densità, sedimentano sul fondo della cellula indicando la direzione della forza di gravità (percezione del gravitropismo).</li>
                                <li><i>Elaioplasti:</i> Accumulano lipidi ed oli vegetali.</li>
                                <li><i>Proteinoplasti:</i> Accumulano proteine.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Il Vacuolo: Tonoplasto & Pressione Osmotica 💧</div>
                <div class="recall-hidden">
                    Il vacuolo è l'organello più grande della cellula vegetale adulta (può occupare fino al $90\\%$ del volume interno). È delimitato dal <strong>tonoplasto</strong>, una membrana asimmetrica ricca di proteine di trasporto (pompe protoniche $H^+$-ATPasi e $H^+$-PPasi) che mantengono il succo vacuolare acido (pH 5.0 - 5.5).
                    <br><strong>Funzioni principali:</strong>
                    <ul>
                        <li><strong>Pressione Osmotica & Turgore:</strong> L'accumulo attivo di soluti (acidi organici, sali minerali, zuccheri) nel succo vacuolare abbassa il potenziale idrico del vacuolo. Questo richiama acqua per osmosi dal citoplasma. L'acqua gonfia il vacuolo che preme il citoplasma contro la parete cellulare rigida, generando la <strong>pressione di turgore</strong>. Il turgore mantiene la rigidità delle piante erbacee ed è la forza motrice per l'accrescimento cellulare per distensione.</li>
                        <li><strong>Accumulo di Metaboliti:</strong> Sede di stoccaggio di pigmenti idrosolubili (es. <strong>antociani</strong> rossi/azzurri che danno colore a fiori e foglie autunnali), sostanze di difesa (tannini, acidi organici in eccesso per prevenire tossicità citoplasmatica), o riserve di nutrienti.</li>
                        <li><strong>Funzione litica:</strong> Contiene enzimi idrolitici acidi (analogo ai lisosomi animali) per degradare e riciclare macromolecole.</li>
                    </ul>
                </div>
            </div>
`
  },
  "parete": {
    "title": "🧱 Parete Cellulare: Macromolecole, Strati & Modificazioni",
    "group": "istologia_vegetale",
    "content": `
            <p>La parete cellulare è un compartimento extracellulare dinamico secreto centripetamente (dall'esterno verso l'interno). Si suddivide in tre livelli fisici:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/lignina_img2_p64.jpg" alt="Parete cellulare secondaria e lignificazione" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Parete cellulare secondaria e lignificazione', 'Immagine da Dispensa Biologia a pag. 64')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 64</strong> - Modificazioni secondarie della parete cellulare e depositi di lignina</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Lamella Mediana & Matrice Pectinica 🧪</div>
                <div class="recall-hidden">
                    Lo strato più esterno, comune a due cellule adiacenti. Costituito prevalentemente da <strong>pectine</strong> (polisaccaridi cementanti ricchi di acido galatturonico, come omogalatturonani e ramnogalatturonani) ad azione idrofila gelificante. Viene solubilizzata enzimaticamente dalle pectinasi durante la maturazione dei frutti (ammorbidimento) e la formazione delle zone di abscissione fogliare.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Parete Primaria 🌱</div>
                <div class="recall-hidden">
                    Sottile, elastica ed estensibile, presente in tutte le cellule vegetali giovani o metabolicamente attive. Composta da cellulosa al 20-30% disposta in modo disordinato (tessitura dispersa o isotropa) immersa in una matrice altamente idratata di emicellulose (xiloglicani) e pectine. Consente l'accrescimento per distensione cellulare sotto la pressione di turgore indotta dal vacuolo.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Parete Secondaria & Sintesi della Cellulosa 🪵</div>
                <div class="recall-hidden">
                    Si deposita centripetamente solo dopo che la cellula ha terminato l'accrescimento volumetrico. Molto ricca di <strong>cellulosa</strong> (polimero lineare di residui di D-glucosio legati con legame beta-1,4) organizzata in microfibrille parallele ad altissima resistenza meccanica disposte in tre sottostrati orientati diversamente (S1, S2, S3).
                    <br>La cellulosa viene sintetizzata a livello della membrana plasmatica da complessi enzimatici esametrici detti <strong>rosette di celluloso-sintasi (CesA)</strong>, le quali si muovono lungo i binari formati dai microtubuli corticali sottostanti, tessendo le fibrille direttamente in muro.
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/lignina_img1_p64.png" alt="Sintesi della Cellulosa via Rosette CesA" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Sintesi della Cellulosa via Rosette CesA', 'Fig. da Dispensa pag. 64')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 64</strong> - Rosette di celluloso-sintasi (CesA) in membrana</div>
                    </div>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Modificazioni Chimiche della Parete 🧪</div>
                <div class="recall-hidden">
                    La parete può subire modificazioni secondarie che ne alterano le proprietà chimico-fisiche:
                    <ul>
                        <li><strong>Lignificazione:</strong> Impregnazione della parete primaria e secondaria con <strong>lignina</strong> (polimero idrofobo tridimensionale di monolignoli: alcool p-coumarilico, coniferilico e sinapilico). Conferisce rigidità assoluta alla compressione ed evita il collasso dei vasi xilematici sottoposti a forti tensioni idriche.
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/lignina_img3_p64.jpg" alt="Sezione lignificata" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Sezione lignificata', 'Fig. da Dispensa pag. 64')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 64</strong> - Particolare di parete secondaria pesantemente lignificata</div>
                            </div>
                        </li>
                        <li><strong>Suberificazione:</strong> Deposizione interna di lamelle di <strong>suberina</strong> (macromolecola composta da un dominio polifenolico simile alla lignina e un dominio polialifatico impermeabilizzante). Tipica del sughero e dell'endoderma radicale.
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/lignina_img4_p64.jpg" alt="Modificazioni cutina/suberina" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Modificazioni cutina/suberina', 'Fig. da Dispensa pag. 64')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 64</strong> - Modificazioni paretali: deposizione di cutina e suberina</div>
                            </div>
                        </li>
                        <li><strong>Cutinizzazione:</strong> Apposizione esterna di cutina e cere per formare la cuticola, che impermeabilizza le foglie proteggendole dalla disidratazione e da attacchi di patogeni.</li>
                        <li><strong>Mineralizzazione:</strong> Incrostazione della parete con composti inorganici. Può essere <strong>silicizzazione</strong> (accumulo di silice, $SiO_2$, es. nelle foglie di riso o equiseti per aumentarne la durezza) o <strong>calcificazione</strong> (carbonato di calcio, $CaCO_3$).</li>
                    </ul>
                </div>
            </div>
`
  },
  "meristemi": {
    "title": "🌱 Tessuti Meristematici (Accrescimento Indefinito & Divisioni)",
    "group": "istologia_vegetale",
    "content": `
            <p>I meristemi mantengono la pianta in uno stato di crescita permanente e rigenerativa. Si differenziano per origine evolutiva e piani di divisione cellulare:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/tunica_corpus_img1_p74.jpg" alt="Apice vegetativo del fusto (SAM)" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Apice vegetativo del fusto (SAM)', 'Immagine da Dispensa Biologia a pag. 74')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Apice meristematico del fusto con teoria Tunica-Corpus L1/L2/L3</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Piani di Divisione Cellulare: Anticline vs Pericline ⚡</div>
                <div class="recall-hidden">
                    L'orientamento del fuso mitotico determina la struttura tridimensionale dei tessuti vegetali:
                    <ul>
                        <li><strong>Divisioni Anticline:</strong> La piastra cellulare si forma perpendicolarmente alla superficie dell'organo. Aumenta il numero di cellule all'interno dello stesso strato, determinando l'espansione in superficie dell'organo (es. crescita della tunica).
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/tunica_corpus_img2_p74.jpg" alt="Divisioni anticline e pericline" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Divisioni anticline e pericline', 'Fig. da Dispensa pag. 74')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Direzione dei piani di divisione cellulare nei tessuti apicali</div>
                            </div>
                        </li>
                        <li><strong>Divisioni Pericline:</strong> La piastra cellulare si forma parallelamente alla superficie dell'organo. Aumenta il numero di strati cellulari sovrapposti, determinando l'espansione in spessore o diametro (tipico dei cambi meristematici secondari).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Meristemi Primari (SAM, RAM & Teoria Tunica-Corpus) 📏</div>
                <div class="recall-hidden">
                    Derivano direttamente dall'embrione e sono responsabili della crescita in lunghezza dell'asse della pianta. Le cellule sono piccole, isodiametriche, con citoplasma denso, prive di vacuolo centrale, ricche di proplastidi e con nucleo enorme.
                    <ul>
                        <li><strong>Apice del Germoglio (SAM):</strong> Organizzato secondo la <strong>teoria Tunica-Corpus</strong> di Schmidt. La <i>Tunica</i> (strati L1 e L2 più esterni) esegue esclusivamente divisioni anticline per accrescere l'epidermide e il mesofillo esterno. Il <i>Corpus</i> (strato L3 interno) compie divisioni sia anticline che pericline, aumentando il volume interno del fusto.
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/tunica_corpus_img3_p74.png" alt="Schema dell'apice vegetativo" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Schema dell\'apice vegetativo', 'Fig. da Dispensa pag. 74')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Organizzazione del meristema apicale del germoglio (SAM)</div>
                            </div>
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/tunica_corpus_img4_p74.jpg" alt="Microfotografia dell'apice vegetativo" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Microfotografia dell\'apice vegetativo', 'Fig. da Dispensa pag. 74')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Sezione istologica longitudinale del germoglio apicale e primordi fogliari</div>
                            </div>
                        </li>
                        <li><strong>Apice della Radice (RAM):</strong> Organizzato con un centro quiescente (QC) circondato da cellule iniziali attive. Il QC è caratterizzato da divisioni estremamente lente, fungendo da riserva cellulare protetta da mutazioni genetiche. Le cellule iniziali producono costantemente cellule meristematiche destinate al corpo primario della radice e alla caliptra (cuffia protettiva che lubrifica il suolo tramite mucigel e percepisce la gravità tramite gli statoliti della columella).
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/tunica_corpus_img5_p74.jpg" alt="Apice radicale (RAM)" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Apice radicale (RAM)', 'Fig. da Dispensa pag. 74')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Sezione longitudinale di apice radicale (RAM) e caliptra</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Meristemi Secondari (Cambio Vascolare & Fellogeno) 🪵</div>
                <div class="recall-hidden">
                    Meristemi laterali responsabili dell'accrescimento secondario (in spessore). Cellule allungate, vacuolate, che si dividono prevalentemente in senso pericline:
                    <ul>
                        <li><strong>Cambio Cribro-Legnoso (Vascolare):</strong> Tessuto dipleurico che produce legno (xilema secondario) centripetamente e libro (floema secondario) centrifugamente. Sviluppa cellule iniziali fusiformi (danno origine ai vasi) e cellule iniziali dei raggi (danno origine ai raggi midollari).
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/tunica_corpus_img6_p74.jpg" alt="Sezione del cambio vascolare" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Sezione del cambio vascolare', 'Fig. da Dispensa pag. 74')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Attività dipleurica del cambio cribro-legnoso</div>
                            </div>
                        </li>
                        <li><strong>Cambio Sughero-Fellodermico (Fellogeno):</strong> Produce sughero centrifugamente e felloderma centripetamente, formando il periderma che sostituisce l'epidermide lacerata dalla crescita secondaria.</li>
                    </ul>
                    I meristemi secondari possono rigenerarsi in seguito a ferite (tessuto cicatriziale). I <strong>meristemoidi</strong> (o meristemi avventizi) sono singole cellule meristematiche che si attivano all'interno di tessuti adulti per formare strutture specifiche come peli o stomi.
                </div>
            </div>
`
  },
  "tegumentali": {
    "title": "🛡️ Tessuti Tegumentali: Epidermide, Rizoderma & Endoderma",
    "group": "istologia_vegetale",
    "content": `
            <p>I tessuti di rivestimento regolano in modo altamente selettivo gli scambi di acqua, gas e nutrienti con l'ambiente esterno ed interno:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Epidermide Aerea: Stomi & Cellule Bulliformi 🍃</div>
                <div class="recall-hidden">
                    Tessuto primario esterno monostratificato (pluristratificato nelle xerofite, es. Oleandro con 3 strati), continuo, privo di spazi intercellulari e di cloroplasti (ad eccezione delle cellule di guardia stomatiche). Le pareti esterne sono rivestite dalla cuticola (cutina + cere) che riduce la traspirazione. L'effetto loto è dovuto a cere epicuticolari che fanno scivolare l'acqua in gocce trascinando via patogeni e sporco.
                    <br><strong>Meccanismo di Apertura degli Stomi:</strong> La luce o la bassa concentrazione di $CO_2$ attivano una pompa protonica $H^+$-ATPasi sulla membrana delle cellule di guardia. L'estrusione attiva di protoni crea un potenziale elettrico negativo all'interno, che induce l'afflusso passivo facilitato di ioni $K^+$ e $Cl^-$. L'accumulo osmotico di questi soluti richiama acqua nel vacuolo attraverso le acquaporine. La pressione di turgore gonfia le cellule di guardia. Avendo pareti interne (verso la rima) fortemente ispessite e microfibrille di cellulosa disposte radialmente, le cellule si incurvano all'indietro aprendo la rima stomatica.
                    <br><strong>Cellule Bulliformi:</strong> Cellule giganti a parete sottile (in molte graminee) che perdono turgore rapidamente in caso di deficit idrico, provocando il ripiegamento o accartocciamento protettivo della foglia.
                    <br>L'epidermide può ospitare <strong>cistoliti</strong> (accumuli cristallini di carbonato di calcio o silice, es. in <i>Ficus</i>) e peli/tricomi con funzione protettiva o riflettente.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Rizoderma & Peli Radicali 🌾</div>
                <div class="recall-hidden">
                    Tessuto primario esterno della radice nella zona assorbente. È privo di cuticola e stomi, ed è costituito da cellule con pareti sottili pectocellulosiche per agevolare il passaggio dell'acqua. Alcune cellule specializzate dette <strong>tricoblasti</strong> si estroflettono originando i <strong>peli radicali</strong> (peli unicellulari a vita breve). I peli radicali aumentano la superficie assorbente radicale fino a 20 volte, penetrando negli anfratti del terreno per captare acqua e sali minerali. Secernono anche essudati acidi che solubilizzano i nutrienti minerali. La loro vita dura pochi giorni prima che cadano insieme al rizoderma senescente.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Esoderma & Endoderma (I Filtri Interni) 🛡️</div>
                <div class="recall-hidden">
                    <ul>
                        <li><strong>Esoderma:</strong> Tessuto tegumentale primario esterno della radice. Si forma quando il rizoderma degenera; lo strato esterno del parenchima corticale suberifica per evitare perdite idriche, lasciando solo alcune cellule non modificate (punti di permeazione) per lo scambio.</li>
                        <li><strong>Endoderma:</strong> L'unico tessuto tegumentale primario interno, situato a delimitare il cilindro centrale della radice. È privo di spazi intercellulari e presenta cellule vive prismatiche. Le pareti radiali e trasversali sono impermeabilizzate dalla <strong>banda di Caspary</strong> (costituita da suberina e lignina). Questa banda agisce come una barriera invalicabile per il flusso apoplastico (l'acqua e i soluti che viaggiano passivamente attraverso le pareti e gli spazi intercellulari). A livello dell'endoderma, la soluzione è costretta a transitare attraverso il plasmalemma ed entrare nella via simplastica (attiva e controllata), consentendo alla cellula di selezionare quali ioni immettere nel flusso xilematico.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Il Sughero & Il Periderma 🪵</div>
                <div class="recall-hidden">
                    Tessuto tegumentale secondario esterno che sostituisce l'epidermide fustale e radicale nelle piante legnose. È pluristratificato, privo di spazi vuoti. Le pareti delle cellule sono completamente rivestite da strati alternati di suberina, cere e lignina. A maturità le cellule muoiono, riempiendosi d'aria e accumulando tannini/resine ad azione antisettica, diventando un eccellente isolante termico e barriera impermeabile.
                    <br><strong>Lenticelle:</strong> Cellule a parete primaria non suberificata con ampi spazi intercellulari, prodotte dal fellogeno, che interrompono localmente il sughero consentendo gli scambi gassosi indispensabili per i tessuti viventi sottostanti. Non sono stomi e non hanno meccanismo di apertura/chiusura attiva (vengono semplicemente chiuse da uno strato di sughero a fine stagione).
                    <br>Il <strong>Periderma</strong> è il complesso formato da: sughero (esterno), fellogeno (cambio secondario) e felloderma (parenchima secondario interno).
                </div>
            </div>
`
  },
  "meccanici": {
    "title": "💪 Tessuti di Sostegno & Conduzione Linfa",
    "group": "istologia_vegetale",
    "content": `
            <p>I sistemi strutturali per la colonizzazione della terraferma e il trasporto idraulico a grandi distanze:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Il Sostegno delle Piante Terrestri 💪</div>
                <div class="recall-hidden">
                    Nelle piante erbacee o giovani il sostegno è garantito dal turgore cellulare (pressione osmotica del vacuolo contro la parete cellulare). Nelle piante di grandi dimensioni e lignificate si sviluppano tessuti meccanici specializzati dotati di pareti spesse che resistono alle sollecitazioni di gravità (compressione) e vento (torsione e trazione).
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Il Collenchima (Sostegno Elastico) 🌱</div>
                <div class="recall-hidden">
                    Tessuto meccanico primario tipico degli organi giovani in crescita attiva (es. piccioli, fusti erbacei come sedano e menta). È formato da cellule vive, allungate assialmente, prive di spazi intercellulari. Presenta <strong>pareti primarie non lignificate, ispessite in modo disomogeneo celluloso-pectico</strong> (ricche di pectine fino al $45\\%$ del peso secco e acqua).
                    <br>Le pareti hanno proprietà plastiche ed elastiche: possono allungarsi per assecondare l'accrescimento dell'organo senza perdere la loro funzione di sostegno. Conserva una buona attività metabolica e può contenere cloroplasti fotosintetici.
                    <br>In base alla localizzazione degli ispessimenti si distingue in:
                    <ul>
                        <li><strong>Angolare:</strong> Ispessimenti concentrati negli angoli di giunzione delle cellule (il più comune, es. <i>Begonia</i>).</li>
                        <li><strong>Lamellare:</strong> Ispessimenti sulle pareti tangenziali (es. <i>Sambucus</i>).</li>
                        <li><strong>Anulare:</strong> Ispessimento uniforme intorno al lume cellulare (es. <i>Salvia</i>).</li>
                        <li><strong>Lacunoso:</strong> Di derivazione parenchimatica, presenta spazi intercellulari con ispessimenti intorno ad essi.</li>
                    </ul>
                    Il collenchima è assente nelle radici, dove non c'è sollecitazione da vento o gravità aerea.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Lo Sclerenchima (Sostegno Rigido) 🪵</div>
                <div class="recall-hidden">
                    Tessuto meccanico presente nelle zone adulte della pianta che hanno completato la crescita. È formato da cellule con <strong>pareti secondarie ispessite in modo omogeneo ed fortemente lignificate</strong>. La deposizione di lignina impedisce gli scambi metabolici e causa la morte cellulare a maturità.
                    <br>Le cellule sclerenchimatiche comunicano tra loro tramite <strong>punteggiature semplici</strong> (canali radiali stretti privi di parete secondaria), in cui non vi è condivisione di citoplasma ma solo passaggio di acqua.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Fibre Sclerenchimatiche vs Sclereidi 🔬</div>
                <div class="recall-hidden">
                    Lo sclerenchima si divide in due grandi classi cellulari:
                    <ul>
                        <li><strong>Fibre Sclerenchimatiche:</strong> Cellule allungate e appuntite alle estremità, che crescono prima per accrescimento simplastico (insieme alle cellule vicine) e poi per accrescimento intrusivo (gli apici si insinuano tra le cellule circostanti). Si dividono in:
                            <ul>
                                <li><i>Fibre Xilari:</i> Localizzate all'interno del legno (xilema).</li>
                                <li><i>Fibre Extra-xilari:</i> Situate all'esterno del legno, spesso disposte in fasci protettivi intorno ai vasi conduttori (fonte di fibre tessili commerciali). La morbidezza della fibra dipende dal grado di lignificazione: il lino ha fibre cellulosiche non lignificate (morbide), la canapa è lignificata al $50\\%$, la juta è quasi interamente lignificata ($>70\\%$, rigida). <i>N.B. Il cotone non è una fibra sclerenchimatica, ma un pelo epidermico cellulosico del seme.</i></li>
                            </ul>
                        </li>
                        <li><strong>Sclereidi (o cellule petrose):</strong> Cellule isodiametriche o ramificate con pareti lignificate spessissime attraversate da canali di punteggiatura ramificati. Possono trovarsi isolate o in gruppi nei tessuti parenchimatici:
                            <ul>
                                <li><i>Brachisclereidi:</i> Tondeggianti, formano le "isole petrose" nella polpa delle pere o costituiscono l'endocarpo legnoso delle drupe (es. nocciolo di pesca, ciliegia) e il guscio della noce di cocco.</li>
                                <li><i>Macrosclereidi:</i> A bastoncino, formano lo strato protettivo nei semi delle leguminose.</li>
                                <li><i>Astrosclereidi:</i> A stella, ramificate, comuni nei piccioli delle ninfee.</li>
                                <li><i>Osteosclereidi:</i> A forma di osso (es. in soia).</li>
                                <li><i>Tricosclereidi:</i> A forma di capello, presenti nelle foglie di olivo.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
`
  },
  "secretori": {
    "title": "🧪 Tessuti Secretori & Metaboliti di Difesa",
    "group": "istologia_vegetale",
    "content": `
            <p>I tessuti secretori producono, accumulano o espellono sostanze organiche o inorganiche derivate dal metabolismo secondario o da processi di escrezione fisiologica:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Vie di Secrezione: Intracellulare ed Extracellulare 🧪</div>
                <div class="recall-hidden">
                    I prodotti del metabolismo secondario (terpeni, resine, alcaloidi) seguono due modalità di accumulo:
                    <ul>
                        <li><strong>Secrezione Intracellulare:</strong> Le sostanze accumulate rimangono all'interno del citoplasma o, più frequentemente, racchiuse nel grande vacuolo centrale per evitarne la tossicità. Tipica di singole cellule speciali dette <strong>idioblasti secretori</strong> o dei <strong>laticiferi</strong> (tubi contenenti lattice, es. <i>Ficus</i>, tarassaco o il papavero da oppio).</li>
                        <li><strong>Secrezione Extracellulare:</strong> Le sostanze vengono secrete fuori dalla membrana plasmatica, accumulandosi in spazi intercellulari (dotti, canali resiniferi, tasche lisigene/schizogene, es. scorza degli agrumi) o rilasciate direttamente all'esterno della pianta (peli ghiandolari, nettari).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Tessuti Secretori Esterni: Peli Ghiandolari & Urticanti 🪶</div>
                <div class="recall-hidden">
                    Strutture epidermiche specializzate:
                    <ul>
                        <li><strong>Peli o Tricomi Ghiandolari:</strong> Cellule vive dotate di un peduncolo e una testa (uni o pluricellulare) secernente. Il secreto (es. oli essenziali volatili) viene accumulato in uno spazio tra la parete cellulare esterna e la cuticola, che si rompe al passaggio di un animale o per calore. Si dividono in peli <i>capitati</i> (testa sferica) e peli <i>peltati</i> (piatti a scudo).</li>
                        <li><strong>Peli Urticanti (es. Ortica):</strong> Costituiti da un pelo unicellulare montato su una base pluricellulare. La punta del pelo è impregnata di silice (vetrosa e fragile), mentre la parte sottostante contiene carbonato di calcio. Al minimo tocco la punta silicizzata si spezza lungo una linea di frattura obliqua, penetrando nella pelle come un ago ipodermico e iniettando sotto pressione acido formico ed istamina contenuti nel vacuolo.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Ghiandole del Sale & Idatodi (Guttazione) 🧂</div>
                <div class="recall-hidden">
                    <ul>
                        <li><strong>Ghiandole del Sale:</strong> Presenti nelle piante alofile (adattate ad alta salinità). Raccolgono attivamente $NaCl$ dal citoplasma tramite trasportatori di membrana e lo accumulano nel vacuolo di una cellula terminale a vescicola. Quando la vescicola è satura, si secca e cade, eliminando il sale in eccesso dalla pianta.</li>
                        <li><strong>Idatodi:</strong> Strutture ghiandolari localizzate sui margini fogliari in corrispondenza delle terminazioni dei vasi xilematici. Sono aperture fisse (non regolabili). Consentono l'eliminazione di acqua liquida sotto forma di gocce (processo detto <strong>guttazione</strong>) in ambienti caldi ed estremamente umidi dove la traspirazione fogliare è bloccata. La spinta è garantita dalla pressione radicale attiva che pompa acqua nei vasi.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. I Nettari: Fiorali ed Extrafiorali 🌸</div>
                <div class="recall-hidden">
                    Ghiandole multicellulari collocate negli infossamenti dell'epidermide. Producono nettare a partire dalla linfa floematica elaborata da specifici enzimi nettariferi. Il nettare è accumulato nelle cisterne del RE ed espulso per esocitosi:
                    <ul>
                        <li><strong>Nettari Fiorali:</strong> Localizzati all'interno del fiore (es. alla base dei petali). Fungono da ricompensa zuccherina per attirare gli impollinatori (insetti pronubi, uccelli).</li>
                        <li><strong>Nettari Extrafiorali:</strong> Situati su piccioli o foglie. Hanno funzione difensiva: secernono zuccheri per attirare formiche protettrici (simbiosi di mutualismo o mirmecofilia). Le formiche difendono la foglia dai fitofagi in cambio di cibo.</li>
                    </ul>
                    Il nettare contiene zuccheri (glucosio, fruttosio, saccarosio), aminoacidi e composti fenolici deterrenti o protettivi dai raggi UV.
                </div>
            </div>
`
  },
  "fusto": {
    "title": "🪵 Anatomia del Fusto: Struttura Primaria e Secondaria",
    "group": "anatomia_vegetale",
    "content": `
            <p>Il fusto sostiene le foglie esponendole alla luce e conduce i flussi idraulici tra radici e foglie. Si evolve da una struttura primaria a una complessa struttura secondaria legnosa nelle piante arboree:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/tunica_corpus_img6_p74.jpg" alt="Sezione istologica del fusto legnoso" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Sezione istologica del fusto legnoso', 'Immagine da Dispensa Biologia a pag. 74')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Struttura secondaria con cambio vascolare e anelli legnosi</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Fusto in Struttura Primaria: Eustele vs Atactostele 🪵</div>
                <div class="recall-hidden">
                    La struttura primaria del fusto si sviluppa direttamente dall'attività del SAM. Dall'esterno all'interno presenta: epidermide, corteccia parenchimatica (contenente clorenchima ed eventuale collenchima) e cilindro centrale (stele) contenente i fasci cribro-vascolari. Si distinguono due modelli anatomici principali:
                    <ul>
                        <li><strong>Eustele (tipica delle Dicotiledoni e Gimnosperme):</strong> I fasci cribro-vascolari sono disposti in modo ordinato a formare un anello intorno ad un midollo centrale. I fasci sono <strong>collaterali aperti</strong> (presentano uno strato di cambio intrafasciale tra xilema interno e floema esterno). Sono separati da parenchima detto raggio midollare primario.</li>
                        <li><strong>Atactostele (tipica delle Monocotiledoni):</strong> I fasci sono sparsi apparentemente senza ordine in tutto lo spessore del parenchima fondamentale. I fasci sono <strong>collaterali chiusi</strong> (mancano del tutto di cambio residuo tra xilema e floema, e sono avvolti da una guaina sclerenchimatica rigida). Le monocotiledoni non compiono quindi una crescita secondaria legnosa vera.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Transizione alla Struttura Secondaria (Legno & Libro) 🪵</div>
                <div class="recall-hidden">
                    Nelle dicotiledoni e gimnosperme, il cambio intrafasciale (presente nei fasci) si unisce al cambio interfasciale (differenziatosi dalle cellule dei raggi midollari), formando un anello meristematico continuo.
                    <br>L'attività dipleurica del cambio vascolare produce:
                    <ul>
                        <li><strong>Xilema Secondario (Legno):</strong> Prodotto centripetamente (verso l'interno). Spinge il cambio verso l'esterno.</li>
                        <li><strong>Floema Secondario (Libro o Bast):</strong> Prodotto centrifugamente (verso l'esterno) in quantità minori rispetto al legno.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Gli Anelli di Accrescimento & Raggi Midollari 🌲</div>
                <div class="recall-hidden">
                    Nelle zone temperate, l'attività stagionale del cambio vascolare produce gli anelli di accrescimento annuali nel legno:
                    <ul>
                        <li><strong>Legno Primaverile (Earlywood):</strong> Prodotto in primavera. Caratterizzato da vasi a lume molto ampio e pareti sottili per massimizzare il trasporto idrico all'emissione delle foglie. Appare più chiaro e meno denso.</li>
                        <li><strong>Legno Autunnale (Latewood):</strong> Prodotto a fine stagione. Presenta vasi stretti e una forte percentuale di fibre sclerenchimatice a parete spessa per il sostegno. Appare scuro e denso.</li>
                    </ul>
                    La transizione netta tra il legno autunnale di un anno e quello primaverile dell'anno successivo rende visibile la delimitazione dell'anello. I <strong>raggi midollari secondari</strong>, formati da cellule parenchimatiche vive disposte radialmente, garantiscono la traslocazione laterale e l'accumulo di nutrienti nel tronco.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Il Periderma & La Scorza 🪵</div>
                <div class="recall-hidden">
                    La crescita in spessore del legno esercita una forte tensione verso l'esterno, lacerando l'epidermide. Negli strati corticali esterni si differenzia un secondo cambio laterale: il <strong>fellogeno</strong> (o cambio subero-fellodermico).
                    <br>Il fellogeno produce <strong>sughero</strong> centrifugamente e <strong>felloderma</strong> centripetamente. Questo complesso (Periderma) isola e protegge il fusto. L'accumulo di tessuti morti esterni (sughero e floema primario/secondario schiacciato) forma la <strong>scorza (ritidoma)</strong> del tronco, che si sfalda caratteristicamente in base alla specie.
                </div>
            </div>
`
  },
  "radice": {
    "title": "🌾 La Radice: Struttura, Assorbimento & Simbiosi",
    "group": "anatomia_vegetale",
    "content": `
            <p>La radice àncora la pianta al suolo e assorbe selettivamente acqua e sali minerali dal terreno, spingendoli verso l'apparato aereo:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/caspary_img1_p56.jpg" alt="Endoderma e Banda di Caspary" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Endoderma e Banda di Caspary', 'Immagine da Dispensa Biologia a pag. 56')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 56</strong> - Sezione istologica trasversale di radice: cilindro centrale ed endoderma</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Struttura Longitudinale della Radice 📏</div>
                <div class="recall-hidden">
                    Dall'apice verso la base si distinguono 4 zone funzionali:
                    <ol>
                        <li><strong>La Cuffia o Caliptra:</strong> Cappuccio protettivo cellulare che avvolge il RAM. Le cellule esterne desquamano e secernono mucigel (mucillagini) che lubrifica il suolo facilitando la penetrazione. Al centro della cuffia vi è la <strong>columella</strong>, le cui cellule contengono amiloplasti statoliti che sedimentano indicando la gravità.</li>
                        <li><strong>Zona Meristematica (RAM):</strong> Sede di divisione attiva cellulare, contiene il QC (centro quiescente).</li>
                        <li><strong>Zona di Distensione:</strong> Le cellule aumentano di volume per distensione vacuolare, spingendo l'apice nel suolo. È la zona di massima crescita in lunghezza.</li>
                        <li><strong>Zona Pilifera (di Differenziamento):</strong> Comparsa del rizoderma con peli radicali attivi nell'assorbimento.</li>
                    </ol>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Sezione Trasversale in Struttura Primaria: Actinostele 🌾</div>
                <div class="recall-hidden">
                    Dall'esterno all'interno presenta:
                    <ul>
                        <li><strong>Rizoderma:</strong> Strato esterno privo di stomi e cuticola, provvisto di peli radicali.</li>
                        <li><strong>Corteccia Parenchimatica:</strong> Molto ampia e sviluppata (funzione di accumulo di amido). Lo strato più interno è l'<strong>endoderma</strong>, le cui pareti cellulari presentano la <strong>banda di Caspary</strong> suberificata.</li>
                        <li><strong>Cilindro Centrale (Stele):</strong> Organizzato come <strong>actinostele</strong>. Non ci sono fasci collaterali. Lo xilema e il floema si organizzano in cordoni o arche alternate disposte radialmente (come i raggi di una ruota). Al di sotto dell'endoderma si trova il <strong>periciclo</strong>, uno strato di cellule vive che mantengono potenzialità meristematica: è dal periciclo che si originano le <strong>radici laterali</strong> (origine endogena, poichè devono farsi strada attraverso la corteccia per emergere).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Vie di Trasporto dell'Acqua: Apoplasto vs Simplasto 💧</div>
                <div class="recall-hidden">
                    L'acqua e i nutrienti assorbiti dai peli radicali viaggiano attraverso la corteccia seguendo due percorsi:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/caspary_img2_p56.jpg" alt="Schema delle vie di trasporto radicale" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Schema delle vie di trasporto radicale', 'Fig. da Dispensa pag. 56')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 56</strong> - Via apoplastica, simplastica e transmembrana bloccate dalla banda di Caspary</div>
                    </div>
                    <ul>
                        <li><strong>Via Apoplastica:</strong> L'acqua si muove passivamente all'esterno dei plasmalemmi, fluendo lungo le pareti cellulari e gli spazi intercellulari. È un percorso non selettivo a bassa resistenza.</li>
                        <li><strong>Via Simplastica:</strong> L'acqua entra nel citosol di una cellula e si sposta alle cellule adiacenti attraversando i <strong>plasmodesmi</strong> (ponti citoplasmatici intercellulari). È un percorso controllato e selettivo.</li>
                    </ul>
                    <strong>Il Blocco dell'Endoderma:</strong> Giunta all'endoderma, la via apoplastica è completamente interrotta dalla banda di Caspary impermeabile. Tutta l'acqua e gli ioni minerali sono obbligati ad attraversare il plasmalemma delle cellule endodermiche (via simplastica). Questo consente alla radice di filtrare selettivamente i nutrienti tramite trasportatori attivi di membrana ed escludere sostanze tossiche prima di immetterle nei vasi xilematici diretti al fusto.
                </div>
            </div>
`
  },
  "foglia": {
    "title": "🍃 La Foglia: Mesofillo, Stomi & Adattamenti",
    "group": "anatomia_vegetale",
    "content": `
            <p>La foglia è l'organo fotosintetico per eccellenza, progettato per massimizzare l'intercettazione della luce e ottimizzare gli scambi gassosi riducendo la perdita d'acqua:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/foglia_anatomia_img1_p104.jpg" alt="Anatomia fogliare bifacciale" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Anatomia fogliare bifacciale', 'Immagine da Dispensa Biologia a pag. 104')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 104</strong> - Sezione trasversale di foglia bifacciale (dorsoventrale)</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Foglia Bifacciale (Dorsoventrale) 🍃</div>
                <div class="recall-hidden">
                    Tipica delle Dicotiledoni. Presenta una netta asimmetria tra la pagina superiore (esposta al sole) e quella inferiore:
                    <ul>
                        <li><strong>Epidermide Superiore:</strong> Coperta da una cuticola spessa, priva di stomi per limitare l'evaporazione diretta.</li>
                        <li><strong>Mesofillo (tessuto parenchimatico interno):</strong> Si divide in:
                            <ul>
                                <li><i>Parenchima a Palizzata (clorenchima superiore):</i> Cellule cilindriche allungate perpendicolarmente alla superficie, strettamente appressate con pochi spazi vuoti, ricchissime di cloroplasti. Svolge la maggior parte della fotosintesi.</li>
                                <li><i>Parenchima Lacunoso (o spugnoso inferiore):</i> Cellule di forma irregolare con ampi spazi intercellulari (lacune). Agevola la diffusione dei gas ($CO_2, O_2, H_2O$) provenienti dagli stomi.</li>
                            </ul>
                        </li>
                        <li><strong>Epidermide Inferiore:</strong> Presenta una cuticola più sottile e ospita la quasi totalità degli stomi (foglia <strong>ipostomatica</strong>).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Foglia Equifacciale (Isolaterale) 🌾</div>
                <div class="recall-hidden">
                    Tipica delle Monocotiledoni (es. graminee) con portamento eretto delle foglie. La luce colpisce in egual misura entrambe le facce.
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/foglia_anatomia_img2_p104.png" alt="Foglia isofacciale" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Foglia isofacciale', 'Fig. da Dispensa pag. 104')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 104</strong> - Schema di foglia equifacciale con stomi su entrambe le epidermidi</div>
                    </div>
                    La foglia è <strong>anfistomatica</strong> (stomi distribuiti su entrambe le epidermidi). Il mesofillo presenta parenchima a palizzata sotto entrambe le epidermidi, mentre il parenchima lacunoso si colloca nella zona centrale. Le venature (fasci vascolari paralleli) sono regolarmente distribuite.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Anatomia dello Stoma & Camera Sottostomatica 👁️</div>
                <div class="recall-hidden">
                    Lo stoma è l'unità epidermica regolabile per gli scambi gassosi:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/foglia_anatomia_img3_p104.jpg" alt="Dettaglio dello stoma" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Dettaglio dello stoma', 'Fig. da Dispensa pag. 104')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 104</strong> - Sezione trasversale di apparato stomatico e camera sottostomatica</div>
                    </div>
                    Al di sotto dello stoma si trova la <strong>camera sottostomatica</strong>, un'ampia cavità intercellulare del clorenchima. Questa camera è satura di vapore acqueo e funge da serbatoio di scambio: favorisce l'evaporazione interna dell'acqua (traspirazione, che genera la forza di aspirazione della linfa) e l'accumulo di $CO_2$ atmosferica da destinare alla fotosintesi del clorenchima.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Adattamenti Fogliari Xerofili: Foglia Centrica 🌵</div>
                <div class="recall-hidden">
                    Le xerofite (piante adattate ad ambienti aridi) sviluppano forti modificazioni anatomiche per ridurre la traspirazione:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/foglia_anatomia_img4_p104.jpg" alt="Cripte stomatiche xerofile" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Cripte stomatiche xerofile', 'Fig. da Dispensa pag. 104')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 104</strong> - Stomi infossati in cripte protette da tricomi per limitare il vento e la traspirazione</div>
                    </div>
                    <ul>
                        <li><strong>Stomi in cripta:</strong> Gli stomi non sono a livello dell'epidermide, ma infossati in cavità protette (cripte stomatiche) rivestite da peli epidermici. I peli creano un microclima umido e fermo, riducendo drasticamente il gradiente di umidità e quindi la traspirazione (es. Oleandro).</li>
                        <li><strong>Foglia Centrica (aghiforme, es. aghi di Pino):</strong> Adatta a tollerare il gelo e l'arido. Ha una superficie minima esposta. Presenta un'epidermide spessa, cutina abbondante, stomi infossati e un <strong>endoderma interno</strong> con banda di Caspary che circonda i due fasci vascolari centrali (stele), sigillando ermeticamente le soluzioni xilematiche all'interno della foglia.</li>
                    </ul>
                </div>
            </div>
`
  },
  "simbiosi": {
    "title": "🍄 Simbiosi Radicali: Micorrize & Azotofissazione",
    "group": "anatomia_vegetale",
    "content": `
            <p>Le radici hanno evoluto straordinarie associazioni simbiotiche mutualistiche con funghi e batteri per superare i limiti nutrizionali del suolo:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Le Micorrize (Associazione Radice-Fungo) 🍄</div>
                <div class="recall-hidden">
                    Simbiosi mutualistica che coinvolge oltre il $90\\%$ delle piante vascolari terrestri. Il fungo estende una fitta rete di ife nel suolo circostante, aumentando la superficie di assorbimento della radice fino a 100 volte. Il fungo assorbe acqua e nutrienti minerali (in particolare il <strong>Fosforo</strong>, altamente immobile nel suolo) e li cede alla pianta in cambio di zuccheri fotosintetici.
                    <br>Si dividono in due gruppi principali:
                    <ul>
                        <li><strong>Ectomicorrize:</strong> Le ife fungine avvolgono l'apice radicale formando un mantello esterno denso. Penetrano tra le cellule del parenchima corticale della radice senza entrare nelle cellule, formando una rete di scambio intercellulare detta <strong>rete di Hartig</strong>. Tipiche di alberi forestali (Pinaceae, Fagaceae).
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/caspary_img3_p56.jpg" alt="Ectomicorrize e rete di Hartig" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Ectomicorrize e rete di Hartig', 'Fig. da Dispensa pag. 56')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 56</strong> - Struttura istologica delle ectomicorrize con rete di Hartig intercellulare</div>
                            </div>
                        </li>
                        <li><strong>Endomicorrize (Micorrize Vescicolo-Arbuscolari o VAM):</strong> Le ife del fungo penetrano all'interno delle cellule della corteccia radicale. Attraversano la parete cellulare ma non rompono il plasmalemma, che si invagina attorno alle strutture fungine. Formano <strong>arbuscoli</strong> ramificati all'interno della cellula (sito di intenso scambio nutrizionale) e <strong>vescicole</strong> (strutture lipidiche di accumulo). Sono diffuse nella maggior parte delle colture agrarie erbacee.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Azotofissazione Simbiotica (Leguminose & Rhizobium) 🌾</div>
                <div class="recall-hidden">
                    Simbiosi mutualistica ad altissimo valore ecologico ed agronomico tra piante della famiglia delle <strong>Fabaceae (Leguminose)</strong> e batteri del genere <strong>Rhizobium</strong>. Consente la conversione dell'azoto atmosferico gassoso ($N_2$, inutilizzabile dalle piante) in ammonio ($NH_4^+$).
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/caspary_img4_p56.png" alt="Simbiosi radicale e noduli" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Simbiosi radicale e noduli', 'Fig. da Dispensa pag. 56')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 56</strong> - Formazione dei noduli radicali azotofissatori indotti da Rhizobium</div>
                    </div>
                    <ul>
                        <li><strong>Infezione radicale:</strong> Le radici delle leguminose secernono composti fenolici (flavonoidi) nel suolo per attirare i batteri. I batteri rispondono secernendo fattori Nod che inducono il ripiegamento del pelo radicale. I batteri penetrano nel pelo formando un tubulo di infezione cellulare.</li>
                        <li><strong>Formazione del Nodulo:</strong> Il tubulo si estende nella corteccia radicale e stimola le cellule corticali a riprendere l'attività meristematica divisionale pericline, originando un organo specializzato visibile esternamente: il <strong>nodulo radicale</strong>.</li>
                        <li><strong>I Batteroidi & Legemoglobina:</strong> All'interno del nodulo, i batteri si trasformano in <strong>batteroidi</strong>, forme vegetative quiescenti avvolte da una membrana della cellula ospite (simbiosoma). L'enzima batterico <strong>nitrogenasi</strong> catalizza la riduzione di $N_2$, ma è disattivato dalla presenza di ossigeno molecolare libero. Per mantenere protetto l'enzima garantendo al contempo l'ossigeno per la respirazione aerobica del batterio, la cellula vegetale sintetizza la <strong>legemoglobina</strong>, una proteina contenente ferro (che dà al nodulo attivo un colore rosa-rossastro all'interno) che lega reversibilmente l'ossigeno libero regolandone rigorosamente la concentrazione a livelli minimi nel nodulo.</li>
                    </ul>
                </div>
            </div>
`
  },
  "cicli_biologici": {
    "title": "🔄 Alternanza di Generazioni & Cicli Ontogenetici",
    "group": "fisiologia_vegetale",
    "content": `
            <p>I cicli vitali degli organismi vegetali si caratterizzano per la sequenza ordinata con cui si alternano la meiosi (fase nucleare aploide) e la gamia (fase nucleare diploide):</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/ciclo_aplodiplonte_img1_p133.jpg" alt="Ciclo aplodiplonte eteromorfico" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Ciclo aplodiplonte eteromorfico', 'Immagine da Dispensa Biologia a pag. 133')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 133</strong> - Alternanza di generazioni aplodiplonte nelle piante terrestri</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Il Ciclo Aplodiplonte delle Piante Terrestri 🔄</div>
                <div class="recall-hidden">
                    A differenza degli animali (ciclo diplonte, meiosi gametica), tutte le piante terrestri (Embriofite) presentano un ciclo ontogenetico <strong>aplodiplonte</strong> caratterizzato dall'<strong>alternanza di generazioni eteromorfiche</strong>. Nel ciclo si alternano due organismi pluricellulari distinti:
                    <ul>
                        <li><strong>Il Gametofito (generazione aploide, $1n$):</strong> Si sviluppa per mitosi a partire da una spora aploide. Produce per mitosi i gameti (maschili nei cloroplasti/anteridi e femminili negli archegoni).</li>
                        <li><strong>Lo Sporofito (generazione diploide, $2n$):</strong> Si sviluppa per mitosi a partire dallo zigote diploide (prodotto dalla fusione dei gameti o gamia). A maturità, alcune cellule dello sporofito (cellule madri delle spore) compiono la <strong>meiosi sporica</strong> per produrre spore aploidi ($1n$), riavviando il ciclo.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Cicli a Confronto: Briofite & Pteridofite 🌿</div>
                <div class="recall-hidden">
                    L'importanza relativa delle due generazioni cambia lungo la filogenesi delle piante:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/ciclo_aplodiplonte_img2_p133.jpg" alt="Ciclo biologico delle Briofite" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Ciclo biologico delle Briofite', 'Fig. da Dispensa pag. 133')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 133</strong> - Ciclo delle Briofite: dominanza del gametofito verde</div>
                    </div>
                    <ul>
                        <li><strong>Briofite (es. Muschi):</strong> Il <strong>gametofito è la generazione dominante</strong>, verde, fotosintetica ed indipendente. Lo sporofito è piccolo, transitorio, privo di clorofilla e cresce parassitando nutrizionalmente il gametofito sottostante. Richiedono acqua liquida esterna per consentire agli spermatozoi flagellati di nuotare fino all'oocita nell'archegono.</li>
                        <li><strong>Pteridofite (es. Felci):</strong> Lo <strong>sporofito è la generazione dominante</strong> ed indipendente (la pianta di felce visibile).
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/ciclo_aplodiplonte_img3_p133.jpg" alt="Ciclo biologico delle Pteridofite" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Ciclo biologico delle Pteridofite', 'Fig. da Dispensa pag. 133')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 133</strong> - Ciclo delle Pteridofite: sporofito dominante e protallo indipendente</div>
                            </div>
                            Il gametofito (chiamato <strong>protallo</strong>) è una piccola lamina verde fotosintetica di pochi millimetri, separata e indipendente dallo sporofito. Anch'esse richiedono acqua liquida per la fecondazione.
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Trend Evolutivo: Riduzione del Gametofito nelle Spermatofite 🌲</div>
                <div class="recall-hidden">
                    Nelle piante con seme (Spermatofite: Gimnosperme ed Angiosperme), lo sporofito è completamente dominante e protegge il gametofito all'interno dei propri tessuti:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/ciclo_aplodiplonte_img4_p133.jpg" alt="Trend evolutivo di riduzione" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Trend evolutivo di riduzione', 'Fig. da Dispensa pag. 133')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 133</strong> - Trend filogenetico di drastica riduzione del gametofito</div>
                    </div>
                    Il gametofito si riduce a una struttura microscopica non più verde ed interamente dipendente dallo sporofito:
                    <ul>
                        <li>Il gametofito maschile è il <strong>granulo pollinico</strong> (composto da appena 2-3 cellule).</li>
                        <li>Il gametofito femminile si sviluppa all'interno dell'ovulo sullo sporofito (sacco embrionale nelle angiosperme, formato da 7 cellule).</li>
                    </ul>
                    Questa evoluzione ha svincolato la riproduzione sessuata dalla presenza di acqua liquida esterna per la fecondazione.
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/ciclo_aplodiplonte_img5_p133.jpg" alt="Confronto cicli aplodiplonti" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Confronto cicli aplodiplonti', 'Fig. da Dispensa pag. 133')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 133</strong> - Sintesi comparativa dei cicli vitali delle piante terrestri</div>
                    </div>
                </div>
            </div>
`
  },
  "gimnosperme_reprod": {
    "title": "🌲 Riproduzione delle Gimnosperme & Il Seme",
    "group": "fisiologia_vegetale",
    "content": `
            <p>La comparsa del seme e del polline nelle Gimnosperme rappresenta una delle più importanti tappe evolutive della colonizzazione della terraferma:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/seme_img1_p143.jpg" alt="Struttura del seme delle Gimnosperme" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Struttura del Seme', 'Fig. da Dispensa pag. 143')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 143</strong> - Sezione del seme nudo di conifera: tre generazioni sovrapposte</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Coni Maschili e Femminili delle Conifere 🌲</div>
                <div class="recall-hidden">
                    Le conifere sono piante eterosporiche (producono spore maschili e femminili distinte):
                    <ul>
                        <li><strong>Coni Maschili (microsporofilli):</strong> Piccole strutture coniche. Le sacche polliniche (microsporangi) compiono meiosi producendo microspore che si dividono mitoticamente per formare il <strong>granulo pollinico</strong>. Il polline delle Pinaceae possiede due sacche aeree (ali) che ne facilitano il trasporto tramite il vento.</li>
                        <li><strong>Coni Femminili (Macrosporofilli o Pigne):</strong> Portano squame ovulifere, ciascuna con due ovuli. L'ovulo è composto da un tegumento sporofitico ($2n$) che racchiude il macrosporangio (nucella). Una sola cellula madre compie meiosi producendo 4 macrospore haploidi (3 degenerano). La macrospora superstite si divide per mitosi formando il gametofito femminile, chiamato <strong>endosperma primario (aploide, $1n$)</strong>, che reca alla sua estremità gli archegoni contenenti l'oocita (cellula uovo).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Impollinazione Anemofila & Sifonogamia 🌲</div>
                <div class="recall-hidden">
                    L'impollinazione è esclusivamente <strong>anemofila</strong> (operata dal vento). Il granulo pollinico viene catturato da una goccia di liquido secreto dal micropilo dell'ovulo. Al riassorbimento della goccia, il polline entra a contatto con la nucella.
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/ciclo_dettaglio_img1_p135.jpg" alt="Fecondazione nelle Gimnosperme" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Fecondazione nelle Gimnosperme', 'Fig. da Dispensa pag. 135')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 135</strong> - Schema del ciclo riproduttivo: dall'impollinazione alla fecondazione</div>
                    </div>
                    Il granulo pollinico germina emettendo un <strong>tubetto pollinico (sifonogamia)</strong>, che digerisce lentamente la nucella per raggiungere l'archegono. La cellula generativa del polline si divide producendo due spermatozoi (privi di flagelli nelle conifere). Uno feconda la cellula uovo originando lo zigote ($2n$), l'altro si dissolve.
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/ciclo_dettaglio_img2_p135.jpg" alt="Dettaglio della sifonogamia" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Dettaglio della sifonogamia', 'Fig. da Dispensa pag. 135')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 135</strong> - Particolare del tubetto pollinico che penetra nei tessuti dell'archegono femmina</div>
                    </div>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Anatomia del Seme Maturo: Tre Generazioni Sovrapposte 🌲</div>
                <div class="recall-hidden">
                    A seguito della fecondazione, l'ovulo si trasforma in seme. Il seme delle Gimnosperme è "nudo", non racchiuso all'interno di un frutto. Analizzando la sezione del seme maturo, si distinguono tre tessuti sovrapposti che testimoniano tre generazioni biologiche:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/seme_img4_p143.jpg" alt="Anatomia del seme maturo" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Anatomia del Seme Maturo', 'Fig. da Dispensa pag. 143')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 143</strong> - Particolare dei tessuti di riserva e dell'embrione del seme di Pinophyta</div>
                    </div>
                    <ol>
                        <li><strong>Tegumento del Seme ($2n$):</strong> Tessuto diploide protettivo esterno, derivato dal tegumento dell'ovulo appartenente allo <strong>sporofito madre</strong>.</li>
                        <li><strong>Endosperma Primario ($1n$):</strong> Tessuto aploide di riserva nutritiva, derivato direttamente dal corpo del <strong>gametofito femminile</strong>.</li>
                        <li><strong>L'Embrione ($2n$):</strong> La nuova piantina (<strong>nuovo sporofito figlio</strong>), dotata di una radichetta, un ipocotile ed una corona di cotiledoni multipli (foglie embrionali).</li>
                    </ol>
                </div>
            </div>
`
  },
  "angiosperme_fiore": {
    "title": "🌸 Struttura del Fiore, Micro e Macrosporogenesi",
    "group": "fisiologia_vegetale",
    "content": `
            <p>Il fiore delle Angiosperme è una struttura riproduttiva altamente specializzata, evolutasi in stretta co-evoluzione con gli insetti impollinatori:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Anatomia del Fiore: Verticilli Fiorali 🌸</div>
                <div class="recall-hidden">
                    Un fiore completo è composto da 4 cerchi concentrici di foglie modificate (verticilli) inseriti sul ricettacolo fiorale:
                    <ul>
                        <li><strong>Calice (Sepali, verdi e protettivi) & Corolla (Petali, colorati per attrazione):</strong> Costituiscono il Perianzio.</li>
                        <li><strong>Androceo (Stami, parte maschile):</strong> Formati da un filamento e un'<strong>antera</strong>. L'antera contiene solitamente 4 sacche polliniche (microsporangi) deputate alla produzione del polline.</li>
                        <li><strong>Gineceo (Pistillo, parte femminile):</strong> Formato da:
                            <ul>
                                <li><i>Ovario:</i> Base rigonfia cava contenente uno o più ovuli protetti.</li>
                                <li><i>Stilo:</i> Canale allungato attraversato dal tubetto pollinico.</li>
                                <li><i>Stimma:</i> Sommità appiccicosa deputata alla cattura del granulo pollinico.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Microsporogenesi & Microgametogenesi (Gametofito Maschile) 🧬</div>
                <div class="recall-hidden">
                    Nelle sacche polliniche dell'antera, le cellule madri delle microspore ($2n$) compiono la meiosi producendo tetradi di microspore haploidi ($1n$).
                    <br>Ciascuna microspora si stacca e compie la microgametogenesi (una divisione mitotica asimmetrica), formando il <strong>granulo pollinico</strong> maturo costituito da 2 cellule protette da una parete esterna dura impregnata di <strong>sporopollenina</strong> (la exina):
                    <ul>
                        <li><strong>Cellula Vegetativa (più grande):</strong> Deputata alla formazione del tubetto pollinico.</li>
                        <li><strong>Cellula Generativa (più piccola):</strong> Sospesa nel citoplasma della vegetativa. Nelle angiosperme si divide per mitosi producendo <strong>due spermatozoi</strong> (sperm cells o nuclei spermatici, privi di flagelli).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Megasporogenesi & Megagametogenesi (Gametofito Femminile) 🧬</div>
                <div class="recall-hidden">
                    Nell'ovulo, la cellula madre delle macrospore ($2n$) compie meiosi producendo 4 macrospore haploidi ($1n$) disposte in fila. Le tre macrospore dirette verso il micropilo degenerano, mentre la macrospora funzionale (dal lato calazale) sopravvive e compie la megagametogenesi.
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/ciclo_dettaglio_img3_p135.jpg" alt="Sviluppo del Sacco Embrionale" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Sviluppo del Sacco Embrionale', 'Fig. da Dispensa pag. 135')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 135</strong> - Tre mitosi consecutive del nucleo macrosporale e formazione delle 7 cellule</div>
                    </div>
                    La macrospora si accresce e compie 3 divisioni mitotiche nucleari consecutive (senza citocinesi immediata), producendo una cellula a 8 nuclei. Successivamente si formano le pareti cellulari, organizzando il gametofito femminile maturo, detto <strong>sacco embrionale</strong>, composto da <strong>8 nuclei distribuiti in 7 cellule</strong>:
                    <ul>
                        <li><strong>1 Cellula Uovo (oocita, $1n$)</strong>, affiancata da <strong>2 Sinergidi</strong> sul lato del micropilo (secernono segnali chimici per guidare il tubetto pollinico).</li>
                        <li><strong>3 Cellule Antipodali ($1n$)</strong> sul lato opposto (calazale), con funzione trofica di supporto.</li>
                        <li><strong>1 Cellula Centrale gigante</strong>, contenente i <strong>2 nuclei polari</strong> ($1n + 1n$).</li>
                    </ul>
                </div>
            </div>
`
  },
  "doppia_fecondazione": {
    "title": "🍳 Doppia Fecondazione, Seme & Sviluppo Embrionale",
    "group": "fisiologia_vegetale",
    "content": `
            <p>La doppia fecondazione è un processo evolutivo unico ed esclusivo delle Angiosperme, che ottimizza le risorse energetiche sintetizzando i tessuti di riserva solo ad avvenuta fecondazione dello zigote:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Il Processo di Doppia Fecondazione 🍳</div>
                <div class="recall-hidden">
                    Il granulo pollinico atterra sullo stimma e germina emettendo il tubetto pollinico. Questo cresce lungo lo stilo penetrando nell'ovulo attraverso il micropilo, guidato da segnali chemotropici delle sinergidi. Giunto a destinazione, il tubetto rilascia all'interno del sacco embrionale i <strong>due spermatozoi ($1n$)</strong>:
                    <ol>
                        <li><strong>Prima Fecondazione:</strong> Uno spermatozoo ($1n$) si fonde con la cellula uovo ($1n$), originando lo <strong>zigote diploide ($2n$)</strong>, che si svilupperà per mitosi nell'embrione.</li>
                        <li><strong>Seconda Fecondazione:</strong> L'altro spermatozoo ($1n$) si fonde contemporaneamente con la cellula centrale contenente i due nuclei polari ($1n+1n$), originando un nucleo triploide ($3n$). Questo nucleo si divide attivamente formando l'<strong>endosperma secondario (triploide, $3n$)</strong>.</li>
                    </ol>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Evoluzione del Seme & Cotiledoni 🌰</div>
                <div class="recall-hidden">
                    A seguito della doppia fecondazione, l'ovulo si trasforma in seme:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/seme_img2_p143.jpg" alt="Seme Monocotiledoni vs Dicotiledoni" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Seme Monocotiledoni vs Dicotiledoni', 'Fig. da Dispensa pag. 143')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 143</strong> - Confronto tra seme di Dicotiledone (fagiolo) e Monocotiledone (mais)</div>
                    </div>
                    L'endosperma secondario ($3n$) accumula sostanze nutritive (amido, proteine, lipidi) per la futura plantula. Nelle dicotiledoni le riserve vengono assorbite dai due <strong>cotiledoni</strong> carnosi durante lo sviluppo del seme; nelle monocotiledoni l'endosperma rimane separato dall'unico cotiledone (scutello).
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Germinazione Epigea vs Ipogea 🌱</div>
                <div class="recall-hidden">
                    Al risveglio dalla dormienza del seme, la germinazione può avvenire secondo due modalità:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/seme_img3_p143.jpg" alt="Germinazione Epigea ed Ipogea" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Germinazione Epigea ed Ipogea', 'Fig. da Dispensa pag. 143')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 143</strong> - Sviluppo embrionale: ipocotile allungato (epigea) vs epicotile allungato (ipogea)</div>
                    </div>
                    <ul>
                        <li><strong>Germinazione Epigea:</strong> L'ipocotile (asse embrionale sotto i cotiledoni) si allunga attivamente piegandosi ad uncino. Emerge dal suolo trascinando i cotiledoni e l'epicotile al di sopra del terreno (es. fagiolo). I cotiledoni diventano temporaneamente verdi e fotosintetici prima di cadere.</li>
                        <li><strong>Germinazione Ipogea:</strong> L'ipocotile non si allunga; a svilupparsi è l'epicotile (asse sopra i cotiledoni). I cotiledoni e il guscio del seme rimangono sotterrati nel suolo (es. pisello, mais).</li>
                    </ul>
                </div>
            </div>
`
  },
  "frutti_dispersione": {
    "title": "🍒 Il Frutto: Tipologie, Anatomia & Dispersione",
    "group": "fisiologia_vegetale",
    "content": `
            <p>Il frutto (esclusivo delle Angiosperme) deriva dallo sviluppo della parete dell'ovario indotto da stimoli ormonali post-fecondazione, proteggendo il seme e assistendone la dispersione:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/frutto_img1_p163.jpg" alt="Struttura del pericarpo" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Struttura del pericarpo', 'Immagine da Dispensa Biologia a pag. 163')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 163</strong> - Anatomia del frutto (pesca): pericarpo diviso in tre strati</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Anatomia del Pericarpo: Esocarpo, Mesocarpo & Endocarpo 🍑</div>
                <div class="recall-hidden">
                    La parete del frutto è detta <strong>pericarpo</strong> e deriva dalle modificazioni della parete dell'ovario. Si suddivide in tre strati istologici distinti:
                    <ol>
                        <li><strong>Esocarpo:</strong> Lo strato più esterno (la buccia), con funzione protettiva ed epidermica. Può essere provvisto di cuticole spesse o peli.</li>
                        <li><strong>Mesocarpo:</strong> Lo strato intermedio. Nei frutti carnosi diventa molto spesso, vacuolato e ricco di acqua, zuccheri e acidi organici (la polpa edule). Nei frutti secchi è sottile e fibroso.</li>
                        <li><strong>Endocarpo:</strong> Lo strato più interno che circonda il seme. Può rimanere membranoso o lignificare pesantemente diventando legnoso e durissimo (nocciolo, es. pesca, albicocca).</li>
                    </ol>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Classificazione dei Frutti Secchi: Deiscenti & Indeiscenti 🥜</div>
                <div class="recall-hidden">
                    I frutti secchi hanno un pericarpo cartaceo, legnoso o coriaceo a maturità, contenente pochissima acqua. Si dividono in:
                    <ul>
                        <li><strong>Deiscenti (si aprono spontaneamente a maturità per rilasciare i semi):</strong>
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/frutto_img2_p163.jpg" alt="Frutti secchi deiscenti" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Frutti secchi deiscenti', 'Fig. da Dispensa pag. 163')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 163</strong> - Legume, siliqua, capsula e follicolo: meccanismi di apertura</div>
                            </div>
                            <ul>
                                <li><i>Legume (o baccello):</i> Tipico delle leguminose. Si apre lungo due linee di sutura opposte (es. fagiolo).</li>
                                <li><i>Siliqua:</i> Tipico delle Brassicaceae. Si apre in due valve separate da un setto centrale membranoso persistente (replo).</li>
                                <li><i>Capsula:</i> Frutto derivato da ovario pluricarpellare. Si apre per fessure, pori o coperchi (es. papavero).</li>
                                <li><i>Follicolo:</i> Si apre lungo una sola linea di sutura (es. oleandro).</li>
                            </ul>
                        </li>
                        <li><strong>Indeiscenti (non si aprono, il frutto racchiude il seme fino alla germinazione):</strong>
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/frutto_img3_p163.jpg" alt="Frutti secchi indeiscenti" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Frutti secchi indeiscenti', 'Fig. da Dispensa pag. 163')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 163</strong> - Achenio, cariosside, samara e noce: frutti a singolo seme chiuso</div>
                            </div>
                            <ul>
                                <li><i>Achenio:</i> Monoseminato, il pericarpo è coriaceo e non aderisce al tegumento del seme interno (es. girasole).</li>
                                <li><i>Cariosside:</i> Tipico dei cereali (Poaceae). Il pericarpo è completamente saldato e fuso con il tegumento del seme (formando un unico corpo, la "crusca" esterna).</li>
                                <li><i>Samara:</i> Achenio provvisto di un'espansione alare membranosa per il volo (es. acero).</li>
                                <li><i>Noce:</i> Pericarpo legnoso durissimo derivato da ovario pluricarpellare.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Frutti Carnosi: Drupe, Bacche & Falsi Frutti 🍒</div>
                <div class="recall-hidden">
                    I frutti carnosi presentano un mesocarpo ricco di tessuti parenchimatici succulenti:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/frutto_img4_p163.png" alt="Sezione di frutti carnosi" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Sezione di frutti carnosi', 'Fig. da Dispensa pag. 163')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 163</strong> - Sezione anatomica di drupa (nocciolo duro) e bacca (semi immersi)</div>
                    </div>
                    <ul>
                        <li><strong>Drupa:</strong> Caratterizzata da endocarpo legnoso (nocciolo) contenente un solo seme, mesocarpo carnoso ed esocarpo sottile (es. pesca, ciliegia, oliva, albicocca).</li>
                        <li><strong>Bacca:</strong> Mesocarpo ed endocarpo completamente carnosi/succulenti, con molti semi immersi direttamente nella polpa (es. pomodoro, uva, mirtillo). Varianti sono l'<i>esperidio</i> (agrume) e il <i>peponide</i> (zucca, melone).</li>
                        <li><strong>Falsi Frutti (e Infruttescenze):</strong> Frutti in cui alla formazione partecipano tessuti diversi dall'ovario:
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/frutto_img5_p163.jpg" alt="Falsi frutti ed infruttescenze" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Falsi frutti ed infruttescenze', 'Fig. da Dispensa pag. 163')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 163</strong> - Pomo della mela, siconio del fico e fragola: strutture fiorali associate</div>
                            </div>
                            <ul>
                                <li><i>Pomo:</i> Tipico di mela e pera. Il vero frutto è il torsolo interno (derivato dall'ovario), la polpa edule esterna deriva dall'accrescimento del ricettacolo fiorale.</li>
                                <li><i>Fragola:</i> Falso frutto composto da un ricettacolo fiorale ingrossato e carnoso rosso, sulla cui superficie sono inseriti i veri frutti, che sono piccoli acheni (i "puntini" gialli).</li>
                                <li><i>Siconio:</i> Infruttescenza del fico, costituita da un ricettacolo concavo carnoso che racchiude centinaia di piccoli acheni derivati da fiori minuscoli.</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Strategie di Dispersione dei Semi (Disseminazione) ✈️</div>
                <div class="recall-hidden">
                    Le piante hanno sviluppato diverse morfologie per allontanare i semi dalla pianta madre ed evitare competizione:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/frutto_img6_p163.jpg" alt="Morfologie di dispersione dei frutti" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Morfologie di dispersione dei frutti', 'Fig. da Dispensa pag. 163')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 163</strong> - Strutture alate, ganci ed esche edule per la dispersione del seme</div>
                    </div>
                    <ul>
                        <li><strong>Anemocoria (vento):</strong> Frutti/semi leggeri provvisti di ali (samare di acero) o pappi piumosi (soffione del tarassaco).</li>
                        <li><strong>Zoocoria (animali):</strong> Si divide in:
                            <ul>
                                <li><i>Epizoocoria:</i> Frutti provvisti di uncini o peli che si attaccano al pelo degli animali (es. <i>Bardana</i>).</li>
                                <li><i>Endozoocoria:</i> Frutti carnosi appetibili colorati (es. ciliegie). Gli animali li mangiano, digeriscono la polpa ed evacuano il seme intatto (protetto dall'endocarpo) lontano, concimandolo.</li>
                            </ul>
                        </li>
                        <li><strong>Idrocoria (acqua):</strong> Frutti galleggianti ricchi di aria nel mesofillo fibroso (es. noce di cocco).</li>
                        <li><strong>Autocoria (meccanica):</strong> Meccanismi di espulsione violenta indotti da tensioni di turgore (es. cocomero asinino) o torsioni paretali all'essiccamento (es. ginestra).</li>
                    </ul>
                </div>
            </div>
`
  },
  "fotosintesi_rubisco": {
    "title": "⚡ Fotosintesi, Cloroplasti & Enzima Rubisco",
    "group": "fisiologia_vegetale",
    "content": `
            <p>La fotosintesi trasforma l'energia luminosa in energia chimica. Questo processo avviene nei cloroplasti e coinvolge una complessa cooperazione nucleo-plastidiale:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/cloroplasto_img2_p23.jpg" alt="Struttura fine dei tilacoidi" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Struttura fine dei tilacoidi', 'Fig. da Dispensa pag. 23')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 23</strong> - Membrane tilacoidali granali e stromatiche e flussi di elettroni</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Struttura del Cloroplasto: Stroma & Tilacoidi 🍃</div>
                <div class="recall-hidden">
                    Il cloroplasto è delimitato da due membrane esterne. Lo spazio interno è lo <strong>stroma</strong> (soluzione idrofila contenente l'enzima Rubisco, DNA circolare e ribosomi 70S).
                    <br>All'interno dello stroma è sospeso un sistema continuo di membrane ripiegate in sacculi appiattiti detti <strong>tilacoidi</strong>. I tilacoidi si dividono in:
                    <ul>
                        <li><i>Tilacoidi granali:</i> Impilati a formare dischi detti grani (granum). Contengono prevalentemente il fotosistema II (PSII) e i complessi antenna cattura-luce.</li>
                        <li><i>Tilacoidi stromatici (o intergranali):</i> Singoli tubuli di collegamento non impilati. Contengono prevalentemente il fotosistema I (PSI) e l'ATP sintasi.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. La Fase Luminosa: Fotolisi dell'H₂O & Produzione di ATP/NADPH ⚡</div>
                <div class="recall-hidden">
                    Avviene sulle membrane tilacoidali e richiede luce solare:
                    <ol>
                        <li>Il fotosistema II (PSII) assorbe fotoni eccitando elettroni. Per rimpiazzare gli elettroni persi, il complesso di evoluzione dell'ossigeno del PSII compie la <strong>fotolisi dell'H₂O</strong> (scissione dell'acqua):
$$H_2O \rightarrow 2H^+ + 2e^- + \frac{1}{2}O_2$$
L'ossigeno molecolare ($O_2$) viene liberato nell'atmosfera come sottoprodotto.</li>
                        <li>Gli elettroni passano lungo una catena di trasporto (plastochinone, complesso citocromo b6f, plastocianina). Questo passaggio pompa protoni ($H^+$) dallo stroma al lume tilacoidale, creando un forte gradiente elettrochimico protonico.</li>
                        <li>Il flusso di protoni che ritorna dal lume allo stroma attraversa il canale dell'<strong>ATP sintasi</strong>, sintetizzando ATP da ADP + Pi (fotofosforilazione).</li>
                        <li>Il fotosistema I (PSI) assorbe altra luce, eccita gli elettroni e li cede tramite la ferredossina all'enzima ferredossina-NADP+ reduttasi, riducendo $NADP^+$ a <strong>NADPH</strong>.</li>
                    </ol>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. La Fase Oscura (Ciclo di Calvin-Benson) & L'Enzima Rubisco 🧪</div>
                <div class="recall-hidden">
                    Avviene nello stroma del cloroplasto, non richiede luce direttamente ma utilizza l'ATP e il NADPH prodotti dalla fase luminosa:
                    <ul>
                        <li><strong>Fissazione del Carbonio (Carbossilazione):</strong> L'enzima <strong>Rubisco</strong> (ribulosio-1,5-bifosfato carbossilasi/ossigenasi) unisce una molecola di $CO_2$ ad un carboidrato a 5 atomi di carbonio, il ribulosio-1,5-bifosfato (RuBP). Si forma un intermedio instabile a 6 carboni che si scinde immediatamente in due molecole di 3-fosfoglicerato (3-PGA, composto a 3 atomi di carbonio, da cui il nome di fotosintesi C3).</li>
                        <li><strong>Riduzione:</strong> Il 3-PGA viene ridotto a gliceraldeide-3-fosfato (G3P) consumando ATP e NADPH. La G3P è utilizzata per sintetizzare glucosio e saccarosio nel citoplasma.</li>
                        <li><strong>Rigenerazione:</strong> Parte della G3P viene riciclata per rigenerare il RuBP consumando altro ATP.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">4. Il Limite della Rubisco: La Fotorespirazione 🍂</div>
                <div class="recall-hidden">
                    La Rubisco è un enzima antico ed inefficiente. Oltre all'attività carbossilasica, presenta un'<strong>attività ossigenasica</strong> collaterale: è in grado di legare l'ossigeno ($O_2$) al posto della $CO_2$.
                    <br>Quando la temperatura è elevata e gli stomi si chiudono per conservare acqua, la concentrazione di $CO_2$ interna si azzera mentre sale quella di $O_2$. La Rubisco inizia ad ossigenare il RuBP producendo una molecola di 3-PGA ed una di 2-fosfoglicolato (composto a 2 carboni, tossico e non utilizzabile nel ciclo di Calvin).
                    <br>Per recuperare parte di questo carbonio, la cellula avvia la <strong>fotorespirazione</strong>, una complessa via metabolica di emergenza che coinvolge tre organelli cooperanti: <strong>cloroplasto $\rightarrow$ perossisoma $\rightarrow$ mitocondrio</strong>. La fotorespirazione dissipa energia (consuma ATP) e rilascia $CO_2$, recuperando circa il $75\\%$ del carbonio ma riducendo l'efficienza della fotosintesi netta del $25-50\\%$ nelle piante C3.
                </div>
            </div>
`
  },
  "c4_cam_adattamenti": {
    "title": "🌵 Adattamenti Fisiologici: Piante C3, C4 & CAM",
    "group": "fisiologia_vegetale",
    "content": `
            <p>Le piante hanno sviluppato straordinarie varianti metaboliche ed anatomiche per superare i limiti cinetici della Rubisco e colonizzare ambienti aridi:</p>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Piante C3: Caratteristiche & Limiti 🌾</div>
                <div class="recall-hidden">
                    Le piante C3 (es. frumento, riso, soia, girasole) compiono il ciclo di Calvin direttamente nel mesofillo fogliare. In condizioni di clima temperato ed acqua sufficiente sono molto efficienti. Tuttavia, in ambienti caldi e secchi, la chiusura degli stomi per evitare la disidratazione innesca la fotorespirazione, abbattendo drasticamente la resa fotosintetica a causa dell'attività ossigenasica della Rubisco.
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Piante C4: Separazione Spaziale & Anatomia di Kranz 🌽</div>
                <div class="recall-hidden">
                    Adattamento tipico di graminee di origine tropicale (es. mais, canna da zucchero, sorgo). Hanno sviluppato una <strong>separazione spaziale</strong> tra la cattura iniziale della $CO_2$ e il ciclo di Calvin, supportata dall'<strong>Anatomia coronale o di Kranz</strong>:
                    <ul>
                        <li><strong>Nelle Cellule del Mesofillo (esterne):</strong> L'anidride carbonica viene fissata dall'enzima <strong>PEP-carbossilasi</strong> (che ha un'altissima affinità per il carbonio inorganico e non reagisce in alcun modo con l' $O_2$). La $CO_2$ viene legata al fosfoenolo-piruvato (PEP) producendo ossalacetato/malato (composti a <strong>4 atomi di carbonio</strong>). Il malato diffonde attraverso i plasmodesmi verso le cellule interne della guaina.</li>
                        <li><strong>Nelle Cellule della Guaina del Fascio (interne, disposte a corona intorno ai vasi):</strong> Il malato viene decarbossilato liberando $CO_2$ ad altissima pressione direttamente attorno alla Rubisco. L'alta concentrazione locale di $CO_2$ sopprime completamente l'attività ossigenasica della Rubisco e la fotorespirazione. Il ciclo di Calvin avviene quindi in assenza di sprechi, garantendo un'altissima efficienza fotosintetica e un minore consumo idrico (gli stomi possono rimanere parzialmente chiusi).</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Piante CAM (Metabolismo Acido delle Crassulacee): Separazione Temporale 🌵</div>
                <div class="recall-hidden">
                    Adattamento estremo all'aridità tipico di succulente (cactacee, agave, ananas). Eseguono una <strong>separazione temporale</strong> dei processi fotosintetici:
                    <ul>
                        <li><strong>Di Notte (Stomi Aperti):</strong> Le temperature fresche riducono la traspirazione. Le piante aprono gli stomi assorbendo $CO_2$. La PEP-carbossilasi fissa la $CO_2$ in acido malico. L'acido malico viene accumulato attivamente all'interno del <strong>grande vacuolo</strong> centrale. Durante la notte il pH cellulare si abbassa vistosamente (acidificazione notturna).</li>
                        <li><strong>Di Giorno (Stomi Chiusi):</strong> Per evitare la traspirazione, gli stomi rimangono sigillati. L'acido malico esce dal vacuolo ed entra nel cloroplasto, dove viene decarbossilato liberando $CO_2$. La Rubisco, attivata dalla luce della fase luminosa, fissa questa $CO_2$ libera compiendo il ciclo di Calvin stomi chiusi.</li>
                    </ul>
                    Le piante CAM hanno un consumo idrico bassissimo, ma la loro crescita è lenta a causa della limitata capacità di accumulo vacuolare notturno dell'acido malico.
                </div>
            </div>
`
  },
  "fitormoni_ramificazione": {
    "title": "🧪 Fitormoni & Architettura della Ramificazione",
    "group": "fisiologia_vegetale",
    "content": `
            <p>Lo sviluppo morfologico e la crescita dei rami sono regolati finemente dall'equilibrio dei fitormoni prodotti dagli apici meristematici:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/tunica_corpus_img2_p74.jpg" alt="Tipi di ramificazione del fusto" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Tipi di ramificazione del fusto', 'Fig. da Dispensa pag. 74')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Ramificazione del fusto: modelli di crescita monopodiale e simpodiale</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. I Cinque Fitormoni Principali 🧪</div>
                <div class="recall-hidden">
                    Ormoni endogeni a basso peso molecolare che coordinano la crescita e lo sviluppo:
                    <ul>
                        <li><strong>Auxine (es. acido indolo-3-acetico, IAA):</strong> Sintetizzate nell'apice del fusto (SAM) e nelle giovani foglie. Migrano verso il basso (trasporto polare basipeto). Stimolano l'estensione paretale (distensione cellulare), differenziano i vasi xilematici e mantengono la <strong>dominanza apicale</strong> (impediscono lo sviluppo delle gemme laterali).</li>
                        <li><strong>Citochine:</strong> Sintetizzate principalmente negli apici radicali (RAM), viaggiano verso l'alto (acropetamente) nella linfa grezza. Stimolano la divisione cellulare (citocinesi), promuovono lo sviluppo delle gemme laterali (opponendosi all'auxina) e ritardano la senescenza fogliare.</li>
                        <li><strong>Gibberelline (GA):</strong> Stimolano l'allungamento degli internodi (crescita in altezza) e rompono la dormienza dei semi attivando gli enzimi idrolitici (es. amilasi) per nutrire l'embrione.</li>
                        <li><strong>Acido Abscissico (ABA):</strong> Ormone dello "stress idrico". Sintetizzato nelle radici in risposta al terreno secco. Viaggia verso le foglie dove induce la chiusura immediata degli stomi. Promuove la dormienza dei semi e delle gemme invernali, inibendo la crescita.</li>
                        <li><strong>Etilene:</strong> Ormone gassoso sintetizzato in risposta a stress e senescenza. Accelera la maturazione dei frutti (frutti climaterici, es. mela, banana) e stimola l'abscissione (caduta) di foglie e frutti.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Modelli di Ramificazione: Monopodiale vs Simpodiale 🌲</div>
                <div class="recall-hidden">
                    L'aspetto e la forma tridimensionale della chioma dipendono dalla dominanza apicale esercitata dal SAM:
                    <div class="lab-concept-image-container">
                        <img src="images/concepts/tunica_corpus_img4_p74.jpg" alt="Schemi di ramificazione simpodiale" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Schemi di ramificazione simpodiale', 'Fig. da Dispensa pag. 74')">
                        <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 74</strong> - Dettaglio dello sviluppo simpodiale monocasio e dicasio</div>
                    </div>
                    <ul>
                        <li><strong>Ramificazione Monopodiale:</strong> La gemma apicale mantiene indefinitamente la dominanza, crescendo come asse principale dritto (tronco), mentre i rami laterali rimangono subordinati e corti. Tipica di molte conifere (es. abete rosso).</li>
                        <li><strong>Ramificazione Simpodiale:</strong> La dominanza della gemma apicale cessa (per inibizione o fioritura). Le gemme laterali sottostanti si sviluppano vigorosamente sostituendo l'asse principale. Può essere <i>monocasio</i> (un solo ramo laterale prende il sopravvento, es. vite) o <i>dicasio</i> (due rami opposti crescono in egual misura, es. lilla). Tipica di molte latifoglie.</li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">3. Brachiblasti, Macroblasti & Polloni 🪵</div>
                <div class="recall-hidden">
                    All'interno della chioma si distinguono rami con diverse velocità di crescita:
                    <ul>
                        <li><strong>Macroblasti:</strong> Rami normali ad accrescimento indefinito, caratterizzati da internodi lunghi e distanziati. Costituiscono la struttura portante della chioma.</li>
                        <li><strong>Brachiblasti:</strong> Rami cortissimi ad accrescimento definito. Gli internodi sono estremamente ravvicinati (pochi millimetri) e l'apice arresta lo sviluppo precocemente. Portano i fiori e i frutti (es. Rosaceae, Ginkgo). Riconoscerli è fondamentale per una corretta potatura di fruttificazione.</li>
                        <li><strong>Polloni:</strong> Rami eccezionalmente vigorosi, lunghi e dritti che si sviluppano a partire da gemme avventizie sulle radici o alla base del colletto del fusto. Spesso la loro formazione massiccia è indotta da ferite, potature severe o senescenza della pianta madre che allentano il controllo della dominanza apicale.</li>
                    </ul>
                </div>
            </div>
`
  },
  "abscissione_stomi": {
    "title": "🍂 Fisiologia dell'Abscissione & Movimenti Stomatici",
    "group": "fisiologia_vegetale",
    "content": `
            <p>I processi fisiologici attivi di risposta ambientale che consentono la caduta stagionale degli organi e la regolazione della perdita idrica:</p>
            <div class="lab-concept-image-container">
                <img src="images/concepts/abscissione_img1_p109.jpg" alt="Zona di abscissione fogliare" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Zona di abscissione fogliare', 'Fig. da Dispensa pag. 109')">
                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 109</strong> - Zona di abscissione picciolare e strato protettivo di sughero</div>
            </div>
            
            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">1. Abscissione Fogliare (Caduta delle Foglie) 🍂</div>
                <div class="recall-hidden">
                    L'abscissione è un processo programmato (apoptosi controllata) che porta al distacco di foglie, frutti o fiori a fine stagione o in condizioni di stress idrico grave:
                    <ul>
                        <li><strong>La Zona di Abscissione:</strong> Si forma alla base del picciolo. È costituita da cellule piccole con pareti primarie sottili e ricche di pectine.
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/abscissione_img2_p109.jpg" alt="Dettaglio strato di abscissione" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Dettaglio strato di abscissione', 'Fig. da Dispensa pag. 109')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 109</strong> - Particolare al microscopio dello strato di separazione picciolare</div>
                            </div>
                        </li>
                        <li><strong>Regolazione Ormonale:</strong> Quando la foglia invecchia (senescenza), la sua produzione di <strong>auxina</strong> diminuisce drasticamente, mentre aumenta la sintesi dell'ormone gassoso <strong>etilene</strong>. Il calo di auxina rende la zona di abscissione estremamente sensibile all'etilene.</li>
                        <li><strong>Idrolisi Enzimatica:</strong> L'etilene stimola le cellule della zona di abscissione a sintetizzare e secernere enzimi idrolitici, tra cui **cellulasi e pectinasi**. Questi enzimi digeriscono la lamella mediana pectinica e le pareti primarie cellulari, indebolendo la giunzione meccanica.
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/abscissione_img3_p109.jpg" alt="Rottura della parete primaria" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Rottura della parete primaria', 'Fig. da Dispensa pag. 109')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 109</strong> - Idrolisi enzimatica pectinica e lisi meccanica controllata delle cellule</div>
                            </div>
                        </li>
                        <li><strong>Strato Protettivo di Sughero:</strong> Contemporaneamente, le cellule poste sul lato del fusto accumulano suberina e lignina (suberificazione) formando uno strato impermeabile protettivo. Al distacco della foglia, questo strato sigilla immediatamente la ferita (cicatrice fogliare), prevenendo perdite di linfa e l'ingresso di spore fungine o batteri.
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/abscissione_img4_p109.jpg" alt="Cicatrice fogliare e suberificazione" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Cicatrice fogliare e suberificazione', 'Fig. da Dispensa pag. 109')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 109</strong> - Cicatrizzazione paretale per deposizione interna di suberina e cere</div>
                            </div>
                            <div class="lab-concept-image-container">
                                <img src="images/concepts/abscissione_img5_p109.jpg" alt="Sughero protettivo persistente" class="lab-concept-image" onclick="openConceptLightbox(this.src, 'Sughero protettivo persistente', 'Fig. da Dispensa pag. 109')">
                                <div class="lab-concept-image-caption">📸 <strong>Fig. da Dispensa pag. 109</strong> - Tappo protettivo di sughero formato dal fellogeno a seguito del distacco</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="recall-block" onclick="toggleRecall(this)">
                <div class="recall-header">2. Fisiologia dei Movimenti Stomatici 👁️</div>
                <div class="recall-hidden">
                    I movimenti di apertura e chiusura della rima stomatica controllano l'equilibrio tra fotosintesi ($CO_2$) e perdita idrica ($H_2O$):
                    <ul>
                        <li><strong>Apertura (Innesco luminoso/bassi livelli di CO₂):</strong>
                            <ol>
                                <li>Si attiva una pompa protonica $H^+$-ATPasi sul plasmalemma delle cellule di guardia. I protoni vengono estrusi attivamente nello spazio della parete.</li>
                                <li>L'uscita di cariche positive genera un forte potenziale elettrico negativo transmembrana (iperpolarizzazione).</li>
                                <li>Questo potenziale apre canali voltaggio-dipendenti specifici che consentono l'afflusso massiccio all'interno della cellula di ioni potassio ($K^+$) e cloruro ($Cl^-$).</li>
                                <li>L'elevata concentrazione salina intracellulare abbassa drasticamente il potenziale osmotico. L'acqua penetra rapidamente per osmosi attraverso le acquaporine nel grande vacuolo centrale.</li>
                                <li>L'aumento della pressione di turgore fa rigonfiare le due cellule di guardia, che incurvandosi aprono la rima stomatica.</li>
                            </ol>
                        </li>
                        <li><strong>Chiusura (Stress idrico indotto da ABA):</strong>
                            <ol>
                                <li>In presenza di deficit idrico, le radici sintetizzano acido abscissico (ABA) che giunge alle foglie.</li>
                                <li>L'ABA si lega a recettori di membrana delle cellule di guardia, inducendo l'apertura di canali del calcio che innalzano il $Ca^{2+}$ citosolico.</li>
                                <li>L'aumento del calcio inibisce la pompa protonica e depolarizza la membrana, provocando l'apertura di canali d'uscita (efflusso) di anioni ($Cl^-$) e di potassio ($K^+$).</li>
                                <li>La perdita di ioni soluto innalza il potenziale osmotico. L'acqua fuoriesce rapidamente per osmosi dalla cellula.</li>
                                <li>Le cellule di guardia perdono turgore cellulare, sgonfiandosi e appiattendosi l'una contro l'altra, sigillando la rima stomatica per bloccare la traspirazione.</li>
                            </ol>
                        </li>
                    </ul>
                </div>
            </div>
`
  }
};

const start = jsContent.indexOf('const cellLabData = {');
if (start === -1) {
    console.error('Could not find const cellLabData in js/app.js');
    process.exit(1);
}

let depth = 0;
let end = -1;
for (let i = start; i < jsContent.length; i++) {
    if (jsContent[i] === '{') depth++;
    else if (jsContent[i] === '}') {
        depth--;
        if (depth === 0) {
            end = i + 1;
            break;
        }
    }
}

if (end === -1) {
    console.error('Could not find matching closing bracket for cellLabData');
    process.exit(1);
}

let cellLabDataString = 'const cellLabData = {\n';
const keys = Object.keys(cellLabData);
keys.forEach((key, index) => {
    const item = cellLabData[key];
    cellLabDataString += `  "${key}": {\n`;
    cellLabDataString += `    "title": ${JSON.stringify(item.title)},\n`;
    cellLabDataString += `    "group": ${JSON.stringify(item.group)},\n`;
    cellLabDataString += `    "content": \`\n${item.content}\`\n`;
    cellLabDataString += `  }${index < keys.length - 1 ? ',' : ''}\n`;
});
cellLabDataString += '}';

const updatedContent = jsContent.substring(0, start) + cellLabDataString + jsContent.substring(end);

fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log('Successfully enriched and updated cellLabData in js/app.js!');

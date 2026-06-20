# RUNBOOK — Trasformare le dispense PDF di un corso in schede di studio

> Istruzioni per "il me del futuro" (l'assistente). Documenta il metodo end-to-end
> usato per **Agronomia** a giugno 2026, generalizzato per ripeterlo su un altro
> corso (prossimo: **Biologia**). Leggere anche le memorie di progetto
> `appunti-source-of-truth` e `appunti-card-architecture`.

L'obiettivo: prendere il **PDF d'esame** di un corso e produrre, dentro questa web-app,
un set **completo, fedele al PDF e leggibile** di schede di studio, mantenendo coerente
l'interfaccia. Lo studente ha **ADHD**: le schede devono essere scannabili, gerarchiche,
non prose dense.

---

## 0. Principi non negoziabili (decisi dall'utente)

1. **Unica fonte di verità = il PDF del corso.** L'esame si dà col professore che ha
   scritto quel PDF: deve sentirsi dire ciò che c'è nel PDF. Niente nozioni esterne.
2. Le cartelle tipo `fonti_pdf/<corso>/md/` sono **INAFFIDABILI**: non usarle. Estrarre
   il testo **direttamente dal PDF** con PyMuPDF.
3. Allineare i numeri/dati al PDF; correggere ciò che lo contraddice; rimuovere aggiunte
   non presenti.
4. **Nel testo delle schede non si cita la fonte**: niente "il PDF dice", "le slide",
   "EdiSES Tab. X", note "(Correzione: …)". I fatti si espongono come verità diretta.
5. Stile UI già definito: tema **teal**, **poche emoji** (icone SVG / dot CSS), schede
   **gerarchiche e scannabili**.

Prima di iniziare, **chiedere all'utente**: dov'è il PDF del corso (es.
`dispense_biologia copia.pdf` nella root) e qual è il `data-subject` di destinazione.

---

## 1. Architettura dell'app (il bersaglio)

- **`index.html`** contiene TUTTE le schede come HTML statico. `js/app.js` le legge dal
  DOM. Attributi chiave del `<div class="card" …>`:
  - `data-subject` = `agronomia` | `biologia` | `botanica`
  - `data-id` = chiave univoca (stato salvato in localStorage)
  - `data-category` = categoria/argomento
  - `data-search` = testo minuscolo per la ricerca
  - `data-status` = `todo|review|progress|done`
  - `data-src="pdf"` = marca le schede generate da noi (badge "PDF" + barra verde)
- Le schede statiche sono ordinate per subject: prima agronomia, poi biologia, poi botanica.
- **Categorie/filtri**: per **agronomia** i bottoni filtro sono hardcoded in
  `#categoryTags` e la mappa categoria→colore è **base64** in `app.js` (`cssTagMapping`).
  Per **biologia/botanica** i filtri sono rigenerati a runtime da `rebuildCategoryTags(subject)`.
  ⚠️ **Verificare come funziona il subject di destinazione PRIMA di aggiungere schede**
  (vedi §7 per Biologia): riusare le categorie esistenti evita di toccare HTML+JS+base64.
- **Template del corpo scheda** (usare ESATTAMENTE queste classi):
  ```html
  <div class="card-body tex2jax_process">
    <ul class="note-ul">
      <li><strong class="lead-key">Etichetta:</strong> testo con <strong class="term">termine</strong> e $formula$.</li>
      <li><strong class="lead-key">Categoria:</strong>
        <ul class="note-sub">
          <li><strong class="term">Sotto-voce</strong>: dettaglio.</li>
        </ul>
      </li>
    </ul>
    <div class="exam-tip"><span class="tip-badge">Focus d'esame</span><div class="tip-content">…</div></div>
  </div>
  ```
  Matematica: MathJax `$…$` (inline) / `$$…$$` (display). Termini chiave: `.term` (pillola
  teal). Numeri: testo normale. Il `.card-footer` è **nascosto via CSS** (niente capitolo
  duplicato né data).
- **Persistenza** (già generica per tutti i subject, niente da rifare):
  `functions/api/state.js` (Cloudflare Pages Function, binding KV `STATE`) + `js/sync.js`
  (intercetta `localStorage.setItem`, push con debounce, pull+reload all'avvio). Sincronizza
  TUTTO il localStorage, quindi copre anche i nuovi subject automaticamente.

---

## 2. Setup ambiente

```bash
cd ~/Documents/GitHub/appunti
pip3 install --quiet pymupdf          # estrazione PDF (modulo "fitz")
mkdir -p .work                        # cartella di lavoro (è in .gitignore)
```
`.gitignore` deve contenere `.work/` e `*.pdf` (il PDF NON va mai committato/pushato).

---

## 3. Fase A — Estrazione PDF e mappa delle sezioni

1. Aprire il PDF con `fitz`, contare le pagine.
2. Capire le **macro-sezioni** usando i piè di pagina ricorrenti (in Agronomia erano
   tipo `Insegnamento … / <sezione> <n>`). Costruire una mappa sezione→intervallo pagine.
3. Estrarre il testo per sezione in `.work/pdf_sections/<NN_nome>.txt` (con marcatori
   `===== PAG n =====`).

Schema (adattare i pattern dei footer al PDF del corso):
```python
import fitz, re
d = fitz.open('dispense_<corso> copia.pdf')
# 1) sniff dei footer per dedurre le sezioni; 2) split per intervalli di pagine
```

---

## 4. Fase B — Analisi dei gap (PDF vs schede esistenti)

1. Parsare dal `index.html` le schede esistenti del subject (id, categoria, titolo, testo).
2. Raggrupparle per macro-area, allineandole alle sezioni del PDF.
3. Lanciare **agenti paralleli, uno per macro-area** (`general-purpose`). Ognuno legge il/i
   file `.work/pdf_sections/*.txt` della sua area + le schede attuali e produce un **report
   markdown**: concetti mancanti/insufficienti (con pagina PDF), errori nelle schede attuali,
   schede nuove suggerite. (In Agronomia: 9 aree → 9 agenti.)

Questo dà la lista esatta di cosa creare/correggere.

---

## 5. Fase C — Authoring del contenuto (JSON dal PDF)

Lanciare agenti (di nuovo ~1 per area) che **scrivono JSON** in
`.work/generated/<area>.json`:
```json
{ "new_cards": [ {"cat":"<categoria esatta>","title":"…","text":"…"} ],
  "fix_cards": [ {"id":"<data-id esistente>","text":"…"} ] }
```
Regole per gli agenti: contenuto **solo dal PDF**, numeri/formule esatti, categoria tra
quelle valide, niente caratteri `<`/`>` grezzi fuori dalla matematica, formule in `$…$`.
(Nota: l'`id` assegnato dagli agenti è inaffidabile → lo riassegniamo noi.)

---

## 6. Fase D — Render + inserimento in `index.html`

Script Python (`.work/render.py`):
1. Caricare tutti i JSON; **riassegnare `data-id` univoci** in modo deterministico.
   ⚠️ Usare una **base alta e non in conflitto** con gli id esistenti.
   - Agronomia ha usato **1001–1097**. Per **Biologia usare es. 2001+** (verificare prima
     gli id già usati dal subject biologia, che NON sono sempre numerici).
2. Rendere il corpo HTML dal template (§1), costruire `data-search`, aggiungere `data-src="pdf"`.
3. Inserire le schede nuove **dopo l'ultima scheda dello stesso subject** (confine pulito
   subject→subject) e **raggruppate per categoria**.
4. Applicare le `fix_cards`: sostituire il solo `.card-body` della scheda con quel `data-id`.

**Backup sempre**: `cp index.html .work/index.backup.html` prima di scrivere.

---

## 7. Fase E — Riformattazione leggibilità (LA LEZIONE PIÙ IMPORTANTE)

Il testo "grezzo" si legge come **prosa densa**: NON basta. Va riformattato in HTML
gerarchico e scannabile. **La regex non basta** (la gerarchia e la rimozione dei
riferimenti sono semantiche): usare **agenti LLM con una SPEC rigorosa**.

Procedura che ha funzionato:
1. Estrarre il testo sorgente di **tutte** le schede del subject (preferire il testo JSON
   dove disponibile, altrimenti estrarre dal corpo HTML attuale; marcare il "Focus d'esame"
   con `[FOCUS]`).
2. Dividere in **lotti da ~13** schede → `.work/reformat2/batches/batch_NN.json`
   (`{id:{title,cat,text}}`).
3. Scrivere la SPEC **una volta** in `.work/reformat2/SPEC.md` e lanciare **un agente per
   lotto** (in Agronomia: 14 agenti). Ogni agente legge SPEC + batch e scrive
   `.work/reformat2/out/out_NN.json` = `{id: htmlDelCorpo}`.
4. **Pilota prima**: riformattare 2–3 schede problematiche, mostrarle all'utente
   (screenshot), poi estendere a tutte.
5. Merge degli output, **sostituire ogni `.card-body`** per `data-id`. Validare: copertura
   = tutti gli id, **0 riferimenti "PDF"**, formule `$` bilanciate, nessun corpo vuoto,
   nessun marcatore di conflitto.

### LA SPEC (riusabile — copiare in `.work/reformat2/SPEC.md`)

> Riformatti il CORPO di schede di studio in HTML pulito, gerarchico e scannabile (ADHD).
> REGOLA D'ORO: preserva OGNI fatto/numero/formula/termine/esempio; non aggiungere né
> omettere. Ribilancia solo struttura ed evidenziazione e rimuovi i riferimenti alla fonte.
> Input JSON `{id:{title,cat,text}}`; `[FOCUS]` separa il corpo dal "Focus d'esame".
>
> 1. **GERARCHIA**: se un'etichetta introduce una categoria con sotto-voci, ANNIDA le
>    sotto-voci sotto di essa (mai allo stesso livello). Una voce che è argomento nuovo e
>    indipendente resta al livello principale. Non annidare voci non correlate.
> 2. **GRANULARITÀ**: raggruppa i fatti collegati in UN punto (es. esempi/valori inline);
>    non spezzare un concetto in tante mini-righe, ma non fondere argomenti distinti in prosa.
> 3. **PROSA DENSA**: scomponi i blocchi lunghi in punti/sotto-elenchi.
> 4. **FONTE**: elimina "il PDF / nel PDF / le slide / il documento / EdiSES Tab. X / fig.
>    X.Y" e note "(Correzione: …)". Esponi i fatti come verità oggettiva.
>
> **Formato HTML** (solo questi pattern):
> - Contenitore: `<ul class="note-ul">`
> - Punto con etichetta: `<li><strong class="lead-key">Etichetta:</strong> testo.</li>`
> - Categoria con sotto-voci ANNIDATE:
>   `<li><strong class="lead-key">Categoria:</strong><ul class="note-sub"><li><strong class="term">Sotto-voce</strong>: dettaglio.</li>…</ul></li>`
> - Punto senza etichetta: `<li>testo.</li>`
> - `<strong class="term">…</strong>` SOLO per termini/sigle chiave, con parsimonia
>   (mai intere frasi, max ~1–3 per punto).
> - Valori numerici come testo normale (es. "0–4 °C", ">10–15 m/s", "47,2%").
> - Matematica invariata: `$…$` / `$$…$$`.
> - Focus d'esame finale SOLO se presente: `<div class="exam-tip"><span class="tip-badge">Focus d'esame</span><div class="tip-content">…</div></div>`
> - NON usare "<" come testo (scrivi "inferiore a"); ">" come testo è ammesso.
> - Italiano; etichetta in maiuscolo iniziale, testo dopo i due punti in minuscolo.
>
> **Output**: SOLO un oggetto JSON `{id: htmlDelCorpo}`. Nessun testo fuori dal JSON.

---

## 8. Fase F — Verifica nel browser

- Avviare il preview server (`.claude/launch.json` → `python3 -m http.server`).
- Controllare: **0 errori console**, MathJax renderizza (`mjx-container`), ricerca/filtri/
  roadmap aggiornati, conteggi corretti, `.note-sub` presenti, nessun corpo vuoto.
- ⚠️ **Lo screenshot della griglia intera esce NERO** (pagina troppo alta per il capture
  headless). Workaround: verificare via `eval` (DOM/computed style) e per gli screenshot
  **clonare 1–2 schede in un overlay `position:fixed` in cima** e poi catturare.

---

## 9. Fase G — Git

- **Mai committare il PDF** (`*.pdf` in `.gitignore`). Verificare che niente file enorme
  finisca in stage.
- L'assistente **non può pushare** (in questo ambiente git non accede al portachiavi
  macОС: errore `could not read Username`). **Il push lo fa l'utente**: `git push origin main`.
- ⚠️ **Conflitti/divergenza**: se l'utente pusha tra un turno e l'altro e poi io faccio
  `git commit --amend`, le storie divergono; un `git pull` apre un **merge in conflitto** su
  `index.html`/`css` (file pieni di marcatori `<<<<<<<`). Risoluzione sicura: **tenere la
  NOSTRA versione riformattata**:
  ```bash
  git checkout --ours -- index.html css/style.css
  git add index.html css/style.css
  git commit --no-edit        # completa il merge → poi un push normale (fast-forward)
  ```
  In alternativa, se la storia è stata solo riscritta (amend) senza modifiche remote uniche,
  `git push --force-with-lease`. Verificare sempre `git merge-base --is-ancestor origin/main HEAD`.

---

## 10. Persistenza Cloudflare (una tantum, già fatta)

`functions/api/state.js` + `js/sync.js` sono generici. L'utente deve solo aver bindato un
**KV namespace** con Variable name `STATE` nel progetto Pages (Settings → Bindings) e fatto
un redeploy. Verifica: `https://<sito>.pages.dev/api/state` deve rispondere `null` (non 501/404).

---

## 11. Specifico per BIOLOGIA (da verificare a inizio sessione)

- Esiste già un subject `biologia` con schede statiche in `index.html`
  (`data-subject="biologia"`). **Capire prima**: come sono i loro `data-id` (NON
  sequenziali come agronomia), come funzionano categorie/filtri (`rebuildCategoryTags`,
  `renderBioSidebar`/`renderBioContent`) e dove salvano lo stato
  (`localStorage` chiavi `biology_card_status_*`).
- Decidere se **arricchire** le schede biologia esistenti o **rifarle dal PDF** (chiedere
  all'utente). Probabile mandato: come per agronomia, completare/allineare al PDF.
- PDF: chiedere il file (es. `dispense_biologia copia.pdf`), metterlo in root (gitignored).
- `data-id` nuovi: base **2001+** (controllare prima i max usati per evitare collisioni).
- Mappa colori categorie: se si introducono categorie nuove, aggiungerle al sistema colori
  del subject biologia (verificare se usa `cssTagMapping` base64 o un meccanismo dinamico).

---

## 12. Checklist rapida

- [ ] PDF in root (gitignored), PyMuPDF installato
- [ ] Estratte sezioni in `.work/pdf_sections/`
- [ ] Gap analysis (agenti per area) → report
- [ ] Authoring JSON in `.work/generated/`
- [ ] Render + insert (id non in conflitto, `data-src="pdf"`, backup)
- [ ] **Pilota** riformattazione → ok utente
- [ ] Riformattazione completa (SPEC + agenti a lotti) + validazione
- [ ] Verifica browser (console, MathJax, filtri, screenshot via overlay)
- [ ] Commit (no PDF) → l'utente pusha
- [ ] (se serve) risoluzione conflitti tenendo "ours"

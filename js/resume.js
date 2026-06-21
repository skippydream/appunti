/* ============================================================================
   "Riprendi da dove eri" — ricorda l'ultima scheda su cui hai lavorato e
   offre un modo rapido per tornarci, anche aprendo l'app su un altro browser.

   La chiave 'last_active_card_v1' NON è device-local: viene sincronizzata su KV
   come il resto del progresso, quindi il punto di ripresa segue l'utente.
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'last_active_card_v1';
  const DISMISS = 'resume_dismissed';   // sessionStorage: nascosto per questa sessione

  function cardById(id) {
    return document.getElementById('card_' + id) ||
      document.querySelector('.card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
  }

  // Logica semplice e intuitiva: l'"ultima scheda" è quella che stavi guardando,
  // cioè la scheda visibile più in alto nella finestra. Si aggiorna mentre scorri
  // (a scorrimento fermo). La scrittura è SOLO locale: la chiave è "passiva" lato
  // sync (vedi PASSIVE in sync.js), quindi scorrere non consuma scritture su KV;
  // il valore viaggia in coda al prossimo salvataggio o alla chiusura.
  let lastRecordedId = null;
  function record(id, subject) {
    if (!id || id === lastRecordedId) return;
    lastRecordedId = id;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        id: id, subject: subject || 'agronomia', ts: Date.now()
      }));
    } catch (e) {}
  }
  window.recordActiveCard = record;

  // Trova la scheda visibile più vicina al bordo superiore (sotto l'header).
  function topVisibleCard() {
    const anchor = 150;     // px sotto il bordo alto della finestra
    let best = null, bestDist = Infinity;
    const cards = document.querySelectorAll('.card');
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (c.style.display === 'none') continue;
      const r = c.getBoundingClientRect();
      if (r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) continue;
      const dist = Math.abs(r.top - anchor);
      if (dist < bestDist) { bestDist = dist; best = c; }
    }
    return best;
  }

  let scrollTimer = null;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      const c = topVisibleCard();
      if (c) record(c.getAttribute('data-id'), c.getAttribute('data-subject') || 'agronomia');
    }, 600);
  }, { passive: true });

  // Porta l'utente alla scheda: cambia materia se serve, scorre e la evidenzia.
  function goToCard(last) {
    const subject = last.subject || 'agronomia';
    if (typeof window.switchSubject === 'function') {
      try { window.switchSubject(subject); } catch (e) {}
    }
    setTimeout(function () {
      const card = cardById(last.id);
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.remove('active-recall-hidden');
      card.classList.remove('card-pulse-active');
      void card.offsetWidth;               // forza il restart dell'animazione
      card.classList.add('card-pulse-active');
      setTimeout(function () { card.classList.remove('card-pulse-active'); }, 3000);
    }, 80);
  }

  function buildBanner(last, title) {
    const banner = document.createElement('div');
    banner.className = 'resume-banner';
    banner.id = 'resumeBanner';
    banner.innerHTML =
      '<button class="resume-go" id="resumeGo" type="button">' +
        '<span class="resume-icon" aria-hidden="true">↩</span>' +
        '<span class="resume-text">Riprendi da dove eri: <strong></strong></span>' +
      '</button>' +
      '<button class="resume-dismiss" id="resumeDismiss" type="button" aria-label="Nascondi">&times;</button>';
    // titolo inserito come testo (niente HTML injection)
    banner.querySelector('.resume-text strong').textContent = title;

    const navbar = document.querySelector('.subject-navbar');
    if (navbar && navbar.parentElement) navbar.parentElement.insertBefore(banner, navbar.nextSibling);
    else document.querySelector('.container').insertBefore(banner, document.querySelector('.container').firstChild);

    // Mostra con una piccola transizione. setTimeout (non solo rAF) così il
    // banner compare anche se la tab è in background (rAF lì viene sospeso).
    requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    setTimeout(function () { banner.classList.add('is-visible'); }, 60);

    banner.querySelector('#resumeGo').addEventListener('click', function () {
      goToCard(last);
      hide(banner);
    });
    banner.querySelector('#resumeDismiss').addEventListener('click', function () {
      try { sessionStorage.setItem(DISMISS, '1'); } catch (e) {}
      hide(banner);
    });
  }

  function hide(banner) {
    banner.classList.remove('is-visible');
    setTimeout(function () { if (banner.parentElement) banner.parentElement.removeChild(banner); }, 300);
  }

  function init() {
    let last;
    try { last = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (last && last.id) lastRecordedId = last.id;   // evita riscritture identiche allo scroll
    try { if (sessionStorage.getItem(DISMISS)) return; } catch (e) {}
    if (!last || !last.id) return;
    const card = cardById(last.id);
    if (!card) return;                       // scheda non presente: niente banner
    const titleEl = card.querySelector('.card-title');
    const title = titleEl ? titleEl.textContent.trim() : 'l\'ultima scheda';
    buildBanner(last, title);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

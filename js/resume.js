/* ============================================================================
   "Riprendi da dove eri" — la card attuale viene salvata SOLO col salvataggio
   manuale (FAB "Salva", che chiama captureCurrentCard). All'apertura, se c'è una
   card salvata, un banner permette di tornarci.
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'last_active_card_v1';
  const DISMISS = 'resume_dismissed';   // sessionStorage: nascosto per la sessione

  function cardById(id) {
    return document.getElementById('card_' + id) ||
      document.querySelector('.card[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
  }

  // Scheda visibile più vicina al bordo superiore (sotto l'header).
  function topVisibleCard() {
    const anchor = 150;
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

  // Chiamata dal salvataggio manuale: registra la card attualmente visibile.
  window.captureCurrentCard = function () {
    const c = topVisibleCard();
    if (!c) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        id: c.getAttribute('data-id'),
        subject: c.getAttribute('data-subject') || 'agronomia',
        ts: Date.now()
      }));
    } catch (e) {}
  };

  // Porta alla card: cambia materia se serve, scorre e la evidenzia.
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
      void card.offsetWidth;
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
    banner.querySelector('.resume-text strong').textContent = title;

    const navbar = document.querySelector('.subject-navbar');
    if (navbar && navbar.parentElement) navbar.parentElement.insertBefore(banner, navbar.nextSibling);
    else document.querySelector('.container').insertBefore(banner, document.querySelector('.container').firstChild);

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
    try { if (sessionStorage.getItem(DISMISS)) return; } catch (e) {}
    let last;
    try { last = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!last || !last.id) return;
    const card = cardById(last.id);
    if (!card) return;
    const titleEl = card.querySelector('.card-title');
    const title = titleEl ? titleEl.textContent.trim() : 'l\'ultima scheda';
    buildBanner(last, title);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

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

  // Registra la scheda attiva (chiamabile anche da srs.js durante il ripasso).
  function record(id, subject) {
    if (!id) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        id: id, subject: subject || 'agronomia', ts: Date.now()
      }));
    } catch (e) {}
  }
  window.recordActiveCard = record;

  // Ogni interazione col tracker = "sto lavorando su questa scheda".
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.tracker-btn');
    if (!btn) return;
    const card = btn.closest('.card');
    if (!card) return;
    record(card.getAttribute('data-id'), card.getAttribute('data-subject') || 'agronomia');
  });

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
    try { if (sessionStorage.getItem(DISMISS)) return; } catch (e) {}
    let last;
    try { last = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
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

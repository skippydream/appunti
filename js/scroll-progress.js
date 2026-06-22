/* ============================================================================
   Indicatore di scroll (solo desktop): mostra l'argomento corrente (x/tot) e
   l'avanzamento nello studio (%). Compare allo scroll e svanisce dopo ~2s.
   Si basa sulle intestazioni di sezione (.card-section) costruite in app.js.
   ============================================================================ */
(function () {
  'use strict';

  const box = document.getElementById('scrollProg');
  if (!box) return;
  const pctEl   = document.getElementById('scrollProgPct');
  const topicEl = document.getElementById('scrollProgTopic');
  const metaEl  = document.getElementById('scrollProgMeta');
  const fill    = box.querySelector('.sp-fill');
  let hideTimer = null;
  let raf = null;

  function visibleSections() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return [];
    return Array.prototype.slice.call(grid.querySelectorAll('.card-section'))
      .filter(function (h) { return h.offsetParent !== null; });  // display != none
  }

  function compute() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return null;
    const headers = visibleSections();
    if (!headers.length) return null;
    const anchor = window.innerHeight * 0.32;   // linea di riferimento sotto l'header
    let idx = 0;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].getBoundingClientRect().top <= anchor) idx = i; else break;
    }
    const cur = headers[idx];
    const gridTop = grid.getBoundingClientRect().top + window.scrollY;
    const gh = grid.offsetHeight || 1;
    let pct = Math.round(((window.scrollY + anchor) - gridTop) / gh * 100);
    pct = Math.max(0, Math.min(100, pct));
    return {
      name: (cur.querySelector('.card-section-label') || {}).textContent || '',
      index: idx + 1,
      total: headers.length,
      pct: pct,
      color: cur.style.getPropertyValue('--cat') || ''
    };
  }

  function update() {
    raf = null;
    if (window.innerWidth < 900) return;   // solo desktop
    const d = compute();
    if (!d) return;
    topicEl.textContent = d.name;
    pctEl.textContent = d.pct + '%';
    metaEl.textContent = 'Argomento ' + d.index + ' / ' + d.total;
    if (fill) fill.style.strokeDashoffset = String(100 - d.pct);
    if (d.color) box.style.setProperty('--cat', d.color);
    box.classList.add('is-visible');
    box.setAttribute('aria-hidden', 'false');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      box.classList.remove('is-visible');
      box.setAttribute('aria-hidden', 'true');
    }, 1900);
  }

  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }, { passive: true });
})();

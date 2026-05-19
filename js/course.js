(function () {
    const course = document.body.dataset.course || 'agronomia';
    const metadata = window.STUDY_METADATA?.[course] || { ids: [], cards: [] };
    const storageKey = 'study_states_v2';
    const starKey = 'study_stars_v2';
    const oldStates = JSON.parse(localStorage.getItem('agronomia_study_states') || '{}');
    const oldStars = JSON.parse(localStorage.getItem('agronomia_starred_cards') || '{}');
    let states = JSON.parse(localStorage.getItem(storageKey) || '{}');
    let stars = JSON.parse(localStorage.getItem(starKey) || '{}');
    let currentCategory = 'all';
    let currentStatus = 'all';
    let query = '';
    let recallMode = false;

    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));

    function statusFor(id) {
        return states[id] || oldStates[id] || 'todo';
    }

    function save() {
        localStorage.setItem(storageKey, JSON.stringify(states));
        localStorage.setItem(starKey, JSON.stringify(stars));
        localStorage.setItem('study_last_course', course);
        localStorage.setItem('study_last_touch', new Date().toISOString());
        updateProgress();
    }

    function syncCardControls(card) {
        const id = card.dataset.id;
        const status = statusFor(id);
        card.dataset.status = status;
        card.classList.toggle('starred', !!stars[id] || !!oldStars[id]);
        card.querySelectorAll('.tracker-btn').forEach(button => {
            const match = button.getAttribute('onclick')?.match(/'([^']+)'\)\s*$/);
            const buttonStatus = match?.[1];
            button.classList.toggle('active', buttonStatus === status);
        });
    }

    window.setCardStatus = function (id, status) {
        states[id] = status;
        const card = document.getElementById(`card_${id}`);
        if (card) syncCardControls(card);
        save();
        applyFilters();
    };

    window.toggleStar = function (id) {
        stars[id] = !stars[id];
        const card = document.getElementById(`card_${id}`);
        if (card) card.classList.toggle('starred', !!stars[id]);
        save();
        applyFilters();
    };

    window.revealCard = function (id) {
        document.getElementById(`card_${id}`)?.classList.remove('active-recall-hidden');
    };

    window.closeConceptLightbox = function () {
        const lightbox = $('#conceptLightbox');
        if (lightbox) lightbox.style.display = 'none';
    };

    window.openConceptLightbox = function (imgUrl, caption, description = '') {
        const lightbox = $('#conceptLightbox');
        const img = $('#lightboxImg');
        const cap = $('#lightboxCaption');
        if (!lightbox || !img || !cap) return;
        img.src = imgUrl;
        img.alt = caption || 'Immagine concettuale';
        cap.innerHTML = `${caption || 'Immagine concettuale'}${description ? `<br><small>${description}</small>` : ''}`;
        lightbox.style.display = 'flex';
    };

    function hydrateWikiImages() {
        const map = window.WIKI_CARD_IMAGES || {};
        $$('.card[data-id]').forEach(card => {
            const meta = map[card.dataset.id];
            if (!meta?.src || card.querySelector('.wiki-card-figure')) return;
            const figure = document.createElement('figure');
            figure.className = 'wiki-card-figure';
            const sourceLabel = meta.sourceTitle || meta.query || 'Wikipedia / Wikimedia Commons';
            figure.innerHTML = `
                <img loading="lazy" decoding="async" src="${meta.src}" alt="${meta.title || sourceLabel}">
                <figcaption class="wiki-card-caption">
                    <span>${sourceLabel}</span>
                    ${meta.sourcePage ? `<a href="${meta.sourcePage}" target="_blank" rel="noopener noreferrer">Fonte</a>` : ''}
                </figcaption>
            `;
            figure.querySelector('img').addEventListener('click', () => {
                const title = card.querySelector('.card-title')?.textContent?.trim() || sourceLabel;
                openConceptLightbox(meta.src, title, `Fonte: ${sourceLabel}`);
            });
            card.insertBefore(figure, card.querySelector('.card-body'));
        });
    }

    function normalize(text) {
        return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function cardMatches(card) {
        const matchesCategory = currentCategory === 'all' || card.dataset.category === currentCategory;
        const status = statusFor(card.dataset.id);
        const matchesStatus = currentStatus === 'all'
            || (currentStatus === 'starred' ? !!stars[card.dataset.id] : status === currentStatus);
        const haystack = normalize(card.dataset.search || card.textContent);
        const matchesSearch = !query || haystack.includes(normalize(query));
        return matchesCategory && matchesStatus && matchesSearch;
    }

    function applyFilters() {
        let visible = 0;
        $$('.card[data-id]').forEach(card => {
            const show = cardMatches(card);
            card.style.display = show ? 'flex' : 'none';
            card.classList.toggle('active-recall-hidden', show && recallMode);
            if (show) visible++;
        });
        const empty = $('#emptyState');
        if (empty) empty.style.display = visible ? 'none' : 'flex';
    }

    function updateProgress() {
        const ids = metadata.ids || [];
        const done = ids.filter(id => statusFor(id) === 'done').length;
        const review = ids.filter(id => statusFor(id) === 'review').length;
        const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
        $('#courseProgressText').textContent = `${done}/${ids.length}`;
        $('#courseProgressBar').style.width = `${pct}%`;
        $('#focusHintTitle').textContent = review ? `${review} da ripassare` : 'Una cosa alla volta';
        $('#focusHintText').textContent = review
            ? 'Parti da una rossa: il cervello ama chiudere anelli piccoli.'
            : 'Scegli una scheda, copri la risposta, poi segnala lo stato.';
    }

    function initCards() {
        $$('.card[data-id]').forEach(card => {
            syncCardControls(card);
        });
        hydrateWikiImages();
        updateProgress();
        applyFilters();
    }

    function bindControls() {
        $('#courseSearch')?.addEventListener('input', event => {
            query = event.target.value;
            applyFilters();
        });
        $$('#courseTags .tag-btn').forEach(button => {
            button.addEventListener('click', () => {
                $$('#courseTags .tag-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentCategory = button.dataset.filterCategory || 'all';
                applyFilters();
            });
        });
        $$('.quick-filter[data-status-filter]').forEach(button => {
            button.addEventListener('click', () => {
                $$('.quick-filter[data-status-filter]').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentStatus = button.dataset.statusFilter || 'all';
                applyFilters();
            });
        });
        $('#modeRead')?.addEventListener('click', () => {
            recallMode = false;
            $('#modeRead').classList.add('active');
            $('#modeRecall').classList.remove('active');
            applyFilters();
        });
        $('#modeRecall')?.addEventListener('click', () => {
            recallMode = true;
            $('#modeRecall').classList.add('active');
            $('#modeRead').classList.remove('active');
            applyFilters();
        });
        $('#focusModeBtn')?.addEventListener('click', () => {
            document.body.classList.toggle('deep-focus');
            $('#focusModeBtn').classList.toggle('active');
        });
        $('#resetFiltersBtn')?.addEventListener('click', () => {
            query = '';
            currentCategory = 'all';
            currentStatus = 'all';
            $('#courseSearch').value = '';
            $$('#courseTags .tag-btn, .quick-filter[data-status-filter]').forEach(btn => btn.classList.remove('active'));
            $('#courseTags .tag-btn[data-filter-category="all"]')?.classList.add('active');
            $('.quick-filter[data-status-filter="all"]')?.classList.add('active');
            applyFilters();
        });
        $('#nextReviewBtn')?.addEventListener('click', () => {
            const candidate = $$('.card[data-id]').find(card => statusFor(card.dataset.id) === 'review')
                || $$('.card[data-id]').find(card => statusFor(card.dataset.id) !== 'done')
                || $$('.card[data-id]')[0];
            if (!candidate) return;
            candidate.style.display = 'flex';
            candidate.scrollIntoView({ behavior: 'smooth', block: 'center' });
            candidate.classList.remove('active-recall-hidden');
            candidate.classList.add('card-pulse-active');
            setTimeout(() => candidate.classList.remove('card-pulse-active'), 1800);
        });
        document.addEventListener('keydown', event => {
            if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                event.preventDefault();
                $('#courseSearch')?.focus();
            }
        });
    }

    function init() {
        initCards();
        bindControls();
        localStorage.setItem('study_last_course', course);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

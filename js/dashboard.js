(function () {
    const metadata = window.STUDY_METADATA || {};
    const states = JSON.parse(localStorage.getItem('study_states_v2') || '{}');
    const oldStates = JSON.parse(localStorage.getItem('agronomia_study_states') || '{}');
    const habits = JSON.parse(localStorage.getItem('study_habits') || '{}');
    const $ = selector => document.querySelector(selector);

    function statusFor(id) {
        return states[id] || oldStates[id] || 'todo';
    }

    function courseStats(course) {
        const ids = course.ids || [];
        const done = ids.filter(id => statusFor(id) === 'done').length;
        const review = ids.filter(id => statusFor(id) === 'review').length;
        const progress = ids.filter(id => statusFor(id) === 'progress').length;
        const todo = ids.length - done - review - progress;
        const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
        return { total: ids.length, done, review, progress, todo, pct };
    }

    function renderToday() {
        const date = new Date();
        $('#todayLabel').textContent = date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
        const prompts = [
            'Apri una sola scheda. Il resto non esiste ancora.',
            'Prima lettura lenta, poi active recall.',
            'Quando perdi il filo, cerca una parola concreta.',
            'Due minuti bastano per rimettere il treno sui binari.'
        ];
        $('#dailyPrompt').textContent = prompts[date.getDay() % prompts.length];
    }

    function renderCourses() {
        const container = $('#courseOverview');
        container.innerHTML = '';
        let best = null;
        Object.entries(metadata).forEach(([key, course]) => {
            const stats = courseStats(course);
            const pressure = stats.review * 3 + stats.progress * 2 + stats.todo;
            if (!best || pressure > best.pressure) best = { key, course, stats, pressure };
            const card = document.createElement('article');
            card.className = 'dashboard-course-card';
            card.style.setProperty('--course-accent', course.accent);
            card.innerHTML = `
                <a class="course-card-hit" href="./${course.file}" aria-label="Apri ${course.title}"></a>
                <div class="course-card-head">
                    <span class="course-card-icon">${course.icon}</span>
                    <div>
                        <h2>${course.title}</h2>
                        <p>${course.description}</p>
                    </div>
                </div>
                <div class="course-ring" style="--pct:${stats.pct}%">
                    <strong>${stats.pct}%</strong>
                    <span>${stats.done}/${stats.total}</span>
                </div>
                <div class="course-status-row">
                    <span><b>${stats.review}</b> ripasso</span>
                    <span><b>${stats.progress}</b> quasi</span>
                    <span><b>${stats.todo}</b> aperte</span>
                </div>
                <div class="course-mini-bar"><span style="width:${stats.pct}%"></span></div>
            `;
            container.appendChild(card);
        });
        if (best) {
            $('#continueLink').href = `./${best.course.file}`;
            $('#nextActionTitle').textContent = `Continua con ${best.course.title}`;
            $('#nextActionText').textContent = best.stats.review
                ? `${best.stats.review} schede da ripassare: prendine una, non tutto il corso.`
                : `${best.stats.todo + best.stats.progress} schede ancora aperte: scegli un blocco piccolo.`;
        }
    }

    function renderLoadMap() {
        const map = $('#loadMap');
        map.innerHTML = '';
        Object.values(metadata).forEach(course => {
            const stats = courseStats(course);
            const item = document.createElement('div');
            item.className = 'load-row';
            item.innerHTML = `
                <span>${course.icon} ${course.title}</span>
                <div class="load-track"><i style="width:${stats.pct}%"></i></div>
                <strong>${stats.done}/${stats.total}</strong>
            `;
            map.appendChild(item);
        });
    }

    function bindHabits() {
        document.querySelectorAll('.habit-item').forEach(button => {
            const key = button.dataset.habit;
            button.classList.toggle('done', !!habits[key]);
            button.addEventListener('click', () => {
                habits[key] = !habits[key];
                localStorage.setItem('study_habits', JSON.stringify(habits));
                button.classList.toggle('done', !!habits[key]);
            });
        });
        const parking = $('#thoughtParking');
        parking.value = localStorage.getItem('thought_parking') || '';
        parking.addEventListener('input', () => localStorage.setItem('thought_parking', parking.value));
    }

    let timer = null;
    let remaining = 120;
    function renderTimer() {
        const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
        const ss = String(remaining % 60).padStart(2, '0');
        $('#microTimer').textContent = `${mm}:${ss}`;
    }

    function bindTimer() {
        $('#twoMinuteBtn').addEventListener('click', () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
                $('#microTimerLabel').textContent = 'In pausa';
                return;
            }
            remaining = remaining <= 0 ? 120 : remaining;
            $('#microTimerLabel').textContent = 'Respira e parti';
            timer = setInterval(() => {
                remaining -= 1;
                renderTimer();
                if (remaining <= 0) {
                    clearInterval(timer);
                    timer = null;
                    $('#microTimerLabel').textContent = 'Ora apri una scheda';
                }
            }, 1000);
        });
        $('#resetDashboardBtn').addEventListener('click', () => window.location.reload());
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderToday();
        renderCourses();
        renderLoadMap();
        bindHabits();
        bindTimer();
        renderTimer();
    });
})();

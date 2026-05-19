// ============================================================
// Study Hub - Clean Study Application
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // State Management
    // ============================================================
    
    const state = {
        currentCategory: 'all',
        currentStatus: 'all',
        searchQuery: '',
        viewMode: 'grid',
        cardStatuses: JSON.parse(localStorage.getItem('cardStatuses') || '{}'),
        starredCards: JSON.parse(localStorage.getItem('starredCards') || '[]'),
        theme: localStorage.getItem('theme') || 'light',
        streak: parseInt(localStorage.getItem('studyStreak') || '0'),
        lastStudyDate: localStorage.getItem('lastStudyDate') || '',
        pomodoroSessions: parseInt(localStorage.getItem('pomodoroSessions') || '0'),
        pomodoroRunning: false,
        pomodoroTime: 25 * 60,
        pomodoroInterval: null,
        focusMode: false
    };

    // ============================================================
    // DOM Elements
    // ============================================================
    
    const elements = {
        // Theme
        themeBtn: document.getElementById('themeBtn'),
        
        // Sidebar
        sidebar: document.getElementById('sidebar'),
        menuToggle: document.getElementById('menuToggle'),
        categoryNav: document.getElementById('categoryNav'),
        
        // Stats
        statLearned: document.getElementById('statLearned'),
        statProgress: document.getElementById('statProgress'),
        statTotal: document.getElementById('statTotal'),
        progressPercent: document.getElementById('progressPercent'),
        progressFill: document.getElementById('progressFill'),
        streakCount: document.getElementById('streakCount'),
        
        // Search & Filters
        searchInput: document.getElementById('searchInput'),
        categoryFilters: document.getElementById('categoryFilters'),
        statusPills: document.querySelectorAll('.status-pill'),
        viewBtns: document.querySelectorAll('.view-btn'),
        
        // Cards
        cardsContainer: document.getElementById('cardsContainer'),
        cardsGrid: document.getElementById('cardsGrid'),
        emptyState: document.getElementById('emptyState'),
        
        // Pomodoro
        pomodoroWidget: document.getElementById('pomodoroWidget'),
        pomodoroCollapsed: document.getElementById('pomodoroCollapsed'),
        pomodoroExpanded: document.getElementById('pomodoroExpanded'),
        pomodoroCollapseBtn: document.getElementById('pomodoroCollapseBtn'),
        pomodoroTime: document.getElementById('pomodoroTime'),
        pomodoroMiniTime: document.getElementById('pomodoroMiniTime'),
        pomodoroStartBtn: document.getElementById('pomodoroStartBtn'),
        pomodoroResetBtn: document.getElementById('pomodoroResetBtn'),
        pomodoroModes: document.querySelectorAll('.pomodoro-mode'),
        sessionsCount: document.getElementById('sessionsCount'),
        
        // Focus Mode
        focusOverlay: document.getElementById('focusOverlay'),
        focusTimer: document.getElementById('focusTimer'),
        focusModeBtn: document.getElementById('focusModeBtn'),
        focusExitBtn: document.getElementById('focusExitBtn'),
        
        // Modals
        quizModal: document.getElementById('quizModal'),
        quizBtn: document.getElementById('quizBtn'),
        quizModalClose: document.getElementById('quizModalClose'),
        quizCategory: document.getElementById('quizCategory'),
        quizQuestion: document.getElementById('quizQuestion'),
        quizAnswer: document.getElementById('quizAnswer'),
        quizRevealBtn: document.getElementById('quizRevealBtn'),
        quizNextBtn: document.getElementById('quizNextBtn'),
        
        cardModal: document.getElementById('cardModal'),
        cardModalClose: document.getElementById('cardModalClose'),
        modalCategory: document.getElementById('modalCategory'),
        modalId: document.getElementById('modalId'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalStatusBtns: document.querySelectorAll('.modal-status-btns .status-btn'),
        modalStarBtn: document.getElementById('modalStarBtn')
    };

    // ============================================================
    // Theme Management
    // ============================================================
    
    function initTheme() {
        document.body.setAttribute('data-theme', state.theme);
    }

    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
    }

    // ============================================================
    // Cards Rendering
    // ============================================================
    
    function getCategories() {
        const categoryCounts = {};
        cardsData.forEach(card => {
            if (card.categoria) {
                categoryCounts[card.categoria] = (categoryCounts[card.categoria] || 0) + 1;
            }
        });
        return categoryCounts;
    }

    function renderSidebarCategories() {
        const categoryCounts = getCategories();
        const categories = Object.keys(categoryCounts).sort();
        const total = cardsData.length;
        
        elements.categoryNav.innerHTML = `
            <button class="category-btn active" data-category="all">
                <span>Tutti gli argomenti</span>
                <span class="count">${total}</span>
            </button>
            ${categories.map(cat => `
                <button class="category-btn" data-category="${cat}">
                    <span>${cat}</span>
                    <span class="count">${categoryCounts[cat]}</span>
                </button>
            `).join('')}
        `;
        
        // Add event listeners
        elements.categoryNav.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.categoryNav.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentCategory = btn.dataset.category;
                
                // Also update the filter tags in main content to match
                elements.categoryFilters.querySelectorAll('.filter-tag').forEach(tag => {
                    tag.classList.toggle('active', tag.dataset.category === btn.dataset.category);
                });
                
                renderCards();
                
                // Close sidebar on mobile
                if (window.innerWidth <= 768) {
                    elements.sidebar.classList.remove('open');
                }
            });
        });
    }

    function renderCategoryFilters() {
        const categoryCounts = getCategories();
        const categories = Object.keys(categoryCounts).sort();
        elements.categoryFilters.innerHTML = `
            <button class="filter-tag active" data-category="all">Tutti</button>
            ${categories.map(cat => `
                <button class="filter-tag" data-category="${cat}">${cat}</button>
            `).join('')}
        `;
        
        // Add event listeners
        elements.categoryFilters.querySelectorAll('.filter-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.categoryFilters.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentCategory = btn.dataset.category;
                
                // Also update the sidebar categories to match
                elements.categoryNav.querySelectorAll('.category-btn').forEach(catBtn => {
                    catBtn.classList.toggle('active', catBtn.dataset.category === btn.dataset.category);
                });
                
                renderCards();
            });
        });
    }

    function getFilteredCards() {
        return cardsData.filter(card => {
            // Category filter
            if (state.currentCategory !== 'all' && card.categoria !== state.currentCategory) {
                return false;
            }
            
            // Status filter
            const cardStatus = state.cardStatuses[card.id] || 'todo';
            if (state.currentStatus === 'starred') {
                if (!state.starredCards.includes(card.id)) return false;
            } else if (state.currentStatus !== 'all' && cardStatus !== state.currentStatus) {
                return false;
            }
            
            // Search filter
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                const searchText = `${card.titolo} ${card.categoria} ${card.descrizione_raw}`.toLowerCase();
                if (!searchText.includes(query)) return false;
            }
            
            return true;
        });
    }

    function getStatusText(status) {
        const texts = {
            todo: 'Da studiare',
            progress: 'In corso',
            done: 'Completata'
        };
        return texts[status] || 'Da studiare';
    }

    function truncateText(text, maxLength = 150) {
        if (!text) return '';
        // Clean up text
        let clean = text.replace(/•/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        if (clean.length <= maxLength) return clean;
        return clean.substring(0, maxLength).trim() + '...';
    }

    function renderCards() {
        const filteredCards = getFilteredCards();
        
        if (filteredCards.length === 0) {
            elements.cardsGrid.innerHTML = '';
            elements.emptyState.classList.add('visible');
            return;
        }
        
        elements.emptyState.classList.remove('visible');
        
        elements.cardsGrid.innerHTML = filteredCards.map(card => {
            const status = state.cardStatuses[card.id] || 'todo';
            const isStarred = state.starredCards.includes(card.id);
            
            return `
                <div class="card ${isStarred ? 'starred' : ''}" 
                     data-id="${card.id}" 
                     data-status="${status}"
                     onclick="window.openCardModal('${card.id}')">
                    <div class="card-header">
                        <div class="card-meta">
                            <span class="card-category">${card.categoria}</span>
                            <span class="card-id">#${card.id}</span>
                        </div>
                        <button class="card-star" onclick="event.stopPropagation(); window.toggleStar('${card.id}')">★</button>
                    </div>
                    <h3 class="card-title">${card.titolo}</h3>
                    <p class="card-preview">${truncateText(card.descrizione_raw)}</p>
                    <div class="card-footer">
                        <div class="card-status">
                            <span class="status-indicator"></span>
                            <span class="status-text">${getStatusText(status)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update grid class based on view mode
        elements.cardsGrid.classList.toggle('list-view', state.viewMode === 'list');
        
        updateStats();
    }

    // ============================================================
    // Card Modal
    // ============================================================
    
    let currentModalCardId = null;

    window.openCardModal = function(cardId) {
        const card = cardsData.find(c => c.id === cardId);
        if (!card) return;
        
        currentModalCardId = cardId;
        const status = state.cardStatuses[cardId] || 'todo';
        const isStarred = state.starredCards.includes(cardId);
        
        elements.modalCategory.textContent = card.categoria;
        elements.modalId.textContent = `#${card.id}`;
        elements.modalTitle.textContent = card.titolo;
        
        // Format content
        const content = formatContent(card.descrizione_raw);
        elements.modalBody.innerHTML = content;
        
        // Update status buttons
        elements.modalStatusBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === status);
        });
        
        // Update star button
        elements.modalStarBtn.classList.toggle('active', isStarred);
        
        elements.cardModal.classList.add('active');
        
        // Re-render MathJax if available
        if (window.MathJax) {
            MathJax.typesetPromise([elements.modalBody]);
        }
    };

    function formatContent(raw) {
        if (!raw) return '';
        
        // Split by bullet points and format
        const lines = raw.split('\n').filter(line => line.trim());
        let html = '<ul>';
        
        lines.forEach(line => {
            let formatted = line.trim();
            
            // Remove leading bullet
            formatted = formatted.replace(/^[•\-]\s*/, '');
            
            // Bold the lead key (text before colon)
            if (formatted.includes(':')) {
                const parts = formatted.split(':');
                const key = parts[0];
                const rest = parts.slice(1).join(':');
                formatted = `<strong>${key}:</strong>${rest}`;
            }
            
            if (formatted) {
                html += `<li>${formatted}</li>`;
            }
        });
        
        html += '</ul>';
        return html;
    }

    function closeCardModal() {
        elements.cardModal.classList.remove('active');
        currentModalCardId = null;
    }

    // ============================================================
    // Card Status & Star
    // ============================================================
    
    window.toggleStar = function(cardId) {
        const index = state.starredCards.indexOf(cardId);
        if (index > -1) {
            state.starredCards.splice(index, 1);
        } else {
            state.starredCards.push(cardId);
        }
        localStorage.setItem('starredCards', JSON.stringify(state.starredCards));
        renderCards();
        
        // Update modal if open
        if (currentModalCardId === cardId) {
            elements.modalStarBtn.classList.toggle('active', state.starredCards.includes(cardId));
        }
    };

    function setCardStatus(cardId, status) {
        state.cardStatuses[cardId] = status;
        localStorage.setItem('cardStatuses', JSON.stringify(state.cardStatuses));
        renderCards();
        
        // Update modal buttons
        elements.modalStatusBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === status);
        });
        
        // Update streak
        updateStreak();
    }

    // ============================================================
    // Statistics
    // ============================================================
    
    function updateStats() {
        const total = cardsData.length;
        let learned = 0;
        let progress = 0;
        
        cardsData.forEach(card => {
            const status = state.cardStatuses[card.id] || 'todo';
            if (status === 'done') learned++;
            else if (status === 'progress') progress++;
        });
        
        elements.statLearned.textContent = learned;
        elements.statProgress.textContent = progress;
        elements.statTotal.textContent = total;
        
        const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
        elements.progressPercent.textContent = `${percent}%`;
        elements.progressFill.style.width = `${percent}%`;
        
        elements.streakCount.textContent = state.streak;
    }

    function updateStreak() {
        const today = new Date().toDateString();
        if (state.lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (state.lastStudyDate === yesterday.toDateString()) {
                state.streak++;
            } else if (state.lastStudyDate !== today) {
                state.streak = 1;
            }
            
            state.lastStudyDate = today;
            localStorage.setItem('lastStudyDate', state.lastStudyDate);
            localStorage.setItem('studyStreak', state.streak.toString());
            elements.streakCount.textContent = state.streak;
        }
    }

    // ============================================================
    // Pomodoro Timer
    // ============================================================
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updatePomodoroDisplay() {
        const timeStr = formatTime(state.pomodoroTime);
        elements.pomodoroTime.textContent = timeStr;
        elements.pomodoroMiniTime.textContent = timeStr;
        
        if (state.focusMode) {
            elements.focusTimer.textContent = timeStr;
        }
    }

    function startPomodoro() {
        if (state.pomodoroRunning) {
            // Stop
            clearInterval(state.pomodoroInterval);
            state.pomodoroRunning = false;
            elements.pomodoroStartBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Avvia
            `;
            elements.pomodoroStartBtn.classList.remove('running');
        } else {
            // Start
            state.pomodoroRunning = true;
            elements.pomodoroStartBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Pausa
            `;
            elements.pomodoroStartBtn.classList.add('running');
            
            state.pomodoroInterval = setInterval(() => {
                state.pomodoroTime--;
                updatePomodoroDisplay();
                
                if (state.pomodoroTime <= 0) {
                    clearInterval(state.pomodoroInterval);
                    state.pomodoroRunning = false;
                    
                    // Session complete
                    state.pomodoroSessions++;
                    localStorage.setItem('pomodoroSessions', state.pomodoroSessions.toString());
                    elements.sessionsCount.textContent = state.pomodoroSessions;
                    
                    // Play sound (optional)
                    try {
                        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAcLTp3N25tnAAN3zcu3fAAHp8/DhgAJALXMq3EAD3TRu4sLAI3gvJMDABWcx6BzAA6WwKhrABCPvqJuAA2Gup9xABN/tp5uABZ4tJpqABtysJZlAB9rq5JhACVlp45cACxfoopXADJZnoZTADlUnIJPAEBPmH1LAEdKlHlHAE1GkHVDAFRBjHE/AFo8iG07AGE4hGk3AGc0gGUzAG4wfGEvAHQsdV0rAHooelkpAIAlclUlAIYhdVEjAIwecE0gAJIac0kdAJgWbkUbAJ4Sb0EZAKQPa0IXAKYOYA');
                        audio.volume = 0.5;
                        audio.play().catch(() => {});
                    } catch (e) {}
                    
                    // Notify
                    if (Notification.permission === 'granted') {
                        new Notification('🍅 Sessione completata!', {
                            body: 'Hai completato una sessione di studio. Fai una pausa!',
                            icon: '🍅'
                        });
                    }
                    
                    // Reset button
                    elements.pomodoroStartBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Avvia
                    `;
                    elements.pomodoroStartBtn.classList.remove('running');
                    
                    // Reset time to last selected mode
                    const activeMode = document.querySelector('.pomodoro-mode.active');
                    state.pomodoroTime = parseInt(activeMode.dataset.minutes) * 60;
                    updatePomodoroDisplay();
                    
                    // Exit focus mode if active
                    if (state.focusMode) {
                        toggleFocusMode();
                    }
                }
            }, 1000);
        }
    }

    function resetPomodoro() {
        clearInterval(state.pomodoroInterval);
        state.pomodoroRunning = false;
        
        const activeMode = document.querySelector('.pomodoro-mode.active');
        state.pomodoroTime = parseInt(activeMode.dataset.minutes) * 60;
        updatePomodoroDisplay();
        
        elements.pomodoroStartBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Avvia
        `;
        elements.pomodoroStartBtn.classList.remove('running');
    }

    function togglePomodoroExpand() {
        elements.pomodoroWidget.classList.toggle('expanded');
    }

    // ============================================================
    // Focus Mode
    // ============================================================
    
    function toggleFocusMode() {
        state.focusMode = !state.focusMode;
        elements.focusOverlay.classList.toggle('active', state.focusMode);
        
        if (state.focusMode) {
            updatePomodoroDisplay();
            // Start timer if not running
            if (!state.pomodoroRunning) {
                startPomodoro();
            }
        }
    }

    // ============================================================
    // Quiz
    // ============================================================
    
    let currentQuizCard = null;

    function showRandomQuiz() {
        const cards = cardsData.filter(c => c.titolo && c.descrizione_raw);
        if (cards.length === 0) return;
        
        currentQuizCard = cards[Math.floor(Math.random() * cards.length)];
        
        elements.quizCategory.textContent = currentQuizCard.categoria;
        elements.quizQuestion.textContent = currentQuizCard.titolo;
        elements.quizAnswer.innerHTML = formatContent(currentQuizCard.descrizione_raw);
        elements.quizAnswer.classList.add('hidden');
        elements.quizRevealBtn.style.display = 'block';
        
        elements.quizModal.classList.add('active');
        
        // Re-render MathJax if available
        if (window.MathJax) {
            MathJax.typesetPromise([elements.quizAnswer]);
        }
    }

    function revealQuizAnswer() {
        elements.quizAnswer.classList.remove('hidden');
        elements.quizRevealBtn.style.display = 'none';
    }

    function closeQuizModal() {
        elements.quizModal.classList.remove('active');
    }

    // ============================================================
    // Event Listeners
    // ============================================================
    
    function initEventListeners() {
        // Theme toggle
        elements.themeBtn.addEventListener('click', toggleTheme);
        
        // Mobile menu
        elements.menuToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !elements.sidebar.contains(e.target) && 
                !elements.menuToggle.contains(e.target)) {
                elements.sidebar.classList.remove('open');
            }
        });
        
        // Search
        elements.searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderCards();
        });
        
        // Keyboard shortcut for search
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                elements.searchInput.focus();
            }
            if (e.key === 'Escape') {
                closeCardModal();
                closeQuizModal();
                if (state.focusMode) toggleFocusMode();
            }
        });
        
        // Status filters
        elements.statusPills.forEach(pill => {
            pill.addEventListener('click', () => {
                elements.statusPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.currentStatus = pill.dataset.status;
                renderCards();
            });
        });
        
        // View mode
        elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.viewMode = btn.dataset.view;
                elements.cardsGrid.classList.toggle('list-view', state.viewMode === 'list');
            });
        });
        
        // Pomodoro
        elements.pomodoroCollapsed.addEventListener('click', togglePomodoroExpand);
        elements.pomodoroCollapseBtn.addEventListener('click', togglePomodoroExpand);
        elements.pomodoroStartBtn.addEventListener('click', startPomodoro);
        elements.pomodoroResetBtn.addEventListener('click', resetPomodoro);
        
        elements.pomodoroModes.forEach(mode => {
            mode.addEventListener('click', () => {
                elements.pomodoroModes.forEach(m => m.classList.remove('active'));
                mode.classList.add('active');
                if (!state.pomodoroRunning) {
                    state.pomodoroTime = parseInt(mode.dataset.minutes) * 60;
                    updatePomodoroDisplay();
                }
            });
        });
        
        // Focus mode
        elements.focusModeBtn.addEventListener('click', toggleFocusMode);
        elements.focusExitBtn.addEventListener('click', toggleFocusMode);
        
        // Quiz modal
        elements.quizBtn.addEventListener('click', showRandomQuiz);
        elements.quizModalClose.addEventListener('click', closeQuizModal);
        elements.quizRevealBtn.addEventListener('click', revealQuizAnswer);
        elements.quizNextBtn.addEventListener('click', showRandomQuiz);
        
        // Card modal
        elements.cardModalClose.addEventListener('click', closeCardModal);
        elements.cardModal.addEventListener('click', (e) => {
            if (e.target === elements.cardModal) closeCardModal();
        });
        
        elements.modalStatusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentModalCardId) {
                    setCardStatus(currentModalCardId, btn.dataset.status);
                }
            });
        });
        
        elements.modalStarBtn.addEventListener('click', () => {
            if (currentModalCardId) {
                window.toggleStar(currentModalCardId);
            }
        });
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // ============================================================
    // Initialize
    // ============================================================
    
    function init() {
        initTheme();
        renderSidebarCategories();
        renderCategoryFilters();
        renderCards();
        updatePomodoroDisplay();
        elements.sessionsCount.textContent = state.pomodoroSessions;
        initEventListeners();
        
        console.log('[v0] Study Hub initialized with', cardsData.length, 'cards');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

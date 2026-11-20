document.addEventListener('DOMContentLoaded', () => {
    // --- Night Mode Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark' || (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // --- Search Logic ---
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const problemCards = document.querySelectorAll('.problem-card');
    const isOnProblemsPage = problemCards.length > 0;

    function filterCards(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        problemCards.forEach(card => {
            const textContent = card.textContent.toLowerCase();
            if (!term || textContent.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function executeSearch() {
        if (!searchInput) return;
        const searchTerm = searchInput.value.trim();
        
        if (isOnProblemsPage) {
            filterCards(searchTerm);
            const newUrl = window.location.pathname + (searchTerm ? '?q=' + encodeURIComponent(searchTerm) : '');
            window.history.replaceState(null, '', newUrl);
        } else if (searchTerm) {
            const problemsNav = document.querySelector('.site-nav a[href*="problems"]');
            const targetBase = problemsNav ? problemsNav.href : '/qsblib/problems/';
            window.location.href = targetBase + '?q=' + encodeURIComponent(searchTerm);
        }
    }

    if (searchInput) {
        // Handle URL parameter query on load
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        
        if (queryParam) {
            searchInput.value = queryParam;
            if (isOnProblemsPage) {
                filterCards(queryParam);
            }
        }

        // Live filtering while typing if on Problems page
        searchInput.addEventListener('input', () => {
            if (isOnProblemsPage) {
                filterCards(searchInput.value);
            }
        });

        // Search on Enter key press
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                executeSearch();
            });
        }
    }
});
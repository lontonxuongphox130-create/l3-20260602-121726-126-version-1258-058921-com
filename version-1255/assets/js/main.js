(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var index = 0;
            var timer = null;

            function show(next) {
                if (!slides.length) {
                    return;
                }
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            }

            function start() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot') || 0));
                    start();
                });
            });
            start();
        }

        var input = document.querySelector('[data-filter-input]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
        var currentCategory = '';

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                var pool = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || pool.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchCategory = !currentCategory || card.getAttribute('data-category') === currentCategory;
                card.classList.toggle('hidden', !(matchKeyword && matchYear && matchCategory));
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', applyFilters);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilters);
        }
        categoryButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentCategory = button.getAttribute('data-category-filter') || '';
                categoryButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });
        applyFilters();
    });
})();

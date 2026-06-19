(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }


    function setupImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll('img'));
        images.forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function show(nextIndex) {
            index = nextIndex % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var reset = scope.querySelector('[data-filter-reset]');
            var list = document.querySelector('[data-filter-list]');
            var count = document.querySelector('[data-result-count]');

            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.children);

            function textOf(card) {
                return [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.textContent
                ].join(' ').toLowerCase();
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var year = yearSelect ? yearSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var matchedKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                    var matchedYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
                    var matched = matchedKeyword && matchedYear;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 条结果';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (yearSelect) {
                        yearSelect.value = '';
                    }
                    apply();
                });
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    setupImageFallbacks();
    setupHero();
    setupFilters();
})();

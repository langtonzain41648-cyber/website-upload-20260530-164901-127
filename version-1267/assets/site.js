(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                stop();
                show(idx);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initInlineFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
        lists.forEach(function (list) {
            var section = list.closest('.filter-section') || document;
            var input = section.querySelector('[data-filter-input]');
            var yearSelect = section.querySelector('[data-filter-year]');
            var typeSelect = section.querySelector('[data-filter-type]');
            var items = Array.prototype.slice.call(list.children);

            function applyFilter() {
                var query = normalize(input && input.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                items.forEach(function (item) {
                    var haystack = normalize([
                        item.dataset.title,
                        item.dataset.year,
                        item.dataset.type,
                        item.dataset.region,
                        item.dataset.genre,
                        item.dataset.category
                    ].join(' '));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !year || normalize(item.dataset.year) === year;
                    var matchType = !type || normalize(item.dataset.type) === type;
                    item.classList.toggle('is-hidden-by-filter', !(matchQuery && matchYear && matchType));
                });
            }

            [input, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
        });
    }

    function movieCard(movie) {
        var title = escapeHtml(movie.title);
        var desc = escapeHtml(movie.one_line || '');
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card" data-title="' + title + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-category="' + escapeHtml(movie.category) + '">' +
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
                    '<div class="poster-frame">' +
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + title + '" loading="lazy" onerror="this.remove();">' +
                        '<div class="poster-gradient"></div>' +
                        '<span class="duration">' + escapeHtml(movie.duration) + '</span>' +
                    '</div>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + title + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
                    '<p class="movie-desc">' + desc + '</p>' +
                    '<div class="mini-tags">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initSearchPage() {
        var data = window.SEARCH_MOVIES;
        var results = document.querySelector('[data-search-results]');
        if (!data || !results) {
            return;
        }
        var input = document.querySelector('[data-search-page-input]');
        var yearSelect = document.querySelector('[data-search-year]');
        var typeSelect = document.querySelector('[data-search-type]');
        var regionSelect = document.querySelector('[data-search-region]');
        var summary = document.querySelector('[data-search-summary]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input) {
            input.value = q;
        }

        function applySearch() {
            var query = normalize(input && input.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var matched = data.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.type,
                    movie.region,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(' ')
                ].join(' '));
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!year || normalize(movie.year) === year) &&
                    (!type || normalize(movie.type) === type) &&
                    (!region || normalize(movie.region) === region);
            });
            var limited = matched.slice(0, 120);
            results.innerHTML = limited.map(movieCard).join('');
            if (summary) {
                summary.textContent = '找到 ' + matched.length + ' 部影片，当前显示前 ' + limited.length + ' 部。';
            }
        }

        [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applySearch);
                control.addEventListener('change', applySearch);
            }
        });
        applySearch();
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video-src]'));
        shells.forEach(function (shell) {
            var src = shell.getAttribute('data-video-src');
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            var hlsInstance = null;
            if (!src || !video || !button) {
                return;
            }

            function loadAndPlay() {
                if (!shell.dataset.loaded) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = src;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: false,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = src;
                    }
                    shell.dataset.loaded = 'true';
                }
                button.classList.add('hidden');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.classList.remove('hidden');
                    });
                }
            }

            button.addEventListener('click', loadAndPlay);
            video.addEventListener('play', function () {
                button.classList.add('hidden');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    button.classList.remove('hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initInlineFilters();
        initSearchPage();
        initPlayers();
    });
})();

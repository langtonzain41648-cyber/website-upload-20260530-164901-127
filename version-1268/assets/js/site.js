(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-global-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('data-search-page') || './categories.html';

            if (query) {
                window.location.href = target + '?q=' + encodeURIComponent(query);
            } else {
                window.location.href = target;
            }
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var searchInput = document.querySelector('[data-page-search]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var activeFilter = 'all';

    function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden', !(matchedQuery && matchedFilter));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        searchInput.addEventListener('input', applyFilters);
        applyFilters();
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            applyFilters();
        });
    });
})();

function setupMoviePlayer(streamUrl) {
    var root = document.querySelector('[data-player]');

    if (!root) {
        return;
    }

    var video = root.querySelector('video');
    var cover = root.querySelector('[data-play-cover]');
    var button = root.querySelector('[data-play-button]');
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
        if (loaded || !video) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        loadStream();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.setAttribute('controls', 'controls');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            playVideo();
        });
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

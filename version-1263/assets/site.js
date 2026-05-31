(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-search-input]');
        var year = panel.querySelector('[data-year-filter]');
        var category = panel.querySelector('[data-category-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var yearQuery = params.get('year') || '';
        var categoryQuery = params.get('category') || '';

        if (input && query) {
            input.value = query;
        }

        if (year && yearQuery) {
            year.value = yearQuery;
        }

        if (category && categoryQuery) {
            category.value = categoryQuery;
        }

        function matchCard(card) {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var categoryValue = category ? category.value : '';
            var haystack = (card.getAttribute('data-text') || '').toLowerCase();
            var ok = true;

            if (keyword) {
                ok = haystack.indexOf(keyword) !== -1;
            }

            if (ok && yearValue) {
                ok = card.getAttribute('data-year') === yearValue;
            }

            if (ok && categoryValue) {
                ok = card.getAttribute('data-category') === categoryValue;
            }

            return ok;
        }

        function applyFilter() {
            var visible = 0;

            cards.forEach(function (card) {
                var ok = matchCard(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, year, category].forEach(function (item) {
            if (item) {
                item.addEventListener('input', applyFilter);
                item.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });
})();

function initVideoPlayer(videoId, coverId, messageId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var message = document.getElementById(messageId);
    var hls = null;
    var loaded = false;

    if (!video || !cover) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add('show');
        }
    }

    function attachStream() {
        if (loaded) {
            return Promise.resolve();
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('视频加载失败，请稍后重试');
                    }
                });
            });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        showMessage('视频加载失败，请稍后重试');
        return Promise.resolve();
    }

    function playNow() {
        attachStream().then(function () {
            cover.classList.add('hidden');
            var playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {
                    cover.classList.remove('hidden');
                });
            }
        });
    }

    cover.addEventListener('click', playNow);

    video.addEventListener('click', function () {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

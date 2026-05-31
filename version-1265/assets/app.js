(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

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
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                show(itemIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        selectAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var clear = panel.querySelector('[data-filter-clear]');
            var empty = panel.querySelector('[data-filter-empty]');
            var scope = panel.parentElement || document;
            var cards = selectAll('[data-filter-card]', scope.parentElement || document);
            var chips = selectAll('[data-filter-chip]', panel);

            function applyFilter(value) {
                var keyword = String(value || '').trim().toLowerCase();
                var visible = 0;
                chips.forEach(function (chip) {
                    chip.classList.toggle('active', keyword && chip.getAttribute('data-filter-chip').toLowerCase() === keyword);
                });
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-filter-text') || card.textContent || '').toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.classList.toggle('hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', function () {
                    applyFilter(input.value);
                });
            }
            if (clear) {
                clear.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    applyFilter('');
                });
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    var value = chip.getAttribute('data-filter-chip') || '';
                    if (input) {
                        input.value = value;
                    }
                    applyFilter(value);
                });
            });
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('main-video');
        var overlay = document.getElementById('player-overlay');
        var status = document.getElementById('player-status');
        var hlsInstance = null;
        var prepared = false;

        function setStatus(message) {
            if (!status) {
                return;
            }
            status.textContent = message || '';
            status.classList.toggle('show', Boolean(message));
        }

        function prepare(callback) {
            if (!video || prepared) {
                if (callback) {
                    callback();
                }
                return;
            }
            prepared = true;
            setStatus('加载中...');
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                    if (callback) {
                        callback();
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('视频加载失败，请刷新重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('');
                    if (callback) {
                        callback();
                    }
                }, { once: true });
                video.addEventListener('error', function () {
                    setStatus('视频加载失败，请刷新重试');
                });
            } else {
                setStatus('播放暂不可用');
            }
        }

        function play() {
            prepare(function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        setStatus('点击播放按钮开始观看');
                    });
                }
            });
        }

        if (!video) {
            return;
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                overlay.classList.add('hidden');
                play();
            });
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
            setStatus('');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
}());

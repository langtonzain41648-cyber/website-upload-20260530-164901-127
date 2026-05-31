(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applyFilter(form, input, cards, emptyState) {
    var query = normalize(input.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-local-search], [data-search-page]'));

  filterForms.forEach(function (form) {
    var input = form.querySelector('input[type="search"]');
    var cardList = document.querySelector('[data-card-list]');
    var cards = cardList ? Array.prototype.slice.call(cardList.querySelectorAll('[data-search-card]')) : [];
    var emptyState = document.querySelector('[data-empty-state]');

    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial) {
      input.value = initial;
    }

    applyFilter(form, input, cards, emptyState);

    input.addEventListener('input', function () {
      applyFilter(form, input, cards, emptyState);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter(form, input, cards, emptyState);
    });
  });
}());

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movie-player');
  var overlay = document.querySelector('[data-player-overlay]');
  var attached = false;
  var hlsInstance = null;

  if (!video || !sourceUrl) {
    return;
  }

  function attachMedia() {
    if (attached) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal || !hlsInstance) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });

      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = sourceUrl;
    return Promise.resolve();
  }

  function play() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    attachMedia().then(function () {
      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}

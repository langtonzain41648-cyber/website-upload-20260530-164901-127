(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
  filterForms.forEach(function (form) {
    var input = form.querySelector('[data-filter-search]');
    var region = form.querySelector('[data-filter-region]');
    var year = form.querySelector('[data-filter-year]');
    var scope = form.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matchYear(cardYear, selected) {
      if (!selected) {
        return true;
      }
      if (selected === 'old') {
        return Number(cardYear) <= 2020;
      }
      return String(cardYear) === selected;
    }

    function update() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' ').toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) && (!r || (card.dataset.region || '').indexOf(r) !== -1) && matchYear(card.dataset.year, y);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, update);
      }
      if (region) {
        region.addEventListener(eventName, update);
      }
      if (year) {
        year.addEventListener(eventName, update);
      }
    });

    form.addEventListener('submit', function (event) {
      if (cards.length) {
        event.preventDefault();
        update();
      }
    });

    update();
  });
})();

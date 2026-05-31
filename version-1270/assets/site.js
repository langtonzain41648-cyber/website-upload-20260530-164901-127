(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var grids = document.querySelectorAll('[data-filter-grid]');

  grids.forEach(function (grid) {
    var scope = grid.closest('section') || document;
    var input = scope.querySelector('[data-filter-input]') || document.querySelector('[data-filter-input]');
    var category = scope.querySelector('[data-filter-category]') || document.querySelector('[data-filter-category]');
    var year = scope.querySelector('[data-filter-year]') || document.querySelector('[data-filter-year]');
    var reset = scope.querySelector('[data-filter-reset]') || document.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function matchYear(cardYear, value) {
      if (!value || value === 'all') {
        return true;
      }

      var numericYear = parseInt(cardYear || '0', 10);

      if (value === 'older') {
        return numericYear > 0 && numericYear <= 2019;
      }

      return String(cardYear) === value;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedCategory = category ? category.value : 'all';
      var selectedYear = year ? year.value : 'all';

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardCategory = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        var categoryOk = selectedCategory === 'all' || selectedCategory === cardCategory;
        var yearOk = matchYear(cardYear, selectedYear);

        card.setAttribute('data-hidden', keywordOk && categoryOk && yearOk ? 'false' : 'true');
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (category) {
      category.addEventListener('change', applyFilter);
    }

    if (year) {
      year.addEventListener('change', applyFilter);
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }

        if (category) {
          category.value = 'all';
        }

        if (year) {
          year.value = 'all';
        }

        applyFilter();
      });
    }
  });
})();

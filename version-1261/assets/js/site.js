(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var expanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!expanded));
        mobileMenu.hidden = expanded;
        menuButton.textContent = expanded ? "☰" : "×";
      });
    }

    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });

    document.querySelectorAll(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + "?q=" + encodeURIComponent(input.value.trim());
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      showSlide(0);
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    if (filterInput) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
      filterInput.addEventListener("input", function () {
        var query = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          card.hidden = query && text.indexOf(query) === -1;
        });
      });
    }

    var searchInput = document.querySelector("[data-search-page-input]");
    var searchResults = document.querySelector("[data-search-results]");

    if (searchInput && searchResults && window.MOVIE_SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      searchInput.value = initialQuery;

      function renderResults(query) {
        var normalized = query.trim().toLowerCase();
        if (!normalized) {
          searchResults.innerHTML = '<div class="empty-state">输入片名、地区、年份或题材即可搜索。</div>';
          return;
        }
        var hits = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
          return [movie.title, movie.region, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 96);
        if (!hits.length) {
          searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片。</div>';
          return;
        }
        searchResults.innerHTML = '<div class="movie-grid">' + hits.map(function (movie) {
          return [
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">',
            '<a class="movie-card__poster poster-shell" href="movie/movie-' + movie.id + '.html">',
            '<img data-cover src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="movie-card__score">' + movie.score + '</span>',
            '<span class="movie-card__play">▶</span>',
            '</a>',
            '<div class="movie-card__body">',
            '<div class="movie-card__meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
            '<h3 class="movie-card__title"><a href="movie/movie-' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
            '<p class="movie-card__desc">' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="movie-card__tags"><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
          ].join("");
        }).join("") + '</div>';
        searchResults.querySelectorAll("img[data-cover]").forEach(function (image) {
          image.addEventListener("error", function () {
            image.classList.add("is-missing");
          });
        });
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
          }[char];
        });
      }

      searchInput.addEventListener("input", function () {
        renderResults(searchInput.value);
      });
      renderResults(initialQuery);
    }
  });
})();

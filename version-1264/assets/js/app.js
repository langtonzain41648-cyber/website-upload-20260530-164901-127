(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => showSlide(current + 1), 5000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', () => {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  const localSearchInputs = Array.from(document.querySelectorAll('.movie-search-input'));

  localSearchInputs.forEach((input) => {
    const scope = input.closest('main') || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card'));

    input.addEventListener('input', () => {
      const keyword = input.value.trim().toLowerCase();

      cards.forEach((card) => {
        const text = (card.dataset.search || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden', keyword.length > 0 && !text.includes(keyword));
      });
    });
  });

  const player = document.querySelector('.movie-player');

  if (player) {
    const source = player.getAttribute('data-stream');
    const playButton = document.querySelector('.play-button');

    const hideButton = () => {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    };

    const attachStream = () => {
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(player);
      } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = source;
      }
    };

    attachStream();

    if (playButton) {
      playButton.addEventListener('click', () => {
        hideButton();
        player.play().catch(() => {
          playButton.classList.remove('is-hidden');
        });
      });
    }

    player.addEventListener('play', hideButton);
  }
})();

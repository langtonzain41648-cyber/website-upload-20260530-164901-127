(function () {
  function loadVideo(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (!video.dataset.ready) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = stream;
      }
      video.dataset.ready = 'true';
    }
    video.controls = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var overlay = player.querySelector('.player-overlay');
    var video = player.querySelector('video');
    if (overlay) {
      overlay.addEventListener('click', function () {
        loadVideo(player);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          loadVideo(player);
        }
      });
    }
  });
})();

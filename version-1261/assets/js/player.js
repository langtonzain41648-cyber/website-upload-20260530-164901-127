(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll(".hls-player").forEach(function (frame) {
      var video = frame.querySelector("video");
      var overlay = frame.querySelector(".video-overlay");
      var source = frame.getAttribute("data-src");
      var loaded = false;
      var hls = null;

      function attachSource() {
        if (loaded || !video || !source) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        if (!video) {
          return;
        }
        frame.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            frame.classList.remove("is-playing");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener("play", function () {
          frame.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          frame.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
          frame.classList.remove("is-playing");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();

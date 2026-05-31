(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }

    callback();
  }

  ready(function () {
    var video = document.querySelector('[data-player]');
    var startButton = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');

    if (!video || !startButton) {
      return;
    }

    var source = video.getAttribute('data-src');
    var attached = false;
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function hideButton() {
      startButton.classList.add('hidden');
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          startButton.classList.remove('hidden');
          setStatus('浏览器需要再次点击播放');
        });
      }
    }

    function attachSource() {
      if (!source) {
        setStatus('当前影片暂不可播放');
        return;
      }

      hideButton();

      if (attached) {
        playVideo();
        return;
      }

      attached = true;
      setStatus('正在加载影片');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('影片已就绪');
          playVideo();
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('播放加载失败，请刷新后重试');
            startButton.classList.remove('hidden');
          }
        });

        window.addEventListener('beforeunload', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });

        return;
      }

      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
    }

    startButton.addEventListener('click', attachSource);

    video.addEventListener('click', function () {
      if (!attached) {
        attachSource();
      }
    });

    video.addEventListener('play', function () {
      hideButton();
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        setStatus('已暂停');
      }
    });

    video.addEventListener('ended', function () {
      setStatus('播放结束');
      startButton.classList.remove('hidden');
    });
  });
})();

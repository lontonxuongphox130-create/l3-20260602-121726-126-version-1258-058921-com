(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initCarousel() {
    var carousel = qs('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('[data-carousel-dot]', carousel);
    var prev = qs('[data-carousel-prev]', carousel);
    var next = qs('[data-carousel-next]', carousel);
    var current = 0;
    var timer;

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

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        autoplay();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        autoplay();
      });
    });

    show(0);
    autoplay();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filter-grid]');
    if (!panel || !grid) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', panel);
    var year = qs('[data-filter-year]', panel);
    var region = qs('[data-filter-region]', panel);
    var empty = qs('[data-filter-empty]');
    var cards = qsa('[data-title]', grid);

    function apply() {
      var term = (keyword && keyword.value || '').trim().toLowerCase();
      var selectedYear = year && year.value || '';
      var selectedRegion = region && region.value || '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var ok = true;
        if (term && haystack.indexOf(term) === -1) {
          ok = false;
        }
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          ok = false;
        }
        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, year, region].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  }

  function initSearchPage() {
    var input = qs('#searchInput');
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    if (!input || !results || !status || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function card(movie) {
      return [
        '<a class="movie-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '">',
        '  <figure class="poster">',
        '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
        '  </figure>',
        '  <div class="card-body">',
        '    <h3>' + escapeHtml(movie.title) + '</h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '  </div>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function run(term) {
      var normalized = term.trim().toLowerCase();
      results.innerHTML = '';
      if (!normalized) {
        status.textContent = '请输入关键词开始搜索';
        status.classList.add('is-visible');
        return;
      }
      var found = window.SEARCH_INDEX.filter(function (movie) {
        return movie.search.indexOf(normalized) !== -1;
      }).slice(0, 120);
      if (!found.length) {
        status.textContent = '没有找到匹配影片';
        status.classList.add('is-visible');
        return;
      }
      status.textContent = '已找到相关影片';
      status.classList.add('is-visible');
      results.innerHTML = found.map(card).join('');
    }

    run(query);
    input.addEventListener('input', function () {
      run(input.value);
    });
  }

  function initPlayer() {
    var shell = qs('.player-shell');
    if (!shell) {
      return;
    }
    var video = qs('video', shell);
    var start = qs('.player-start', shell);
    var toggle = qs('[data-player-toggle]', shell);
    var mute = qs('[data-player-mute]', shell);
    var fullscreen = qs('[data-player-fullscreen]', shell);
    var error = qs('.player-error', shell);
    var source = shell.getAttribute('data-hls');
    var hls;
    var initialized = false;

    function showError(message) {
      if (error) {
        error.textContent = message;
        error.classList.add('is-visible');
      }
      shell.classList.remove('is-loading');
    }

    function initSource() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;
      shell.classList.add('is-loading');
      return new Promise(function (resolve) {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.remove('is-loading');
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                showError('网络加载异常，正在重试');
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                showError('媒体解析异常，正在恢复');
              } else {
                showError('当前浏览器无法播放该片源');
              }
            }
          });
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            shell.classList.remove('is-loading');
            resolve();
          }, { once: true });
          return;
        }
        showError('当前浏览器不支持 HLS 播放');
        resolve();
      });
    }

    function play() {
      initSource().then(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            showError('点击播放器可继续播放');
          });
        }
      });
    }

    function togglePlay() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (start) {
      start.addEventListener('click', play);
    }
    if (toggle) {
      toggle.addEventListener('click', togglePlay);
    }
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      if (toggle) {
        toggle.textContent = '暂停';
      }
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
      if (toggle) {
        toggle.textContent = '播放';
      }
    });
    if (mute) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreen) {
      fullscreen.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initCarousel();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();

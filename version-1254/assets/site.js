(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');
  if (navButton && mainNav) {
    navButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var input = document.getElementById('searchInput');
  var typeFilter = document.getElementById('typeFilter');
  var yearFilter = document.getElementById('yearFilter');
  var categoryFilter = document.getElementById('categoryFilter');
  var list = document.getElementById('movieList');
  var count = document.getElementById('searchCount');
  var params = new URLSearchParams(window.location.search);
  if (input && params.get('q')) {
    input.value = params.get('q');
  }
  var filterMovies = function () {
    if (!list) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var typeValue = typeFilter ? typeFilter.value : '';
    var yearValue = yearFilter ? yearFilter.value : '';
    var categoryValue = categoryFilter ? categoryFilter.value : '';
    var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var visible = 0;
    items.forEach(function (item) {
      var text = item.textContent.toLowerCase();
      var matched = true;
      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (typeValue && item.dataset.type !== typeValue) {
        matched = false;
      }
      if (yearValue && item.dataset.year !== yearValue) {
        matched = false;
      }
      if (categoryValue && item.dataset.category !== categoryValue) {
        matched = false;
      }
      item.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (count) {
      count.textContent = '匹配 ' + visible + ' 部';
    }
  };
  [input, typeFilter, yearFilter, categoryFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterMovies);
      element.addEventListener('change', filterMovies);
    }
  });
  filterMovies();
})();

function initPlayer(source) {
  var video = document.getElementById('mainVideo');
  var overlay = document.getElementById('playOverlay');
  if (!video || !source) {
    return;
  }
  var loaded = false;
  var start = function () {
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
}

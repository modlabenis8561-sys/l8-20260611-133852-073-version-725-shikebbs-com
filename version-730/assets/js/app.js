(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function bindMenus() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function bindSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || 'search.html';
        if (value) {
          window.location.href = target + '?q=' + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    var showcase = document.querySelector('[data-hero-showcase]');
    if (showcase) {
      showcase.addEventListener('mouseenter', stop);
      showcase.addEventListener('mouseleave', start);
    }
    show(0);
    start();
  }

  function bindFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    if (!cards.length) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    var category = document.querySelector('[data-filter-category]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    function apply() {
      var q = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var selectedCategory = category ? category.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.type,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchYear = !selectedYear || card.dataset.year === selectedYear;
        var matchType = !selectedType || card.dataset.type === selectedType;
        var matchCategory = !selectedCategory || card.dataset.category === selectedCategory;
        var show = matchQuery && matchYear && matchType && matchCategory;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }
    [input, year, type, category].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (source) {
    ready(function () {
      var video = document.getElementById('movie-player');
      var layer = document.getElementById('play-layer');
      if (!video || !source) {
        return;
      }
      var hls = null;
      var loaded = false;
      function attach() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function play() {
        attach();
        if (layer) {
          layer.classList.add('hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
      if (layer) {
        layer.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (layer && video.currentTime === 0) {
          layer.classList.remove('hidden');
        }
      });
      video.addEventListener('click', function () {
        if (!loaded) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    bindMenus();
    bindSearchForms();
    bindHero();
    bindFilters();
  });
})();

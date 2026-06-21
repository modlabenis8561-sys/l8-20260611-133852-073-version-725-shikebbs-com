(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var activate = function (index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        activate(activeIndex + 1);
      }, 5600);
    }
  }

  var filterInput = document.querySelector('[data-card-filter]');
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
        card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchStatus = document.querySelector('[data-search-status]');
  var data = window.SEARCH_MOVIES || [];
  var createCard = function (movie) {
    var tags = movie.tags.slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster" href="' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-tag">' + escapeHtml(movie.type) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-list">' + tags + '</div>' +
      '</div>' +
      '</article>';
  };
  var renderSearch = function (query) {
    if (!searchResults || !searchInput || !data.length) {
      return;
    }
    var value = (query || '').trim().toLowerCase();
    var results = data.filter(function (movie) {
      return !value || movie.search.indexOf(value) !== -1;
    }).slice(0, 120);
    searchResults.innerHTML = results.map(createCard).join('');
    if (searchStatus) {
      searchStatus.textContent = value ? '搜索结果：' + results.length : '热门内容';
    }
  };
  if (searchForm && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    if (initial) {
      renderSearch(initial);
    }
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(searchInput.value);
    });
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var streamUrl = source ? source.getAttribute('src') : '';
    var button = wrap.querySelector('[data-play-button]');
    if (!video || !streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    var start = function () {
      if (button) {
        button.hidden = true;
      }
      var played = video.play();
      if (played && typeof played.catch === 'function') {
        played.catch(function () {
          if (button) {
            button.hidden = false;
          }
        });
      }
    };
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.hidden = true;
      }
    });
    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.hidden = false;
      }
    });
  });
})();

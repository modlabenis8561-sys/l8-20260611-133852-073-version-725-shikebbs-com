(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileNav() {
        var button = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.dataset.slide || 0));
                play();
            });
        });
        play();
    }

    function setupFilters() {
        var grid = document.querySelector('.filterable-grid');
        if (!grid) {
            return;
        }
        var keyword = document.querySelector('.grid-filter-keyword');
        var type = document.querySelector('.grid-filter-type');
        var year = document.querySelector('.grid-filter-year');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        function apply() {
            var q = normalize(keyword && keyword.value);
            var t = normalize(type && type.value);
            var y = normalize(year && year.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.tags
                ].join(' '));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && normalize(card.dataset.type) !== t) {
                    ok = false;
                }
                if (y && normalize(card.dataset.year) !== y) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
            });
        }
        [keyword, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.player-cover');
            if (!video || !cover) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var attached = false;
            function attach() {
                if (attached || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            function start() {
                attach();
                player.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
            cover.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (!attached || video.paused) {
                    start();
                }
            });
        });
    }

    function cardHtml(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="./' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">',
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="play-dot">▶</span>',
            '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p class="movie-meta">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>',
            '<p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var results = document.querySelector('.search-results');
        var input = document.querySelector('.search-page-input');
        var summary = document.querySelector('.search-summary');
        var defaultSection = document.querySelector('.search-default-section');
        if (!results || !window.SEARCH_ITEMS) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }
        function render(q) {
            q = normalize(q);
            results.innerHTML = '';
            if (!q) {
                if (summary) {
                    summary.textContent = '输入关键词后查看匹配内容。';
                }
                if (defaultSection) {
                    defaultSection.style.display = '';
                }
                return;
            }
            var matched = window.SEARCH_ITEMS.filter(function (item) {
                return normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    (item.tags || []).join(' '),
                    item.oneLine
                ].join(' ')).indexOf(q) !== -1;
            }).slice(0, 120);
            if (summary) {
                summary.textContent = matched.length ? '以下内容与关键词相关。' : '暂未找到匹配内容，可尝试更换关键词。';
            }
            if (defaultSection) {
                defaultSection.style.display = 'none';
            }
            results.innerHTML = matched.map(cardHtml).join('');
        }
        render(query);
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
})();

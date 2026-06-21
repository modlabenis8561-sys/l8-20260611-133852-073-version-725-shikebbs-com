(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupBackTop() {
        var button = document.querySelector('[data-back-top]');

        if (!button) {
            return;
        }

        button.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
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
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }

                show(index);
                play();
            });
        });

        if (slides.length > 1) {
            play();
        }
    }

    function textMatches(value, query) {
        return String(value || '').toLowerCase().indexOf(query) !== -1;
    }

    function setupLocalSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));

        inputs.forEach(function (input) {
            var target = document.querySelector(input.getAttribute('data-target'));

            if (!target) {
                return;
            }

            var cards = Array.prototype.slice.call(target.querySelectorAll('[data-search-card]'));

            input.addEventListener('input', function () {
                var query = input.value.trim().toLowerCase();

                cards.forEach(function (card) {
                    var haystack = card.getAttribute('data-search') || '';
                    card.hidden = query.length > 0 && !textMatches(haystack, query);
                });
            });
        });
    }

    function setupGlobalSearch() {
        var panel = document.querySelector('[data-search-panel]');

        if (!panel) {
            return;
        }

        var target = document.querySelector(panel.getAttribute('data-target'));
        var keywordInput = panel.querySelector('[data-global-search]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');

        if (!target || !keywordInput || !yearSelect || !typeSelect) {
            return;
        }

        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-search-card]'));

        function applyFilters() {
            var keyword = keywordInput.value.trim().toLowerCase();
            var year = yearSelect.value;
            var type = typeSelect.value;

            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var keywordMatch = !keyword || textMatches(haystack, keyword);
                var yearMatch = !year || cardYear === year;
                var typeMatch = !type || cardType.indexOf(type) !== -1;

                card.hidden = !(keywordMatch && yearMatch && typeMatch);
            });
        }

        keywordInput.addEventListener('input', applyFilters);
        yearSelect.addEventListener('change', applyFilters);
        typeSelect.addEventListener('change', applyFilters);
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-start');
            var source = player.getAttribute('data-source');
            var hlsInstance = null;
            var isLoaded = false;

            if (!video || !button || !source) {
                return;
            }

            function playVideo() {
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            function attachSource() {
                if (isLoaded) {
                    playVideo();
                    return;
                }

                isLoaded = true;
                video.controls = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            player.classList.remove('is-playing');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', playVideo, { once: true });
                } else {
                    video.src = source;
                    playVideo();
                }
            }

            function start(event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                player.classList.add('is-playing');
                attachSource();
            }

            button.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (!isLoaded || video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            player.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    start(event);
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupBackTop();
        setupHeroSlider();
        setupLocalSearch();
        setupGlobalSearch();
        setupPlayers();
    });
})();

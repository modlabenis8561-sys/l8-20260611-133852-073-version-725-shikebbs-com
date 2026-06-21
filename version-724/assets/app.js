(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5000);
        show(0);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function filterCards(input, scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
        var empty = scope.querySelector("[data-empty-result]");
        var keyword = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle("hidden-card", !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (input) {
            var scope = document.querySelector(input.getAttribute("data-local-filter")) || document;
            input.addEventListener("input", function () {
                filterCards(input, scope);
            });
            filterCards(input, scope);
        });
    }

    function initSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (query) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = "./search.html";
                }
            });
        });
        var searchInput = document.querySelector("[data-search-page-input]");
        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q") || "";
            if (queryValue) {
                searchInput.value = queryValue;
            }
            var scope = document.querySelector(searchInput.getAttribute("data-local-filter")) || document;
            filterCards(searchInput, scope);
        }
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-button");
            var state = document.querySelector(player.getAttribute("data-state-target"));
            var stream = player.getAttribute("data-stream");
            var hlsInstance = null;
            if (!video || !stream) {
                return;
            }
            function setState(text) {
                if (state) {
                    state.textContent = text || "";
                }
            }
            function attach() {
                if (video.getAttribute("data-ready") === "1") {
                    return Promise.resolve();
                }
                video.setAttribute("data-ready", "1");
                setState("正在载入播放");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    return Promise.resolve();
                }
                video.src = stream;
                return Promise.resolve();
            }
            function start(event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                attach().then(function () {
                    player.classList.add("is-playing");
                    var attempt = video.play();
                    if (attempt && typeof attempt.then === "function") {
                        attempt.then(function () {
                            setState("");
                        }).catch(function () {
                            setState("点击视频区域继续播放");
                        });
                    } else {
                        setState("");
                    }
                });
            }
            if (button) {
                button.addEventListener("click", start);
            }
            player.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                start(event);
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
                setState("");
            });
            video.addEventListener("error", function () {
                setState("播放暂时不可用，请稍后重试");
                if (hlsInstance && hlsInstance.destroy) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initSearchForms();
        initFilters();
        initPlayers();
    });
})();

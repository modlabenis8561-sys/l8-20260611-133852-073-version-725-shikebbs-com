function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupSearchPage();
});

function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    if (!button) {
        return;
    }

    button.addEventListener("click", function () {
        document.body.classList.toggle("menu-open");
    });
}

function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length === 0) {
        return;
    }

    var current = 0;
    var timer = null;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            start();
        });
    });

    showSlide(0);
    start();
}

function setupSearchPage() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel) {
        return;
    }

    var input = panel.querySelector("[data-search-input]");
    var type = panel.querySelector("[data-search-type]");
    var region = panel.querySelector("[data-search-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input && initial) {
        input.value = initial;
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function apply() {
        var query = normalize(input ? input.value : "");
        var typeValue = normalize(type ? type.value : "");
        var regionValue = normalize(region ? region.value : "");
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search") || card.textContent);
            var cardType = normalize(card.getAttribute("data-type"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var ok = true;

            if (query && haystack.indexOf(query) === -1) {
                ok = false;
            }

            if (typeValue && cardType !== typeValue) {
                ok = false;
            }

            if (regionValue && cardRegion !== regionValue) {
                ok = false;
            }

            card.style.display = ok ? "" : "none";

            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("visible", visible === 0);
        }
    }

    [input, type, region].forEach(function (control) {
        if (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        }
    });

    apply();
}

function initMoviePlayer(sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-play-button]");
    var hls = null;
    var prepared = false;

    if (!video || !sourceUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        prepared = true;
    }

    function start() {
        prepare();
        video.controls = true;

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            start();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (!prepared) {
            start();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

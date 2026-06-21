(function () {
    const body = document.body;
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            body.classList.toggle("is-menu-open");
        });

        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                body.classList.remove("is-menu-open");
            });
        });
    }

    document.querySelectorAll(".poster-img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-hidden-image");
        });
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", play);
        show(0);
        play();
    });

    document.querySelectorAll("[data-movie-search]").forEach(function (input) {
        const root = input.closest("main") || document;
        const cards = Array.from(root.querySelectorAll(".filter-card"));
        const empty = root.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, "");
        }

        function filter() {
            const query = normalize(input.value);
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                const matched = !query || haystack.includes(query);
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        input.addEventListener("input", filter);
        filter();
    });
})();

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
                document.body.classList.toggle("no-scroll", panel.classList.contains("is-open"));
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (input && input.value.trim() === "") {
                    event.preventDefault();
                    input.focus();
                }
            });
        });

        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
                    card.classList.toggle("is-hidden", value !== "" && keywords.indexOf(value) === -1);
                });
            });
        });

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            if (slides.length <= 1) {
                return;
            }
            var current = 0;
            var timer = null;
            function activate(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle("is-active", position === current);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle("is-active", position === current);
                });
            }
            function start() {
                timer = window.setInterval(function () {
                    activate(current + 1);
                }, 5200);
            }
            dots.forEach(function (dot, position) {
                dot.addEventListener("click", function () {
                    if (timer) {
                        window.clearInterval(timer);
                    }
                    activate(position);
                    start();
                });
            });
            start();
        });

        var resultRoot = document.querySelector("[data-search-results]");
        if (resultRoot && window.SITE_MOVIES) {
            var pageInput = document.querySelector("[data-search-page-input]");
            var title = document.querySelector("[data-search-title]");
            var desc = document.querySelector("[data-search-desc]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (pageInput) {
                pageInput.value = initialQuery;
            }
            function escapeHtml(value) {
                return String(value)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
            }
            function createCard(movie) {
                return [
                    "<article class=\"movie-card\">",
                    "<a class=\"movie-cover\" href=\"" + escapeHtml(movie.href) + "\">",
                    "<img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                    "<span class=\"movie-region\">" + escapeHtml(movie.region) + "</span>",
                    "<span class=\"movie-play\">▶</span>",
                    "</a>",
                    "<div class=\"movie-card-body\">",
                    "<a class=\"movie-title\" href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a>",
                    "<p>" + escapeHtml(movie.oneLine) + "</p>",
                    "<div class=\"movie-meta\"><a href=\"category/" + escapeHtml(movie.categorySlug) + ".html\">" + escapeHtml(movie.categoryName) + "</a><span>" + escapeHtml(movie.year) + "</span></div>",
                    "<div class=\"movie-tags\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
                    "</div>",
                    "</article>"
                ].join("");
            }
            function renderSearch(query) {
                var q = query.trim().toLowerCase();
                var list = window.SITE_MOVIES.filter(function (movie) {
                    if (!q) {
                        return true;
                    }
                    return movie.keywords.toLowerCase().indexOf(q) !== -1;
                }).slice(0, 160);
                resultRoot.innerHTML = list.map(createCard).join("");
                if (title) {
                    title.textContent = q ? "搜索结果" : "影视片库";
                }
                if (desc) {
                    desc.textContent = q ? "已根据关键词呈现匹配影片。" : "输入关键词后可快速筛选影片。";
                }
            }
            renderSearch(initialQuery);
            if (pageInput) {
                pageInput.addEventListener("input", function () {
                    renderSearch(pageInput.value);
                });
            }
        }
    });
})();

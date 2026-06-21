import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const button = $('[data-menu-toggle]');
  const panel = $('[data-mobile-panel]');
  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
  });
}

function initHero() {
  const hero = $('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  if (slides.length <= 1) {
    return;
  }

  let current = 0;
  let timer = null;

  const activate = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => activate(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      activate(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function initPlayer() {
  $$('[data-player]').forEach((player) => {
    const video = $('video[data-hls]', player);
    const button = $('[data-start-button]', player);
    const message = $('[data-player-message]', player);
    let hls = null;
    let prepared = false;

    if (!video || !button) {
      return;
    }

    const showMessage = (text) => {
      if (!message) {
        return;
      }
      message.hidden = false;
      message.textContent = text;
    };

    const prepare = () => {
      if (prepared) {
        return;
      }
      prepared = true;

      const source = video.dataset.hls;
      video.controls = true;

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage('网络加载异常，播放器正在尝试重新连接。');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage('媒体解码异常，播放器正在尝试恢复。');
            hls.recoverMediaError();
          } else {
            showMessage('当前浏览器无法继续播放该视频源。');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        showMessage('当前浏览器不支持 HLS 播放，请更换浏览器后重试。');
      }
    };

    const startPlayback = async () => {
      prepare();
      try {
        await video.play();
        player.classList.add('is-playing');
        if (message) {
          message.hidden = true;
        }
      } catch (error) {
        showMessage('已加载播放源，请再次点击播放按钮开始观看。');
      }
    };

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', () => {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function initCategoryFilter() {
  const panel = $('[data-filter-panel]');
  const list = $('[data-card-list]');
  if (!panel || !list) {
    return;
  }

  const keywordInput = $('.js-card-filter', panel);
  const yearSelect = $('.js-card-filter-year', panel);
  const regionSelect = $('.js-card-filter-region', panel);
  const typeSelect = $('.js-card-filter-type', panel);
  const cards = $$('.movie-card', list);
  const count = $('[data-filter-count]');
  const empty = $('[data-empty-state]');

  const normalize = (value) => (value || '').trim().toLowerCase();

  const filter = () => {
    const keyword = normalize(keywordInput ? keywordInput.value : '');
    const year = yearSelect ? yearSelect.value : '';
    const region = regionSelect ? regionSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category,
        card.dataset.tags
      ].join(' '));
      const okKeyword = !keyword || haystack.includes(keyword);
      const okYear = !year || card.dataset.year === year;
      const okRegion = !region || card.dataset.region === region;
      const okType = !type || card.dataset.type === type;
      const ok = okKeyword && okYear && okRegion && okType;
      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `显示 ${visible} 部影片`;
    }
    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  [keywordInput, yearSelect, regionSelect, typeSelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', filter);
      control.addEventListener('change', filter);
    }
  });

  filter();
}

function movieCardTemplate(movie) {
  const safe = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));

  return `
    <article class="movie-card">
      <a class="poster-link" href="${safe(movie.url)}" aria-label="观看${safe(movie.title)}">
        <img src="${safe(movie.coverNum)}.jpg" alt="${safe(movie.title)}" loading="lazy">
        <span class="play-dot">▶</span>
        <span class="card-category">${safe(movie.category)}</span>
        <span class="duration">${safe(movie.duration)}</span>
      </a>
      <div class="movie-card-body">
        <a href="${safe(movie.url)}" class="movie-title">${safe(movie.title)}</a>
        <p>${safe(movie.oneLine)}</p>
        <div class="movie-meta">
          <span>⭐ ${safe(movie.rating)}</span>
          <span>${safe(movie.region)}</span>
          <span>${safe(movie.year)}</span>
        </div>
      </div>
    </article>
  `;
}

function initSearchPage() {
  const page = $('[data-search-page]');
  if (!page || !window.MOVIE_INDEX) {
    return;
  }

  const form = $('[data-search-form]', page);
  const results = $('[data-search-results]', page);
  const summary = $('[data-search-summary]', page);
  const moreWrap = $('[data-search-more-wrap]', page);
  const moreButton = $('[data-search-more]', page);
  const params = new URLSearchParams(window.location.search);
  let matched = [];
  let shown = 0;
  const batch = 48;

  const fillFromUrl = () => {
    ['q', 'type', 'category', 'year', 'region'].forEach((name) => {
      const field = form.elements[name];
      if (field && params.has(name)) {
        field.value = params.get(name) || '';
      }
    });
  };

  const getFormData = () => ({
    q: (form.elements.q.value || '').trim().toLowerCase(),
    type: form.elements.type.value,
    category: form.elements.category.value,
    year: form.elements.year.value,
    region: form.elements.region.value
  });

  const search = () => {
    const data = getFormData();
    matched = window.MOVIE_INDEX.filter((movie) => {
      const haystack = [
        movie.title,
        movie.oneLine,
        movie.summary,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      const okQ = !data.q || haystack.includes(data.q);
      const okType = !data.type || movie.type === data.type;
      const okCategory = !data.category || movie.category === data.category;
      const okYear = !data.year || movie.year === data.year;
      const okRegion = !data.region || movie.region === data.region;
      return okQ && okType && okCategory && okYear && okRegion;
    });
    shown = 0;
    results.innerHTML = '';
    renderMore();
    const keyword = data.q ? `“${form.elements.q.value}”` : '全部影片';
    summary.textContent = `${keyword} 共找到 ${matched.length} 部影片`;
  };

  const renderMore = () => {
    const next = matched.slice(shown, shown + batch);
    results.insertAdjacentHTML('beforeend', next.map(movieCardTemplate).join(''));
    shown += next.length;
    moreWrap.hidden = shown >= matched.length;
  };

  fillFromUrl();
  search();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextParams = new URLSearchParams(new FormData(form));
    for (const [key, value] of Array.from(nextParams.entries())) {
      if (!value) {
        nextParams.delete(key);
      }
    }
    const nextUrl = `${window.location.pathname}?${nextParams.toString()}`;
    window.history.replaceState({}, '', nextUrl);
    search();
  });

  moreButton.addEventListener('click', renderMore);
}

function initImageFallback() {
  $$('img').forEach((image) => {
    const mark = () => image.classList.add('is-missing-image');
    image.addEventListener('error', mark, { once: true });
    if (image.complete && image.naturalWidth === 0) {
      mark();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHero();
  initPlayer();
  initCategoryFilter();
  initSearchPage();
  initImageFallback();
});

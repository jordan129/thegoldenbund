(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // state per target (food/drinks)
  const state = {
    food: { idx: 0, pages: [] },
    drinks: { idx: 0, pages: [] },
  };

  // fullscreen state
  const fs = {
    open: false,
    target: null,   // 'food' | 'drinks'
  };

  const lightbox = $("#sm-lightbox");
  const fsImg = $("#sm-lightbox-img");
  const fsPrev = $("#sm-fs-prev");
  const fsNext = $("#sm-fs-next");
  const fsIndicator = $("#sm-fs-indicator");

  function parsePages(imgEl) {
    try {
      return JSON.parse(imgEl.getAttribute("data-pages") || "[]");
    } catch (e) {
      return [];
    }
  }

  function setFade(imgEl, nextSrc) {
    imgEl.classList.add("is-fading");
    window.setTimeout(() => {
      imgEl.src = nextSrc;
      imgEl.classList.remove("is-fading");
    }, 120);
  }

  function setThumbActive(target, idx) {
    const wrap = $(`.sm-thumbs[data-target="${target}"]`);
    if (!wrap) return;
    $$(".sm-thumb", wrap).forEach((b) => b.classList.remove("is-active"));
    const btn = $(`.sm-thumb[data-index="${idx}"]`, wrap);
    if (btn) btn.classList.add("is-active");
  }

  function setViewer(target, idx) {
    const imgEl = $(`.sm-viewer-img[data-target="${target}"]`);
    if (!imgEl) return;

    const pages = state[target].pages;
    if (!pages.length) return;

    const clamped = (idx + pages.length) % pages.length;
    state[target].idx = clamped;

    setFade(imgEl, pages[clamped]);
    setThumbActive(target, clamped);

    // if fullscreen is open and this is the active target, sync it too
    if (fs.open && fs.target === target) {
      fsImg.src = pages[clamped];
      setFsIndicator(target);
    }
  }

  function setFsIndicator(target) {
    const pages = state[target].pages;
    const idx = state[target].idx;
    if (!fsIndicator) return;
    if (!pages.length) {
      fsIndicator.textContent = "";
      return;
    }
    fsIndicator.textContent = `page ${idx + 1} / ${pages.length}`;
  }

  function openFullscreen(target) {
    if (!lightbox || !fsImg) return;
    fs.open = true;
    fs.target = target;

    document.body.classList.add("sm-fs-open");
    lightbox.classList.add("is-open");

    const pages = state[target].pages;
    fsImg.src = pages[state[target].idx] || "";
    setFsIndicator(target);
  }

  function closeFullscreen() {
    if (!lightbox) return;
    fs.open = false;
    fs.target = null;

    document.body.classList.remove("sm-fs-open");
    lightbox.classList.remove("is-open");
  }

  function step(target, delta) {
    const pages = state[target].pages;
    if (!pages.length) return;
    setViewer(target, state[target].idx + delta);
  }

  function bindTarget(target) {
    const imgEl = $(`.sm-viewer-img[data-target="${target}"]`);
    if (!imgEl) return;

    state[target].pages = parsePages(imgEl);
    state[target].idx = 0;

    // arrows
    $$(`.sm-menu-arrow[data-target="${target}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("sm-menu-arrow-left")) step(target, -1);
        else step(target, +1);
      });
    });

    // thumbs
    const thumbs = $(`.sm-thumbs[data-target="${target}"]`);
    if (thumbs) {
      $$(".sm-thumb", thumbs).forEach((b) => {
        b.addEventListener("click", () => {
          const idx = Number(b.getAttribute("data-index") || "0");
          setViewer(target, idx);
        });
      });
    }

    // click image -> fullscreen
    imgEl.addEventListener("click", () => openFullscreen(target));
  }

  // init
  bindTarget("food");
  bindTarget("drinks");

  // fullscreen arrows
  if (fsPrev) fsPrev.addEventListener("click", () => fs.target && step(fs.target, -1));
  if (fsNext) fsNext.addEventListener("click", () => fs.target && step(fs.target, +1));

  // close fullscreen on click outside image
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target === fsImg) closeFullscreen();
    });
  }

  // keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (!fs.open) return;

    if (e.key === "Escape") closeFullscreen();
    if (e.key === "ArrowLeft" && fs.target) step(fs.target, -1);
    if (e.key === "ArrowRight" && fs.target) step(fs.target, +1);
  });

  // basic swipe in fullscreen
  let x0 = null;
  if (lightbox) {
    lightbox.addEventListener("touchstart", (e) => {
      if (!fs.open) return;
      x0 = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
      if (!fs.open || x0 == null || !fs.target) return;
      const x1 = e.changedTouches[0].clientX;
      const dx = x1 - x0;
      x0 = null;
      if (Math.abs(dx) < 40) return;
      if (dx > 0) step(fs.target, -1);
      else step(fs.target, +1);
    }, { passive: true });
  }
})();
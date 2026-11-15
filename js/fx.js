// Motion and gestures: reveals, the scroll-driven work and awards sections,
// skills in orbit, the flipping ID card, the intro video and the cursor.

const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');

function reveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach((n) => io.observe(n));
}

function navHighlight() {
  const links = [...document.querySelectorAll('#nav-links a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.dataset.for === e.target.id));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  links.forEach((a) => io.observe(document.getElementById(a.dataset.for)));
}

// A small red dot and ring that follow the cursor and grow over links.
function cursor() {
  const cur = document.querySelector('.cur');
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, running = false;
  const step = () => {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    cur.style.transform = `translate(${x}px, ${y}px)`;
    running = Math.abs(tx - x) + Math.abs(ty - y) > 0.2;
    if (running) requestAnimationFrame(step);
  };
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cur.classList.add('on');
    cur.classList.toggle('big', !!e.target.closest('a, button, .idcard, summary, .elem'));
    if (!running) { running = true; requestAnimationFrame(step); }
  });
  document.addEventListener('pointerleave', () => cur.classList.remove('on'));
}

// How far a pinned section has been scrolled through, from 0 to 1.
const progress = (sec) => {
  const r = sec.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
};

// Work: the section stays pinned while scrolling steps through the projects.
function workScroll() {
  const sec = document.getElementById('work');
  const items = [...sec.querySelectorAll('.work-item')];
  const cards = [...sec.querySelectorAll('.wcard')];
  const num = sec.querySelector('.work-count b');
  const bar = sec.querySelector('.work-count i');
  const n = items.length;
  sec.style.height = `${n * 85 + 100}vh`;
  let shown = -1;
  return () => {
    const p = progress(sec);
    bar.style.transform = `scaleX(${p})`;
    const idx = Math.min(n - 1, Math.floor(p * n));
    if (idx === shown) return;
    shown = idx;
    num.textContent = pad(idx + 1);
    items.forEach((it, i) => {
      it.classList.toggle('on', i === idx);
      it.classList.toggle('past', i < idx);
    });
    cards.forEach((card, i) => {
      const d = i - idx;
      card.style.zIndex = 50 - Math.abs(d);
      if (d < 0) {
        card.style.transform = 'translate(-40px, -130%) rotate(-10deg)';
        card.style.opacity = 0;
      } else {
        card.style.transform = `translate(${d * 22}px, ${d * -16}px) scale(${1 - d * 0.06})`;
        card.style.opacity = d > 2 ? 0 : 1 - d * 0.38;
      }
    });
  };
}

// Awards: vertical scrolling moves the certification cards sideways.
function awardsScroll() {
  const sec = document.getElementById('awards');
  const pin = sec.querySelector('.aw-pin');
  const track = sec.querySelector('.aw-track');
  const hint = sec.querySelector('.aw-hint');
  let travel = 0;
  const measure = () => {
    travel = Math.max(0, track.scrollWidth - pin.clientWidth);
    sec.style.height = `${innerHeight + travel}px`;
  };
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  return () => {
    const p = progress(sec);
    track.style.transform = `translateX(${-p * travel}px)`;
    hint.style.opacity = p > 0.9 ? 0 : 1;
  };
}

function timeline() {
  const line = document.querySelector('.timeline');
  const fill = line.querySelector('.timeline-fill');
  const items = [...line.querySelectorAll('.tl')];
  return () => {
    const r = line.getBoundingClientRect();
    const mark = innerHeight * 0.66;
    fill.style.transform = `scaleY(${clamp((mark - r.top) / r.height, 0, 1)})`;
    items.forEach((it) => it.classList.toggle('lit', it.getBoundingClientRect().top + 10 < mark));
  };
}

// Skill chips circle the photo on tilted rings, passing behind and in front of it.
function orbit() {
  const box = document.querySelector('.orbit');
  const chips = [...box.querySelectorAll('.chip')];
  const rings = chips.map((_, i) => ({
    ring: i % 2,
    phase: (i / chips.length) * Math.PI * 2,
    speed: (i % 2 ? -1 : 1) * (0.16 + (i % 3) * 0.03),
    lift: ((i * 37) % 100) / 100,
  }));
  const place = (t) => {
    const w = box.clientWidth, h = box.clientHeight;
    chips.forEach((chip, i) => {
      const o = rings[i];
      const a = o.phase + t * o.speed;
      const rx = w * (o.ring ? 0.46 : 0.34);
      const x = Math.cos(a) * rx;
      // Kept below the face, so a chip passing in front never covers it.
      const y = (o.lift * 0.56 - 0.14) * h + Math.sin(a) * h * 0.05;
      const depth = Math.sin(a); // > 0 means in front of the photo
      chip.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${0.86 + depth * 0.14})`;
      chip.style.zIndex = depth > 0 ? 3 : 1;
      chip.style.opacity = 0.62 + (depth + 1) * 0.19;
    });
  };
  place(0);
  if (reduceMotion) return;
  let visible = false, raf = 0;
  const loop = (now) => {
    place(now / 1000);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  }).observe(box);
  window.addEventListener('resize', () => place(performance.now() / 1000));
}

function idCard() {
  const card = document.querySelector('.idcard');
  const flip = () => card.classList.toggle('flipped');
  card.addEventListener('click', flip);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
}

// The intro video opens in a window over the page and stops when closed.
function introVideo(c) {
  const modal = document.getElementById('intro-modal');
  const media = document.getElementById('intro-media');
  const btn = document.getElementById('play-intro');
  if (!c.intro?.file && !c.intro?.embed) { btn.remove(); return; }
  const open = () => {
    if (c.intro.file) {
      const v = document.createElement('video');
      v.src = c.intro.file;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      media.replaceChildren(v);
    } else {
      const f = document.createElement('iframe');
      f.src = c.intro.embed;
      f.title = 'Intro video';
      f.allow = 'autoplay; encrypted-media; fullscreen';
      f.allowFullscreen = true;
      media.replaceChildren(f);
    }
    document.querySelector('.bubble video')?.pause();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  };
  const close = () => {
    modal.hidden = true;
    media.replaceChildren();
    document.querySelector('.bubble video')?.play().catch(() => {});
    document.body.classList.remove('modal-open');
    btn.focus();
  };
  btn.addEventListener('click', open);
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
}

// The first screen's photo is alive: a short clip of the walk-in, drawn as a
// cut-out so the giant name stays visible behind it. It plays once without
// sound and holds its last frame; the button replays it with sound.
function heroLive(c) {
  const cv = document.querySelector('.hero-live');
  const hear = document.getElementById('hear');
  if (!cv) return;
  if (reduceMotion) { cv.remove(); hear.remove(); return; }
  const stage = cv.parentElement;
  const v = document.createElement('video');
  v.src = c.photos.heroVideo;
  v.muted = true;
  v.playsInline = true;
  v.preload = 'auto';
  const ctx = cv.getContext('2d');
  const buf = document.createElement('canvas');
  const bctx = buf.getContext('2d', { willReadFrequently: true });
  let w = 0, h = 0, out = null;
  const draw = () => {
    if (!v.videoWidth) return;
    if (!w) {
      w = v.videoWidth / 2; h = v.videoHeight;
      buf.width = w * 2; buf.height = h;
      cv.width = w; cv.height = h;
      out = ctx.createImageData(w, h);
    }
    bctx.drawImage(v, 0, 0);
    const src = bctx.getImageData(0, 0, w * 2, h).data;
    const dst = out.data;
    for (let y = 0; y < h; y++) {
      let i = y * w * 8, j = y * w * 4;
      for (let x = 0; x < w; x++, i += 4, j += 4) {
        dst[j] = src[i]; dst[j + 1] = src[i + 1]; dst[j + 2] = src[i + 2];
        const m = (src[i + w * 4] - 48) * 1.45; // tighten the matte's soft edge
        dst[j + 3] = m < 0 ? 0 : m > 255 ? 255 : m;
      }
    }
    ctx.putImageData(out, 0, 0);
    stage.classList.add('live');
  };
  const tick = () => {
    draw();
    if (!v.paused && !v.ended) next();
  };
  const next = () => (v.requestVideoFrameCallback ? v.requestVideoFrameCallback(tick) : requestAnimationFrame(tick));
  v.addEventListener('play', next);
  v.addEventListener('seeked', draw);
  v.addEventListener('ended', () => { draw(); hear.classList.remove('playing'); hear.textContent = 'Hear me say hi'; });
  const start = (sound) => {
    v.muted = !sound;
    v.currentTime = 0;
    v.play().catch(() => {});
  };
  hear.addEventListener('click', () => {
    if (hear.classList.contains('playing')) { v.pause(); v.muted = true; hear.classList.remove('playing'); hear.textContent = 'Hear me say hi'; return; }
    hear.classList.add('playing');
    hear.textContent = 'Stop';
    start(true);
  });
  // Starts once the page has opened, so the walk-in is seen from its first step.
  const begin = () => (document.body.classList.contains('ready') ? setTimeout(() => start(false), 700) : setTimeout(begin, 120));
  begin();
  document.getElementById('play-intro')?.addEventListener('click', () => { v.pause(); hear.classList.remove('playing'); hear.textContent = 'Hear me say hi'; });
}

export function initFx(c) {
  reveals();
  navHighlight();
  idCard();
  introVideo(c);
  heroLive(c);
  orbit();
  if (finePointer && !reduceMotion) cursor();

  const updates = [workScroll(), awardsScroll(), timeline()];
  let queued = false;
  const run = () => { queued = false; updates.forEach((u) => u()); };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  run();
}

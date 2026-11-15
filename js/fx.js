// Motion: reveals, the slow-motion first-screen video, revolving skills,
// the revolving 3D projects and the sideways achievements.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
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
  io.observe(document.getElementById('hero'));
}

// How far a pinned section has been scrolled through, from 0 to 1.
const progress = (sec) => {
  const r = sec.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
};

// First screen: the walk-in clip plays in slow motion as a cut-out, so only
// the person is drawn and the page shows around them. It repeats quietly.
function heroLive(c) {
  const cv = document.querySelector('.hero-live');
  if (!cv) return;
  if (reduceMotion) { cv.remove(); return; }
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
        const m = (src[i + w * 4] - 120) * 2.4; // pull the matte in so no light edge shows on the dark page
        dst[j + 3] = m < 0 ? 0 : m > 255 ? 255 : m;
      }
    }
    ctx.putImageData(out, 0, 0);
    stage.classList.add('live');
  };
  const tick = () => { draw(); if (!v.paused && !v.ended) next(); };
  const next = () => (v.requestVideoFrameCallback ? v.requestVideoFrameCallback(tick) : requestAnimationFrame(tick));
  const snd = document.getElementById('hero-sound');
  const pauseBtn = document.getElementById('hero-pause');
  let held = false, timer = 0; // held: paused by the visitor
  const setSound = (on) => {
    v.muted = !on;
    snd.classList.toggle('on', on);
    snd.querySelector('span').textContent = on ? 'Sound on' : 'Sound off';
    snd.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
  };
  const setHeld = (on) => {
    held = on;
    pauseBtn.classList.toggle('paused', on);
    pauseBtn.setAttribute('aria-label', on ? 'Play video' : 'Pause video');
  };
  const start = () => {
    clearTimeout(timer);
    v.currentTime = 0;
    v.play().then(() => stage.classList.remove('fade')).catch(() => {});
  };
  v.addEventListener('play', next);
  // Hold the last frame, fade, and begin again.
  v.addEventListener('ended', () => {
    draw();
    timer = setTimeout(() => { if (held) return; stage.classList.add('fade'); timer = setTimeout(start, 600); }, 2600);
  });
  snd.addEventListener('click', () => {
    const on = v.muted;
    setSound(on);
    if (on) { setHeld(false); start(); }
  });
  pauseBtn.addEventListener('click', () => {
    setHeld(!held);
    if (held) { clearTimeout(timer); v.pause(); } else if (v.ended) start(); else v.play().catch(() => {});
  });
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { v.pause(); setSound(false); }
    else if (!held && v.paused && !v.ended && v.currentTime > 0) v.play().catch(() => {});
  }, { threshold: 0.2 }).observe(stage);
  const begin = () => (document.body.classList.contains('ready') ? setTimeout(start, 500) : setTimeout(begin, 120));
  begin();
}

// About: the talking intro plays silently until asked to play with sound.
function introVideo() {
  const btn = document.getElementById('intro-sound');
  if (!btn) return;
  const v = btn.parentElement.querySelector('video');
  const label = btn.querySelector('span');
  const set = (on) => {
    btn.classList.toggle('on', on);
    label.textContent = on ? 'Mute' : 'Play with sound';
    v.muted = !on;
    v.loop = !on;
  };
  btn.addEventListener('click', () => {
    const on = !btn.classList.contains('on');
    set(on);
    if (on) v.currentTime = 0;
    v.play().catch(() => {});
  });
  v.addEventListener('ended', () => { set(false); v.play().catch(() => {}); });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) v.play().catch(() => {});
    else { v.pause(); if (btn.classList.contains('on')) set(false); }
  }, { threshold: 0.25 }).observe(v);
}

// Skills revolve around the photo on two tilted rings, passing behind and in front.
function orbit() {
  const box = document.querySelector('.orbit');
  const chips = [...box.querySelectorAll('.chip')];
  const n = chips.length;
  const place = (t) => {
    const w = box.clientWidth, h = box.clientHeight;
    chips.forEach((chip, i) => {
      const outer = i % 2;
      const a = (i / n) * Math.PI * 2 + t * (outer ? -0.22 : 0.3);
      const rx = w * (outer ? 0.46 : 0.31);
      const ry = h * (outer ? 0.2 : 0.12);
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry + h * (outer ? 0.12 : 0.2);
      const depth = Math.sin(a); // > 0 means in front of the photo
      chip.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${0.84 + depth * 0.16})`;
      chip.style.zIndex = depth > 0 ? 3 : 1;
      chip.style.opacity = 0.45 + (depth + 1) * 0.275;
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

// Projects: while the section is pinned, scrolling spins a 3D ring of cards so
// each project faces the front in turn; at the end the ring opens out into a row.
function projectsScroll() {
  const sec = document.getElementById('projects');
  const scene = sec.querySelector('.pj-scene');
  const cards = [...sec.querySelectorAll('.pcard')];
  const num = sec.querySelector('.pj-count b');
  const n = cards.length;
  const step = 360 / n;
  sec.style.height = `${n * 70 + 150}vh`;
  let cw = 0, ch = 0, gap = 0, radius = 0, cols = n, scale = 1;
  const measure = () => {
    cw = cards[0].offsetWidth; ch = cards[0].offsetHeight;
    gap = Math.min(28, innerWidth * 0.02);
    cols = innerWidth < 900 ? 2 : n;
    const rows = Math.ceil(n / cols);
    const rowW = cols * cw + (cols - 1) * gap, rowH = rows * ch + (rows - 1) * gap;
    scale = Math.min(1, (scene.clientWidth - 8) / rowW, (scene.clientHeight - 8) / rowH);
    radius = Math.max(cw * 0.95, (cw / 2) / Math.tan(Math.PI / n) + 40);
  };
  measure();
  window.addEventListener('resize', measure);
  return () => {
    const p = progress(sec);
    const spin = clamp(p / 0.72, 0, 1);          // turning through the projects
    const f = ease(clamp((p - 0.76) / 0.2, 0, 1)); // opening out into a row
    const rot = spin * (n - 1) * step;
    const idx = Math.round(rot / step);
    num.textContent = f > 0.5 ? 'All' : pad(idx + 1);
    const rows = Math.ceil(n / cols);
    cards.forEach((card, i) => {
      let a = i * step - rot;
      a = ((a + 180) % 360 + 360) % 360 - 180; // shortest way round
      const col = i % cols, row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * (cw + gap) * f;
      const y = (row - (rows - 1) / 2) * (ch + gap) * f;
      const r = radius * (1 - f);
      const s = 1 + (scale - 1) * f;
      const facing = Math.cos((a * Math.PI) / 180);
      card.style.transform = `translate(-50%, -50%) scale(${s}) translateZ(${-r}px) translate(${x}px, ${y}px) rotateY(${a * (1 - f)}deg) translateZ(${r}px)`;
      card.style.opacity = f + (1 - f) * clamp(0.25 + (facing + 1) * 0.5, 0, 1);
      card.style.zIndex = Math.round(facing * 10) + 10;
      card.classList.toggle('front', f > 0.9 || Math.abs(a) < step / 2);
    });
  };
}

// Achievements: vertical scrolling moves the cards sideways.
function achievementsScroll() {
  const sec = document.getElementById('achievements');
  const pin = sec.querySelector('.aw-pin');
  const track = sec.querySelector('.aw-track');
  let travel = 0;
  const measure = () => {
    travel = Math.max(0, track.scrollWidth - pin.clientWidth);
    sec.style.height = `${innerHeight + travel}px`;
  };
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  return () => { track.style.transform = `translateX(${-progress(sec) * travel}px)`; };
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

// A soft light follows the pointer, and cards lean toward it.
function pointerLight() {
  if (reduceMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const glow = document.querySelector('.glow');
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, running = false;
  const step = () => {
    x += (tx - x) * 0.12; y += (ty - y) * 0.12;
    glow.style.transform = `translate(${x}px, ${y}px)`;
    running = Math.abs(tx - x) + Math.abs(ty - y) > 0.3;
    if (running) requestAnimationFrame(step);
  };
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    glow.classList.add('on');
    if (!running) { running = true; requestAnimationFrame(step); }
  });
  document.querySelectorAll('.cert, .stat, .video-frame').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

export function initFx(c) {
  reveals();
  navHighlight();
  heroLive(c);
  introVideo();
  orbit();
  pointerLight();
  const nav = document.querySelector('.nav');
  const bar = document.querySelector('.progress');
  const giant = document.querySelector('.giant');
  const updates = [projectsScroll(), achievementsScroll(), timeline(), () => {
    nav.classList.toggle('scrolled', scrollY > innerHeight * 0.7);
    bar.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
    if (scrollY < innerHeight) giant.style.setProperty('--shift', `${scrollY * 0.25}px`);
  }];
  let queued = false;
  const run = () => { queued = false; updates.forEach((u) => u()); };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  run();
}

// Motion and gestures: reveals, 3D tilt, magnetic buttons, cursor glow,
// the scroll-drawn timeline, counting stats and the draggable project row.

const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function reveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
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

// Cards lean toward the cursor.
function tilt() {
  document.querySelectorAll('.tilt').forEach((node) => {
    const target = node.querySelector('.tilt-in') || node;
    const base = target === node ? '' : 'rotate(5deg) ';
    const max = Number(node.dataset.tilt || 8);
    node.addEventListener('pointermove', (e) => {
      const r = node.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      target.style.transform = `${base}rotateY(${x * max * 2}deg) rotateX(${-y * max * 2}deg) scale(1.02)`;
    });
    node.addEventListener('pointerleave', () => { target.style.transform = ''; });
  });
}

// Buttons pull slightly toward the cursor.
function magnetic() {
  document.querySelectorAll('.magnetic').forEach((node) => {
    node.addEventListener('pointermove', (e) => {
      const r = node.getBoundingClientRect();
      node.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    node.addEventListener('pointerleave', () => { node.style.transform = ''; });
  });
}

function cursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, running = false;
  const step = () => {
    x += (tx - x) * 0.14;
    y += (ty - y) * 0.14;
    glow.style.transform = `translate(${x}px, ${y}px)`;
    running = Math.abs(tx - x) + Math.abs(ty - y) > 0.3;
    if (running) requestAnimationFrame(step);
  };
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    glow.style.opacity = 1;
    if (!running) { running = true; requestAnimationFrame(step); }
  });
  document.addEventListener('pointerleave', () => { glow.style.opacity = 0; });
}

// The red line fills as you scroll, lighting each job's marker when it passes.
function timeline() {
  const line = document.querySelector('.timeline');
  if (!line) return;
  const fill = line.querySelector('.timeline-fill');
  const items = [...line.querySelectorAll('.exp')];
  const update = () => {
    const r = line.getBoundingClientRect();
    const mark = innerHeight * 0.62;
    fill.style.transform = `scaleY(${clamp((mark - r.top) / r.height, 0, 1)})`;
    items.forEach((it) => it.classList.toggle('lit', it.getBoundingClientRect().top + 34 < mark));
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function countUp() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const text = e.target.firstChild;
      const end = Number(e.target.dataset.count);
      if (reduceMotion || !Number.isFinite(end)) return;
      const start = performance.now();
      const tick = (now) => {
        const p = clamp((now - start) / 1200, 0, 1);
        text.nodeValue = String(Math.round(end * (1 - (1 - p) ** 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat b[data-count]').forEach((n) => io.observe(n));
}

// Projects sit in a 3D row. Drag, swipe, click a side card, or use the arrows.
function projectFlow() {
  const flow = document.querySelector('.flow');
  if (!flow) return;
  const cards = [...flow.querySelectorAll('.pcard')];
  const dots = [...document.querySelectorAll('.flow-dots i')];
  const last = cards.length - 1;
  let pos = 0, target = 0, raf = 0, drag = null, moved = false;

  const render = () => {
    cards.forEach((card, i) => {
      const o = i - pos;
      const a = Math.abs(o);
      card.style.transform = `translate(-50%, -50%) translateX(${o * 64}%) translateZ(${-a * 260}px) rotateY(${clamp(o, -1.5, 1.5) * -36}deg)`;
      // Side cards stay solid and get darker, so text never shows through them.
      card.style.opacity = a > 2.5 ? 0 : 1;
      card.style.filter = `brightness(${Math.max(0.3, 1 - a * 0.45)})`;
      card.style.zIndex = 100 - Math.round(a * 10);
      card.style.pointerEvents = a > 2.5 ? 'none' : '';
      card.classList.toggle('active', a < 0.5);
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === Math.round(pos)));
  };
  const step = () => {
    pos += (target - pos) * (reduceMotion ? 1 : 0.13);
    if (Math.abs(target - pos) < 0.001) pos = target;
    render();
    raf = pos === target ? 0 : requestAnimationFrame(step);
  };
  const go = (t) => {
    target = clamp(t, 0, last);
    if (!raf) raf = requestAnimationFrame(step);
  };

  flow.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, start: target };
    moved = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 6 && !moved) {
      moved = true;
      flow.classList.add('dragging');
    }
    if (moved) go(drag.start - dx / (cards[0].offsetWidth * 0.64));
  });
  const release = () => {
    if (!drag) return;
    drag = null;
    flow.classList.remove('dragging');
    go(Math.round(target));
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  // A click on a side card brings it to the front; a drag never opens a link.
  flow.addEventListener('click', (e) => {
    const card = e.target.closest('.pcard');
    if (moved) { e.preventDefault(); return; }
    if (!card) return;
    const i = cards.indexOf(card);
    if (i !== Math.round(pos)) {
      e.preventDefault();
      go(i);
    }
  }, true);

  flow.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { go(Math.round(target) + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(Math.round(target) - 1); e.preventDefault(); }
  });
  document.querySelector('.flow-prev').addEventListener('click', () => go(Math.round(target) - 1));
  document.querySelector('.flow-next').addEventListener('click', () => go(Math.round(target) + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  pos = target = Math.min(1, last);
  render();
}

export function initFx() {
  reveals();
  navHighlight();
  timeline();
  countUp();
  projectFlow();
  if (finePointer && !reduceMotion) {
    tilt();
    magnetic();
    cursorGlow();
  }
}

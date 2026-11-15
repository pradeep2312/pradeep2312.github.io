// Builds the page from content.js. Motion lives in fx.js.

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const link = (href, text, cls) => {
  const a = el('a', cls, text);
  a.href = href;
  if (/^https?:/.test(href)) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  return a;
};

const section = (id, label) => {
  const s = el('section');
  s.id = id;
  if (label) s.dataset.label = label;
  return s;
};

const pad = (n) => String(n).padStart(2, '0');
const img = (src, alt, cls) => {
  const i = el('img', cls);
  i.src = src;
  i.alt = alt;
  i.draggable = false;
  return i;
};

// Section heading: a small numbered label and a large title.
const heading = (n, label, title) => {
  const h = el('header', 'head rv');
  const h2 = el('h2', 'title');
  const words = title.split(' ');
  const last = words.pop();
  h2.append(document.createTextNode(words.join(' ') + ' '), el('em', '', last));
  h.append(el('span', 'kicker', `${pad(n)} — ${label}`), h2);
  return h;
};

// Turns "grey *black* grey" into text with emphasised spans.
const marked = (text, cls) => {
  const p = el('p', cls);
  text.split('*').forEach((part, i) => p.append(i % 2 ? el('mark', '', part) : document.createTextNode(part)));
  return p;
};

function hero(c) {
  const s = section('hero');
  const giant = el('div', 'giant', c.giantName);
  giant.setAttribute('aria-hidden', 'true');

  const stage = el('div', 'hero-stage');
  stage.append(el('div', 'spot'), img(c.photos.hero, `Portrait of ${c.name}`, 'hero-photo'));
  if (c.photos.heroVideo) {
    const cv = el('canvas', 'hero-live');
    cv.setAttribute('aria-hidden', 'true');
    stage.append(cv);
  }

  const copy = el('div', 'hero-copy');
  const h1 = el('h1', 'headline');
  h1.setAttribute('aria-label', c.headline.join(' '));
  c.headline.forEach((t, i) => {
    const line = el('span', 'line');
    const inner = el('span', '', t);
    if (i === c.headline.length - 1) { inner.className = 'hot'; inner.append(el('i', 'dot', '.')); }
    line.append(inner);
    h1.append(line);
  });
  copy.append(el('span', 'who-name', c.name), h1, el('p', 'hero-line', c.heroLine));

  const side = el('div', 'hero-side');
  side.append(link('#projects', 'Explore work', 'btn solid'), link('#contact', 'Let’s talk', 'btn'));

  // Stage lighting: a beam from the top corner, smoke behind and in front, a lit floor.
  const back = el('canvas', 'smoke back');
  const front = el('canvas', 'smoke front');
  [back, front].forEach((cv) => cv.setAttribute('aria-hidden', 'true'));
  s.append(el('div', 'beam'), giant, back, el('div', 'floor'), stage, front, copy, side);
  if (c.photos.heroVideo) {
    const ctl = el('div', 'hero-ctl');
    const snd = el('button', 'ctl');
    snd.type = 'button';
    snd.id = 'hero-sound';
    snd.setAttribute('aria-label', 'Turn sound on');
    snd.append(el('i', 'ico-sound'), el('span', '', 'Sound off'));
    const pause = el('button', 'ctl round');
    pause.type = 'button';
    pause.id = 'hero-pause';
    pause.setAttribute('aria-label', 'Pause video');
    pause.append(el('i', 'ico-pause'));
    ctl.append(snd, pause);
    s.append(ctl);
  }
  return s;
}

function about(c) {
  const s = section('about', 'About');
  const media = el('div', 'about-media rv');
  if (c.intro?.file) {
    const frame = el('div', 'video-frame');
    const v = el('video');
    v.src = c.intro.file;
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.preload = 'metadata';
    const btn = el('button', 'sound');
    btn.type = 'button';
    btn.id = 'intro-sound';
    btn.append(el('i'), el('span', '', 'Play with sound'));
    frame.append(v, btn);
    media.append(frame);
  } else media.append(img(c.photos.about, '', 'about-still'));

  const body = el('div', 'about-body');
  body.append(heading(1, 'About', 'About me'), marked(c.statement, 'statement rv'), el('p', 'sub rv', c.about));
  const stats = el('div', 'stats rv');
  c.stats.forEach((st) => {
    const t = el('div', 'stat');
    t.append(el('b', '', st.value), el('span', '', st.label));
    stats.append(t);
  });
  body.append(stats);
  s.append(media, body);
  return s;
}

function skills(c) {
  const s = section('skills', 'Skills');
  const names = c.skillGroups.flatMap((g) => g.items.map((it) => it[1]));
  const orbit = el('div', 'orbit rv');
  orbit.append(el('div', 'ring r1'), el('div', 'ring r2'), el('div', 'ring r3'), el('div', 'core'));
  names.forEach((n, i) => orbit.append(el('span', `word${i % 4 === 0 ? ' hot' : ''}`, n)));
  s.append(heading(2, 'Skills', 'What I work with'), orbit);
  return s;
}

function experience(c) {
  const s = section('experience', 'Experience');
  const line = el('div', 'timeline');
  line.append(el('div', 'timeline-fill'));
  c.experience.forEach((job) => {
    const row = el('article', 'tl rv');
    row.append(el('span', 'period', job.period), el('h3', '', job.role), el('p', 'company', job.company));
    if (job.points?.length) {
      const ul = el('ul');
      job.points.forEach((pt) => ul.append(el('li', '', pt)));
      row.append(ul);
    }
    line.append(row);
  });
  s.append(heading(3, 'Experience', 'Where I’ve worked'), line);
  return s;
}

function projects(c) {
  const s = section('projects', 'Projects');
  const pin = el('div', 'pj-pin');
  const head = heading(4, 'Projects', 'Things I’ve built');
  const count = el('div', 'pj-count');
  count.append(el('b', '', '01'), el('span', '', `/ ${pad(c.featured.length)}`));
  head.append(count);

  const scene = el('div', 'pj-scene');
  const ring = el('div', 'pj-ring');
  c.featured.forEach((p, i) => {
    const card = el('article', `pcard${i % 2 ? ' light' : ''}`);
    const top = el('div', 'pcard-top');
    top.append(el('span', '', pad(i + 1)), el('span', '', p.tag));
    const fig = el('div', 'pcard-fig');
    fig.append(el('b', '', p.card.figure), el('span', '', p.card.label));
    const foot = el('div', 'pcard-foot');
    foot.append(el('span', '', p.tech.slice(0, 3).join(' · ')), link(p.live || p.code, p.live ? 'Open ↗' : 'Code ↗'));
    card.append(top, fig, el('h3', '', p.name), el('p', '', p.summary), foot);
    ring.append(card);
  });
  scene.append(ring);
  pin.append(head, scene);
  s.append(pin);
  return s;
}

function achievements(c) {
  const s = section('achievements', 'Achievements');
  const pin = el('div', 'aw-pin');
  const head = heading(5, 'Achievements', 'Certifications and education');
  const track = el('div', 'aw-track');
  c.certifications.forEach((ct, i) => {
    const card = el('article', `cert${i === 0 ? ' dark' : ''}`);
    card.append(el('span', 'cert-n', pad(i + 1)), el('h3', '', ct.title), el('p', '', ct.place));
    track.append(card);
  });
  c.education.forEach((ed) => {
    const card = el('article', 'cert edu');
    card.append(el('span', 'cert-n', 'Education'), el('h3', '', ed.title), el('p', '', ed.place));
    track.append(card);
  });
  pin.append(head, track);
  s.append(pin);
  return s;
}

function contact(c) {
  const s = section('contact', 'Contact');
  const links = el('div', 'cta rv');
  if (c.contact.email) links.append(link(`mailto:${c.contact.email}`, 'Email me', 'btn solid'));
  if (c.contact.linkedin) links.append(link(c.contact.linkedin, 'LinkedIn ↗', c.contact.email ? 'btn' : 'btn solid'));
  if (c.contact.github) links.append(link(c.contact.github, 'GitHub ↗', 'btn'));
  if (c.contact.resume) links.append(link(c.contact.resume, 'Résumé ↓', 'btn'));
  s.append(el('h2', 'title big rv', c.contact.heading.join(' ')), el('p', 'sub rv', c.contact.note), links,
    el('p', 'foot', `© ${new Date().getFullYear()} ${c.name}`));
  return s;
}

export function buildUI(c) {
  document.title = `${c.name} — ${c.role}`;
  document.querySelector('meta[name="description"]').content = c.tagline;
  document.getElementById('brand').textContent = c.name;
  const app = document.getElementById('app');
  const sections = [hero(c), about(c), skills(c), experience(c), projects(c), achievements(c), contact(c)];
  app.append(...sections);
  const nav = document.getElementById('nav-links');
  sections.filter((s) => s.dataset.label).forEach((s) => {
    const a = link(`#${s.id}`, s.dataset.label);
    a.dataset.for = s.id;
    nav.append(a);
  });
}

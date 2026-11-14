// Builds the page content from content.js. Motion and gestures live in fx.js.

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
const img = (src, alt, cls, lazy = true) => {
  const i = el('img', cls);
  i.src = src;
  i.alt = alt;
  i.draggable = false;
  if (lazy) i.loading = 'lazy';
  return i;
};
const kicker = (n, text) => el('div', 'kicker rv', `(${pad(n)}) — ${text}`);

// A two-line display headline; the last line is red.
const display = (lines, cls = '') => {
  const h = el('h2', `display rv ${cls}`.trim());
  lines.forEach((t, i) => h.append(el('span', i === lines.length - 1 ? 'red' : '', t)));
  return h;
};

// Turns "plain *red* plain" into text with red spans.
const marked = (text, cls) => {
  const p = el('p', cls);
  text.split('*').forEach((part, i) => p.append(i % 2 ? el('mark', '', part) : document.createTextNode(part)));
  return p;
};

function hero(c) {
  const s = section('hero');
  const copy = el('div', 'hero-copy');
  const hello = el('p', 'hello');
  hello.append(document.createTextNode('Hi, I’m '), el('b', '', c.name), document.createTextNode(' —'));
  const h1 = el('h1', 'headline');
  h1.setAttribute('aria-label', c.headline.join(' '));
  c.headline.forEach((t, i) => {
    const line = el('span', 'line');
    line.append(el('span', i === c.headline.length - 1 ? 'red' : '', t));
    h1.append(line);
  });
  const cta = el('div', 'cta');
  cta.append(link('#work', 'See my work ↘', 'btn solid'));
  const play = el('button', 'btn', '▶ Watch my intro');
  play.type = 'button';
  play.id = 'play-intro';
  cta.append(play);
  copy.append(hello, h1, el('p', 'lede', c.tagline), cta);

  const art = el('div', 'hero-art');
  const giant = el('div', 'giant');
  giant.setAttribute('aria-hidden', 'true');
  [...c.giantName].forEach((ch, i) => {
    const sp = el('span', '', ch);
    sp.style.transitionDelay = `${0.1 + i * 0.05}s`;
    giant.append(sp);
  });
  art.append(giant, img(c.photos.hero, `Portrait of ${c.name}`, 'hero-photo', false));
  s.append(copy, art);
  return s;
}

function idCard(c) {
  const card = el('div', 'idcard');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', 'ID card. Press Enter to flip it.');
  const inner = el('div', 'idcard-in');

  const front = el('div', 'face front');
  const photo = el('div', 'id-photo');
  photo.append(img(c.photos.journey, '', ''));
  front.append(el('div', 'id-top', 'Portfolio pass'), photo, el('b', '', c.name), el('span', '', c.role), el('em', '', 'Flip ↻'));

  const back = el('div', 'face back');
  const now = c.experience[0];
  [['Based in', c.location], ['Currently', now ? `${now.role}, ${now.company.split(' · ')[0]}` : c.role], ['Certified', c.certifications[0]?.title || ''], ['Focus', 'Microservices, React, GenAI']].forEach(([k, v]) => {
    const row = el('div', 'id-row');
    row.append(el('span', '', k), el('b', '', v));
    back.append(row);
  });
  back.append(el('div', 'barcode'), el('em', '', 'Flip ↻'));

  inner.append(front, back);
  card.append(el('div', 'strap'), inner);
  return card;
}

function about(c) {
  const s = section('about', 'About');
  const left = el('div', 'about-photo rv');
  left.append(el('div', 'blob'), img(c.photos.about, `${c.name}, seated`, ''), idCard(c));
  const right = el('div', 'about-copy');
  const tiles = el('div', 'tiles rv');
  [c.stats[0], c.stats[1], c.stats[3]].forEach((st) => {
    const t = el('div', 'tile');
    const m = st.value.match(/^([\d.]+)(.*)$/);
    const b = el('b');
    if (m) b.append(document.createTextNode(m[1]), el('i', '', m[2]));
    else b.textContent = st.value;
    t.append(b, el('span', '', st.label));
    tiles.append(t);
  });
  right.append(kicker(1, 'About me'), marked(c.statement, 'statement rv'), el('p', 'sub rv', c.about), tiles);
  s.append(left, right);
  return s;
}

function work(c) {
  const s = section('work', 'Work');
  const pin = el('div', 'work-pin');
  const left = el('div', 'work-left');
  const count = el('div', 'work-count');
  count.append(el('b', '', '01'), el('span', '', `/ ${pad(c.featured.length)}`), el('i'));
  const items = el('div', 'work-items');
  c.featured.forEach((p) => {
    const it = el('article', 'work-item');
    it.append(el('div', 'tag', p.tag), el('h3', '', p.name), el('p', '', p.summary));
    const tech = el('div', 'tech');
    p.tech.forEach((t) => tech.append(el('span', '', t)));
    it.append(tech);
    if (p.code) it.append(link(p.code, 'View on GitHub ↗', 'ghlink'));
    if (p.live) it.append(link(p.live, 'Live demo ↗', 'ghlink'));
    items.append(it);
  });
  left.append(el('div', 'kicker', '(02) — Selected work'), count, items);

  const stack = el('div', 'wstack');
  c.featured.forEach((p) => {
    const card = el('div', 'wcard');
    card.append(el('b', '', p.card.figure), el('span', '', p.card.label));
    const rows = el('ul');
    p.card.rows.forEach((r) => rows.append(el('li', '', r)));
    card.append(rows);
    stack.append(card);
  });

  const photo = el('div', 'work-photo');
  photo.append(img(c.photos.work, `${c.name} working on a laptop`, ''));
  pin.append(left, stack, photo);
  s.append(pin);
  return s;
}

function journey(c) {
  const s = section('journey', 'Journey');
  const left = el('div', 'journey-photo rv');
  const firstYear = (c.experience[c.experience.length - 1]?.period.match(/\d{4}/) || [''])[0];
  const year = el('div', 'year', firstYear);
  year.setAttribute('aria-hidden', 'true');
  left.append(year, img(c.photos.journey, `${c.name}, smiling`, ''));
  const right = el('div', 'journey-copy');
  const line = el('div', 'timeline');
  line.append(el('div', 'timeline-fill'));
  c.experience.forEach((x) => {
    const item = el('div', 'tl rv');
    item.append(el('span', 'period', x.period), el('h3', '', x.role), el('p', 'company', x.company));
    if (x.points?.length) {
      const d = el('details');
      d.append(el('summary', '', 'What I did'));
      const ul = el('ul');
      x.points.forEach((p) => ul.append(el('li', '', p)));
      d.append(ul);
      item.append(d);
    }
    line.append(item);
  });
  c.education.forEach((e) => {
    const item = el('div', 'tl rv');
    item.append(el('span', 'period', 'Education'), el('h3', '', e.title), el('p', 'company', e.place));
    line.append(item);
  });
  right.append(kicker(3, 'The journey so far'), display(c.journeyHeadline), line);
  s.append(left, right);
  return s;
}

function toolkit(c) {
  const s = section('toolkit', 'Toolkit');
  const top = el('div', 'tk-top');
  const headBox = el('div', 'tk-head');
  headBox.append(kicker(4, 'Toolkit'), display(['Everything', 'in orbit.']));
  const orbit = el('div', 'orbit');
  orbit.append(el('div', 'pulse'), el('div', 'pulse p2'), img(c.photos.hero, '', 'orbit-photo'));
  const names = c.skillGroups.flatMap((g) => g.items.map(([, name]) => name));
  names.filter((_, i) => i % 2 === 0).slice(0, 10).forEach((n) => orbit.append(el('span', 'chip', n)));
  top.append(headBox, orbit);

  const tableHead = el('div', 'table-head rv');
  tableHead.append(el('h3', '', 'The periodic table of what I use'));
  const legend = el('div', 'legend');
  c.skillGroups.forEach((g, gi) => {
    const l = el('span', `g${gi}`);
    l.append(el('i'), document.createTextNode(g.group));
    legend.append(l);
  });
  tableHead.append(legend);
  const table = el('div', 'ptable');
  let n = 0;
  c.skillGroups.forEach((g, gi) => g.items.forEach(([sym, name]) => {
    n += 1;
    const cell = el('div', `elem g${gi} rv`);
    cell.style.transitionDelay = `${(n % 8) * 0.04}s`;
    cell.append(el('small', '', pad(n)), el('b', '', sym), el('span', '', name));
    cell.title = `${name} — ${g.group}`;
    table.append(cell);
  }));

  const ticker = el('div', 'ticker');
  ticker.setAttribute('aria-hidden', 'true');
  const run = el('div', 'ticker-run');
  for (let k = 0; k < 2; k++) names.forEach((t) => run.append(el('span', '', t), el('i', '', '✦')));
  ticker.append(run);

  s.append(top, tableHead, table, ticker);
  return s;
}

function awards(c) {
  const s = section('awards', 'Awards');
  const pin = el('div', 'aw-pin');
  const head = el('div', 'aw-head');
  const tiles = el('div', 'aw-tiles');
  [...c.stats.slice(0, 3), { value: String(c.certifications.length), label: 'Certifications' }].forEach((st) => {
    const t = el('div', 'aw-tile');
    t.append(el('b', '', st.value), el('span', '', st.label));
    tiles.append(t);
  });
  head.append(el('div', 'kicker', '(05) — Proof of work'), tiles);
  const track = el('div', 'aw-track');
  c.certifications.forEach((x, i) => {
    const card = el('div', 'cert');
    card.append(el('small', '', `Certification ${pad(i + 1)}`), el('b', '', x.title), el('span', '', x.place), el('i', '', '✓'));
    track.append(card);
  });
  pin.append(head, track, el('div', 'aw-hint', 'Keep scrolling →'));
  s.append(pin);
  return s;
}

function repoRow(r, notes = {}) {
  const row = link(r.html_url, '', 'repo');
  row.append(el('b', '', r.name), el('span', '', r.description || notes[r.name] || ''), el('em', '', r.language || ''), el('i', '', '↗'));
  return row;
}

async function loadRepos(sectionEl, list, username, skip, notes) {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const repos = (await res.json())
      .filter((r) => !r.fork && !r.archived && r.size > 0 && !skip.has(r.name.toLowerCase()) && !r.name.toLowerCase().endsWith('.github.io'))
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 6);
    if (!repos.length) throw new Error('no repositories to show');
    list.replaceChildren(...repos.map((r) => repoRow(r, notes)));
    sectionEl.hidden = false;
  } catch (err) {
    console.warn('Could not load GitHub projects:', err);
  }
}

function more(c) {
  const s = section('more');
  s.hidden = true; // shown once the list has loaded
  const list = el('div', 'repos');
  s.append(el('div', 'kicker', '(06) — More on GitHub'), list);
  if (c.githubUsername) loadRepos(s, list, c.githubUsername, new Set(c.featured.map((p) => (p.repo || p.name).toLowerCase())), c.repoNotes || {});
  return s;
}

function contact(c) {
  const s = section('contact', 'Contact');
  const k = c.contact;
  const links = el('div', 'cta rv');
  if (k.email) links.append(link('mailto:' + k.email, 'Email me', 'btn solid'));
  if (k.linkedin) links.append(link(k.linkedin, 'LinkedIn ↗', `btn${k.email ? '' : ' solid'}`));
  if (k.github) links.append(link(k.github, 'GitHub ↗', 'btn'));
  if (k.resume) links.append(link(k.resume, 'Download résumé', 'btn'));
  s.append(kicker(7, 'Contact'), display(k.heading, 'huge'), el('p', 'note rv', k.note), links, el('div', 'foot', `© ${new Date().getFullYear()} ${c.name}`));
  return s;
}

export function buildUI(c) {
  document.title = `${c.name} — ${c.role}`;
  document.querySelector('meta[name="description"]').content = c.tagline;

  const brand = document.getElementById('brand');
  brand.append(document.createTextNode(c.giantName), el('i'));

  // Loader: the name rises in letter by letter.
  const loaderName = document.getElementById('loader-name');
  [...c.name].forEach((ch, i) => {
    const span = el('span', '', ch);
    span.style.animationDelay = `${i * 0.035}s`;
    loaderName.append(span);
  });

  const sections = [hero(c), about(c), work(c), journey(c), toolkit(c), awards(c), more(c), contact(c)];
  document.getElementById('app').append(...sections);

  const nav = document.getElementById('nav-links');
  sections.filter((s) => s.dataset.label).forEach((s) => {
    const a = link('#' + s.id, s.dataset.label);
    a.dataset.for = s.id;
    nav.append(a);
  });
}

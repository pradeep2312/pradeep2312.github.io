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

const chips = (items) => {
  const wrap = el('div', 'chips');
  items.forEach((t) => wrap.append(el('span', 'chip', t)));
  return wrap;
};

const head = (kicker, title, centered = true) => {
  const h = el('div', `head reveal${centered ? ' center' : ''}`);
  h.append(el('div', 'kicker', kicker), el('h2', '', title), el('div', 'rule'));
  return h;
};

function hero(c) {
  const s = section('hero');
  const copy = el('div', 'hero-copy');
  copy.append(el('div', 'kicker', `${c.role} • ${c.location}`));
  const name = el('h1', 'name');
  name.setAttribute('aria-label', c.name);
  (c.nameLines || [c.name]).forEach((t) => {
    const line = el('span', 'line');
    line.append(el('span', '', t));
    name.append(line);
  });
  copy.append(name);
  if (c.focus?.length) {
    const focus = el('div', 'focus');
    c.focus.forEach((t, i) => {
      if (i) focus.append(el('i', '', '/'));
      focus.append(document.createTextNode(t));
    });
    copy.append(focus);
  }
  copy.append(el('p', '', c.tagline));
  const cta = el('div', 'cta');
  cta.append(link('#projects', 'Explore my work', 'btn primary magnetic'), link('#contact', 'Get in touch', 'btn magnetic'));
  copy.append(cta);

  const art = el('div', 'hero-art');
  const frame = el('div', 'frame tilt');
  frame.dataset.tilt = '7';
  const inner = el('div', 'frame-in');
  if (c.photo) {
    const img = el('img');
    img.src = c.photo;
    img.alt = `Portrait of ${c.name}`;
    inner.append(img);
  }
  frame.append(inner);
  const t1 = el('div', 'tag t1');
  t1.append(el('b', '', '● '), document.createTextNode(c.experience[0] ? `Now at ${c.experience[0].company.split(' · ')[0]}` : c.role));
  const t2 = el('div', 'tag t2');
  t2.append(document.createTextNode('Claude Certified '), el('b', '', 'Architect'));
  art.append(frame, t1, t2);

  s.append(copy, art, el('div', 'scroll-cue', 'Scroll ↓'));
  return s;
}

function stats(c) {
  const s = section('stats');
  const strip = el('div', 'stats panel reveal');
  c.stats.forEach((st) => {
    const d = el('div', 'stat');
    const b = el('b');
    // Number in white, its unit or sign in red.
    const m = st.value.match(/^([\d.]+)(.*)$/);
    if (m) {
      b.append(document.createTextNode(m[1]), el('em', '', m[2]));
      b.dataset.count = m[1];
    } else {
      b.textContent = st.value;
    }
    d.append(b, el('span', '', st.label));
    strip.append(d);
  });
  s.append(strip);
  return s;
}

function about(c) {
  const s = section('about', 'About');
  s.append(head('Who I am', 'About me', false));
  const grid = el('div', 'about');
  const card = el('div', 'about-card panel reveal');
  c.about.forEach((p) => card.append(el('p', '', p)));
  card.append(el('div', 'label', 'Core toolkit'), chips(c.skills));
  grid.append(card);
  if (c.photo) {
    const fig = el('figure', 'photo-card reveal tilt');
    fig.style.margin = '0';
    fig.dataset.tilt = '10';
    const inner = el('div', 'tilt-in');
    const img = el('img');
    img.src = c.photo;
    img.alt = c.name;
    img.loading = 'lazy';
    const cap = el('figcaption');
    cap.append(el('b', '', c.name), document.createTextNode(c.role));
    inner.append(img, cap);
    fig.append(inner);
    grid.append(fig);
  }
  s.append(grid);
  return s;
}

function experience(c) {
  const s = section('experience', 'Experience');
  s.append(head('Career path', 'Experience'));
  const line = el('div', 'timeline');
  line.append(el('div', 'timeline-fill'));
  c.experience.forEach((x) => {
    const card = el('article', 'exp panel reveal');
    const h = el('div', 'exp-head');
    h.append(el('h3', '', x.role), el('span', 'period', x.period));
    card.append(h, el('div', 'company', x.company));
    if (x.points?.length) {
      const ul = el('ul');
      x.points.forEach((p) => ul.append(el('li', '', p)));
      card.append(ul);
    }
    line.append(card);
  });
  s.append(line);
  return s;
}

function projects(c) {
  const s = section('projects', 'Projects');
  s.append(head('Featured work', 'Projects'));
  const flow = el('div', 'flow reveal');
  flow.tabIndex = 0;
  flow.setAttribute('aria-label', 'Featured projects. Use the arrow keys to move between them.');
  c.featured.forEach((p, i) => {
    const card = el('article', 'pcard');
    const inner = el('div', 'pcard-in');
    const shot = el('div', 'pshot');
    if (p.image) {
      const img = el('img');
      img.src = p.image;
      img.alt = `${p.name} screenshot`;
      img.loading = 'lazy';
      img.draggable = false;
      shot.append(img);
    }
    shot.append(el('span', 'num', pad(i + 1)));
    const body = el('div', 'pbody');
    body.append(el('h3', '', p.name), el('p', '', p.summary));
    if (p.tech?.length) body.append(chips(p.tech));
    const links = el('div', 'links');
    if (p.code) links.append(link(p.code, 'View code ↗'));
    if (p.live) links.append(link(p.live, 'Live demo ↗'));
    body.append(links);
    inner.append(shot, body);
    card.append(inner);
    flow.append(card);
  });
  const ui = el('div', 'flow-ui');
  const prev = el('button', 'flow-prev', '←');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous project');
  const next = el('button', 'flow-next', '→');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next project');
  const dots = el('div', 'flow-dots');
  c.featured.forEach(() => dots.append(el('i')));
  ui.append(prev, dots, next);
  s.append(flow, ui, el('div', 'hint', 'Drag, swipe or use the arrows'));
  return s;
}

function skills(c) {
  const s = section('skills', 'Skills');
  s.append(head('What I work with', 'Technical skills'));
  const grid = el('div', 'skills');
  c.skillGroups.forEach((g) => g.items.forEach((name) => {
    const row = el('div', 'skill panel reveal');
    row.append(el('b', '', name), el('span', '', g.group));
    grid.append(row);
  }));
  s.append(grid);
  return s;
}

function credentials(c) {
  const s = section('credentials');
  s.append(head('Proof of work', 'Credentials'));
  const grid = el('div', 'creds');
  [['Certifications', c.certifications], ['Education', c.education]].forEach(([title, items]) => {
    if (!items?.length) return;
    const box = el('div', 'cred panel reveal');
    box.append(el('div', 'label', title));
    items.forEach((it) => {
      const row = el('div', 'cred-row');
      row.append(el('b', '', it.title), el('span', '', it.place));
      box.append(row);
    });
    grid.append(box);
  });
  s.append(grid);
  return s;
}

function repoCard(r, notes = {}) {
  const card = r.html_url ? link(r.html_url, '', 'repo panel') : el('div', 'repo panel');
  card.append(el('h3', '', r.name), el('p', '', r.description || notes[r.name] || ''));
  const meta = el('div', 'meta');
  if (r.language) {
    const lang = el('span');
    lang.append(el('i'), document.createTextNode(r.language));
    meta.append(lang);
  }
  if (r.stargazers_count) meta.append(el('span', '', `★ ${r.stargazers_count}`));
  card.append(meta);
  return card;
}

async function loadRepos(sectionEl, grid, username, skip, notes) {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const repos = (await res.json())
      .filter((r) => !r.fork && !r.archived && r.size > 0 && !skip.has(r.name.toLowerCase()) && !r.name.toLowerCase().endsWith('.github.io'))
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 8);
    if (!repos.length) throw new Error('no repositories to show');
    grid.replaceChildren(...repos.map((r) => repoCard(r, notes)));
    sectionEl.hidden = false;
  } catch (err) {
    console.warn('Could not load GitHub projects:', err);
  }
}

function repos(c) {
  const s = section('more');
  s.hidden = true; // shown once the list has loaded
  s.append(head('Open source', 'More on GitHub'));
  const grid = el('div', 'repo-grid');
  s.append(grid);
  if (c.githubUsername) loadRepos(s, grid, c.githubUsername, new Set(c.featured.map((p) => (p.repo || p.name).toLowerCase())), c.repoNotes || {});
  return s;
}

function contact(c) {
  const s = section('contact', 'Contact');
  const k = c.contact;
  const wrap = el('div', 'reveal');
  wrap.append(el('div', 'kicker', 'Get in touch'), el('h2', '', k.heading.replace(/\.$/, '')), el('p', 'note', k.note));
  const links = el('div', 'cta');
  if (k.email) links.append(link('mailto:' + k.email, 'Email me', 'btn primary magnetic'));
  if (k.linkedin) links.append(link(k.linkedin, 'LinkedIn ↗', `btn magnetic${k.email ? '' : ' primary'}`));
  if (k.github) links.append(link(k.github, 'GitHub ↗', 'btn magnetic'));
  if (k.resume) links.append(link(k.resume, 'Résumé ↓', 'btn magnetic'));
  wrap.append(links);
  s.append(wrap, el('div', 'foot', `© ${new Date().getFullYear()} ${c.name}`));
  return s;
}

export function buildUI(c) {
  document.title = `${c.name} — ${c.role}`;
  document.querySelector('meta[name="description"]').content = c.tagline;
  document.documentElement.style.setProperty('--accent', c.theme.accent);
  document.documentElement.style.setProperty('--accent2', c.theme.accent2);

  const brand = document.getElementById('brand');
  brand.append(el('b', '', c.name[0]), document.createTextNode(c.name.slice(1) + '.'));

  // Loader: the name rises in letter by letter.
  const loaderName = document.getElementById('loader-name');
  [...c.name].forEach((ch, i) => {
    const span = el('span', '', ch);
    span.style.animationDelay = `${i * 0.035}s`;
    loaderName.append(span);
  });

  const sections = [hero(c), stats(c), about(c), experience(c), projects(c), skills(c), credentials(c), repos(c), contact(c)];
  document.getElementById('app').append(...sections);

  const nav = document.getElementById('nav-links');
  sections.filter((s) => s.dataset.label).forEach((s) => {
    const a = link('#' + s.id, s.dataset.label);
    a.dataset.for = s.id;
    nav.append(a);
  });

  return { sections };
}

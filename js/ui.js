// Builds the page content from content.js. No 3D code here.

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
  s.dataset.label = label;
  return s;
};

const pad = (n) => String(n).padStart(2, '0');

const chips = (items) => {
  const wrap = el('div', 'chips');
  items.forEach((t) => wrap.append(el('span', 'chip', t)));
  return wrap;
};

function hero(c) {
  const s = section('hero', 'Home');
  const top = el('div', 'hero-top reveal');
  top.append(el('div', 'eyebrow', `${c.role}${c.location ? ' — ' + c.location : ''}`));
  top.append(el('h1', '', c.tagline));
  s.append(top);

  const bottom = el('div');
  const giant = el('div', 'giant reveal', c.shortName || c.name.split(' ')[0]);
  giant.setAttribute('aria-label', c.name);
  bottom.append(giant);

  const index = el('div', 'hero-index reveal');
  [['about', 'About'], ['experience', 'Experience'], ['featured', 'Projects'], ['contact', 'Contact']].forEach(([id, label], i) => {
    const a = link('#' + id, '');
    a.append(el('b', '', pad(i + 1)), el('span', '', label));
    index.append(a);
  });
  bottom.append(index, el('div', 'scroll-cue', 'Scroll to enter ↓'));
  s.append(bottom);
  return s;
}

function about(c) {
  const s = section('about', 'About');
  const grid = el('div', 'about-grid');
  const left = el('div', 'reveal');
  left.append(el('div', 'eyebrow', '01 — About'), el('h2', '', c.name));
  const right = el('div', 'about-copy panel reveal');
  right.style.padding = '28px 30px';
  c.about.forEach((p) => right.append(el('p', '', p)));
  if (c.skills?.length) right.append(chips(c.skills));
  grid.append(left, right);
  s.append(grid);

  if (c.stats?.length) {
    const stats = el('div', 'stats reveal');
    c.stats.forEach((st) => {
      const d = el('div', 'stat');
      d.append(el('b', '', st.value), el('span', '', st.label));
      stats.append(d);
    });
    s.append(stats);
  }

  const creds = el('div', 'creds');
  [['Education', c.education], ['Certifications', c.certifications]].forEach(([title, items]) => {
    if (!items?.length) return;
    const box = el('div', 'cred panel reveal');
    box.append(el('div', 'eyebrow', title));
    items.forEach((it) => {
      const row = el('div', 'cred-row');
      row.append(el('b', '', it.title), el('span', '', it.place));
      box.append(row);
    });
    creds.append(box);
  });
  if (creds.children.length) s.append(creds);
  return s;
}

function experience(c) {
  const s = section('experience', 'Experience');
  const wrap = el('div', 'exp-wrap');
  const head = el('div', 'reveal');
  head.append(el('div', 'eyebrow', '02 — Experience'), el('h2', '', 'Where I’ve worked'));
  const list = el('div', 'exp-list');
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
    list.append(card);
  });
  wrap.append(head, list);
  s.append(wrap);
  return s;
}

function featured(c) {
  const s = section('featured', 'Projects');
  const head = el('div', 'reveal');
  head.append(el('div', 'eyebrow', '03 — Featured projects'), el('h2', '', 'Selected work'));
  const grid = el('div', 'feat-grid');
  c.featured.forEach((p, i) => {
    const card = el('article', 'feat panel reveal');
    const shot = el('div', 'feat-shot');
    if (p.image) {
      const img = el('img');
      img.src = p.image;
      img.alt = `${p.name} screenshot`;
      img.loading = 'lazy';
      shot.append(img);
    } else {
      shot.append(el('span', 'num', pad(i + 1)));
    }
    const body = el('div', 'feat-body');
    body.append(el('h3', '', p.name), el('p', '', p.summary));
    if (p.tech?.length) body.append(chips(p.tech));
    const links = el('div', 'links');
    if (p.code) links.append(link(p.code, 'Code ↗'));
    if (p.live) links.append(link(p.live, 'Live ↗'));
    if (links.children.length) body.append(links);
    card.append(shot, body);
    grid.append(card);
  });
  s.append(head, grid);
  return s;
}

function repoCard(r, i, notes = {}) {
  const card = r.html_url ? link(r.html_url, '', 'repo panel') : el('div', 'repo panel');
  card.append(el('span', 'idx', pad(i + 1)), el('h3', '', r.name));
  card.append(el('p', '', r.description || notes[r.name] || ''));
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

async function loadRepos(grid, username, skip, notes) {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const repos = (await res.json())
      .filter((r) => !r.fork && !r.archived && r.size > 0 && !skip.has(r.name.toLowerCase()))
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 9);
    if (repos.length) grid.replaceChildren(...repos.map((r, i) => repoCard(r, i, notes)));
  } catch (err) {
    console.warn('Could not load GitHub projects:', err);
  }
}

function repos(c) {
  const s = section('repos', 'More');
  const head = el('div', 'reveal');
  head.append(el('div', 'eyebrow', '04 — All projects'), el('h2', '', 'More on GitHub'));
  const grid = el('div', 'repo-grid reveal');
  // Shown until the live list arrives (or when no GitHub username is set).
  for (let i = 0; i < 6; i++) grid.append(repoCard({ name: 'Repository name', description: 'Pulled live from GitHub once a username is set.' }, i));
  s.append(head, grid);
  if (c.githubUsername) loadRepos(grid, c.githubUsername, new Set(c.featured.map((p) => (p.repo || p.name).toLowerCase())), c.repoNotes || {});
  return s;
}

function contact(c) {
  const s = section('contact', 'Contact');
  const k = c.contact;
  const wrap = el('div', 'reveal');
  wrap.append(el('div', 'eyebrow', '05 — Contact'), el('h2', '', k.heading), el('p', 'note', k.note));
  const links = el('div', 'contact-links');
  if (k.email) links.append(link('mailto:' + k.email, 'Email me', 'btn primary'));
  if (k.github) links.append(link(k.github, 'GitHub ↗', 'btn'));
  if (k.linkedin) links.append(link(k.linkedin, 'LinkedIn ↗', 'btn'));
  if (k.resume) links.append(link(k.resume, 'Résumé ↓', 'btn'));
  if (!links.children.length) links.append(el('span', 'btn', 'Contact links go here'));
  wrap.append(links);
  s.append(wrap, el('div', 'foot', `© ${new Date().getFullYear()} ${c.name}`));
  return s;
}

export function buildUI(c) {
  document.title = `${c.name} — ${c.role}`;
  document.querySelector('meta[name="description"]').content = c.tagline;
  document.documentElement.style.setProperty('--accent', c.theme.accent);
  document.documentElement.style.setProperty('--accent2', c.theme.accent2);

  const initials = c.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('brand-mark').textContent = initials;
  document.getElementById('brand-name').textContent = c.name;
  document.getElementById('loader-mark').textContent = c.name.toUpperCase();

  const app = document.getElementById('app');
  const sections = [hero(c), about(c), experience(c), featured(c), repos(c), contact(c)];
  app.append(...sections);

  const nav = document.getElementById('nav-links');
  const dots = document.getElementById('dots');
  const navLinks = new Map();
  sections.forEach((s) => {
    const dot = link('#' + s.id, '');
    dot.setAttribute('aria-label', s.dataset.label);
    dots.append(dot);
    const entry = [dot];
    if (!['hero', 'repos'].includes(s.id)) {
      const a = link('#' + s.id, s.dataset.label);
      nav.append(a);
      entry.push(a);
    }
    navLinks.set(s.id, entry);
  });

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        reveal.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((n) => reveal.observe(n));

  const active = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((links, id) => links.forEach((a) => a.classList.toggle('active', id === e.target.id)));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach((s) => active.observe(s));

  return { sections };
}

/* =============================================================
   GRACE WANG PORTFOLIO — app.js
   Handles:
   • Lucide icons
   • Hobby strip icons
   • Page navigation (SPA routing)
   • Reveal-on-scroll observer
   • Project / Blog / Library filters
   • Blog posts & library reviews fetched from API
   • Admin login (JWT), add post, add review, logout
   • Contact form (sends to backend)
   ============================================================= */

'use strict';

// ================================================================
// CONFIG — change BASE_URL to your deployed backend URL in prod
// ================================================================
const isLocal =
    location.hostname === "localhost" ||
    location.hostname.startsWith("127.");

const BASE_URL = isLocal
    ? "http://localhost:3000"
    : "";
// ================================================================
// LUCIDE ICONS
// ================================================================
lucide.createIcons();

// ================================================================
// HOBBY STRIP — inject lucide icons into each item
// ================================================================
const hobbyIconMap = {
  origami:'triangle', hiking:'mountain', reading:'book-open',
  ai:'cpu', music:'music', nature:'leaf', policy:'scroll', research:'microscope'
};
document.querySelectorAll('.hobby-item').forEach(el => {
  const key = el.dataset.icon;
  if (hobbyIconMap[key]) {
    el.insertAdjacentHTML('afterbegin',
      `<i data-lucide="${hobbyIconMap[key]}" style="width:12px;height:12px;flex-shrink:0;"></i>`);
  }
});
lucide.createIcons();

// ================================================================
// PAGE NAVIGATION (SPA)
// ================================================================
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('up'); });
}, { threshold: .06, rootMargin: '0px 0px -28px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    document.querySelectorAll('#page-' + id + ' .reveal').forEach(el => revealObs.observe(el));
    lucide.createIcons();
  }, 60);
  // Lazy-load data when switching to blog or library
  if (id === 'blog') loadPosts();
  if (id === 'library') loadReviews();
  if (id === 'about') loadAbout();
  if (id === 'projects') loadProjects();
}

// Init active nav
document.querySelectorAll('[data-page="home"]').forEach(a => a.classList.add('active'));

// ================================================================
// API HELPERS
// ================================================================
function authHeader() {
  const token = localStorage.getItem('gw_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

async function loadAbout() {
  try {
    const d = await apiFetch('/api/about');
    console.log('about data:', d);
    if (!d || !Object.keys(d).length) return; // keep hardcoded HTML as fallback
    // Bio
    console.log('rendering bio...');
    const bioEl = document.querySelector('.about-bio');
    if (bioEl && d.bio?.length)
      bioEl.innerHTML = d.bio.map(p => `<p>${escapeHTML(p)}</p>`).join('');
    // Skills
    console.log('rendering skills...');
    const SKILL_MAP = {languages:'Languages','frameworks':'Frameworks &amp; Libraries','tools':'Tools &amp; Platforms'};
    if (d.skills) {
      document.querySelectorAll('.skills-group').forEach((group, i) => {
        const key = Object.keys(SKILL_MAP)[i];
        if (!key || !d.skills[key]) return;
        group.querySelector('.chips').innerHTML =
          d.skills[key].map(s => `<span class="chip">${escapeHTML(s)}</span>`).join('');
      });
    }
    // Currently — 4 cols
    console.log('rendering currently...');
    const nowGrid = document.querySelector('.now-grid');
    const COL_KEYS = ['reading','listening','watching','working'];
    const COL_LABELS = ['Reading','Listening to','Watching','Working On'];
    const COL_ICONS  = ['book-open','music','tv','terminal'];
    if (nowGrid && d.currently) {
      nowGrid.innerHTML = COL_KEYS.map((key, i) => {
        const entries = d.currently[key] || [];
        return `<div class="now-col">
          <div class="now-col-label">
            <i data-lucide="${COL_ICONS[i]}" style="width:12px;height:12px;"></i> ${COL_LABELS[i]}
          </div>
          ${entries.map(e => {
            const title = typeof e === 'string' ? e : e.title;
            const sub   = typeof e === 'string' ? '' : e.sub;
            return `<div class="now-entry">
              ${sub ? `<div style="font-size:.67rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:1px;">${escapeHTML(sub)}</div>` : ''}
              <strong>${escapeHTML(title)}</strong>
            </div>`;
          }).join('')}
        </div>`;
      }).join('');
      lucide.createIcons();
    }
    // Experience
    console.log('rendering experience...');
    const tlEl = document.querySelector('.timeline');
    if (tlEl && d.experience?.length) {
      const BADGE_CLASS = {Internship:'tb-work',Research:'tb-research',Policy:'tb-research',Hackathon:'tb-project',Education:'tb-research',Other:'tb-project'};
      const existingEyebrow = tlEl.querySelector('.eyebrow').outerHTML;
      tlEl.innerHTML = existingEyebrow + d.experience.map(e => `
        <div class="tl-item reveal">
          <div class="tl-date">${escapeHTML(e.date||'')}</div>
          <div>
            <span class="tl-badge ${BADGE_CLASS[e.badge]||'tb-project'}">${escapeHTML(e.badge||'')}</span>
            <div class="tl-title">${escapeHTML(e.title||'')}</div>
            <div class="tl-desc">${escapeHTML(e.desc||'')}</div>
          </div>
        </div>`).join('');
        tlEl.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    }
    // Hobbies
    console.log('rendering hobbies...');
    const hobbyCards = document.querySelector('.hobby-cards');
    console.log('hobbyCards el:', hobbyCards, 'hobbies:', d.hobbies);
    if (hobbyCards && d.hobbies?.length) {
      hobbyCards.innerHTML = d.hobbies.map((h, i) => `
          <div class="hobby-card reveal" style="transition-delay:${.05*i}s">
              <div class="hobby-card-icon"><i data-lucide="${escapeAttr(h.icon||'star')}" style="width:18px;height:18px;"></i></div>
              <div class="hobby-card-name">${escapeHTML(h.name)}</div>
              <div class="hobby-card-note">${escapeHTML(h.note||'')}</div>
          </div>`).join('');
      lucide.createIcons({ nameAttr: 'data-lucide', attrs: {}, nodes: [...hobbyCards.querySelectorAll('[data-lucide]')] });
      hobbyCards.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    }
  } catch(err) {
    console.error('loadAbout error:', err);
  }
}

// ================================================================
// BLOG — load posts from API, render, then wire filters
// ================================================================
let postsCache = null;
let tagsCache = null;

async function loadPosts() {
  const list = document.getElementById('blogList');
  if (!list) return;
  // Always re-fetch tags so the filter list reflects any
  // adds/edits/deletes the admin made since the last visit.
  // (Posts are cached — they don't change as often.)
  try {
    const tags = await apiFetch('/api/tags?scope=post').catch(() => []);
    tagsCache = tags;
    renderTagFilters(tags);
  } catch (e) {
    // non-fatal: keep the existing filter buttons if any
  }
  if (postsCache) return renderPosts(postsCache);
  list.innerHTML = '<div class="blog-loading">Loading posts…</div>';
  try {
    const data = await apiFetch('/api/posts');
    postsCache = data;
    renderPosts(data);
  } catch (err) {
    list.innerHTML = '<div class="blog-loading">Couldn\'t load posts.</div>';
  }
}

// Build the blog filter chips from the live tag list, so deletes
// and renames in the Tag Manager show up on the next page visit.
function renderTagFilters(tags) {
  const group = document.querySelector('[data-blog-filters]');
  if (!group) return;
  const html = [
    `<button class="filter-btn active" data-bfilter="all">
       <i data-lucide="filter" style="width:11px;height:11px;"></i> All
     </button>`,
    ...tags.map(t => `
      <button
        class="filter-btn"
        data-bfilter="${escapeAttr(t.name)}"
        style="--tag-color:${escapeAttr(t.color)};">
        <i data-lucide="${escapeAttr(t.icon || 'tag')}" style="width:11px;height:11px;"></i>
        ${escapeHTML(t.name)}
      </button>
    `)
  ].join('');
  group.innerHTML = html;
  group.querySelectorAll('[data-bfilter]').forEach(btn => {
    btn.addEventListener('click', function () {
      group.querySelectorAll('[data-bfilter]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterBlog();
    });
  });
  if (window.lucide) lucide.createIcons();
}

function getTagClass(_tag) {
  // Kept for backward compatibility with any external callers;
  // color is now applied inline from the API response.
  return '';
}

function renderTags(tags) {
    if (!tags.length) return "";
    return `
        <div class="b-tags">
            ${tags.map(tag => {
                const name  = tag.name  ?? tag;
                const color = tag.color || '#2563eb';
                const icon  = tag.icon  || 'tag';
                return `
                <span
                    class="b-tag"
                    style="background:${hexToBg(color)};color:${color};border:1px solid ${color}33;"
                >
                    <i data-lucide="${escapeAttr(icon)}" style="width:11px;height:11px;vertical-align:-1px;margin-right:3px;"></i>
                    ${escapeHTML(name)}
                </span>`;
            }).join("")}
        </div>
    `;
}

function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));
}

function escapeAttr(s) {
  return escapeHTML(s);
}

function hexToBg(hex) {
  if (!hex || !/^#?([0-9a-f]{6})$/i.test(hex)) return "#eee";
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},0.12)`;
}

function createPostCard(post, index) {
  const tagNames = (post.tags || []).map(t => t.name ?? t);
  return `
    <div
      class="blog-item"
      data-btags="${tagNames.join(',')}"
      data-btext="${(post.title + ' ' + post.excerpt).toLowerCase()}"
    >
      <div class="b-index">${String(index + 1).padStart(2, '0')}</div>
      <div class="b-body">
        <div class="b-meta">
          <span class="b-date">${post.date}</span>
          <span class="b-tag-dot"></span>
          ${renderTags(post.tags)}
        </div>
        <a class="b-title" href="article.html?id=${post.id}">${post.title}</a>
        <div class="b-excerpt">${post.excerpt}</div>
      </div>
      <div class="b-arrow">
        <a href="article.html?id=${post.id}" class="article-link" aria-label="Read article">
          <i data-lucide="arrow-up-right" style="width:16px;height:16px;"></i>
        </a>
      </div>
    </div>
  `;
}

function renderPosts(posts) {
  const list = document.getElementById('blogList');
  if (!list) return;
  if (!posts.length) { list.innerHTML = '<div class="blog-loading">No posts yet.</div>'; return; }
  list.innerHTML = posts.map(createPostCard).join('');
  lucide.createIcons();
  filterBlog();
}

document.querySelectorAll('[data-bfilter]').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('[data-bfilter]').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    filterBlog();
  });
});

function filterBlog() {
  const tag = (document.querySelector('[data-bfilter].active') || { dataset: { bfilter: 'all' } }).dataset.bfilter;
  const q = (document.getElementById('blogSearch')?.value || '').toLowerCase();
  let n = 1;
  document.querySelectorAll('#blogList .blog-item').forEach(item => {
    const tags = item.dataset.btags.split(',');
    const tm = tag === 'all' || tags.includes(tag);
    const qm = !q || item.dataset.btext?.includes(q) || item.querySelector('.b-title')?.textContent.toLowerCase().includes(q);
    item.classList.toggle('hidden', !(tm && qm));
    if (tm && qm) item.querySelector('.b-index').textContent = String(n++).padStart(2, '0');
  });
}

// ================================================================
// LIBRARY — load reviews from API, render, then wire filters
// ================================================================
let reviewsCache = null;

async function loadReviews() {
  if (reviewsCache) return renderReviews(reviewsCache);
  const list = document.getElementById('libraryList');
  if (!list) return;
  list.innerHTML = '<div class="blog-loading">Loading library…</div>';
  try {
    // Load tags for filter bar
    const reviewTags = await apiFetch('/api/tags?scope=review').catch(() => []);
    renderLibraryTagFilters(reviewTags);
    const data = await apiFetch('/api/reviews');
    reviewsCache = data;
    renderReviews(data);
  } catch (err) {
    list.innerHTML = '<div class="blog-loading">Couldn\'t load library.</div>';
  }
}

function renderLibraryTagFilters(tags) {
  const container = document.getElementById('libraryTagFilters');
  if (!container) return;
  container.innerHTML = tags.map(t => `
    <button class="filter-btn" data-lgenre="${escapeAttr(t.name.toLowerCase())}"
      style="--tag-color:${escapeAttr(t.color)};">
      <i data-lucide="${escapeAttr(t.icon||'tag')}" style="width:11px;height:11px;"></i>
      ${escapeHTML(t.name)}
    </button>`).join('');
  container.querySelectorAll('[data-lgenre]').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.classList.contains('active') && this.dataset.lgenre !== 'all') {
        this.classList.remove('active'); activeGenre = 'all';
      } else {
        document.querySelectorAll('[data-lgenre]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeGenre = this.dataset.lgenre;
      }
      filterLibrary();
    });
  });
  if (window.lucide) lucide.createIcons();
}

function renderReviews(reviews) {
  const list = document.getElementById('libraryList');
  const nb = document.getElementById('noBooks');
  if (!list) return;
  if (!reviews.length) { list.innerHTML = ''; if (nb) nb.style.display = 'block'; return; }
  const typeLabel = { book: 'Book', paper: 'Paper', article: 'Article' };
  list.innerHTML = reviews.map(r => {
    const tagNames = (r.tags || []).map(t => (t.name ?? t).toLowerCase());
    const tagChips = (r.tags || []).map(t => {
      const color = t.color || '#2563eb';
      const icon  = t.icon  || 'tag';
      return `<span class="bk-genre-badge b-tag"
        style="background:${hexToBg(color)};color:${color};border:1px solid ${color}33;">
        <i data-lucide="${escapeAttr(icon)}" style="width:10px;height:10px;vertical-align:-1px;margin-right:2px;"></i>
        ${escapeHTML(t.name ?? t)}
      </span>`;
    }).join('');
    const typeBadge = `<span class="bk-type-badge bkt-${r.type||'book'}">${typeLabel[r.type]||r.type}</span>`;
    const cover = r.cover_url
      ? `<img class="bk-cover" src="${escapeAttr(r.cover_url)}" alt="${escapeAttr(r.title)}" onerror="this.style.display='none'">`
      : `<div class="bk-cover bk-cover-empty"></div>`;
    return `
      <div class="book-item"
        data-ltype="${r.type}"
        data-lgenre="${tagNames.join(',')}"
        data-ltext="${(r.title+' '+r.author+' '+r.review).toLowerCase()}">
        <div class="book-accent-bar ba-${r.accent||'indigo'}"></div>
        ${cover}
        <div class="book-main">
          <div class="bk-header">
            <span class="bk-title">${escapeHTML(r.title)}</span>
            <span class="bk-author">${escapeHTML(r.author||'')}</span>
          </div>
          <div class="bk-meta">${typeBadge}${tagChips}</div>
          <div class="bk-review">${escapeHTML(r.review||'')}</div>
        </div>
        <div class="bk-rating-col">
          <div class="bk-stars">${escapeHTML(r.rating||'')}</div>
          <div class="bk-status">${escapeHTML(r.status||'')}</div>
        </div>
      </div>`;
  }).join('');

  if (nb) nb.style.display = 'none';
  lucide.createIcons();
  filterLibrary();
}

let activeType = 'all', activeGenre = 'all';
document.querySelectorAll('[data-lfilter]').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('[data-lfilter]').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeType = this.dataset.lfilter;
    filterLibrary();
  });
});
document.querySelectorAll('[data-lgenre]').forEach(btn => {
  btn.addEventListener('click', function () {
    if (this.classList.contains('active') && this.dataset.lgenre !== 'all') {
      this.classList.remove('active'); activeGenre = 'all';
    } else {
      document.querySelectorAll('[data-lgenre]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeGenre = this.dataset.lgenre;
    }
    filterLibrary();
  });
});

function filterLibrary() {
  const q = (document.getElementById('libSearch')?.value || '').toLowerCase();
  let any = false;
  document.querySelectorAll('#libraryList .book-item').forEach(item => {
    const tm = activeType === 'all' || item.dataset.ltype === activeType;
    const gm = activeGenre === 'all' || item.dataset.lgenre?.includes(activeGenre);
    const qm = !q || item.dataset.ltext?.includes(q) || item.querySelector('.bk-title')?.textContent.toLowerCase().includes(q);
    const show = tm && gm && qm;
    item.classList.toggle('hidden', !show);
    if (show) any = true;
  });
  const nb = document.getElementById('noBooks');
  if (nb) nb.style.display = any ? 'none' : 'block';
}

// ================================================================
// PROJECT - load from API, render as Masonry Flat cards, then filter
// ================================================================
let projectsCache = null;

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  try {
    const projectTags = await apiFetch('/api/tags?scope=project').catch(() => []);
    renderProjectTagFilters(projectTags);
  } catch(e) { /* non-fatal: keep existing filter buttons if any */}
  if (projectsCache) return
  grid.innerHTML = '<div class="blog-loading">Loading projects...</div>';
  try {
    const data = await apiFetch('/api/projects');
    projectsCache = data;
    renderProjects(data);
  } catch (err) {
    grid.innerHTML = '<div class="blog-loading">Couldn\'t load projects.</div>';
  }
}

// Building project filter chips from live tag list.
function renderProjectTagFilters(tags) {
  const group = document.querySelector('.filter-group[data-project-filters]');
  if (!group) return;
  const html = [
    `<button class="filter-btn active" data-pfilter="all">
      <i data-lucide="layout-grid" style="width:11px;height:11px;"></i> All
      </button>`, ...tags.map(t => `
        <button class="filter-btn" data-pfilter="${escapeAttr(t.name)}" style="--tag-color:${escapeAttr(t.color)};">
        <i data-lucide="${escapeAttr(t.icon || 'tag')}" style="width:11px;height:11px;"></i>
        ${escapeHTML(t.name)}
      </button>
      `)
    ].join('');
    group.innerHTML = html;
    group.querySelectorAll('[data-pfilter]').forEach(btn => {
    btn.addEventListener('click', function () {
    group.querySelectorAll('[data-pfilter]').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    filterProjects();
  });
});
if (window.lucide) lucide.createIcons();
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  const nr = document.getElementById('noResultsTemplate') || null;
  if (!grid) return;
  if (!projects.length) {
    grid.innerHTML = '<div class="no-results">No projects yet - check back soon.</div>';
    return;
  }
  grid.innerHTML = projects.map(p => {
    const tagNames = (p.tags || []).map(t => t.name);
    const tagColors = (p.tags || []).map(t => t.color).filter(Boolean);
    const links = Array.isArray(p.links) ? p.links : [];
    const chips = (p.tech_stack || '').split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="tech-chip">${escapeHTML(s)}</span>`).join('');
    const linkEls = links.map(l => `<a href="${escapeAttr(l.url)}" target="_blank" rel="noopener" class="p-link">
      ${escapeHTML(l.label || 'Link')} <i data-lucide="arrow-up-right" style="width:11px;height:11px;"></i></a>`).join('');
      const searchText = [p.title, p.summary, p.problem, p.role, p.tech_stack, p.type_label, ...tagNames].filter(Boolean).join(' ').toLowerCase();
      // Outline the card with the first tag's color so projects visually group by tag.
      // Falls back to the accent CSS variable (indigo / teal) when no tags exist.
      const cardBorderStyle = tagColors.length
        ? ` style="--card-border:${escapeAttr(tagColors[0])};"`
        : '';
      return `<div class="project-card" data-accent="${escapeAttr(p.accent || 'indigo')}" data-tags="${escapeAttr(tagNames.join(','))}" data-text="${escapeAttr(searchText)}"${cardBorderStyle}> ${p.type_label ? `<div class="p-type">${escapeHTML(p.type_label)}</div>` : ''}
      <div class="p-title">${escapeHTML(p.title)}</div> ${p.summary ? `<div class="p-desc">${escapeHTML(p.summary)}</div>` : ''}
      ${p.problem ? `<div class="p-section">
        <div class="p-section-label">The Problem</div>
          <div class="p-section-body">${escapeHTML(p.problem)}</div>
        </div>
        </div>` : ''}
      ${(p.role || chips) ? `<div class="p-section">
        <div class="p-section-label">Role &amp; Tech Stack</div>
        ${p.role ? `<div class="p-section-body">${escapeHTML(p.role)}</div>` : ''}
        ${chips ? `<div class="tech-chips">${chips}</div>` : ''}
        </div>` : ''}
      ${p.results ? `<div class="p-section">
        <div class="p-section-label">Results</div>
          <div class="p-section-body">${escapeHTML(p.results)}</div>
        </div>
        </div>` : ''}
      ${p.tradeoffs ? `<div class="p-section">
        <div class="p-section-label">Trade-offs</div>
          <div class="p-section-body">${escapeHTML(p.tradeoffs)}</div>
        </div>
        </div>` : ''}
      ${p.challenge ? `<div class="p-section">
        <div class="p-section-label">Technical Challenge</div>
          <div class="p-section-body">${escapeHTML(p.challenge)}</div>
        </div>
        </div>` : ''}
      ${links.length ? `<div class="p-section">
        <div class="p-section-label">Links</div>
          <div class="p-links">${linkEls}</div>
        </div>` : ''}
      </div>`;
  }).join('') + '<div class="no-results" id="noProjects" style="display:none;">No projects match that filter.</div>';
  if (window.lucide) lucide.createIcons();
  filterProjects();
}

function filterProjects() {
  const tag = (document.querySelector('[data-pfilter].active') || { dataset: { pfilter: 'all' } }).dataset.pfilter;
  const q = (document.getElementById('projectSearch')?.value || '').toLowerCase();
  let any = false;
  document.querySelectorAll('#projectsGrid .project-card').forEach(c => {
    const tm = !tag || tag === 'all' || c.dataset.tags?.includes(tag);
    const qm = !q || c.dataset.text?.includes(q) || c.querySelector('.p-title')?.textContent.toLowerCase().includes(q);
    c.classList.toggle('hidden', !(tm && qm));
    if (tm && qm) any = true;
  });
  const nr = document.getElementById('noProjects');
  if (nr) nr.style.display = any ? 'none' : 'block';
  document.getElementById('projectSearch')?.addEventListener('input', filterProjects);
}

// ================================================================
// CONTACT FORM
// ================================================================
async function submitContact() {
  const n = document.getElementById('cName').value.trim();
  const e = document.getElementById('cEmail').value.trim();
  const m = document.getElementById('cMsg').value.trim();
  const errEl = document.getElementById('contactError');
  const okEl  = document.getElementById('contactSuccess');
  if (!n || !e || !m) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return; }
  errEl.style.display = 'none';
  try {
    await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify({ name: n, email: e, message: m }) });
    ['cName', 'cEmail', 'cMsg'].forEach(id => document.getElementById(id).value = '');
    okEl.style.display = 'block';
    setTimeout(() => okEl.style.display = 'none', 4000);
  } catch (err) {
    errEl.textContent = err.message || 'Something went wrong.';
    errEl.style.display = 'block';
  }
}

// Admin Log-in
async function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  const errEl = document.getElementById('loginError');
  try {
    const { token } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: pass }),
    });
    localStorage.setItem('gw_token', token);
    document.getElementById('adminAuthGate').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
  } catch (err) {
    errEl.textContent = err.message || 'Invalid credentials.';
    errEl.style.display = 'block';
  }
}

function adminLogout() {
  localStorage.removeItem('gw_token');
  document.getElementById('adminAuthGate').style.display = 'block';
  document.getElementById('adminContent').style.display = 'none';
}

// Auto-unlock admin panel if already logged in
if (localStorage.getItem('gw_token')) {
  const gate = document.getElementById('adminAuthGate');
  const content = document.getElementById('adminContent');
  if (gate) gate.style.display = 'none';
  if (content) content.style.display = 'block';
}

// ================================================================
// ADMIN — add blog post
// ================================================================
async function adminAddPost() {
  const title   = document.getElementById('bTitle').value.trim();
  const date    = document.getElementById('bDate').value.trim();
  const tag     = document.getElementById('bTag').value;
  const excerpt = document.getElementById('bExcerpt').value.trim();
  const okEl    = document.getElementById('bOk');
  const errEl   = document.getElementById('bErr');
  if (!title || !date) return;
  errEl.style.display = 'none';
  try {
    await apiFetch('/api/posts', { method: 'POST', body: JSON.stringify({ title, date, tag, excerpt }) });
    postsCache = null; // bust cache so blog page reloads
    ['bTitle', 'bDate', 'bExcerpt'].forEach(id => document.getElementById(id).value = '');
    okEl.style.display = 'block';
    setTimeout(() => okEl.style.display = 'none', 2500);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}

// ================================================================
// ADMIN — add library review
// ================================================================
async function adminAddReview() {
  const title  = document.getElementById('lTitle').value.trim();
  const author = document.getElementById('lAuthor').value.trim();
  const type   = document.getElementById('lType').value;
  const accent = document.getElementById('lAccent').value;
  const genre  = document.getElementById('lGenre').value.trim();
  const rating = document.getElementById('lRating').value.trim();
  const status = document.getElementById('lStatus').value.trim();
  const review = document.getElementById('lReview').value.trim();
  const okEl   = document.getElementById('lOk');
  const errEl  = document.getElementById('lErr');
  if (!title) return;
  errEl.style.display = 'none';
  try {
    await apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify({ title, author, type, accent, genre, rating, status, review }) });
    reviewsCache = null; // bust cache
    ['lTitle', 'lAuthor', 'lGenre', 'lStatus', 'lReview', 'lRating'].forEach(id => document.getElementById(id).value = '');
    okEl.style.display = 'block';
    setTimeout(() => okEl.style.display = 'none', 2500);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  }
}
/* =============================================================
   GRACE WANG PORTFOLIO — app.js
   Handles:
   • Lucide icons
   • Hobby strip icons
   • Polished SVG origami crane animation
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
// POLISHED SVG ORIGAMI CRANE ANIMATION
// Replaces the old canvas-div approach with a proper SVG element
// and CSS keyframe animation. Each crane gets randomised position,
// scale, timing, and rotation so the field feels alive, not looping.
// ================================================================
(function initCraneAnimation() {
  const stage = document.getElementById('heroSvgStage');
  if (!stage) return;

  // Inline SVG paths for an origami crane silhouette.
  // Two wing polygons + body + head + tail.
  function craneSVG(color, size) {
    return `<svg width="${size}" height="${Math.round(size * 0.72)}"
      viewBox="0 0 100 72" xmlns="http://www.w3.org/2000/svg"
      fill="none" stroke="${color}" stroke-width="1.2" stroke-linejoin="round">
      <!-- left wing -->
      <polygon points="50,6 8,38 50,32" fill="${color}" fill-opacity="0.07"/>
      <!-- right wing -->
      <polygon points="50,6 92,38 50,32" fill="${color}" fill-opacity="0.07"/>
      <!-- lower left -->
      <polygon points="50,32 8,38 50,64" fill="${color}" fill-opacity="0.05"/>
      <!-- lower right -->
      <polygon points="50,32 92,38 50,64" fill="${color}" fill-opacity="0.05"/>
      <!-- center fold lines -->
      <line x1="50" y1="6"  x2="50" y2="64" stroke="${color}" stroke-opacity="0.3"/>
      <line x1="8"  y1="38" x2="92" y2="38" stroke="${color}" stroke-opacity="0.2"/>
      <!-- tail feathers -->
      <line x1="50" y1="64" x2="40" y2="70"/>
      <line x1="50" y1="64" x2="60" y2="70"/>
      <!-- head/beak -->
      <line x1="50" y1="6"  x2="57" y2="1"/>
    </svg>`;
  }

  const palette = ['#8080E0','#0D9488','#A0AEC0','#5B5BD6','#7EBEA5'];

  const cranes = [
    // [left%, top%, sizePx, opacity, duration(s), delay(s), rot0, rot1, rot2]
    [72,  8,  48, .16, 9,  0.0,   '0deg',   '7deg',  '-4deg'],
    [82, 22,  34, .12, 7,  1.8,  '-3deg',   '4deg',   '5deg'],
    [60, 45,  56, .14, 11, 0.6,   '2deg',  '-6deg',   '3deg'],
    [88, 60,  30, .10, 8,  3.2,   '4deg',   '2deg',  '-5deg'],
    [68, 72,  42, .13, 10, 2.0,  '-1deg',   '5deg',   '2deg'],
  ];

  cranes.forEach(([l, t, sz, op, dur, delay, r0, r1, r2], i) => {
    const wrap = document.createElement('div');
    wrap.className = 'crane-svg-wrap';
    wrap.style.cssText = [
      `left:${l}%`,
      `top:${t}%`,
      `--dur:${dur}s`,
      `--delay:${delay}s`,
      `--peak-op:${op}`,
      `--rot0:${r0}`,
      `--rot1:${r1}`,
      `--rot2:${r2}`,
      `--sc:${0.85 + Math.random() * 0.3}`,
    ].join(';');
    wrap.innerHTML = craneSVG(palette[i % palette.length], sz);
    stage.appendChild(wrap);
  });
})();

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

// ================================================================
// BLOG — load posts from API, render, then wire filters
// ================================================================
let postsCache = null;

async function loadPosts() {
  if (postsCache) return renderPosts(postsCache);
  const list = document.getElementById('blogList');
  if (!list) return;
  list.innerHTML = '<div class="blog-loading">Loading posts…</div>';
  try {
    const data = await apiFetch('/api/posts');
    postsCache = data;
    renderPosts(data);
  } catch (err) {
    list.innerHTML = '<div class="blog-loading">Couldn\'t load posts.</div>';
  }
}

function getTagClass(tag) {
  switch (tag.toLowerCase()) {
    case 'ai':
      return 'bt-ai';

    case 'policy':
      return 'bt-policy';

    case 'research':
      return 'bt-research';

    case 'hardware':
      return 'bt-hardware';

    default:
      return '';
  }
}

function renderTags(tags) {

    if (!tags.length) {

        return "";

    }

    return `

        <div class="b-tags">

            ${tags.map(tag => `

                <span
                    class="b-tag ${getTagClass(tag)}"
                >

                    ${tag}

                </span>

            `).join("")}

        </div>

    `;

}

function createPostCard(post, index) {

  return `
    <div
      class="blog-item"
      data-btags="${post.tags.join(',')}"
      data-btext="${(post.title + ' ' + post.excerpt).toLowerCase()}"
    >

      <div class="b-index">

        ${String(index + 1).padStart(2, '0')}

      </div>

      <div class="b-body">

        <div class="b-meta">

          <span class="b-date">

            ${post.date}

          </span>

          <span class="b-tag-dot"></span>

          ${renderTags(post.tags)}

        </div>

        <div class="b-title">

          ${post.title}

        </div>

        <div class="b-excerpt">

          ${post.excerpt}

        </div>

      </div>

      <div class="b-arrow">

        <i
          data-lucide="arrow-up-right"
          style="width:16px;height:16px;"
        ></i>

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
    const data = await apiFetch('/api/reviews');
    reviewsCache = data;
    renderReviews(data);
  } catch (err) {
    list.innerHTML = '<div class="blog-loading">Couldn\'t load library.</div>';
  }
}

const typeBadgeCls = { book: 'bkt-book', paper: 'bkt-paper', article: 'bkt-article' };
const typeLabel = { book: 'Book', paper: 'Paper', article: 'Article' };

function renderReviews(reviews) {
  const list = document.getElementById('libraryList');
  const nb = document.getElementById('noBooks');
  if (!list) return;
  if (!reviews.length) { list.innerHTML = ''; if (nb) nb.style.display = 'block'; return; }
  const genres = r => (r.genre || '').split(',').map(g => g.trim()).filter(Boolean)
    .map(g => `<span class="bk-genre-badge">${g}</span>`).join('');
  list.innerHTML = reviews.map(r => `
    <div class="book-item" data-ltype="${r.type}" data-lgenre="${(r.genre || '').toLowerCase()}" data-ltext="${(r.title + ' ' + r.author + ' ' + r.review + ' ' + r.genre).toLowerCase()}">
      <div class="book-accent-bar ba-${r.accent || 'indigo'}"></div>
      <div class="book-main">
        <div class="bk-header"><span class="bk-title">${r.title}</span><span class="bk-author">${r.author}</span></div>
        <div class="bk-meta"><span class="bk-type-badge ${typeBadgeCls[r.type] || ''}">${typeLabel[r.type] || r.type}</span>${genres(r)}</div>
        <div class="bk-review">${r.review}</div>
      </div>
      <div class="bk-rating-col"><div class="bk-stars">${r.rating || ''}</div><div class="bk-status">${r.status || ''}</div></div>
    </div>`).join('');
  if (nb) nb.style.display = 'none';
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
// PROJECT FILTERS (static HTML, no API)
// ================================================================
document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    filterProjects();
  });
});

function filterProjects() {
  const tag = (document.querySelector('[data-filter].active') || { dataset: { filter: 'all' } }).dataset.filter;
  const q = (document.getElementById('projectSearch')?.value || '').toLowerCase();
  let any = false;
  document.querySelectorAll('#projectsGrid .project-card').forEach(c => {
    const tm = tag === 'all' || c.dataset.tags?.includes(tag);
    const qm = !q || c.dataset.text?.includes(q) || c.querySelector('.p-title')?.textContent.toLowerCase().includes(q);
    c.classList.toggle('hidden', !(tm && qm));
    if (tm && qm) any = true;
  });
  const nr = document.getElementById('noProjects');
  if (nr) nr.style.display = any ? 'none' : 'block';
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

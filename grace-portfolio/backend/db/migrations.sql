-- =============================================================
-- Grace Wang Portfolio — Database Migrations
-- Run once against your Supabase / PostgreSQL database.
-- Supabase: paste into the SQL Editor in the dashboard.
-- Local:    psql $DATABASE_URL -f backend/db/migrations.sql
-- =============================================================

-- Blog posts
CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL PRIMARY KEY,
  title      TEXT    NOT NULL,
  date       TEXT    NOT NULL,          -- display date, e.g. "Jul 2026"
  tag        TEXT    NOT NULL,          -- ai | policy | research | hardware
  excerpt    TEXT    DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library reviews
CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  title      TEXT    NOT NULL,
  author     TEXT    DEFAULT '',
  type       TEXT    NOT NULL,          -- book | paper | article
  accent     TEXT    DEFAULT 'indigo',  -- indigo | teal | amber
  genre      TEXT    DEFAULT '',        -- comma-separated
  rating     TEXT    DEFAULT '',        -- e.g. ★★★★★
  status     TEXT    DEFAULT '',        -- e.g. Essential / Rereading
  review     TEXT    DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- Seed data — initial blog posts (matches original HTML content)
-- =============================================================
INSERT INTO posts (title, date, tag, excerpt) VALUES
  (
    'What I learned building multi-agent AI systems at Google',
    'Jul 2026', 'ai',
    'Shipping a real product with ADK and Vertex AI taught me the difference between a demo that impresses and an architecture that holds. Agent memory is harder than anyone makes it sound, and the gap between prototype and production is where most ideas go to die.'
  ),
  (
    'Why CS students should care about tech policy',
    'Apr 2026', 'policy',
    'We spend four years learning to build systems. We spend almost no time thinking about who decides what those systems are allowed to do — or who gets hurt when they fail. That gap is not accidental, and it''s not someone else''s problem to fix.'
  ),
  (
    'Sparse tensors, benchmarks, and why research is humbling',
    'Dec 2025', 'research',
    'I spent a semester making things go faster by making them smaller. What CP-ALS decomposition on sparse 3rd-order tensors actually means, why benchmarks matter more than I expected, and what I learned from Dr. Ahrens'' lab about the difference between "it works" and "it''s correct."'
  ),
  (
    'Building a medical device in 36 hours: MedTech Hack recap',
    'Sep 2025', 'hardware',
    '11–12 million people in the U.S. have TMJ disorder. Existing devices cost thousands. We wanted to close that gap in a weekend. Spoiler: 5th place, one Flask backend held together by willpower, and a lot of things I''d do differently next time.'
  )
ON CONFLICT DO NOTHING;

-- =============================================================
-- Seed data — initial library reviews
-- =============================================================
INSERT INTO reviews (title, author, type, accent, genre, rating, status, review) VALUES
  (
    'Weapons of Math Destruction', 'Cathy O''Neil',
    'book', 'indigo', 'AI, Nonfiction', '★★★★★', 'Essential',
    'A sobering account of how opaque, large-scale algorithms perpetuate inequality in hiring, lending, and criminal justice. Changed how I think about what "optimization" actually means when real people are on the other end.'
  ),
  (
    'The Alignment Problem', 'Brian Christian',
    'book', 'teal', 'AI, Nonfiction', '★★★★★', 'Rereading',
    'Dense but honest. The most grounded account of where AI safety research actually stands — not doomsday narrative or dismissal, but a genuine engineering and philosophical problem with no clean answers yet.'
  ),
  (
    'Attention Is All You Need', 'Vaswani et al., 2017',
    'paper', 'indigo', 'AI', '★★★★★', 'Read twice',
    'The transformer paper. First read it in a course and understood maybe 60%. After building with Vertex AI and debugging multi-agent systems, re-reading it was a completely different experience.'
  ),
  (
    'A Mind at Play', 'Jimmy Soni & Rob Goodman',
    'book', 'amber', 'Biography, Nonfiction', '★★★★☆', 'Delightful',
    'Biography of Claude Shannon. Made me fall in love with information theory — and with the idea that playful, curious tinkering is a legitimate form of intellectual rigor.'
  )
ON CONFLICT DO NOTHING;

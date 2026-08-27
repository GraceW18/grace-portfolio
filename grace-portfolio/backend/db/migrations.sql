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

-- Projects (Masonry Flat layout)
CREATE TABLE IF NOT EXISTS projects (
  id        SERIAL PRIMARY KEY,
  title     TEXT    NOT NULL,
  summary   TEXT    DEFAULT '',         -- one-sentence goal
  problem   TEXT    DEFAULT '',
  role      TEXT    DEFAULT '',
  tech_stack TEXT   DEFAULT '',
  results   TEXT    DEFAULT '',
  tradeoffs TEXT    DEFAULT '',
  challenge TEXT    DEFAULT '',
  type_label TEXT   DEFAULT '',
  accent    TEXT    DEFAULT 'indigo',
  links     JSONB   DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tags (
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id      INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- SEED DATA (initial projects)
INSERT INTO projects (title, summary, problem, role, tech_stack, results, tradeoffs,
challenge, type_label, accent, links, display_order) VALUES
  (
    'Multi-Agent AI Travel Planner',
    'A conversational travel planner that builds personalized, memory-aware itineraries end-to-end.',
    'Trip planning is a hassle when going through a dozen tabs and manual research. Travelers need
    one assistant that remembers preferences across a whole conversation and turns them into a real
    itinerary.',
    'Sprinternship AI / Backend engineer on a cross-functional Google team. Shipped the activities, dining, 
    and itinerary generation modules end-to-end, including agent-to-agent handoffs and memory persistence.',
    'Python, Google ADK, Vertex AI, BigQuery, A2UI',
    'Shipped 3 production agent modules across a 6-person cross-functional team during the Sprinternship.',
    'Choose multi-agent orchestration over a single monolithic prompt for modularity and easier debugging,
    at the cost of added latency from inter-agent handoffs.',
    'Getting agent memory to persist reliably across turns without blowing up context windows or losing user preferences mid-conversation.',
    'AI / Backend - Google', 'indigo',
    '[{"label":"Google - Private Project"]', 1
  ),
    (
    'Sparse Tensor Benchmark Suite',
    'Extended an open-source Python benchmark suite for CP-ALS decomposition on sparse 3rd-order tensors.',
    'Existing CP-ALS benchmarks assumed dense tensors, so runtime scaled with total tensor size instead of actual data volume — unusable for the sparse, high-dimensional data common in real research.',
    'Research assistant in Dr. Ahrens'' lab. Rewrote core decomposition routines to operate on sparse representations and built the verification test suite.',
    'Python, NumPy, pytest, Sparse Arrays',
    'Cut complexity from O(I·J·K·R) to O(nnz·R); verified <10% reconstruction error on 20×20×20 rank-3 tensors.',
    'Optimized for asymptotic complexity over raw constant-factor speed, since the target workloads were large and very sparse.',
    'Correctly handling edge cases where sparsity patterns caused rank-deficient intermediate matrices during ALS updates.',
    'Research / Systems · Georgia Tech', 'teal',
    '[{"label":"Georgia Tech - Private Project"}]', 2
  ),
  (
    'NoSQL Database Engine',
    'A custom Java NoSQL engine modeled after Amazon DynamoDB, built from the data structures up.',
    'Coursework challenge: implement the core primitives (hashing, ordered range queries, eviction) that make a NoSQL key-value store viable at scale, without relying on a library.',
    'Sole implementer. Built the linear-probing HashMap, AVL TreeMap, and LRU-partitioned database layer from scratch.',
    'Java, HashMap, AVL Tree, LRU Cache',
    'Achieved O(log n + k) range queries via the AVL TreeMap implementation.',
    'Chose AVL trees over Red-Black trees for stricter balance guarantees on range-query-heavy workloads, accepting slightly more rotations on insert.',
    'Implementing LRU eviction correctly across database partitions without introducing race conditions between eviction and lookup.',
    'Systems / Data Structures', 'indigo',
    '[{"label":"Georgia Tech - Private Project"]', 3
  ),
  (
    'Vibroacoustic Therapy Device',
    'A low-cost wearable delivering vibroacoustic therapy for TMJ disorder.',
    'Clinical TMJ therapy devices cost thousands of dollars, putting them out of reach for most of the 11–12 million people in the U.S. with the disorder.',
    'Built the Python/Flask backend ingesting real-time IoT sensor data and the Chart.js biometric dashboard for tracking 30-day treatment cycles.',
    'Python, Flask, Chart.js, Arduino, IoT',
    '~90% cost reduction versus clinical devices; placed 5th at MedTech Hack.',
    'Prioritized shipping a working end-to-end demo in 36 hours over sensor precision, using consumer-grade Arduino hardware instead of medical-grade sensors.',
    'Getting reliable real-time sensor data over a shaky hackathon WiFi connection into the Flask backend without dropping readings.',
    'IoT / Hardware · MedTech Hack (5th)', 'teal',
    '[{"label":"GitHub","url":"https://github.com/GraceW18/vibroacoustic-therapy-device"}]', 4
  ),
  (
    'Prospera',
    'A web app providing personalized investing suggestions paired with an AI budgeting chatbot for first-time investors.',
    'First-time investors are often intimidated by financial jargon and don''t know where to start — they need plain-language guidance tied to their actual funds and goals.',
    'Built the Gemini-powered chatbot ("Penny") and integrated it with the personalized suggestion engine.',
    'HTML/JS, Gemini API, Finance',
    'Delivered a working budgeting chatbot integrated end-to-end with personalized investment suggestions.',
    'Used a general-purpose LLM (Gemini) for financial guidance rather than a rules-based engine, trading determinism for more natural, personalized conversations.',
    'Keeping chatbot responses financially responsible and non-prescriptive while still feeling personalized and useful.',
    'Web App / AI', 'indigo',
    '[{"label":"GitHub","url":"https://github.com/etumanova/prospera"}]', 5
  ),
  (
    'AI Disinformation Policy Memo',
    'A peer-reviewed policy memo on AI-enhanced disinformation threats to critical infrastructure.',
    'AI is lowering the cost of producing convincing disinformation targeting CISA-defined critical infrastructure, and federal policy hasn''t kept pace with the threat.',
    'Sole author. Researched 30+ sources, built 5 case studies, and authored 3 evidence-based federal intervention proposals.',
    'Policy Analysis, AI Ethics, Cybersecurity',
    'Accepted to the Journal of Science Policy & Governance (JSPG) Winter issue.',
    'Focused on 3 targeted federal interventions rather than a broad policy overhaul, prioritizing proposals that were actionable within existing agency authority.',
    'Synthesizing 30+ technical and policy sources into intervention proposals that were both evidence-based and politically feasible.',
    'Policy / Writing · Published', 'teal',
    '[{"label":"Publication","url":"https://www.sciencepolicyjournal.org/article_1038126_jspg280107.html"}]', 6
  )
ON CONFLICT DO NOTHING;

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id         SERIAL PRIMARY KEY,
  name       TEXT    NOT NULL UNIQUE,
  color      TEXT    DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT NOW()
  icon       TEXT    DEFAULT 'tag'
);

-- =============================================================
-- Seed data — initial tags
-- =============================================================
INSERT INTO tags (name, color) VALUES
  ('ai',       '#6366f1'),
  ('policy',   '#f59e0b'),
  ('research', '#0d9488'),
  ('hardware', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- Many-to-many: posts <-> tags
CREATE TABLE IF NOT EXISTS post_tags (
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
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

-- Link seeded posts to their tags via the post_tags join table
INSERT INTO post_tags (post_id, tag_id)
SELECT p.id, t.id
FROM posts p
JOIN tags t ON t.name = p.tag
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

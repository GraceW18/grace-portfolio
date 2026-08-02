# Grace Wang — Portfolio

Production-ready refactor of a single-file HTML portfolio into a proper
fullstack project: static frontend + Express API + PostgreSQL (Supabase).

---

## Project structure

```
grace-portfolio/
├── frontend/
│   ├── index.html          ← SPA shell (all pages in one HTML file)
│   ├── css/
│   │   └── styles.css      ← all styles, including hero-grid & crane animation
│   ├── js/
│   │   └── app.js          ← navigation, API calls, filters, admin UI
│   └── images/
│       └── me.png          ← YOUR PORTRAIT — replace this file
│
├── backend/
│   ├── server.js           ← Express app (also Vercel serverless entry)
│   ├── middleware/
│   │   └── verifyJWT.js    ← JWT auth middleware for protected routes
│   ├── routes/
│   │   ├── auth.js         ← POST /api/auth/login → JWT
│   │   ├── posts.js        ← GET/POST /api/posts
│   │   ├── reviews.js      ← GET/POST /api/reviews
│   │   └── contact.js      ← POST /api/contact
│   └── db/
│       ├── client.js       ← pg Pool singleton (reads DATABASE_URL)
│       └── migrations.sql  ← CREATE TABLE + seed data — run once
│
├── vercel.json             ← routes /api/* → backend, /* → frontend
├── package.json
├── .env.example            ← copy to .env, fill in secrets
├── .gitignore
└── README.md
```

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your secrets
cp .env.example .env

# 3. Create tables + seed data in your Supabase/Postgres DB
psql $DATABASE_URL -f backend/db/migrations.sql
# OR paste migrations.sql into the Supabase SQL Editor

# 4. Start the dev server
npm run dev
# → API running at http://localhost:3000

# 5. Open frontend in browser
open frontend/index.html
# (or serve it with: npx serve frontend)
```

---

## Portrait photo

Replace `frontend/images/me.png` with your own photo.

- **Format**: JPEG or PNG, square or portrait crop
- **Size**: at least 600 × 600 px
- **Background**: plain or soft — the CSS clips it into a circle
- The `onerror` handler on the `<img>` hides the frame gracefully if the
  file is missing, so the page still works during development.

---

## Environment variables

| Variable          | Required | Description                                        |
|-------------------|----------|----------------------------------------------------|
| `DATABASE_URL`    | ✅       | Postgres connection string (Supabase URI)          |
| `JWT_SECRET`      | ✅       | Long random string used to sign tokens             |
| `ADMIN_PASSWORD`  | ✅       | Password for the /admin dashboard                  |
| `FRONTEND_ORIGIN` | —        | CORS origin (default `*`; set to your domain in prod) |
| `RESEND_API_KEY`  | —        | Optional — for contact-form email notifications    |
| `NODE_ENV`        | —        | `production` enables Postgres SSL                  |

Generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
# Add: DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD, FRONTEND_ORIGIN, NODE_ENV=production
```

`vercel.json` handles routing automatically:
- `/api/*` → `backend/server.js` (serverless function)
- `/*`     → `frontend/` (static files)

---

## Admin dashboard

The admin page is intentionally hidden — navigate to it by typing **"admin"**
anywhere on the page (no input focused). You'll be prompted for your
`ADMIN_PASSWORD`.

On login, a JWT is stored in `localStorage` so you stay logged in for 7 days.
Use the dashboard to publish blog posts and add library reviews; they persist
to the database and appear on the public pages immediately.

---

## API reference

### `POST /api/auth/login`
```json
// Request
{ "password": "your-admin-password" }

// Response
{ "token": "eyJ..." }
```

### `GET /api/posts`
Returns array of posts, newest first. Public.

### `POST /api/posts`
Requires `Authorization: Bearer <token>`.
```json
{ "title": "...", "date": "Jul 2026", "tag": "ai", "excerpt": "..." }
```
Tags: `ai` | `policy` | `research` | `hardware`

### `GET /api/reviews`
Returns array of library reviews. Public.

### `POST /api/reviews`
Requires auth. Fields: `title`, `author`, `type` (book/paper/article),
`accent` (indigo/teal/amber), `genre`, `rating`, `status`, `review`.

### `POST /api/contact`
```json
{ "name": "...", "email": "...", "message": "..." }
```

---

## Tech stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | Vanilla HTML/CSS/JS, Lucide icons, Google Fonts |
| Backend   | Node.js, Express 4                |
| Auth      | JWT (jsonwebtoken)                |
| Database  | PostgreSQL via pg — hosted on Supabase |
| Deploy    | Vercel (static + serverless)      |

---

## What changed from the original single-file version

| Before                        | After                                  |
|-------------------------------|----------------------------------------|
| 1100-line `index.html`        | Split into `index.html` + `styles.css` + `app.js` |
| Origami cranes via canvas divs | Polished SVG cranes with CSS keyframe animation |
| No portrait section           | Hero grid with portrait photo slot (`images/me.png`) |
| No backend                    | Express API with 4 routes              |
| No auth                       | JWT login, verifyJWT middleware        |
| Blog/library hardcoded in HTML | Fetched from PostgreSQL via API       |
| Admin writes to DOM only      | Admin writes to database, persists     |
| Not deployable                | Vercel-ready (`vercel.json`)           |

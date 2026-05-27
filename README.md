# MindTussle

**A high-performance, real-time gamified quiz execution engine and synchronized multiplayer battle platform built for rapid knowledge assessment.**

MindTussle is a split-stack learning platform: a Vite-powered React client for quiz taking, admin authoring, and live battles; a Node.js/Express API for auth, scoring, and persistence; Socket.io for room-synchronized multiplayer; and MongoDB for durable state. The product is tuned for instructors and teams who need fair timers, defensible scoring, and rooms that stay up when players submit answers at the same millisecond.

---

## Table of contents

- [Core stack](#core-stack)
- [Architectural case study: Obsidian overhaul](#architectural-case-study-obsidian-overhaul)
- [Engineering features](#engineering-features)
- [Repository layout](#repository-layout)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Security and operations](#security-and-operations)
- [Contributing](#contributing)

---

## Core stack

| Layer | Technology | Role |
|--------|------------|------|
| **Client** | React 19, Vite 6, React Router 7 | SPA, code-split routes, production bundles |
| **API** | Node.js, Express 4 | REST, JWT auth, rate limits, structured errors |
| **Realtime** | Socket.io 4 | Battle rooms, leaderboards, guarded transitions |
| **Data** | MongoDB, Mongoose 8 | Users, quizzes, reports, notifications, sessions |
| **AI authoring** | Google Generative AI (Gemini) | Passage-to-quiz parsing with schema validation |

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## Architectural case study: Obsidian overhaul

We did not “reskin” MindTussle. We removed a whole class of UI complexity that was costing bundle size, routing time, and cognitive load without improving quiz outcomes.

### The Obsidian refactor

The app used to carry multiple theme configurations, preference toggles, and parallel styling paths. That made every screen a negotiation between theme tokens, legacy greens, and one-off overrides.

We collapsed to a **single premium dark system** with fixed anchors:

- Base surfaces: `#0F0C1D`, `#141125`
- Accent gradient: electric purple (`#a855f7`) → magenta (`#d946ef`)
- Semantic highlights: cyan for self-state, magenta for opponents in live views

`ThemeProvider` now hardcodes `data-theme="premium"`. Theme switching UI was removed from the product surface area. One visual language, fewer CSS branches, faster mental parsing for users mid-quiz.

### Glassmorphic execution interface

Interactive surfaces use a consistent glass recipe instead of flat cards or bright form fields:

- `backdrop-filter: blur(12px)` on panels and auth forms
- `1px` translucent borders with subtle inner glow (`rgba(168, 85, 247, 0.2)` family)
- Primary actions use the purple→magenta gradient with explicit hover glow (`box-shadow` tuned per component, not a generic “hover: brighter”)
- Display headings use increased letter-spacing for hierarchy without extra font files

Login, quiz taking, dashboards, and admin authoring all pull from the same vocabulary so the app reads as one product, not a theme demo.

### Elimination of UI overhead

We deliberately cut features that added state and bytes but not learning value:

- Standalone support/ticket flows removed from primary navigation
- Redundant sidebar metrics (streak blocks, “today’s progress” duplicates) **migrated into the main dashboard** as glass cards
- User settings trimmed: **Preferences** and **Privacy** tabs removed; profile focuses on name and avatar
- **Social** nav cluster reduced to **Compete** (Challenges, Live Battles, Battles only)
- Notification tray filters no longer expose a **Social** category

Net effect: leaner client bundles, fewer dead routes, and less state that could desync between sidebar and dashboard.

---

## Engineering features

### A. Stateful, anti-exploit real-time battle engine

Live battles run on a custom Socket.io layer (`initializeRealTimeQuiz` in `backend/controllers/realTimeQuizController.js`).

**Room flow**

- JWT-authenticated sockets join named rooms
- Host starts quiz; clients receive `new_question`, submit via `submit_answer`, see `leaderboard_update` and `question_results`

**Race-condition prevention**

Concurrent “all players answered” events used to fire `nextQuestion` twice and crash nodemon under load. We added:

- `isTransitioning` on each room
- `pendingAdvanceTimer` deduplication
- `tryAdvanceQuestion()` so only one transition runs at a time

**Strict attempt validation**

- Server rejects a second answer for the same `userId` on the same question index (duplicate score / XP exploit)
- Client locks option buttons after first click (`hasAnswered`) until `new_question` resets the UI

### B. Flawless quiz execution window

Solo quizzes (`TakeQuiz.jsx`) are built for uninterrupted focus:

- **No pause/resume** — timer runs continuously; metrics stay honest
- Fullscreen gate optional entry; auto-submit on leave, escape, or timer expiry with guarded paths
- Report creation validates empty question payloads and returns `400` instead of throwing unhandled errors
- Startup hook removes a known corrupt demo quiz document from MongoDB after connect (`cleanCorruptQuizzes` in `server.js`)

### C. AI-driven quiz creation pipeline

Admin **Quiz Creator** (`/admin/create`) sends a user-provided passage to Gemini via `POST /api/quizzes/gemini-autofill`.

This is **context parsing**, not open-ended generation: the model is constrained to extract factual Q&A from the supplied text and map into the app’s question schema (options, correct letter, difficulty). The UI placeholder tells authors to paste source material explicitly so expectations stay grounded.

Requires `GEMINI_API_KEY` on the backend.

### D. Consolidated performance dashboard

The user home dashboard surfaces:

- Day streak and best streak
- Today’s progress focused on **quizzes completed** (XP/time bars removed from that card to reduce noise)
- XP bar, recent activity, and quiz discovery in the same obsidian/glass layout

Sidebar no longer duplicates streak widgets; one source of truth on the dashboard.

---

## Repository layout

```
mindtussle/
├── frontend/          # React + Vite client
│   ├── src/
│   │   ├── components/    # Layout, battles, notifications, loading
│   │   ├── pages/         # Home, TakeQuiz, AdminCreateQuiz, etc.
│   │   └── context/       # ThemeProvider (premium only)
│   └── package.json
├── backend/           # Express API + Socket.io
│   ├── controllers/       # REST + realtime quiz logic
│   ├── models/
│   ├── routes/
│   ├── scripts/           # seed.js
│   └── server.js          # HTTP server entry
└── README.md
```

---

## Local setup

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **MongoDB** 6+ running locally or a hosted URI
- **npm** 9+

### 1. Clone and install

```bash
git clone <your-repo-url>
cd quiz-mindtussle

cd frontend
npm install
cd ..

cd backend
npm install
cd ..
```

### 2. Configure environment

Create `backend/.env` (never commit real secrets):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mindtussle
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
GOOGLE_SECRET=replace_with_session_signing_secret
FRONTEND_URL=http://localhost:5173

# Optional: Quiz Creator autofill
GEMINI_API_KEY=your_gemini_api_key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

The frontend talks to the API via axios; ensure your Vite proxy or `config` points at `http://localhost:5000` if you customize ports.

### 3. Seed sample data (optional)

```bash
cd backend
npm run seed
```

### 4. Run development servers

**Terminal A — API**

```bash
cd backend
npm run dev
```

**Terminal B — Client**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. API health: `GET http://localhost:5000/ping`.

### 5. Production build (frontend)

```bash
cd frontend
npm run build
npm run preview
```

Serve `frontend/dist` behind your CDN or static host; point API `FRONTEND_URL` at that origin for CORS and cookies.

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signs API auth tokens |
| `GOOGLE_SECRET` | Yes | Express session secret (OAuth flow) |
| `FRONTEND_URL` | Prod | CORS allowlist and OAuth redirects |
| `GEMINI_API_KEY` | For AI quiz | Gemini autofill in Quiz Creator |
| `GOOGLE_CLIENT_ID` | OAuth | Google sign-in |
| `GOOGLE_CLIENT_SECRET` | OAuth | Google sign-in |
| `GOOGLE_CALLBACK_URL` | OAuth | Must match Google console |
| `PORT` | No | API port (default `5000`) |
| `NODE_ENV` | No | `production` enables stricter cookies/session store |
| `RENDER` | No | Trust proxy / hosting hints on Render |

---

## Scripts

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Nodemon + `server.js` |
| `npm start` | Production API |
| `npm run seed` | Seed database |
| `npm test` | Jest |
| `npm run check-models` | Verify Gemini model availability |
| `npm run db:index` | Initialize/ensure production MongoDB indexes |

---

## Security and operations

- **Helmet**, **express-rate-limit**, and **express-mongo-sanitize** on the API
- JWT on protected routes; Socket.io handshake validates the same token
- Rate limits on login/register in production
- Session cookies: `httpOnly`, `secure` in production, `sameSite` tuned for cross-site deploys
- **Do not commit** `.env` files or API keys; rotate any key that was ever checked into a chat or screenshot

On boot, the server runs a one-time cleanup for a broken demo quiz title/id so bad seed data cannot break report flows.

---

## Contributing

1. Branch from `main` (or your team’s default branch).
2. Keep changes scoped: UI in `frontend/`, API/socket logic in `backend/`.
3. Run `npm run lint` / tests in the package you touched.
4. Open a PR with what changed and why — especially for realtime or scoring logic.

---

## License

See repository license file. Third-party assets (fonts, Google OAuth branding) remain subject to their respective terms.

---

## Production deployment checklist (MindTussle)

### 1. Environment and configuration

- **Set core environment variables**
  - **Backend** (`backend/.env` in production secrets store, not committed):
    - `NODE_ENV=production`
    - `PORT` set to your API port (e.g. `8080` on Render, `3000` on AWS, or platform default)
    - `MONGO_URI` pointed at your production MongoDB cluster with TLS enabled
    - `JWT_SECRET` set to a long, random value (32+ chars) rotated via your secret manager
    - `FRONTEND_URL` set to the final HTTPS origin of the built client (e.g. `https://app.mindtussle.com`)
    - `GEMINI_API_KEY` configured in environments where AI quiz autofill is needed
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` set for the production OAuth project
    - Host-specific hints like `RENDER=true` or `TRUST_PROXY_DEPTH` as required by your platform
  - **Frontend** (`frontend/.env.production` or host env):
    - `VITE_BACKEND_URL` pointing at the production API base URL (e.g. `https://api.mindtussle.com`)
    - Ensure no development-only flags (e.g. `VITE_DEBUG_*`) are set in production.

- **Harden CORS and cookies**
  - Configure backend CORS `origin` to an explicit allowlist: **only** your production frontend origin(s).
  - Ensure Socket.io uses the same CORS rules for both HTTP and WebSocket upgrades.
  - In production (`NODE_ENV=production`), enable:
    - `secure: true` and `httpOnly: true` cookies where applicable.
    - `sameSite` tuned for your deployment (typically `lax`, or `none` with HTTPS if cross-site).

- **Proxy / load balancer awareness**
  - On platforms like **Render**, **Heroku**, **AWS ALB**, or **NGINX** in front of Node:
    - Enable `app.set("trust proxy", true)` or the equivalent depth configuration so rate limiting and IP logging remain accurate.
    - Forward `X-Forwarded-Proto` and `X-Forwarded-For` from your load balancer.

### 2. Database and performance

- **Schema and index verification**
  - Ensure MongoDB user has **least-privilege** access for the target database.
  - Create or verify indices for high-traffic queries:
    - On the `User` collection:
      - Index on `email` (unique) for auth.
      - Index on `quizStreak`, `xp`, or `totalXP` if used in leaderboards.
      - Index on `preferences.favoriteCategories` if used in recommendations.
    - On the `Quiz` collection:
      - Compound index on `{ title: 1, category: 1 }` to support search/filter UIs.
      - Index on `{ author: 1, isPublished: 1 }` if admin dashboards filter by owner.
    - On analytics/reporting collections:
      - Index on `{ user: 1, createdAt: -1 }` for user-specific history views.
      - Index on `{ quiz: 1, createdAt: -1 }` for quiz analytics.

- **Connection and pool tuning**
  - Configure MongoDB connection options to:
    - Use a small, bounded pool for low-traffic deployments.
    - Enable retryable writes and TLS as required by your provider.
  - Confirm timeouts (`serverSelectionTimeoutMS`, `socketTimeoutMS`) suit your network.

### 3. Frontend production build (Vite)

- **Build and artifacts**
  - From `frontend/`, run:
    - `npm install` (once)
    - `npm run build` to produce the optimized bundle in `dist/`.
  - Optionally run `npm run preview` locally to sanity-check the production build before deploying.
  - Upload or point your host (e.g. **Vercel**, **Netlify**, **CloudFront + S3**) at `frontend/dist`.

- **Vite-specific hardening**
  - Ensure `base` in `vite.config` matches your deployment path (root vs sub-path).
  - Disable or gate any development-only console logging or debug panels via `import.meta.env.DEV`.
  - Confirm that service worker / PWA registration (if enabled) points to the correct scope and HTTPS-only origin.

### 4. API deployment and runtime checks

- **Process management**
  - Use a robust process manager (e.g. **PM2**, **systemd**, or your platform’s built-in runner) for the backend:
    - Start command: `npm start` from `backend/` with `NODE_ENV=production`.
    - Ensure automatic restarts on crash and rolling updates where available.

- **Health and readiness**
  - Expose an inexpensive health endpoint (`/ping` or `/healthz`) and wire it into your load balancer’s health checks.
  - Verify:
    - JWT issuance and verification work end-to-end with the production `JWT_SECRET`.
    - Socket.io connections successfully negotiate from the built frontend through any CDN/proxy to the backend.

- **Logging and monitoring**
  - Confirm `winston` log output is:
    - Written to rotating files or your platform’s log stream.
    - Parsed by your log aggregation stack (e.g. CloudWatch, Datadog, ELK).
  - Redact or avoid logging PII and secrets; keep auth failures and IP changes observable.

### 5. Security, rate limiting, and operations

- **Security middleware**
  - Verify **Helmet**, **express-rate-limit**, and **express-mongo-sanitize** are enabled in production.
  - Tune rate limits for:
    - Login/register endpoints (strict, per-IP and per-account).
    - Quiz creation and AI-based endpoints (protect Gemini spend and abuse).

- **Secrets and rotations**
  - Store all secrets (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, OAuth keys) in a managed secret system:
    - e.g. AWS Secrets Manager, GCP Secret Manager, Render environment secrets, or GitHub Actions encrypted secrets.
  - Document a rotation procedure for compromised keys and tokens.

### 6. Final smoke tests before go-live

- **Functional passes**
  - Create and take a quiz end-to-end (including report generation).
  - Run at least one real-time battle with multiple clients to confirm WebSocket stability.
  - Check leaderboards, analytics dashboards, and bookmarks on realistic data.

- **Performance and resilience**
  - Run a short load test against quiz-taking and real-time endpoints to confirm:
    - No unexpected 5xx spikes.
    - Latency stays acceptable under target concurrency.
  - Validate auto-scaling or at least alerting exists for CPU, memory, and MongoDB performance.

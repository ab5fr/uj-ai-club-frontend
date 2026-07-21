# UJ AI Club — Frontend

The public-facing web application for the **University of Jordan AI Club**. Built with Next.js, it provides the landing page, weekly challenges, leaderboards, member profiles, blog, and an admin dashboard — backed by the [Rust/Axum API](../uj-ai-club-backend/README.md), **Firebase Authentication**, and a **Neon Postgres** connection for blog articles.

**Production:** [uj-aiclub.com](https://uj-aiclub.com) · **API:** [api.uj-aiclub.com](https://api.uj-aiclub.com)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
  - [Variable reference](#variable-reference)
  - [Build-time vs runtime](#build-time-vs-runtime)
  - [Firebase setup](#firebase-setup)
  - [Cross-repo configuration](#cross-repo-configuration)
- [Running Locally](#running-locally)
- [Building for Production](#building-for-production)
- [Routes](#routes)
- [Authentication Flow](#authentication-flow)
- [API Client & Articles](#api-client--articles)
- [Styling](#styling)
- [SEO & Metadata](#seo--metadata)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Related Repos](#related-repos)

---

## Overview

This frontend is a **Next.js 16 App Router** application that serves as the primary interface for club members and visitors. It handles:

- **Public pages** — landing, roadmap, blog, contact form
- **Member features** — weekly AI challenges, profile settings, leaderboards
- **Admin panel** — CRUD for challenges, notebooks, submissions, articles, and contact messages
- **Auth** — Firebase (Google sign-in + email/password) with backend session sync

Most authenticated features call the Rust API with a Firebase ID token. **Blog articles** are an exception: they use Next.js server actions that talk to Neon Postgres directly (same `users` table for admin checks), so article admin can still work when the Rust API is unreachable.

---

## Tech Stack

| Layer           | Technology                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org/) (App Router)                                                                                |
| UI              | React 19                                                                                                                      |
| Language        | JavaScript                                                                                                                    |
| Auth            | [Firebase Auth](https://firebase.google.com/docs/auth)                                                                        |
| Club API        | Native `fetch` via `lib/api.js` → Rust/Axum                                                                                   |
| Blog / articles | Server actions + [@neondatabase/serverless](https://neon.tech/) + [jose](https://github.com/panva/jose) (Firebase JWT verify) |
| Markdown        | `react-markdown` + `remark-gfm`                                                                                               |
| Icons           | Lucide React                                                                                                                  |
| Hero visual     | Custom SVG (`HeroNetworkSvg`)                                                                                                 |
| CSS             | Custom design system in `app/globals.css` (+ Tailwind v4 lightly)                                                             |
| Package manager | **npm**                                                                                                                       |

---

## Architecture

```mermaid
flowchart LR
  browser[Browser] --> nextApp[Next.js App]
  nextApp --> firebase[Firebase Auth]
  nextApp -->|"Bearer ID token"| api[Rust API :8000]
  nextApp -->|"Server actions"| neon[(Neon Postgres)]
  api --> db[(Postgres)]
  firebase -->|"ID token verification"| api
  firebase -->|"JWKS verify in Next"| neon
```

**Two data paths:**

| Feature                                        | Path                                           |
| ---------------------------------------------- | ---------------------------------------------- |
| Auth session, challenges, contact, submissions | Browser → `lib/api.js` → Rust API → Postgres   |
| Blog list/detail + article admin CRUD          | Next.js server actions → Neon (`DATABASE_URL`) |

**Request flow (authenticated, Rust API):**

1. User signs in via Firebase (Google or email/password).
2. `AuthContext` listens for token changes and calls `POST /auth/session` on the backend.
3. Backend returns the user record and `needsProfileCompletion` flag.
4. Subsequent API calls attach `Authorization: Bearer <firebase_id_token>`.
5. On `401`, the client signs out and redirects to `/login`.
6. If the Rust API is down, AuthContext keeps a limited Firebase identity so Neon-backed blog admin can still work for DB admins.

---

## Project Structure

```text
uj-ai-club-frontend/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout (fonts, AuthProvider, AppShell)
│   ├── page.js                   # Landing page
│   ├── globals.css               # Tailwind + primary design system
│   ├── actions/
│   │   └── articles.js           # Server actions for blog CRUD / admin check
│   ├── admin/                    # Admin dashboard & submission grading
│   │   ├── page.js
│   │   ├── components/           # Tab panels (articles, challenges, …)
│   │   └── submissions/[submissionId]/
│   ├── auth/complete-profile/    # Profile completion after first sign-in
│   ├── challanges/               # Weekly challenges (route spelling as-is)
│   ├── blog/                     # Blog index + [slug] articles
│   ├── login/                    # Email/password + Google sign-in
│   ├── signup/                   # Google-only registration
│   ├── roadmap/                  # Static AI learning roadmap
│   ├── settings/                 # User profile & avatar settings
│   ├── components/uoj/           # App shell, navbar, footer, hero SVG
│   ├── sitemap.js                # Dynamic sitemap
│   └── robots.js                 # SEO robots rules
├── components/                   # Shared components
│   ├── JsonLd.js                 # Structured data for SEO
│   ├── MarkdownContent.js        # Blog markdown renderer
│   └── ProtectedRoute.js         # Client-side route guard
├── contexts/
│   └── AuthContext.js            # Global auth state & session sync
├── lib/
│   ├── api.js                    # Client API layer (Rust backend)
│   ├── articles/                 # Neon schema, queries, JWT admin auth
│   ├── firebase.js               # Firebase app & auth initialization
│   ├── googleSignIn.js           # Google sign-in (popup + redirect fallback)
│   ├── metadata.js               # Shared metadata helpers
│   ├── site.js                   # Site URL constants
│   └── profileOptions.js         # University/major dropdown options
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── next.config.mjs               # CORS headers, image domains
├── jsconfig.json                 # Path alias: @/* → ./*
└── postcss.config.mjs            # Tailwind v4 PostCSS plugin
```

---

## Prerequisites

- **Node.js** 18.17+ (20 LTS recommended)
- **npm** (comes with Node.js)
- A running instance of the [backend API](../uj-ai-club-backend/README.md) (local or remote) for most features
- A **Neon** (or compatible Postgres) `DATABASE_URL` for blog/articles — typically the same DB the API uses
- A **Firebase project** with Authentication enabled (Google + Email/Password providers)

---

## Installation

```bash
cd uj-ai-club-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

On Windows PowerShell: `Copy-Item .env.example .env.local`

Fill in `.env.local` — see [Environment Variables](#environment-variables) below.

---

## Environment Variables

Copy the template and fill in values:

```bash
cp .env.example .env.local
```

On Windows PowerShell: `Copy-Item .env.example .env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Variable reference

| Variable                           | Required | Description |
| ---------------------------------- | -------- | ----------- |
| `NEXT_PUBLIC_API_URL`              | Yes      | Rust API base URL. No trailing slash. Dev: `http://localhost:8000`. Prod: `https://api.uj-aiclub.com`. |
| `NEXT_PUBLIC_SITE_URL`             | Yes      | Canonical public site URL. No trailing slash. Dev: `http://localhost:3000`. Prod: `https://uj-aiclub.com`. |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Yes      | Firebase Web API key (Console → Project settings → Your apps). |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes      | Usually `your-project.firebaseapp.com`. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Yes      | Firebase project ID. Used by the client SDK and by server-side JWT verify for article admin. Must match backend `FIREBASE_PROJECT_ID`. |
| `NEXT_PUBLIC_FIREBASE_APP_ID`      | Yes      | Firebase app ID (`1:…:web:…`). |
| `DATABASE_URL`                     | Yes*     | Server-only Neon/Postgres URL for blog articles and admin role checks. Never use `NEXT_PUBLIC_`. *Required for blog/admin articles; other pages still load without it. |

### Build-time vs runtime

Next.js embeds `NEXT_PUBLIC_*` into the client bundle **at build time**. Changing them requires restarting `npm run dev` or re-running `npm run build`.

| Kind | Variables | Where to set |
| ---- | --------- | ------------ |
| Build-time (public) | All `NEXT_PUBLIC_*` | `.env.local` (local) or host dashboard (Vercel, etc.) before build |
| Runtime (server) | `DATABASE_URL` | `.env.local` or host environment (never expose to the browser) |

### Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** → **Google** and **Email/Password**.
3. Register a **Web app** and copy the four `NEXT_PUBLIC_FIREBASE_*` values.
4. Match `NEXT_PUBLIC_FIREBASE_PROJECT_ID` to the backend `FIREBASE_PROJECT_ID`.
5. Authorized domains: `localhost` for local; production host (e.g. `uj-aiclub.com`) for prod.

### Cross-repo configuration

| Frontend                          | Backend               | Notes |
| --------------------------------- | --------------------- | ----- |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `FIREBASE_PROJECT_ID` | Same Firebase project |
| `NEXT_PUBLIC_API_URL`             | Public API URL / CORS | Frontend must call a reachable API; backend `CORS_ALLOWED_ORIGINS` must include `NEXT_PUBLIC_SITE_URL` |
| `DATABASE_URL`                    | `DATABASE_URL`        | Same Neon DB so article admin can resolve `users.role` |

---

## Running Locally

Start the backend first (see [backend README](../uj-ai-club-backend/README.md)), verify `http://localhost:8000/health`, then:

```bash
npm run dev
# or: npm run dev:turbo
```

Open [http://localhost:3000](http://localhost:3000).

| Service         | URL                     |
| --------------- | ----------------------- |
| Frontend        | http://localhost:3000   |
| Backend API     | http://localhost:8000   |
| JupyterHub      | http://localhost:8888   |
| Grading service | http://localhost:9100   |

Challenge notebooks need the [backend](../uj-ai-club-backend/README.md) running (API + JupyterHub + grading).

---

## Building for Production

```bash
npm run build
npm start
```

Listens on port **3000** (`PORT` to override). Ensure `.env.local` (or the host environment) has all variables from [Environment Variables](#environment-variables) before building, so `NEXT_PUBLIC_*` are embedded correctly.

---

## Routes

| Route                               | Auth           | Description                                                    |
| ----------------------------------- | -------------- | -------------------------------------------------------------- |
| `/`                                 | Public         | Landing page — stats, leaderboard preview, contact form        |
| `/roadmap`                          | Public         | Static AI learning roadmap (3 phases)                          |
| `/blog`                             | Public         | Blog index (Neon)                                              |
| `/blog/[slug]`                      | Public         | Blog article (Neon + markdown)                                 |
| `/challanges`                       | Protected      | List and start weekly AI challenges                            |
| `/login`                            | Public         | Email/password + Google sign-in                                |
| `/signup`                           | Public         | Google-only registration                                       |
| `/auth/complete-profile`            | Semi-protected | Complete name, university, major; link password                |
| `/settings`                         | Protected      | Edit profile, upload avatar, change password                   |
| `/admin`                            | Admin          | CRUD for articles, challenges, notebooks, submissions, contact |
| `/admin/submissions/[submissionId]` | Admin          | View and grade student notebook submissions                    |

> The challenges route is spelled `/challanges` (as in the current codebase).

Protected routes use `components/ProtectedRoute.js`, which redirects unauthenticated users to `/login` and users with incomplete profiles to `/auth/complete-profile`.

Admin access is `users.role === 'admin'` (from the API session and/or a Neon check via `checkAdminAction`).

---

## Authentication Flow

```mermaid
sequenceDiagram
  participant User
  participant Firebase
  participant Frontend
  participant Backend

  User->>Frontend: Sign in (Google or email/password)
  Frontend->>Firebase: Authenticate
  Firebase-->>Frontend: ID token
  Frontend->>Backend: POST /auth/session (Bearer token)
  Backend->>Firebase: Verify JWT via Google JWKS
  Backend-->>Frontend: { user, needsProfileCompletion }
  Frontend->>Frontend: Store user in AuthContext
  alt needsProfileCompletion
    Frontend->>User: Redirect to /auth/complete-profile
  end
```

Key files:

- `lib/firebase.js` — Firebase initialization (client-only, lazy)
- `contexts/AuthContext.js` — global auth state, session sync, limited offline mode
- `lib/googleSignIn.js` — Google popup with redirect fallback
- `components/ProtectedRoute.js` — route guard
- `lib/articles/auth.js` — server-side Firebase JWT verify for article admin

---

## API Client & Articles

### Rust API (`lib/api.js`)

```js
import { challengesApi, userApi } from "@/lib/api";

const challenges = await challengesApi.list();
```

| Group                     | Endpoints                                 |
| ------------------------- | ----------------------------------------- |
| `authApi`                 | `/auth/session`, `/auth/complete-profile` |
| `leaderboardApi`          | `/leaderboards`                           |
| `challengesApi`           | `/challenges/*`                           |
| `userApi`                 | `/users/profile`, `/users/avatar`         |
| `contactApi`              | `/contact`                                |
| `adminChallengesApi`      | `/admin/challenges/*`                     |
| `adminNotebooksApi`       | `/admin/notebooks/*`                      |
| `adminSubmissionsApi`     | `/admin/submissions/*`                    |
| `adminContactMessagesApi` | `/admin/contact-messages`                 |

Image URLs from the API are resolved via `getImageUrl()`, which prepends `NEXT_PUBLIC_API_URL`.

### Blog / articles (server actions)

| Piece                           | Role                                                     |
| ------------------------------- | -------------------------------------------------------- |
| `app/actions/articles.js`       | Create/update/delete/visibility + `checkAdminAction`     |
| `lib/articles/db.js`            | Neon client + `articles` schema ensure                   |
| `lib/articles/queries.js`       | SQL helpers                                              |
| `lib/articles/auth.js`          | Verify Firebase ID token; require `users.role = 'admin'` |
| `components/MarkdownContent.js` | Render article body                                      |

Public blog pages read from Neon on the server. Admin article tabs call the server actions with the current Firebase ID token.

---

## Styling

The UI uses a **custom CSS design system** in `app/globals.css` (Tailwind v4 is imported at the top; the bulk of the UI is semantic classes):

- CSS custom properties for the brand palette (navy, blue, orange)
- Semantic class names: `.page`, `.btn`, `.auth-page`, `.stat-num`, `.admin-page`, etc.
- Fonts: **Barlow** and **Barlow Condensed** via `next/font/google`, plus local display fonts under `public/fonts/`

Icons come from `lucide-react`.

---

## SEO & Metadata

- `app/sitemap.js` — dynamic sitemap (includes blog slugs from Neon)
- `app/robots.js` — disallows `/admin`, `/auth`, `/settings`, etc.
- `app/opengraph-image.js` and `app/twitter-image.js` — social preview images
- `components/JsonLd.js` — structured data (JSON-LD)
- `lib/metadata.js` — shared metadata helpers used in route layouts

---

## Deployment

Deploy on **Vercel** (or any Node.js host):

1. Connect the Git repository (this package or the monorepo with the correct root).
2. Set every variable from [Environment Variables](#environment-variables) in the hosting dashboard (`NEXT_PUBLIC_*` and `DATABASE_URL`).
3. Build command: `npm run build`
4. Start command: `npm start` (Vercel uses its own Next.js runtime)

`next.config.mjs` allows images from `https://api.uj-aiclub.com/**` and sets CORS headers for the App Router.

---

## Troubleshooting

| Problem                              | Likely cause                             | Fix |
| ------------------------------------ | ---------------------------------------- | --- |
| Firebase auth not working            | Missing or wrong env vars                | Set all four `NEXT_PUBLIC_FIREBASE_*` in `.env.local`, restart `npm run dev` |
| API calls fail with CORS             | Backend CORS or wrong API URL            | Check `NEXT_PUBLIC_API_URL`; add the site origin to backend `CORS_ALLOWED_ORIGINS` |
| Redirected to `/login` immediately   | Token expired or backend rejects session | Check backend logs; verify Firebase project IDs match |
| Blog empty / article admin errors    | Missing `DATABASE_URL`                   | Set server-only `DATABASE_URL` in `.env.local` or the host environment |
| Signed in offline                    | Rust API unreachable                     | Start the API; blog admin may still work if Neon + admin role are OK |
| Images not loading                   | Wrong API base URL                       | `getImageUrl()` prepends `NEXT_PUBLIC_API_URL` — no trailing slash |
| `401` on every request               | Firebase project mismatch                | Frontend project ID must equal backend `FIREBASE_PROJECT_ID` |
| Build fails with Turbopack           | Turbopack compatibility issue            | Run `next build` without `--turbopack` (edit `package.json` `build` script) |

---

## Related Repos

| Repo                                                  | Description                                                                       |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| [uj-ai-club-backend](../uj-ai-club-backend/README.md) | Rust/Axum REST API, PostgreSQL, Firebase token verification, challenges & grading |

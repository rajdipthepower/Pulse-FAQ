# ⚡ PulseFAQ — Crowd‑Sourced Q&A Platform (Filesystem‑Backed)

PulseFAQ is a lightweight, real‑time crowdsourced Q&A engine tailored for academic communities (IACS). The app combines a Vite + React frontend with a small Express backend that persists data to local JSON files — ideal for prototypes, teaching demos, and small teams that want an easy self‑hosted FAQ workflow.

## Project Overview

- **Purpose:** Provide a simple way for users to submit questions anonymously, and for trusted admins to curate, categorize, and publish authoritative answers.
- **Audience:** Course staff, student groups, campus teams or small organizations that need a moderated knowledge base without a heavyweight database.
- **Stack:** React (Vite) frontend, Express backend, local JSON files (`data/faqs.json`, `data/pending_aqs.json`).

## Core Features

- **Anonymous Crowdsourcing:** Anyone can post a question anonymously. Submissions land in a pending queue for staff review.
- **Admin Moderation Desk:** Admins receive pending AQs, can write official answers, assign categories (General, Technical, Admission, Research), and publish to the public feed either individually or in bulk.
- **Dynamic Sorting & Upvoting:** Live FAQs support upvotes/downvotes; the UI sorts by popularity (upvotes) and supports simple chronological views.
- **Smart Category Filtering:** Dedicated category tabs — **General**, **Technical**, **Admission**, **Research** — with client logic treating missing categories as **General** so uncategorized items still appear in the main stream.

## System Architecture & Data Flow

ASCII sketch:

Frontend (Vite) :5173
    |
    |  (dev proxy) `/api/*`
    v
Backend (Express) :4000
    ├─ `GET  /api`  -> returns sanitized array of approved FAQs (from `data/faqs.json`)
    ├─ `POST /api/aqs` -> add/merge into `data/pending_aqs.json`
    ├─ `POST /api/admin/approve` -> move item from `pending_aqs.json` -> `faqs.json`
    └─ other admin and faq endpoints (vote, edit, delete)

Data files (on disk):
  - `data/faqs.json`         (approved, publicly visible items)
  - `data/pending_aqs.json`  (anonymous submissions awaiting moderation)

Lifecycle trace (typical question flow):
1. User submits anonymously -> frontend POSTs to `POST /api/aqs`.
2. Backend validates and appends (or increments an existing pending item) in `pending_aqs.json`.
3. Admin opens the Moderation Desk (`GET /api/admin/pending`), writes an answer, picks a category, and clicks **Answer & Approve**.
4. Admin action `POST /api/admin/approve` moves the item from `pending_aqs.json` into `faqs.json` (written to disk).
5. The frontend triggers an immediate refresh (`fetch('/api')`) and the new FAQ appears in the public feed under its assigned category.

## Technical Design Decisions

- **Implicit Schema & Fallback IDs**: The stored objects are intentionally minimal (question/answer, counters, optional category). To provide stable keys for React list rendering and older datasets that lack explicit `id` fields, the server injects fallback identifiers on read like `faq-<index>` (e.g., `faq-12`). These fallback IDs are produced at response time and are not forced into disk unless an explicit ID exists.

- **Category Handling**: The client treats missing or empty `category` fields as `General` (case‑insensitive). This ensures uncategorized items appear under the **General** tab without extra admin work.

- **Optimistic UI & State Synchronization**: For a snappy UX, the app performs optimistic changes (e.g., vote increments) and immediately refetches authoritative lists after mutations. Key write flows call `fetch('/api')` after publish/approve/delete so the UI resynchronizes without requiring a browser reload.

- **Filesystem Persistence**: Using `fs.promises` to read/write `JSON.stringify(data, null, 2)` keeps the implementation simple and transparent. This is suitable for single‑server prototypes; for production, migrate to a transactional DB and secure authentication.

## API Reference (common endpoints)

- `GET /api` — returns the array of approved FAQs (server sanitizes and ensures every item has an `id` string for the UI).
- `POST /api/aqs` — submit anonymous question. Body: `{ "question": "..." }`.
- `POST /api/admin/login` — admin login (static credentials in prototype). Body: `{ email, password }`.
- `GET /api/admin/pending` — list pending AQs (requires admin token header `x-admin-token`).
- `POST /api/admin/approve` — approve a pending AQ. Body: `{ id, answer, category }`.
- `POST /api/admin/publish` — publish a new FAQ directly. Body: `{ question, answer, category, isFAQ }`.
- `PATCH /api/:id/vote` — increment upvote/downvote on a published FAQ.
- `PUT /api/:id` — edit a published FAQ (admin only).
- `DELETE /api/:id` — delete a published FAQ (admin only).

Note: the Express router mounts the FAQ routes at `/api` in dev proxy setups so the client can `fetch('/api')` in development.

## How to Run (local development)

Prerequisites: Node.js (16+ recommended) and npm.

From the repository root open two PowerShell terminals.

Terminal 1 — start backend:
```powershell
cd "c:\Users\user\Desktop\CURSOR IDE\team-6a314e2012663badc7eb1814\server"
npm install
npm start
```

Terminal 2 — start frontend (Vite dev server):
```powershell
cd "c:\Users\user\Desktop\CURSOR IDE\team-6a314e2012663badc7eb1814\client"
npm install
npm run dev
```

Vite (frontend) typically runs at `http://localhost:5173` and is configured to proxy `/api` to the Express server (default `http://localhost:4000`).

## Admin Quick Start

1. Open the client app and go to the Admin panel.
2. Login using the prototype credentials (see server config) — the app stores a static token in `localStorage` under `admin_token`.
3. Use the **Moderation Desk** to answer and approve pending AQs, or use **Manual FAQ Insertion** to publish directly.

> Tip: After publishing or approving an item the client triggers a `fetch('/api')` to refresh the public feed automatically.

## Data Files

- `data/faqs.json` — approved FAQs (single JSON array)
- `data/pending_aqs.json` — pending anonymous AQs (single JSON array)

Backups: keep a copy of these files when you run experiments or migrate to a database.

## Notes & Next Steps

- This repository is intentionally simple and geared toward teaching, prototyping, or lightweight deployments. Recommended upgrades for production:
  - Replace static admin tokens with a secure authentication flow (JWT/OAuth).
  - Move persistence to a proper datastore (Postgres, MongoDB, etc.) to support concurrency and transactional updates.
  - Add server‑side validation and rate limiting for anonymous submissions.

## License & Credits

PulseFAQ — lightweight FAQ crowdsourcing demo. Built as a small team prototype. Use and adapt freely for non‑commercial or educational projects.

---

Project: `team-6a314e2012663badc7eb1814` — PulseFAQ

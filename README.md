Python Interview FAQ & Preparation Portal (#Pulse-FAQ)

Python Interview FAQ & Preparation Portal is a full-stack web application built with React (Vite) and Express. It helps users browse, search, upvote, and contribute community-driven Python interview questions and answers while providing admins with a lightweight moderation dashboard.

**Why this project:** Tailored for engineers preparing for Python interviews, the app organizes questions into interview-focused categories, supports live searching and upvoting, and offers an admin-facing moderation workflow — all using simple, filesystem-backed storage for easy self-hosting and demos.

**Audience:** Job seekers, mentors, interviewers, and study groups looking for a collaborative, searchable repository of Python interview questions.

**Data storage:** Local JSON files: `data/faqs.json` (approved/public FAQs) and `data/pending_aqs.json` (pending submissions).

**Table of contents**

- Project Title & Description
- Core Features
- Tech Stack
- Local Installation & Setup
- Admin Quick Start
- Data Files
- Contributing & Notes

**Project Title & Description**

- **Title:** Python Interview FAQ & Preparation Portal
- **Description:** A full-stack web application built with React (Vite) and Express to manage, filter, upvote, and moderate Python programming interview questions.

**Core Features**

- **Dynamic Category Filtering:** Browse questions by four interview-focused categories: `Syntax & Basics`, `OOP Concepts`, `Data Structures`, and `Advanced Features`.
- **Live Search:** Instant, case-insensitive keyword searching across questions and answers for fast lookup.
- **Upvoting System:** Community-driven upvotes with local state tracking to prevent duplicate voting during a session.
- **Admin Moderation Dashboard:** Review anonymous user submissions, approve or reject pending FAQs, and inline-edit existing questions (including live category updates and answer edits).
- **Code-Snippets Ready:** Rich multi-line code block formatting with whitespace-preserving rendering so Python scripts and examples display cleanly.

**Tech Stack**

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express
- **Storage:** Local JSON files (`data/faqs.json`, `data/pending_aqs.json`)

**Local Installation & Setup**

Prerequisites: Node.js (16+ recommended) and npm.

Open two PowerShell terminals from the repository root.

Terminal 1 — Backend
```powershell
cd .\server
npm install
npm start
```

Terminal 2 — Frontend
```powershell
cd .\client
npm install
npm run dev
```

Notes:
- The frontend runs via Vite (usually at `http://localhost:5173`) and the dev proxy forwards `/api` to the Express backend (by default `http://localhost:4000`).
- If you prefer a single terminal, you can use a multiplexer or run the frontend and backend in background processes, but two terminals keep logs separate.

**Admin Quick Start**

1. Open the client app in your browser and navigate to the Admin panel.
2. Login with the prototype credentials found in the server config (for production, replace this with a proper auth flow). The app stores the admin token in `localStorage` under `admin_token`.
3. Use the Moderation Desk to review pending submissions, write answers, assign categories, and click **Approve** to publish.

**Data Files**

- `data/faqs.json` — approved/public FAQs (array)
- `data/pending_aqs.json` — pending anonymous submissions (array)

Back up these files before experimenting or migrating to a database.

**Contributing & Notes**

- This project is sized for demos and small self-hosted use. For production use-cases consider:
  - Replacing static admin tokens with secure authentication (JWT/OAuth).
  - Moving persistence to a database (Postgres, MongoDB) for concurrency and durability.
  - Adding rate limiting and server-side validation for submissions.

If you'd like, I can also update the client labels and category names to match these interview-focused categories (`Syntax & Basics`, `OOP Concepts`, `Data Structures`, `Advanced Features`).

---

Project: PulseFAQ (re-scoped to Python Interview FAQ & Preparation Portal)

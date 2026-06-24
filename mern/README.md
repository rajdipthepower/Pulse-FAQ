# Samagama Saarthi

> Connecting Questions, Knowledge, and Communities

AI-powered academic FAQ crowdsourcing and knowledge-sharing platform for students, faculty, researchers, and institutions.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui + TanStack Query + React Router v6
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (access + refresh) with bcrypt
- **AI:** Pluggable provider (OpenAI-compatible). Default `Professor Dr. Sudarshan` persona.

## Monorepo layout

```
mern/
  server/      Express API
  client/      React app (Vite)
```

## Quick start

### Prereqs
- Node 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or set `MONGO_URI`)

### Server
```bash
cd server
cp .env.example .env
npm install
npm run seed        # creates categories + admin user (admin@samagama.dev / Admin@123)
npm run dev         # http://localhost:5000
```

### Client
```bash
cd client
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

## User roles

- **student** — submit Qs/As, upvote, save, AI assistant
- **faculty** — student + verify/mark-correct, official responses
- **moderator** — approve content, manage categories, remove spam
- **admin** — full platform control, analytics, role management

## Brand

- Primary `#4338CA` • Secondary `#10B981` • Accent `#F59E0B`
- Background `#F8FAFC` • Text `#334155`
- Glassmorphism + modern university portal aesthetic

## API surface (high level)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me

GET    /api/users  (admin)
PATCH  /api/users/:id/role  (admin)
GET    /api/users/:id

GET    /api/categories
POST   /api/categories  (mod/admin)

GET    /api/faqs?search=&category=&tag=&sort=
POST   /api/faqs
GET    /api/faqs/:id
PATCH  /api/faqs/:id
DELETE /api/faqs/:id
POST   /api/faqs/:id/upvote
POST   /api/faqs/:id/save
POST   /api/faqs/:id/approve   (mod/admin)

POST   /api/faqs/:id/answers
POST   /api/answers/:id/upvote
POST   /api/answers/:id/verify   (faculty/mod/admin)
POST   /api/answers/:id/correct  (faculty/mod/admin)

POST   /api/faqs/:id/comments
POST   /api/comments/:id/reply

GET    /api/search?q=
GET    /api/search/suggestions?q=

GET    /api/analytics/overview   (admin)

POST   /api/ai/chat   (Professor Dr. Sudarshan)
```

## Deployment

- **Server:** Render / Railway / Fly.io. Set `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `CLIENT_URL`.
- **Client:** Vercel / Netlify. Set `VITE_API_URL`.
- **DB:** MongoDB Atlas.

## License

MIT

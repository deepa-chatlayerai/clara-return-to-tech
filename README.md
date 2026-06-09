# Clara

> Your return to tech, on your terms.

Clara helps women returning to tech after a career break find jobs, upskill in short sessions, track applications, and connect with other women on the same journey.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

```bash
docker-compose up -d
```

### 3. Set up environment variables

Copy `.env` and fill in the values:

- `NEXTAUTH_SECRET` — any long random string (run `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from [console.cloud.google.com](https://console.cloud.google.com)
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` — from [developer.adzuna.com](https://developer.adzuna.com) (free)

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
clara/
├── apps/
│   └── web/              ← Next.js 14 frontend
├── packages/
│   └── db/               ← Prisma schema + client
├── services/             ← Backend microservices (coming soon)
├── docker-compose.yml    ← PostgreSQL
└── .env
```

## Tech stack

- **Next.js 14** — frontend + API routes
- **Tailwind CSS** — styling
- **NextAuth.js** — auth (Google + email)
- **Prisma + PostgreSQL** — database
- **Anthropic Claude** — AI coach, CV tailoring, practice
- **Adzuna API** — job listings (Europe/Belgium)
- **Docker** — local database

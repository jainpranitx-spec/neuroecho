# NeuroEcho — Cognitive Arcade

A Next.js app with a Postgres backend (via Drizzle ORM) and Gemini-powered
AI features (story generation, Q&A assistant).

## 1. Install dependencies

```bash
npm install
```

## 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in:

- `DATABASE_URL` — already defaults to the local Docker Postgres below, no
  change needed for local dev.
- `GEMINI_API_KEY` — get a free one at https://aistudio.google.com/apikey.
  Optional: the AI story generator and "Ask NeuroEcho AI" assistant both
  fall back to static content if this is left blank.

`.env.local` is gitignored — it will never be committed.

## 3. Start Postgres

The easiest option is Docker. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
if you don't have it, then from this directory:

```bash
docker compose up -d
```

This starts a Postgres 16 container on `localhost:5432` with:
- user: `postgres`
- password: `postgres`
- database: `app_db`

(matches the default `DATABASE_URL` in `.env.example`).

**Don't want Docker?** Use a free hosted Postgres instead (e.g.
[Neon](https://neon.tech) or [Supabase](https://supabase.com)) — create a
project, copy its connection string into `DATABASE_URL` in `.env.local`,
and skip the `docker compose` step.

## 4. Create the database tables

The schema lives in `src/db/schema.ts`. A migration for it is already
generated in `drizzle/`. Apply it:

```bash
npm run db:migrate
```

Other useful commands:

| Command | What it does |
|---|---|
| `npm run db:generate` | Regenerate migration SQL after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:push` | Push schema changes directly without a migration file (quick local iteration) |
| `npm run db:studio` | Open Drizzle Studio, a web UI for browsing/editing your tables |

## 5. Run the app

```bash
npm run dev
```

Visit http://localhost:3000. Check http://localhost:3000/api/health — it
should return `{"ok":true}` once Postgres is reachable and migrated.

## Notes

- **The app works without a database configured** — API routes
  (`/api/profile`, `/api/sessions`, `/api/analytics`) catch DB errors and
  return sensible sample data instead of failing. Real persistence only
  kicks in once `DATABASE_URL` points at a real, migrated Postgres instance.
- **The app works without `GEMINI_API_KEY`** too — AI story generation
  and the AI assistant fall back to pre-written content.
- Run `npm run typecheck` and `npm run lint` before committing.

# FormRelay

FormRelay is a universal form backend for static, no-code, and AI-built websites. This repository keeps the frontend, API routes, Prisma schema, and infrastructure setup in one Next.js codebase.

## Stack

- Next.js App Router for frontend and backend routes
- PostgreSQL for data storage
- Prisma for ORM and schema management
- AWS SES for notification email delivery
- Docker for local parity and AWS Lightsail deployment readiness

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL with Docker:

```bash
docker compose up postgres -d
```

This exposes PostgreSQL locally on port `5188`.

3. Generate Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

Or run the full local stack with Docker:

```bash
docker compose up
```

## Verification

Run the current regression suite:

```bash
npm run test
npm run lint
npm run build
```

Run the local stack smoke test after the app is running:

```bash
npm run smoke:e2e
```

## Key routes

- `/` marketing site
- `/dashboard` application overview shell
- `/dashboard/submissions` clean and suspicious submissions
- `/dashboard/spam` blocked spam inbox
- `/docs` product documentation shell
- `/pricing` pricing preview
- `/api/health` service health check
- `/f/[publicFormId]` public form submission endpoint

## Demo seed

After `npm run db:seed`, you can log in with:

- `demo@formrelay.local`
- `demo12345`

## Migrations

The repo now includes a baseline Prisma migration in `prisma/migrations`. If your local database was created before the newer schema fields were added, apply the manual sync file once:

```bash
docker cp prisma/manual-sync.sql formrelay-postgres-1:/tmp/manual-sync.sql
docker exec formrelay-postgres-1 psql -U formrelay -d formrelay -f /tmp/manual-sync.sql
```

## Remaining Product Work

- Connect real SES delivery and password-reset emails
- Wire real billing and usage enforcement
- Add edit/pause/delete flows for websites and forms
- Add stronger filtering, bulk actions, and archive/delete UX in submissions
- Add file uploads, webhooks, and deeper workflow automations in later phases

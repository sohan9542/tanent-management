# Tanent — Multi-Tenant Property Management

A Next.js portfolio app for tenant defect reporting, ticket workflows, and role-based organization / platform administration. Built with Supabase for production-style auth and data, plus a **static demo mode** that runs without a database.

**Live demo:** [https://tanent-fx9d.vercel.app](https://tanent-fx9d.vercel.app)  
**Author:** [Sohanur Rahman](https://github.com/sohan9542) (`sohan9542`)

## Demo login (static — no database)

Works even when Supabase is unavailable. No seeding required. reCAPTCHA is bypassed for this portfolio demo.

| Page | Credentials | Action |
|------|-------------|--------|
| [`/login`](https://tanent-fx9d.vercel.app/login) | Tenant ID `DEMO-001` · Last Name `Demo` | **Fill demo** → Sign in |
| [`/org/login`](https://tanent-fx9d.vercel.app/org/login) | `org-demo@tanent.app` / `Demo123!` | **Fill demo** → Sign in |
| [`/platform/login`](https://tanent-fx9d.vercel.app/platform/login) | `demo@tanent.app` / `Demo123!` | **Fill demo** → Sign in |

Static cookie session (`tanent_static_demo`) with signed tokens. Platform admin demo views use in-memory sample orgs, objects, users, tenants, and tickets from `lib/demo-config.js`.

## Features

- **Tenant portal** — login by tenant ID + last name; dashboard, tickets, guided defect reporting
- **Guided defect wizard** — category, location, description, urgency, image uploads (up to 5 images, 5MB each)
- **AI-assisted follow-ups** — optional OpenAI questions to improve report quality (graceful when `OPENAI_API_KEY` is unset)
- **Pre-tickets** — clarification thread before finalizing a ticket
- **Platform admin** — organizations, objects (buildings), users, tenants, tickets, branding, locations
- **Organization admin** — org-scoped users, object roles, tickets, craftsmen
- **Object-based roles** — owner / technical / warranty assignments per object
- **Capmo integration** — optional ticket handoff / polling when Capmo env vars are set
- **Email notifications** — optional via Resend

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| Backend | Next.js Route Handlers |
| Database / Auth | Supabase (Postgres, Auth, Storage) |
| Email | Resend |
| AI | OpenAI (optional) |
| Integrations | Capmo API (optional) |
| Hosting (demo) | Vercel |

## Architecture

```
app/                  App Router pages + API routes
  login/              Tenant login (+ demo credentials panel)
  org/                Organization portal
  platform/           Platform admin portal
  admin/              Legacy admin UI (still present)
  api/                REST-style route handlers
  report-defect/      Multi-step defect wizard
lib/                  Shared server logic
  demo-config.js      Static demo credentials + sample data
  demo-token.js       Signed static demo session tokens
  demo-session.js     Cookie read helpers for demo sessions
  auth/               Tenant / admin session helpers
  supabase/           Browser + service-role clients
  integrations/capmo/ Capmo client, mapping, poll
  utils/              Validation, Excel/CSV import parsing
supabase/migrations/  SQL schema + RLS migrations
scripts/              One-off admin / hash helpers
tests/                Unit tests (demo session + validation)
```

**Auth model (high level):**

1. **Static demo** — credential match → HMAC-signed cookie → in-app sample data (no Supabase calls)
2. **Tenant** — last-name hash verify + DB session cookie (when Supabase is configured)
3. **Platform / org** — Supabase Auth + `platform_users` / memberships (when configured)

## Local setup

```bash
git clone https://github.com/sohan9542/tanent-management.git
cd tanent-management
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) and use the demo credentials above. Demo login works with empty Supabase env vars.

### Full stack (optional)

To use real Supabase auth/data instead of (or alongside) the static demo:

1. Create a Supabase project and fill `.env.local` from `.env.example`
2. Run SQL migrations in order under `supabase/migrations/`
3. Create a public Storage bucket `ticket-images` for uploads
4. Create platform users via Supabase Auth + `platform_users` (see `scripts/create-platform-user.js`)

## Environment variables

See [`.env.example`](.env.example) for names only. Highlights:

| Variable | Required for | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Real backend | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real backend | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Real backend | Server-only; never expose to the client |
| `SESSION_SECRET` | Demo + sessions | Signs static demo cookies |
| `OPENAI_API_KEY` | AI follow-ups | Optional |
| `CAPMO_API_KEY` / `CAPMO_WEBHOOK_SECRET` / `CRON_SECRET` | Capmo | Optional |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Email | Optional |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint (Next.js) |
| `npm run format` | Prettier write |
| `npm test` | Unit tests (`node --test`) |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes and PRs to `main`: `npm ci` → lint → test → build.

## Notes

- This is a **portfolio / demo** project. The live Vercel deployment is intentionally configured for static demo login.
- Typo in the product name (`tanent`) is historical and kept for existing URLs/cookies.
- Do not commit `.env.local` or real API keys.

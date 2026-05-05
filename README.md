# SiteBrief

Next.js marketing site (`/`), a guided intake (`/intake`), and an admin workspace (`/admin`) backed by **Supabase Postgres + Auth** and **Row Level Security**. Submission payload is persisted through a **validated server action** (not a direct anon insert from the wizard), paired with optional honeypot and field length guards.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (tokens in `src/app/globals.css`)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`): browser client, cookie-bound server client, middleware session refresh

## Prerequisites

- Node.js **20+**
- npm
- Supabase project: **anon** URL + anon key minimum; migrations applied (`supabase/migrations/`)

## Local development

```bash
npm install
```

Copy **`/.env.example`** → **`.env.local`** and fill in values (see Variable reference below).

For **local development**, set **`NEXT_PUBLIC_SITE_URL=http://localhost:3000`** in `.env.local` so canonical metadata and previews match `npm run dev` (production uses **`https://sitebrief.anakatech.llc`** in Vercel env).

```bash
npm run dev
```

Open `http://localhost:3000`. Routes: **`/`**, **`/intake`**, **`/intake/success`**, **`/admin`**, **`/admin/login`**, **`/auth/callback`** (OAuth / magic-link exchange only).

Production bundle check:

```bash
npm run build && npm run start
```

Lint:

```bash
npm run lint
```

## Deployment guide

Target any Node-friendly host (**Vercel**, **Railway**, **Fly.io**, VPS + `systemd`, etc.). Typical flow:

1. **Provision Supabase**  
   Run SQL migrations in order under `supabase/migrations/`:
   - `20260505120000_sitebrief_schema.sql` — core tables + RLS
   - `20260505193000_sitebrief_workflow_status.sql` — intake status defaults
   - `20260506120000_internal_price_estimate.sql` — optional admin-only pricing JSON column  
   Confirm RLS stays enabled—see **`docs/SUPABASE_RLS.md`**.

2. **Create Studio admin users** in Supabase Auth. Promote admins by setting JWT metadata (documented in the migration headers and **`docs/SUPABASE_RLS.md`**).

3. **Configure deployment environment** matching **`.env.example`**:  
   - **`NEXT_PUBLIC_SUPABASE_URL`**, **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (**required**)  
   - **`NEXT_PUBLIC_SITE_URL`** = **`https://sitebrief.anakatech.llc`** (canonical SEO + OG base)  
   - **`NEXT_PUBLIC_APP_NAME`**, **`NEXT_PUBLIC_BRAND_OWNER`** — see `.env.example` (optional `NEXT_PUBLIC_SITEBRIEF_*` override them)

4. **Configure Supabase Auth redirects** (Dashboard → Authentication → URL Configuration):

   Set **Site URL** to **`https://sitebrief.anakatech.llc`**. Under **Redirect URLs**, allow:

   - `https://sitebrief.anakatech.llc`
   - `https://sitebrief.anakatech.llc/admin`
   - `https://sitebrief.anakatech.llc/auth/callback`

   For local QA, also add **`http://localhost:3000/auth/callback`** (and **`http://127.0.0.1:3000/auth/callback`** if you use it).

5. **Build & run**  

   ```bash
   npm run build && npm run start
   ```

6. **Verify** intake submission end-to-end, then sign into **`/admin/login`** with an admin-privileged JWT and confirm the queue updates (`/` → `/admin` redirects here when unauthenticated).

### Deploying on Vercel · `sitebrief.anakatech.llc`

1. Import the repo, framework preset **Next.js**.
2. **Environment variables** (Production): mirror **`.env.example`**. Required: **`NEXT_PUBLIC_SUPABASE_URL`**, **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**. Set **`NEXT_PUBLIC_SITE_URL=https://sitebrief.anakatech.llc`**, **`NEXT_PUBLIC_APP_NAME=SiteBrief`**, **`NEXT_PUBLIC_BRAND_OWNER=Anakatech`** (and optionally `NEXT_PUBLIC_SITEBRIEF_*` as in the example).
3. **Custom domain in Vercel**: Project → **Settings → Domains** → add **`sitebrief.anakatech.llc`**, point DNS as below, wait for certificate provisioning.
4. **Cloudflare DNS** (registrar / DNS for `anakatech.llc`):

   | Type  | Name      | Target                | Proxy                         |
   |-------|-----------|------------------------|-------------------------------|
   | CNAME | `sitebrief` | **`cname.vercel-dns.com`** | **DNS only** first; test the site, then enable proxy if you want Cloudflare features. |

5. Run **Supabase migrations** on production (`supabase/migrations/`). Align **Supabase Auth** Site URL + **Redirect URLs** with **`https://sitebrief.anakatech.llc`** as listed in **Configure Supabase Auth redirects** above (plus local callback URLs if you test against `localhost`).
6. Create Auth users and attach **`role: "admin"`** in JWT metadata (`docs/SUPABASE_RLS.md`).
7. Smoke-test **`https://sitebrief.anakatech.llc/intake`**, **`/admin/login`**, and OAuth/magic links if you use them (they return via **`/auth/callback`**).

Avoid exposing **service-role** keys to the browser. This repo intentionally uses anon + cookie sessions for inserts under RLS unless you refactor to privileged server-only inserts.

### Favicon

`src/app/icon.svg` feeds Next’s metadata pipeline—no handwritten `<link>` is required unless you override it.

## White-label (single tenant)

Defaults live in **`src/config/brand.defaults.ts`**. **`getPublicBrand()`** in **`src/lib/sitebrief/brand.ts`** merges env in this order:

- **Product name**: `NEXT_PUBLIC_SITEBRIEF_APP_NAME` → else **`NEXT_PUBLIC_APP_NAME`** → else defaults (`SiteBrief`).
- **Operating / sidebar name**: `NEXT_PUBLIC_SITEBRIEF_STUDIO_DISPLAY_NAME` → else **`NEXT_PUBLIC_BRAND_OWNER`** → else defaults (`Your studio`).

So production can rely on **`NEXT_PUBLIC_APP_NAME`** + **`NEXT_PUBLIC_BRAND_OWNER`** alone; **`NEXT_PUBLIC_SITEBRIEF_*`** still wins when you need a one-off override.

- **Logo** (`NEXT_PUBLIC_SITEBRIEF_LOGO_URL`): `https://…` or **`/file-in-public.svg`**; omit for the accent pillar + wordmark (unchanged precedence).
- **Accent** (`NEXT_PUBLIC_SITEBRIEF_ACCENT`, optional **`NEXT_PUBLIC_SITEBRIEF_ACCENT_HOVER`**): injects `--color-accent` / `--color-accent-hover` in the root layout when set.
- **Notification inbox** (`SITEBRIEF_NOTIFICATION_EMAIL`): reserved for future transactional email; read server-side via `getNotificationEmailDestination()`.

Brand env is **baked at build time** (Next inlines `NEXT_PUBLIC_*`). Change env and **rebuild** the app for production.

## Variable reference (`.env.example`)

| Key | Scope | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_SITE_URL` | Client + server metadata | Canonical **`metadataBase`** + Open Graph **`url`** (**production**: `https://sitebrief.anakatech.llc`; **local**: `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_NAME` | Build / client | Product label when `NEXT_PUBLIC_SITEBRIEF_APP_NAME` is unset |
| `NEXT_PUBLIC_BRAND_OWNER` | Build / client | Admin / studio display name when `NEXT_PUBLIC_SITEBRIEF_STUDIO_DISPLAY_NAME` is unset |
| `NEXT_PUBLIC_SITEBRIEF_APP_NAME` | Build / client | Optional override — **wins over** `NEXT_PUBLIC_APP_NAME` |
| `NEXT_PUBLIC_SITEBRIEF_STUDIO_DISPLAY_NAME` | Build / client | Optional override — **wins over** `NEXT_PUBLIC_BRAND_OWNER` |
| `NEXT_PUBLIC_SITEBRIEF_LOGO_URL` | Build / client | Optional logo URL or `/public` path |
| `NEXT_PUBLIC_SITEBRIEF_ACCENT` / `…_HOVER` | Build / client | Brand accent CSS variables |
| `NEXT_PUBLIC_SITEBRIEF_SITE_TAGLINE`, `…_META_DESCRIPTION`, `…_EXPORT_SLUG` | Build / client | Optional copy & download slug |
| `SITEBRIEF_NOTIFICATION_EMAIL` | Server only | Future notification recipient (not public) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + edge + server | Supabase REST + Auth endpoints |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + edge + server | Anon publishable key; RLS constrained |
| `SUPABASE_SERVICE_ROLE_KEY` _(optional)_ | Server only | Never use in widgets; reserved for cron/ETL tooling you add |

## Supabase helpers

| Layer | Import |
|-------|--------|
| Client components needing auth/session | `@/lib/supabase/client` → `createSupabaseBrowserClient()` |
| Server Components, Route Handlers, Server Actions | `@/lib/supabase/server` → `createSupabaseServerClient()` |
| Middleware cookie refresh + `/admin` gate | `middleware.ts` → imports `updateSession` from `@/lib/supabase/middleware` |
| Supabase OAuth / magic-link exchange | **`src/app/auth/callback/route.ts`** — PKCE **`code`** → session cookies |

If **`NEXT_PUBLIC_*` Supabase keys are absent**, middleware **blocks `/admin` (except `/admin/login`)** and sends operators to `?error=config`. The marketing site and **`/intake` UI** still load; **submissions and sign-in stay disabled** until env is wired (`submitWebsiteIntakeAction` guards the same check server-side).

## Intake spam & submission protection

1. **`hp_company_url`** — visually hidden honeypot; trimmed value must stay empty (`intake-schema` superRefine).
2. **Server-side** `submitWebsiteIntakeAction` repeats Zod parsing + sanitized checkbox keys before inserting.
3. **Client** primary action shows **Submit Website Brief** only on the review step; sticky footer **Back** / **Continue**; `aria-busy` on `<form>` during network work.
4. **`deadline`** is normalized to **`YYYY-MM-DD`** for Postgres compatibility when parseable.

## Repository map

```
src/config/            brand.defaults.ts — human-readable defaults
src/app/               App Router layouts, pages, **`auth/callback`** route, icons
src/actions/           Server actions (admin + intake submit)
src/components/        Intake wizard, admin UI, layout primitives
src/lib/sitebrief/     brand.ts, mutations, queries, prompt pack compiler, internal price heuristic
middleware.ts          Supabase SSR refresh + /admin gates
docs/SUPABASE_RLS.md   High-level documentation of Postgres policies
supabase/migrations    Authoritative DDL + policies
```

## Troubleshooting quick hits

- **`/admin` redirects to `/admin/login?error=config`**: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing in this deployment.
- **`?error=forbidden` after login**: user authenticated but JWT lacks **`role: "admin"`**.
- **Empty admin queue**: Confirm JWT **`role: "admin"`** in `raw_app_meta_data` / metadata (same shape `sitebrief_is_admin()` expects).
- **Intake 400 / policy errors**: RLS denies insert/update—replay migrations or adjust policies consciously.
- **Missing metadata previews**: configure `NEXT_PUBLIC_SITE_URL`.
- **Price Estimate card absent / JSON errors**: Apply migration `20260506120000_internal_price_estimate.sql` so `internal_price_estimate` exists.

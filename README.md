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

```bash
npm run dev
```

Open `http://localhost:3000`. Routes: **`/`**, **`/intake`**, **`/admin`**, **`/admin/login`** (sign-in redirects when already elevated).

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
   Run SQL migrations (`20260505120000_sitebrief_schema.sql` plus later workflow patches). Confirm RLS stays enabled—see **`docs/SUPABASE_RLS.md`**.

2. **Create Studio admin users** in Supabase Auth. Promote admins by setting JWT metadata (documented in the migration headers and **`docs/SUPABASE_RLS.md`**).

3. **Configure deployment environment** matching **`.env.example`**:  
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (**required**)  
   - `NEXT_PUBLIC_SITE_URL` (**strongly recommended**), e.g. `https://app.example.com` so metadata/Open Graph resolves absolute URLs  

4. **Build & run**  

   ```bash
   npm run build && npm run start
   ```

5. **Verify** intake submission end-to-end, then sign into `/admin` with an admin-privileged JWT and confirm the queue updates.

Avoid exposing **service-role** keys to the browser. This repo intentionally uses anon + cookie sessions for inserts under RLS unless you refactor to privileged server-only inserts.

### Favicon

`src/app/icon.svg` feeds Next’s metadata pipeline—no handwritten `<link>` is required unless you override it.

## White-label (single tenant)

Defaults live in **`src/config/brand.defaults.ts`**. Runtime overrides merge from **`NEXT_PUBLIC_SITEBRIEF_*`** env vars in **`src/lib/sitebrief/brand.ts`** (`getPublicBrand()`).

- **Product name** (`NEXT_PUBLIC_SITEBRIEF_APP_NAME`): marketing chrome, metadata titles, prompt-pack markdown header, export filename slug default.
- **Operating / agency name** (`NEXT_PUBLIC_SITEBRIEF_STUDIO_DISPLAY_NAME`): admin sidebar and login headline.
- **Logo** (`NEXT_PUBLIC_SITEBRIEF_LOGO_URL`): `https://…` or **`/file-in-public.svg`**; omit for the accent pillar + wordmark.
- **Accent** (`NEXT_PUBLIC_SITEBRIEF_ACCENT`, optional **`NEXT_PUBLIC_SITEBRIEF_ACCENT_HOVER`**): injects `--color-accent` / `--color-accent-hover` in the root layout when set.
- **Notification inbox** (`SITEBRIEF_NOTIFICATION_EMAIL`): reserved for future transactional email; read server-side via `getNotificationEmailDestination()`.

Brand env is **baked at build time** (Next inlines `NEXT_PUBLIC_*`). Change env and **rebuild** the app for production.

## Variable reference (`.env.example`)

| Key | Scope | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_SITE_URL` | Client + server metadata | Canonical base URL for `metadataBase` and social previews |
| `NEXT_PUBLIC_SITEBRIEF_APP_NAME` | Build / client | Product / app label |
| `NEXT_PUBLIC_SITEBRIEF_STUDIO_DISPLAY_NAME` | Build / client | Admin-facing business or studio name |
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
| Middleware cookie refresh | `middleware.ts` → `updateSession` |

If **`NEXT_PUBLIC_*` Supabase keys are absent**, middleware becomes a lightweight pass-through—pages still compile, but **intake persists nothing** until env is wired.

## Intake spam & submission protection

1. **`hp_company_url`** — visually hidden honeypot; trimmed value must stay empty (`intake-schema` superRefine).
2. **Server-side** `submitWebsiteIntakeAction` repeats Zod parsing + sanitized checkbox keys before inserting.
3. **Client** disables submit while `Transmitting brief…`; `aria-busy` on `<form>` for assistive tech.
4. **`deadline`** is normalized to **`YYYY-MM-DD`** for Postgres compatibility when parseable.

## Repository map

```
src/config/            brand.defaults.ts — human-readable defaults
src/app/               App Router layouts, pages, icons
src/actions/           Server actions (admin + intake submit)
src/components/        Intake wizard, admin UI, layout primitives
src/lib/sitebrief/     brand.ts, mutations, queries, prompt pack compiler
middleware.ts          Supabase SSR refresh + /admin gates
docs/SUPABASE_RLS.md   High-level documentation of Postgres policies
supabase/migrations    Authoritative DDL + policies
```

## Troubleshooting quick hits

- **Empty admin queue**: Confirm JWT **`role: "admin"`** in `raw_app_meta_data` / metadata (same shape `sitebrief_is_admin()` expects).
- **Intake 400 / policy errors**: RLS denies insert/update—replay migrations or adjust policies consciously.
- **Missing metadata previews**: configure `NEXT_PUBLIC_SITE_URL`.

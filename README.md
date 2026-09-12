# MATHRA ZONE — "Your Creative Zone"

A real, production-ready creator resource platform: public resource pages,
search, categories, download tracking, and a secured admin dashboard for
uploading fonts, videos, photos, wallpapers, PNGs, templates and more.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase
(Postgres + Auth + Storage)**, ready to deploy on **Vercel**.

---

## 1. What's actually implemented (no mockups)

- **Public site**: home, `/resources`, `/category/[slug]`, `/resource/[slug]`,
  `/search`, `/featured`, `/latest`, `/about` — all reading live data from
  Supabase via server components.
- **Search**: Postgres full-text search (`tsvector`) across title,
  description, tags and file type, with an ILIKE fallback for partial words.
- **Filters**: category, newest, most downloaded, popular, A–Z, with real
  pagination (`?page=`).
- **Downloads**: `GET /api/download/[id]` looks the resource up, atomically
  increments `download_count` via a Postgres function, and returns the real
  Supabase Storage URL, which the browser then downloads. Every card and
  details page uses this — nothing is a fake button.
- **Admin dashboard** (`/admin`, protected by middleware + Supabase Auth +
  an `admin_users` allow-list table):
  - Add / edit / delete resources with **real file uploads** to Supabase
    Storage (main file, preview image, preview video).
  - Publish/unpublish and feature/unfeature toggles that immediately affect
    the public site (no rebuild, no redeploy — it's a live database read).
  - Dynamic categories: add a new category from the dashboard and it shows
    up in the public category grid instantly.
  - Dashboard stat cards (total resources, downloads, fonts, videos,
    photos, other) and a recent uploads table.
- **Security**: the Supabase **service role key never reaches the browser**
  — it's only used inside server-only API routes (`src/lib/supabase/admin.ts`),
  each of which calls `requireAdmin()` first. Row Level Security policies on
  every table are a second layer of protection even if a route were
  misconfigured. `/admin/*` is also blocked at the middleware level for any
  request without a valid Supabase session.

---

## 2. Supabase setup (one-time)

1. Create a project at [supabase.com](https://supabase.com).
2. **Database**: open the SQL Editor and run the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql). This creates the
   `categories`, `resources`, `site_backgrounds`, `admin_users` tables, the
   search index, the download/view counter functions, all Row Level
   Security policies, and seeds the 11 real categories.
3. **Storage**: go to Storage → Create a new bucket.
   - Name it exactly what you'll put in `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
     (default used throughout this project: `mathra-zone-files`).
   - Set it to **Public** (so downloads and previews work without signed
     URLs — writes are still locked down server-side by the service role
     key + `requireAdmin()`, so visitors still can never upload).
4. **Auth**: Authentication → Providers → make sure Email is enabled.
   Then Authentication → Users → **Add user** to create your own admin
   login (email + password).
5. Copy that new user's UUID (click the user, copy the ID) and run in the
   SQL Editor:
   ```sql
   insert into admin_users (id, email) values ('paste-the-uuid-here', 'you@example.com');
   ```
   Only rows present in `admin_users` can pass `requireAdmin()` or the RLS
   admin policies — this is what makes an authenticated user an "admin".
6. Grab your keys from Project Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server only — never
     prefix this with `NEXT_PUBLIC_`**)

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from step 2:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=mathra-zone-files
```

## 4. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` to sign in with the admin user you
created in step 2.4–2.5.

## 5. Try the core flow end to end

1. Log in at `/admin/login`.
2. Go to **+ Add Resource**, fill in a title, description, pick "Fonts" as
   the category, attach a `.ttf`/`.otf` file as the **Main file**, toggle
   **Published** on, and click **Publish Resource**.
3. Open the public site → **Fonts** category (or the homepage Fonts
   section) — the font is there immediately.
4. Open its details page — you'll see a live font preview rendered with the
   actual uploaded font (loaded via the Font Loading API), plus a
   **Download Font** button that downloads the real file and increments
   the download counter you can see back in the admin dashboard.

The same flow works identically for videos, photos, PNGs, templates, and
any other file type — the category and file type are the only things that
change.

## 6. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel: **New Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add the same environment variables from step 3 in Vercel's Project
   Settings → Environment Variables (set `NEXT_PUBLIC_SITE_URL` to your
   real Vercel domain once you have it, e.g. `https://mathra-zone.vercel.app`).
5. Deploy. No build configuration changes are required —
   `next.config.js` already allows images from `*.supabase.co`.

## 7. Project structure

```
src/
  app/
    page.tsx                 Home page
    resources/                All resources (filters + pagination)
    category/[slug]/          Category page
    resource/[slug]/          Resource details page
    search/                   Search page
    featured/, latest/        Curated views
    about/                    About page
    admin/
      login/                  Admin sign-in (Supabase Auth)
      (protected)/            Dashboard, resources CRUD, categories
                              — wrapped by middleware.ts + layout sidebar
    api/
      download/[id]/          Public download endpoint (counts + returns URL)
      admin/resources/        Admin CRUD (multipart upload + DB insert/update)
      admin/categories/       Admin category CRUD
      admin/backgrounds/      Section background image/video upload
  components/                 Navbar, Footer, Hero, ResourceCard, forms, etc.
  lib/
    supabase/client.ts        Browser client
    supabase/server.ts        Server client (RLS-bound to the session)
    supabase/admin.ts         SERVICE ROLE client — server-only, gated by requireAdmin()
    supabase/middleware.ts    Session refresh + /admin route protection
    queries.ts                All public-facing data reads
    auth.ts                   requireAdmin() helper
    types.ts, utils.ts, storage.ts
supabase/schema.sql            Full database schema, RLS policies, seed data
```

## 8. Notes on design decisions

- **"New Uploads" and "Featured Resources"** from the brief are implemented
  as computed views (`/latest`, `/featured`) over the same `resources`
  table, rather than as separate stored categories — they're dynamic
  slices (newest-first / `featured = true`), not a place you'd file a
  resource into. The 11 categories that are genuinely categories (Fonts,
  Background Videos, etc.) are real rows in the `categories` table and can
  be extended any time from **Admin → Categories**.
- **Background video/image system**: `site_backgrounds` stores one row per
  section id (`home`, `featured`, or a category slug) with a `media_type`
  of `none | image | video`. `POST /api/admin/backgrounds` uploads and sets
  it. Wire it into `Hero.tsx` / `CategoryGrid.tsx` by reading
  `getSiteBackground(id)` from `src/lib/queries.ts` for any section you
  want to make background-customizable beyond the built-in aurora effect.

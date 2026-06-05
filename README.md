# ⚡ LynkHive — Developer Link Vault

Your personal knowledge base. Store, organize, and search developer resources — articles, tools, repos, videos, docs, and more.

Backed by Supabase (Postgres). Works locally and in production without any filesystem dependency.

---

## Setup

### 1. Create Supabase project

Go to [supabase.com](https://supabase.com) → New Project. Wait for it to provision.

### 2. Run the schema

Dashboard → SQL Editor → New query → paste contents of `supabase/schema.sql` → Run.

This creates:
- `links` table with all columns, indexes, and RLS policies
- `categories` table (future-ready, pre-seeded)
- `set_updated_at` trigger
- Sample link rows

### 3. Get your credentials

Dashboard → Settings → API → copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **service_role key** (not anon key) → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure env vars

```bash
cp .env.local.example .env.local
# edit .env.local with your values
```

### 5. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
types/index.ts          → LinkStorage interface + all domain types
lib/database.types.ts   → Raw Supabase row types (DbLink, DbLinkInsert, etc.)
lib/supabase.ts         → Supabase client singleton (only file that imports @supabase/supabase-js)
lib/storage.ts          → SupabaseStorage: the ONLY file that talks to Supabase
app/api/links/route.ts  → imports storage, never Supabase directly
hooks/useLinks.ts       → calls API routes, never imports storage
components/             → call hooks, never API routes directly
```

### The access chain

```
Component → useLinks hook → /api/links route → storage → Supabase
```

No step can skip a level. Components cannot call API routes directly.
Hooks cannot call storage directly. API routes cannot call Supabase directly.

### Adding a new storage provider

1. Implement `LinkStorage` from `types/index.ts`
2. Change **one line** at the bottom of `lib/storage.ts`:
   ```ts
   export const storage: LinkStorage = new YourNewAdapter();
   ```
3. Zero changes to API routes, hooks, or components.

---

## API

| Method   | Route              | Storage method          |
|----------|--------------------|-------------------------|
| `GET`    | `/api/links`       | `storage.getLinks()`    |
| `POST`   | `/api/links`       | `storage.addLink()`     |
| `PATCH`  | `/api/links`       | `storage.updateLink()`  |
| `DELETE` | `/api/links?id=x`  | `storage.deleteLink()`  |
| `GET`    | `/api/links/:id`   | `storage.getLink(id)`   |
| `DELETE` | `/api/links/:id`   | `storage.deleteLink(id)`|
| `GET`    | `/api/export`      | `storage.exportLinks()` |
| `POST`   | `/api/analyze`     | (URL metadata scraper)  |

---

## Type hierarchy

```
DatabaseLink  (lib/database.types.ts)  ← raw Supabase row, snake_case
     ↓  toLink() mapper in storage.ts
Link          (types/index.ts)         ← app type, camelCase, safe for UI
```

Components and hooks only ever see `Link`. `DatabaseLink` is private to `lib/storage.ts`.

---

## Adding auth (future)

1. Enable Supabase Auth in the dashboard
2. Replace the public RLS policies in `schema.sql` with owner-scoped ones (see comments in schema)
3. Add `user_id = auth.uid()` to `addLink` in `lib/storage.ts`
4. Add a Supabase Auth client to the frontend — the rest of the app doesn't change

---

## Deploy to Vercel

```bash
vercel
```

Add env vars in Vercel Dashboard → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

No filesystem required. Supabase handles persistence.

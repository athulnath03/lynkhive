# ⚡ DevVault — Developer Link Vault

A production-quality personal knowledge base for developers. Store, organize, and search your most valuable development resources — articles, tools, GitHub repos, videos, docs, and more.

---

## 🖥️ Preview

Dark-mode, developer-aesthetic UI with:
- Glassmorphism surface cards
- Indigo accent color system
- Syne (display) + JetBrains Mono (code) font pairing
- Staggered card animations
- Responsive sidebar + grid layout

---

## 🏗️ Architecture

```
dev-link-vault/
├── app/
│   ├── api/
│   │   └── links/
│   │       └── route.ts          # GET / POST / DELETE API endpoints
│   ├── globals.css               # Design tokens, animations, glass effects
│   ├── layout.tsx                # Root layout with fonts + metadata
│   └── page.tsx                  # App shell — orchestrates all state
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Search bar, logo, add button
│   │   └── Sidebar.tsx           # Category nav + tag cloud
│   ├── links/
│   │   ├── LinkCard.tsx          # Individual resource card
│   │   └── LinkGrid.tsx          # Grid + skeleton + empty state
│   └── forms/
│       └── AddLinkForm.tsx       # Modal form with validation
│
├── hooks/
│   └── useLinks.ts               # All data fetching + filter logic
│
├── lib/
│   ├── db.ts                     # 🔑 Single swap point: mock → Supabase
│   ├── linkRepository.ts         # Repository implementations
│   └── categories.ts             # Category metadata (icons, colors)
│
├── data/
│   └── links.ts                  # 12 sample dev resources
│
├── types/
│   └── index.ts                  # All TypeScript types + LinkRepository interface
│
└── supabase/
    └── schema.sql                # Full Supabase schema + RLS + indexes
```

### Key Architectural Decisions

**Repository Pattern** — All database operations go through `LinkRepository` interface. Swap `mockRepository` for `supabaseRepository` in a single line in `lib/db.ts`. No UI components need to change.

**API Routes as boundary** — The `useLinks` hook only talks to `/api/links`. This means you can run the same frontend against any backend (mock, Supabase, Firebase, etc.) without touching hooks or components.

**Client-side filtering** — Search, category, and tag filtering run in-memory on the client. This is fast, instant, and works offline. With Supabase, you can optionally push filters server-side for larger datasets.

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd dev-link-vault
npm install
```

### 2. Run (Mock Mode)

No configuration needed — runs with in-memory mock data:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Switching to Supabase

### Step 1: Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API

### Step 2: Run the schema

In the Supabase SQL editor, paste and run `supabase/schema.sql`

### Step 3: Environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Install Supabase client

```bash
npm install @supabase/supabase-js
```

### Step 5: Uncomment Supabase repository

In `lib/linkRepository.ts`, uncomment the `supabaseRepository` export.

### Step 6: Swap the active repository

In `lib/db.ts`, change ONE LINE:

```ts
// Before (mock):
export const db = mockRepository;

// After (Supabase):
import { supabaseRepository } from "./linkRepository";
export const db = supabaseRepository;
```

That's it. Every component, hook, and API route continues to work unchanged.

---

## 🔍 Search & Filter

| Feature | Implementation |
|---|---|
| Text search | In-memory filter on title, description, tags, category |
| Category filter | Sidebar buttons, URL-state-friendly |
| Tag filter | Clickable tags on cards + sidebar cloud |
| Fuzzy search | Replace the filter in `useLinks.ts` with Fuse.js (stub ready) |

### Upgrading to Fuse.js

```bash
npm install fuse.js
```

In `hooks/useLinks.ts`, replace the text filter block with:

```ts
import Fuse from "fuse.js";

const fuse = new Fuse(links, {
  keys: ["title", "description", "tags", "category"],
  threshold: 0.35,
});

const filteredLinks = filter.query
  ? fuse.search(filter.query).map((r) => r.item)
  : links;
```

---

## 🧩 Component API

### `<LinkCard />`
| Prop | Type | Description |
|---|---|---|
| `link` | `DevLink` | The link data |
| `onDelete` | `(id: string) => void` | Called on delete confirm |
| `onTagClick` | `(tag: string) => void` | Filters by tag |

### `<AddLinkForm />`
| Prop | Type | Description |
|---|---|---|
| `onAdd` | `(p: NewLinkPayload) => Promise<void>` | Creates a link |
| `onClose` | `() => void` | Closes the modal |

### `useLinks()` hook
Returns `{ links, filteredLinks, isLoading, filter, setFilter, addLink, deleteLink, allTags }`

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0a0a0f` (near black) |
| Surface | `#111118` |
| Elevated | `#16161f` |
| Accent | Indigo 500 (`#6366f1`) |
| Display font | Syne (Google Fonts) |
| Mono font | JetBrains Mono |
| Border | `rgba(255,255,255,0.06)` |

---

## 📦 Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS 3**
- **Lucide React** (icons)
- **nanoid** (ID generation)
- **Google Fonts** (Syne + JetBrains Mono)
- Optional: **Fuse.js**, **Supabase**

---

## 📌 Roadmap Ideas

- [ ] Auth with Supabase Auth (personal vaults per user)
- [ ] Import bookmarks from browser export
- [ ] Link preview with Open Graph metadata fetch
- [ ] Drag-and-drop reordering
- [ ] Bulk import via JSON
- [ ] Public shared vault URLs
- [ ] Chrome extension to save links with one click

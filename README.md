# Nexreff Creative Space

A personal creative portfolio platform for showcasing photography, art, guitar sessions, video journals, creative writing, and tech projects. Built as a responsive Progressive Web App (PWA) with a full admin dashboard.

## Features

- **Photography Gallery** — Masonry-style gallery with category filters, search, sorting, and lightbox
- **Art & Sketchbook** — Gallery for pencil sketches, digital art, illustrations, and character designs
- **Guitar Sessions** — Video gallery supporting direct upload and YouTube embeds
- **Video Journal** — Cinematic video collection with lazy-loaded playback
- **Creative Journal** — Article system with draft/published states and HTML content
- **Tech Projects** — Project showcase with technology tags, GitHub and demo links
- **Collections** — Curated groups of works organized by theme
- **Search** — Cross-content search across all media, journal, and projects
- **Admin Dashboard** — Full CRUD media manager, drag-and-drop upload, journal editor, collection manager, and site settings
- **PWA** — Installable on desktop and mobile, with offline fallback for static assets

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS (custom design tokens) |
| Data fetching | TanStack Query |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |
| Testing | Vitest, React Testing Library, Playwright |
| Hosting | Cloudflare Pages |
| Version control | GitHub |

## Architecture

```
nexreff-creative-space/
├── src/
│   ├── app/           # Router and providers
│   ├── components/    # UI, layout, gallery, media components
│   ├── hooks/          # Auth, data fetching, toast hooks
│   ├── lib/            # Supabase client, storage, validation, utils
│   ├── pages/          # Public pages and admin pages
│   ├── types/          # TypeScript types matching DB schema
│   └── styles/        # Global CSS
├── supabase/
│   └── migrations/    # SQL schema and RLS policies
├── tests/
│   ├── unit/           # Vitest unit tests
│   └── e2e/            # Playwright E2E tests
├── public/            # PWA manifest, icons, robots.txt
└── [config files]
```

The app uses lazy-loaded routes for code splitting. Public pages are served through a shared `Layout` (navbar + footer). Admin pages use a separate `AdminLayout` with a sidebar, protected by Supabase Auth session verification.

All data flows through Supabase with Row Level Security (RLS) policies:
- Public visitors can only read published content
- Only authenticated admin users can create, update, or delete content
- Draft journal posts are invisible to the public

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- A free [Supabase](https://supabase.com) account
- A free [GitHub](https://github.com) account
- A free [Cloudflare](https://cloudflare.com) account (for deployment)

## Installation

```bash
# Clone the repository
git clone https://github.com/ReffkiAndreaPratama/nexreff-creative-space.git
cd nexreff-creative-space

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Environment Setup

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

These are the **public** anon/publishable keys — safe to include in frontend code. They are protected by RLS policies. **Never** put your `service_role` key in frontend code.

Find your keys in: Supabase Dashboard → Project Settings → API.

## Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com) and create a new project (Free tier)
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/0001_init_schema.sql` and paste it into the SQL editor
4. Run the query — it creates all tables, indexes, triggers, and RLS policies

## Storage Setup

1. In Supabase Dashboard, go to Storage
2. Create a bucket named `public-media` — set it to **Public**
3. Create a bucket named `private-media` — keep it **Private**
4. Run the storage policy SQL from the bottom of the migration file (it creates storage object policies)

## Admin Account Setup

1. In Supabase Dashboard, go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter the admin email and a strong password
4. The user is now able to log in to `/admin/login`

No public registration is enabled. Only users created through the Supabase Dashboard can access the admin area.

## Running Locally

```bash
npm run dev
```

The app will start at `http://localhost:5173`.

## Building

```bash
npm run build
```

Output is in the `dist/` directory.

## Testing

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# E2E tests (requires the app running)
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Deployment (Free — Cloudflare Pages)

1. Push your code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Create a new project → Connect to GitHub → Select your repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy

Cloudflare Pages provides a free `*.pages.dev` subdomain. No custom domain required.

The `public/_redirects` file ensures SPA routing works correctly — all routes fall back to `index.html`.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key | Yes |

## Limitations of Free Tier

- **Supabase Storage:** 1 GB on the free plan. Photos and images should be optimized before upload. Large videos should be embedded via YouTube instead of uploaded directly.
- **File size limit:** 50 MB per file upload (Supabase free tier).
- **Project pausing:** Supabase free projects may be paused after 1 week of inactivity. Unpause from the dashboard.
- **Cloudflare Pages:** 500 builds per month, unlimited bandwidth and requests on the free plan.
- **PWA limitations:** This is a web app, not a native Android/iOS app. Push notifications require a paid service and are not included.

## Troubleshooting

**Login doesn't work:** Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in `.env`. Verify the admin user exists in Supabase Authentication.

**Uploads fail:** Check that storage buckets `public-media` and `private-media` exist. Verify storage policies have been applied. Check if the file exceeds 50 MB or if the storage quota is full.

**Blank page after deploy:** Ensure the `_redirects` file is in the `public/` directory so it's included in the build output. Cloudflare Pages needs this for SPA routing.

**Content not showing:** Verify RLS policies are applied. Public visitors can only see content with `visibility = 'public'` (media) or `status = 'published'` (journal).

## Security Notes

- The frontend uses only the public anon key — protected by Row Level Security
- The `service_role` key is never used in frontend code
- File uploads are validated by MIME type (not just extension)
- Journal content is sanitized to remove script tags and event handlers
- Admin routes are protected by session verification
- Storage buckets have policies preventing public writes/deletes

## Backup

To back up your data:
1. **Database:** Use Supabase Dashboard → Database → Backups, or `pg_dump`
2. **Media files:** Download files from Supabase Storage buckets
3. **Code:** Your Git repository on GitHub

## License

MIT License — see [LICENSE](./LICENSE) file.

# Lithioo Perfumes — E-commerce + Admin Dashboard

A luxury perfume e-commerce app built with **React 18 + Create React App + Tailwind 3**, bilingual EN/AR with RTL support and dark mode.

The project now includes a full **Admin Dashboard** at `/admin`, backed by **Supabase** (Postgres + Auth + Storage + RLS).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v7, Tailwind CSS 3, Framer Motion |
| Admin backend | Supabase (Postgres + Auth + Storage + Realtime) |
| State / Data | @tanstack/react-query, React Context |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Languages | English + Arabic (RTL) |

---

## Environment Setup

1. Copy `.env.example` → `.env.local` and fill in your Supabase values:

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

> **Never commit `.env.local` or any file containing `SUPABASE_SERVICE_ROLE_KEY`.**

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The storefront still works without Supabase (falls back to static data files). The admin dashboard requires Supabase.

---

## Supabase Setup

> 📖 **للتوثيق العربي الشامل وتفاصيل الجداول والـ RPC والأمان، راجع:** [`README_BACKEND.md`](README_BACKEND.md) أو [`supabase/README.md`](supabase/README.md).

### 1. Apply Migrations

Open your Supabase project → **SQL Editor**, paste and run:

```
supabase/migrations/0001_initial_schema.sql
```

This creates all tables, enums, RLS policies, and RPCs.

### 2. Create Storage Buckets

In Supabase Dashboard → **Storage**, create these buckets with **Public** access:

- `product-images`
- `brand-logos`
- `hero`
- `reviews`

### 3. Seed Initial Data

Add `SUPABASE_SERVICE_ROLE_KEY=<your service_role key>` to `.env.local` (never commit), then run:

```bash
node scripts/seed-supabase.mjs          # brands, sections, settings, hero, reviews
node scripts/seed-products-full.mjs     # all ~286 products
```

The seed scripts are **idempotent** — safe to re-run.

### 4. Create Your First Admin Account

1. Go to Supabase Dashboard → **Auth** → **Users** → **Invite User**, enter your email.
2. Confirm the email and set a password.
3. Copy the user UUID, then run this SQL in the SQL Editor:

```sql
INSERT INTO profiles (id, full_name, role)
VALUES ('<paste-user-uuid-here>', 'Admin Name', 'admin');
```

4. Log in at `/admin/login`.

---

## Admin Dashboard

- **URL**: `/admin`
- **Login**: `/admin/login` — email + password (Supabase Auth)
- **Roles**: `admin` > `manager` > `staff` (enforced both in UI and via Supabase RLS)

### Pages

| Page | Path |
|---|---|
| Overview (KPIs + charts) | `/admin` |
| Orders | `/admin/orders` |
| Order Detail | `/admin/orders/:id` |
| Products | `/admin/products` |
| Product Form | `/admin/products/new`, `/admin/products/:id` |
| Brands | `/admin/brands` |
| Hero Slides | `/admin/hero` |
| Customer Reviews | `/admin/reviews` |
| Newsletter Subscribers | `/admin/subscribers` |
| Site Settings | `/admin/settings` |
| Team Management | `/admin/team` (admin only) |

---

## Order Flow

1. Customer fills checkout form (name, phone, city, notes).
2. Client calls `create_order` Supabase RPC — prices are revalidated server-side.
3. Order is saved. Client opens WhatsApp with the `LTH-000123` order number.
4. Admin sees the order instantly in `/admin/orders` via Supabase Realtime.
5. Admin changes status; status history is recorded in `order_status_history`.

---

## Static Fallback

When `REACT_APP_SUPABASE_URL` is not set, all data layers fall back to the static `src/data/*.js` files. The storefront runs fully offline. The admin requires Supabase.

---

## Project Structure

```
src/
├── admin/                  ← Admin dashboard (lazy-loaded, separate bundle)
│   ├── AdminApp.js         ← Admin router + providers
│   ├── components/
│   │   ├── AdminLayout.js  ← Sidebar + topbar
│   │   ├── ProtectedRoute.js
│   │   └── ui/             ← Button, Input, Card, Modal, DataTable, Toast…
│   ├── contexts/
│   │   ├── AdminAuthContext.js
│   │   └── AdminLangContext.js
│   ├── hooks/
│   ├── i18n/
│   │   └── adminTranslations.js
│   └── pages/
│       ├── LoginPage.js
│       ├── OverviewPage.js
│       ├── orders/
│       ├── products/
│       ├── BrandsPage.js
│       ├── HeroPage.js
│       └── …
├── data/                   ← Static data (fallback + seed source)
├── lib/
│   └── supabaseClient.js   ← Supabase client singleton
├── services/               ← Data layer (Supabase or static fallback)
│   ├── products.js
│   ├── brands.js
│   ├── orders.js
│   ├── hero.js
│   ├── settings.js
│   └── newsletter.js
└── …

supabase/
└── migrations/
    └── 0001_initial_schema.sql

scripts/
├── seed-supabase.mjs       ← Seeds brands, sections, settings, hero, reviews
└── seed-products-full.mjs  ← Seeds all ~286 products
```

---

## Security Notes

- The `service_role` key is **never** in the frontend or committed to the repo.
- All tables have **Row Level Security** enabled.
- Prices are validated server-side in the `create_order` RPC — client prices are never trusted.
- Storage bucket policies restrict writes to authenticated staff only.
- Admin routes are not accessible to unauthenticated users (both client-side guard + RLS).


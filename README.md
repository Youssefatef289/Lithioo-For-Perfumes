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
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
REACT_APP_AUTH_EMAIL_DOMAIN=lithioo.app
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

1. `supabase/migrations/0001_initial_schema.sql` (Tables, enums, RLS policies, RPCs)
2. `supabase/migrations/002_username_auth.sql` (Username + phone columns, index, is_active check)

### 2. Deploy Edge Functions

Deploy the admin users management Edge Function:

```bash
supabase functions deploy admin-users
```

### 3. Create Storage Buckets

In Supabase Dashboard → **Storage**, create these buckets with **Public** access:

- `product-images`
- `brand-logos`
- `hero`
- `reviews`

### 4. Seed Initial Data

Add `SUPABASE_SERVICE_ROLE_KEY=<your service_role key>` to `.env.local` (never commit), then run:

```bash
node scripts/seed-supabase.mjs          # brands, sections, settings, hero, reviews
node scripts/seed-products-full.mjs     # all ~286 products
```

The seed scripts are **idempotent** — safe to re-run.

### 5. Create Your First Admin Account

1. Go to Supabase Dashboard → **Auth** → **Users** → **Add User** → **Create User**.
2. Enter Email: `admin@lithioo.app`, set a password, and enable **Auto Confirm User**.
3. Run this SQL in the SQL Editor to assign the username and admin role:

```sql
INSERT INTO public.profiles (id, full_name, username, phone, role, is_active)
SELECT id, 'Super Admin', 'admin', '01000000000', 'admin', true
FROM auth.users WHERE email = 'admin@lithioo.app'
ON CONFLICT (id) DO UPDATE SET
  username = 'admin',
  phone = '01000000000',
  role = 'admin',
  is_active = true;
```

4. Log in at `/admin/login` using username `admin` and your password.
5. Create team members from `/admin/team`.

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


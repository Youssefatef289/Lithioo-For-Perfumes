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

### 5. Admin Authentication & Vercel Deployment Setup (English & Arabic)

#### English: Admin Setup & Vercel Deployment

##### A. Create the Admin User in Supabase Auth
1. Go to your **Supabase Dashboard** → **Authentication** → **Users** → click **Add user** → **Create user**.
2. **User Email**: Enter your desired admin email (e.g. matching `REACT_APP_ADMIN_EMAIL` or `admin_lithioo@lithiooperfumes.com`).
3. **Password**: Choose a strong, secure password.
4. Enable **Auto Confirm User?** (so email verification is confirmed immediately).
5. Copy the newly generated **User UID**.
6. Open **SQL Editor** in Supabase and run:
```sql
INSERT INTO public.profiles (id, full_name, username, role, is_active)
VALUES (
  '<COPIED_USER_UID>',
  'Admin Lithioo',
  'admin_lithioo',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  username = 'admin_lithioo',
  role = 'admin',
  is_active = true;
```

##### B. Environment Variables to Set on Vercel
In your Vercel Project Dashboard → **Settings** → **Environment Variables**, add the following 4 variables (Production and Preview):
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL (`https://<project-ref>.supabase.co`).
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable/anon key.
- `REACT_APP_ADMIN_EMAIL`: The email of the admin account created above (fallback: `admin_lithioo@lithiooperfumes.com`).
- `ALLOWED_ADMIN_USERNAME`: `admin_lithioo` (the only allowed administrator username).

> ⚠️ **Security Warning**: NEVER add `SUPABASE_SERVICE_ROLE_KEY` or any secret key to Vercel or frontend code.

##### C. How to Redeploy on Vercel
Create React App bakes `REACT_APP_*` environment variables into static assets at build time. Whenever you add or change an environment variable:
1. Go to **Deployments** in your Vercel Dashboard.
2. Click the three dots (`...`) next to your latest deployment.
3. Select **Redeploy** (ensure **Use existing Build Cache** is unchecked if needed).
4. Wait for the deployment to finish, then access `/admin` and log in with username `admin_lithioo` and your password.

---

#### بالعربية: إعداد حساب الأدمن ونشره على Vercel

##### أ. إنشاء حساب المشرف في Supabase Auth
1. افتح لوحة تحكم **Supabase** ← **Authentication** ← **Users** ← اضغط **Add user** ثم **Create user**.
2. **User Email**: أدخل بريد المشرف (المطابق لمتغير `REACT_APP_ADMIN_EMAIL` أو `admin_lithioo@lithiooperfumes.com`).
3. **Password**: اختر كلمة مرور قوية.
4. فعّل خيار **Auto Confirm User?** ليتم تأكيد البريد تلقائياً.
5. انسخ معرّف المستخدم الجديد (**User UID**).
6. من القائمة الجانبية، افتح **SQL Editor** وشغّل الاستعلام التالي:
```sql
INSERT INTO public.profiles (id, full_name, username, role, is_active)
VALUES (
  '<معرف_المستخدم_المنسوخ>',
  'Admin Lithioo',
  'admin_lithioo',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  username = 'admin_lithioo',
  role = 'admin',
  is_active = true;
```

##### ب. متغيرات البيئة المطلوب ضبطها على Vercel
في لوحة تحكم مشروعك على **Vercel** ← **Settings** ← **Environment Variables**، أضف المتغيرات الأربعة التالية:
- `REACT_APP_SUPABASE_URL`: رابط مشروع Supabase الخاص بك.
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY`: المفتاح العام (Publishable / Anon Key).
- `REACT_APP_ADMIN_EMAIL`: البريد الإلكتروني لحساب الأدمن.
- `ALLOWED_ADMIN_USERNAME`: اسم المستخدم الوحيد المسموح `admin_lithioo`.

> ⚠️ **تنبيه أمني**: لا تضع أبداً مفتاح `SUPABASE_SERVICE_ROLE_KEY` أو أي مفتاح سري على Vercel أو في كود الواجهة.

##### ج. كيفية إعادة البناء والنشر (Redeploy) على Vercel
لأن تطبيق React يقوم بحقن متغيرات `REACT_APP_*` أثناء مرحلة البناء (Build Time)، يجب إعادة النشر بعد تعديل المتغيرات:
1. من لوحة تحكم Vercel، اذهب إلى تبويب **Deployments**.
2. اضغط على أيقونة الثلاث نقاط (`...`) بجانب آخر نشر.
3. اختر **Redeploy**.
4. بعد اكتمال النشر، ادخل على الرابط `/admin` وسجّل دخولك باسم المستخدم `admin_lithioo` وكلمة المرور.

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


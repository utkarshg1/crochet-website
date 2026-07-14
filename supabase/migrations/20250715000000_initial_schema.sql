-- ============================================================
-- Krafted Loops Studio — Initial Database Schema
-- Run this in Supabase SQL Editor to bootstrap the database.
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Helper: auto-set updated_at ─────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TABLES
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
-- One row per auth user. Created automatically on signup via trigger.
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  is_admin   boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── categories ──────────────────────────────────────────────
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  image_url     text,
  display_order integer default 0,
  created_at    timestamptz default now()
);

alter table public.categories enable row level security;

-- ─── products ────────────────────────────────────────────────
create table public.products (
  id                      uuid primary key default gen_random_uuid(),
  title                   text not null,
  slug                    text not null unique,
  description             text not null,
  price_paise             integer not null,
  compare_at_price_paise  integer,
  stock                   integer not null default 0,
  category_id             uuid references public.categories(id) on delete set null,
  images                  jsonb default '[]'::jsonb,
  colors                  text[],
  tags                    text[],
  dimensions              text,
  materials               text,
  care_instructions       text,
  is_featured             boolean default false,
  is_new                  boolean default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table public.products enable row level security;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index idx_products_category_id on public.products(category_id);
create index idx_products_is_featured on public.products(is_featured) where is_featured = true;
create index idx_products_is_new on public.products(is_new) where is_new = true;

-- ─── orders ──────────────────────────────────────────────────
create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  order_number           text not null unique,
  user_id                uuid references auth.users(id) on delete set null,
  guest_name             text,
  guest_email            text,
  guest_phone            text,
  items                  jsonb not null default '[]'::jsonb,
  shipping_address       jsonb not null default '{}'::jsonb,
  subtotal_paise         integer not null default 0,
  shipping_paise         integer not null default 0,
  total_paise            integer not null default 0,
  status                 text not null default 'pending',
  razorpay_order_id      text,
  razorpay_payment_id    text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table public.orders enable row level security;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_razorpay_order_id on public.orders(razorpay_order_id);
create index idx_orders_status on public.orders(status);

-- ─── discounts ───────────────────────────────────────────────
create table public.discounts (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  type            text not null default 'percentage',
  value           integer not null,
  min_order_paise integer default 0,
  max_uses        integer,
  used_count      integer default 0,
  valid_until     timestamptz,
  is_active       boolean default true
);

alter table public.discounts enable row level security;

-- ─── carts ───────────────────────────────────────────────────
create table public.carts (
  id         uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id    uuid references auth.users(id) on delete cascade,
  items      jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.carts enable row level security;

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

-- ─── newsletter_subscribers ──────────────────────────────────
create table public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- ─── generate_order_number() ─────────────────────────────────
-- Returns KL-XXXX format using a sequence.
create sequence if not exists order_number_seq start 1;

create or replace function public.generate_order_number()
returns text as $$
begin
  return 'KL-' || lpad(nextval('order_number_seq')::text, 4, '0');
end;
$$ language plpgsql;

-- ─── handle_new_user() ───────────────────────────────────────
-- Auto-creates a profiles row when a user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
create policy "Profiles: user can read own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Profiles: user can update own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Profiles: admin can read all"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

-- ─── categories ──────────────────────────────────────────────
create policy "Categories: public can read"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Categories: admin can insert"
  on public.categories for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Categories: admin can update"
  on public.categories for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Categories: admin can delete"
  on public.categories for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

-- ─── products ────────────────────────────────────────────────
create policy "Products: public can read"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "Products: admin can insert"
  on public.products for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Products: admin can update"
  on public.products for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Products: admin can delete"
  on public.products for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

-- ─── orders ──────────────────────────────────────────────────
create policy "Orders: user can insert own"
  on public.orders for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Orders: user can read own"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Orders: admin can read all"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Orders: admin can update all"
  on public.orders for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

-- Allow guest checkout (anonymous inserts for orders)
create policy "Orders: anon can insert guest orders"
  on public.orders for insert
  to anon
  with check (user_id is null);

-- ─── discounts ───────────────────────────────────────────────
create policy "Discounts: admin can read all"
  on public.discounts for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Discounts: admin can insert"
  on public.discounts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Discounts: admin can update"
  on public.discounts for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

create policy "Discounts: admin can delete"
  on public.discounts for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

-- ─── carts ───────────────────────────────────────────────────
create policy "Carts: user can read own"
  on public.carts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Carts: user can insert own"
  on public.carts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Carts: user can update own"
  on public.carts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Carts: user can delete own"
  on public.carts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ─── newsletter_subscribers ──────────────────────────────────
create policy "Newsletter: anon can subscribe"
  on public.newsletter_subscribers for insert
  to anon
  with check (true);

create policy "Newsletter: authenticated can subscribe"
  on public.newsletter_subscribers for insert
  to authenticated
  with check (true);

create policy "Newsletter: admin can read all"
  on public.newsletter_subscribers for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

-- ============================================================
-- GRANTS — Expose tables to PostgREST (anon + authenticated)
-- ============================================================

grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;

grant all on public.profiles to authenticated;
grant all on public.orders to authenticated;
grant all on public.carts to authenticated;

grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;

grant all on public.discounts to authenticated;

grant execute on function public.generate_order_number to anon, authenticated;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create the product-images bucket (public read)
-- NOTE: Run this separately in Supabase Dashboard → Storage → New Bucket
-- OR use the Supabase MCP tool after migration:
--   supabase.storage.createBucket('product-images', { public: true })

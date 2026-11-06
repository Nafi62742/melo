-- ============================================================
-- MELO BANGLADESH — STORE LINKS & CHAT URLS TABLE (SUPABASE SQL)
-- Run this script in your Supabase SQL Editor to create and seed
-- the table for Messenger, WhatsApp, Social, and Custom URLs.
-- ============================================================

-- 1. STORE LINKS TABLE
create table if not exists public.store_links (
  key text primary key,
  label text not null,
  url text not null,
  category text not null default 'other' check (category in ('chat', 'social', 'other')),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.store_links enable row level security;

-- 3. RLS POLICIES (Public read + Admin panel upsert/delete)
drop policy if exists "Public can read store links" on public.store_links;
create policy "Public can read store links"
  on public.store_links for select
  using (true);

drop policy if exists "Allow insert and update store links" on public.store_links;
create policy "Allow insert and update store links"
  on public.store_links for all
  using (true)
  with check (true);

-- 4. DEFAULT SEED DATA (Messenger, WhatsApp, Social & Custom URLs)
insert into public.store_links (key, label, url, category, is_active)
values
  ('whatsapp',  'WhatsApp Concierge',  'https://wa.me/8801700000000',              'chat',   true),
  ('messenger', 'Facebook Messenger',  'https://m.me/melobangladesh',              'chat',   true),
  ('facebook',  'Facebook Page',       'https://facebook.com/melobangladesh',      'social', true),
  ('instagram', 'Instagram',           'https://instagram.com/melobangladesh',     'social', true)
on conflict (key) do update
set
  label = excluded.label,
  url = excluded.url,
  category = excluded.category,
  is_active = excluded.is_active,
  updated_at = now();

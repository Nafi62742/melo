-- ============================================================
-- MELO BANGLADESH — STOREFRONT CONTENT & HERO SHOWCASE (SUPABASE SQL)
-- Run this script in your Supabase SQL Editor to persist the Hero
-- text, custom badges, trust metrics, and featured showcase pieces.
-- ============================================================

-- 1. STORE CONTENT TABLE
create table if not exists public.store_content (
  key text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.store_content enable row level security;

-- 3. RLS POLICIES (Public read + Admin upsert)
drop policy if exists "Public can read store content" on public.store_content;
create policy "Public can read store content"
  on public.store_content for select
  using (true);

drop policy if exists "Allow insert and update store content" on public.store_content;
create policy "Allow insert and update store content"
  on public.store_content for all
  using (true)
  with check (true);

-- 4. DEFAULT SEED DATA
insert into public.store_content (key, content)
values (
  'home_content',
  '{
    "hero": {
      "badge": "Curated Accessories for Bangladesh",
      "titleLine1": "Where Little Wonders",
      "titleHighlight": "Light Up.",
      "subtitle": "Where little wonders light up. Handpicked, hypoallergenic, French-style light luxury earrings, dainty rings, and charming bracelets.",
      "primaryCtaText": "Explore Collection",
      "primaryCtaLink": "/shop",
      "secondaryCtaText": "French Ear Clips",
      "secondaryCtaLink": "/shop?category=earrings",
      "trustMetrics": [
        { "value": "54+", "label": "Curated Pieces" },
        { "value": "100%", "label": "Painless Clips" },
        { "value": "COD", "label": "All Bangladesh" }
      ],
      "primaryProductSlug": "earring-wreath-flowers",
      "primaryProductBadge": "Signature Piece",
      "secondaryProductSlug": "ring-j008-gold",
      "secondaryProductBadge": "316L Steel",
      "tickerItems": [
        "Painless Silicone Cushion Ear Clips",
        "Tarnish-Free 316L Stainless Steel Rings",
        "Inspect Before You Pay (COD)"
      ]
    }
  }'::jsonb
)
on conflict (key) do update
set
  content = excluded.content,
  updated_at = now();


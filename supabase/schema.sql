-- ============================================================================
-- MELO Jewellery Store — Supabase PostgreSQL Schema
-- Run this script once inside the Supabase SQL Editor (https://supabase.com)
-- ============================================================================

-- 1. Admins Table (with default login credentials)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default Admin ID & Password
INSERT INTO public.admins (email, password, role)
VALUES ('melo@gmail.com', 'hippo#aurora', 'superadmin')
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password;

-- 2. Product Types Table (new product categories must be added here first)
CREATE TABLE IF NOT EXISTS public.product_types (
  slug TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.product_types (slug, name, description)
VALUES
  ('earrings',  'Earrings',  'Hypoallergenic French-style ear clips and pearl earrings'),
  ('rings',     'Rings',     'Korean-style adjustable open rings and zircon bands'),
  ('bracelets', 'Bracelets', 'Light luxury crystal and four-leaf clover bracelets')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Products Table (category references public.product_types.slug)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES public.product_types (slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  "categoryName" TEXT NOT NULL,
  "priceBDT" INTEGER NOT NULL,
  "originalPriceBDT" INTEGER,
  "costPriceCNY" NUMERIC(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  "imageUrl" TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  "isNew" BOOLEAN DEFAULT false,
  "isFeatured" BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table (Card, bKash Manual TrxID, Cash on Delivery)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  "deliveryFee" INTEGER NOT NULL,
  total INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL CHECK ("paymentMethod" IN ('card', 'bkash', 'cod')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending' CHECK ("paymentStatus" IN ('pending', 'verified', 'failed')),
  "trxId" TEXT,
  "bkashSenderNumber" TEXT,
  "cardLast4" TEXT
);

-- 4. Enable Row Level Security (RLS) & Policies for Storefront & Admin Access
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin login verification" ON public.admins FOR SELECT USING (true);

CREATE POLICY "Public can read product types" ON public.product_types FOR SELECT USING (true);
CREATE POLICY "Admin can manage product types" ON public.product_types FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin upsert products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read/update orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 5. Store Links & Chat URLs Table (also available standalone in supabase/store_links.sql)
CREATE TABLE IF NOT EXISTS public.store_links (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('chat', 'social', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.store_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read store links" ON public.store_links FOR SELECT USING (true);
CREATE POLICY "Allow insert and update store links" ON public.store_links FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.store_links (key, label, url, category, is_active)
VALUES
  ('whatsapp',  'WhatsApp Concierge',  'https://wa.me/8801700000000',          'chat',   true),
  ('messenger', 'Facebook Messenger',  'https://m.me/melobangladesh',          'chat',   true),
  ('facebook',  'Facebook Page',       'https://facebook.com/melobangladesh',  'social', true),
  ('instagram', 'Instagram',           'https://instagram.com/melobangladesh', 'social', true)
ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  url = EXCLUDED.url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

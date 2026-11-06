-- ============================================================================
-- MELO Jewellery Store — Customer Login & Order / bKash TrxID Tracking SQL
-- Run this script in the Supabase SQL Editor to create the customer login
-- table and link order & bKash TrxID tracking.
-- ============================================================================

-- 1. Customers Table (for User Registration, Login & Saved bKash TrxIDs)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  default_address TEXT DEFAULT '',
  delivery_zone TEXT NOT NULL DEFAULT 'inside_dhaka' CHECK (delivery_zone IN ('inside_dhaka', 'outside_dhaka')),
  saved_trx_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure Orders Table has customerPhone & trxId columns for fast user order tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS "customerPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "trxId" TEXT,
  ADD COLUMN IF NOT EXISTS "bkashSenderNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'pending';

-- Index on customerPhone and orderNumber so users can track orders instantaneously
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders ("customerPhone");
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders ("orderNumber");

-- 3. Enable Row Level Security (RLS) & Policies on public.customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow customer registration and login" ON public.customers;
CREATE POLICY "Allow customer registration and login"
  ON public.customers FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Seed a Demo Customer Account (Optional for testing)
INSERT INTO public.customers (phone, email, full_name, password, default_address, delivery_zone, saved_trx_ids)
VALUES (
  '01700000000',
  'customer@melo.com',
  'Nusrat Jahan',
  'melo1234',
  'House 14, Road 27, Dhanmondi, Dhaka',
  'inside_dhaka',
  '["BKJ82910XY"]'::jsonb
)
ON CONFLICT (phone) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = NOW();


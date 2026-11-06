-- ============================================================================
-- MELO Jewellery Store — Customer & Order Tracking Schema (Supabase SQL)
-- Run this script in the Supabase SQL Editor to configure the relational
-- structure between Customers and Orders, fast tracking indexes, and courier status.
-- ============================================================================

-- 1. CUSTOMERS TABLE (Guest Checkouts, Registered Users, Loyalty Tracking)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT,
  default_address TEXT DEFAULT '',
  delivery_zone TEXT NOT NULL DEFAULT 'inside_dhaka' CHECK (delivery_zone IN ('inside_dhaka', 'outside_dhaka')),
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  saved_trx_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENSURE ORDERS TABLE HAS ALL TRACKING & CUSTOMER COLUMNS
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS "customerId" UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "customerPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryZone" TEXT DEFAULT 'inside_dhaka',
  ADD COLUMN IF NOT EXISTS "orderSource" TEXT DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS "trxId" TEXT,
  ADD COLUMN IF NOT EXISTS "bkashSenderNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "courierName" TEXT,
  ADD COLUMN IF NOT EXISTS "courierTrackingUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "estimatedDelivery" TEXT,
  ADD COLUMN IF NOT EXISTS "dispatchedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMPTZ;

-- 3. SPEED INDEXES FOR ZERO-LATENCY ORDER TRACKING
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders ("customerPhone");
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders ("orderNumber");
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders ("customerId");
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders ("trackingNumber");
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow customer registration and login" ON public.customers;
CREATE POLICY "Allow customer registration and login"
  ON public.customers FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and admin manage orders" ON public.orders;
CREATE POLICY "Allow public read and admin manage orders"
  ON public.orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. DEMO CUSTOMER ACCOUNT (Optional)
INSERT INTO public.customers (phone, email, full_name, password, default_address, delivery_zone, total_orders, total_spent, saved_trx_ids)
VALUES (
  '01700000000',
  'customer@melo.com',
  'Nusrat Jahan',
  'melo1234',
  'House 14, Road 27, Dhanmondi, Dhaka',
  'inside_dhaka',
  1,
  646,
  '["BKJ82910XY"]'::jsonb
)
ON CONFLICT (phone) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

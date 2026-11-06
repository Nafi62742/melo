-- ============================================================================
-- MELO Jewellery Store — Product Types Table (public.product_types)
-- Enforces that any new product category/type MUST be added to
-- public.product_types first before adding products of that type.
-- ============================================================================

-- 1. Create the Product Types table
CREATE TABLE IF NOT EXISTS public.product_types (
  slug TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read product types" ON public.product_types;
CREATE POLICY "Public can read product types"
  ON public.product_types
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage product types" ON public.product_types;
CREATE POLICY "Admin can manage product types"
  ON public.product_types
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Seed the initial 3 Product Types (must exist before products reference them)
INSERT INTO public.product_types (slug, name, description)
VALUES
  ('earrings',  'Earrings',  'Hypoallergenic French-style ear clips and pearl earrings'),
  ('rings',     'Rings',     'Korean-style adjustable open rings and zircon bands'),
  ('bracelets', 'Bracelets', 'Light luxury crystal and four-leaf clover bracelets')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. Remove the old hardcoded CHECK constraint on public.products (if present)
--    and replace it with a Foreign Key referencing public.product_types(slug).
--    This guarantees you MUST add a new product type in public.product_types first!
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS fk_products_product_type;

ALTER TABLE public.products
  ADD CONSTRAINT fk_products_product_type
  FOREIGN KEY (category)
  REFERENCES public.product_types (slug)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;


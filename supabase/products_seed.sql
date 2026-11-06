-- ============================================================================
-- MELO Jewellery Store — Products Table & Full 54-Item Seed Data
-- Run this script in the Supabase SQL Editor.
-- Image paths currently use project directory paths (/products/...) and can
-- later be updated to cloud storage URLs via SQL or the /admin dashboard.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('earrings', 'rings', 'bracelets')),
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

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin upsert products" ON public.products;
CREATE POLICY "Allow admin upsert products" ON public.products FOR ALL USING (true) WITH CHECK (true);

TRUNCATE TABLE public.products;

INSERT INTO public.products (
  id, name, slug, description, category, "categoryName", "priceBDT", "originalPriceBDT", "costPriceCNY", stock, "imageUrl", images, "isNew", "isFeatured", tags
)
VALUES
  ('prod-ear-1', 'Love Cross-Link all with transparent silicone cushion', 'earring-love-cross-link-all-with-transparent-silicone-cushion', 'Exquisite French-style light luxury earring: Love Cross-Link all with transparent silicone cushion. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 172, 220, 66, 2, '/products/earrings/Love%20Cross-Link%20all%20with%20transparent%20silicone%20cushion.webp', '[]'::jsonb, true, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-2', 'Wreath Flowers', 'earring-wreath-flowers', 'Exquisite French-style light luxury earring: Wreath Flowers. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 236, 290, 98, 2, '/products/earrings/Wreath%20Flowers.webp', '[]'::jsonb, true, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-3', '8mm Pearl', 'earring-8mm-pearl', 'Exquisite French-style light luxury earring: 8mm Pearl. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 102, 130, 31, 2, '/products/earrings/8mm%20Pearl.webp', '[]'::jsonb, true, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-4', '3-(10mm) Pearl', 'earring-3-10mm-pearl', 'Exquisite French-style light luxury earring: 3-(10mm) Pearl. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 104, 135, 32, 2, '/products/earrings/3-%2810mm%29%20Pearl.webp', '[]'::jsonb, true, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-5', '4-(12mm) Pearl', 'earring-4-12mm-pearl', 'Exquisite French-style light luxury earring: 4-(12mm) Pearl. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 108, 140, 34, 2, '/products/earrings/4-%2812mm%29%20Pearl.webp', '[]'::jsonb, true, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-6', '5-(14mm) Pearl', 'earring-5-14mm-pearl', 'Exquisite French-style light luxury earring: 5-(14mm) Pearl. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 110, 145, 35, 2, '/products/earrings/5-%2814mm%29%20Pearl.webp', '[]'::jsonb, true, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-7', 'Flowers', 'earring-flowers', 'Exquisite French-style light luxury earring: Flowers. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 174, 220, 67, 5, '/products/earrings/Flowers.webp', '[]'::jsonb, false, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-8', 'Golden Flowers', 'earring-golden-flowers', 'Exquisite French-style light luxury earring: Golden Flowers. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 136, 175, 48, 5, '/products/earrings/Golden%20Flowers.webp', '[]'::jsonb, false, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-9', 'Bud', 'earring-bud', 'Exquisite French-style light luxury earring: Bud. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 124, 160, 42, 4, '/products/earrings/Bud.webp', '[]'::jsonb, false, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-10', 'Bow Diamond', 'earring-bow-diamond', 'Exquisite French-style light luxury earring: Bow Diamond. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 186, 240, 73, 2, '/products/earrings/Bow%20Diamond.webp', '[]'::jsonb, false, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-11', 'Pink Cherries', 'earring-pink-cherries', 'Exquisite French-style light luxury earring: Pink Cherries. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 156, 200, 58, 2, '/products/earrings/Pink%20Cherries.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-12', 'GARLAND PEARL', 'earring-garland-pearl', 'Exquisite French-style light luxury earring: GARLAND PEARL. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 140, 180, 50, 2, '/products/earrings/GARLAND%20PEARL.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-13', 'Pearl Pendant', 'earring-pearl-pendant', 'Exquisite French-style light luxury earring: Pearl Pendant. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 152, 195, 56, 2, '/products/earrings/Pearl%20Pendant.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-14', 'Bow Little Pearl', 'earring-bow-little-pearl', 'Exquisite French-style light luxury earring: Bow Little Pearl. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 164, 210, 62, 2, '/products/earrings/Bow%20Little%20Pearl.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-15', 'Flower Pearls', 'earring-flower-pearls', 'Exquisite French-style light luxury earring: Flower Pearls. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 124, 160, 42, 2, '/products/earrings/Flower%20Pearls.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-16', 'Pearl Tassel', 'earring-pearl-tassel', 'Exquisite French-style light luxury earring: Pearl Tassel. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 192, 250, 76, 2, '/products/earrings/Pearl%20Tassel.webp', '[]'::jsonb, false, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-17', 'Three Pearls', 'earring-three-pearls', 'Exquisite French-style light luxury earring: Three Pearls. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 192, 250, 76, 2, '/products/earrings/Three%20Pearls.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-18', 'Asymmetric Flowers', 'earring-asymmetric-flowers', 'Exquisite French-style light luxury earring: Asymmetric Flowers. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 188, 240, 74, 3, '/products/earrings/Asymmetric%20Flowers.webp', '[]'::jsonb, false, true, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-19', 'Letter D', 'earring-letter-d', 'Exquisite French-style light luxury earring: Letter D. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 152, 195, 56, 2, '/products/earrings/Letter%20D.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-20', 'love hollow with drill', 'earring-love-hollow-with-drill', 'Exquisite French-style light luxury earring: love hollow with drill. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 166, 215, 63, 2, '/products/earrings/love%20hollow%20with%20drill.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-21', 'Light Luxury Simple Tree', 'earring-light-luxury-simple-tree', 'Exquisite French-style light luxury earring: Light Luxury Simple Tree. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 134, 175, 47, 2, '/products/earrings/Light%20Luxury%20Simple%20Tree.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-22', 'Black Rose', 'earring-black-rose', 'Exquisite French-style light luxury earring: Black Rose. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 140, 180, 50, 3, '/products/earrings/Black%20Rose.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-23', 'Pearl Inlay', 'earring-pearl-inlay', 'Exquisite French-style light luxury earring: Pearl Inlay. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 156, 200, 58, 2, '/products/earrings/Pearl%20Inlay.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-24', 'Black Heart', 'earring-black-heart', 'Exquisite French-style light luxury earring: Black Heart. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 134, 175, 47, 2, '/products/earrings/Black%20Heart.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-25', 'Bows', 'earring-bows', 'Exquisite French-style light luxury earring: Bows. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 164, 210, 62, 2, '/products/earrings/Bows.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-26', 'Semicircle Drip', 'earring-semicircle-drip', 'Exquisite French-style light luxury earring: Semicircle Drip. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 134, 175, 47, 2, '/products/earrings/Semicircle%20Drip.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb),
  ('prod-ear-27', 'Camellia', 'earring-camellia', 'Exquisite French-style light luxury earring: Camellia. Hypoallergenic, comfortable silicone cushion clip, designed for effortless everyday elegance.', 'earrings', 'Earrings', 148, 190, 54, 2, '/products/earrings/Camellia.webp', '[]'::jsonb, false, false, '["Hypoallergenic","Light Luxury","French Style","Ear Clip"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  "categoryName" = EXCLUDED."categoryName",
  "priceBDT" = EXCLUDED."priceBDT",
  "originalPriceBDT" = EXCLUDED."originalPriceBDT",
  "costPriceCNY" = EXCLUDED."costPriceCNY",
  stock = EXCLUDED.stock,
  "imageUrl" = EXCLUDED."imageUrl",
  images = EXCLUDED.images,
  "isNew" = EXCLUDED."isNew",
  "isFeatured" = EXCLUDED."isFeatured",
  tags = EXCLUDED.tags;

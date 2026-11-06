-- ============================================================================
-- MELO Jewellery Store — Update Product Selling Prices from Hippo Tracker CSVs
-- Sets "priceBDT" to the exact "Selling price" column from the CSV spreadsheets.
-- Also sets "costPriceCNY" to "Per Piece" cost and "stock" to "Quantity".
-- ============================================================================

UPDATE public.products AS p
SET
  "priceBDT" = v.selling_price,
  "costPriceCNY" = v.per_piece_cost,
  stock = v.quantity
FROM (VALUES
  ('Love Cross-Link all with transparent silicone cushion', 175, 66.00, 2),
  ('Wreath Flowers', 240, 98.00, 2),
  ('8mm Pearl', 110, 31.00, 2),
  ('3-(10mm) Pearl', 110, 32.00, 2),
  ('4-(12mm) Pearl', 110, 34.00, 2),
  ('5-(14mm) Pearl', 110, 35.00, 2),
  ('Flowers', 175, 67.00, 5),
  ('Golden Flowers', 140, 48.00, 5),
  ('Bud', 125, 42.00, 4),
  ('Bow Diamond', 180, 73.00, 2),
  ('Pink Cherries', 160, 58.00, 2),
  ('GARLAND PEARL', 140, 50.00, 2),
  ('Pearl Pendant', 150, 56.00, 2),
  ('Bow Little Pearl', 165, 62.00, 2),
  ('Flower Pearls', 125, 42.00, 2),
  ('Pearl Tassel', 195, 76.00, 2),
  ('Three Pearls', 195, 76.00, 2),
  ('Asymmetric Flowers', 185, 74.00, 3),
  ('Letter D', 150, 56.00, 2),
  ('love hollow with drill', 165, 63.00, 2),
  ('Light Luxury Simple Tree', 135, 47.00, 2),
  ('Black Rose', 140, 50.00, 3),
  ('Pearl Inlay', 155, 58.00, 2),
  ('Black Heart', 135, 47.00, 2),
  ('Bows', 165, 62.00, 2),
  ('Semicircle Drip', 135, 47.00, 2),
  ('Camellia', 150, 54.00, 2),
  ('J604 gold', 100, 30.00, 3),
  ('J997 silver', 130, 45.00, 3),
  ('J008 gold', 195, 76.00, 3),
  ('J008 silver', 195, 76.00, 3),
  ('J119 gold', 195, 78.00, 3),
  ('J669 silver', 175, 69.00, 3),
  ('J751 silver', 165, 63.00, 3),
  ('J778 silver', 115, 37.00, 3),
  ('J802 gold', 130, 43.00, 3),
  ('J838 silver', 130, 45.00, 3),
  ('J845 silver', 190, 74.00, 3),
  ('J872 gold', 130, 45.00, 3),
  ('J897 silver', 140, 50.00, 3),
  ('J911 silver', 110, 35.00, 3),
  ('J917 silver', 145, 52.00, 3),
  ('J925 silver a', 120, 38.00, 3),
  ('J927 silver b', 125, 43.00, 3),
  ('J928 micro inlay', 195, 78.00, 3),
  ('J939 silver', 115, 37.00, 3),
  ('J942 silver a', 130, 45.00, 3),
  ('J954 thick silver b', 120, 39.00, 3),
  ('J956 silver b', 145, 52.00, 3),
  ('J961 silver b', 100, 28.00, 3),
  ('J972 silver', 100, 30.00, 3),
  ('J970 gold', 165, 63.00, 3),
  ('blue diamond', 250, 149.00, 3),
  ('white drill', 240, 141.00, 3)
) AS v(name, selling_price, per_piece_cost, quantity)
WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(v.name));

-- ============================================================================
-- VERIFICATION QUERY
-- Shows all updated products with their new Selling Price and Per Piece Cost
-- ============================================================================
SELECT 
  category AS "Category",
  name AS "Product Name",
  "costPriceCNY" AS "Per Piece Cost (BDT)",
  "priceBDT" AS "Selling Price (BDT)",
  stock AS "Stock Quantity"
FROM public.products
ORDER BY category, "priceBDT" DESC;

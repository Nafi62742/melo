import { Product } from '../models/product.model';
import { ProductType } from '../models/product-type.model';
import { slugify } from './slug.util';

export interface CsvImportDiffResult {
  mergedProducts: Product[];
  changedProducts: Product[];
  updatedCount: number;
  addedCount: number;
  unchangedCount: number;
  skippedTypes: string[];
}

/**
 * Parses an RFC-4180 CSV string into a 2D array of rows/cells.
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (ch === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((cell) => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += ch;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((cell) => cell !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function escapeCsvCell(value: string | number | boolean | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC-4180 CSV string from a list of Products.
 */
export function exportProductsToCsv(products: Product[]): string {
  const headers = [
    'id',
    'name',
    'slug',
    'description',
    'category',
    'categoryName',
    'priceBDT',
    'originalPriceBDT',
    'costPriceCNY',
    'stock',
    'imageUrl',
    'images',
    'isNew',
    'isFeatured',
    'tags',
  ];

  const lines = [headers.join(',')];

  for (const p of products) {
    const row = [
      escapeCsvCell(p.id),
      escapeCsvCell(p.name),
      escapeCsvCell(p.slug),
      escapeCsvCell(p.description),
      escapeCsvCell(p.category),
      escapeCsvCell(p.categoryName),
      escapeCsvCell(p.priceBDT),
      escapeCsvCell(p.originalPriceBDT ?? Math.round(p.priceBDT * 1.3)),
      escapeCsvCell(p.costPriceCNY !== undefined ? p.costPriceCNY.toFixed(2) : ''),
      escapeCsvCell(p.stock),
      escapeCsvCell(p.imageUrl),
      escapeCsvCell(JSON.stringify(p.images ?? [])),
      escapeCsvCell(Boolean(p.isNew)),
      escapeCsvCell(Boolean(p.isFeatured)),
      escapeCsvCell(JSON.stringify(p.tags ?? [])),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Smart differential CSV importer:
 * - Supports both standard Supabase/Admin CSVs (`id,name,slug,category,priceBDT,stock,...`)
 *   and "Hippo tracker" spreadsheets (`Name,Per Piece,Price,Quantiy,Shipping cost,Selling price,...`).
 * - Only updates fields that actually changed; keeps all other fields and unlisted products untouched!
 * - Enforces that any product's `category` must exist in `allowedProductTypes` first.
 */
export function mergeProductsFromCsv(
  csvText: string,
  existingProducts: Product[],
  allowedProductTypes: ProductType[],
  defaultCategorySlug = 'earrings',
  filenameHint = ''
): CsvImportDiffResult {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    return {
      mergedProducts: [...existingProducts],
      changedProducts: [],
      updatedCount: 0,
      addedCount: 0,
      unchangedCount: existingProducts.length,
      skippedTypes: [],
    };
  }

  // Locate header row (handles Hippo tracker files where row 1 is a title banner and row 2/3 is the header)
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const lowerCells = rows[i].map((c) => c.toLowerCase().trim());
    if (
      lowerCells.includes('name') &&
      (lowerCells.includes('pricebdt') ||
        lowerCells.includes('selling price') ||
        lowerCells.includes('stock') ||
        lowerCells.includes('quantiy') ||
        lowerCells.includes('quantity'))
    ) {
      headerRowIdx = i;
      break;
    }
  }

  const headers = rows[headerRowIdx].map((h) => h.toLowerCase().trim());
  const dataRows = rows.slice(headerRowIdx + 1);

  // Detect category hint from filename or title banner if CSV has no `category` column
  const bannerAndFile = `${rows[0]?.join(' ') || ''} ${filenameHint}`.toLowerCase();
  let inferredCategory = defaultCategorySlug;
  if (bannerAndFile.includes('bracelet')) {
    inferredCategory = 'bracelets';
  } else if (bannerAndFile.includes('ring') && !bannerAndFile.includes('ear')) {
    inferredCategory = 'rings';
  } else if (bannerAndFile.includes('ear')) {
    inferredCategory = 'earrings';
  }

  const typeMap = new Map<string, ProductType>();
  for (const pt of allowedProductTypes) {
    typeMap.set(pt.slug.toLowerCase(), pt);
  }

  const mergedProducts = existingProducts.map((p) => ({ ...p }));
  const changedProducts: Product[] = [];
  const skippedTypesSet = new Set<string>();
  let updatedCount = 0;
  let addedCount = 0;

  const getCol = (row: string[], ...candidates: string[]): string | undefined => {
    for (const cand of candidates) {
      const idx = headers.indexOf(cand.toLowerCase());
      if (idx !== -1 && idx < row.length) {
        return row[idx]?.trim();
      }
    }
    return undefined;
  };

  for (const row of dataRows) {
    const rawName = getCol(row, 'name');
    if (!rawName || rawName.toLowerCase() === 'total' || rawName.toLowerCase().includes('profit')) {
      continue;
    }

    const rawId = getCol(row, 'id');
    const rawSlug = getCol(row, 'slug');
    const rawCategory = (getCol(row, 'category') || inferredCategory).toLowerCase().trim();
    const rawPriceBDT = getCol(row, 'pricebdt', 'revised sell price', 'revised sel price');
    const fallbackSellingPrice = getCol(row, 'selling price');
    const priceStr =
      rawPriceBDT && rawPriceBDT !== '' && !Number.isNaN(Number(rawPriceBDT))
        ? rawPriceBDT
        : fallbackSellingPrice;

    const rawOriginalPrice = getCol(row, 'originalpricebdt');
    const rawCostCNY = getCol(row, 'costpricecny', 'per piece');
    const rawStock = getCol(row, 'stock', 'quantiy', 'quantity');
    const rawImageUrl = getCol(row, 'imageurl');
    const rawDescription = getCol(row, 'description');
    const rawIsNew = getCol(row, 'isnew');
    const rawIsFeatured = getCol(row, 'isfeatured');
    const rawTags = getCol(row, 'tags');

    // Find matching existing product by id, slug, or case-insensitive name
    const existingIdx = mergedProducts.findIndex(
      (p) =>
        (rawId && p.id.toLowerCase() === rawId.toLowerCase()) ||
        (rawSlug && p.slug.toLowerCase() === rawSlug.toLowerCase()) ||
        p.name.trim().toLowerCase() === rawName.trim().toLowerCase()
    );

    if (existingIdx !== -1) {
      const current = mergedProducts[existingIdx];
      const updated: Product = { ...current };
      let hasChanged = false;

      if (rawName && rawName !== current.name) {
        updated.name = rawName;
        hasChanged = true;
      }

      if (rawCategory && rawCategory !== current.category) {
        const matchedType = typeMap.get(rawCategory);
        if (!matchedType) {
          skippedTypesSet.add(rawCategory);
          continue;
        }
        updated.category = matchedType.slug;
        updated.categoryName = matchedType.name;
        hasChanged = true;
      }

      if (priceStr !== undefined && priceStr !== '') {
        const parsedPrice = Math.round(Number(priceStr));
        if (!Number.isNaN(parsedPrice) && parsedPrice > 0 && parsedPrice !== current.priceBDT) {
          updated.priceBDT = parsedPrice;
          hasChanged = true;
        }
      }

      if (rawOriginalPrice !== undefined && rawOriginalPrice !== '') {
        const parsedOrig = Math.round(Number(rawOriginalPrice));
        if (!Number.isNaN(parsedOrig) && parsedOrig > 0 && parsedOrig !== current.originalPriceBDT) {
          updated.originalPriceBDT = parsedOrig;
          hasChanged = true;
        }
      }

      if (rawCostCNY !== undefined && rawCostCNY !== '') {
        const parsedCost = Number(rawCostCNY);
        if (!Number.isNaN(parsedCost) && parsedCost !== current.costPriceCNY) {
          updated.costPriceCNY = parsedCost;
          hasChanged = true;
        }
      }

      if (rawStock !== undefined && rawStock !== '') {
        const parsedStock = Math.max(0, Math.floor(Number(rawStock)));
        if (!Number.isNaN(parsedStock) && parsedStock !== current.stock) {
          updated.stock = parsedStock;
          hasChanged = true;
        }
      }

      if (rawImageUrl && rawImageUrl !== current.imageUrl) {
        updated.imageUrl = rawImageUrl;
        hasChanged = true;
      }

      if (rawDescription && rawDescription !== current.description) {
        updated.description = rawDescription;
        hasChanged = true;
      }

      if (rawIsNew !== undefined && rawIsNew !== '') {
        const nextIsNew = rawIsNew.toLowerCase() === 'true';
        if (nextIsNew !== Boolean(current.isNew)) {
          updated.isNew = nextIsNew;
          hasChanged = true;
        }
      }

      if (rawIsFeatured !== undefined && rawIsFeatured !== '') {
        const nextIsFeatured = rawIsFeatured.toLowerCase() === 'true';
        if (nextIsFeatured !== Boolean(current.isFeatured)) {
          updated.isFeatured = nextIsFeatured;
          hasChanged = true;
        }
      }

      if (rawTags) {
        try {
          const parsedTags = JSON.parse(rawTags) as string[];
          if (
            Array.isArray(parsedTags) &&
            JSON.stringify(parsedTags) !== JSON.stringify(current.tags ?? [])
          ) {
            updated.tags = parsedTags;
            hasChanged = true;
          }
        } catch {
          // keep existing tags if invalid JSON
        }
      }

      if (hasChanged) {
        mergedProducts[existingIdx] = updated;
        changedProducts.push(updated);
        updatedCount++;
      }
    } else {
      // Brand new product — verify its product type exists in public.product_types first
      const matchedType = typeMap.get(rawCategory);
      if (!matchedType) {
        skippedTypesSet.add(rawCategory);
        continue;
      }

      const parsedPrice =
        priceStr && !Number.isNaN(Number(priceStr)) && Number(priceStr) > 0
          ? Math.round(Number(priceStr))
          : 150;
      const parsedOrig =
        rawOriginalPrice && !Number.isNaN(Number(rawOriginalPrice)) && Number(rawOriginalPrice) > 0
          ? Math.round(Number(rawOriginalPrice))
          : Math.round(parsedPrice * 1.3);
      const parsedCost =
        rawCostCNY && !Number.isNaN(Number(rawCostCNY)) ? Number(rawCostCNY) : undefined;
      const parsedStock =
        rawStock && !Number.isNaN(Number(rawStock)) ? Math.max(0, Math.floor(Number(rawStock))) : 2;

      const generatedSlug =
        rawSlug || `${matchedType.slug}-${slugify(rawName)}-${mergedProducts.length + 1}`;
      const encodedFileName = encodeURIComponent(rawName).replace(/\(/g, '%28').replace(/\)/g, '%29');
      const generatedImageUrl =
        rawImageUrl || `/products/${matchedType.slug}/${encodedFileName}.webp`;

      let parsedTags: string[] = [matchedType.name, 'Light Luxury'];
      if (rawTags) {
        try {
          const maybeTags = JSON.parse(rawTags) as string[];
          if (Array.isArray(maybeTags)) parsedTags = maybeTags;
        } catch {
          // ignore
        }
      }

      const newProduct: Product = {
        id: rawId || `prod-${matchedType.slug.slice(0, 4)}-${Date.now()}-${addedCount + 1}`,
        name: rawName,
        slug: generatedSlug,
        description:
          rawDescription ||
          `Exquisite light luxury ${matchedType.name.toLowerCase()} piece (${rawName}). Crafted for effortless everyday elegance.`,
        category: matchedType.slug,
        categoryName: matchedType.name,
        priceBDT: parsedPrice,
        originalPriceBDT: parsedOrig,
        costPriceCNY: parsedCost,
        stock: parsedStock,
        imageUrl: generatedImageUrl,
        isNew: rawIsNew ? rawIsNew.toLowerCase() === 'true' : true,
        isFeatured: rawIsFeatured ? rawIsFeatured.toLowerCase() === 'true' : false,
        tags: parsedTags,
      };

      mergedProducts.push(newProduct);
      changedProducts.push(newProduct);
      addedCount++;
    }
  }

  const unchangedCount = Math.max(0, existingProducts.length - updatedCount);

  return {
    mergedProducts,
    changedProducts,
    updatedCount,
    addedCount,
    unchangedCount,
    skippedTypes: Array.from(skippedTypesSet),
  };
}


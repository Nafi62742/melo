#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const PRODUCTS_SOURCE = path.join(ROOT_DIR, 'Products');
const PUBLIC_TARGET = path.join(ROOT_DIR, 'public', 'products');
const SLIDESHOW_TARGET = path.join(ROOT_DIR, 'public', 'slideshow');

const FOLDERS = [
  { src: path.join(PRODUCTS_SOURCE, 'Ear Rings'), dest: path.join(PUBLIC_TARGET, 'earrings') },
  { src: path.join(PRODUCTS_SOURCE, 'Rings'), dest: path.join(PUBLIC_TARGET, 'rings') },
  { src: path.join(PRODUCTS_SOURCE, 'Bracelets'), dest: path.join(PUBLIC_TARGET, 'bracelets') },
];

async function convertLabeledImages() {
  console.log('🔄 Starting WebP image conversion for labeled products...');
  
  let convertedCount = 0;

  for (const { src, dest } of FOLDERS) {
    if (!fs.existsSync(src)) {
      continue;
    }

    fs.mkdirSync(dest, { recursive: true });

    // Clean out existing files in dest to remove any old iPhone IMG_* files from the products folder
    const existingInDest = fs.readdirSync(dest);
    for (const f of existingInDest) {
      if (f.startsWith('IMG_') || f.endsWith('.jpg') || f.endsWith('.jpeg')) {
        fs.unlinkSync(path.join(dest, f));
      }
    }

    const files = fs.readdirSync(src);

    for (const file of files) {
      // Exclude iPhone images from product catalog (they go to slideshow)
      if (file.startsWith('IMG_') || file.toLowerCase().endsWith('.heic')) {
        continue;
      }

      if (!file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.jpeg') && !file.toLowerCase().endsWith('.png')) {
        continue;
      }

      const inputPath = path.join(src, file);
      const baseName = path.parse(file).name;
      const outputPath = path.join(dest, `${baseName}.webp`);

      try {
        await sharp(inputPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(outputPath);

        convertedCount++;
      } catch (err) {
        console.error(`  ✗ Error converting ${file}:`, err.message);
      }
    }
  }

  console.log(`  ✓ Converted ${convertedCount} labeled product images into public/products/`);

  // Convert iPhone HEIC images into public/slideshow/
  fs.mkdirSync(SLIDESHOW_TARGET, { recursive: true });
  console.log('🔄 Converting iPhone HEIC photos into public/slideshow/ for hero slideshow...');

  const heicFolders = [
    path.join(PRODUCTS_SOURCE, 'Bracelets'),
    path.join(PRODUCTS_SOURCE, 'Rings'),
  ];

  let slideshowCount = 0;
  for (const folder of heicFolders) {
    if (!fs.existsSync(folder)) continue;
    const files = fs.readdirSync(folder).filter((f) => f.startsWith('IMG_') && f.endsWith('.HEIC'));
    for (const file of files) {
      const base = path.parse(file).name;
      const srcPath = path.join(folder, file);
      const outWebp = path.join(SLIDESHOW_TARGET, `${base}.webp`);
      const tempJpg = `/tmp/${base}.jpg`;

      try {
        execSync(`sips -s format jpeg -Z 1600 "${srcPath}" --out "${tempJpg}" > /dev/null 2>&1`);
        execSync(`cwebp -q 85 "${tempJpg}" -o "${outWebp}" > /dev/null 2>&1`);
        if (fs.existsSync(tempJpg)) fs.unlinkSync(tempJpg);
        slideshowCount++;
      } catch {
        // Fallback or ignore
      }
    }
  }
  console.log(`  ✓ Converted ${slideshowCount} iPhone photos into public/slideshow/`);
  console.log('\n🎉 WebP Conversion Complete!');
}

convertLabeledImages().catch(console.error);

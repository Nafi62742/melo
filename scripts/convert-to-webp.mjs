#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const PRODUCTS_SOURCE = path.join(ROOT_DIR, 'Products');
const PUBLIC_TARGET = path.join(ROOT_DIR, 'public', 'products');

const FOLDERS = [
  { src: path.join(PRODUCTS_SOURCE, 'Ear Rings'), dest: path.join(PUBLIC_TARGET, 'earrings') },
  { src: path.join(PRODUCTS_SOURCE, 'Rings'), dest: path.join(PUBLIC_TARGET, 'rings') },
  { src: path.join(PRODUCTS_SOURCE, 'Bracelets'), dest: path.join(PUBLIC_TARGET, 'bracelets') },
];

async function convertLabeledImages() {
  console.log('🔄 Starting WebP image conversion for labeled products (excluding iPhone IMG_* files)...');
  
  let convertedCount = 0;

  for (const { src, dest } of FOLDERS) {
    if (!fs.existsSync(src)) {
      console.warn(`Source folder does not exist: ${src}`);
      continue;
    }

    fs.mkdirSync(dest, { recursive: true });

    // Clean out existing files in dest to remove any old iPhone IMG_* files
    const existingInDest = fs.readdirSync(dest);
    for (const f of existingInDest) {
      if (f.startsWith('IMG_') || f.endsWith('.jpg') || f.endsWith('.jpeg')) {
        fs.unlinkSync(path.join(dest, f));
      }
    }

    const files = fs.readdirSync(src);

    for (const file of files) {
      // Exclude iPhone images (IMG_*.HEIC or IMG_*.jpg)
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
        console.log(`  ✓ Converted: ${file} -> ${baseName}.webp`);
      } catch (err) {
        console.error(`  ✗ Error converting ${file}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 WebP Conversion Complete! Converted ${convertedCount} labeled images.`);
}

convertLabeledImages().catch(console.error);


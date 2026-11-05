import { describe, it, expect } from 'vitest';
import { slugify } from './slug.util';

describe('slugify Utility', () => {
  it('should lowercase and replace spaces with hyphens', () => {
    expect(slugify('French Ear Clips')).toBe('french-ear-clips');
    expect(slugify('Minimalist Band Ring')).toBe('minimalist-band-ring');
  });

  it('should strip special characters and duplicate hyphens', () => {
    expect(slugify('Love Cross-Link & Cushion!')).toBe('love-cross-link-cushion');
    expect(slugify('3-(10mm) Pearl')).toBe('3-10mm-pearl');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('  --Gold Ring--  ')).toBe('gold-ring');
  });
});


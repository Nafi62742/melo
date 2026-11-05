import { formatBDT } from './currency.util';

describe('formatBDT Currency Utility', () => {
  it('should format small BDT amounts with the ৳ symbol', () => {
    expect(formatBDT(60)).toBe('৳60');
    expect(formatBDT(350)).toBe('৳350');
  });

  it('should format thousand amounts with proper comma separators', () => {
    expect(formatBDT(1500)).toBe('৳1,500');
    expect(formatBDT(25000)).toBe('৳25,000');
  });

  it('should round decimal amounts to integer currency', () => {
    expect(formatBDT(124.63)).toBe('৳125');
    expect(formatBDT(99.4)).toBe('৳99');
  });
});

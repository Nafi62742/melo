/**
 * Utility functions for formatting Bangladesh Taka (BDT ৳)
 */
export function formatBDT(amount: number | undefined | null): string {
  const val = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
  return `৳${Math.round(val).toLocaleString('en-IN')}`;
}

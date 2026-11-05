/**
 * Utility functions for formatting Bangladesh Taka (BDT ৳)
 */
export function formatBDT(amount: number): string {
  return `৳${Math.round(amount).toLocaleString('en-IN')}`;
}


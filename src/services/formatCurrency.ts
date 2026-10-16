/**
 * Currency formatting service for Ariary (Ar).
 * Uses integer amounts to avoid floating-point rounding errors.
 */

/**
 * Format an integer amount in Ariary to a display string.
 * Example: 150000 -> "150 000 Ar"
 */
export function formatCurrency(montant: number): string {
  if (montant === 0) return '0 Ar';
  const sign = montant < 0 ? '-' : '';
  const abs = Math.abs(montant);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${formatted} Ar`;
}

/**
 * Format a currency amount for input fields (no "Ar" suffix, no spaces).
 * Example: 150000 -> "150000"
 */
export function formatCurrencyInput(montant: number): string {
  return Math.abs(montant).toString();
}

/**
 * Parse a string input into an integer Ariary amount.
 * Returns NaN if the input is not a valid number.
 */
export function parseCurrency(input: string): number {
  const cleaned = input.replace(/[^0-9]/g, '');
  if (cleaned === '') return NaN;
  return parseInt(cleaned, 10);
}

/**
 * Validate that a montant is a positive integer.
 */
export function validateMontant(montant: number): boolean {
  return Number.isInteger(montant) && montant > 0;
}

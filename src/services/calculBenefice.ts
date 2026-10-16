/**
 * Financial calculation service.
 *
 * Résultat estimé = recettes (ventes confirmées) - dépenses enregistrées.
 *
 * IMPORTANT: This is an estimated result, not a net accounting profit.
 * It does not account for inventory changes, food waste, debts, or amortization.
 */

import { Depense, Vente } from '@/types';

/**
 * Calculate total revenue from a list of confirmed sales.
 */
export function totalRecettes(ventes: Vente[]): number {
  return ventes.reduce((sum, v) => sum + v.montant_total, 0);
}

/**
 * Calculate total expenses from a list of expenses.
 */
export function totalDepenses(depenses: Depense[]): number {
  return depenses.reduce((sum, d) => sum + d.montant, 0);
}

/**
 * Calculate estimated result = recettes - depenses.
 * Can be negative (loss).
 */
export function resultatEstime(recettes: number, depenses: number): number {
  return recettes - depenses;
}

/**
 * Calculate total boxes sold from a list of sales.
 * Each sale line has a quantity of boxes.
 */
export function totalBoxes(ventes: Vente[], lignesQuantite: Record<number, number>): number {
  return ventes.reduce((sum, v) => sum + (lignesQuantite[v.id] ?? 0), 0);
}

/**
 * Group expenses by category and sum amounts.
 */
export function depensesParCategorie(depenses: Depense[]): Record<string, number> {
  const result: Record<string, number> = {};
  depenses.forEach((d) => {
    result[d.categorie] = (result[d.categorie] ?? 0) + d.montant;
  });
  return result;
}

/**
 * Parse a YYYY-MM-DD string as a LOCAL date (not UTC) to avoid timezone bugs.
 * new Date('YYYY-MM-DD') parses as UTC midnight, which can cause off-by-one
 * errors compared to local dates. This helper uses local time instead.
 */
function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

/**
 * Build daily evolution data for a date range.
 * Returns an array of { date, recettes, depenses } for each day in the range.
 *
 * IMPORTANT: Uses local date parsing to avoid timezone issues with
 * new Date('YYYY-MM-DD') which parses as UTC midnight.
 * Also caps the range at 366 days to prevent infinite loops.
 */
export function evolutionQuotidienne(
  ventes: Vente[],
  depenses: Depense[],
  dateDebut: string,
  dateFin: string,
): { date: string; recettes: number; depenses: number }[] {
  const start = parseLocalDate(dateDebut);
  const end = parseLocalDate(dateFin);

  // Guard against invalid dates or inverted ranges
  if (!start || !end || start > end) {
    return [];
  }

  // Cap the range to prevent infinite loops (max 366 days)
  const MAX_DAYS = 366;
  const result: { date: string; recettes: number; depenses: number }[] = [];

  const recettesParJour = new Map<string, number>();
  const depensesParJour = new Map<string, number>();

  ventes.forEach((v) => {
    const day = v.date_vente.split('T')[0];
    recettesParJour.set(day, (recettesParJour.get(day) ?? 0) + (v.montant_total ?? 0));
  });

  depenses.forEach((d) => {
    const day = d.date_depense.split('T')[0];
    depensesParJour.set(day, (depensesParJour.get(day) ?? 0) + (d.montant ?? 0));
  });

  const current = new Date(start);
  let iterations = 0;
  while (current <= end && iterations < MAX_DAYS) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const dayStr = `${y}-${m}-${d}`;
    result.push({
      date: dayStr,
      recettes: recettesParJour.get(dayStr) ?? 0,
      depenses: depensesParJour.get(dayStr) ?? 0,
    });
    current.setDate(current.getDate() + 1);
    iterations++;
  }

  return result;
}

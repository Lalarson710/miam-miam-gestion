/**
 * Depense model and repository.
 * Handles data access for the depenses table in SQLite.
 */

import { getDatabase } from '@/database/database';
import { nowISO } from '@/services/formatDate';
import { Depense, DepenseInput, ValidationError, ValidationResult } from '@/types';

/**
 * Validate a depense input.
 */
export function validateDepense(input: DepenseInput): ValidationResult<DepenseInput> {
  const errors: ValidationError[] = [];

  if (!input.date_depense) {
    errors.push({ field: 'date_depense', message: 'La date est obligatoire.' });
  }

  if (!input.libelle || input.libelle.trim().length === 0) {
    errors.push({ field: 'libelle', message: 'Le libellé est obligatoire.' });
  }

  if (!input.categorie) {
    errors.push({ field: 'categorie', message: 'La catégorie est obligatoire.' });
  }

  if (!Number.isInteger(input.montant) || input.montant <= 0) {
    errors.push({ field: 'montant', message: 'Le montant doit être un nombre entier supérieur à zéro.' });
  }

  if (input.quantite !== undefined && input.quantite !== null) {
    if (!Number.isInteger(input.quantite) || input.quantite <= 0) {
      errors.push({ field: 'quantite', message: 'La quantité doit être un entier positif.' });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: input };
}

/**
 * Repository for depense data access.
 */
export class DepenseRepository {
  /**
   * Get all expenses, ordered by date descending.
   */
  static getAll(): Depense[] {
    const db = getDatabase();
    return db.getAllSync<Depense>(
      'SELECT * FROM depenses ORDER BY date_depense DESC, id DESC',
    );
  }

  /**
   * Get an expense by ID.
   */
  static getById(id: number): Depense | null {
    const db = getDatabase();
    return db.getFirstSync<Depense>('SELECT * FROM depenses WHERE id = ?', [id]);
  }

  /**
   * Get expenses within a date range (inclusive).
   */
  static getByPeriode(dateDebut: string, dateFin: string): Depense[] {
    const db = getDatabase();
    return db.getAllSync<Depense>(
      'SELECT * FROM depenses WHERE date_depense >= ? AND date_depense <= ? ORDER BY date_depense DESC, id DESC',
      [dateDebut, dateFin],
    );
  }

  /**
   * Get expenses by category within a date range.
   */
  static getByCategorie(categorie: string, dateDebut: string, dateFin: string): Depense[] {
    const db = getDatabase();
    return db.getAllSync<Depense>(
      'SELECT * FROM depenses WHERE categorie = ? AND date_depense >= ? AND date_depense <= ? ORDER BY date_depense DESC, id DESC',
      [categorie, dateDebut, dateFin],
    );
  }

  /**
   * Search expenses by libelle (partial match).
   */
  static search(query: string): Depense[] {
    const db = getDatabase();
    const pattern = `%${query}%`;
    return db.getAllSync<Depense>(
      'SELECT * FROM depenses WHERE libelle LIKE ? ORDER BY date_depense DESC, id DESC',
      [pattern],
    );
  }

  /**
   * Create a new expense.
   */
  static create(input: DepenseInput): Depense {
    const validation = validateDepense(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.errors?.map((e) => e.message).join(', '));
    }

    const data = validation.data;
    const now = nowISO();
    const db = getDatabase();
    const result = db.runSync(
      'INSERT INTO depenses (date_depense, libelle, categorie, montant, quantite, unite, observation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.date_depense,
        data.libelle.trim(),
        data.categorie,
        data.montant,
        data.quantite ?? null,
        data.unite?.trim() ?? null,
        data.observation?.trim() ?? null,
        now,
        now,
      ],
    );

    return db.getFirstSync<Depense>('SELECT * FROM depenses WHERE id = ?', [result.lastInsertRowId])!;
  }

  /**
   * Update an existing expense.
   */
  static update(id: number, input: DepenseInput): Depense {
    const validation = validateDepense(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.errors?.map((e) => e.message).join(', '));
    }

    const data = validation.data;
    const now = nowISO();
    const db = getDatabase();
    db.runSync(
      'UPDATE depenses SET date_depense = ?, libelle = ?, categorie = ?, montant = ?, quantite = ?, unite = ?, observation = ?, updated_at = ? WHERE id = ?',
      [
        data.date_depense,
        data.libelle.trim(),
        data.categorie,
        data.montant,
        data.quantite ?? null,
        data.unite?.trim() ?? null,
        data.observation?.trim() ?? null,
        now,
        id,
      ],
    );

    return db.getFirstSync<Depense>('SELECT * FROM depenses WHERE id = ?', [id])!;
  }

  /**
   * Delete an expense (hard delete - expenses can be re-entered if needed).
   */
  static delete(id: number): void {
    const db = getDatabase();
    db.runSync('DELETE FROM depenses WHERE id = ?', [id]);
  }

  /**
   * Get total expenses for a date range.
   */
  static getTotalMontant(dateDebut: string, dateFin: string): number {
    const db = getDatabase();
    const result = db.getFirstSync<{ total: number }>(
      'SELECT COALESCE(SUM(montant), 0) as total FROM depenses WHERE date_depense >= ? AND date_depense <= ?',
      [dateDebut, dateFin],
    );
    return result?.total ?? 0;
  }

  /**
   * Get expenses grouped by category for a date range.
   */
  static getTotalParCategorie(dateDebut: string, dateFin: string): { categorie: string; total: number }[] {
    const db = getDatabase();
    return db.getAllSync<{ categorie: string; total: number }>(
      'SELECT categorie, SUM(montant) as total FROM depenses WHERE date_depense >= ? AND date_depense <= ? GROUP BY categorie ORDER BY total DESC',
      [dateDebut, dateFin],
    );
  }
}

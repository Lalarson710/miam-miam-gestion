/**
 * Produit model and repository.
 * Handles data access for the produits table in SQLite.
 */

import { getDatabase } from '@/database/database';
import { nowISO } from '@/services/formatDate';
import { Produit, ProduitInput, ValidationError, ValidationResult } from '@/types';

/**
 * Validate a produit input.
 */
export function validateProduit(input: ProduitInput): ValidationResult<ProduitInput> {
  const errors: ValidationError[] = [];

  if (!input.nom || input.nom.trim().length === 0) {
    errors.push({ field: 'nom', message: 'Le nom du plat est obligatoire.' });
  }

  if (!Number.isInteger(input.prix_vente) || input.prix_vente <= 0) {
    errors.push({ field: 'prix_vente', message: 'Le prix de vente doit être un nombre entier supérieur à zéro.' });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: input };
}

/**
 * Repository for produit data access.
 */
export class ProduitRepository {
  /**
   * Get all active products, ordered by name.
   */
  static getAllActifs(): Produit[] {
    const db = getDatabase();
    return db.getAllSync<Produit>(
      'SELECT * FROM produits WHERE actif = 1 ORDER BY nom ASC',
    );
  }

  /**
   * Get all products (active and inactive), ordered by name.
   */
  static getAll(): Produit[] {
    const db = getDatabase();
    return db.getAllSync<Produit>(
      'SELECT * FROM produits ORDER BY nom ASC',
    );
  }

  /**
   * Get a product by ID.
   */
  static getById(id: number): Produit | null {
    const db = getDatabase();
    return db.getFirstSync<Produit>('SELECT * FROM produits WHERE id = ?', [id]);
  }

  /**
   * Search products by name (case-insensitive, partial match).
   */
  static search(query: string): Produit[] {
    const db = getDatabase();
    const pattern = `%${query}%`;
    return db.getAllSync<Produit>(
      'SELECT * FROM produits WHERE nom LIKE ? ORDER BY nom ASC',
      [pattern],
    );
  }

  /**
   * Create a new product.
   */
  static create(input: ProduitInput): Produit {
    const validation = validateProduit(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.errors?.map((e) => e.message).join(', '));
    }

    const data = validation.data;
    const now = nowISO();
    const db = getDatabase();
    const result = db.runSync(
      'INSERT INTO produits (nom, description, prix_vente, actif, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.nom.trim(),
        data.description?.trim() ?? null,
        data.prix_vente,
        data.actif ?? true ? 1 : 0,
        now,
        now,
      ],
    );

    return db.getFirstSync<Produit>('SELECT * FROM produits WHERE id = ?', [result.lastInsertRowId])!;
  }

  /**
   * Update an existing product.
   */
  static update(id: number, input: ProduitInput): Produit {
    const validation = validateProduit(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.errors?.map((e) => e.message).join(', '));
    }

    const data = validation.data;
    const now = nowISO();
    const db = getDatabase();
    db.runSync(
      'UPDATE produits SET nom = ?, description = ?, prix_vente = ?, actif = ?, updated_at = ? WHERE id = ?',
      [
        data.nom.trim(),
        data.description?.trim() ?? null,
        data.prix_vente,
        data.actif ?? true ? 1 : 0,
        now,
        id,
      ],
    );

    return db.getFirstSync<Produit>('SELECT * FROM produits WHERE id = ?', [id])!;
  }

  /**
   * Toggle active status of a product.
   */
  static toggleActif(id: number, actif: boolean): Produit {
    const db = getDatabase();
    const now = nowISO();
    db.runSync(
      'UPDATE produits SET actif = ?, updated_at = ? WHERE id = ?',
      [actif ? 1 : 0, now, id],
    );
    return db.getFirstSync<Produit>('SELECT * FROM produits WHERE id = ?', [id])!;
  }

  /**
   * Delete a product (soft delete by setting actif = 0).
   * Historical sales data is preserved.
   */
  static delete(id: number): void {
    const db = getDatabase();
    const now = nowISO();
    db.runSync(
      'UPDATE produits SET actif = 0, updated_at = ? WHERE id = ?',
      [now, id],
    );
  }
}

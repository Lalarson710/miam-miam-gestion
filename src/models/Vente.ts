/**
 * Vente model and repository.
 * Handles data access for ventes and vente_lignes tables.
 * Sales are saved transactionally to prevent partial records.
 */

import { getDatabase } from '@/database/database';
import { nowISO } from '@/services/formatDate';
import { ValidationError, ValidationResult, Vente, VenteInput, VenteLigne, VenteLigneInput, VenteWithProduits } from '@/types';

/**
 * Generate a unique sale number: V-YYYYMMDD-XXXX
 */
export function generateNumero(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  const d = String(mg.getDate()).padStart(2, '0');
  const time = mg.getTime();
  const suffix = String(time % 10000).padStart(4, '0');
  return `V-${y}${m}${d}-${suffix}`;
}

/**
 * Validate a vente input.
 */
export function validateVente(input: VenteInput): ValidationResult<VenteInput> {
  const errors: ValidationError[] = [];

  if (!input.date_vente) {
    errors.push({ field: 'date_vente', message: 'La date de vente est obligatoire.' });
  }

  if (!input.lignes || input.lignes.length === 0) {
    errors.push({ field: 'lignes', message: 'Ajoutez au moins un produit.' });
  }

  input.lignes?.forEach((ligne, index) => {
    if (!ligne.nom_produit || ligne.nom_produit.trim().length === 0) {
      errors.push({ field: `lignes[${index}].nom_produit`, message: 'Le nom du produit est obligatoire.' });
    }
    if (!Number.isInteger(ligne.quantite) || ligne.quantite <= 0) {
      errors.push({ field: `lignes[${index}].quantite`, message: 'La quantité doit être un entier positif.' });
    }
    if (!Number.isInteger(ligne.prix_unitaire) || ligne.prix_unitaire <= 0) {
      errors.push({ field: `lignes[${index}].prix_unitaire`, message: 'Le prix unitaire doit être supérieur à zéro.' });
    }
  });

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: input };
}

/**
 * Calculate the total amount of a sale from its lines.
 */
export function calculerMontantTotal(lignes: VenteLigneInput[]): number {
  return lignes.reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0);
}

/**
 * Repository for vente data access.
 */
export class VenteRepository {
  /**
   * Get all sales, ordered by date descending.
   */
  static getAll(): Vente[] {
    const db = getDatabase();
    return db.getAllSync<Vente>(
      'SELECT * FROM ventes ORDER BY date_vente DESC, id DESC',
    );
  }

  /**
   * Get a sale by ID with its lines.
   */
  static getById(id: number): { vente: Vente; lignes: VenteLigne[] } | null {
    const db = getDatabase();
    const vente = db.getFirstSync<Vente>('SELECT * FROM ventes WHERE id = ?', [id]);
    if (!vente) return null;

    const lignes = db.getAllSync<VenteLigne>(
      'SELECT * FROM vente_lignes WHERE vente_id = ? ORDER BY id ASC',
      [id],
    );

    return { vente, lignes };
  }

  /**
   * Get sales within a date range (inclusive).
   */
  static getByPeriode(dateDebut: string, dateFin: string): Vente[] {
    const db = getDatabase();
    return db.getAllSync<Vente>(
      'SELECT * FROM ventes WHERE date_vente >= ? AND date_vente <= ? ORDER BY date_vente DESC, id DESC',
      [dateDebut, dateFin],
    );
  }

  /**
   * Get total boxes sold for a list of sales.
   */
  static getTotalBoxes(ventes: Vente[]): number {
    if (ventes.length === 0) return 0;
    const db = getDatabase();
    const ids = ventes.map((v) => v.id);
    const placeholders = ids.map(() => '?').join(',');
    const result = db.getFirstSync<{ total: number }>(
      `SELECT COALESCE(SUM(quantite), 0) as total FROM vente_lignes WHERE vente_id IN (${placeholders})`,
      ids,
    );
    return result?.total ?? 0;
  }

  /**
   * Search sales by number (partial match).
   */
  static searchByNumero(query: string): Vente[] {
    const db = getDatabase();
    const pattern = `%${query}%`;
    return db.getAllSync<Vente>(
      'SELECT * FROM ventes WHERE numero LIKE ? ORDER BY date_vente DESC, id DESC',
      [pattern],
    );
  }

  /**
   * Get all sales with a summary of product names (comma-separated).
   */
  static getAllWithProduits(): VenteWithProduits[] {
    const db = getDatabase();
    const ventes = db.getAllSync<Vente>(
      'SELECT * FROM ventes ORDER BY date_vente DESC, id DESC',
    );
    return ventes.map((vente) => {
      const lignes = db.getAllSync<VenteLigne>(
        'SELECT DISTINCT nom_produit FROM vente_lignes WHERE vente_id = ? ORDER BY id ASC',
        [vente.id],
      );
      const produits = lignes.map((l) => l.nom_produit).join(', ');
      return { ...vente, produits };
    });
  }

  /**
   * Search sales by number with product summary.
   */
  static searchByNumeroWithProduits(query: string): VenteWithProduits[] {
    const db = getDatabase();
    const pattern = `%${query}%`;
    const ventes = db.getAllSync<Vente>(
      'SELECT * FROM ventes WHERE numero LIKE ? ORDER BY date_vente DESC, id DESC',
      [pattern],
    );
    return ventes.map((vente) => {
      const lignes = db.getAllSync<VenteLigne>(
        'SELECT DISTINCT nom_produit FROM vente_lignes WHERE vente_id = ? ORDER BY id ASC',
        [vente.id],
      );
      const produits = lignes.map((l) => l.nom_produit).join(', ');
      return { ...vente, produits };
    });
  }

  /**
   * Create a new sale with its lines in a transaction.
   * The sale number is auto-generated.
   */
  static create(input: VenteInput): Vente {
    const validation = validateVente(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.errors?.map((e) => e.message).join(', '));
    }

    const data = validation.data;
    const montantTotal = calculerMontantTotal(data.lignes);
    const numero = generateNumero();
    const now = nowISO();
    const db = getDatabase();

    // Use transaction to ensure atomicity
    db.execSync('BEGIN TRANSACTION');
    try {
      const result = db.runSync(
        'INSERT INTO ventes (numero, date_vente, montant_total, mode_paiement, observation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          numero,
          data.date_vente,
          montantTotal,
          data.mode_paiement ?? null,
          data.observation?.trim() ?? null,
          now,
          now,
        ],
      );

      const venteId = result.lastInsertRowId;

      for (const ligne of data.lignes) {
        const montantLigne = ligne.quantite * ligne.prix_unitaire;
        db.runSync(
          'INSERT INTO vente_lignes (vente_id, produit_id, nom_produit, quantite, prix_unitaire, montant_ligne) VALUES (?, ?, ?, ?, ?, ?)',
          [
            venteId,
            ligne.produit_id ?? null,
            ligne.nom_produit.trim(),
            ligne.quantite,
            ligne.prix_unitaire,
            montantLigne,
          ],
        );
      }

      db.execSync('COMMIT');
      return db.getFirstSync<Vente>('SELECT * FROM ventes WHERE id = ?', [venteId])!;
    } catch (error) {
      db.execSync('ROLLBACK');
      throw error;
    }
  }

  /**
   * Update an existing sale (including its lines) in a transaction.
   */
  static update(id: number, input: VenteInput): Vente {
    const validation = validateVente(input);
    if (!validation.success || !validation.data) {
      throw new Error(validation.errors?.map((e) => e.message).join(', '));
    }

    const data = validation.data;
    const montantTotal = calculerMontantTotal(data.lignes);
    const now = nowISO();
    const db = getDatabase();

    db.execSync('BEGIN TRANSACTION');
    try {
      db.runSync(
        'UPDATE ventes SET date_vente = ?, montant_total = ?, mode_paiement = ?, observation = ?, updated_at = ? WHERE id = ?',
        [
          data.date_vente,
          montantTotal,
          data.mode_paiement ?? null,
          data.observation?.trim() ?? null,
          now,
          id,
        ],
      );

      // Delete existing lines
      db.runSync('DELETE FROM vente_lignes WHERE vente_id = ?', [id]);

      // Insert new lines
      for (const ligne of data.lignes) {
        const montantLigne = ligne.quantite * ligne.prix_unitaire;
        db.runSync(
          'INSERT INTO vente_lignes (vente_id, produit_id, nom_produit, quantite, prix_unitaire, montant_ligne) VALUES (?, ?, ?, ?, ?, ?)',
          [
            id,
            ligne.produit_id ?? null,
            ligne.nom_produit.trim(),
            ligne.quantite,
            ligne.prix_unitaire,
            montantLigne,
          ],
        );
      }

      db.execSync('COMMIT');
      return db.getFirstSync<Vente>('SELECT * FROM ventes WHERE id = ?', [id])!;
    } catch (error) {
      db.execSync('ROLLBACK');
      throw error;
    }
  }

  /**
   * Delete a sale (soft delete by removing from ventes, lines cascade).
   * Note: This removes the sale from active records. Historical data is lost.
   * For a true soft-delete, consider adding a 'supprime' flag.
   */
  static delete(id: number): void {
    const db = getDatabase();
    db.runSync('DELETE FROM ventes WHERE id = ?', [id]);
    // vente_lignes are deleted via ON DELETE CASCADE
  }
}

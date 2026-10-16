/**
 * VenteController - orchestrates sales operations.
 * Handles sale creation, retrieval, search, and filtering.
 */

import { VenteRepository } from '@/models/Vente';
import { nowISO } from '@/services/formatDate';
import { ValidationResult, Vente, VenteInput, VenteLigne, VenteWithProduits } from '@/types';

export class VenteController {
  /**
   * Get all sales.
   */
  static getVentes(): Vente[] {
    return VenteRepository.getAll();
  }

  /**
   * Get all sales with product names summary.
   */
  static getVentesWithProduits(): VenteWithProduits[] {
    return VenteRepository.getAllWithProduits();
  }

  /**
   * Search sales by number with product names summary.
   */
  static searchVentesWithProduits(query: string): VenteWithProduits[] {
    if (!query.trim()) {
      return this.getVentesWithProduits();
    }
    return VenteRepository.searchByNumeroWithProduits(query);
  }

  /**
   * Get a sale with its lines by ID.
   */
  static getVente(id: number): { vente: Vente; lignes: VenteLigne[] } | null {
    return VenteRepository.getById(id);
  }

  /**
   * Get sales within a date range.
   */
  static getVentesParPeriode(dateDebut: string, dateFin: string): Vente[] {
    return VenteRepository.getByPeriode(dateDebut, dateFin);
  }

  /**
   * Search sales by number.
   */
  static searchVentes(query: string): Vente[] {
    if (!query.trim()) {
      return this.getVentes();
    }
    return VenteRepository.searchByNumero(query);
  }

  /**
   * Get total boxes sold for a list of sales.
   */
  static getTotalBoxes(ventes: Vente[]): number {
    return VenteRepository.getTotalBoxes(ventes);
  }

  /**
   * Create a new sale with validation and transactional save.
   */
  static createVente(input: VenteInput): ValidationResult<Vente> {
    try {
      const vente = VenteRepository.create(input);
      return { success: true, data: vente };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Erreur inconnue.' }],
      };
    }
  }

  /**
   * Update an existing sale.
   */
  static updateVente(id: number, input: VenteInput): ValidationResult<Vente> {
    try {
      const vente = VenteRepository.update(id, input);
      return { success: true, data: vente };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Erreur inconnue.' }],
      };
    }
  }

  /**
   * Delete a sale.
   */
  static deleteVente(id: number): void {
    VenteRepository.delete(id);
  }

  /**
   * Get today's sales for the dashboard.
   */
  static getVentesDuJour(): Vente[] {
    const today = nowISO().split('T')[0];
    return VenteRepository.getByPeriode(
      `${today}T00:00:00.000Z`,
      `${today}T23:59:59.999Z`,
    );
  }
}

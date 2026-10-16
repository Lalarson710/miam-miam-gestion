/**
 * ProduitController - orchestrates product operations.
 * Acts as the bridge between views and the ProduitRepository.
 */

import { ProduitRepository } from '@/models/Produit';
import { Produit, ProduitInput, ValidationResult } from '@/types';

export class ProduitController {
  /**
   * Get all active products for selection in forms.
   */
  static getProduitsActifs(): Produit[] {
    return ProduitRepository.getAllActifs();
  }

  /**
   * Get all products (including inactive) for management screen.
   */
  static getAllProduits(): Produit[] {
    return ProduitRepository.getAll();
  }

  /**
   * Get a single product by ID.
   */
  static getProduit(id: number): Produit | null {
    return ProduitRepository.getById(id);
  }

  /**
   * Search products by name.
   */
  static searchProduits(query: string): Produit[] {
    if (!query.trim()) {
      return this.getProduitsActifs();
    }
    return ProduitRepository.search(query);
  }

  /**
   * Create a new product with validation.
   */
  static createProduit(input: ProduitInput): ValidationResult<Produit> {
    try {
      const produit = ProduitRepository.create(input);
      return { success: true, data: produit };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Erreur inconnue.' }],
      };
    }
  }

  /**
   * Update an existing product with validation.
   */
  static updateProduit(id: number, input: ProduitInput): ValidationResult<Produit> {
    try {
      const produit = ProduitRepository.update(id, input);
      return { success: true, data: produit };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Erreur inconnue.' }],
      };
    }
  }

  /**
   * Toggle the active status of a product.
   */
  static toggleProduitActif(id: number, actif: boolean): Produit {
    return ProduitRepository.toggleActif(id, actif);
  }

  /**
   * Delete (deactivate) a product.
   */
  static deleteProduit(id: number): void {
    ProduitRepository.delete(id);
  }
}

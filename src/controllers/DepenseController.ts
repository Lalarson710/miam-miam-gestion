/**
 * DepenseController - orchestrates expense operations.
 * Handles expense creation, retrieval, search, filtering, and totals.
 */

import { DepenseRepository } from '@/models/Depense';
import { nowISO } from '@/services/formatDate';
import { Depense, DepenseInput, ValidationResult } from '@/types';

export class DepenseController {
  /**
   * Get all expenses.
   */
  static getDepenses(): Depense[] {
    return DepenseRepository.getAll();
  }

  /**
   * Get an expense by ID.
   */
  static getDepense(id: number): Depense | null {
    return DepenseRepository.getById(id);
  }

  /**
   * Get expenses within a date range.
   */
  static getDepensesParPeriode(dateDebut: string, dateFin: string): Depense[] {
    return DepenseRepository.getByPeriode(dateDebut, dateFin);
  }

  /**
   * Get expenses by category within a date range.
   */
  static getDepensesParCategorie(categorie: string, dateDebut: string, dateFin: string): Depense[] {
    return DepenseRepository.getByCategorie(categorie, dateDebut, dateFin);
  }

  /**
   * Search expenses by libelle.
   */
  static searchDepenses(query: string): Depense[] {
    if (!query.trim()) {
      return this.getDepenses();
    }
    return DepenseRepository.search(query);
  }

  /**
   * Get total expenses for a date range.
   */
  static getTotalDepenses(dateDebut: string, dateFin: string): number {
    return DepenseRepository.getTotalMontant(dateDebut, dateFin);
  }

  /**
   * Get expenses grouped by category for a date range.
   */
  static getTotalParCategorie(dateDebut: string, dateFin: string): { categorie: string; total: number }[] {
    return DepenseRepository.getTotalParCategorie(dateDebut, dateFin);
  }

  /**
   * Create a new expense with validation.
   */
  static createDepense(input: DepenseInput): ValidationResult<Depense> {
    try {
      const depense = DepenseRepository.create(input);
      return { success: true, data: depense };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Erreur inconnue.' }],
      };
    }
  }

  /**
   * Update an existing expense.
   */
  static updateDepense(id: number, input: DepenseInput): ValidationResult<Depense> {
    try {
      const depense = DepenseRepository.update(id, input);
      return { success: true, data: depense };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'general', message: error instanceof Error ? error.message : 'Erreur inconnue.' }],
      };
    }
  }

  /**
   * Delete an expense.
   */
  static deleteDepense(id: number): void {
    DepenseRepository.delete(id);
  }

  /**
   * Get today's expenses for the dashboard.
   */
  static getDepensesDuJour(): Depense[] {
    const today = nowISO().split('T')[0];
    return DepenseRepository.getByPeriode(
      `${today}T00:00:00.000Z`,
      `${today}T23:59:59.999Z`,
    );
  }
}

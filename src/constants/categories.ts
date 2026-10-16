/**
 * Expense categories for Miam Miam Gestion.
 * Each category has a label, icon name, and color for display.
 */

import { CategorieDepense } from '@/types';

export interface CategorieInfo {
  value: CategorieDepense;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES_DEPENSE: CategorieInfo[] = [
  {
    value: 'ingredients',
    label: 'Ingrédients',
    icon: 'food-cutter',
    color: '#DC2626',
  },
  {
    value: 'emballages',
    label: 'Emballages',
    icon: 'package-variant',
    color: '#EA580C',
  },
  {
    value: 'combustible_cuisson',
    label: 'Combustible & cuisson',
    icon: 'fire',
    color: '#D97706',
  },
  {
    value: 'transport_livraison',
    label: 'Transport & livraison',
    icon: 'truck-delivery',
    color: '#2563EB',
  },
  {
    value: 'eau_electricite',
    label: 'Eau & électricité',
    icon: 'flash',
    color: '#0EA5E9',
  },
  {
    value: 'materiel_ustensiles',
    label: 'Matériel & ustensiles',
    icon: 'tools',
    color: '#7C3AED',
  },
  {
    value: 'autre',
    label: 'Autre',
    icon: 'dots-horizontal',
    color: '#6B7280',
  },
];

export const CATEGORIE_LABELS: Record<string, string> = {
  ingredients: 'Ingrédients',
  emballages: 'Emballages',
  combustible_cuisson: 'Combustible & cuisson',
  transport_livraison: 'Transport & livraison',
  eau_electricite: 'Eau & électricité',
  materiel_ustensiles: 'Matériel & ustensiles',
  autre: 'Autre',
};

export const MODES_PAIEMENT = [
  { value: 'espece', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'autre', label: 'Autre' },
] as const;

export const MODE_PAIEMENT_LABELS: Record<string, string> = {
  espece: 'Espèces',
  mobile_money: 'Mobile Money',
  autre: 'Autre',
};

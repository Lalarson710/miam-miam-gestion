/**
 * Type definitions for Miam Miam Gestion.
 * Centralizes all domain types used across models, controllers, and views.
 */

// ─── Produit (Product) ───────────────────────────────────────────────

export interface Produit {
  id: number;
  nom: string;
  description: string | null;
  prix_vente: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProduitInput {
  nom: string;
  description?: string;
  prix_vente: number;
  actif?: boolean;
}

// ─── Vente (Sale) ────────────────────────────────────────────────────

export type ModePaiement = 'espece' | 'mobile_money' | 'autre' | null;

export interface Vente {
  id: number;
  numero: string;
  date_vente: string;
  montant_total: number;
  mode_paiement: ModePaiement;
  observation: string | null;
  created_at: string;
  updated_at: string;
}

export interface VenteLigne {
  id: number;
  vente_id: number;
  produit_id: number | null;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
}

export interface VenteLigneInput {
  produit_id: number | null;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
}

export interface VenteInput {
  date_vente: string;
  lignes: VenteLigneInput[];
  mode_paiement?: ModePaiement;
  observation?: string;
}

export interface VenteWithProduits extends Vente {
  produits: string;
}

// ─── Depense (Expense) ───────────────────────────────────────────────

export type CategorieDepense =
  | 'ingredients'
  | 'emballages'
  | 'combustible_cuisson'
  | 'transport_livraison'
  | 'eau_electricite'
  | 'materiel_ustensiles'
  | 'autre';

export interface Depense {
  id: number;
  date_depense: string;
  libelle: string;
  categorie: CategorieDepense;
  montant: number;
  quantite: number | null;
  unite: string | null;
  observation: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepenseInput {
  date_depense: string;
  libelle: string;
  categorie: CategorieDepense;
  montant: number;
  quantite?: number;
  unite?: string;
  observation?: string;
}

// ─── Rapports (Reports) ──────────────────────────────────────────────

export type PeriodePreset =
  | 'aujourd_hui'
  | 'hier'
  | '7_derniers_jours'
  | 'cette_semaine'
  | 'ce_mois'
  | 'ce_trimestre'
  | 'cette_annee'
  | 'personnalise';

export interface PeriodeFiltre {
  type: PeriodePreset;
  dateDebut?: string;
  dateFin?: string;
}

export type DateMode = 'complet' | 'mois_annee';

export interface RapportResume {
  totalRecettes: number;
  totalDepenses: number;
  resultatEstime: number;
  nombreVentes: number;
  nombreBoxes: number;
  depensesParCategorie: Record<string, number>;
  evolutionQuotidienne: EvolutionQuotidienne[];
}

export interface EvolutionQuotidienne {
  date: string;
  recettes: number;
  depenses: number;
}

// ─── Validation ──────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

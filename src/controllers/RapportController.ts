/**
 * RapportController - orchestrates report operations.
 * Computes financial summaries for various time periods.
 */

import { DepenseRepository } from '@/models/Depense';
import { VenteRepository } from '@/models/Vente';
import {
  depensesParCategorie,
  evolutionQuotidienne,
  resultatEstime,
  totalDepenses,
  totalRecettes,
} from '@/services/calculBenefice';
import {
  daysAgoISO,
  endOfPeriodISO,
  endOfTodayISO,
  endOfYesterdayISO,
  startOfMonthISO,
  startOfQuarterISO,
  startOfTodayISO,
  startOfWeekISO,
  startOfYearISO,
  startOfYesterdayISO,
} from '@/services/formatDate';
import { Depense, PeriodeFiltre, RapportResume, Vente } from '@/types';

/**
 * Compute the date range (start, end) for a given period preset.
 * All dates are ISO 8601 strings in Madagascar time.
 */
export function getPeriodeDates(filtre: PeriodeFiltre): { dateDebut: string; dateFin: string } {
  switch (filtre.type) {
    case 'aujourd_hui':
      return { dateDebut: startOfTodayISO(), dateFin: endOfTodayISO() };

    case 'hier':
      return { dateDebut: startOfYesterdayISO(), dateFin: endOfYesterdayISO() };

    case '7_derniers_jours':
      return { dateDebut: daysAgoISO(6), dateFin: endOfPeriodISO() };

    case 'cette_semaine':
      return { dateDebut: startOfWeekISO(), dateFin: endOfPeriodISO() };

    case 'ce_mois':
      return { dateDebut: startOfMonthISO(), dateFin: endOfPeriodISO() };

    case 'ce_trimestre':
      return { dateDebut: startOfQuarterISO(), dateFin: endOfPeriodISO() };

    case 'cette_annee':
      return { dateDebut: startOfYearISO(), dateFin: endOfPeriodISO() };

    case 'personnalise':
      if (!filtre.dateDebut || !filtre.dateFin) {
        throw new Error('Une période personnalisée nécessite une date de début et une date de fin.');
      }
      return { dateDebut: filtre.dateDebut, dateFin: filtre.dateFin };

    default:
      return { dateDebut: startOfTodayISO(), dateFin: endOfPeriodISO() };
  }
}

/**
 * Get the label for a period preset.
 */
export function getPeriodeLabel(filtre: PeriodeFiltre): string {
  switch (filtre.type) {
    case 'aujourd_hui':
      return "Aujourd'hui";
    case 'hier':
      return 'Hier';
    case '7_derniers_jours':
      return '7 derniers jours';
    case 'cette_semaine':
      return 'Cette semaine';
    case 'ce_mois':
      return 'Ce mois';
    case 'ce_trimestre':
      return 'Ce trimestre';
    case 'cette_annee':
      return 'Cette année';
    case 'personnalise':
      return 'Période personnalisée';
    default:
      return "Aujourd'hui";
  }
}

/**
 * All available period presets for the filter UI.
 */
export const PERIODES_DISPONIBLES: PeriodeFiltre[] = [
  { type: 'aujourd_hui' },
  { type: 'hier' },
  { type: '7_derniers_jours' },
  { type: 'cette_semaine' },
  { type: 'ce_mois' },
  { type: 'ce_trimestre' },
  { type: 'cette_annee' },
  { type: 'personnalise' },
];

export class RapportController {
  /**
   * Generate a financial summary for a given period.
   */
  static getRapport(filtre: PeriodeFiltre): RapportResume {
    const { dateDebut, dateFin } = getPeriodeDates(filtre);

    const ventes = VenteRepository.getByPeriode(dateDebut, dateFin);
    const depenses = DepenseRepository.getByPeriode(dateDebut, dateFin);

    const totalRecette = totalRecettes(ventes);
    const totalDepense = totalDepenses(depenses);
    const resultat = resultatEstime(totalRecette, totalDepense);

    const nombreVentes = ventes.length;
    const nombreBoxes = VenteRepository.getTotalBoxes(ventes);

    const depensesParCat = depensesParCategorie(depenses);

    const evolution = evolutionQuotidienne(ventes, depenses, dateDebut, dateFin);

    return {
      totalRecettes: totalRecette,
      totalDepenses: totalDepense,
      resultatEstime: resultat,
      nombreVentes,
      nombreBoxes,
      depensesParCategorie: depensesParCat,
      evolutionQuotidienne: evolution,
    };
  }

  /**
   * Get today's summary for the dashboard.
   */
  static getResumeDuJour(): RapportResume {
    return this.getRapport({ type: 'aujourd_hui' });
  }

  /**
   * Get recent activity (last 10 sales + last 10 expenses).
   */
  static getActiviteRecente(): { ventes: Vente[]; depenses: Depense[] } {
    const ventes = VenteRepository.getAll().slice(0, 10);
    const depenses = DepenseRepository.getAll().slice(0, 10);
    return { ventes, depenses };
  }
}

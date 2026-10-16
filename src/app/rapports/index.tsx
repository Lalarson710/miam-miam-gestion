/**
 * Rapports screen - affichage des rapports financiers
 * avec filtres par période, dates personnalisées et mois/année.
 */

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { RapportController } from '@/controllers/RapportController';
import { todayDate } from '@/services/formatDate';
import { DateMode, PeriodeFiltre, RapportResume } from '@/types';
import { RapportView } from '@/views/rapports/RapportView';

export default function RapportsScreen() {
  const [rapport, setRapport] = useState<RapportResume | null>(null);

  const [periode, setPeriode] = useState<PeriodeFiltre>({
    type: 'aujourd_hui',
  });

  // Date complète : YYYY-MM-DD
  // Mois / année : YYYY-MM
  const [dateDebutCustom, setDateDebutCustom] = useState('');
  const [dateFinCustom, setDateFinCustom] = useState('');

  const [dateMode, setDateMode] = useState<DateMode>('complet');

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<
    'debut' | 'fin' | null
  >(null);

  const [loading, setLoading] = useState(false);

  /**
   * Vérifie que la date correspond exactement au format attendu.
   */
  const isValidCustomDate = (
    dateStr: string,
    mode: DateMode,
  ): boolean => {
    if (mode === 'mois_annee') {
      const match = /^(\d{4})-(\d{2})$/.exec(dateStr);

      if (!match) return false;

      const year = Number(match[1]);
      const month = Number(match[2]);

      return year >= 1900 && month >= 1 && month <= 12;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);

    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      year >= 1900 &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  };

  /**
   * Convertit la date de début en ISO (heure locale UTC+3 Madagascar).
   * Une vente à 00:29 locale le 16 oct doit être incluse dans le rapport du 16 oct.
   */
  const dateDebutISO = (dateStr: string): string => {
    if (dateMode === 'mois_annee') {
      const [year, month] = dateStr.split('-').map(Number);
      // Premier jour du mois à minuit heure locale
      return new Date(year, month - 1, 1, 0, 0, 0).toISOString();
    }

    // Minuit heure locale (pas UTC)
    return new Date(`${dateStr}T00:00:00`).toISOString();
  };

  /**
   * Convertit la date de fin en ISO (heure locale UTC+3 Madagascar).
   * En mode mois/année, prend le dernier jour du mois.
   */
  const dateFinISO = (dateStr: string): string => {
    if (dateMode === 'mois_annee') {
      const [year, month] = dateStr.split('-').map(Number);

      // Dernier jour du mois à 23:59:59.999 heure locale
      const debutMoisSuivant = new Date(year, month, 1, 0, 0, 0);
      return new Date(debutMoisSuivant.getTime() - 1).toISOString();
    }

    // 23:59:59.999 heure locale (pas UTC)
    return new Date(`${dateStr}T23:59:59.999`).toISOString();
  };

  /**
   * Charge le rapport seulement si le filtre est complet.
   */
  const loadRapport = useCallback(() => {
    if (periode.type === 'personnalise') {
      // Ne jamais appeler le contrôleur avec des dates absentes.
      if (!dateDebutCustom || !dateFinCustom) {
        setLoading(false);
        return;
      }

      // Vérification du format selon le mode actif.
      if (
        !isValidCustomDate(dateDebutCustom, dateMode) ||
        !isValidCustomDate(dateFinCustom, dateMode)
      ) {
        setLoading(false);
        return;
      }

      // Les formats ISO YYYY-MM-DD et YYYY-MM
      // peuvent être comparés chronologiquement ici.
      if (dateDebutCustom > dateFinCustom) {
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    try {
      let filtre: PeriodeFiltre = periode;

      if (periode.type === 'personnalise') {
        // Les deux dates ont été validées ci-dessus.
        filtre = {
          type: 'personnalise',
          dateDebut: dateDebutISO(dateDebutCustom),
          dateFin: dateFinISO(dateFinCustom),
        };
      }

      const resultat = RapportController.getRapport(filtre);
      setRapport(resultat);
    } catch (error) {
      console.error('Failed to load rapport:', error);
    } finally {
      setLoading(false);
    }
  }, [
    periode,
    dateDebutCustom,
    dateFinCustom,
    dateMode,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadRapport();
    }, [loadRapport]),
  );

  /**
   * Initialise le filtre personnalisé avec la date du jour.
   */
  const handlePeriodeChange = (p: PeriodeFiltre) => {
    if (p.type === 'personnalise') {
      const today = todayDate();

      if (dateMode === 'complet') {
        setDateDebutCustom(today);
        setDateFinCustom(today);
      } else {
        const moisCourant = today.substring(0, 7);

        setDateDebutCustom(moisCourant);
        setDateFinCustom(moisCourant);
      }
    }

    setPeriode(p);
  };

  /**
   * Change le mode sans laisser les dates vides.
   */
  const handleDateModeChange = (mode: DateMode) => {
    if (mode === dateMode) return;

    const today = todayDate();

    if (mode === 'mois_annee') {
      // Utilise le mois correspondant à la date sélectionnée,
      // ou le mois courant si aucune date n'est disponible.
      const sourceDate = dateDebutCustom || today;
      const mois = sourceDate.substring(0, 7);

      setDateDebutCustom(mois);
      setDateFinCustom(mois);
    } else {
      // En revenant au mode date complète,
      // utilise une date complète valide.
      const sourceDate = dateDebutCustom || today;
      const dateComplete =
        /^\d{4}-\d{2}-\d{2}$/.test(sourceDate)
          ? sourceDate
          : today;

      setDateDebutCustom(dateComplete);
      setDateFinCustom(dateComplete);
    }

    setDateMode(mode);
    setDatePickerVisible(false);
    setDatePickerTarget(null);
  };

  const showDatePicker = (target: 'debut' | 'fin') => {
    setDatePickerTarget(target);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
    setDatePickerTarget(null);
  };

  /**
   * Gère la sélection dans le calendrier natif.
   */
  const handleDatePickerChange = (
    event: { type?: string },
    date?: Date,
  ) => {
    // Sur Android, l'utilisateur peut fermer le calendrier
    // sans sélectionner de date.
    if (event.type === 'dismissed' || !date) {
      hideDatePicker();
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (dateMode === 'complet') {
      const dateStr = `${year}-${month}-${day}`;

      if (datePickerTarget === 'debut') {
        setDateDebutCustom(dateStr);
      } else if (datePickerTarget === 'fin') {
        setDateFinCustom(dateStr);
      }
    } else {
      // En mode mois/année, on ignore le jour sélectionné.
      const moisStr = `${year}-${month}`;

      setDateDebutCustom(moisStr);
      setDateFinCustom(moisStr);
    }

    hideDatePicker();
  };

  return (
    <RapportView
      rapport={rapport}
      periodeSelectionnee={periode}
      dateDebutCustom={dateDebutCustom}
      dateFinCustom={dateFinCustom}
      dateMode={dateMode}
      loading={loading}
      onPeriodeChange={handlePeriodeChange}
      onDateDebutChange={setDateDebutCustom}
      onDateFinChange={setDateFinCustom}
      onDateModeChange={handleDateModeChange}
      datePickerVisible={datePickerVisible}
      datePickerTarget={datePickerTarget}
      onDatePickerChange={handleDatePickerChange}
      onDatePickerShow={showDatePicker}
      onDatePickerHide={hideDatePicker}
    />
  );
}

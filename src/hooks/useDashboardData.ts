/**
 * useDashboardData hook - fetches dashboard data (today's summary and recent activity).
 * Refreshes when the screen comes into focus.
 */

import { RapportController } from '@/controllers/RapportController';
import { Depense, RapportResume, Vente } from '@/types';
import { useCallback, useState } from 'react';

export function useDashboardData() {
  const [resume, setResume] = useState<RapportResume | null>(null);
  const [activiteRecente, setActiviteRecente] = useState<{ ventes: Vente[]; depenses: Depense[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const r = RapportController.getResumeDuJour();
      const a = RapportController.getActiviteRecente();
      setResume(r);
      setActiviteRecente(a);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { resume, activiteRecente, loading, refresh };
}

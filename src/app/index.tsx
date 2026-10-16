import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardView } from '@/views/dashboard/DashboardView';

export default function DashboardScreen() {
  const { resume, activiteRecente, loading, refresh } = useDashboardData();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleGererProduits = () => {
    router.push('/produits' as any);
  };

  return (
    <DashboardView
      resume={resume}
      activiteRecente={activiteRecente}
      loading={loading}
      onNouvelleVente={() => router.push('/ventes/nouvelle-vente' as any)}
      onNouvelleDepense={() => router.push('/depenses/nouvelle-depense' as any)}
      onGererProduits={handleGererProduits}
      onVoirRapports={() => router.push('/rapports' as any)}
    />
  );
}

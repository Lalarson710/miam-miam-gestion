/**
 * Ventes list screen - displays all sales with search and filter.
 */

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { VenteController } from '@/controllers/VenteController';
import { VenteWithProduits } from '@/types';
import { VentesListView } from '@/views/ventes/VentesListView';

export default function VentesScreen() {
  const [ventes, setVentes] = useState<VenteWithProduits[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadVentes = useCallback(() => {
    if (searchQuery.trim()) {
      setVentes(VenteController.searchVentesWithProduits(searchQuery));
    } else {
      setVentes(VenteController.getVentesWithProduits());
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadVentes();
    }, [loadVentes]),
  );

  const totalBoxes = VenteController.getTotalBoxes(ventes);

  return (
    <VentesListView
      ventes={ventes}
      totalBoxes={totalBoxes}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterPress={() => {}}
      onNouvelleVente={() => router.push('/ventes/nouvelle-vente')}
      onEditVente={(id) => router.push({ pathname: '/ventes/[id]', params: { id: String(id) } })}
    />
  );
}

/**
 * Depenses list screen - displays all expenses with search and filter.
 */

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { DepenseController } from '@/controllers/DepenseController';
import { Depense } from '@/types';
import { DepensesListView } from '@/views/depenses/DepensesListView';

export default function DepensesScreen() {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDepenses = useCallback(() => {
    if (searchQuery.trim()) {
      setDepenses(DepenseController.searchDepenses(searchQuery));
    } else {
      setDepenses(DepenseController.getDepenses());
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadDepenses();
    }, [loadDepenses]),
  );

  return (
    <DepensesListView
      depenses={depenses}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterPress={() => {}}
      onNouvelleDepense={() => router.push('/depenses/nouvelle-depense')}
      onEditDepense={(id) => router.push({ pathname: '/depenses/[id]', params: { id: String(id) } })}
    />
  );
}

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { ProduitController } from '@/controllers/ProduitController';
import { Produit } from '@/types';
import { ProduitsListView } from '@/views/produits/ProduitsListView';

export default function ProduitsScreen() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('[DEBUG] ProduitsScreen: mounted');
    return () => console.log('[DEBUG] ProduitsScreen: unmounted');
  }, []);

  const loadProduits = useCallback(() => {
    console.log('[DEBUG] ProduitsScreen: loadProduits');
    if (searchQuery.trim()) {
      setProduits(ProduitController.searchProduits(searchQuery));
    } else {
      setProduits(ProduitController.getAllProduits());
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG] ProduitsScreen: focused');
      loadProduits();
    }, [loadProduits]),
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleToggleActif = (id: number, actif: boolean) => {
    ProduitController.toggleProduitActif(id, actif);
    loadProduits();
  };

  const handleDelete = (id: number) => {
    ProduitController.deleteProduit(id);
    loadProduits();
  };

  return (
    <ProduitsListView
      produits={produits}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onAddProduit={() => router.push('/produits/nouveau')}
      onEditProduit={(id) => router.push({ pathname: '/produits/[id]', params: { id: String(id) } })}
      onToggleActif={handleToggleActif}
      onDeleteProduit={handleDelete}
    />
  );
}

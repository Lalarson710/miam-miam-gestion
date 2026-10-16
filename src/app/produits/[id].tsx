/**
 * Edit produit screen - form for editing an existing product.
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { ProduitController } from '@/controllers/ProduitController';
import { Produit, ProduitInput, ValidationError } from '@/types';
import { ProduitFormView } from '@/views/produits/ProduitFormView';

export default function EditProduitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const loadProduit = useCallback(() => {
    const p = ProduitController.getProduit(parseInt(id, 10));
    if (p) {
      setProduit(p);
    } else {
      router.back();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadProduit();
    }, [loadProduit]),
  );

  if (!produit) {
    return null;
  }

  const handleSave = (input: ProduitInput) => {
    setLoading(true);
    const result = ProduitController.updateProduit(produit.id, input);
    if (result.success) {
      router.back();
    } else {
      setErrors(result.errors ?? []);
    }
    setLoading(false);
  };

  return (
    <ProduitFormView
      initialData={{
        nom: produit.nom,
        description: produit.description ?? undefined,
        prix_vente: produit.prix_vente,
        actif: produit.actif,
      }}
      loading={loading}
      errors={errors}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}

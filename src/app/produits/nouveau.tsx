/**
 * Nouveau produit screen - form for creating a new product.
 */

import { router } from 'expo-router';
import { useState } from 'react';

import { ProduitController } from '@/controllers/ProduitController';
import { ProduitInput, ValidationError } from '@/types';
import { ProduitFormView } from '@/views/produits/ProduitFormView';

export default function NouveauProduitScreen() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleSave = (input: ProduitInput) => {
    setLoading(true);
    const result = ProduitController.createProduit(input);
    if (result.success) {
      router.back();
    } else {
      setErrors(result.errors ?? []);
    }
    setLoading(false);
  };

  return (
    <ProduitFormView
      loading={loading}
      errors={errors}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}

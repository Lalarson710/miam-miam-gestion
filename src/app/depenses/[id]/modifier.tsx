/**
 * Edit depense screen - form for editing an existing expense.
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { DepenseController } from '@/controllers/DepenseController';
import { Depense, DepenseInput, ValidationError } from '@/types';
import { DepenseFormView } from '@/views/depenses/DepenseFormView';

export default function EditDepenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const depenseId = parseInt(id, 10);
  const [depense, setDepense] = useState<Depense | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const loadDepense = useCallback(() => {
    const d = DepenseController.getDepense(depenseId);
    if (d) {
      setDepense(d);
    } else {
      router.back();
    }
  }, [depenseId]);

  useFocusEffect(
    useCallback(() => {
      loadDepense();
    }, [loadDepense]),
  );

  const handleSave = (input: DepenseInput) => {
    setLoading(true);
    const result = DepenseController.updateDepense(depenseId, input);
    if (result.success) {
      router.back();
    } else {
      setErrors(result.errors ?? []);
    }
    setLoading(false);
  };

  if (!depense) {
    return null;
  }

  return (
    <DepenseFormView
      initialData={{
        date_depense: depense.date_depense,
        libelle: depense.libelle,
        categorie: depense.categorie,
        montant: depense.montant,
        quantite: depense.quantite ?? undefined,
        unite: depense.unite ?? undefined,
        observation: depense.observation ?? undefined,
      }}
      loading={loading}
      errors={errors}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}

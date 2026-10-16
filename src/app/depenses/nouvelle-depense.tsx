/**
 * Nouvelle dépense screen - form for creating a new expense.
 */

import { router } from 'expo-router';
import { useState } from 'react';

import { DepenseController } from '@/controllers/DepenseController';
import { nowISO } from '@/services/formatDate';
import { DepenseInput, ValidationError } from '@/types';
import { DepenseFormView } from '@/views/depenses/DepenseFormView';

export default function NouvelleDepenseScreen() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleSave = (input: DepenseInput) => {
    setLoading(true);
    const result = DepenseController.createDepense(input);
    if (result.success) {
      router.back();
    } else {
      setErrors(result.errors ?? []);
    }
    setLoading(false);
  };

  return (
    <DepenseFormView
      initialData={{ date_depense: nowISO() }}
      loading={loading}
      errors={errors}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}

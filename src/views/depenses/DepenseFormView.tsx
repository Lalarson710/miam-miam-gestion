/**
 * DepenseFormView - Form for adding or editing an expense.
 * Pure component: receives data and callbacks as props.
 */

import { CATEGORIES_DEPENSE, CATEGORIE_LABELS } from '@/constants/categories';
import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { CategorieDepense, DepenseInput, ValidationError } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { AppInput } from '@/views/components/AppInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface DepenseFormViewProps {
  initialData?: Partial<DepenseInput>;
  loading?: boolean;
  errors?: ValidationError[];
  onSave: (input: DepenseInput) => void;
  onCancel: () => void;
}

export function DepenseFormView({
  initialData,
  loading = false,
  errors = [],
  onSave,
  onCancel,
}: DepenseFormViewProps) {
  const [date, setDate] = useState(initialData?.date_depense ?? '');
  const [libelle, setLibelle] = useState(initialData?.libelle ?? '');
  const [categorie, setCategorie] = useState<CategorieDepense>(initialData?.categorie ?? 'ingredients');
  const [montant, setMontant] = useState(initialData?.montant ? String(initialData.montant) : '');
  const [quantite, setQuantite] = useState(initialData?.quantite ? String(initialData.quantite) : '');
  const [unite, setUnite] = useState(initialData?.unite ?? '');
  const [observation, setObservation] = useState(initialData?.observation ?? '');
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  const handleSave = () => {
    const input: DepenseInput = {
      date_depense: date,
      libelle: libelle.trim(),
      categorie,
      montant: parseInt(montant, 10),
      quantite: quantite ? parseInt(quantite, 10) : undefined,
      unite: unite.trim() || undefined,
      observation: observation.trim() || undefined,
    };
    onSave(input);
  };

  const selectedCategorieLabel = CATEGORIE_LABELS[categorie] ?? categorie;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{initialData?.libelle ? 'Modifier' : 'Nouvelle dépense'}</Text>
        <View style={styles.cancelButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <AppInput
            label="Date"
            placeholder="2024-01-15"
            value={date}
            onChangeText={setDate}
            error={getError('date_depense')}
          />

          <AppInput
            label="Libellé"
            placeholder="Ex: Achat de macaroni"
            value={libelle}
            onChangeText={setLibelle}
            required
            error={getError('libelle')}
          />

          <Pressable style={styles.categorySelector} onPress={() => setCategoryPickerVisible(true)}>
            <Text style={styles.categorySelectorLabel}>Catégorie</Text>
            <View style={styles.categorySelectorValue}>
              <Text style={styles.categorySelectorText}>{selectedCategorieLabel}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.textSecondary} />
            </View>
          </Pressable>
          {getError('categorie') && <Text style={styles.errorText}>{getError('categorie')}</Text>}

          <AppInput
            label="Montant (Ar)"
            placeholder="Ex: 20000"
            value={montant}
            onChangeText={setMontant}
            keyboardType="numeric"
            required
            error={getError('montant')}
          />

          <View style={styles.row}>
            <AppInput
              label="Quantité (facultatif)"
              placeholder="Ex: 2"
              value={quantite}
              onChangeText={setQuantite}
              keyboardType="numeric"
              containerStyle={styles.qtyInput}
              error={getError('quantite')}
            />
            <AppInput
              label="Unité (facultatif)"
              placeholder="Ex: kg, paquet"
              value={unite}
              onChangeText={setUnite}
              containerStyle={styles.uniteInput}
            />
          </View>

          <AppInput
            label="Note (facultatif)"
            placeholder="Ex: Livraison à 18h"
            value={observation}
            onChangeText={setObservation}
            error={getError('observation')}
          />

          {getError('general') && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{getError('general')}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <AppButton title="Annuler" onPress={onCancel} variant="outline" disabled={loading} />
            <AppButton
              title={initialData?.libelle ? 'Enregistrer' : 'Créer'}
              onPress={handleSave}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal visible={categoryPickerVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setCategoryPickerVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
            {CATEGORIES_DEPENSE.map((cat) => (
              <Pressable
                key={cat.value}
                style={[
                  styles.categoryOption,
                  categorie === cat.value && styles.categoryOptionSelected,
                ]}
                onPress={() => {
                  setCategorie(cat.value);
                  setCategoryPickerVisible(false);
                }}
              >
                <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
                <Text style={styles.categoryOptionText}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  cancelButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  qtyInput: {
    flex: 1,
    marginBottom: 0,
  },
  uniteInput: {
    flex: 2,
    marginBottom: 0,
  },
  categorySelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.card,
  },
  categorySelectorLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  categorySelectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectorText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
  errorBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorBannerText: {
    fontSize: 14,
    color: Colors.negative,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  categoryOptionText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
});

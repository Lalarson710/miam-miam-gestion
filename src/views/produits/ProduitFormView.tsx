/**
 * ProduitFormView - Form for adding or editing a product.
 * Pure component: receives initial data and callbacks as props.
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { ProduitInput, ValidationError } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { AppInput } from '@/views/components/AppInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ProduitFormViewProps {
  initialData?: Partial<ProduitInput>;
  loading?: boolean;
  errors?: ValidationError[];
  onSave: (input: ProduitInput) => void;
  onCancel: () => void;
}

export function ProduitFormView({
  initialData,
  loading = false,
  errors = [],
  onSave,
  onCancel,
}: ProduitFormViewProps) {
  const [nom, setNom] = useState(initialData?.nom ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [prixVente, setPrixVente] = useState(initialData?.prix_vente ? String(initialData.prix_vente) : '');
  const [actif, setActif] = useState(initialData?.actif ?? true);

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  const handleSave = () => {
    const input: ProduitInput = {
      nom: nom.trim(),
      description: description.trim() || undefined,
      prix_vente: parseInt(prixVente, 10),
      actif,
    };
    onSave(input);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{initialData?.nom ? 'Modifier' : 'Nouveau produit'}</Text>
        <View style={styles.cancelButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <AppInput
            label="Nom du plat"
            placeholder="Ex: Boîte de macaroni composé"
            value={nom}
            onChangeText={setNom}
            required
            error={getError('nom')}
          />
          <AppInput
            label="Description (facultatif)"
            placeholder="Ingrédients, caractéristiques..."
            value={description}
            onChangeText={setDescription}
            error={getError('description')}
          />
          <AppInput
            label="Prix de vente (Ar)"
            placeholder="Ex: 5000"
            value={prixVente}
            onChangeText={setPrixVente}
            keyboardType="numeric"
            required
            error={getError('prix_vente')}
          />

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Produit actif</Text>
            <Pressable
              style={[styles.toggle, actif && styles.toggleActive]}
              onPress={() => setActif(!actif)}
            >
              <View style={[styles.toggleKnob, actif && styles.toggleKnobActive]} />
            </Pressable>
          </View>

          {getError('general') && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{getError('general')}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <AppButton title="Annuler" onPress={onCancel} variant="outline" disabled={loading} />
            <AppButton
              title={initialData?.nom ? 'Enregistrer' : 'Créer'}
              onPress={handleSave}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primaryLight,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.textSecondary,
  },
  toggleKnobActive: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
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
});

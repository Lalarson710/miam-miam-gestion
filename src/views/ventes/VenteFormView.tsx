/**
 * VenteFormView - Form for creating or editing a sale with multiple lines.
 * Each line has product selection, quantity, unit price, and auto-calculated total.
 * Pure component: receives data and callbacks as props.
 */

import { MODE_PAIEMENT_LABELS } from '@/constants/categories';
import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/services/formatCurrency';
import { Produit, ValidationError, VenteLigneInput } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { AppInput } from '@/views/components/AppInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface VenteFormViewProps {
  produits: Produit[];
  lignes: VenteLigneInput[];
  date_vente: string;
  modePaiement: string | null;
  observation: string;
  loading?: boolean;
  errors?: ValidationError[];
  onLignesChange: (lignes: VenteLigneInput[]) => void;
  onDateChange: (date: string) => void;
  onModePaiementChange: (mode: string | null) => void;
  onObservationChange: (obs: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function VenteFormView({
  produits,
  lignes,
  date_vente,
  modePaiement,
  observation,
  loading = false,
  errors = [],
  onLignesChange,
  onDateChange,
  onModePaiementChange,
  onObservationChange,
  onSave,
  onCancel,
}: VenteFormViewProps) {
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  const updateLigne = (index: number, field: keyof VenteLigneInput, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    onLignesChange(newLignes);
  };

  const addLigne = () => {
    const newLignes = [...lignes, {
      produit_id: null,
      nom_produit: '',
      quantite: 1,
      prix_unitaire: 0,
    }];
    onLignesChange(newLignes);
  };

  const removeLigne = (index: number) => {
    const newLignes = lignes.filter((_, i) => i !== index);
    onLignesChange(newLignes);
  };

  const selectProduit = (produit: Produit) => {
    if (editingLineIndex !== null) {
      // CORRECTION : on met à jour les trois champs en une seule fois sur une copie locale,
      // pour éviter que les appels successifs à updateLigne ne se basent sur l'état obsolète de `lignes`.
      const newLignes = [...lignes];
      newLignes[editingLineIndex] = {
        ...newLignes[editingLineIndex],
        produit_id: produit.id,
        nom_produit: produit.nom,
        prix_unitaire: produit.prix_vente,
      };
      onLignesChange(newLignes);
    }
    setProductPickerVisible(false);
    setEditingLineIndex(null);
  };

  const totalVente = lignes.reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0);

  const renderLigne = ({ item, index }: { item: VenteLigneInput; index: number }) => {
    const ligneTotal = item.quantite * item.prix_unitaire;
    return (
      <View style={styles.ligneCard}>
        <View style={styles.ligneHeader}>
          <Pressable
            style={styles.productSelector}
            onPress={() => {
              setEditingLineIndex(index);
              setProductPickerVisible(true);
            }}
          >
            <Text style={[styles.productSelectorText, !item.nom_produit && styles.productSelectorPlaceholder]}>
              {item.nom_produit || 'Sélectionner un produit'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.removeButton} onPress={() => removeLigne(index)}>
            <MaterialCommunityIcons name="close-circle" size={20} color={Colors.negative} />
          </Pressable>
        </View>

        <View style={styles.ligneInputs}>
          <AppInput
            label="Qté"
            placeholder="1"
            value={String(item.quantite || '')}
            onChangeText={(v) => updateLigne(index, 'quantite', parseInt(v, 10) || 0)}
            keyboardType="numeric"
            error={getError(`lignes[${index}].quantite`)}
            containerStyle={styles.qtyInput}
          />
          <AppInput
            label="Prix unitaire (Ar)"
            placeholder="5000"
            value={String(item.prix_unitaire || '')}
            onChangeText={(v) => updateLigne(index, 'prix_unitaire', parseInt(v, 10) || 0)}
            keyboardType="numeric"
            error={getError(`lignes[${index}].prix_unitaire`)}
            containerStyle={styles.priceInput}
          />
        </View>

        <View style={styles.ligneTotal}>
          <Text style={styles.ligneTotalLabel}>Total ligne</Text>
          <Text style={styles.ligneTotalValue}>{formatCurrency(ligneTotal)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{date_vente ? 'Modifier la vente' : 'Nouvelle vente'}</Text>
        <View style={styles.cancelButton} />
      </View>

      <ScrollView
        style={styles.DatesView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Date de vente */}
          <AppInput
            label="Date de vente"
            placeholder="2024-01-15"
            value={date_vente}
            onChangeText={onDateChange}
            required
            error={getError('date_vente')}
          />

          {/* Sale lines */}
          <Text style={styles.sectionLabel}>Produits</Text>
          {lignes.map((_, index) => (
            <View key={`ligne-${index}`}>
              {renderLigne({ item: lignes[index], index })}
            </View>
          ))}

          <Pressable style={styles.addButton} onPress={addLigne}>
            <MaterialCommunityIcons name="plus" size={20} color={Colors.primary} />
            <Text style={styles.addButtonText}>Ajouter un produit</Text>
          </Pressable>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total de la vente</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalVente)}</Text>
          </View>

          {/* Mode de paiement */}
          <Text style={styles.sectionLabel}>Mode de paiement</Text>
          <View style={styles.paymentRow}>
            {Object.entries(MODE_PAIEMENT_LABELS).map(([value, label]) => (
              <Pressable
                key={value}
                style={[
                  styles.paymentOption,
                  modePaiement === value && styles.paymentOptionSelected,
                ]}
                onPress={() => onModePaiementChange(modePaiement === value ? null : value)}
              >
                <Text style={[styles.paymentText, modePaiement === value && styles.paymentTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Note */}
          <AppInput
            label="Note (facultatif)"
            placeholder="Ex: Livraison à 18h"
            value={observation}
            onChangeText={onObservationChange}
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
              title="Enregistrer"
              onPress={onSave}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Product Picker Modal */}
      <Modal visible={productPickerVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setProductPickerVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner un produit</Text>
            <FlatList
              data={produits}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable style={styles.productOption} onPress={() => selectProduit(item)}>
                  <View>
                    <Text style={styles.productOptionName}>{item.nom}</Text>
                    <Text style={styles.productOptionPrice}>{formatCurrency(item.prix_vente)}</Text>
                  </View>
                  {item.description ? (
                    <Text style={styles.productOptionDesc}>{item.description}</Text>
                  ) : null}
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
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
  DatesView: {
    flex: 1,
  },
  form: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ligneCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  ligneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  productSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  productSelectorText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  productSelectorPlaceholder: {
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  ligneInputs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  qtyInput: {
    flex: 1,
    marginBottom: 0,
  },
  priceInput: {
    flex: 2,
    marginBottom: 0,
  },
  ligneTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  ligneTotalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ligneTotalValue: {
    fontSize: 16,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.primary,
  },
  totalContainer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 700,
    color: Colors.primaryDark,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  paymentOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  paymentTextSelected: {
    color: Colors.card,
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    height: '60%',
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  productOption: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  productOptionName: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  productOptionPrice: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  productOptionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});

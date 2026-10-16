/**
 * Vente detail screen - shows sale details with edit and delete actions.
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { MODE_PAIEMENT_LABELS } from '@/constants/categories';
import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { VenteController } from '@/controllers/VenteController';
import { formatCurrency } from '@/services/formatCurrency';
import { formatDateTimeDisplay } from '@/services/formatDate';
import { Vente, VenteLigne } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { ConfirmDialog } from '@/views/components/ConfirmDialog';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VenteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vente, setVente] = useState<{ vente: Vente; lignes: VenteLigne[] } | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const loadVente = useCallback(() => {
    const result = VenteController.getVente(parseInt(id, 10));
    if (result) {
      setVente(result);
    } else {
      router.back();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadVente();
    }, [loadVente]),
  );

  if (!vente) {
    return null;
  }

  const handleDelete = () => {
    VenteController.deleteVente(vente.vente.id);
    router.back();
  };

  const totalBoxes = vente.lignes.reduce((sum, l) => sum + l.quantite, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Vente {vente.vente.numero}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Vente info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDateTimeDisplay(vente.vente.date_vente)}</Text>
            <Text style={styles.infoLabel}>Mode de paiement</Text>
            <Text style={styles.infoValue}>
              {vente.vente.mode_paiement
                ? MODE_PAIEMENT_LABELS[vente.vente.mode_paiement] ?? vente.vente.mode_paiement
                : 'Non précisé'}
            </Text>
            <Text style={styles.infoLabel}>Observation</Text>
            <Text style={styles.infoValue}>
              {vente.vente.observation || 'Aucune'}
            </Text>
          </View>

          {/* Lines */}
          <View style={styles.linesSection}>
            <Text style={styles.sectionTitle}>Lignes de vente</Text>
            {vente.lignes.map((ligne) => (
              <View key={ligne.id} style={styles.ligneItem}>
                <Text style={styles.ligneNom}>{ligne.nom_produit}</Text>
                <View style={styles.ligneDetails}>
                  <Text style={styles.ligneDetail}>Qté: {ligne.quantite}</Text>
                  <Text style={styles.ligneDetail}>Prix: {formatCurrency(ligne.prix_unitaire)}</Text>
                  <Text style={styles.ligneTotal}>{formatCurrency(ligne.montant_ligne)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total boîtes</Text>
              <Text style={styles.totalValue}>{totalBoxes}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total vente</Text>
              <Text style={styles.totalValue}>{formatCurrency(vente.vente.montant_total)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <AppButton
              title="Modifier"
              onPress={() => router.push({ pathname: '/ventes/[id]/modifier', params: { id: String(vente.vente.id) } })}
              icon={<MaterialCommunityIcons name="pencil" size={20} color={Colors.card} />}
            />
            <AppButton
              title="Supprimer"
              variant="danger"
              onPress={() => setDeleteDialogVisible(true)}
              icon={<MaterialCommunityIcons name="delete" size={20} color={Colors.card} />}
            />
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Supprimer la vente ?"
        message={`La vente ${vente.vente.numero} sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogVisible(false)}
        destructive
      />
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
  backButton: {
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
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  linesSection: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  ligneItem: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  ligneNom: {
    fontSize: 15,
    fontWeight: 600,
    color: Colors.textPrimary,
    flex: 1,
  },
  ligneDetails: {
    alignItems: 'flex-end',
  },
  ligneDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ligneTotal: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  totalCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: Colors.primaryDark,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});

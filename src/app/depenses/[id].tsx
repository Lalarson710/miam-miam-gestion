/**
 * Depense detail screen - shows expense details with edit and delete actions.
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { CATEGORIE_LABELS } from '@/constants/categories';
import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { DepenseController } from '@/controllers/DepenseController';
import { formatCurrency } from '@/services/formatCurrency';
import { formatDateTimeDisplay } from '@/services/formatDate';
import { Depense } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { ConfirmDialog } from '@/views/components/ConfirmDialog';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DepenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [depense, setDepense] = useState<Depense | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const loadDepense = useCallback(() => {
    const d = DepenseController.getDepense(parseInt(id, 10));
    if (d) {
      setDepense(d);
    } else {
      router.back();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadDepense();
    }, [loadDepense]),
  );

  if (!depense) {
    return null;
  }

  const handleDelete = () => {
    DepenseController.deleteDepense(depense.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Dépense</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDateTimeDisplay(depense.date_depense)}</Text>

            <Text style={styles.infoLabel}>Libellé</Text>
            <Text style={styles.infoValue}>{depense.libelle}</Text>

            <Text style={styles.infoLabel}>Catégorie</Text>
            <Text style={styles.infoValue}>
              {CATEGORIE_LABELS[depense.categorie] ?? depense.categorie}
            </Text>

            <Text style={styles.infoLabel}>Montant</Text>
            <Text style={[styles.infoValue, styles.montantValue]}>{formatCurrency(depense.montant)}</Text>

            {depense.quantite !== null && (
              <>
                <Text style={styles.infoLabel}>Quantité</Text>
                <Text style={styles.infoValue}>{depense.quantite}</Text>
              </>
            )}

            {depense.unite && (
              <>
                <Text style={styles.infoLabel}>Unité</Text>
                <Text style={styles.infoValue}>{depense.unite}</Text>
              </>
            )}

            <Text style={styles.infoLabel}>Observation</Text>
            <Text style={styles.infoValue}>{depense.observation || 'Aucune'}</Text>
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Modifier"
              onPress={() => router.push({ pathname: '/depenses/[id]/modifier', params: { id: String(depense.id) } })}
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
        title="Supprimer la dépense ?"
        message={`La dépense "${depense.libelle}" sera définitivement supprimée.`}
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
  montantValue: {
    fontWeight: 700,
    color: Colors.negative,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});

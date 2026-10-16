/**
 * DepensesListView - Expenses list view with search, filter, and summary.
 * Pure component: receives data and callbacks as props.
 */

import { CATEGORIE_LABELS } from '@/constants/categories';
import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/services/formatCurrency';
import { formatDateTimeDisplay } from '@/services/formatDate';
import { Depense } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { EmptyState } from '@/views/components/EmptyState';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface DepensesListViewProps {
  depenses: Depense[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
  onNouvelleDepense: () => void;
  onEditDepense: (id: number) => void;
  loading?: boolean;
}

export function DepensesListView({
  depenses,
  searchQuery,
  onSearchChange,
  onFilterPress,
  onNouvelleDepense,
  onEditDepense,
  loading = false,
}: DepensesListViewProps) {
  const totalMontant = depenses.reduce((sum, d) => sum + d.montant, 0);

  const renderItem = ({ item }: { item: Depense }) => (
    <Pressable
      style={styles.depenseCard}
      onPress={() => onEditDepense(item.id)}
    >
      <View style={styles.depenseHeader}>
        <Text style={styles.depenseLibelle}>{item.libelle}</Text>
        <Text style={styles.depenseMontant}>{formatCurrency(item.montant)}</Text>
      </View>
      <View style={styles.depenseBody}>
        <Text style={styles.depenseCategorie}>
          {CATEGORIE_LABELS[item.categorie] ?? item.categorie}
        </Text>
        <Text style={styles.depenseDate}>{formatDateTimeDisplay(item.date_depense)}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dépenses</Text>
        <AppButton title="Nouvelle dépense" onPress={onNouvelleDepense} size="sm" />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par libellé..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={Colors.textSecondary}
        />
        <Pressable style={styles.filterButton} onPress={onFilterPress}>
          <MaterialCommunityIcons name="filter-variant" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Total: {formatCurrency(totalMontant)} • {depenses.length} dépense(s)
        </Text>
      </View>

      {depenses.length === 0 ? (
        <EmptyState
          title="Aucune dépense"
          message="Enregistrez votre première dépense pour commencer."
          actionLabel="Nouvelle dépense"
          onAction={onNouvelleDepense}
        />
      ) : (
        <FlatList
          data={depenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: Colors.primaryDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  filterButton: {
    padding: Spacing.xs,
  },
  summary: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  depenseCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  depenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  depenseLibelle: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  depenseMontant: {
    fontSize: 16,
    fontWeight: 700,
    color: Colors.negative,
  },
  depenseBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depenseCategorie: {
    fontSize: 13,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  depenseDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

/**
 * VentesListView - Sales list view with search, filter, and summary.
 * Pure component: receives data and callbacks as props.
 */

import { MODE_PAIEMENT_LABELS } from '@/constants/categories';
import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/services/formatCurrency';
import { formatDateTimeDisplay } from '@/services/formatDate';
import { VenteWithProduits } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { EmptyState } from '@/views/components/EmptyState';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface VentesListViewProps {
  ventes: VenteWithProduits[];
  totalBoxes: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
  onNouvelleVente: () => void;
  onEditVente: (id: number) => void;
  loading?: boolean;
}

export function VentesListView({
  ventes,
  totalBoxes,
  searchQuery,
  onSearchChange,
  onFilterPress,
  onNouvelleVente,
  onEditVente,
  loading = false,
}: VentesListViewProps) {
  const totalRecettes = ventes.reduce((sum, v) => sum + v.montant_total, 0);

  const renderItem = ({ item }: { item: VenteWithProduits }) => (
    <Pressable
      style={styles.venteCard}
      onPress={() => onEditVente(item.id)}
    >
      <View style={styles.venteHeader}>
        <Text style={styles.venteNumero}>{item.numero}</Text>
        <Text style={styles.venteDate}>{formatDateTimeDisplay(item.date_vente)}</Text>
      </View>
      <View style={styles.venteBody}>
        <Text style={styles.venteTotal}>{formatCurrency(item.montant_total)}</Text>
        {item.mode_paiement && (
          <Text style={styles.venteModePaiement}>
            {MODE_PAIEMENT_LABELS[item.mode_paiement] ?? item.mode_paiement}
          </Text>
        )}
        {item.produits && (
          <Text style={styles.venteProduits}>
            {item.produits}
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ventes</Text>
        <AppButton title="Nouvelle vente" onPress={onNouvelleVente} size="sm" />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par numéro..."
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
          Total: {formatCurrency(totalRecettes)} • {totalBoxes} boîtes • {ventes.length} vente(s)
        </Text>
      </View>

      {ventes.length === 0 ? (
        <EmptyState
          title="Aucune vente"
          message="Enregistrez votre première vente pour commencer."
          actionLabel="Nouvelle vente"
          onAction={onNouvelleVente}
        />
      ) : (
        <FlatList
          data={ventes}
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
  venteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  venteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  venteNumero: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.primary,
  },
  venteDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  venteBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venteTotal: {
    fontSize: 18,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  venteModePaiement: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  venteProduits: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
});

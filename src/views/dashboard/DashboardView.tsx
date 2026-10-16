/**
 * DashboardView - The dashboard UI component.
 * Displays today's financial summary, recent activity, and shortcut buttons.
 * Pure component: receives data as props, no direct database access.
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/services/formatCurrency';
import { formatDateDisplay, formatDateTimeDisplay, todayDate } from '@/services/formatDate';
import { Depense, RapportResume, Vente } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { EmptyState } from '@/views/components/EmptyState';
import { SummaryCard } from '@/views/components/SummaryCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface DashboardViewProps {
  resume: RapportResume | null;
  activiteRecente: { ventes: Vente[]; depenses: Depense[] } | null;
  loading: boolean;
  onNouvelleVente: () => void;
  onNouvelleDepense: () => void;
  onGererProduits: () => void;
  onVoirRapports: () => void;
}

export function DashboardView({
  resume,
  activiteRecente,
  loading,
  onNouvelleVente,
  onNouvelleDepense,
  onGererProduits,
  onVoirRapports,
}: DashboardViewProps) {
  const today = new Date();
  const dateStr = formatDateDisplay(todayDate());

  if (loading || !resume) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasData = resume.nombreVentes > 0 || resume.totalDepenses > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.title}>Miam Miam Gestion</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.cardsContainer}>
          <SummaryCard
            title="Vendu Aujourd'hui"
            value={resume.totalRecettes}
            icon={<MaterialCommunityIcons name="cash-multiple" size={20} color={Colors.positive} />}
          />
          <SummaryCard
            title="Dépenses du jour"
            value={resume.totalDepenses}
            icon={<MaterialCommunityIcons name="format-list-bulleted" size={20} color={Colors.negative} />}
          />
          <SummaryCard
            title="Bénéfice du jour"
            value={resume.resultatEstime}
            icon={<MaterialCommunityIcons name="calculator" size={20} color={resume.resultatEstime >= 0 ? Colors.positive : Colors.negative} />}
          />
          <SummaryCard
            title="Ventes"
            value={resume.nombreVentes}
            currency={false}
            icon={<MaterialCommunityIcons name="receipt" size={20} color={Colors.primary} />}
          />
          <SummaryCard
            title="Boîtes vendues"
            value={resume.nombreBoxes}
            currency={false}
            icon={<MaterialCommunityIcons name="package-variant" size={20} color={Colors.primary} />}
          />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Bénéfice = Vendu − dépenses enregistrées. Ce n&apos;est pas un bénéfice net comptable.
          </Text>
        </View>

        {/* Shortcuts */}
        <View style={styles.shortcutsContainer}>
          <Text style={styles.sectionTitle}>Raccourcis</Text>
          <View style={styles.shortcutRow}>
            <AppButton
              title="Nouvelle vente"
              onPress={onNouvelleVente}
              icon={<MaterialCommunityIcons name="plus" size={20} color={Colors.card} />}
              fullWidth
            />
          </View>
          <View style={styles.shortcutRow}>
            <AppButton
              title="Nouvelle dépense"
              onPress={onNouvelleDepense}
              icon={<MaterialCommunityIcons name="plus" size={20} color={Colors.card} />}
              fullWidth
            />
          </View>
          <View style={styles.shortcutRow}>
            <AppButton
              title="Gérer les produits"
              onPress={onGererProduits}
              icon={<MaterialCommunityIcons name="food" size={20} color={Colors.card} />}
              fullWidth
            />
          </View>
          <View style={styles.shortcutRow}>
            <AppButton
              title="Voir les rapports"
              onPress={onVoirRapports}
              icon={<MaterialCommunityIcons name="chart-bar" size={20} color={Colors.card} />}
              fullWidth
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {!activiteRecente || (activiteRecente.ventes.length === 0 && activiteRecente.depenses.length === 0) ? (
            <EmptyState
              title="Aucune activité"
              message="Enregistrez votre première vente ou dépense pour commencer."
            />
          ) : (
            <View style={styles.activityList}>
              {activiteRecente.ventes.slice(0, 5).map((v) => (
                <View key={`vente-${v.id}`} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="cash-multiple" size={16} color={Colors.positive} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Vente {v.numero}</Text>
                    <Text style={styles.activityDate}>{formatDateTimeDisplay(v.date_vente)}</Text>
                  </View>
                  <Text style={styles.activityAmount}>{formatCurrency(v.montant_total)}</Text>
                </View>
              ))}
              {activiteRecente.depenses.slice(0, 5).map((d) => (
                <View key={`depense-${d.id}`} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="format-list-bulleted" size={16} color={Colors.negative} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{d.libelle}</Text>
                    <Text style={styles.activityDate}>{formatDateTimeDisplay(d.date_depense)}</Text>
                  </View>
                  <Text style={styles.activityAmount}>{formatCurrency(d.montant)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Empty state for no data at all */}
        {!hasData && (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Commencez dès maintenant"
              message="Aucune vente ou dépense enregistrée aujourd'hui. Utilisez les raccourcis ci-dessus."
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: Colors.primaryDark,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  disclaimer: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  shortcutsContainer: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  shortcutRow: {
    marginBottom: Spacing.sm,
  },
  activityContainer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  activityList: {
    gap: Spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  activityDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  emptyContainer: {
    padding: Spacing.lg,
  },
});

/**
 * RapportView - Reports view with period filters and financial summary.
 * Displays recettes, depenses, resultat, and daily evolution.
 * Pure component: receives data and callbacks as props.
 */

import { CATEGORIE_LABELS } from '@/constants/categories';
import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { PERIODES_DISPONIBLES, getPeriodeLabel } from '@/controllers/RapportController';
import { formatCurrency } from '@/services/formatCurrency';
import { DateMode, PeriodeFiltre, RapportResume } from '@/types';
import { EmptyState } from '@/views/components/EmptyState';
import { SummaryCard } from '@/views/components/SummaryCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface RapportViewProps {
  rapport: RapportResume | null;
  periodeSelectionnee: PeriodeFiltre;
  dateDebutCustom?: string; // Format YYYY-MM ou YYYY-MM-DD selon dateMode
  dateFinCustom?: string;   // Format YYYY-MM ou YYYY-MM-DD selon dateMode
  dateMode: DateMode;       // 'complet' = date complète, 'mois_annee' = mois/année seulement
  loading?: boolean;
  onPeriodeChange: (periode: PeriodeFiltre) => void;
  onDateDebutChange: (date: string) => void;
  onDateFinChange: (date: string) => void;
  onDateModeChange: (mode: DateMode) => void;
  datePickerVisible: boolean;
  datePickerTarget: 'debut' | 'fin' | null;
  onDatePickerChange: (event: any, date?: Date) => void;
  onDatePickerShow: (target: 'debut' | 'fin') => void;
  onDatePickerHide: () => void;
}

export function RapportView({
  rapport,
  periodeSelectionnee,
  dateDebutCustom,
  dateFinCustom,
  dateMode = 'complet',
  loading = false,
  onPeriodeChange,
  onDateDebutChange,
  onDateFinChange,
  onDateModeChange,
  datePickerVisible,
  datePickerTarget,
  onDatePickerChange,
  onDatePickerShow,
  onDatePickerHide,
}: RapportViewProps) {
  const isCustom = periodeSelectionnee.type === 'personnalise';

  // État local pour les champs Mois / Année (évite les problèmes de saisie contrôlée)
  const [moisInput, setMoisInput] = useState<string>('');
  const [anneeInput, setAnneeInput] = useState<string>('');

  useEffect(() => {
    if (dateDebutCustom) {
      const [y, m] = dateDebutCustom.split('-');
      setAnneeInput(y || '');
      setMoisInput(m || '');
    } else {
      setAnneeInput('');
      setMoisInput('');
    }
  }, [dateDebutCustom]);

  const MOIS_LABELS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const formatMoisAnnee = (dateStr: string | undefined): string => {
    if (!dateStr) return 'AAAA-MM';
    const [y, m] = dateStr.split('-');
    if (!y || !m) return 'AAAA-MM';
    const moisIndex = parseInt(m, 10) - 1;
    const moisLabel = MOIS_LABELS[moisIndex] ?? m;
    return `${moisLabel} ${y}`;
  };

  const formatDateComplete = (dateStr: string | undefined): string => {
    if (!dateStr) return 'AAAA-MM-JJ';
    return dateStr;
  };

  const renderPeriodeButton = ({ item }: { item: PeriodeFiltre }) => {
    const isSelected = periodeSelectionnee.type === item.type;
    return (
      <Pressable
        key={item.type}
        style={[styles.periodeButton, isSelected && styles.periodeButtonSelected]}
        onPress={() => onPeriodeChange(item)}
      >
        <Text style={[styles.periodeButtonText, isSelected && styles.periodeButtonTextSelected]}>
          {getPeriodeLabel(item)}
        </Text>
      </Pressable>
    );
  };

  const renderEvolutionBar = ({ item }: { item: { date: string; recettes: number; depenses: number } }) => {
    // Sécuriser contre les items mal formés
    if (!item || typeof item !== 'object') {
      return null;
    }

    const recettes = Number.isFinite(item.recettes) && item.recettes >= 0 ? item.recettes : 0;
    const depenses = Number.isFinite(item.depenses) && item.depenses >= 0 ? item.depenses : 0;

    const max = Math.max(recettes, depenses, 1);
    const recetteHeightRaw = (recettes / max) * 80;
    const depenseHeightRaw = (depenses / max) * 80;

    const recetteHeight = Number.isFinite(recetteHeightRaw) ? Math.max(0, Math.min(80, recetteHeightRaw)) : 0;
    const depenseHeight = Number.isFinite(depenseHeightRaw) ? Math.max(0, Math.min(80, depenseHeightRaw)) : 0;

    let dayLabel = '--';
    if (typeof item.date === 'string' && item.date.length >= 10) {
      dayLabel = item.date.split('-')[2];
    } else if (typeof item.date === 'string') {
      dayLabel = item.date;
    }

    return (
      <View style={styles.barContainer}>
        <View style={styles.barRow}>
          <View style={[styles.bar, styles.barRecette, { height: recetteHeight }]} />
          <View style={[styles.bar, styles.barDepense, { height: depenseHeight }]} />
        </View>
        <Text style={styles.barDate}>{dayLabel}</Text>
      </View>
    );
  };

  const openDatePicker = (target: 'debut' | 'fin') => {
    onDatePickerShow(target);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Filter */}
        <View style={styles.periodeContainer}>
          <FlatList
            data={PERIODES_DISPONIBLES}
            keyExtractor={(item) => item.type}
            renderItem={renderPeriodeButton}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodeList}
          />
        </View>

        {/* Custom Date Range */}
        {isCustom && (
          <View style={styles.customDateContainer}>
            {/* Toggle mode de date */}
            <View style={styles.dateModeToggle}>
              <Pressable
                style={[styles.modeButton, dateMode === 'complet' && styles.modeButtonActive]}
                onPress={() => onDateModeChange('complet')}
              >
                <Text style={[styles.modeButtonText, dateMode === 'complet' && styles.modeButtonTextActive]}>
                  Date complète
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeButton, dateMode === 'mois_annee' && styles.modeButtonActive]}
                onPress={() => onDateModeChange('mois_annee')}
              >
                <Text style={[styles.modeButtonText, dateMode === 'mois_annee' && styles.modeButtonTextActive]}>
                  Mois / Année
                </Text>
              </Pressable>
            </View>

            {dateMode === 'complet' ? (
              <>
                <View style={styles.dateRangeRow}>
                  <View style={styles.dateInputGroup}>
                    <Text style={styles.customDateLabel}>Date de début</Text>
                    <Pressable
                      style={styles.dateInput}
                      onPress={() => openDatePicker('debut')}
                    >
                      <Text style={styles.dateInputText}>
                        {formatDateComplete(dateDebutCustom)}
                      </Text>
                      <MaterialCommunityIcons
                        name="calendar-month"
                        size={16}
                        color={Colors.textSecondary}
                        style={styles.dateIcon}
                      />
                    </Pressable>
                  </View>
                  <View style={styles.dateInputGroup}>
                    <Text style={styles.customDateLabel}>Date de fin</Text>
                    <Pressable
                      style={styles.dateInput}
                      onPress={() => openDatePicker('fin')}
                    >
                      <Text style={styles.dateInputText}>
                        {formatDateComplete(dateFinCustom)}
                      </Text>
                      <MaterialCommunityIcons
                        name="calendar-month"
                        size={16}
                        color={Colors.textSecondary}
                        style={styles.dateIcon}
                      />
                    </Pressable>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.moisAnneeRow}>
                <View style={styles.moisAnneeInputGroup}>
                  <Text style={styles.customDateLabel}>Mois</Text>
                  <TextInput
                    style={styles.moisAnneeInput}
                    keyboardType="numeric"
                    maxLength={2}
                    value={moisInput}
                    onChangeText={(text: string) => {
                      const m = text.slice(0, 2);
                      setMoisInput(m);
                      const dateStr = anneeInput && m ? `${anneeInput}-${m.padStart(2, '0')}` : '';
                      onDateDebutChange(dateStr);
                      onDateFinChange(dateStr);
                    }}
                  />
                </View>
                <View style={styles.moisAnneeInputGroup}>
                  <Text style={styles.customDateLabel}>Année</Text>
                  <TextInput
                    style={styles.moisAnneeInput}
                    keyboardType="numeric"
                    maxLength={4}
                    value={anneeInput}
                    onChangeText={(text: string) => {
                      const y = text.slice(0, 4);
                      setAnneeInput(y);
                      const dateStr = y && moisInput ? `${y}-${moisInput.padStart(2, '0')}` : '';
                      onDateDebutChange(dateStr);
                      onDateFinChange(dateStr);
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* DateTimePicker Modal */}
        {datePickerVisible && (
          <DateTimePicker
            value={
              datePickerTarget === 'debut' && dateDebutCustom
                ? new Date(dateDebutCustom)
                : datePickerTarget === 'fin' && dateFinCustom
                  ? new Date(dateFinCustom)
                  : new Date()
            }
            mode="date"
            display="default"
            onChange={onDatePickerChange}
          />
        )}

        {loading || !rapport ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement…</Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.cardsContainer}>
              <SummaryCard
                title="Vendu"
                value={rapport.totalRecettes}
                icon={<MaterialCommunityIcons name="cash-multiple" size={20} color={Colors.positive} />}
              />
              <SummaryCard
                title="Dépenses"
                value={rapport.totalDepenses}
                icon={<MaterialCommunityIcons name="format-list-bulleted" size={20} color={Colors.negative} />}
              />
              <SummaryCard
                title="Bénéfice"
                value={rapport.resultatEstime}
                icon={<MaterialCommunityIcons name="calculator" size={20} color={rapport.resultatEstime >= 0 ? Colors.positive : Colors.negative} />}
              />
              <SummaryCard
                title="Ventes"
                value={rapport.nombreVentes}
                currency={false}
                icon={<MaterialCommunityIcons name="receipt" size={20} color={Colors.primary} />}
              />
              <SummaryCard
                title="Boîtes"
                value={rapport.nombreBoxes}
                currency={false}
                icon={<MaterialCommunityIcons name="package-variant" size={20} color={Colors.primary} />}
              />
            </View>

            {/* Depenses par categorie */}
            {Object.keys(rapport.depensesParCategorie).length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dépenses par catégorie</Text>
                <View style={styles.categorieList}>
                  {Object.entries(rapport.depensesParCategorie)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, montant]) => (
                      <View key={cat} style={styles.categorieItem}>
                        <View style={styles.categorieInfo}>
                          <Text style={styles.categorieLabel}>
                            {CATEGORIE_LABELS[cat] ?? cat}
                          </Text>
                          <Text style={styles.categorieMontant}>{formatCurrency(montant)}</Text>
                        </View>
                        <View style={styles.categorieBarContainer}>
                          <View
                            style={[
                              styles.categorieBar,
                              { width: `${Math.max((montant / rapport.totalDepenses) * 100, 5)}%` },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                </View>
              </View>
            ) : null}

            {/* Evolution quotidienne */}
            {(rapport.evolutionQuotidienne?.length ?? 0) > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Évolution quotidienne</Text>
                <View style={styles.evolutionContainer}>
                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.positive }]} />
                      <Text style={styles.legendText}>Vendus</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.negative }]} />
                      <Text style={styles.legendText}>Dépenses</Text>
                    </View>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.barsContainer}>
                      {(rapport.evolutionQuotidienne ?? []).map((item) => (
                        <View key={item.date} style={styles.barContainer}>
                          {renderEvolutionBar({ item })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            ) : null}




            {/* Empty state */}
            {rapport.nombreVentes === 0 && rapport.totalDepenses === 0 && (
              <View style={styles.emptyContainer}>
                <EmptyState
                  title="Aucune donnée"
                  message="Aucune vente ou dépense enregistrée pour cette période."
                />
              </View>
            )}
          </>
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
  periodeContainer: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  periodeList: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  periodeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  periodeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodeButtonText: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  periodeButtonTextSelected: {
    color: Colors.card,
  },
  customDateContainer: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  dateModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  modeButtonTextActive: {
    color: Colors.card,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateInputGroup: {
    flex: 1,
    gap: Spacing.xs,
  },
  customDateLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  dateIcon: {
    marginLeft: Spacing.xs,
  },
  moisAnneeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  moisAnneeInputGroup: {
    flex: 1,
    gap: Spacing.xs,
  },
  moisAnneeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    minHeight: 44,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  section: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  categorieList: {
    gap: Spacing.sm,
  },
  categorieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categorieInfo: {
    flex: 1,
    minWidth: 120,
  },
  categorieLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  categorieMontant: {
    fontSize: 14,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  categorieBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  categorieBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  evolutionContainer: {
    gap: Spacing.md,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 80,
  },
  bar: {
    width: 12,
    borderRadius: 2,
  },
  barRecette: {
    backgroundColor: Colors.positive,
  },
  barDepense: {
    backgroundColor: Colors.negative,
  },
  barDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: Spacing.xxl,
  },
});

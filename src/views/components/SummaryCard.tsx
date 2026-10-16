/**
 * SummaryCard - Displays a metric with a title, value, and optional icon.
 * Used on the dashboard for recettes, depenses, resultat, etc.
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { formatCurrency } from '@/services/formatCurrency';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface SummaryCardProps {
  title: string;
  value: number;
  currency?: boolean;
  icon?: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export function SummaryCard({
  title,
  value,
  currency = true,
  icon,
  color,
  style,
}: SummaryCardProps) {
  const displayValue = currency ? formatCurrency(value) : String(value);
  const valueColor = color ?? (value < 0 ? Colors.negative : Colors.textPrimary);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: valueColor }]}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 28,
  },
});

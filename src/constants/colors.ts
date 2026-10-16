/**
 * Color palette for Miam Miam Gestion.
 * Red is the dominant theme color. Green is used only for positive financial results.
 */

export const Colors = {
  // Red theme
  primary: '#DC2626',
  primaryDark: '#991B1B',
  primaryLight: '#FDE8E8',

  // Backgrounds
  background: '#FAF7F7',
  card: '#FFFFFF',

  // Text
  textPrimary: '#211B1B',
  textSecondary: '#898080',

  // Financial colors
  positive: '#15803D',
  negative: '#B91C1C',

  // Neutrals
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',

  // Status
  success: '#15803D',
  error: '#B91C1C',
  warning: '#CA8A04',
} as const;

export type ColorName = keyof typeof Colors;

/** Spacing scale based on 4px grid */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Border radius scale */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
} as const;

/** Bottom tab bar height inset for Android */
export const BottomTabHeight = 80;

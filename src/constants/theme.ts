/**
 * Theme configuration for Miam Miam Gestion.
 * Uses the red color palette as the dominant theme.
 * Supports light and dark modes (both use red accents).
 */

import '@/global.css';

import { Colors as Palette, BorderRadius as RadiusScale, Spacing as SpacingScale } from '@/constants/colors';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: Palette.textPrimary,
    background: Palette.background,
    backgroundElement: Palette.card,
    backgroundSelected: Palette.primaryLight,
    textSecondary: Palette.textSecondary,
    primary: Palette.primary,
    primaryDark: Palette.primaryDark,
    primaryLight: Palette.primaryLight,
    positive: Palette.positive,
    negative: Palette.negative,
    border: Palette.border,
    card: Palette.card,
  },
  dark: {
    text: Palette.textPrimary,
    background: Palette.background,
    backgroundElement: Palette.card,
    backgroundSelected: Palette.primaryLight,
    textSecondary: Palette.textSecondary,
    primary: Palette.primary,
    primaryDark: Palette.primaryDark,
    primaryLight: Palette.primaryLight,
    positive: Palette.positive,
    negative: Palette.negative,
    border: Palette.border,
    card: Palette.card,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = SpacingScale;
export const BorderRadius = RadiusScale;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * AppButton - Reusable button component with red theme.
 * Supports primary, secondary, and danger variants.
 * Includes press feedback and disabled state.
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { Pressable, PressableProps, StyleSheet, Text, View, ViewStyle } from 'react-native';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type AppButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends PressableProps {
  title: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled = false,
  style,
  onPress,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyle = styles[variant];
  const sizeStyle = styles[`size_${size}`];
  const textVariantStyle = styles[`text_${variant}`];
  const textSizeStyle = styles[`text_size_${size}`];

  const baseStyle: ViewStyle[] = [
    styles.base,
    variantStyle,
    sizeStyle,
  ];
  if (fullWidth) baseStyle.push(styles.fullWidth);
  if (isDisabled) baseStyle.push(styles.disabled);
  if (style) baseStyle.push(style as ViewStyle);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => {
        const pressedStyle = pressed && !isDisabled ? styles.pressed : null;
        return [...baseStyle, pressedStyle];
      }}
      {...rest}
    >
      {loading ? (
        <Text style={[styles.textBase, textVariantStyle, textSizeStyle]}>Chargement…</Text>
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.textBase, textVariantStyle, textSizeStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: -Spacing.xs,
  },
  textBase: {
    fontWeight: 600,
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
  },
  danger: {
    backgroundColor: Colors.negative,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  // Text variants
  text_primary: {
    color: Colors.card,
  },
  text_secondary: {
    color: Colors.primaryDark,
  },
  text_danger: {
    color: Colors.card,
  },
  text_outline: {
    color: Colors.primary,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  size_md: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  size_lg: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },

  // Text sizes
  text_size_sm: {
    fontSize: 14,
  },
  text_size_md: {
    fontSize: 16,
  },
  text_size_lg: {
    fontSize: 18,
  },
});

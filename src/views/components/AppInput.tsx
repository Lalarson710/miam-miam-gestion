/**
 * AppInput - Reusable text input component with label, error display, and keyboard types.
 * Supports numeric, decimal, and text keyboards.
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerStyle?: View['props']['style'];
}

export function AppInput({
  label,
  error,
  required = false,
  containerStyle,
  style,
  ...rest
}: AppInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}{required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={Colors.textSecondary}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.negative,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.card,
    minHeight: 44,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

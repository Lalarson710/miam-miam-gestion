/**
 * ConfirmDialog - Modal dialog for confirming destructive actions.
 * Shows a title, message, and confirm/cancel buttons.
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton, destructive && styles.destructiveButton]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, destructive && styles.destructiveText]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 400,
    gap: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.card,
  },
  destructiveButton: {
    backgroundColor: Colors.negative,
  },
  destructiveText: {
    color: Colors.card,
  },
});

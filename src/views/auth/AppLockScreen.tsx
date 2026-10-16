/**
 * AppLockScreen - Écran de verrouillage de l'application.
 *
 * Affiche une interface moderne et cohérente avec le design de Miam Miam Gestion.
 * L'authentification est gérée par le composant parent via useAppLock.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/colors';

interface AppLockScreenProps {
  onAuthenticate: () => void;
  errorMessage: string | null;
  isChecking: boolean;
  hasNoLock: boolean;
}

export function AppLockScreen({
  onAuthenticate,
  errorMessage,
  isChecking,
  hasNoLock,
}: AppLockScreenProps) {
  // Déclencher l'authentification automatique dès que l'écran de verrouillage est monté
  // (après la disparition du logo d'ouverture)
  useEffect(() => {
    onAuthenticate();
  }, [onAuthenticate]);

  // Si aucun verrouillage n'est configuré, on ne montre pas cet écran
  if (hasNoLock) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ExpoImage
            source={require('@/assets/images/LogoMiamMiam.png')}
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Accès protégé</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Authentification requise</Text>
          <Text style={styles.cardDescription}>
            Veuillez confirmer votre identité pour accéder à l&apos;application.
            Utilisez votre empreinte digitale, votre reconnaissance faciale
            ou votre code de déverrouillage téléphone.
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color={Colors.error}
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <Pressable
            style={styles.authButton}
            onPress={onAuthenticate}
            disabled={isChecking}
          >
            <MaterialCommunityIcons
              name={isChecking ? 'clock-outline' : 'fingerprint'}
              size={20}
              color={Colors.card}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isChecking ? 'Vérification…' : 'Déverrouiller'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Miam Miam Gestion • Sécurisé par votre téléphone
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  icon: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorIcon: {
    marginRight: Spacing.sm,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    flex: 1,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    marginBottom: Spacing.md,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.card,
  },
  footer: {
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

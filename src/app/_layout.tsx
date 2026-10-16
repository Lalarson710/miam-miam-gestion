/**
 * Root layout - initializes the database, checks app lock, then shows tab navigation.
 * The splash screen stays visible until the database is ready.
 * L'écran de verrouillage s'affiche avant les onglets si l'authentification est requise.
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useAppLock } from '@/hooks/useAppLock';
import { useDatabase } from '@/hooks/useDatabase';
import { AppLockScreen } from '@/views/auth/AppLockScreen';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isReady, error } = useDatabase();
  const {
    errorMessage,
    authenticate,
    isChecking,
    hasNoLock,
    isUnauthenticated,
  } = useAppLock();
  const [splashHidden, setSplashHidden] = useState(false);

  if (!isReady) {
    return null;
  }

  if (error) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay onHide={() => setSplashHidden(true)} />
      </ThemeProvider>
    );
  }

  // Si aucun verrouillage n'est configuré, accès direct aux onglets
  if (hasNoLock) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay onHide={() => setSplashHidden(true)} />
        <AppTabs />
      </ThemeProvider>
    );
  }

  // Pendant la vérification initiale : d'abord le logo d'ouverture,
  // puis l'écran de verrouillage avec authentification automatique
  if (isChecking || isUnauthenticated) {
    if (!splashHidden) {
      return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay onHide={() => setSplashHidden(true)} />
        </ThemeProvider>
      );
    }
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppLockScreen
          onAuthenticate={authenticate}
          errorMessage={errorMessage}
          isChecking={isChecking}
          hasNoLock={hasNoLock}
        />
      </ThemeProvider>
    );
  }

  // Authentifié : afficher l'animation de chargement puis les onglets
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay onHide={() => setSplashHidden(true)} />
      <AppTabs />
    </ThemeProvider>
  );
}

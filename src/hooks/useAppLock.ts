/**
 * useAppLock - Gère le verrouillage de l'application via l'authentification native.
 *
 * Utilise expo-local-authentication pour demander l'authentification du propriétaire
 * du téléphone (empreinte digitale, reconnaissance faciale, code PIN, schéma ou mot de passe).
 *
 * Règles de sécurité :
 * - Ne stocke jamais de code PIN, mot de passe ou données biométriques.
 * - Si le téléphone n'a aucun verrouillage configuré, l'accès est direct.
 * - Si l'authentification échoue ou est annulée, l'accès est refusé.
 * - L'application se verrouille quand elle passe en arrière-plan.
 * - L'authentification n'est demandée qu'une seule fois au démarrage.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'no-lock';

export function useAppLock() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Tente l'authentification native (biométrie ou fallback PIN/schéma/mot de passe).
   * Appelée une seule fois au démarrage, ou manuellement via le bouton "Déverrouiller".
   */
  const authenticate = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Accédez à Miam Miam Gestion',
        cancelLabel: 'Annuler',
        // disableDeviceFallback: false permet le fallback vers le code PIN/schéma/mot de passe
        disableDeviceFallback: false,
      });

      if (result.success) {
        setAuthStatus('authenticated');
        setErrorMessage(null);
      } else {
        // L'authentification a échoué ou été annulée
        setAuthStatus('unauthenticated');
        setErrorMessage(
          'Authentification requise pour accéder à l\'application.'
        );
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;

      // Si aucun verrouillage n'est configuré sur le téléphone, autoriser l'accès direct
      if (
        errorCode === 'not_enrolled' ||
        errorCode === 'passcode_not_set' ||
        errorCode === 'not_available' ||
        errorMessage?.includes('no lock screen') ||
        errorMessage?.includes('Lock screen') ||
        errorMessage?.includes('verrouillage') ||
        errorMessage?.includes('passcode not set')
      ) {
        setAuthStatus('no-lock');
        setErrorMessage(null);
        return;
      }

      // Autre erreur : authentification refusée
      setAuthStatus('unauthenticated');
      setErrorMessage(
        'Impossible d\'authentifier. Vérifiez le verrouillage de votre téléphone.'
      );
    }
  }, []);

  /**
   * Gère le passage en arrière-plan : verrouille l'application.
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (authStatus === 'authenticated' && nextAppState === 'background') {
        // L'app passe en arrière-plan : verrouiller
        setAuthStatus('unauthenticated');
        setErrorMessage(null);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => subscription.remove();
  }, [authStatus]);

  return {
    authStatus,
    errorMessage,
    authenticate,
    isAuthenticated: authStatus === 'authenticated',
    isChecking: authStatus === 'checking',
    hasNoLock: authStatus === 'no-lock',
    isUnauthenticated: authStatus === 'unauthenticated',
  };
}

export function useAppLockBackground() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, []);

  return { appState, setAppState };
}

export function isAppInForeground(appState: AppStateStatus) {
  return appState === 'active';
}

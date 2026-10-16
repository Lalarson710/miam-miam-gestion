/**
 * useDatabase hook - initializes the SQLite database on first launch.
 * Runs migrations and seeds initial data.
 * Returns loading state and error if initialization fails.
 */

import { runMigrations } from '@/database/migrations';
import { seedIfEmpty } from '@/database/seed';
import { useEffect, useState } from 'react';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      runMigrations();
      seedIfEmpty();
      if (!cancelled) {
        setIsReady(true);
      }
    } catch (e) {
      console.error('Database initialization failed:', e);
      if (!cancelled) {
        setError(e instanceof Error ? e.message : 'Erreur d\'initialisation de la base de données.');
      }
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return { isReady, error };
}

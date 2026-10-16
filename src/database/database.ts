/**
 * SQLite database setup for Miam Miam Gestion.
 * Uses expo-sqlite (SDK 57) synchronous API.
 * Database is created automatically on first launch and persists across app restarts.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'miam_miam_gestion.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the singleton database instance.
 * Opens the database if not already open.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
}

/**
 * Close the database connection.
 * Useful for testing.
 */
export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}

/**
 * Check if the database is initialized (has the schema_migrations table).
 */
export function isDatabaseInitialized(): boolean {
  try {
    const database = getDatabase();
    const result = database.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='schema_migrations'",
    );
    return result !== null && result.count > 0;
  } catch {
    return false;
  }
}

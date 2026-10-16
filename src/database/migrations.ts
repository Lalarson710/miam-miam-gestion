/**
 * Database migrations for Miam Miam Gestion.
 * Versioned migrations ensure the schema can evolve without losing user data.
 * Each migration is applied only once, tracked in the schema_migrations table.
 */

import * as SQLite from 'expo-sqlite';

import { getDatabase } from '@/database/database';

export interface Migration {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => void;
}

/**
 * Migration 1: Initial schema
 * Creates all base tables: produits, ventes, vente_lignes, depenses, schema_migrations.
 */
const migration1: Migration = {
  version: 1,
  description: 'Create initial schema (produits, ventes, vente_lignes, depenses)',
  up: (db) => {
    // Schema migrations tracking table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        description TEXT,
        applied_at TEXT NOT NULL
      );
    `);

    // Produits table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS produits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        description TEXT,
        prix_vente INTEGER NOT NULL CHECK (prix_vente > 0),
        actif INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Ventes table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS ventes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT NOT NULL UNIQUE,
        date_vente TEXT NOT NULL,
        montant_total INTEGER NOT NULL DEFAULT 0,
        mode_paiement TEXT,
        observation TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Vente lignes table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS vente_lignes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vente_id INTEGER NOT NULL,
        produit_id INTEGER,
        nom_produit TEXT NOT NULL,
        quantite INTEGER NOT NULL CHECK (quantite > 0),
        prix_unitaire INTEGER NOT NULL CHECK (prix_unitaire > 0),
        montant_ligne INTEGER NOT NULL,
        FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
        FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
      );
    `);

    // Depenses table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS depenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_depense TEXT NOT NULL,
        libelle TEXT NOT NULL,
        categorie TEXT NOT NULL,
        montant INTEGER NOT NULL CHECK (montant > 0),
        quantite INTEGER,
        unite TEXT,
        observation TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Indexes for performance
    db.execSync(`CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes(date_vente);`);
    db.execSync(`CREATE INDEX IF NOT EXISTS idx_vente_lignes_vente_id ON vente_lignes(vente_id);`);
    db.execSync(`CREATE INDEX IF NOT EXISTS idx_depenses_date ON depenses(date_depense);`);
    db.execSync(`CREATE INDEX IF NOT EXISTS idx_depenses_categorie ON depenses(categorie);`);
    db.execSync(`CREATE INDEX IF NOT EXISTS idx_produits_actif ON produits(actif);`);

    // Record migration
    db.runSync(
      'INSERT INTO schema_migrations (version, description, applied_at) VALUES (?, ?, ?)',
      [1, 'Create initial schema', new Date().toISOString()],
    );
  },
};

/**
 * All migrations in order. Add new migrations to this array.
 */
export const MIGRATIONS: Migration[] = [migration1];

/**
 * Run all pending migrations.
 * Checks the schema_migrations table to determine which migrations have been applied.
 *
 * IMPORTANT: The schema_migrations table must be created BEFORE querying it,
 * otherwise the first launch will crash with "no such table: schema_migrations".
 * We use CREATE TABLE IF NOT EXISTS so this is idempotent and safe on every launch.
 */
export function runMigrations(): void {
  const db = getDatabase();

  // Ensure the migrations tracking table exists before querying it.
  // This fixes the "no such table: schema_migrations" crash on first launch.
  db.execSync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      description TEXT,
      applied_at TEXT NOT NULL
    );
  `);

  // Get already applied migration versions
  const applied = db.getAllSync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      migration.up(db);
    }
  }
}

/**
 * Get the current schema version.
 */
export function getSchemaVersion(): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_migrations',
  );
  return result?.version ?? 0;
}

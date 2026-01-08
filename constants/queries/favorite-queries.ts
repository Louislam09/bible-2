export const CREATE_FAVORITE_VERSES_TABLE = `CREATE TABLE IF NOT EXISTS favorite_verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_number INTEGER,
  chapter INTEGER,
  verse INTEGER,
  uuid TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE (book_number, chapter, verse)
);`;

// Migration queries for existing tables
export const CREATE_COLUMN_UUID_IN_FAVORITE_VERSES_TABLE = `ALTER TABLE favorite_verses ADD COLUMN uuid TEXT;`;
export const CREATE_COLUMN_CREATED_AT_IN_FAVORITE_VERSES_TABLE = `ALTER TABLE favorite_verses ADD COLUMN created_at TIMESTAMP;`;
export const CREATE_COLUMN_UPDATED_AT_IN_FAVORITE_VERSES_TABLE = `ALTER TABLE favorite_verses ADD COLUMN updated_at TIMESTAMP;`;
export const CREATE_COLUMN_DELETED_AT_IN_FAVORITE_VERSES_TABLE = `ALTER TABLE favorite_verses ADD COLUMN deleted_at TIMESTAMP;`;

export const GET_FAVORITE_VERSES_WITHOUT_UUID = `SELECT id FROM favorite_verses WHERE uuid IS NULL OR uuid = '' OR uuid = 'null' OR uuid = 'undefined'`;

export const UPDATE_FAVORITE_VERSE_UUID_BY_ID = `UPDATE favorite_verses SET uuid = ? WHERE id = ?`;

export const INSERT_FAVORITE_VERSE = `INSERT INTO favorite_verses (book_number, chapter, verse, uuid, created_at, updated_at) 
SELECT ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM favorite_verses 
  WHERE book_number = ? AND chapter = ? AND verse = ?);`;

// Hard delete (for cleanup only)
export const DELETE_FAVORITE_VERSE = `DELETE FROM favorite_verses WHERE book_number = ? AND chapter = ? AND verse = ?;`;

// Soft delete
export const SOFT_DELETE_FAVORITE_VERSE = `UPDATE favorite_verses SET deleted_at = ?, updated_at = ? WHERE book_number = ? AND chapter = ? AND verse = ?;`;

// Get all favorites (excluding soft-deleted) - for display
export const GET_ALL_FAVORITE_VERSES = `SELECT v.*, fv.id, b.long_name as bookName, fv.uuid as uuid, fv.created_at, fv.updated_at 
FROM verses v
INNER JOIN books b ON b.book_number = v.book_number
INNER JOIN favorite_verses fv ON v.book_number = fv.book_number AND v.chapter = fv.chapter AND v.verse = fv.verse
WHERE fv.deleted_at IS NULL
ORDER BY fv.id DESC;`;

// Get all favorites including deleted (for sync)
export const GET_ALL_FAVORITE_VERSES_INCLUDING_DELETED = `SELECT * FROM favorite_verses;`;

// Get favorite by UUID
export const GET_FAVORITE_VERSE_BY_UUID = `SELECT * FROM favorite_verses WHERE uuid = ?;`;

// Update favorite from cloud sync
export const UPDATE_FAVORITE_VERSE_FROM_SYNC = `UPDATE favorite_verses SET updated_at = ?, deleted_at = ? WHERE uuid = ?;`;

// Insert favorite from cloud (for sync)
export const INSERT_FAVORITE_VERSE_FROM_SYNC = `INSERT OR IGNORE INTO favorite_verses (book_number, chapter, verse, uuid, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?);`;

// Cleanup queries - permanently delete old soft-deleted records
export const GET_OLD_SOFT_DELETED_FAVORITES = `SELECT * FROM favorite_verses WHERE deleted_at IS NOT NULL AND deleted_at < ?;`;
export const DELETE_OLD_SOFT_DELETED_FAVORITES = `DELETE FROM favorite_verses WHERE deleted_at IS NOT NULL AND deleted_at < ?;`;

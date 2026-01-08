export const CREATE_NOTE_TABLE = `CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_text TEXT,
  title TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uuid TEXT,
  deleted_at TIMESTAMP
);`;

export const CREATE_COLUMN_UPDATED_AT_IN_NOTE_TABLE = `ALTER TABLE notes ADD COLUMN updated_at TIMESTAMP;`;

export const CREATE_COLUMN_UUID_IN_NOTE_TABLE = `ALTER TABLE notes ADD COLUMN uuid TEXT;`;

export const CREATE_COLUMN_DELETED_AT_IN_NOTE_TABLE = `ALTER TABLE notes ADD COLUMN deleted_at TIMESTAMP;`;

export const INSERT_INTO_NOTE = `INSERT INTO notes (uuid, title, note_text, created_at, updated_at) 
VALUES (?, ?, ?, ?, ?);`;

export const GET_NOTE_BY_ID = `SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL`;

export const GET_NOTES_BY_IDS = `SELECT * FROM notes WHERE deleted_at IS NULL AND id IN`;

export const GET_ALL_NOTE = `SELECT * FROM notes
WHERE deleted_at IS NULL
ORDER BY 
  CASE 
    WHEN updated_at IS NOT NULL THEN updated_at 
    ELSE created_at 
  END DESC;`;

// Include deleted notes for sync purposes
export const GET_ALL_NOTES_INCLUDING_DELETED = `SELECT * FROM notes
ORDER BY 
  CASE 
    WHEN updated_at IS NOT NULL THEN updated_at 
    ELSE created_at 
  END DESC;`;

export const GET_ALL_NOTE_NAME = `SELECT id, title FROM notes
WHERE deleted_at IS NULL
ORDER BY 
  CASE 
    WHEN updated_at IS NOT NULL THEN updated_at 
    ELSE created_at 
  END DESC;`;

// Hard delete - used for permanent cleanup after 7 days
export const DELETE_NOTE = `DELETE FROM notes WHERE id = ?;`;

export const DELETE_NOTE_ALL = `DELETE FROM notes;`;

// Soft delete - marks note as deleted instead of removing
export const SOFT_DELETE_NOTE = `UPDATE notes SET deleted_at = ?, updated_at = ? WHERE id = ?;`;

export const UPDATE_NOTE_BY_ID = `UPDATE notes SET title = ?, note_text = ?, 
  updated_at = ? WHERE id = ?`;

// Cleanup: permanently delete notes that have been soft-deleted for more than 7 days
export const DELETE_OLD_SOFT_DELETED_NOTES = `DELETE FROM notes 
WHERE deleted_at IS NOT NULL AND deleted_at < ?;`;

// Get notes that are soft-deleted and older than cutoff date (for cloud cleanup)
export const GET_OLD_SOFT_DELETED_NOTES = `SELECT * FROM notes 
WHERE deleted_at IS NOT NULL AND deleted_at < ?;`;

export const CREATE_NOTE_TABLE = `CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_text TEXT,
  title TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uuid TEXT
);`;

export const CREATE_COLUMN_UPDATED_AT_IN_NOTE_TABLE = `ALTER TABLE notes ADD COLUMN updated_at TIMESTAMP;`;

export const CREATE_COLUMN_UUID_IN_NOTE_TABLE = `ALTER TABLE notes ADD COLUMN uuid TEXT;`;

export const INSERT_INTO_NOTE = `INSERT INTO notes (uuid, title, note_text, created_at, updated_at) 
VALUES (?, ?, ?, ?, ?);`;

export const GET_NOTE_BY_ID = `SELECT * FROM notes where id = ?`;

export const GET_NOTES_BY_IDS = `SELECT * FROM notes where id in`;

export const GET_ALL_NOTE = `SELECT * FROM notes
ORDER BY 
  CASE 
    WHEN updated_at IS NOT NULL THEN updated_at 
    ELSE created_at 
  END DESC;`;

export const GET_ALL_NOTE_NAME = `SELECT id, title FROM notes
ORDER BY 
  CASE 
    WHEN updated_at IS NOT NULL THEN updated_at 
    ELSE created_at 
  END DESC;`;

export const DELETE_NOTE = `DELETE FROM notes WHERE id = ?;`;

export const DELETE_NOTE_ALL = `DELETE FROM notes;`;

export const UPDATE_NOTE_BY_ID = `UPDATE notes set title = ?, note_text = ?, 
  updated_at = ? where id = ?`;


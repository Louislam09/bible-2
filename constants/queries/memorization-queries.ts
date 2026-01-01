export const CREATE_MEMORIZATION_TABLE = `CREATE TABLE IF NOT EXISTS memorization (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse TEXT NOT NULL,
  version TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  lastPracticed INTEGER NOT NULL,
  addedDate INTEGER NOT NULL
);`;

export const GET_ALL_MOMORIZATION = `SELECT * FROM memorization;`;

export const INSERT_VERSE_TO_MOMORIZATION = `INSERT INTO memorization (verse, version, progress, lastPracticed, addedDate) VALUES (?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'));`;

export const DELETE_VERSE_FROM_MOMORIZATION = `DELETE FROM memorization WHERE id = ?;`;

export const UPDATE_MOMORIZATION_PROGRESS = `UPDATE memorization SET progress = ?, lastPracticed = ? WHERE id = ?;`;


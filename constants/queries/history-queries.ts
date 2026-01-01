export const historyQuery = {
    CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
    INSERT: `INSERT INTO history (book, chapter, verse, created_at) VALUES (?, ?, ?, datetime('now', 'localtime'));`,
    GET_ALL: `SELECT * FROM history ORDER BY created_at DESC;`,
    GET_LAST: `SELECT * FROM history ORDER BY created_at DESC LIMIT 1;`,
    DELETE_ALL: `DELETE FROM history;`,
    DELETE_BY_ID: `DELETE FROM history WHERE id = ?;`,
    UPDATE_VERSE: `UPDATE history SET verse = ? WHERE id = ?;`,
};


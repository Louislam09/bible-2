const CREATE_HIGHLIGHTED_VERSES_TABLE = `CREATE TABLE IF NOT EXISTS highlighted_verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_number INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  style TEXT NOT NULL CHECK (style IN ('highlight', 'underline')),
  color TEXT NOT NULL,
  uuid TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE (book_number, chapter, verse)
);`;

// Migration queries for existing tables
const CREATE_COLUMN_UPDATED_AT_IN_HIGHLIGHTED_VERSES_TABLE = `ALTER TABLE highlighted_verses ADD COLUMN updated_at TIMESTAMP;`;
const CREATE_COLUMN_DELETED_AT_IN_HIGHLIGHTED_VERSES_TABLE = `ALTER TABLE highlighted_verses ADD COLUMN deleted_at TIMESTAMP;`;

const INSERT_HIGHLIGHTED_VERSE = `
  INSERT OR IGNORE INTO highlighted_verses
  (book_number, chapter, verse, style, color, uuid, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`;

const UPDATE_HIGHLIGHTED_VERSE = `
  UPDATE highlighted_verses
  SET style = ?, color = ?, updated_at = ?
  WHERE book_number = ?
  AND chapter = ?
  AND verse = ?;
`;

// Hard delete (for cleanup only)
const DELETE_HIGHLIGHTED_VERSE = `
  DELETE FROM highlighted_verses
  WHERE book_number = ?
  AND chapter = ?
  AND verse = ?;
`;

// Soft delete
const SOFT_DELETE_HIGHLIGHTED_VERSE = `
  UPDATE highlighted_verses 
  SET deleted_at = ?, updated_at = ? 
  WHERE book_number = ? AND chapter = ? AND verse = ?;
`;

// Get all highlights (excluding soft-deleted) - for display
const GET_ALL_HIGHLIGHTED_VERSES = `
  SELECT 
    v.*,
    hv.id,
    hv.style,
    hv.color,
    hv.uuid,
    hv.created_at,
    hv.updated_at,
    b.long_name AS bookName
  FROM highlighted_verses hv
  INNER JOIN verses v
    ON v.book_number = hv.book_number
    AND v.chapter = hv.chapter
    AND v.verse = hv.verse
  INNER JOIN books b
    ON b.book_number = v.book_number
  WHERE hv.deleted_at IS NULL
  ORDER BY hv.created_at DESC;
`;

// Get all highlights including deleted (for sync)
const GET_ALL_HIGHLIGHTED_VERSES_INCLUDING_DELETED = `SELECT * FROM highlighted_verses;`;

const GET_ALL_HIGHLIGHTED_VERSES_BY_BOOK_AND_CHAPTER = `
  SELECT * FROM highlighted_verses hv
  WHERE hv.book_number = ?
  AND hv.chapter = ?
  AND hv.deleted_at IS NULL;
`;

// Get highlight by UUID
const GET_HIGHLIGHTED_VERSE_BY_UUID = `SELECT * FROM highlighted_verses WHERE uuid = ?;`;

// Update highlight from cloud sync
const UPDATE_HIGHLIGHTED_VERSE_FROM_SYNC = `
  UPDATE highlighted_verses 
  SET style = ?, color = ?, updated_at = ?, deleted_at = ? 
  WHERE uuid = ?;
`;

// Insert highlight from cloud (for sync)
const INSERT_HIGHLIGHTED_VERSE_FROM_SYNC = `
  INSERT OR IGNORE INTO highlighted_verses 
  (book_number, chapter, verse, style, color, uuid, created_at, updated_at, deleted_at) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

// Cleanup queries - permanently delete old soft-deleted records
const GET_OLD_SOFT_DELETED_HIGHLIGHTS = `SELECT * FROM highlighted_verses WHERE deleted_at IS NOT NULL AND deleted_at < ?;`;
const DELETE_OLD_SOFT_DELETED_HIGHLIGHTS = `DELETE FROM highlighted_verses WHERE deleted_at IS NOT NULL AND deleted_at < ?;`;

export {
  CREATE_HIGHLIGHTED_VERSES_TABLE,
  CREATE_COLUMN_UPDATED_AT_IN_HIGHLIGHTED_VERSES_TABLE,
  CREATE_COLUMN_DELETED_AT_IN_HIGHLIGHTED_VERSES_TABLE,
  INSERT_HIGHLIGHTED_VERSE,
  UPDATE_HIGHLIGHTED_VERSE,
  DELETE_HIGHLIGHTED_VERSE,
  SOFT_DELETE_HIGHLIGHTED_VERSE,
  GET_ALL_HIGHLIGHTED_VERSES,
  GET_ALL_HIGHLIGHTED_VERSES_INCLUDING_DELETED,
  GET_ALL_HIGHLIGHTED_VERSES_BY_BOOK_AND_CHAPTER,
  GET_HIGHLIGHTED_VERSE_BY_UUID,
  UPDATE_HIGHLIGHTED_VERSE_FROM_SYNC,
  INSERT_HIGHLIGHTED_VERSE_FROM_SYNC,
  GET_OLD_SOFT_DELETED_HIGHLIGHTS,
  DELETE_OLD_SOFT_DELETED_HIGHLIGHTS,
};

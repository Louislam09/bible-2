const CREATE_HIGHLIGHTED_VERSES_TABLE = `CREATE TABLE IF NOT EXISTS highlighted_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
  
    book_number INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
  
    style TEXT NOT NULL CHECK (style IN ('highlight', 'underline')),
    color TEXT NOT NULL,
    uuid TEXT NOT NULL,
    created_at INTEGER NOT NULL,
  
    UNIQUE (book_number, chapter, verse)
  );`

const INSERT_HIGHLIGHTED_VERSE = `
  INSERT OR IGNORE INTO highlighted_verses
  (book_number, chapter, verse, style, color, uuid, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

const UPDATE_HIGHLIGHTED_VERSE = `
  UPDATE highlighted_verses
  SET style = ?, color = ?
  WHERE book_number = ?
  AND chapter = ?
  AND verse = ?;
  `;

const DELETE_HIGHLIGHTED_VERSE = `
  DELETE FROM highlighted_verses
  WHERE book_number = ?
  AND chapter = ?
  AND verse = ?;
  `;

const GET_ALL_HIGHLIGHTED_VERSES = `
  SELECT 
    v.*,
    hv.id,
    hv.style,
    hv.color,
    hv.uuid,
    hv.created_at,
    b.long_name AS bookName
  
  FROM highlighted_verses hv
  INNER JOIN verses v
    ON v.book_number = hv.book_number
    AND v.chapter = hv.chapter
    AND v.verse = hv.verse
  INNER JOIN books b
    ON b.book_number = v.book_number
  
  ORDER BY hv.created_at DESC;
  `;

export {
    CREATE_HIGHLIGHTED_VERSES_TABLE,
    INSERT_HIGHLIGHTED_VERSE,
    UPDATE_HIGHLIGHTED_VERSE,
    DELETE_HIGHLIGHTED_VERSE,
    GET_ALL_HIGHLIGHTED_VERSES,
}
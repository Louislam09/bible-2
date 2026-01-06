export const CREATE_FAVORITE_VERSES_TABLE = `CREATE TABLE IF NOT EXISTS favorite_verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_number INTEGER,
  chapter INTEGER,
  verse INTEGER,
  uuid TEXT,
  UNIQUE (book_number, chapter, verse)
);`;

export const CREATE_COLUMN_UUID_IN_FAVORITE_VERSES_TABLE = `ALTER TABLE favorite_verses ADD COLUMN uuid TEXT;`;

export const GET_FAVORITE_VERSES_WITHOUT_UUID = `SELECT id FROM favorite_verses WHERE uuid IS NULL OR uuid = '' OR uuid = 'null' OR uuid = 'undefined'`;

export const UPDATE_FAVORITE_VERSE_UUID_BY_ID = `UPDATE favorite_verses SET uuid = ? WHERE id = ?`;

export const INSERT_FAVORITE_VERSE = `INSERT INTO favorite_verses (book_number, chapter, verse, uuid) 
SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM favorite_verses 
  WHERE book_number = ? AND chapter = ? AND verse = ?);`;

export const DELETE_FAVORITE_VERSE = `DELETE FROM favorite_verses WHERE book_number = ? AND chapter = ? AND verse = ?;`;

export const GET_ALL_FAVORITE_VERSES = `select v.*, fv.id,b.long_name as bookName, fv.uuid as uuid from verses v
inner join books b
on b.book_number = v.book_number
inner join favorite_verses fv 
ON v.book_number = fv.book_number 
AND v.chapter = fv.chapter 
AND v.verse = fv.verse order by id desc;`;


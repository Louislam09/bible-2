import { DBName } from "enums";

export const GET_VERSE_NUMBER_QUERY = `SELECT COUNT(v.verse) AS verse_count
FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
WHERE b.long_name = ? AND v.chapter = ?
GROUP BY v.chapter
ORDER BY v.verse;`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER = `SELECT * FROM verses WHERE book_number = ? and chapter = ?;`;
export const GET_SUBTITLE_BY_BOOK_AND_CHAPTER = `Select * from subheadings where book_number = ? and chapter = ?;`;
export const SEARCH_TEXT_QUERY = `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number
where`;
export const CHECK_DB =
  "SELECT name FROM sqlite_master WHERE type='table' AND name='verses';";

export const CREATE_FAVORITE_VERSES_TABLE = `CREATE TABLE IF NOT EXISTS favorite_verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_number INTEGER,
  chapter INTEGER,
  verse INTEGER
);`;

export const INSERT_FAVORITE_VERSE = `INSERT INTO favorite_verses (book_number, chapter, verse) VALUES (?, ?, ?);`;
export const DELETE_FAVORITE_VERSE = `DELETE FROM favorite_verses WHERE book_number = ? AND chapter = ? AND verse = ?;`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV = `SELECT v.*, 
CASE 
    WHEN fv.id IS NOT NULL THEN 1 
    ELSE 0 
END AS is_favorite 
FROM verses v 
LEFT JOIN favorite_verses fv 
ON v.book_number = fv.book_number 
AND v.chapter = fv.chapter 
AND v.verse = fv.verse 
WHERE v.book_number = ? 
AND v.chapter = ?;`;

export const GET_ALL_FAVORITE_VERSES = `select v.*, fv.id,b.long_name as bookName from verses v
inner join books b
on b.book_number = v.book_number
inner join favorite_verses fv 
ON v.book_number = fv.book_number 
AND v.chapter = fv.chapter 
AND v.verse = fv.verse;`;

type TQuery = {
  GET_VERSE_NUMBER_QUERY: string;
  GET_VERSES_BY_BOOK_AND_CHAPTER: string;
  GET_SUBTITLE_BY_BOOK_AND_CHAPTER: string;
  SEARCH_TEXT_QUERY: string;
};

export const QUERY_BY_DB: { [key in DBName.BIBLE | DBName.NTV]: TQuery } = {
  [DBName.BIBLE]: {
    GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
    // GET_VERSES_BY_BOOK_AND_CHAPTER: `SELECT * FROM verses WHERE book_number = ? and chapter = ?;`,
    GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from subheadings where book_number = ? and chapter = ?;`,
    SEARCH_TEXT_QUERY: `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number where`,
  },
  [DBName.NTV]: {
    GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
    GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    // GET_VERSES_BY_BOOK_AND_CHAPTER: `SELECT * FROM verses WHERE book_number = ? and chapter = ?;`,
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from stories where book_number = ? and chapter = ?;`,
    SEARCH_TEXT_QUERY: `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number where`,
  },
};

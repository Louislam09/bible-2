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
export const CREATE_NOTE_TABLE = `CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_text TEXT,
  title TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

export const INSERT_INTO_NOTE = `INSERT INTO notes (title, note_text) 
values (?, ?);`
export const GET_ALL_NOTE = `SELECT * FROM notes;`

export const INSERT_FAVORITE_VERSE = `INSERT INTO favorite_verses (book_number, chapter, verse) 
SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM favorite_verses 
  WHERE book_number = ? AND chapter = ? AND verse = ?);`;
// export const INSERT_FAVORITE_VERSE = `INSERT INTO favorite_verses (book_number, chapter, verse) VALUES (?, ?, ?);`;
export const DELETE_FAVORITE_VERSE = `DELETE FROM favorite_verses WHERE book_number = ? AND chapter = ? AND verse = ?;`;
export const DELETE_NOTE = `DELETE FROM notes WHERE id = ?;`;
export const UPDATE_NOTE_BY_ID = `UPDATE notes set title = ?, note_text = ? where id = ?`

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
AND v.verse = fv.verse order by id desc;`;

const SEARCH_TEXT_QUERY_NEW = `SELECT v.*, b.long_name as bookName FROM texts t
inner join verses v on 
v.book_number = t.book_number AND
v.chapter = t.chapter and v.verse = t.verse
inner join books b on b.book_number = v.book_number
WHERE`;

export const SEARCH_STRONG_WORD = `select * from dictionary where topic in (?,?)`;
export const SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE = `select v.*, b.long_name as bookName from verses v
inner join books b on v.book_number = b.book_number
WHERE v.text like ? AND b.book_number BETWEEN ? and ?`;
export const GET_DAILY_VERSE = `select v.*, b.long_name as bookName from verses v
inner join books b
on b.book_number = v.book_number
where v.book_number = ? and v.chapter = ? and v.verse = ?`;

export const GET_VERSES_FOR_CONCORDANCIA = `SELECT 
b.long_name,
COUNT(*) AS total,
'[' || GROUP_CONCAT(
    json_object(
'bookName', b.long_name,
'bookNumber', t.book_number,
'chapter', t.chapter,
        'verse', t.verse,
        'text', t.bare_lowercase_words
    )
) || ']' AS data
FROM 
texts t
INNER JOIN 
books b ON b.book_number = t.book_number
WHERE 
t.bare_lowercase_words LIKE ?
GROUP BY 
t.book_number;
`

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
    GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from subheadings where book_number = ? and chapter = ?;`,
    SEARCH_TEXT_QUERY: SEARCH_TEXT_QUERY_NEW,
  },
  [DBName.NTV]: {
    GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
    GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from stories where book_number = ? and chapter = ?;`,
    SEARCH_TEXT_QUERY: `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number where`,
  },
};

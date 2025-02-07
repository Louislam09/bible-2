import { EBibleVersions } from "@/types";

export const GET_BOOKS_NAME = `SELECT * FROM books;`
export const GET_VERSE_NUMBER_QUERY = `SELECT COUNT(v.verse) AS verse_count
FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
WHERE b.long_name = ? AND v.chapter = ?
GROUP BY v.chapter
ORDER BY v.verse;`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER = `SELECT * FROM verses WHERE book_number = ? and chapter = ?;`;
export const GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE = `SELECT v.*, b.long_name as bookName FROM verses v INNER JOIN books b
ON b.book_number = v.book_number WHERE v.book_number = ? AND v.chapter = ? AND v.verse = ?;`;
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;


export const CREATE_COLUMN_UPDATED_AT_IN_NOTE_TABLE = `ALTER TABLE notes ADD COLUMN updated_at TIMESTAMP;`;

export const INSERT_INTO_NOTE = `INSERT INTO notes (title, note_text) 
values (?, ?);`;
export const INSERT_IMPORTED_INTO_NOTE = `INSERT INTO notes (title, note_text, created_at, updated_at) VALUES (?, ?, ?, ?)`;
export const GET_NOTE_BY_ID = `SELECT * FROM notes where id = ?`;
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

export const INSERT_FAVORITE_VERSE = `INSERT INTO favorite_verses (book_number, chapter, verse) 
SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM favorite_verses 
  WHERE book_number = ? AND chapter = ? AND verse = ?);`;
export const DELETE_FAVORITE_VERSE = `DELETE FROM favorite_verses WHERE book_number = ? AND chapter = ? AND verse = ?;`;
export const DELETE_NOTE = `DELETE FROM notes WHERE id = ?;`;
export const DELETE_NOTE_ALL = `DELETE FROM notes;`;
export const UPDATE_NOTE_BY_ID = `UPDATE notes set title = ?, note_text = ?, 
  updated_at = CURRENT_TIMESTAMP where id = ?`;

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

export const GET_COMPARE_BOOK_CHAPTER_VERSE = `SELECT v.*, 
CASE 
    WHEN fv.id IS NOT NULL THEN 1 
    ELSE 0 
END AS is_favorite, b.long_name as bookName
FROM verses v 
inner join books b
on b.book_number = v.book_number
LEFT JOIN favorite_verses fv 
ON v.book_number = fv.book_number 
AND v.chapter = fv.chapter 
AND v.verse = fv.verse 
WHERE v.book_number = ? 
AND v.chapter = ? and v.verse = ?;`;

const SEARCH_TEXT_QUERY_NEW = `SELECT v.*, b.long_name as bookName FROM texts t
inner join verses v on 
v.book_number = t.book_number AND
v.chapter = t.chapter and v.verse = t.verse
inner join books b on b.book_number = v.book_number
WHERE`;

export const SEARCH_STRONG_WORD = `select * from dictionary where topic in (?,?)`;
export const SEARCH_DICTIONARY_WORD = `select * from dictionary where topic like ?`;
export const SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE = `select v.*, b.long_name as bookName from verses v
inner join books b on v.book_number = b.book_number
WHERE v.text like ? and v.book_number BETWEEN ? and ?`;
export const GET_DAILY_VERSE = `select v.*, b.long_name as bookName from verses v
inner join books b
on b.book_number = v.book_number
where v.book_number = ? and v.chapter = ? and v.verse = ?`;

export const GET_SINGLE_OR_MULTIPLE_VERSES = `SELECT v.*, b.long_name AS bookName
FROM verses v
INNER JOIN books b
    ON b.book_number = v.book_number
WHERE `;

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
`;
export const GET_VERSES_FOR_CONCORDANCIA_OTHERS = `SELECT 
b.long_name,
COUNT(*) AS total,
'[' || GROUP_CONCAT(
    json_object(
'bookName', b.long_name,
'bookNumber', v.book_number,
'chapter', v.chapter,
        'verse', v.verse,
        'text', v.text
    )
) || ']' AS data
FROM 
verses v
INNER JOIN 
books b ON b.book_number = v.book_number
WHERE 
v.text LIKE ?
GROUP BY 
v.book_number;
`;

// MEMORIZATION QUERIES
export const CREATE_MEMORIZATION_TABLE = `CREATE TABLE IF NOT EXISTS memorization (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse TEXT NOT NULL,
  version TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  lastPracticed INTEGER NOT NULL,
  addedDate INTEGER NOT NULL
);`;
export const GET_ALL_MOMORIZATION = `SELECT * FROM memorization;`;
export const INSERT_VERSE_TO_MOMORIZATION = `INSERT INTO memorization (verse, version, progress, lastPracticed, addedDate) VALUES (?, ?, ?, ?, ?);`;
export const DELETE_VERSE_FROM_MOMORIZATION = `DELETE FROM memorization WHERE id = ?;`;
export const UPDATE_MOMORIZATION_PROGRESS = `UPDATE memorization SET progress = ?, lastPracticed = ? WHERE id = ?;`;

// STREAK QUERIES
export const CREATE_STREAK_TABLE = `CREATE TABLE IF NOT EXISTS streaks (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT UNIQUE, streak INTEGER, bestStreak INTEGER);`;
export const GET_STREAKS = `SELECT * FROM streaks ORDER BY date DESC LIMIT 7;`;
export const GET_STREAK = `SELECT * FROM streaks ORDER BY date DESC LIMIT 1;`;
export const UPDATE_STREAK = `INSERT INTO streaks (date, streak, bestStreak) VALUES (?, ?, ?);`;
export const DELETE_ALL_STEAKS = `DELETE FROM streaks`;
export const DELETE_LAST_STREAK = `WITH last_streak AS (
    SELECT id FROM streaks ORDER BY date DESC LIMIT 1
)
DELETE FROM streaks 
WHERE id = (SELECT id FROM last_streak)
RETURNING *;`;

type TQuery = {
  GET_VERSE_NUMBER_QUERY: string;
  GET_VERSES_BY_BOOK_AND_CHAPTER: string;
  GET_SUBTITLE_BY_BOOK_AND_CHAPTER: string;
  SEARCH_TEXT_QUERY: string;
  GET_VERSES_FOR_CONCORDANCIA: string;
};

export const QUERY_BY_DB: { [key in string]: TQuery } = {
  [EBibleVersions.BIBLE]: {
    GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
    GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from subheadings where book_number = ? and chapter = ?;`,
    SEARCH_TEXT_QUERY: SEARCH_TEXT_QUERY_NEW,
    GET_VERSES_FOR_CONCORDANCIA,
  },
  [EBibleVersions.NTV]: {
    GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
    GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from stories where book_number = ? and chapter = ?;`,
    SEARCH_TEXT_QUERY: `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number where`,
    GET_VERSES_FOR_CONCORDANCIA: GET_VERSES_FOR_CONCORDANCIA_OTHERS,
  },
  OTHERS: {
    GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
    GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from stories where book_number = ? and chapter = ?;`,
    SEARCH_TEXT_QUERY: `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number where`,
    GET_VERSES_FOR_CONCORDANCIA: GET_VERSES_FOR_CONCORDANCIA_OTHERS,
  },
};

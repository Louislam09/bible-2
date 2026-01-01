export const GET_COMMENTARIES_BY_BOOK_AND_CHAPTER = `
            SELECT * FROM commentaries WHERE book_number = ? AND (chapter_number_from = ? OR (? BETWEEN chapter_number_from AND chapter_number_to)) ORDER BY chapter_number_from, verse_number_from;`;

export const commentaryQuery = {
    INSERT: `INSERT INTO commentaries (book_number, chapter_number_from, chapter_number_to, verse_number_from, verse_number_to, commentary) VALUES (?, ?, ?, ?, ?, ?);`,
    GET_ALL: `SELECT * FROM commentaries ORDER BY chapter_number_from, verse_number_from;`,
    DELETE_ALL: `DELETE FROM commentaries;`,
    DELETE_BY_ID: `DELETE FROM commentaries WHERE id = ?;`,
};


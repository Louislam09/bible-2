export const GET_VERSE_NUMBER_QUERY = `SELECT COUNT(v.verse) AS verse_count
FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
WHERE b.long_name = ? AND v.chapter = ?
GROUP BY v.chapter
ORDER BY v.verse;`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER = `SELECT * FROM verses WHERE book_number = ? and chapter = ?;`;
export const GET_SUBTITLE_BY_BOOK_AND_CHAPTER = `Select * from subheadings where book_number = ? and chapter = ?;`;

// export const GET_VERSES_AND_SUBTITLE_BY_BOOK_AND_CHAPTER = `SELECT json_array('verse',verse, 'chapter', chapter) from verses
// where chapter =? and book_number =?;`;

//TODO: WORKING: WORKING

// export const GET_VERSES_AND_SUBTITLE_BY_BOOK_AND_CHAPTER = `SELECT
// '{"verses": [' ||
//     GROUP_CONCAT('{"book_number": ' || v.book_number || ', "chapter": ' || v.chapter || ', "text": "' || v.text || '", "verse": ' || v.verse || '}') ||
// '], "subheadings": [' ||
//     GROUP_CONCAT('{"order_if_several": ' || coalesce(s.order_if_several, 'null') || ', "subheading": "' || coalesce(s.subheading, '') || '", "chapter": ' || coalesce(s.chapter, 'null') || ', "verse": ' || coalesce(s.verse, 'null') || '}') ||
// ']}'
// AS result
// FROM
// verses v
// LEFT JOIN
// subheadings s ON v.book_number = s.book_number AND v.chapter = s.chapter AND v.verse = s.verse
// WHERE
// v.book_number = ? AND v.chapter = ?;`;

// export const GET_VERSES_AND_SUBTITLE_BY_BOOK_AND_CHAPTER = `SELECT
// json_object(
//     'verses', json_group_array(json_object('book_number', v.book_number, 'chapter', v.chapter, 'text', v.text, 'verse', v.verse)),
//     'subheadings', json_group_array(json_object('order_if_several', s.order_if_several, 'subheading', s.subheading, 'chapter', s.chapter, 'verse', s.verse))
// ) AS result
// FROM
// verses v
// LEFT JOIN
// subheadings s ON v.book_number = s.book_number AND v.chapter = s.chapter AND v.verse = s.verse
// WHERE
// v.book_number = ? AND v.chapter = ?;`;

// export const GET_VERSES_AND_SUBTITLE_BY_BOOK_AND_CHAPTER = `SELECT
// json_object(
//     'verses', json_group_array(json_object('book_number', v.book_number, 'chapter', v.chapter, 'text', v.text, 'verse', v.verse)),
//     'subheadings', json_group_array(json_object('order_if_several', s.order_if_several, 'subheading', s.subheading))
// ) AS result
// FROM
// verses v
// LEFT JOIN
// subheadings s ON v.book_number = s.book_number AND v.chapter = s.chapter AND v.verse = s.verse
// WHERE
// v.book_number = ? AND v.chapter = ?;
// `;
// export const GET_VERSES_AND_SUBTITLE_BY_BOOK_AND_CHAPTER = `select v.*, s.subheading, s.order_if_several
// from verses v
// left join subheadings s on v.book_number = s.book_number
// and v.chapter = s.chapter and v.verse = s.verse
// where v.book_number = ? and v.chapter = ?;`;

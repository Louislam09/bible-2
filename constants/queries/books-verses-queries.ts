export const GET_BOOKS_NAME = `SELECT * FROM books;`;

export const GET_VERSE_NUMBER_QUERY = `SELECT COUNT(v.verse) AS verse_count
FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
WHERE b.long_name = ? AND v.chapter = ?
GROUP BY v.chapter
ORDER BY v.verse;`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER = `SELECT * FROM verses WHERE book_number = ? and chapter = ?;`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE = `SELECT v.*, b.long_name as bookName FROM verses v INNER JOIN books b
ON b.book_number = v.book_number WHERE v.book_number = ? AND v.chapter = ? AND v.verse = ?;`;

export const GET_SUBTITLE_BY_BOOK_AND_CHAPTER = `Select * from subheadings where book_number = ? and chapter = ?;`;

export const CHECK_DB =
    "SELECT name FROM sqlite_master WHERE type='table' AND name='verses';";

// export const GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV = `SELECT 
//     v.*,
//     CASE 
//         WHEN fv.id IS NOT NULL THEN 1 
//         ELSE 0 
//     END AS is_favorite,
//     COALESCE(
//         json_group_array(sh.subheading),
//         json('[]')
//     ) AS subheading
// FROM verses v
// LEFT JOIN favorite_verses fv 
//     ON v.book_number = fv.book_number 
//     AND v.chapter = fv.chapter 
//     AND v.verse = fv.verse
// LEFT JOIN subheadings sh 
//     ON v.book_number = sh.book_number 
//     AND v.chapter = sh.chapter 
//     AND v.verse = sh.verse
// WHERE v.book_number = ? 
// AND v.chapter = ?
// GROUP BY v.book_number, v.chapter, v.verse;
// `;
export const GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV = `
SELECT 
  v.*,

  CASE 
    WHEN fv.id IS NOT NULL THEN 1 
    ELSE 0 
  END AS is_favorite,

  CASE 
    WHEN hv.id IS NOT NULL THEN json_object(
      'id', hv.id,
      'style', hv.style,
      'color', hv.color,
      'uuid', hv.uuid
    )
    ELSE NULL
  END AS highlight,

  COALESCE(
    json_group_array(sh.subheading),
    json('[]')
  ) AS subheading

FROM verses v

LEFT JOIN favorite_verses fv 
  ON v.book_number = fv.book_number
  AND v.chapter = fv.chapter
  AND v.verse = fv.verse

LEFT JOIN highlighted_verses hv
  ON v.book_number = hv.book_number
  AND v.chapter = hv.chapter
  AND v.verse = hv.verse

LEFT JOIN subheadings sh 
  ON v.book_number = sh.book_number
  AND v.chapter = sh.chapter
  AND v.verse = sh.verse

WHERE v.book_number = ?
AND v.chapter = ?

GROUP BY v.book_number, v.chapter, v.verse;
`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_INTERLINEAR = `SELECT 
    inter.*,
    CASE 
        WHEN fv.id IS NOT NULL THEN 1 
        ELSE 0 
    END AS is_favorite
FROM interlinear inter
LEFT JOIN favorite_verses fv 
    ON inter.book_number = fv.book_number 
    AND inter.chapter = fv.chapter 
    AND inter.verse = fv.verse
WHERE inter.book_number = ? 
AND inter.chapter = ?;
`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_INTERLINEAR_GREEK = `SELECT 
    v.*,
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
AND v.chapter = ?;
`;

export const GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV_WITHOUT_SUBHEADING = `SELECT v.*,
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

export const GET_DAILY_VERSE = `select v.*, b.long_name as bookName from verses v
inner join books b
on b.book_number = v.book_number
where v.book_number = ? and v.chapter = ? and v.verse = ?`;

export const GET_SINGLE_OR_MULTIPLE_VERSES = `SELECT v.*, b.long_name AS bookName
FROM verses v
INNER JOIN books b
    ON b.book_number = v.book_number
WHERE `;


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


export const SEARCH_TEXT_QUERY = `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number
where`;

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

export { SEARCH_TEXT_QUERY_NEW };


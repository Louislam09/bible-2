import { EBibleVersions } from "@/types";
import {
    GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
    GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV_WITHOUT_SUBHEADING,
    GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_INTERLINEAR,
    GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_INTERLINEAR_GREEK,
    GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
} from "./books-verses-queries";
import { SEARCH_TEXT_QUERY_NEW } from "./search-queries";
import {
    GET_VERSES_FOR_CONCORDANCIA,
    GET_VERSES_FOR_CONCORDANCIA_OTHERS,
} from "./concordance-queries";

export type TQuery = {
    GET_VERSE_NUMBER_QUERY: string;
    GET_VERSES_BY_BOOK_AND_CHAPTER: string;
    GET_SUBTITLE_BY_BOOK_AND_CHAPTER: string;
    SEARCH_TEXT_QUERY: string;
    GET_VERSES_FOR_CONCORDANCIA: string;
    GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE: string;
};

export const QUERY_BY_DB: { [key in string]: TQuery } = {
    [EBibleVersions.BIBLE]: {
        GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
        GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV,
        GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from subheadings where book_number = ? and chapter = ?;`,
        SEARCH_TEXT_QUERY: SEARCH_TEXT_QUERY_NEW,
        GET_VERSES_FOR_CONCORDANCIA,
        GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE: GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
    },
    [EBibleVersions.NTV]: {
        GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
        GET_VERSES_BY_BOOK_AND_CHAPTER:
            GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV_WITHOUT_SUBHEADING,
        GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from stories where book_number = ? and chapter = ?;`,
        SEARCH_TEXT_QUERY: `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number where`,
        GET_VERSES_FOR_CONCORDANCIA: GET_VERSES_FOR_CONCORDANCIA_OTHERS,
        GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE: GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
    },
    [EBibleVersions.INTERLINEAR]: {
        GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
        GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_INTERLINEAR,
        GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from subheadings where book_number = ? and chapter = ?;`,
        SEARCH_TEXT_QUERY: SEARCH_TEXT_QUERY_NEW,
        GET_VERSES_FOR_CONCORDANCIA,
        GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE: GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
    },
    [EBibleVersions.GREEK]: {
        GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
        GET_VERSES_BY_BOOK_AND_CHAPTER: GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_INTERLINEAR_GREEK,
        GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from subheadings where book_number = ? and chapter = ?;`,
        SEARCH_TEXT_QUERY: SEARCH_TEXT_QUERY_NEW,
        GET_VERSES_FOR_CONCORDANCIA,
        GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE: GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
    },
    OTHERS: {
        GET_VERSE_NUMBER_QUERY: `SELECT COUNT(v.verse) AS verse_count FROM books b LEFT JOIN verses v ON b.book_number = v.book_number
    WHERE b.long_name = ? AND v.chapter = ? GROUP BY v.chapter ORDER BY v.verse;`,
        GET_VERSES_BY_BOOK_AND_CHAPTER:
            GET_VERSES_BY_BOOK_AND_CHAPTER_WITH_FAV_WITHOUT_SUBHEADING,
        GET_SUBTITLE_BY_BOOK_AND_CHAPTER: `Select * from stories where book_number = ? and chapter = ?;`,
        SEARCH_TEXT_QUERY: `SELECT v.*, b.long_name as bookName FROM verses v inner join books b on b.book_number = v.book_number where`,
        GET_VERSES_FOR_CONCORDANCIA: GET_VERSES_FOR_CONCORDANCIA_OTHERS,
        GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE: GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
    },
};


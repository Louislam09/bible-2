import { getDatabaseExt } from "@/constants/databaseNames";
import { DATABASE_TYPE } from "@/types";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { VersionItem } from "./useInstalledBible";
import useInstalledModules from "./useInstalledModules";
import { GET_COMMENTARIES_BY_BOOK_AND_CHAPTER } from "@/constants/Queries";

interface CommentaryData {
    book_number: number;
    chapter_number_from: number;
    verse_number_from: number;
    chapter_number_to: number;
    verse_number_to: number;
    text: string;
}

export interface DatabaseCommentaryData {
    dbShortName: string;
    commentaries: CommentaryData[];
}

interface Row {
    [key: string]: any;
}

// Helper function outside component to avoid React Compiler issues with try-finally
async function executeSqlQuery(
    database: SQLite.SQLiteDatabase | null,
    sql: string,
    params: any[] = [],
    queryName?: string
): Promise<Row[]> {
    // Early validation - avoid throw inside try
    if (!database) {
        console.error("Database not initialized");
        return [];
    }

    const startTime = Date.now();
    let statement: SQLite.SQLiteStatement | null = null;

    try {
        statement = await database.prepareAsync(sql);
        const result = await statement.executeAsync(params);
        const response = await result.getAllAsync();

        const endTime = Date.now();
        const executionTime = endTime - startTime;

        if (queryName) {
            console.log(`Query ${queryName} executed in ${executionTime} ms.`);
        }

        // Manual cleanup in success path
        if (statement) {
            await statement.finalizeAsync();
            statement = null;
        }

        return response as Row[];
    } catch (error: any) {
        console.error("Commentary query error:", error);

        // Manual cleanup in error path
        if (statement) {
            try {
                await statement.finalizeAsync();
            } catch (cleanupError) {
                console.error('Error finalizing statement:', cleanupError);
            }
        }

        return [];
    }
}

// Helper function to query a single commentary database
async function queryCommentaryDatabase(
    databaseItem: { id: string; name: string; path: string },
    commentaryExt: string,
    searchBook: number,
    searchChapter: number,
    searchVerse?: number
): Promise<DatabaseCommentaryData> {
    const dbID = databaseItem.id;
    const dbNameWithExt = `${dbID}${commentaryExt}`;
    let db: SQLite.SQLiteDatabase | null = null;
    const dbName = databaseItem.path.split('/').pop() || dbNameWithExt;

    try {
        db = await SQLite.openDatabaseAsync(dbName);

        // Log database tables (for debugging)
        // if (__DEV__) {
        //     const tablesResult = await executeSqlQuery(
        //         db,
        //         "SELECT * FROM sqlite_master",
        //         []
        //     );
        //     console.log(`📚 Tables in ${databaseItem.name}:`, tablesResult.map(t => t.name));
        // }

        // Build query for commentaries that cover the specified reference
        let query = GET_COMMENTARIES_BY_BOOK_AND_CHAPTER;
        let params: any[] = [searchBook, searchChapter, searchChapter];

        // If verse is specified, filter by verse range too
        if (searchVerse) {
            query += ` AND verse_number_from <= ? AND verse_number_to >= ?`;
            params.push(searchVerse, searchVerse);
        }

        const queryResult = await executeSqlQuery(db, query, params);

        // Manual cleanup in success path
        if (db) {
            await db.closeAsync();
            db = null;
        }

        return {
            dbShortName: databaseItem.name,
            commentaries: queryResult as CommentaryData[],
        };
    } catch (error) {
        console.error(`Commentary query error for ${databaseItem.name}:`, error);

        // Manual cleanup in error path
        if (db) {
            try {
                await db.closeAsync();
            } catch (cleanupError) {
                console.error('Error closing database:', cleanupError);
            }
        }

        return {
            dbShortName: databaseItem.name,
            commentaries: [],
        };
    }
}

type UseCommentaryDataProps = {
    autoSearch?: boolean;
    bookNumber?: number;
    chapter?: number;
    verse?: number;
};

const useCommentaryData = ({
    autoSearch = false,
    bookNumber,
    chapter,
    verse,
}: UseCommentaryDataProps) => {
    const [data, setData] = useState<DatabaseCommentaryData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const commentaryExt = getDatabaseExt(DATABASE_TYPE.COMMENTARY);
    const { commentaries: databases } = useInstalledModules();

    const onSearch = useCallback(
        async ({
            bookNumber: searchBook,
            chapter: searchChapter,
            verse: searchVerse,
        }: {
            bookNumber: number;
            chapter: number;
            verse?: number;
        }) => {
            if (!searchBook || !searchChapter || databases.length === 0)
                return;

            setLoading(true);
            setError(null);

            try {
                // Query all commentary databases in parallel
                const results = await Promise.all(
                    databases.map((databaseItem) =>
                        queryCommentaryDatabase(
                            databaseItem,
                            commentaryExt,
                            searchBook,
                            searchChapter,
                            searchVerse
                        )
                    )
                );

                setData(results);
                setLoading(false);
            } catch (error) {
                setError("Error fetching commentary data");
                console.error(error);
                setLoading(false);
            }
        },
        [databases, commentaryExt]
    );

    useEffect(() => {
        if (!autoSearch || !bookNumber || !chapter) return;
        onSearch({ bookNumber, chapter, verse });
    }, [autoSearch, bookNumber, chapter, verse, onSearch]);

    return { data, loading, error, onSearch, hasCommentaries: databases.length > 0 };
};

export default useCommentaryData;


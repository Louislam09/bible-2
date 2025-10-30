import { getDatabaseExt } from "@/constants/databaseNames";
import { DATABASE_TYPE } from "@/types";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { VersionItem } from "./useInstalledBible";

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

type UseCommentaryDataProps = {
    enabled: boolean;
    databases: VersionItem[];
    autoSearch?: boolean;
    bookNumber?: number;
    chapter?: number;
    verse?: number;
};

const useCommentaryData = ({
    databases,
    enabled,
    autoSearch = false,
    bookNumber,
    chapter,
    verse,
}: UseCommentaryDataProps) => {
    const [data, setData] = useState<DatabaseCommentaryData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const commentaryExt = getDatabaseExt(DATABASE_TYPE.COMMENTARY);

    const executeSql = useCallback(
        async (
            database: SQLite.SQLiteDatabase,
            sql: string,
            params: any[] = [],
            queryName?: any
        ): Promise<any[]> => {
            try {
                const startTime = Date.now();
                if (!database) {
                    throw new Error("Database not initialized");
                }
                const statement = await database.prepareAsync(sql);
                try {
                    const result = await statement.executeAsync(params);
                    const endTime = Date.now();
                    const executionTime = endTime - startTime;

                    const response = await result.getAllAsync();
                    if (queryName) {
                        console.log(`Query ${queryName} executed in ${executionTime} ms.`);
                    }
                    return response as Row[];
                } finally {
                    await statement.finalizeAsync();
                }
            } catch (error: any) {
                console.error("Commentary query error:", error);
                return [];
            }
        },
        []
    );

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
            if (!enabled || !searchBook || !searchChapter || databases.length === 0)
                return;

            setLoading(true);
            setError(null);

            try {
                const results: DatabaseCommentaryData[] = [];

                for (const databaseItem of databases) {
                    const dbID = databaseItem.id;
                    const dbNameWithExt = `${dbID}${commentaryExt}`;
                    const db = await SQLite.openDatabaseAsync(dbNameWithExt);

                    // Query for commentaries that cover the specified reference
                    let query = `
            SELECT * FROM commentaries 
            WHERE book_number = ? 
            AND chapter_number_from <= ? 
            AND chapter_number_to >= ?
          `;
                    let params: any[] = [searchBook, searchChapter, searchChapter];

                    // If verse is specified, filter by verse range too
                    if (searchVerse) {
                        query += ` AND verse_number_from <= ? AND verse_number_to >= ?`;
                        params.push(searchVerse, searchVerse);
                    }

                    query += ` ORDER BY chapter_number_from, verse_number_from`;

                    const queryResult = await executeSql(db, query, params);

                    await db.closeAsync();
                    results.push({
                        dbShortName: databaseItem.name,
                        commentaries: queryResult as CommentaryData[],
                    });
                }

                setData(results);
            } catch (error) {
                setError("Error fetching commentary data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [enabled, databases, executeSql, commentaryExt]
    );

    useEffect(() => {
        if (!autoSearch || !bookNumber || !chapter) return;
        onSearch({ bookNumber, chapter, verse });
    }, [autoSearch, bookNumber, chapter, verse]);

    return { data, loading, error, onSearch };
};

export default useCommentaryData;


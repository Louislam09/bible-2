import DAILY_VERSES from "@/constants/dailyVerses";
import { GET_DAILY_VERSE } from "@/constants/queries";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";

export interface DailyVerseData {
    text: string;
    ref: string;
    bookName: string;
    chapter: number;
    verse: number;
    book_number: number;
}

export const getDailyVerseReference = (): { book_number: number; chapter: number; verse: number } => {
    const currentDate: any = new Date();
    const lastDayOfYear: any = new Date(currentDate.getFullYear(), 0, 0);
    const dayPassed = Math.floor((currentDate - lastDayOfYear) / 86400000);

    const defaultDailyObject = { book_number: 510, chapter: 3, verse: 19 };
    return DAILY_VERSES[dayPassed] || defaultDailyObject;
};

export const getDailyVerseData = async (
    executeSql: <T = any>(sql: string, params?: any[], queryName?: string) => Promise<T[]>
): Promise<DailyVerseData | null> => {
    try {
        const { book_number, chapter, verse } = getDailyVerseReference();

        const response: any = await executeSql(
            GET_DAILY_VERSE,
            [book_number, chapter, verse],
            "GET_DAILY_VERSE_NOTIFICATION"
        );

        if (response?.length) {
            const dailyVerseData = response[0];
            return {
                text: getVerseTextRaw(dailyVerseData?.text || ""),
                ref: `${dailyVerseData?.bookName} ${dailyVerseData?.chapter}:${dailyVerseData?.verse}`,
                bookName: dailyVerseData?.bookName,
                chapter: dailyVerseData?.chapter,
                verse: dailyVerseData?.verse,
                book_number: dailyVerseData?.book_number
            };
        }

        return null;
    } catch (error) {
        console.error("Error getting daily verse data:", error);
        return null;
    }
}; 
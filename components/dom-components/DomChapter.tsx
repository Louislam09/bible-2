"use dom";
import DomVerse from "@/components/dom-components/DomVerse";
import { IBookVerse, TTheme } from "@/types";
import { ActivityIndicator } from "react-native";
import "../../global.css";

interface TChapter {
    verses: IBookVerse[];
    interlinearVerses: IBookVerse[];
    isSplit?: boolean;
    estimatedReadingTime: number;
    initialScrollIndex: number;
    onScroll?: (direction: "up" | "down") => void;
    theme: TTheme;
}

const DomChapter = ({
    verses,
    interlinearVerses,
    isSplit,
    estimatedReadingTime,
    initialScrollIndex,
    onScroll,
    theme
}: TChapter) => {
    const data = verses || [];
    const { colors } = theme;
    return (
        <div
            className={`text-primary overflow-hidden py-16`}
            style={{ color: colors.text }}
        >
            {/* Verses */}
            {data.length > 0 ? (
                data.map((verse) => (
                    <DomVerse
                        key={`${verse.book_number}-${verse.chapter}-${verse.verse}`}
                        item={verse}
                        initVerse={initialScrollIndex}
                        theme={theme}
                    />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center p-12">
                    <ActivityIndicator />
                    <p style={{ color: theme.colors.text }}>Cargando...</p>
                </div>
            )}

            {/* <div style={{ paddingBottom: 100 }} /> */}
        </div>
    );
};

export default DomChapter;
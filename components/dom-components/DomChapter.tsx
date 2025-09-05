import Icon from "@/components/Icon";
import { useBibleContext } from "@/context/BibleContext";
import { bibleState$ } from "@/state/bibleState";
import { EBibleVersions, IBookVerse, IStrongWord, TTheme } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import "../../global.css";
import ChapterRender from "./ChapterRender";
import { Text, View } from "../Themed";
import { WordTagPair } from "@/utils/extractVersesInfo";
import { useMemorization } from "@/context/MemorizationContext";
const { width } = Dimensions.get('window');
interface TChapter {
    verses: IBookVerse[];
    interlinearVerses: IBookVerse[];
    isSplit?: boolean;
    initialScrollIndex: number;
    onScroll?: (direction: "up" | "down") => void;
    theme: TTheme;
    onStrongWordClicked?: (value: WordTagPair) => void;
    onWordClicked: (code: string, item: IBookVerse) => void
    onInterlinear?: (item: IBookVerse) => void;
    onAnotar?: (item: IBookVerse) => void;
    onComparar?: (item: IBookVerse) => void;
}

const DomChapter = ({
    verses,
    interlinearVerses,
    isSplit,
    initialScrollIndex,
    onScroll,
    theme,
    onStrongWordClicked,
    onInterlinear,
    onWordClicked,
    onAnotar,
    onComparar
}: TChapter) => {
    const bibleSide = isSplit ? "bottom" : "top";
    const { currentBibleVersion, toggleFavoriteVerse } = useBibleContext();
    const { addVerse } = useMemorization();

    const isHebrewInterlinear = [
        EBibleVersions.INTERLINEAR,
    ].includes(currentBibleVersion as EBibleVersions);

    const isGreekInterlinear = [EBibleVersions.GREEK].includes(
        currentBibleVersion as EBibleVersions
    );

    const getData = useCallback(() => {
        if ((isHebrewInterlinear || isGreekInterlinear) && !isSplit) {
            return interlinearVerses;
        }
        return verses;
    }, [
        isHebrewInterlinear,
        isSplit,
        isGreekInterlinear,
        interlinearVerses,
        verses
    ]);

    const data = getData() || [];

    return (
        <ChapterRender
            width={width}
            estimatedReadingTime={bibleState$.readingTimeData[bibleSide].get()}
            data={data}
            isHebrewInterlinear={isHebrewInterlinear}
            isGreekInterlinear={isGreekInterlinear}
            isSplit={isSplit}
            initialScrollIndex={initialScrollIndex}
            theme={theme}
            onStrongWordClicked={onStrongWordClicked}
            onScroll={onScroll}
            onInterlinear={onInterlinear}
            onAnotar={onAnotar}
            onComparar={onComparar}
            onMemorizeVerse={addVerse}
            onFavoriteVerse={toggleFavoriteVerse}
            onWordClicked={onWordClicked}
        />
    );
};

export default DomChapter;
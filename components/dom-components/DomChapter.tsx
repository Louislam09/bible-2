import Icon from "@/components/Icon";
import { useBibleContext } from "@/context/BibleContext";
import { bibleState$ } from "@/state/bibleState";
import { EBibleVersions, IBookVerse, IStrongWord, TTheme } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import "../../global.css";
import ChapterRender from "./ChapterRender";
import { Text, View } from "../Themed";
const { width } = Dimensions.get('window');
interface TChapter {
    verses: IBookVerse[];
    interlinearVerses: IBookVerse[];
    isSplit?: boolean;
    estimatedReadingTime: number;
    initialScrollIndex: number;
    onScroll?: (direction: "up" | "down") => void;
    theme: TTheme;
    onStrongWordClicked?: (value: IStrongWord) => void;
}

const DomChapter = ({
    verses,
    interlinearVerses,
    isSplit,
    estimatedReadingTime,
    initialScrollIndex,
    onScroll,
    theme,
    onStrongWordClicked
}: TChapter) => {
    const bibleSide = isSplit ? "bottom" : "top";
    const { currentBibleVersion } = useBibleContext();

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
    console.log({ initialScrollIndex })

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
        />
    );
};

export default DomChapter;
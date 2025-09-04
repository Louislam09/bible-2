"use dom";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { bibleState$ } from "@/state/bibleState";
import { TTheme } from "@/types";
import extractVersesInfo from "@/utils/extractVersesInfo";
import React from "react";
import "../../global.css";

interface DomVerseTitleProps {
    isSplit?: boolean;
    subheading?: string[];
    links?: string;
    theme: TTheme;
}

const DomVerseTitle: React.FC<DomVerseTitleProps> = ({
    isSplit,
    subheading,
    links,
    theme
}) => {
    const isSplitActived = bibleState$.isSplitActived.get();
    const { colors } = theme;
    const [subTitle, link] = JSON.parse(subheading as any);
    const linkVerses = link
        ? link.split("—").map((linkVerse: any) => extractVersesInfo(linkVerse))
        : [];
    const verseLinks = links
        ? links.split(";").map((linkVerse: any) => extractVersesInfo(linkVerse))
        : [];
    const myLinks = links ? verseLinks : linkVerses;

    if (!subheading || subheading.length === 0) {
        return null;
    }

    const renderItem = (verseInfo: any, index: number) => {
        const { bookNumber, chapter, verse, endVerse } = verseInfo;

        const bookName = DB_BOOK_NAMES.find(
            (x: any) => x.bookNumber === bookNumber
        )?.longName;

        const onLink = () => {
            const isBottom = !isSplit && isSplitActived;
            const queryInfo = {
                [isBottom ? "bottomSideBook" : "book"]: bookName,
                [isBottom ? "bottomSideChapter" : "chapter"]: chapter,
                [isBottom ? "bottomSideVerse" : "verse"]: verse,
            };
            bibleState$.changeBibleQuery({
                ...queryInfo,
                shouldFetch: true,
                isBibleBottom: isBottom,
                isHistory: false,
            });
        };

        return bookName ? (
            <p key={index}
                className="rounded-lg py-0.5 px-1.5 my-1 bg-emerald-400/20 border border-emerald-700 text-sm font-bold w-fit"
                onClick={onLink}
            >
                {`${bookName} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ''}`}
            </p>
        ) : null;
    }


    return (
        <div className="">
            <h3 className="text-emerald-500 text-center font-bold text-2xl">
                {subTitle}
            </h3>
            <div className="flex-row gap-3  justify-start items-center">
                {myLinks.map(renderItem)}
            </div>
        </div>
    );
};

export default DomVerseTitle;

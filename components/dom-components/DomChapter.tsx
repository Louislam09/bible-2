"use dom";
import DomInterlinearVerse from "@/components/home/content/DomInterlinearVerse";
import Icon from "@/components/Icon";
import { useBibleContext } from "@/context/BibleContext";
import { bibleState$ } from "@/state/bibleState";
import { EBibleVersions, IBookVerse, TTheme } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import "../../global.css";
import DVerse from "./DVerse";
const { width } = Dimensions.get('window');
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
    const bibleSide = isSplit ? "bottom" : "top";
    const containerRef = useRef<HTMLDivElement>(null);
    const topVerseRef = useRef<number | null>(null);
    const lastOffset = useRef(0);
    const lastScrollTime = useRef(Date.now());
    const { currentBibleVersion } = useBibleContext();
    const [intersectionObserver, setIntersectionObserver] = useState<IntersectionObserver | null>(null);

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
    const { colors } = theme;

    // Handle scroll events for direction detection
    const handleScroll = useCallback((event: Event) => {
        const target = event.target as HTMLElement;
        const now = Date.now();
        const minScrollTime = 50;

        if (now - lastScrollTime.current < minScrollTime) {
            return;
        }

        const currentOffset = target.scrollTop;
        const direction = currentOffset > lastOffset.current ? "down" : "up";

        if (Math.abs(currentOffset - lastOffset.current) > 10) {
            onScroll?.(direction);
            lastOffset.current = currentOffset;
            lastScrollTime.current = now;
        }
    }, [onScroll]);

    // Setup intersection observer for viewability tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter(entry => entry.isIntersecting);
                if (visibleEntries.length > 0) {
                    // Find the entry with the highest intersection ratio or the first one
                    const topEntry = visibleEntries.reduce((prev, current) => {
                        return (current.intersectionRatio > prev.intersectionRatio) ? current : prev;
                    });

                    const verseElement = topEntry.target as HTMLElement;
                    const verseNumber = parseInt(verseElement.dataset.verseNumber || '0');

                    if (verseNumber && topVerseRef.current !== verseNumber) {
                        bibleState$.handleCurrentHistoryIndex(verseNumber);
                        topVerseRef.current = verseNumber;
                    }
                }
            },
            {
                threshold: [0.5],
                rootMargin: '0px'
            }
        );

        setIntersectionObserver(observer);

        return () => {
            observer.disconnect();
        };
    }, []);

    // Setup scroll listener
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
            return () => {
                container.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll]);

    // Handle initial scroll to verse
    useEffect(() => {
        if (initialScrollIndex > 0 && containerRef.current) {
            const verseElement = containerRef.current.querySelector(`[data-verse-number="${initialScrollIndex}"]`) as HTMLElement;
            if (verseElement) {
                verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [initialScrollIndex, data]);

    const ListHeader = useCallback(() => {
        return (isHebrewInterlinear || isGreekInterlinear) ? null : (
            <div className="flex flex-row items-center justify-end pr-4 w-full">
                <Icon size={14} name="Timer" color={colors.notification} />
                <p className="text-right" style={{ color: colors.text }}>
                    &nbsp; Tiempo de lectura{" "}
                    {`~ ${bibleState$.readingTimeData[bibleSide].get()} min(s)`}
                </p>
            </div>
        );
    }, [estimatedReadingTime, isHebrewInterlinear, isGreekInterlinear, colors, bibleSide]);

    const LoadingComponent = () => (
        <div className="flex flex-col items-center justify-center p-12" style={{ marginTop: 100 }}>
            <ActivityIndicator />
            <p className="mt-2 text-base" style={{ color: colors.text }}>Cargando...</p>
        </div>
    );


    return (
        <div className="flex items-center justify-center relative">
            <div
                ref={containerRef}
                className="w-full h-full overflow-y-auto"
                style={{
                    width: width,

                    color: colors.text,
                    paddingTop: 70,
                    paddingBottom: 100
                }}
            >
                <ListHeader />

                {data.length > 0 ? (
                    data.map((verse, index) => {
                        const key = `${verse.book_number}-${verse.chapter}-${verse.verse}`;

                        return (isHebrewInterlinear || isGreekInterlinear) && !isSplit ? (
                            <div
                                key={key}
                                data-verse-number={verse.verse}
                                ref={(el) => {
                                    if (el && intersectionObserver) {
                                        intersectionObserver.observe(el);
                                    }
                                }}
                            >
                                {/* <p>{verse.verse}</p> */}
                                <DomInterlinearVerse item={verse} />
                                {/* <InterlinearVerse item={verse} /> */}
                            </div>
                        ) : (
                            <div
                                key={key}
                                data-verse-number={verse.verse}
                                ref={(el) => {
                                    if (el && intersectionObserver) {
                                        intersectionObserver.observe(el);
                                    }
                                }}
                            >
                                <DVerse
                                    item={verse}
                                    isSplit={!!isSplit}
                                    initVerse={initialScrollIndex}
                                    theme={theme}

                                />
                                {/* <DomVerse
                                    item={verse}
                                    isSplit={!!isSplit}
                                    initVerse={initialScrollIndex}
                                    theme={theme}
                                /> */}
                            </div>
                        );
                    })
                ) : (
                    <LoadingComponent />
                )}
            </div>
        </div>
    );
};

export default DomChapter;
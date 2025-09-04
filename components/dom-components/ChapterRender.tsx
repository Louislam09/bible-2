"use dom";

import { bibleState$ } from "@/state/bibleState";
import { IBookVerse, IStrongWord, TTheme } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import "../../global.css";
import DomInterlinearVerse from "../home/content/DomInterlinearVerse";
import Icon from "../Icon";
import DVerse from "./DVerse";

type ChapterRenderProps = {
    width: number;
    data: IBookVerse[];
    isHebrewInterlinear: boolean;
    isGreekInterlinear: boolean;
    isSplit: boolean | undefined;
    initialScrollIndex: number;
    theme: TTheme;
    onStrongWordClicked: ((value: IStrongWord) => void) | undefined
    onScroll: ((direction: "up" | "down") => void) | undefined
    estimatedReadingTime: number;
};

const ChapterRender = ({
    width,
    data,
    isHebrewInterlinear,
    isGreekInterlinear,
    isSplit,
    initialScrollIndex,
    theme,
    onStrongWordClicked,
    onScroll,
    estimatedReadingTime
}: ChapterRenderProps) => {
    const { colors } = theme;
    const topVerseRef = useRef<number | null>(null);
    const [intersectionObserver, setIntersectionObserver] = useState<IntersectionObserver | null>(null);
    const lastScrollTime = useRef(Date.now());
    const lastOffset = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const ListHeader = useCallback(() => {
        return (isHebrewInterlinear || isGreekInterlinear) ? null : (
            <div className="flex flex-row items-center justify-end pr-4 w-full">
                <Icon size={14} name="Timer" color={colors.notification} />
                <p className="text-right" style={{ color: colors.text }}>
                    &nbsp; Tiempo de lectura{" "}
                    {`~ ${estimatedReadingTime} min(s)`}
                </p>
            </div>
        );
    }, [estimatedReadingTime, isHebrewInterlinear, isGreekInterlinear, colors]);

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

    // Handle initial scroll to verse
    useEffect(() => {
        if (initialScrollIndex > 0 && containerRef.current) {
            const verseElement = containerRef.current.querySelector(`[data-verse-number="${initialScrollIndex}"]`) as HTMLElement;
            if (verseElement) {
                verseElement.scrollIntoView({ behavior: 'smooth', block: 'start', });
            }
        }
    }, [initialScrollIndex, data]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
            return () => {
                container.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll]);

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

    const LoadingComponent = () => (
        <div className="flex flex-col items-center justify-center p-12" style={{ marginTop: 100 }}>
            <ActivityIndicator />
            <p className="mt-2 text-base" style={{ color: colors.text }}>Cargando...</p>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto "
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
                            <DomInterlinearVerse item={verse} />
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
                                onStrongWordClicked={onStrongWordClicked}
                            />
                        </div>
                    );
                })
            ) : (
                <LoadingComponent />
            )}
        </div>
    );
};

export default ChapterRender;
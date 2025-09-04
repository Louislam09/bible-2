import Icon from "@/components/Icon";
import { useHaptics } from "@/hooks/useHaptics";
import useVerseActions from "@/hooks/useVerseActions";
import { bibleState$ } from "@/state/bibleState";
import { IBookVerse, IStrongWord, TIcon, TTheme, TVerse } from "@/types";
import {
    extractTextFromParagraph,
    WordTagPair
} from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { use$ } from "@legendapp/state/react";
import React, {
    memo
} from "react";
import { StyleSheet } from "react-native";
import DomRenderTextWithClickableWords from "../home/content/DomRenderTextWithClickableWords";
import DomClickableVerse from "./DomClickableVerse";
import withRenderCount from "../withRenderCount";

type VerseProps = TVerse & {
    isSplit: boolean;
    initVerse: number;
    theme: TTheme;
    onStrongWordClicked?: (value: IStrongWord) => void;
};

type ActionItemProps = {
    index: number;
    action: TIcon;
    theme: TTheme;
    item: IBookVerse;
};

const DVerse: React.FC<VerseProps> = ({ item, isSplit, initVerse, theme, onStrongWordClicked }) => {
    const {
        onPress,
        onVerseLongPress,
        onWordClicked,
        // onStrongWordClicked,
        onNonHightlistedWordClick,
        onCompareClicked,
        onMemorizeVerse,
        onExplainWithAI,
        onInterlinear,
        verseActions,
        verseIsTapped,
        verseShowAction,
        fontSize,
        isFavorite,
        isVerseDoubleTagged,
        isBottom,
        isTop,
    } = useVerseActions({ item: item, isSplit: !!isSplit, initVerse: initVerse });

    return (
        <div
            className="px-8 my-2 cursor-pointer relative overflow-hidden w-full select-none"
            onClick={() => onPress()}
            onContextMenu={(e) => {
                e.preventDefault();
                console.log("context menu or long press");
                onVerseLongPress();
            }}
        >
            {verseIsTapped && (isBottom || isTop) ? (
                <>
                    {isVerseDoubleTagged ? (
                        <DomRenderTextWithClickableWords
                            theme={theme}
                            text={item.text}
                            onWordClick={onWordClicked}
                            verseNumber={`${item.verse} `}
                        />
                    ) : (
                        <span
                            style={{ fontSize, color: theme.colors.text, letterSpacing: 2 }}
                        >
                            <span
                                className="inline-flex items-center justify-start"
                                style={{ color: theme.colors.notification }}
                            >
                                {isFavorite && (
                                    <Icon
                                        size={14}
                                        name="Star"
                                        fillColor="#ffd41d"
                                        color="#ffd41d"
                                        style={{ marginRight: 4 }}
                                    />
                                )}
                                {item.verse}&nbsp;
                            </span>
                            <DomClickableVerse
                                // ref={clickableVerseRef}
                                text={item.text}
                                fontSize={fontSize}
                                theme={theme}
                                verse={item.verse}
                                onWordClick={onStrongWordClicked as any}
                                dom={{
                                    matchContents: true,
                                    scrollEnabled: false,
                                }}
                            />
                        </span>
                    )}
                </>
            ) : (
                <span
                    style={{
                        backgroundColor:
                            verseIsTapped || verseShowAction
                                ? theme.colors.notification + "20"
                                : "transparent",
                        fontSize,
                        color: theme.colors.text,
                        letterSpacing: 2,
                    }}
                >
                    <span
                        className="inline-flex items-center justify-start"
                        style={{ color: theme.colors.notification }}
                    >
                        {isFavorite && (
                            <Icon
                                size={14}
                                name="Star"
                                fillColor="#ffd41d"
                                color="#ffd41d"
                                style={{ marginRight: 4 }}
                            />
                        )}
                        {item.verse}&nbsp;
                    </span>
                    {getVerseTextRaw(item.text)}
                </span>
            )}

            {verseShowAction && (
                <div className={`overflow-x-auto flex gap-3 mt-2 -mx-8 px-8`}>
                    {verseActions.map((action: TIcon, index: number) => (
                        <ActionItem
                            key={index}
                            index={index}
                            action={action}
                            item={item}
                            theme={theme}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ActionItem = memo(({ index, action, theme, item }: ActionItemProps) => {
    const haptics = useHaptics();
    const actionToHide = ["Copy", "NotebookPen", "Sparkles"];
    const lastSelectedItem = use$(() => {
        const selectedVerses = bibleState$.selectedVerses.get();
        return (
            bibleState$.lastSelectedVerse.get()?.verse === item.verse &&
            selectedVerses.has(item.verse)
        );
    });

    const hidden =
        action.hide || (!lastSelectedItem && actionToHide.includes(action.name));

    if (hidden) return null;

    return (
        <button
            onClick={() => {
                action.action();
                haptics.selection();
            }}
            className="flex items-center justify-center flex-col transition-colors"
        >
            <Icon
                size={30}
                name={action.name}
                style={{ color: action.color || theme.colors.text } as any}
            />
            <span className="text-sm" style={{ color: theme.colors.text }}>
                {action.description}
            </span>
        </button>
    );
});

// export default React.memo(DVerse);
export default DVerse;
// export default withRenderCount(DVerse);

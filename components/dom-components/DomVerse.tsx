// "use dom";

// import { View } from "@/components/Themed";
// import { TVerse } from "@/types";

// type VerseProps = TVerse & {
//     initVerse: number;
// };

// const DomVerse: React.FC<VerseProps> = ({ item }) => {
//     return (
//         <div>
//             <p>{item.text}</p>
//         </div>
//     );
// };

// export default DomVerse;

import AiTextScannerAnimation from "@/components/ai/AiTextScannerAnimation";
import DisplayStrongWord from "@/components/DisplayStrongWord";
import Icon from "@/components/Icon";
import { getBookDetail } from "@/constants/BookNames";
import { isDefaultDatabase } from "@/constants/databaseNames";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMemorization } from "@/context/MemorizationContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useHaptics } from "@/hooks/useHaptics";
import useSingleAndDoublePress from "@/hooks/useSingleOrDoublePress";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { IBookVerse, Screens, TIcon, TTheme, TVerse } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { customUnderline } from "@/utils/customStyle";
import {
    extractTextFromParagraph,
    extractWordsWithTags,
    getStrongValue,
    WordTagPair,
} from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

type VerseProps = TVerse & {
    isSplit?: boolean;
    initVerse: number;
    theme: TTheme;
};

type ActionItemProps = {
    index: number;
    action: TIcon;
    item: IBookVerse;
    theme: TTheme;
};

const validStrongList = (arr: WordTagPair[]) => {
    const newArr = [...arr];
    return newArr.map((item, index) => {
        const newItem = item;
        const nextItem = newArr[index + 1];
        if (nextItem && nextItem.word.includes("<S>")) {
            newItem.tagValue = `${newItem.tagValue},${extractTextFromParagraph(
                nextItem?.word
            )}`;
            nextItem.word = "";
        }
        return newItem;
    });
};

const ActionItem = memo(({ index, action, theme, item }: ActionItemProps) => {
    const haptics = useHaptics();
    const lastSelectedItem = use$(() => {
        const selectedVerses = bibleState$.selectedVerses.get();
        return (
            bibleState$.lastSelectedVerse.get()?.verse === item.verse &&
            selectedVerses.has(item.verse)
        );
    });

    const actionToHide = ["Copy", "NotebookPen", "Sparkles"];
    const hidden =
        action.hide || (!lastSelectedItem && actionToHide.includes(action.name));

    return (
        <div
            // className={`flex flex-col items-center transition-all duration-200 transform ${hidden ? "hidden" : "flex"
            //     }`}
            style={{
                // animationDelay: `${index * 100}ms`
            }}
        >
            <button
                style={{
                    backgroundColor: theme.colors.background,
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 4
                    // animationDelay: `${index * 100}ms`
                }}
                onClick={() => {
                    action.action();
                    haptics.selection();
                }}
                className="flex flex-col items-center mx-2"
            >
                <Icon
                    size={30}
                    name={action.name}
                    //   @ts-ignore
                    style={{ color: action.color || theme.colors.text }}
                />
                <span className="text-sm" style={{ color: theme.colors.text }}>
                    {action.description}
                </span>
            </button>
        </div>
    );
});

const DomVerse: React.FC<VerseProps> = ({ item, isSplit, initVerse, theme }) => {
    const { toggleFavoriteVerse } = useBibleContext();
    const haptics = useHaptics();
    const fontSize = use$(() => storedData$.fontSize.get());
    const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
    // const { addVerse } = useMemorization();
    // const { theme } = useMyTheme();
    const [isFavorite, setFavorite] = useState(false);
    const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
    const wordAndStrongValue = extractWordsWithTags(item.text);
    const googleAIKey = use$(() => storedData$.googleAIKey.get());
    const isDefaultDb = isDefaultDatabase(currentBibleVersion);

    // LEGEND STATE
    const verseIsTapped = use$(() => item.verse === bibleState$.currentVerse.get());
    const verseWithAiAnimation = use$(
        () => item.verse === bibleState$.verseWithAiAnimation.get()
    );
    const verseShowAction = use$(() =>
        bibleState$.selectedVerses.get().has(item.verse)
    );
    const links = use$(() =>
        bibleState$.bibleData[isSplit ? "bottomLinks" : "topLinks"].get()
    );
    const verseLink = links?.filter((link) => link.verse === item.verse);

    useEffect(() => {
        setFavorite(!!item.is_favorite);
    }, [item]);

    const onVerseClicked = useCallback(() => {
        const isActionMode = bibleState$.selectedVerses.get().size > 0;
        if (isActionMode) {
            bibleState$.handleLongPressVerse(item);
        } else {
            bibleState$.handleTapVerse(item);
        }
        bibleState$.isBottomBibleSearching.set(!!isSplit);
        haptics.selection();
    }, [item, isSplit]);

    const onPress = useSingleAndDoublePress({
        onDoublePress: () => bibleState$.handleDoubleTapVerse(item),
        onSinglePress: onVerseClicked,
        delay: 200,
    });

    const verseActions: TIcon[] = useMemo(
        () => [
            { name: "Copy", action: async () => await copyToClipboard(item), description: "Copiar" },
            {
                name: "BookType",
                action: () => { },
                description: "Interlinear",
                color: "#f79c67",
                hide: !isDefaultDb,
            },
            { name: "Sparkles", action: () => { }, description: "Explicar", color: "#f1c40f" },
            { name: "Quote", action: () => { }, description: "Cita", color: "#CDAA7D" },
            { name: "NotebookPen", action: () => { }, description: "Anotar", color: theme.colors.notification },
            {
                name: isFavorite ? "Star" : "StarOff",
                action: () => setFavorite((p) => !p),
                description: "Favorito",
                color: isFavorite ? theme.colors.notification : "#fedf75",
            },
        ],
        [isFavorite, item]
    );

    // const verseColor = `text-[${theme.colors.notification}]`;
    // console.log({ notification: theme.colors.notification })
    return (
        <div
            className="px-8 py-2 cursor-pointer"
            onClick={onPress}
            onContextMenu={(e) => {
                e.preventDefault();
                bibleState$.handleLongPressVerse(item);
                haptics.impact.medium();
            }}
        >
            {/* {item.subheading && (
        <VerseTitle
          isSplit={isSplit}
          subheading={item.subheading}
          links={verseLink?.[0]?.subheading}
        />
      )} */}

            <p
                className={`leading-relaxed ${verseIsTapped || verseShowAction
                    ? ""
                    : "bg-transparent"
                    }`}
                style={{ fontSize }}
            >
                <span className={`text-[${theme.colors.notification}] font-bold`}>{item.verse} </span>
                {getVerseTextRaw(item.text)}
            </p>
            {verseShowAction && (
                <div
                    style={{
                        display: 'flex', gap: 2, overflow: 'hidden', marginTop: 8,
                        backgroundColor: 'transparent'
                    }}
                >
                    {verseActions.map((action, index) => (
                        <ActionItem key={index} index={index} action={action} item={item} theme={theme} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default (DomVerse);

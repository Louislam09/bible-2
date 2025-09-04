"use dom";
import AiTextScannerAnimation from "@/components/ai/AiTextScannerAnimation";
import DisplayStrongWord from "@/components/DisplayStrongWord";
import Icon from "@/components/Icon";
import { getBookDetail } from "@/constants/BookNames";
import { isDefaultDatabase } from "@/constants/databaseNames";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMemorization } from "@/context/MemorizationContext";
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
import "../../global.css";

import DomClickableVerse, { type DomClickableVerseRef } from "@/components/dom-components/DomClickableVerse";
import DomVerseTitle from "@/components/dom-components/DomVerseTitle";
import RenderTextWithClickableWords from "@/components/home/content/RenderTextWithClickableWords";
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { Alert, Dimensions } from "react-native";
import DomRenderTextWithClickableWords from "../home/content/DomRenderTextWithClickableWords";

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
    const actionToHide = ["Copy", "NotebookPen", "Sparkles"];
    const lastSelectedItem = use$(() => {
        const selectedVerses = bibleState$.selectedVerses.get();
        return (
            bibleState$.lastSelectedVerse.get()?.verse === item.verse &&
            selectedVerses.has(item.verse)
        );
    });

    const hidden = action.hide || (!lastSelectedItem && actionToHide.includes(action.name));

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

const DomVerse: React.FC<VerseProps> = ({ item, isSplit = false, initVerse, theme }) => {
    const { toggleFavoriteVerse } = useBibleContext();
    const haptics = useHaptics();
    const router = useRouter();
    // const { addVerse } = useMemorization();
    const addVerse = ({ }: any, version: string) => { };

    const fontSize = use$(() => storedData$.fontSize.get());
    const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
    const googleAIKey = use$(() => storedData$.googleAIKey.get());

    const [isFavorite, setFavorite] = useState(false);
    const [verseHeight, setVerseHeight] = useState(0);

    // Ref for the enhanced DOM clickable verse component
    const clickableVerseRef = useRef<DomClickableVerseRef>(null);
    const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
    const wordAndStrongValue = extractWordsWithTags(item.text);
    const isDefaultDb = isDefaultDatabase(currentBibleVersion);

    // LEGEND STATE
    const isBottomBibleSearching = use$(
        () => item.verse === bibleState$.currentVerse.get() &&
            bibleState$.isBottomBibleSearching.get()
    );
    const verseIsTapped = use$(() => item.verse === bibleState$.currentVerse.get());
    const verseWithAiAnimation = use$(
        () => item.verse === bibleState$.verseWithAiAnimation.get()
    );
    const isVerseDoubleTagged = use$(
        () => item.verse === bibleState$.currentVerse.get() &&
            bibleState$.isVerseDoubleTagged.get()
    );
    const verseShowAction = use$(() => bibleState$.selectedVerses.get().has(item.verse));
    const links = use$(() =>
        bibleState$.bibleData[isSplit ? "bottomLinks" : "topLinks"].get()
    );
    const verseLink = links?.filter((link) => link.verse === item.verse);

    const isBottom = isSplit && isBottomBibleSearching;
    const isTop = !isSplit && !isBottomBibleSearching;

    const hasTitle = useMemo(
        () => item.subheading && !item.subheading?.includes(null as any),
        [item]
    );

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
    }, [item, isSplit, haptics]);

    const onPress = useSingleAndDoublePress({
        onDoublePress: () => bibleState$.handleDoubleTapVerse(item),
        onSinglePress: onVerseClicked,
        delay: 200,
    });

    const onVerseLongPress = useCallback(() => {
        bibleState$.handleLongPressVerse(item);
        haptics.impact.medium();
    }, [item, haptics]);

    // ACTION HANDLERS
    const onFavorite = async () => {
        await toggleFavoriteVerse({
            bookNumber: item?.book_number,
            chapter: item.chapter,
            verse: item.verse,
            isFav: isFavorite,
        });
        setFavorite((prev) => !prev);
        bibleState$.clearSelection();
    };

    const onCopy = async () => {
        const highlightedVerses = Array.from(
            bibleState$.selectedVerses.get().values()
        ).sort((a, b) => a.verse - b.verse);
        await copyToClipboard(highlightedVerses);
        bibleState$.clearSelection();
    };

    const onVerseToNote = async () => {
        const shouldReturn = true;
        const isMoreThanOneHighted = bibleState$.selectedVerses.get().size > 1;
        const highlightedVerses = Array.from(
            bibleState$.selectedVerses.get().values()
        ).sort((a, b) => a.verse - b.verse);
        const value = isMoreThanOneHighted ? highlightedVerses : item;
        const verseToAdd = (await copyToClipboard(value, shouldReturn)) as string;
        bibleState$.handleSelectVerseForNote(verseToAdd);
        bibleState$.clearSelection();
        if (!bibleState$.currentNoteId.get()) bibleState$.openNoteListBottomSheet();
    };

    const onQuote = () => {
        const verseText = getVerseTextRaw(item.text);
        const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter}:${item.verse}`;
        bibleState$.handleSelectVerseForNote(verseText);
        router.push({ pathname: "/quote", params: { text: verseText, reference } });
    };

    const onWordClicked = useCallback((word: string, strongNumber: string) => {
        haptics.impact.light();
        const NT_BOOK_NUMBER = 470;
        const cognate = item?.book_number < NT_BOOK_NUMBER ? "H" : "G";
        const searchCode = `${cognate}${strongNumber}`;

        const value = {
            text: word.replace(/[.,;]/g, ""),
            code: searchCode,
        };

        bibleState$.handleStrongWord(value);
        modalState$.openStrongSearchBottomSheet();
    }, [item, haptics]);

    const onStrongWordClicked = useCallback(({ word, tagValue }: WordTagPair) => {
        haptics.impact.light();
        const NT_BOOK_NUMBER = 470;
        const cognate = item?.book_number < NT_BOOK_NUMBER ? "H" : "G";

        const addCognate = (tagValue: string) =>
            tagValue
                .split(",")
                .map((code) => `${cognate}${code}`)
                .join(",");

        const searchCode = addCognate(tagValue || "");
        const value = {
            text: word.replace(/[.,;]/g, ""),
            code: searchCode,
        };
        bibleState$.handleStrongWord(value);
        modalState$.openStrongSearchBottomSheet();
    }, [item, haptics]);

    const onNonHightlistedWordClick = useCallback(({ word }: WordTagPair) => {
        haptics.impact.light();
        if (word.length < 3) return;
        modalState$.openDictionaryBottomSheet(word);
    }, [haptics]);

    const onNonHighlightedWordClickSimple = useCallback((word: string) => {
        haptics.impact.light();
        if (word.length < 3) return;
        modalState$.openDictionaryBottomSheet(word.replace(/[.,;]/g, ""));
    }, [haptics]);

    // Native actions for the DOM component
    const handleDomWordClick = useCallback(async (
        word: string,
        strongNumber: string,
        context: { verse: string; position: number }
    ) => {
        haptics.impact.light();
        const NT_BOOK_NUMBER = 470;
        const cognate = item?.book_number < NT_BOOK_NUMBER ? "H" : "G";
        const searchCode = `${cognate}${strongNumber}`;

        const value = {
            text: word.replace(/[.,;]/g, ""),
            code: searchCode,
        };

        console.log(`Word clicked: "${word}", Strong's Number: ${strongNumber}, Position: ${context.position}`);

        bibleState$.handleStrongWord(value);
        modalState$.openStrongSearchBottomSheet();
    }, [item?.book_number, haptics]);

    const onCompareClicked = () => {
        bibleState$.verseToCompare.set(item.verse);
        modalState$.openCompareBottomSheet();
        bibleState$.clearSelection();
    };

    const onMemorizeVerse = (text: string) => {
        addVerse(text, currentBibleVersion);
        bibleState$.clearSelection();
    };

    const onExplainWithAI = () => {
        if (!googleAIKey) {
            Alert.alert("Aviso", "No se ha configurado la API key de Google AI", [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Configurar",
                    onPress: () => router.push(Screens.AISetup),
                },
            ]);
            return;
        }
        const verseText = getVerseTextRaw(item.text);
        const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter}:${item.verse}`;

        bibleState$.handleVerseWithAiAnimation(item.verse);
        bibleState$.handleVerseToExplain({ text: verseText, reference });
        modalState$.closeExplainVerseBottomSheet();
        bibleState$.clearSelection();
    };

    const onInterlinear = () => {
        const currentInterlinear = bibleState$.bibleData.interlinearVerses.get()?.[item.verse - 1];

        bibleState$.handleVerseToInterlinear({
            book_number: item?.book_number,
            chapter: item.chapter,
            verse: item.verse,
            text: currentInterlinear?.text || "",
        });
        modalState$.openInterlinealBottomSheet();
    };

    const verseActions: TIcon[] = useMemo(() => [
        {
            name: "Copy",
            action: onCopy,
            hide: false,
            description: "Copiar",
        },
        {
            name: "BookType",
            action: onInterlinear,
            description: "Interlinear",
            color: "#f79c67",
            hide: !isDefaultDb,
        },
        {
            name: "Sparkles",
            action: onExplainWithAI,
            description: "Explicar",
            color: "#f1c40f",
        },
        {
            name: "Quote",
            action: onQuote,
            hide: false,
            description: "Cita",
            color: "#CDAA7D",
        },
        {
            name: "NotebookPen",
            action: onVerseToNote,
            hide: false,
            description: "Anotar",
            color: theme.colors.notification,
        },
        {
            name: isFavorite ? "Star" : "StarOff",
            action: onFavorite,
            color: isFavorite ? theme.colors.notification : "#fedf75",
            hide: false,
            description: "Favorito",
        },
        {
            name: "Brain",
            action: () =>
                onMemorizeVerse(
                    `${getBookDetail(item?.book_number).longName} ${item?.chapter}:${item?.verse}`
                ),
            color: "#f1abab",
            hide: false,
            description: "Memorizar",
        },
        {
            name: "FileDiff",
            action: onCompareClicked,
            hide: bibleState$.isSplitActived.get(),
            description: "Comparar",
        },
    ] as TIcon[], [
        verseIsTapped,
        isFavorite,
        item,
        isDefaultDb,
        theme.colors.notification,
        bibleState$.isSplitActived.get(),
    ]);

    const onDoubleWordClicked = (code: string) => {
        haptics.impact.light();
        const isWordName = isNaN(+code);
        const wordIndex = isWordName
            ? textValue.indexOf(code)
            : strongValue.indexOf(code);

        const word = textValue[wordIndex];
        const secondCode =
            textValue[wordIndex + 1] === "-" ? strongValue[wordIndex + 1] : "";

        const isDash = word === "-" ? -1 : 0;
        const NT_BOOK_NUMBER = 470;
        const cognate = item?.book_number < NT_BOOK_NUMBER ? "H" : "G";
        const searchCode = isWordName
            ? `${cognate}${strongValue[wordIndex]}`
            : `${cognate}${code}`;
        const secondSearchCode = secondCode ? `,${cognate}${secondCode}` : ",";
        const searchWord = textValue[wordIndex + isDash] ?? searchCode;

        const value = {
            text: searchWord,
            code: searchCode.concat(secondSearchCode),
        };

        bibleState$.handleStrongWord(value);
        modalState$.openStrongSearchBottomSheet();
    }

    return (
        <div
            className="px-8 py-2 cursor-pointer relative overflow-hidden w-full select-none"
            style={{
                backgroundColor: (verseIsTapped || verseShowAction) ?
                    theme.colors.notification + '20' : 'transparent',
                margin: '4px 0',
            }}
            onClick={onPress}
            onContextMenu={(e) => {
                e.preventDefault();
                onVerseLongPress();
            }}
        >
            {hasTitle && (
                <DomVerseTitle
                    isSplit={isSplit}
                    theme={theme}
                    subheading={item.subheading}
                    links={verseLink?.[0]?.subheading}
                />
            )}

            {verseWithAiAnimation ? (
                <div className="flex items-start justify-start">
                    {/* <AiTextScannerAnimation
                        noTitle
                        verse={`${item.verse} ${getVerseTextRaw(item.text)}`}
                        fontSize={fontSize}
                        theme={theme}
                        style={{ alignItems: "flex-start", justifyContent: "flex-start" }}
                    /> */}
                </div>
            ) : (
                <p className="leading-relaxed relative" style={{ letterSpacing: 2 }} >
                    {/* HIGHLIGHT */}
                    {verseIsTapped && (isBottom || isTop) ? (
                        <>
                            {isVerseDoubleTagged ? (
                                <DomRenderTextWithClickableWords
                                    theme={theme}
                                    text={item.text}
                                    onWordClick={onDoubleWordClicked}
                                    verseNumber={`${item.verse} `}
                                />
                            ) : (
                                <span style={{ fontSize, color: theme.colors.text, letterSpacing: 2 }}>
                                    <span className="inline-flex items-center justify-start" style={{ color: theme.colors.notification }} >
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
                                        ref={clickableVerseRef}
                                        text={item.text}
                                        fontSize={fontSize}
                                        theme={theme}
                                        verse={item.verse}
                                        onWordClick={handleDomWordClick}
                                        dom={{
                                            matchContents: true,
                                            scrollEnabled: false
                                        }}
                                    />
                                </span>
                            )}
                        </>
                    ) : (
                        <span style={{ fontSize, color: theme.colors.text, letterSpacing: 2 }}>
                            <span className="inline-flex items-center justify-start" style={{ color: theme.colors.notification }} >
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
                </p>
            )}

            {(verseShowAction) && (
                <div className={`overflow-x-auto flex gap-3 mt-2 -mx-8 px-8 border border-red-500`}>
                    {verseActions.map((action: TIcon, index) => (
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

export default DomVerse;

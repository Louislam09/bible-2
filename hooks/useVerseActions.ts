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
import { IBookVerse, IFavoriteVerse, Screens, TIcon, TVerse } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import {
    extractTextFromParagraph,
    extractWordsWithTags,
    getStrongValue,
    WordTagPair,
} from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {
    Alert
} from "react-native";

type VerseProps = TVerse & {
    isSplit: boolean;
    initVerse: number;
    onInterlinear?: (item: IBookVerse) => void;
    onAnotar?: (item: IBookVerse) => void;
    onMemorizeVerse?: (verse: string, version: string) => void;
    onFavoriteVerse?: ({ bookNumber, chapter, verse, isFav, }: IFavoriteVerse) => Promise<void>
};


const useVerseActions = ({ item, isSplit, initVerse, onInterlinear: externalOnInterlinear, onAnotar: externalOnAnotar,onMemorizeVerse: externalOnMemorizeVerse, onFavoriteVerse: externalOnFavoriteVerse }: VerseProps) => {
    const router = useRouter();
    const haptics = useHaptics();

    const fontSize = use$(() => storedData$.fontSize.get());
    const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
    const theme = { colors: { notification: "#fedf75" } };
    const [isFavorite, setFavorite] = useState(false);
    const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
    const wordAndStrongValue = extractWordsWithTags(item.text);
    const googleAIKey = use$(() => storedData$.googleAIKey.get());
    const isDefaultDb = isDefaultDatabase(currentBibleVersion);
    const modalState = use$(() => modalState$.strongSearchRef.get());

    // LEGEND STATE
    const isBottomBibleSearching = use$(
        () =>
            item.verse === bibleState$.currentVerse.get() &&
            bibleState$.isBottomBibleSearching.get()
    );
    const verseIsTapped = use$(
        () => item.verse === bibleState$.currentVerse.get()
    );
    const verseWithAiAnimation = use$(
        () => item.verse === bibleState$.verseWithAiAnimation.get()
    );
    const isVerseDoubleTagged = use$(
        () =>
            item.verse === bibleState$.currentVerse.get() &&
            bibleState$.isVerseDoubleTagged.get()
    );
    const verseShowAction = use$(() => {
        const selectedVerses = bibleState$.selectedVerses.get();
        return selectedVerses.has(item.verse);
    });
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
    }, [item, verseIsTapped, isSplit]);

    const onPress = useSingleAndDoublePress({
        onDoublePress: () => {
            bibleState$.handleDoubleTapVerse(item);
        },
        onSinglePress: onVerseClicked,
        delay: 200,
    });

    const onVerseLongPress = useCallback(() => {
        bibleState$.handleLongPressVerse(item);
        haptics.impact.medium();
    }, [item]);

    const onFavorite = async () => {
        await externalOnFavoriteVerse?.({
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
        const value = highlightedVerses;
        await copyToClipboard(value);
        bibleState$.clearSelection();
    };

    const onVerseToNote = async () => {
        if (externalOnAnotar) {
            externalOnAnotar(item);
            return;
        }

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
        const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter
            }:${item.verse}`;
        bibleState$.handleSelectVerseForNote(verseText);
        router.push({ pathname: "/quote", params: { text: verseText, reference } });
    };

    const onWordClicked = (code: string) => {
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
    };

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
    }, [item, haptics, modalState])

    const onNonHightlistedWordClick = ({ word }: WordTagPair) => {
        haptics.impact.light();
        if (word.length < 3) {
            return;
        }
        modalState$.openDictionaryBottomSheet(word);
    };

    const onMemorizeVerse = useCallback((text: string) => {
        externalOnMemorizeVerse?.(text, currentBibleVersion);
        bibleState$.clearSelection();
    }, [externalOnMemorizeVerse, currentBibleVersion]);

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
        const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter
            }:${item.verse}`;

        bibleState$.handleVerseWithAiAnimation(item.verse);
        bibleState$.handleVerseToExplain({ text: verseText, reference });
        modalState$.closeExplainVerseBottomSheet();
        bibleState$.clearSelection();
    };


    const onInterlinear = () => {
        if (externalOnInterlinear) {
            externalOnInterlinear(item);
            return;
        }

        const currentInterlinear =
            bibleState$.bibleData.interlinearVerses.get()?.[item.verse - 1];

        bibleState$.handleVerseToInterlinear({
            book_number: item?.book_number,
            chapter: item.chapter,
            verse: item.verse,
            text: currentInterlinear?.text || "",
        });
        modalState$.openInterlinealBottomSheet();
    };

    const verseActions: TIcon[] = useMemo(() => {
        return [
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
                hide: true,
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
                        `${getBookDetail(item?.book_number).longName} ${item?.chapter}:${item?.verse
                        }`
                    ),
                color: "#f1abab",
                hide: false,
                description: "Memorizar",
            },
        ] as TIcon[];
    }, [verseIsTapped, isFavorite, item]);

    return {
        // ACTION HANDLERS
        onPress,
        onVerseLongPress,
        onFavorite,
        onCopy,
        onVerseToNote,
        onQuote,
        onWordClicked,
        onStrongWordClicked,
        onNonHightlistedWordClick,
        onMemorizeVerse,
        onExplainWithAI,
        onInterlinear,

        // STATE
        verseActions,
        item, wordAndStrongValue,
        isSplit,
        initVerse,
        theme,
        isFavorite,
        isBottom,
        isTop,
        hasTitle,
        verseWithAiAnimation,
        isVerseDoubleTagged,
        verseShowAction,
        verseLink,
        isBottomBibleSearching,
        verseIsTapped,
        googleAIKey,
        isDefaultDb,
        fontSize,
        currentBibleVersion,
    }
};

export default useVerseActions;

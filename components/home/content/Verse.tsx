import AiTextScannerAnimation from "@/components/ai/AiTextScannerAnimation";
import DisplayStrongWord from "@/components/DisplayStrongWord";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { getBookDetail } from "@/constants/BookNames";
import { isDefaultDatabase } from "@/constants/databaseNames";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMemorization } from "@/context/MemorizationContext";
import { useMyTheme } from "@/context/ThemeContext";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import RenderTextWithClickableWords from "./RenderTextWithClickableWords";
import VerseTitle from "./VerseTitle";
import { useHaptics } from "@/hooks/useHaptics";

type VerseProps = TVerse & {
  isSplit: boolean;
  initVerse: number;
};

type ActionItemProps = {
  index: number;
  action: TIcon;
  styles: any;
  theme: any;
  item: IBookVerse;
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

const ActionItem = memo(
  ({ index, action, styles, theme, item }: ActionItemProps) => {
    const haptics = useHaptics();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateXAnim = useRef(new Animated.Value(300)).current;
    const actionToHide = ["Copy", "NotebookPen", "Sparkles"];
    const lastSelectedItem = use$(() => {
      const selectedVerses = bibleState$.selectedVerses.get();
      return (
        bibleState$.lastSelectedVerse.get()?.verse === item.verse &&
        selectedVerses.has(item.verse)
      );
    });

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: 100,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, translateXAnim, index]);

    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim }],
          },
          { flexDirection: "row", marginVertical: 5, marginHorizontal: 5 },
        ]}
      >
        <Pressable
          onPress={() => {
            action.action();
            haptics.selection();
          }}
          style={[
            {
              display: "flex",
              alignItems: "center",
            },
            (action.hide ||
              (!lastSelectedItem && actionToHide.includes(action.name))) && {
              display: "none",
            },
          ]}
        >
          <Icon
            size={30}
            name={action.name}
            style={[styles.icon, action.color && { color: action.color }]}
          />
          <Text style={{ color: theme.colors.text }}>
            {action?.description}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }
);

const Verse: React.FC<VerseProps> = ({ item, isSplit, initVerse }) => {
  const { toggleFavoriteVerse } = useBibleContext();
  const haptics = useHaptics();

  const fontSize = use$(() => storedData$.fontSize.get());
  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
  const { addVerse } = useMemorization();
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isFavorite, setFavorite] = useState(false);
  const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
  const verseRef = useRef<any>(null);
  const wordAndStrongValue = extractWordsWithTags(item.text);
  const googleAIKey = use$(() => storedData$.googleAIKey.get());
  const isDefaultDb = isDefaultDatabase(currentBibleVersion);
  const NT_BOOK_NUMBER = 470;
  const isNewTestament = item?.book_number >= NT_BOOK_NUMBER || !isDefaultDb;

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
    haptics.selection();
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
    const value = highlightedVerses;
    await copyToClipboard(value);
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
    const reference = `${getBookDetail(item?.book_number).longName} ${
      item.chapter
    }:${item.verse}`;
    bibleState$.handleSelectVerseForNote(verseText);
    router.push({ pathname: "/quote", params: { text: verseText, reference } });
  };

  const onWordClicked = (code: string) => {
    console.log("code", code);
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

  const onStrongWordClicked = ({ word, tagValue }: WordTagPair) => {
    console.log("word", word);
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
  };

  const onNonHightlistedWordClick = ({ word }: WordTagPair) => {
    haptics.impact.light();
    if (word.length < 3) {
      return;
    }
    modalState$.openDictionaryBottomSheet(word);
  };

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
    const reference = `${getBookDetail(item?.book_number).longName} ${
      item.chapter
    }:${item.verse}`;

    bibleState$.handleVerseWithAiAnimation(item.verse);
    bibleState$.handleVerseToExplain({ text: verseText, reference });
    modalState$.closeExplainVerseBottomSheet();
    bibleState$.clearSelection();
  };

  const router = useRouter();

  const onInterlinear = () => {
    const currentInterlinear =
      bibleState$.bibleData.interlinearVerses.get()?.[item.verse - 1];
    // const mergeText = mergeTexts(item.text, currentInterlinear?.text || "");

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
        hide: isNewTestament,
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
            `${getBookDetail(item?.book_number).longName} ${item?.chapter}:${
              item?.verse
            }`
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
    ] as TIcon[];
  }, [verseIsTapped, isFavorite, item, isNewTestament]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onVerseLongPress}
      style={styles.verseContainer}
      ref={verseRef}
    >
      {hasTitle && (
        <VerseTitle
          isSplit={isSplit}
          key={item.verse}
          subheading={item.subheading}
          links={verseLink?.[0]?.subheading}
        />
      )}

      {verseWithAiAnimation ? (
        <AiTextScannerAnimation
          noTitle
          verse={`${item.verse} ${getVerseTextRaw(item.text)}`}
          fontSize={fontSize}
          theme={theme}
          style={styles.aiTextScannerAnimation}
        />
      ) : (
        <Text
          style={[
            styles.verse,
            (verseIsTapped || verseShowAction) && styles.highlightCopy,
          ]}
        >
          {/* HIGHLIGHT */}
          {verseIsTapped && (isBottom || isTop) ? (
            <>
              {isVerseDoubleTagged ? (
                <RenderTextWithClickableWords
                  theme={theme}
                  text={item.text}
                  onWordClick={onWordClicked}
                  verseNumber={`${item.verse} `}
                />
              ) : (
                <>
                  <DisplayStrongWord
                    data={validStrongList(wordAndStrongValue)}
                    highlightStyle={{
                      color: theme.colors.notification,
                      backgroundColor: theme?.colors.notification + "30",
                      fontSize,
                      letterSpacing: 2,
                    }}
                    nonHightlistedStyle={{
                      fontSize,
                      ...customUnderline,
                      letterSpacing: 2,
                    }}
                    style={[styles.verseBody, { fontSize }]}
                    onWordClick={onStrongWordClicked}
                    onNonHightlistedWordClick={onNonHightlistedWordClick}
                  />
                </>
              )}
            </>
          ) : (
            <Text style={[styles.verseBody, { fontSize }]}>
              <Text
                onPress={() => console.log("this is working", item.verse)}
                style={[styles.verseNumber, { fontSize }]}
              >
                {isFavorite && (
                  <Icon
                    size={14}
                    name="Star"
                    fillColor="#ffd41d"
                    color="#ffd41d"
                  />
                )}
                &nbsp;{item.verse}&nbsp;
              </Text>
              {getVerseTextRaw(item.text)}
            </Text>
          )}
        </Text>
      )}

      {/* ACTIONS */}
      {verseShowAction && (
        <ScrollView
          horizontal
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "flex-end",
          }}
          style={styles.verseAction}
        >
          {verseActions.map((action: TIcon, index) => (
            <ActionItem
              key={index}
              {...{ index, action, styles, theme, item }}
            />
          ))}
        </ScrollView>
      )}
    </Pressable>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    verseContainer: {},
    aiTextScannerAnimation: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    estimatedContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: 10,
    },
    estimatedText: {
      textAlign: "right",
    },
    verse: {
      position: "relative",
      paddingHorizontal: 25,
      marginVertical: 4,
    },
    verseNumber: {
      color: colors.notification,
      lineHeight: 20,
      position: "relative",
    },
    verseBody: {
      color: colors.text,
      letterSpacing: 2,
      // width: "100%",
      // borderWidth: 1,
      // borderColor: "blue",
    },
    highlightCopy: {
      backgroundColor: colors.notification + "20",
    },
    verseAction: {
      display: "flex",
      flexDirection: "row",
      borderRadius: 10,
      paddingHorizontal: 10,
      alignSelf: "flex-end",
      gap: 2,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 15,
      color: colors.text,
      fontSize: 28,
    },
  });

export default React.memo(Verse);
// export default withRenderCount(BibleTop);

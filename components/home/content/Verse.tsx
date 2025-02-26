import DisplayStrongWord from "@/components/DisplayStrongWord";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import Walkthrough from "@/components/Walkthrough";
import { getBookDetail } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { useMemorization } from "@/context/MemorizationContext";
import useSingleAndDoublePress from "@/hooks/useSingleOrDoublePress";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { tourState$ } from "@/state/tourState";
import { IBookVerse, TIcon, TTheme, TVerse } from "@/types";
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
import { useTheme } from "@react-navigation/native";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import RenderTextWithClickableWords from "./RenderTextWithClickableWords";
import VerseTitle from "./VerseTitle";

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
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateXAnim = useRef(new Animated.Value(300)).current;
    const actionToHide = ["Copy", "NotebookPen"];
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
          onPress={action.action}
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
  // console.log("🆚", item.verse, isSplit ? "🔽" : "🔝");
  const { currentBibleVersion, fontSize, toggleFavoriteVerse } =
    useBibleContext();

  const { addVerse } = useMemorization();
  const theme = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isFavorite, setFavorite] = useState(false);
  const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
  const verseRef = useRef<any>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const animatedVerseHighlight = useRef(new Animated.Value(0)).current;
  const wordAndStrongValue = extractWordsWithTags(item.text);

  // LEGEND STATE
  const isBottomBibleSearching = use$(
    () =>
      item.verse === bibleState$.currentVerse.get() &&
      bibleState$.isBottomBibleSearching.get()
  );
  const verseIsTapped = use$(
    () => item.verse === bibleState$.currentVerse.get()
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

  const isBottom = isSplit && isBottomBibleSearching;
  const isTop = !isSplit && !isBottomBibleSearching;

  const hasTitle = useMemo(
    () => !item.subheading.includes(null as any),
    [item]
  );

  const initHighLightedVerseAnimation = () => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedVerseHighlight, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(animatedVerseHighlight, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
      { iterations: 2 }
    );
    loopAnimation.start();
  };

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
  }, [item]);

  const onFavorite = async () => {
    await toggleFavoriteVerse({
      bookNumber: item.book_number,
      chapter: item.chapter,
      verse: item.verse,
      isFav: isFavorite,
    });
    setFavorite((prev) => !prev);
    bibleState$.clearSelection();
  };

  const onCopy = async () => {
    const isMoreThanOneHighted = bibleState$.selectedVerses.get().size > 1;
    const highlightedVerses = Array.from(
      bibleState$.selectedVerses.get().values()
    ).sort((a, b) => a.verse - b.verse);
    const value = isMoreThanOneHighted ? highlightedVerses : item;
    await copyToClipboard(value);
    bibleState$.clearSelection();
  };

  const addVerseToNote = async () => {
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

  const onWordClicked = (code: string) => {
    const isWordName = isNaN(+code);
    const wordIndex = isWordName
      ? textValue.indexOf(code)
      : strongValue.indexOf(code);

    const word = textValue[wordIndex];
    const secondCode =
      textValue[wordIndex + 1] === "-" ? strongValue[wordIndex + 1] : "";

    const isDash = word === "-" ? -1 : 0;
    const NT_BOOK_NUMBER = 470;
    const cognate = item.book_number < NT_BOOK_NUMBER ? "H" : "G";
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
    const NT_BOOK_NUMBER = 470;
    const cognate = item.book_number < NT_BOOK_NUMBER ? "H" : "G";

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

  const verseActions: TIcon[] = useMemo(() => {
    return [
      {
        name: "Copy",
        action: onCopy,
        hide: false,
        description: "Copiar",
      },
      {
        name: "NotebookPen",
        action: addVerseToNote,
        hide: false,
        description: "Anotar",
      },
      {
        name: isFavorite ? "Star" : "StarOff",
        action: onFavorite,
        color: isFavorite ? theme.colors.notification : "",
        hide: false,
        description: "Favorito",
      },
      {
        name: "Brain",
        action: () =>
          onMemorizeVerse(
            `${getBookDetail(item.book_number).longName} ${item?.chapter}:${
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
  }, [verseIsTapped, isFavorite]);

  const steps = [
    {
      text: "Paso 1: 🔍 Haz un toque en cualquier versículo para activar la búsqueda en el original.",
      target: verseRef,
      action: () => {
        onVerseClicked();
      },
    },
    {
      text: "Paso 2: 👀 Observarás cómo algunas palabras cambian de color.",
      target: verseRef,
      action: () =>
        onStrongWordClicked({ word: "principio", tagValue: "7225" }),
    },
    {
      text: "Paso 3: 📘 Cuando toques cualquier palabra resaltada, verás su significado en el original.",
      target: null,
    },
  ];

  const bgVerseHighlight = animatedVerseHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", `${theme.colors.notification + "20"}`],
  });

  return (
    <View
      onLayout={() => {
        if (initVerse === item.verse) initHighLightedVerseAnimation();
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onVerseLongPress}
        activeOpacity={0.9}
        style={styles.verseContainer}
        ref={verseRef}
      >
        {hasTitle && (
          <VerseTitle
            isSplit={isSplit}
            key={item.verse}
            subheading={item.subheading}
          />
        )}

        <Animated.Text
          style={[
            styles.verse,
            // styledVerseHighlight,
            (verseIsTapped || verseShowAction) && styles.highlightCopy,
            { fontSize, backgroundColor: bgVerseHighlight },
          ]}
          aria-selected
          selectable={false}
          selectionColor={theme.colors.notification || "white"}
        >
          <Text style={[styles.verseNumber]}>
            {isFavorite && (
              <MaterialCommunityIcons size={14} name="star" color="#ffd41d" />
            )}
            &nbsp;{item.verse}&nbsp;
          </Text>

          {/* HIGHLIGHT */}
          {verseIsTapped && (isBottom || isTop) ? (
            <>
              {isVerseDoubleTagged ? (
                <RenderTextWithClickableWords
                  theme={theme}
                  text={item.text}
                  onWordClick={onWordClicked}
                />
              ) : (
                <DisplayStrongWord
                  data={validStrongList(wordAndStrongValue)}
                  highlightStyle={{
                    color: theme.colors.notification,
                    backgroundColor: theme?.colors.notification + "30",
                    fontSize,
                  }}
                  nonHightlistedStyle={{
                    fontSize,
                    ...customUnderline,
                  }}
                  style={[styles.verseBody]}
                  onWordClick={onStrongWordClicked}
                  onNonHightlistedWordClick={onNonHightlistedWordClick}
                />
              )}
            </>
          ) : (
            <Text style={styles.verseBody}>{getVerseTextRaw(item.text)}</Text>
          )}
        </Animated.Text>

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
      </TouchableOpacity>
      {tourState$.tourPopoverVisible.get() === "VERSE" && item.verse === 1 && (
        <Walkthrough
          steps={steps}
          setStep={setStepIndex}
          currentStep={stepIndex}
        />
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    verseContainer: {},
    verseBody: {
      color: colors.text,
      letterSpacing: 2,
    },
    verseNumber: {
      color: colors.notification,
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
      paddingLeft: 20,
      marginVertical: 4,
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

// export default Verse;
export default React.memo(Verse);

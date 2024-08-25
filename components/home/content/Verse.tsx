import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import Highlighter from "components/Highlighter";
import React, {
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
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import copyToClipboard from "utils/copyToClipboard";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { useBibleContext } from "../../../context/BibleContext";
import { HomeParams, IBookVerse, TIcon, TTheme, TVerse } from "../../../types";
import { customUnderline } from "../../../utils/customStyle";
import extractVersesInfo, {
  extractTextFromParagraph,
  extractWordsWithTags,
  getStrongValue,
  WordTagPair,
} from "../../../utils/extractVersesInfo";
import { getVerseTextRaw } from "../../../utils/getVerseTextRaw";
import { Text } from "../../Themed";
import Walkthrough from "components/Walkthrough";
import { useStorage } from "context/LocalstoreContext";
import RenderTextWithClickableWords from "./RenderTextWithClickableWords";
import useSingleAndDoublePress from "hooks/useSingleOrDoublePress";
import DisplayStrongWord from "components/DisplayStrongWord";

type VerseProps = TVerse & {
  isSplit: boolean;
  onCompare: () => void;
  onWord: () => void;
  initVerse: number;
  estimatedReadingTime?: number;
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

const Verse: React.FC<VerseProps> = ({
  item,
  subtitles,
  isSplit,
  onCompare,
  initVerse,
  onWord,
  estimatedReadingTime,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isVerseTour } = route.params as HomeParams;
  const {
    highlightVerse,
    highlightedVerses,
    isCopyMode,
    toggleCopyMode,
    removeHighlightedVerse,
    fontSize,
    toggleFavoriteVerse,
    clearHighlights,
    setStrongWord,
    verseInStrongDisplay,
    setVerseInStrongDisplay,
    onAddToNote,
    toggleBottomSideSearching,
    isBottomSideSearching,
    isSplitActivated,
    setVerseToCompare,
  } = useBibleContext();
  const theme = useTheme() as TTheme;
  const styles = getStyles(theme);
  const [isVerseHighlisted, setHighlightVerse] = useState<number | null>(null);
  const [isFavorite, setFavorite] = useState(false);
  const highlightedVersesLenth = highlightedVerses.length;
  const isMoreThanOneHighted = highlightedVersesLenth > 1;
  const isStrongSearch = verseInStrongDisplay === item.verse;
  const lastHighted = useMemo(() => {
    return highlightedVerses[highlightedVerses.length - 1];
  }, [highlightedVerses]);
  const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
  const verseRef = useRef<any>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const { saveData } = useStorage();
  const isBottom = isSplit && isBottomSideSearching;
  const isTop = !isSplit && !isBottomSideSearching;
  const [doubleTagged, setDoubleTagged] = useState(false);
  const showMusicIcon =
    item.book_number === 290 && item.chapter === 41 && item.verse === 27;
  const animatedVerseHighlight = useRef(new Animated.Value(0)).current;
  const wordAndStrongValue = extractWordsWithTags(item.text);
  const isFirstVerse = useMemo(() => {
    return item.verse === 1;
  }, [item.verse]);

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
      { iterations: 3 }
    );
    loopAnimation.start();
  };

  useEffect(() => {
    setFavorite(!!item.is_favorite);
  }, [item]);

  useEffect(() => {
    if (!highlightedVersesLenth) {
      setHighlightVerse(null);
    }
  }, [highlightedVersesLenth]);

  const onVerseClicked = () => {
    setVerseInStrongDisplay(isStrongSearch ? 0 : item.verse);
    toggleBottomSideSearching(isSplit);
    setDoubleTagged(false);
    if (!isCopyMode) return;
    if (isVerseHighlisted === item.verse) {
      setHighlightVerse(null);
      setDoubleTagged(false);
      removeHighlightedVerse(item);
      return;
    }
    highlightVerse(item);
    setHighlightVerse(item.verse);
  };

  const onPress = useSingleAndDoublePress({
    onDoublePress: () => {
      onVerseClicked();
      setDoubleTagged(true);
    },
    onSinglePress: onVerseClicked,
    delay: 200,
  });

  const onVerseLongPress = () => {
    if (isVerseHighlisted === item.verse) return;
    toggleCopyMode();
    highlightVerse(item);
    setHighlightVerse(item.verse);
  };

  const LinkVerse = ({ data }: any) => {
    if (!data) return null;
    const { bookNumber, chapter, verse, endVerse } = extractVersesInfo(
      data.subheading
    );
    const bookName = DB_BOOK_NAMES.find(
      (x: any) => x.bookNumber === bookNumber
    )?.longName;

    const onLink = () => {
      navigation.navigate("Home", {
        [!isSplit && isSplitActivated ? "bottomSideBook" : "book"]: bookName,
        [!isSplit && isSplitActivated ? "bottomSideChapter" : "chapter"]:
          chapter,
        [!isSplit && isSplitActivated ? "bottomSideVerse" : "verse"]: verse,
        isHistory: false,
      });
    };

    return data ? (
      <Text
        onPress={onLink}
        style={[
          styles.verse,
          {
            fontSize: 18,
            textAlign: "justify",
            fontWeight: "bold",
            paddingVertical: 10,
            color: theme.colors.notification ?? "black",
            ...customUnderline,
          },
        ]}
      >
        {bookNumber
          ? `${bookName} ${chapter}:${verse}-${endVerse}`
          : data.subheading}
      </Text>
    ) : (
      <Text>--</Text>
    );
  };

  const RenderFindSubTitle = (verse: any) => {
    const [subTitle, link] = subtitles.filter((x: any) => x.verse === verse);
    return subTitle ? (
      <View>
        <Text
          style={[
            styles.verse,
            {
              fontSize: 22,
              textAlign: "center",
              fontWeight: "bold",
              paddingVertical: 10,
              color: theme?.colors?.notification || "white",
            },
          ]}
        >
          {subTitle.subheading || subTitle.title}
        </Text>
        <LinkVerse data={link} />
      </View>
    ) : null;
  };

  const onFavorite = async () => {
    await toggleFavoriteVerse({
      bookNumber: item.book_number,
      chapter: item.chapter,
      verse: item.verse,
      isFav: isFavorite,
    });
    setFavorite((prev) => !prev);
    clearHighlights();
  };

  const onCopy = async () => {
    if (isVerseHighlisted !== item.verse) return;
    await copyToClipboard(isMoreThanOneHighted ? highlightedVerses : item);
    clearHighlights();
  };

  const addVerseToNote = async () => {
    const shouldReturn = true;
    const verseToAdd = (await copyToClipboard(
      isMoreThanOneHighted ? highlightedVerses : item,
      shouldReturn
    )) as string;

    onAddToNote(verseToAdd);
    navigation.navigate("Notes");
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

    setStrongWord(value);
    onWord();
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
    setStrongWord(value);
    onWord();
  };

  const enabledMusic = () => {
    ToastAndroid.show("Himnario habilitado 🎵", ToastAndroid.SHORT);
    saveData({ isSongLyricEnabled: true });
  };

  const onCompareClicked = () => {
    setVerseToCompare(item.verse);
    onCompare();
  };

  const verseActions: TIcon[] = useMemo(() => {
    return [
      {
        name: "content-copy",
        action: onCopy,
        hide: lastHighted?.verse !== item.verse && isMoreThanOneHighted,
        description: "Copiar",
      },
      {
        name: "note-plus",
        action: addVerseToNote,
        hide: lastHighted?.verse !== item.verse && isMoreThanOneHighted,
        description: "Anotar",
      },
      {
        name: isFavorite ? "star" : "star-outline",
        action: onFavorite,
        color: isFavorite ? theme.colors.notification : "",
        hide: false,
        description: "Favorito",
      },
      {
        name: "file-compare",
        action: onCompareClicked,
        hide: false,
        description: "Comparar",
      },
      {
        name: "music",
        action: enabledMusic,
        hide: !showMusicIcon,
      },
    ];
  }, [isMoreThanOneHighted, lastHighted, isVerseHighlisted]);

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
        onStrongWordClicked({ word: "principio", tagValue: "H7225" }),
    },
    {
      text: "Paso 3: 📘 Cuando toques cualquier palabra resaltada, verás su significado en el original.",
      target: null,
    },
  ];

  const displayTour = item.verse === 1 && verseRef.current && isVerseTour;

  const bgVerseHighlight = animatedVerseHighlight.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", `${theme.colors.notification + "20"}`],
  });

  const styledVerseHighlight = {
    backgroundColor: bgVerseHighlight,
  };

  return (
    <View
      onLayout={() => {
        if (initVerse === item.verse) initHighLightedVerseAnimation();
      }}
    >
      <TouchableOpacity
        onPress={() => onPress()}
        onLongPress={() => onVerseLongPress()}
        activeOpacity={0.9}
        style={styles.verseContainer}
        ref={verseRef}
      >
        {isFirstVerse && (
          <View style={styles.estimatedContainer}>
            <Text style={styles.estimatedText}>
              <MaterialCommunityIcons
                size={14}
                name="timer-outline"
                color={theme.colors.notification}
              />
              &nbsp; Tiempo de lectura {`~ ${estimatedReadingTime} min(s)\n`}
            </Text>
          </View>
        )}
        {RenderFindSubTitle(item.verse)}

        <Animated.Text
          style={[
            styles.verse,
            styledVerseHighlight,
            isVerseHighlisted === item.verse && styles.highlightCopy,
            { fontSize },
          ]}
          aria-selected
          selectable={false}
          selectionColor={theme.colors.notification || "white"}
        >
          <Text style={[styles.verseNumber]}>
            {isFavorite && !isVerseHighlisted && (
              <MaterialCommunityIcons
                size={14}
                name={"star"}
                color={theme.dark ? "yellow" : theme.colors.primary}
              />
            )}
            &nbsp;{item.verse}&nbsp;
          </Text>

          {isStrongSearch && (isBottom || isTop) ? (
            <>
              {doubleTagged ? (
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
                  style={[styles.verseBody]}
                  onWordClick={onStrongWordClicked}
                />
              )}
            </>
          ) : (
            <Text style={styles.verseBody}>{getVerseTextRaw(item.text)}</Text>
          )}
        </Animated.Text>
        {isVerseHighlisted === item.verse && !!highlightedVersesLenth && (
          <View style={styles.verseAction}>
            {verseActions.map((action: TIcon, key) => (
              <Pressable
                onPress={action.action}
                key={key}
                style={[
                  {
                    display: "flex",
                    alignItems: "center",
                  },
                  action.hide && { display: "none" },
                ]}
              >
                <MaterialCommunityIcons
                  size={30}
                  name={action.name}
                  style={[styles.icon, action.color && { color: action.color }]}
                />
                <Text style={{ color: theme.colors.text }}>
                  {action?.description}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </TouchableOpacity>
      {displayTour && (
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
      alignItems: "center",
      justifyContent: "flex-end",
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

export default Verse;

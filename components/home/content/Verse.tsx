import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import DisplayStrongWord from "components/DisplayStrongWord";
import Icon from "components/Icon";
import Walkthrough from "components/Walkthrough";
import { useStorage } from "context/LocalstoreContext";
import useSingleAndDoublePress from "hooks/useSingleOrDoublePress";
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
import { HomeParams, TIcon, TTheme, TVerse } from "../../../types";
import { customUnderline } from "../../../utils/customStyle";
import extractVersesInfo, {
  extractTextFromParagraph,
  extractWordsWithTags,
  getStrongValue,
  WordTagPair,
} from "../../../utils/extractVersesInfo";
import { getVerseTextRaw } from "../../../utils/getVerseTextRaw";
import { Text } from "../../Themed";
import RenderTextWithClickableWords from "./RenderTextWithClickableWords";

type VerseProps = TVerse & {
  isSplit: boolean;
  onCompare: () => void;
  onWord: () => void;
  onDictionary: (text: string) => void;
  initVerse: number;
  estimatedReadingTime?: number;
};

type ActionItemProps = {
  index: number;
  action: TIcon;
  styles: any;
  theme: any;
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

const ActionItem = ({ index, action, styles, theme }: ActionItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 300,
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
        { flexDirection: "row", marginVertical: 5 },
      ]}
    >
      <Pressable
        onPress={action.action}
        style={[
          {
            display: "flex",
            alignItems: "center",
          },
          action.hide && { display: "none" },
        ]}
      >
        <Icon
          size={30}
          name={action.name}
          style={[styles.icon, action.color && { color: action.color }]}
        />
        <Text style={{ color: theme.colors.text }}>{action?.description}</Text>
      </Pressable>
    </Animated.View>
  );
};

const Verse: React.FC<VerseProps> = ({
  item,
  subtitles,
  isSplit,
  onCompare,
  initVerse,
  onWord,
  onDictionary,
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
    removeHighlistedVerse,
    fontSize,
    toggleFavoriteVerse,
    clearHighlights,
    setStrongWord,
    verseInStrongDisplay,
    setverseInStrongDisplay,
    onAddToNote,
    toggleBottomSideSearching,
    isBottomSideSearching,
    isSplitActived,
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
    setverseInStrongDisplay(isStrongSearch ? 0 : item.verse);
    toggleBottomSideSearching(isSplit);
    setDoubleTagged(false);
    if (!isCopyMode) return;
    if (isVerseHighlisted === item.verse) {
      setHighlightVerse(null);
      setDoubleTagged(false);
      removeHighlistedVerse(item);
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
    const linkVerses = data.subheading
      ?.split("—")
      .map((linkVerse: any) => extractVersesInfo(linkVerse));

    const renderItem = (verseInfo: any, index: number) => {
      const { bookNumber, chapter, verse } = verseInfo;

      const bookName = DB_BOOK_NAMES.find(
        (x: any) => x.bookNumber === bookNumber
      )?.longName;

      const onLink = () => {
        navigation.navigate("Home", {
          [!isSplit && isSplitActived ? "bottomSideBook" : "book"]: bookName,
          [!isSplit && isSplitActived ? "bottomSideChapter" : "chapter"]:
            chapter,
          [!isSplit && isSplitActived ? "bottomSideVerse" : "verse"]: verse,
          isHistory: false,
        });
      };

      return bookName ? (
        <Text
          key={index}
          onPress={onLink}
          style={[
            styles.verse,
            {
              fontSize: 18,
              fontWeight: "bold",
              paddingVertical: 5,
              color: theme.colors.notification ?? "black",
              ...customUnderline,
            },
          ]}
        >
          {`${bookName} ${chapter}:${verse}`}
        </Text>
      ) : null;
    };

    return data ? linkVerses.map(renderItem) : <Text>--</Text>;
  };

  const RenderFindSubTitle = useCallback((verse: any) => {
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
              paddingVertical: 5,
              color: theme?.colors?.notification || "white",
            },
          ]}
        >
          {subTitle.subheading || subTitle.title}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <LinkVerse data={link} />
        </View>
      </View>
    ) : null;
  }, []);

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
    navigation.navigate("Notes", { shouldRefresh: false });
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

  const onNonHightlistedWordClick = ({ word }: WordTagPair) => {
    if (word.length < 3) {
      return;
    }
    onDictionary(word);
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
        name: "Copy",
        action: onCopy,
        hide: lastHighted?.verse !== item.verse && isMoreThanOneHighted,
        description: "Copiar",
      },
      {
        name: "NotebookPen",
        action: addVerseToNote,
        hide: lastHighted?.verse !== item.verse && isMoreThanOneHighted,
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
        name: "FileDiff",
        action: onCompareClicked,
        hide: false,
        description: "Comparar",
      },
      {
        name: "Music2",
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
        onStrongWordClicked({ word: "principio", tagValue: "7225" }),
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
              <Icon size={14} name="Timer" color={theme.colors.notification} />
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
              <MaterialCommunityIcons size={14} name="star" color="#ffd41d" />
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
        {isVerseHighlisted === item.verse && !!highlightedVersesLenth && (
          <View style={styles.verseAction}>
            {verseActions.map((action: TIcon, index) => (
              <ActionItem key={index} {...{ index, action, styles, theme }} />
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

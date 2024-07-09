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
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import copyToClipboard from "utils/copyToClipboard";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { useBibleContext } from "../../../context/BibleContext";
import { HomeParams, IBookVerse, TIcon, TTheme, TVerse } from "../../../types";
import { customUnderline } from "../../../utils/customStyle";
import extractVersesInfo, {
  getStrongValue,
} from "../../../utils/extractVersesInfo";
import { getVerseTextRaw } from "../../../utils/getVerseTextRaw";
import { Text } from "../../Themed";
import Walkthrough from "components/Walkthrough";

const Verse: React.FC<TVerse & { isSplit: boolean }> = ({
  item,
  subtitles,
  index,
  isSplit,
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
  } = useBibleContext();
  const theme = useTheme() as TTheme;
  const styles = getStyles(theme);
  const [isVerseHighlisted, setHighlightVerse] = useState<number | null>(null);
  const [isFavorite, setFavorite] = useState(false);
  const [lastHighted, setLastHighted] = useState<IBookVerse | any>(null);
  const highlightedVersesLenth = highlightedVerses.length;
  const isMoreThanOneHighted = highlightedVersesLenth > 1;
  const isStrongSearch = verseInStrongDisplay === item.verse;
  const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
  const strongRef = useRef<BottomSheetModal>(null);
  const verseRef = useRef<any>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const isBottom = isSplit && isBottomSideSearching;
  const isTop = !isSplit && !isBottomSideSearching;

  const strongHandlePresentModalPress = useCallback(() => {
    strongRef.current?.present();
  }, []);

  useEffect(() => {
    setFavorite(!!item.is_favorite);
  }, [item]);

  useEffect(() => {
    if (isMoreThanOneHighted && isVerseHighlisted === item.verse) {
      const lastItem = highlightedVerses[highlightedVersesLenth - 1];
      setLastHighted(lastItem);
    }
    if (!highlightedVersesLenth) {
      setHighlightVerse(null);
    }
  }, [highlightedVerses]);

  const onVerseClicked = () => {
    setverseInStrongDisplay(isStrongSearch ? 0 : item.verse);
    toggleBottomSideSearching(isSplit);
    if (!isCopyMode) return;
    if (isVerseHighlisted === item.verse) {
      setHighlightVerse(null);
      removeHighlistedVerse(item);
      return;
    }
    highlightVerse(item);
    setHighlightVerse(item.verse);
  };

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
        [!isSplit && isSplitActived ? "bottomSideBook" : "book"]: bookName,
        [!isSplit && isSplitActived ? "bottomSideChapter" : "chapter"]: chapter,
        [!isSplit && isSplitActived ? "bottomSideVerse" : "verse"]: verse,
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

  const onFavorite = () => {
    toggleFavoriteVerse({
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
    const wordIndex = textValue.indexOf(code);

    const word = textValue[wordIndex];
    const secondCode =
      textValue[wordIndex + 1] === "-" ? strongValue[wordIndex + 1] : "";

    const isDash = word === "-" ? -1 : 0;
    const NT_BOOK_NUMBER = 470;
    const cognate = item.book_number < NT_BOOK_NUMBER ? "H" : "G";
    const searchCode = `${cognate}${strongValue[wordIndex]}`;
    const secondSearchCode = secondCode ? `,${cognate}${secondCode}` : ",";
    const searchWord = textValue[wordIndex + isDash] ?? searchCode;

    const value = {
      text: searchWord,
      code: searchCode.concat(secondSearchCode),
    };

    setStrongWord(value);
    strongHandlePresentModalPress();
  };

  const verseActions: TIcon[] = useMemo(() => {
    return [
      {
        name: "content-copy",
        action: onCopy,
        color: "white",
        hide: lastHighted?.verse !== item.verse && isMoreThanOneHighted,
      },
      {
        name: "note-plus",
        action: addVerseToNote,
        color: "white",
        hide: lastHighted?.verse !== item.verse && isMoreThanOneHighted,
      },
      {
        name: isFavorite ? "star" : "star-outline",
        action: onFavorite,
        color: isFavorite ? "yellow" : "white",
        hide: false,
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
      action: () => onWordClicked("principio"),
    },
    {
      text: "Paso 3: 📘 Cuando toques cualquier palabra resaltada, verás su significado en el original.",
      target: null,
    },
  ];

  const displayTour = item.verse === 1 && verseRef.current && isVerseTour;

  return (
    <>
      <TouchableOpacity
        onPress={() => onVerseClicked()}
        onLongPress={() => onVerseLongPress()}
        activeOpacity={0.9}
        style={styles.verseContainer}
        ref={verseRef}
      >
        {RenderFindSubTitle(item.verse)}

        <Text
          style={[
            styles.verse,
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
              {/* <RenderTextWithClickableWords
              theme={theme}
              text={item.text}
              onWordClick={onWordClicked}
            /> */}
              <Highlighter
                textToHighlight={getVerseTextRaw(item.text)}
                searchWords={textValue}
                highlightStyle={{ color: theme.colors.notification }}
                style={[styles.verseBody]}
                onWordClick={onWordClicked}
              />
            </>
          ) : (
            <Text style={styles.verseBody}>{getVerseTextRaw(item.text)}</Text>
          )}
        </Text>
        {isVerseHighlisted === item.verse && !!highlightedVersesLenth && (
          <View style={styles.verseAction}>
            {verseActions.map((action: TIcon, key) => (
              <Pressable key={key} style={[action.hide && { display: "none" }]}>
                <MaterialCommunityIcons
                  size={24}
                  name={action.name}
                  style={[styles.icon, { color: action.color ?? "black" }]}
                  onPress={action.action}
                />
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
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    verseContainer: {},
    verseBody: {
      color: colors.text,
      letterSpacing: 2,
    },
    verseNumber: {
      color: colors.notification,
    },
    verse: {
      position: "relative",
      paddingLeft: 20,
      marginVertical: 5,
    },
    highlightCopy: {
      textDecorationStyle: "solid",
      textDecorationLine: "underline",
      textDecorationColor: colors.notification,
    },
    verseAction: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: colors.notification,
      borderRadius: 10,
      padding: 5,
      alignSelf: "flex-end",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 26,
    },
  });

export default Verse;

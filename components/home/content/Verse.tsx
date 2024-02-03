import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HomeParams, IBookVerse, TTheme, TVerse } from "../../../types";
import { Text } from "../../Themed";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { useBibleContext } from "../../../context/BibleContext";
import { getVerseTextRaw } from "../../../utils/getVerseTextRaw";
import extractVersesInfo, {
  getStrongValue,
} from "../../../utils/extractVersesInfo";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { customUnderline } from "../../../utils/customStyle";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import copyToClipboard from "utils/copyToClipboard";
import Highlighter from "components/Highlighter";
import BottomModal from "components/BottomModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import StrongContent from "./StrongContent";
import CustomBottomSheet from "components/BottomSheet";
import RenderTextWithClickableWords from "./RenderTextWithClickableWords";

const Verse: React.FC<TVerse> = ({ item, subtitles, index }) => {
  const navigation = useNavigation();
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
    strongWord,
    verseInStrongDisplay,
    setverseInStrongDisplay,
  } = useBibleContext();
  const theme = useTheme() as TTheme;
  const styles = getStyles(theme);
  const [isVerseHighlisted, setHighlightVerse] = useState(false);
  const [isFavorite, setFavorite] = useState(false);
  const [lastHighted, setLastHighted] = useState<IBookVerse | any>(null);
  const highlightedVersesLenth = highlightedVerses.length;
  const isMoreThanOneHighted = highlightedVersesLenth > 1;
  const isStrongSearch = verseInStrongDisplay === item.verse;
  const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
  const strongRef = useRef<BottomSheetModal>(null);

  const strongHandlePresentModalPress = useCallback(() => {
    strongRef.current?.present();
  }, []);

  useEffect(() => {
    setFavorite(!!item.is_favorite);
  }, [item]);

  useEffect(() => {
    if (isMoreThanOneHighted && isVerseHighlisted) {
      const lastItem = highlightedVerses[highlightedVersesLenth - 1];
      setLastHighted(lastItem);
    }
    if (!highlightedVersesLenth) {
      setHighlightVerse(false);
    }
  }, [highlightedVerses]);

  const onVerseClicked = () => {
    // setverseInStrongDisplay(item.verse);
    setverseInStrongDisplay(isStrongSearch ? 0 : item.verse);
    if (!isCopyMode) return;
    if (isVerseHighlisted) {
      setHighlightVerse(false);
      removeHighlistedVerse(item);
      return;
    }
    highlightVerse(item);
    setHighlightVerse(true);
  };

  const onVerseLongPress = () => {
    toggleCopyMode();
    highlightVerse(item);
    setHighlightVerse(true);
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
        book: bookName,
        chapter,
        verse,
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
        {`${bookName} ${chapter}:${verse}-${endVerse}`}
      </Text>
    ) : (
      <Text>--</Text>
    );
  };

  const findSubTitle = (verse: any) => {
    const [subTitle, link] = subtitles.filter((x: any) => x.verse === verse);

    return subTitle ? (
      <View>
        <Text
          // key={subTitle.order_if_several}
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
    await copyToClipboard(highlightedVersesLenth ? highlightedVerses : item);
    if (highlightedVersesLenth) clearHighlights();
  };

  const onWordClicked = (code: string) => {
    const isWord = textValue.includes(code);
    console.log({ isWord, code });

    const wordIndex = isWord
      ? textValue.indexOf(code)
      : strongValue.indexOf(code);
    const word = textValue[wordIndex];
    const isDash = word === "-" ? -1 : 0;
    const NT_BOOK_NUMBER = 470;
    const cognate = item.book_number < NT_BOOK_NUMBER ? "H" : "G";
    const searchCode = `${cognate}${isWord ? strongValue[wordIndex] : code}`;
    const searchWord = textValue[wordIndex + isDash] ?? searchCode;

    const value = {
      text: searchWord,
      code: searchCode,
    };

    console.log(value);
    setStrongWord(value);
    strongHandlePresentModalPress();
  };

  return (
    <TouchableOpacity
      onPress={() => onVerseClicked()}
      onLongPress={() => onVerseLongPress()}
      activeOpacity={0.9}
      style={styles.verseContainer}
    >
      {findSubTitle(item.verse)}

      <Text
        style={[
          styles.verse,
          isVerseHighlisted && styles.highlightCopy,
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

        {isStrongSearch ? (
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
      {isVerseHighlisted && !!highlightedVersesLenth && (
        <View style={styles.verseAction}>
          {!(lastHighted?.verse !== item.verse && isMoreThanOneHighted) && (
            <Pressable>
              <MaterialCommunityIcons
                size={24}
                name={"content-copy"}
                style={[styles.icon, { color: "white" }]}
                onPress={() => onCopy()}
              />
            </Pressable>
          )}
          <Pressable>
            <MaterialCommunityIcons
              size={24}
              name={isFavorite ? "star" : "star-outline"}
              style={[styles.icon, { color: isFavorite ? "yellow" : "white" }]}
              onPress={onFavorite}
            />
          </Pressable>
        </View>
      )}

      {/* <BottomModal startAT={2} ref={strongRef}>
        <StrongContent theme={theme} data={strongWord} fontSize={fontSize} />
      </BottomModal> */}
    </TouchableOpacity>
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
      // paddingHorizontal: 15,
      paddingLeft: 20,
      marginVertical: 5,
    },
    highlightCopy: {
      textDecorationStyle: "solid",
      textDecorationLine: "underline",
      textDecorationColor: colors.notification,
    },
    verseAction: {
      position: "absolute",
      flexDirection: "row",
      bottom: 10,
      right: 5,
      zIndex: 111,
      backgroundColor: colors.notification + "99",
      borderRadius: 15,
      padding: 5,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 26,
    },
  });

export default Verse;

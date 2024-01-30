import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { HomeParams, TTheme, TVerse } from "../../../types";
import { Text } from "../../Themed";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useBibleContext } from "../../../context/BibleContext";
import { getVerseTextRaw } from "../../../utils/getVerseTextRaw";
import extractVersesInfo from "../../../utils/extractVersesInfo";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { customUnderline } from "../../../utils/customStyle";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import copyToClipboard from "utils/copyToClipboard";

const Verse: React.FC<TVerse> = ({ item, subtitles }) => {
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
  } = useBibleContext();
  const theme = useTheme() as TTheme;
  const styles = getStyles(theme);
  const [isVerseHighlisted, setHighlightVerse] = useState(false);
  const [isFavorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(!!item.is_favorite);
  }, [item]);

  useEffect(() => {
    if (!highlightedVerses.length) {
      setHighlightVerse(false);
    }
  }, [highlightedVerses]);

  const highlightVerseFunc = () => {
    if (!isCopyMode) toggleCopyMode();
    if (isVerseHighlisted) {
      setHighlightVerse(false);
      removeHighlistedVerse(item);
      return;
    }
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
          key={subTitle.order_if_several}
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
    await copyToClipboard(item);
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (!isCopyMode) return;
        highlightVerseFunc();
      }}
      onLongPress={highlightVerseFunc}
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
            <MaterialCommunityIcons size={14} name={"star"} color={"yellow"} />
          )}
          &nbsp;{item.verse}&nbsp;
        </Text>
        <Text style={styles.verseBody}>{getVerseTextRaw(item.text)}</Text>
      </Text>
      {isVerseHighlisted && (
        <View style={styles.verseAction}>
          <MaterialCommunityIcons
            size={20}
            name={"content-copy"}
            style={styles.icon}
            onPress={() => onCopy()}
          />
          <MaterialCommunityIcons
            size={20}
            name={isFavorite ? "star" : "star-outline"}
            style={[styles.icon, isFavorite && { color: "yellow" }]}
            onPress={onFavorite}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    verseContainer: {},
    verseBody: {
      color: colors.text,
    },
    verseNumber: {
      color: colors.notification,
    },
    verse: {
      position: "relative",
      paddingHorizontal: 15,
      paddingLeft: 20,
      marginVertical: 5,
      fontSize: 24,
    },
    highlightCopy: {
      textDecorationStyle: "solid",
      textDecorationLine: "underline",
      textDecorationColor: colors.notification,
      // borderColor: colors.notification,
      borderWidth: 1,
    },
    verseAction: {
      position: "absolute",
      flexDirection: "row",
      bottom: 10,
      right: 5,
      zIndex: 11,
      backgroundColor: colors.notification + "99",
      borderRadius: 15,
      padding: 5,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
  });

export default Verse;

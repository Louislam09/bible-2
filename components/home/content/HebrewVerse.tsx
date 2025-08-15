import { useBibleContext } from "@/context/BibleContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TFont, TTheme } from "@/types";
import { mergeTexts, parseText } from "@/utils/interleanerHelper";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
interface VerseItem {
  book_number: number;
  chapter: number;
  verse: number;
  is_favorite: number;
  text: string;
}

interface Props {
  item: VerseItem;
  withBackground?: boolean;
}

interface Segment {
  key: number;
  hebrew: string;
  strong: string;
  translit: string;
  english: string;
  spanish: string;
}

const HebrewVerse: React.FC<Props> = ({ item, withBackground = false }) => {
  const theme = useTheme();
  const { currentBibleVersion, fontSize } = useBibleContext();
  const styles = getStyles(theme, 16);
  const verseWithStrong =
    bibleState$.bibleData.topVerses.get()?.[item.verse - 1];
  const mergeText = mergeTexts(verseWithStrong?.text || "", item.text);
  const segments = useMemo(() => parseText(mergeText), [item.text, mergeText]);

  const onStrongPress = useCallback((segment: Segment) => {
    const NT_BOOK_NUMBER = 470;
    const cognate = item.book_number < NT_BOOK_NUMBER ? "H" : "G";

    const addCognate = (tagValue: string) =>
      tagValue
        .split(",")
        .map((code) => `${cognate}${code}`)
        .join(",");

    const searchCode = addCognate(segment.strong || "");
    const value = {
      text: segment.hebrew,
      code: searchCode,
    };
    bibleState$.handleStrongWord(value);
    modalState$.openStrongSearchBottomSheet();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.wordsGrid,
          withBackground && {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Text style={[styles.reference]}>{item.verse}</Text>
        {segments.map((segment) => (
          <View key={segment.key} style={[styles.wordColumn]}>
            <Text
              style={styles.lexicalId}
              onPress={() => onStrongPress(segment)}
            >
              {segment.strong}
            </Text>
            <Text
              style={styles.transliteration}
              onPress={() => onStrongPress(segment)}
            >
              {segment.translit}
            </Text>
            <Text
              style={styles.hebrewScript}
              onPress={() => onStrongPress(segment)}
            >
              {segment.hebrew}
            </Text>

            {segment.spanish ? (
              <Text
                style={styles.spanishTranslation}
                onPress={() => onStrongPress(segment)}
              >
                {segment.spanish || "-"}
              </Text>
            ) : (
              <Text
                style={styles.englishTranslation}
                onPress={() => onStrongPress(segment)}
              >
                {segment.english || "-"}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme, fontSize: number) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "flex-end",
    },
    reference: {
      fontSize: fontSize + 7,
      color: colors.text,
      // textAlign: "right",
      fontWeight: "bold",
      // zIndex: 1,
      // position: "relative",
      backgroundColor: colors.notification + 70,
      paddingHorizontal: 5,
      paddingVertical: 15,
      borderRadius: 4,
      display: "flex",
      // height: 60,
      // bottom: 0,
      // left: 0,
      // borderBottomRightRadius: 0,
      // borderBottomLeftRadius: 0,
      // borderTopLeftRadius: 0,
    },
    wordsGrid: {
      position: "relative",
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
      backgroundColor: colors.card,
      padding: 5,
      borderRadius: 4,
      elevation: 10,
      paddingVertical: 10,
    },
    wordColumn: {
      position: "relative",
      paddingRight: 7,
      alignItems: "flex-end",
      justifyContent: "flex-end",
      zIndex: 2,
    },
    lexicalId: {
      fontSize: fontSize,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
      textAlign: "center",
    },
    transliteration: {
      fontSize: fontSize,
      fontStyle: "italic",
      color: colors.text,
      fontWeight: "bold",
      marginBottom: 4,
      textAlign: "center",
      textTransform: "lowercase",
    },
    hebrewScript: {
      fontSize: fontSize + 7,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
      textAlign: "right",
      fontFamily: TFont.NotoSansHebrew,
      writingDirection: "rtl",
    },
    englishTranslation: {
      fontSize: fontSize + 2,
      color: colors.notification,
      marginBottom: 4,
      textAlign: "center",
      flexWrap: "wrap",
    },
    spanishTranslation: {
      fontSize: fontSize + 2,
      color: colors.notification,
      marginBottom: 4,
      textAlign: "center",
      flexWrap: "wrap",
    },
  });

export default HebrewVerse;

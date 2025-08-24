import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TFont, TTheme } from "@/types";
import { GreekSegment, parseGreekText } from "@/utils/interleanerHelper";
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

const GreekVerse: React.FC<Props> = ({ item, withBackground = false }) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme, 16);
  const segments = useMemo(() => parseGreekText(item.text), [item.text]);
  const onStrongPress = useCallback((segment: GreekSegment) => {
    const NT_BOOK_NUMBER = 470;
    const cognate = item.book_number < NT_BOOK_NUMBER ? "H" : "G";

    const addCognate = (tagValue: string) =>
      tagValue
        .split(",")
        .map((code) => `${cognate}${code}`)
        .join(",");

    const searchCode = addCognate(segment.strong || "");
    const value = {
      text: segment.greek,
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
            {/* <Text
              style={styles.lexicalId}
              onPress={() => onStrongPress(segment)}
            >
              {segment.strong}
            </Text> */}
            {/* <Text
              style={styles.transliteration}
              onPress={() => onStrongPress(segment)}
            >
              {segment.morph}
            </Text> */}
            <Text
              style={styles.greekScript}
              onPress={() => onStrongPress(segment)}
            >
              {segment.greek}
            </Text>

            <Text
              style={styles.spanishTranslation}
              onPress={() => onStrongPress(segment)}
            >
              {segment.spanish || "-"}
            </Text>
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
      color: colors.notification,
      fontWeight: "bold",
      textDecorationColor: colors.notification,
      textDecorationLine: "underline",
      // backgroundColor: colors.notification + 70,
      // paddingHorizontal: 5,
      // paddingVertical: 15,
      // borderRadius: 4,
      // height: 60,
      // display: "flex",
    },
    wordsGrid: {
      position: "relative",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      padding: 5,
      borderRadius: 4,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.notification,
    },
    wordColumn: {
      position: "relative",
      paddingRight: 7,
      alignItems: "flex-start",
      justifyContent: "flex-start",
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
    greekScript: {
      fontSize: fontSize + 7,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
      fontFamily: TFont.NotoSansHebrew,
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

export default GreekVerse;

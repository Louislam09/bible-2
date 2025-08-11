import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { TFont, TTheme } from "@/types";
import { useBibleContext } from "@/context/BibleContext";
import Translator, { useTranslator } from "react-native-translator";
import { LANGUAGE_CODES, TRANSLATOR_TYPES } from "react-native-translator";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { parseText } from "@/utils/interleanerHelper";
interface VerseItem {
  book_number: number;
  chapter: number;
  verse: number;
  is_favorite: number;
  text: string;
}

interface Props {
  item: VerseItem;
}

interface Segment {
  key: number;
  hebrew: string;
  strong: string;
  translit: string;
  english: string;
  spanish: string;
}

// const parseText = (text: string) => {
//   //   const regex = /<e>(.*?)<\/e>\s*<S>(.*?)<\/S>\s*<n>(.*?)<\/n>\s*([^<]*)\s*<ns>(.*?)<\/ns>/g;
//   const regex =
//     /<e>(.*?)<\/e>\s*<S>(.*?)<\/S>\s*<n>(.*?)<\/n>\s*([^<]*)\s*(?:<ns>(.*?)<\/ns>)?/g;
//   let match;
//   const segments: Segment[] = [];
//   let index = 0;

//   while ((match = regex.exec(text)) !== null) {
//     const [_, hebrew, strong, translit, english, spanish] = match;
//     segments.push({
//       key: index++,
//       hebrew,
//       strong,
//       translit,
//       english: english?.trim() || "",
//       spanish: spanish?.trim() || "",
//     });
//   }

//   return segments;
// };

const HebrewVerse: React.FC<Props> = ({ item }) => {
  const theme = useTheme();
  const { currentBibleVersion, fontSize } = useBibleContext();
  const styles = getStyles(theme, 16);
  const segments = useMemo(() => parseText(item.text), [item.text]);
  const [translations, setTranslations] = useState<{ [key: string]: string }>(
    {}
  );
  const { translate } = useTranslator();

  const getTranslations = useCallback(async (segment: Segment) => {
    const translation = await translate("en", "es", segment.english);
    setTranslations((prev) => ({
      ...prev,
      [segment.english.trim()]: translation,
    }));
  }, []);

  const handlePress = useCallback((segment: Segment) => {
    console.log("pressed", { segment });
  }, []);

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

  const onEnglishPress = useCallback((segment: Segment) => {
    console.log("onEnglishPress", { segment });
    getTranslations(segment);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.reference]}>{item.verse}</Text>
      {/* <View style={styles.wordsGrid}>{renderParsedText()}</View> */}
      <View style={styles.wordsGrid}>
        {segments.map((segment) => (
          <View key={segment.key} style={styles.wordColumn}>
            <Text
              style={styles.lexicalId}
              onPress={() => onStrongPress(segment)}
            >
              {segment.strong}
            </Text>
            <Text
              style={styles.transliteration}
              onPress={() => handlePress(segment)}
            >
              {segment.translit}
            </Text>
            <Text
              style={styles.hebrewScript}
              onPress={() => handlePress(segment)}
            >
              {segment.hebrew}
            </Text>

            {segment.spanish ? (
              <Text
                style={styles.spanishTranslation}
                onPress={() => onEnglishPress(segment)}
              >
                {segment.spanish || "-"}
              </Text>
            ) : (
              <Text
                style={styles.englishTranslation}
                onPress={() => onEnglishPress(segment)}
              >
                {translations[segment.english] || segment.english || "-"}
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
      color: colors.notification,
      textAlign: "right",
      marginVertical: 10,
      fontWeight: "bold",
      backgroundColor: colors.notification + 30,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 4,
    },
    wordsGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8,
    },
    wordColumn: {
      paddingRight: 7,
      alignItems: "flex-end",
      justifyContent: "flex-end",
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

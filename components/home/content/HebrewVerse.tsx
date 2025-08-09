import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { TFont, TTheme } from "@/types";
import { useBibleContext } from "@/context/BibleContext";

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

const HebrewVerse: React.FC<Props> = ({ item }) => {
  const theme = useTheme();
  const { currentBibleVersion, fontSize } = useBibleContext();
  const styles = getStyles(theme, 16);

  const renderParsedText = () => {
    const regex = /<e>(.*?)<\/e>\s*<S>(.*?)<\/S>\s*<n>(.*?)<\/n>\s*([^<]*)/g;
    const segments = [];
    let match;
    let index = 0;

    while ((match = regex.exec(item.text)) !== null) {
      const [_, hebrew, strong, translit, english] = match;

      segments.push(
        <TouchableOpacity
          key={index++}
          style={styles.wordColumn}
          onPress={() => {
            console.log("pressed", { hebrew, strong, translit, english });
          }}
        >
          {/* Lexical Identifier (Strong's Number) */}
          <Text style={styles.lexicalId}>{strong}</Text>

          {/* Transliteration */}
          <Text style={styles.transliteration}>{translit}</Text>

          {/* Hebrew Script */}
          <Text style={styles.hebrewScript}>{hebrew}</Text>

          {/* English Translation */}
          <Text style={styles.englishTranslation}>{english.trim() || "-"}</Text>
        </TouchableOpacity>
      );
    }

    return segments;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.reference]}>{item.verse}</Text>
      <View style={styles.wordsGrid}>{renderParsedText()}</View>
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
      fontSize: fontSize,
      color: colors.notification,
      textAlign: "left",
      marginTop: 8,
      fontWeight: "bold",
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
  });

export default HebrewVerse;

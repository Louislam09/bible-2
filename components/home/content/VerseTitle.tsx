import { Text, View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { bibleState$ } from "@/state/bibleState";
import extractVersesInfo from "@/utils/extractVersesInfo";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type VerseTitleProps = {
  subheading: string[];
  links?: string;
  isSplit: any;
};

const VerseTitle = ({ subheading, isSplit, links }: VerseTitleProps) => {
  const isSplitActived = bibleState$.isSplitActived.get();
  const { theme } = useTheme();
  const [subTitle, link] = JSON.parse(subheading as any);
  const linkVerses = link
    ? link.split("—").map((linkVerse: any) => extractVersesInfo(linkVerse))
    : [];
  const verseLinks = links
    ? links.split(";").map((linkVerse: any) => extractVersesInfo(linkVerse))
    : [];
  const myLinks = links ? verseLinks : linkVerses;

  const renderItem = (verseInfo: any, index: number) => {
    const { bookNumber, chapter, verse, endVerse } = verseInfo;

    const bookName = DB_BOOK_NAMES.find(
      (x: any) => x.bookNumber === bookNumber
    )?.longName;

    const onLink = () => {
      const isBottom = !isSplit && isSplitActived;
      const queryInfo = {
        [isBottom ? "bottomSideBook" : "book"]: bookName,
        [isBottom ? "bottomSideChapter" : "chapter"]: chapter,
        [isBottom ? "bottomSideVerse" : "verse"]: verse,
      };
      bibleState$.changeBibleQuery({
        ...queryInfo,
        shouldFetch: true,
        isBibleBottom: isBottom,
        isHistory: false,
      });
    };

    return bookName ? (
      <Pressable
        key={index}
        onPress={onLink}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: pressed
              ? theme.colors.border
              : theme.dark
              ? theme.colors.text + 40
              : theme.colors.notification + 40,
            borderColor: theme.colors.text + 80,
          },
        ]}
      >
        <Text style={[styles.chipText, { color: theme.colors.text }]}>
          {`${bookName} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ""}`}
        </Text>
      </Pressable>
    ) : null;
  };

  return (
    <View>
      {subTitle && (
        <Text style={[styles.verse, { color: theme.colors.notification }]}>
          {subTitle}
        </Text>
      )}
      <View style={styles.chipContainer}>{myLinks.map(renderItem)}</View>
    </View>
  );
};

export default React.memo(VerseTitle);

const styles = StyleSheet.create({
  verse: {
    position: "relative",
    paddingLeft: 20,
    marginVertical: 4,
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
    paddingVertical: 5,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  chip: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginVertical: 4,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

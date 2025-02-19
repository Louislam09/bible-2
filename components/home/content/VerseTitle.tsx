import { Text, View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import extractVersesInfo from "@/utils/extractVersesInfo";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";

type VerseTitleProps = {
  subheading: string[];
  updateBibleQuery: any;
  isSplitActived: any;
  isSplit: any;
};

const VerseTitle = ({
  subheading,
  updateBibleQuery,
  isSplit,
  isSplitActived,
}: VerseTitleProps) => {
  const theme = useTheme();
  const [subTitle, link] = JSON.parse(subheading as any);
  if (!subTitle) return null;
  const linkVerses = link
    ? link.split("—").map((linkVerse: any) => extractVersesInfo(linkVerse))
    : [];

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
      updateBibleQuery({
        ...queryInfo,
        shouldFetch: true,
        isBibleBottom: isBottom,
      });
      //   navigation.navigate(Screens.Home, { ...queryInfo, isHistory: false });
    };

    return bookName ? (
      <Text
        key={index}
        onPress={onLink}
        style={[
          styles.verse,
          styles.link,
          { color: theme.colors.notification },
        ]}
      >
        {`${bookName} ${chapter}:${verse}${endVerse && `-${endVerse}`}`}
      </Text>
    ) : null;
  };

  return (
    <View>
      <Text style={[styles.verse, { color: theme.colors.notification }]}>
        {subTitle}
      </Text>
      <View style={{ flexDirection: "row" }}>{linkVerses.map(renderItem)}</View>
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
  link: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 5,
    textDecorationColor: "white",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
});

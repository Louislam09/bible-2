import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useRef } from "react";
import Verse from "./Verse";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TChapter, HomeParams, TTheme } from "types";
import { useBibleContext } from "context/BibleContext";

const Chapter = ({ item, dimensions }: TChapter) => {
  const { verses, subtitles } = item;
  if (!verses) return <ActivityIndicator />;
  const theme = useTheme();
  const route = useRoute();
  const { verse, bottomSideVerse } = route.params as HomeParams;
  const styles = getStyles(theme);
  const chapterRef = useRef<FlashList<any>>(null);
  const { isBottomSideSearching } = useBibleContext();
  const selectedSideBook = isBottomSideSearching ? bottomSideVerse : verse;

  const verseNumber = +(selectedSideBook as number) || 0;
  const initialScrollIndex =
    verses.length === verseNumber || verseNumber === 1
      ? verseNumber - 1
      : verseNumber;

  const renderItem = (props: any) => (
    <Verse {...props} verse={selectedSideBook} subtitles={subtitles ?? []} />
  );

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent, { width: dimensions?.width ?? 400 }]}>
        <FlashList
          ref={chapterRef}
          decelerationRate="normal"
          estimatedItemSize={135}
          data={verses ?? []}
          renderItem={renderItem}
          initialScrollIndex={initialScrollIndex}
          keyExtractor={(item: any) => `verse-${item.verse}:`}
        />
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    chapterContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    verseContent: {
      width: 400,
      height: "100%",
    },
  });

export default Chapter;

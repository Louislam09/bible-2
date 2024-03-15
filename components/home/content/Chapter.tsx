import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useRef } from "react";
import Verse from "./Verse";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TChapter, HomeParams, TTheme } from "types";

const Chapter = ({ item, dimensions }: TChapter) => {
  const { verses, subtitles } = item;
  if (!verses) return <ActivityIndicator />;
  const theme = useTheme();
  const route = useRoute();
  const { verse } = route.params as HomeParams;
  const styles = getStyles(theme);
  const chapterRef = useRef<FlashList<any>>(null);
  const verseNumber = +(verse as number) || 0;
  const initialScrollIndex =
    verses.length === verseNumber ? verseNumber - 1 : verseNumber;

  const renderItem = (props: any) => (
    <Verse {...props} verse={verse} subtitles={subtitles ?? []} />
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
    chapterHeader: {
      paddingVertical: 15,
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    chapterHeaderTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
    },
    verseContent: {
      width: 400,
      height: "100%",
      paddingRight: 10,
      paddingBottom: 10,
    },
  });

export default Chapter;

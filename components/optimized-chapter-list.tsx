import { Text, View } from "@/components/Themed";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { TTheme } from "@/types";
import { LegendList } from "@legendapp/list";
import { use$ } from "@legendapp/state/react";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "./Icon";

interface ChapterItemProps {
  item: number;
  onPress: (item: number) => void;
  textColor: string;
  borderColor: string;
}

const ChapterItem = React.memo(
  ({ item, onPress, textColor, borderColor }: ChapterItemProps) => {
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          {
            backgroundColor: theme.colors.text + "20",
            borderColor: theme.colors.text + 50,
          },
        ]}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.listTitle, { color: textColor }]}>{item}</Text>
      </TouchableOpacity>
    );
  }
);

interface OptimizedChapterListProps {
  bookName: string;
  selectedChapeter?: number;
  chapters: number[];
  onChapterSelect: (chapter: number) => void;
  bookImageUri: string;
}

const OptimizedChapterList = ({
  bookName,
  selectedChapeter,
  chapters,
  onChapterSelect,
  bookImageUri,
}: OptimizedChapterListProps) => {
  const { theme } = useMyTheme();
  const { colors } = theme;
  const styles = getStyles(theme);
  const isFlashlist = use$(() => bibleState$.isFlashlist.get());

  const ListHeader = useCallback(
    () => (
      <View style={styles.tab}>
        <Icon
          name="Hash"
          size={16}
          color={theme.colors.text}
          style={styles.tabIcon}
        />
        <Text style={[styles.tabText]}>
          {bookName} {selectedChapeter}
        </Text>
        <View
          style={[styles.activeIndicator, { width: bookName.length * 10 + 8 }]}
        />
      </View>
    ),
    [bookName, bookImageUri, colors.notification]
  );

  const renderItem = useCallback(
    ({ item }: any) => (
      <ChapterItem
        item={item}
        onPress={onChapterSelect}
        textColor={colors.text}
        borderColor={colors.text}
      />
    ),
    [colors.text, onChapterSelect, theme]
  );

  const keyExtractor = useCallback((item: number) => item.toString(), []);

  return isFlashlist ? (
    <FlashList
      data={chapters}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={5}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.flatContainer}
      removeClippedSubviews={true}
      getItemType={() => "chapter"}
      overrideItemLayout={(layout, item) => {
        layout.span = 1; // Only span is supported
      }}
    />
  ) : (
    <LegendList
      data={chapters}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={5}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.flatContainer}
      getItemType={() => "chapter"}
    />
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    listWrapper: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      backgroundColor: "transparent",
    },
    bookImage: {
      resizeMode: "contain",
      position: "relative",
      width: 100,
      height: 100,
    },
    flatContainer: {
      backgroundColor: "transparent",
      paddingVertical: 30,
    },
    listItem: {
      display: "flex",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: colors.text + 40,
      paddingVertical: 8,
      flex: 1,
      alignItems: "center",
      margin: 2,
      marginVertical: 4,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    listChapterTitle: {
      paddingHorizontal: 20,
      paddingBottom: 0,
      fontSize: 26,
      paddingVertical: 5,
    },

    // tabs
    tab: {
      // flex: 1,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
      flexDirection: "row",
      position: "relative",
      marginVertical: 10,
      backgroundColor: colors.text + "20",
      alignSelf: "center",
      borderColor: colors.text + 40,
      borderWidth: 2,
    },
    tabText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "bold",
    },
    tabIcon: {
      marginRight: 8,
    },
    activeIndicator: {
      position: "absolute",
      bottom: 0,
      height: 3,
      width: 70,
      backgroundColor: colors.notification,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    },
  });

export default React.memo(OptimizedChapterList);
